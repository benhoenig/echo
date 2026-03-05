/**
 * Reminder Engine — Playbook-first calculation logic for reminders & suggested actions.
 *
 * Reminders ONLY trigger when an explicit Playbook exists for the entity's current state.
 * No default intervals, no tier-based fallbacks.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type Urgency = "ok" | "approaching" | "due" | "overdue";

export interface ReminderStatus {
    isOverdue: boolean;
    daysSinceLastAction: number;
    intervalDays: number | null; // null = no playbook, no reminder
    daysUntilDue: number | null; // null = no reminder scheduled
    urgency: Urgency;
}

export interface PlaybookRow {
    id: string;
    module: string; // "DEALS" | "LISTINGS"
    pipelineStageId: string | null;
    listingStatus: string | null;
    potentialTier: string | null;
    propertyType: string | null;
    listingType: string | null;
    dealType: string | null;
    actionType: string;
    actionLabel: string;
    actionDescription: string | null;
    actionTemplate: string | null;
    reminderOverride: boolean;
    overrideIntervalDays: number | null;
    isRecurring: boolean;
    isRequired: boolean;
    isActive: boolean;
    order: number;
}

/** Properties of an entity used for matching against playbook trigger filters. */
export interface EntityMatchProps {
    module: "DEALS" | "LISTINGS";
    pipelineStageId?: string | null;
    listingStatus?: string | null;
    potentialTier?: string | null;
    propertyType?: string | null;
    listingType?: string | null;
    dealType?: string | null;
}

// ─── Core Functions ──────────────────────────────────────────────────────────

/**
 * Find all active playbooks whose trigger filters match a given entity.
 *
 * A playbook matches if ALL its non-null filter fields match the entity.
 * Null filter fields act as wildcards (match everything).
 */
export function findMatchingPlaybooks(
    playbooks: PlaybookRow[],
    entity: EntityMatchProps
): PlaybookRow[] {
    return playbooks.filter((p: PlaybookRow) => {
        if (!p.isActive) return false;
        if (p.module !== entity.module) return false;

        // Each non-null filter on the playbook must match the entity
        if (p.pipelineStageId != null && p.pipelineStageId !== entity.pipelineStageId) return false;
        if (p.listingStatus != null && p.listingStatus !== entity.listingStatus) return false;
        if (p.potentialTier != null && p.potentialTier !== entity.potentialTier) return false;
        if (p.propertyType != null && p.propertyType !== entity.propertyType) return false;
        if (p.listingType != null && p.listingType !== entity.listingType) return false;
        if (p.dealType != null && p.dealType !== entity.dealType) return false;

        return true;
    });
}

/**
 * Determine if a non-recurring playbook should still trigger.
 *
 * Non-recurring reminders fire only once per stage/status entry.
 * If the entity was actioned AFTER entering the current stage, the reminder is suppressed.
 *
 * @param lastActionDate - When the entity was last actioned
 * @param stageEnteredAt - When the entity entered its current stage/status
 *   (For Deals: latest PipelineStageHistory entry timestamp for the current stage)
 *   (For Listings: listing_status_changed_at or listing createdAt)
 * @returns true if the playbook should trigger, false if already actioned
 */
export function shouldNonRecurringTrigger(
    lastActionDate: Date | string | null,
    stageEnteredAt: Date | string | null
): boolean {
    // If never actioned, always trigger
    if (!lastActionDate) return true;
    // If no stage entry date available, trigger to be safe
    if (!stageEnteredAt) return true;

    const actionTime = new Date(lastActionDate).getTime();
    const entryTime = new Date(stageEnteredAt).getTime();

    // Trigger only if not actioned since entering this stage
    return actionTime < entryTime;
}

/**
 * Get the effective reminder interval from matching playbooks.
 *
 * Returns the minimum overrideIntervalDays across all applicable playbooks,
 * or null if no playbooks define a timed reminder.
 *
 * @param matchingPlaybooks - Playbooks already filtered by findMatchingPlaybooks
 * @param lastActionDate - Entity's last action date (for non-recurring check)
 * @param stageEnteredAt - When entity entered current stage/status (for non-recurring check)
 */
export function getEffectiveInterval(
    matchingPlaybooks: PlaybookRow[],
    lastActionDate?: Date | string | null,
    stageEnteredAt?: Date | string | null
): number | null {
    const applicablePlaybooks = matchingPlaybooks.filter((p: PlaybookRow) => {
        // Must have an interval defined
        if (p.overrideIntervalDays == null) return false;

        // For non-recurring, check if already actioned in this stage
        if (!p.isRecurring) {
            if (!shouldNonRecurringTrigger(lastActionDate ?? null, stageEnteredAt ?? null)) {
                return false;
            }
        }

        return true;
    });

    if (applicablePlaybooks.length === 0) return null;

    // Use the minimum interval (most urgent reminder)
    return Math.min(...applicablePlaybooks.map((p: PlaybookRow) => p.overrideIntervalDays!));
}

/**
 * Calculate reminder status for an entity.
 *
 * @param lastActionDate - When the entity was last actioned (null = never actioned)
 * @param createdAt - Entity creation date (fallback baseline)
 * @param intervalDays - How many days between expected actions (null = no reminder)
 */
export function calculateReminderStatus(
    lastActionDate: Date | string | null,
    createdAt: Date | string,
    intervalDays: number | null
): ReminderStatus {
    const now = new Date();
    const baseline = lastActionDate
        ? new Date(lastActionDate)
        : new Date(createdAt);

    const diffMs = now.getTime() - baseline.getTime();
    const daysSinceLastAction = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // No playbook interval = no reminder scheduled
    if (intervalDays == null) {
        return {
            isOverdue: false,
            daysSinceLastAction,
            intervalDays: null,
            daysUntilDue: null,
            urgency: "ok",
        };
    }

    const daysUntilDue = intervalDays - daysSinceLastAction;

    let urgency: Urgency;
    if (daysUntilDue < 0) {
        urgency = "overdue";
    } else if (daysUntilDue === 0) {
        urgency = "due";
    } else if (daysUntilDue <= 1) {
        urgency = "approaching";
    } else {
        urgency = "ok";
    }

    return {
        isOverdue: daysUntilDue < 0,
        daysSinceLastAction,
        intervalDays,
        daysUntilDue,
        urgency,
    };
}

/**
 * Urgency color classes for UI rendering.
 */
export function getUrgencyStyles(urgency: Urgency): {
    badge: string;
    text: string;
    icon: string;
} {
    switch (urgency) {
        case "overdue":
            return {
                badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                text: "text-red-600 dark:text-red-400",
                icon: "text-red-500",
            };
        case "due":
            return {
                badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                text: "text-amber-600 dark:text-amber-400",
                icon: "text-amber-500",
            };
        case "approaching":
            return {
                badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                text: "text-amber-600 dark:text-amber-400",
                icon: "text-amber-500",
            };
        case "ok":
            return {
                badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                text: "text-emerald-600 dark:text-emerald-400",
                icon: "text-emerald-500",
            };
    }
}

/**
 * Format the urgency label for display.
 */
export function getUrgencyLabel(status: ReminderStatus): string {
    const { urgency, daysUntilDue } = status;

    // No reminder scheduled
    if (daysUntilDue == null) {
        return "No reminder";
    }

    switch (urgency) {
        case "overdue":
            return `${Math.abs(daysUntilDue)}d overdue`;
        case "due":
            return "Due today";
        case "approaching":
            return "Due tomorrow";
        case "ok":
            return `${daysUntilDue}d until due`;
    }
}

/**
 * Map PlaybookActionType to a Lucide icon name for UI rendering.
 */
export function getActionTypeIcon(actionType: string): string {
    switch (actionType) {
        case "CALL":
            return "Phone";
        case "LINE_MESSAGE":
            return "MessageSquare";
        case "EMAIL":
            return "Mail";
        case "SITE_VISIT":
            return "MapPin";
        case "SEND_REPORT":
            return "FileText";
        case "SEND_LISTING":
            return "Home";
        case "SCHEDULE_VIEWING":
            return "Eye";
        case "SEND_CONTRACT":
            return "FileCheck";
        case "INTERNAL_NOTE":
            return "StickyNote";
        case "CUSTOM":
        default:
            return "Zap";
    }
}

/**
 * Human-readable label for a PlaybookActionType.
 */
export function getActionTypeLabel(actionType: string): string {
    switch (actionType) {
        case "CALL":
            return "Call";
        case "LINE_MESSAGE":
            return "LINE Message";
        case "EMAIL":
            return "Email";
        case "SITE_VISIT":
            return "Site Visit";
        case "SEND_REPORT":
            return "Send Report";
        case "SEND_LISTING":
            return "Send Listing";
        case "SCHEDULE_VIEWING":
            return "Schedule Viewing";
        case "SEND_CONTRACT":
            return "Send Contract";
        case "INTERNAL_NOTE":
            return "Internal Note";
        case "CUSTOM":
        default:
            return "Custom Action";
    }
}
