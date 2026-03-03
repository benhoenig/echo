/**
 * Reminder Engine — pure calculation logic for the reminders & suggested actions system.
 * Used by the cron route, detail pages, and data tables.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type Urgency = "ok" | "approaching" | "due" | "overdue";

export interface ReminderStatus {
    isOverdue: boolean;
    daysSinceLastAction: number;
    intervalDays: number;
    daysUntilDue: number; // negative = overdue
    urgency: Urgency;
}

export interface PotentialConfigRow {
    id: string;
    module: string;
    potentialLabel: string;
    reminderInterval: number | null;
    isActive: boolean;
}

export interface PlaybookRow {
    id: string;
    pipelineStageId: string;
    actionType: string;
    actionLabel: string;
    actionDescription: string | null;
    actionTemplate: string | null;
    reminderOverride: boolean;
    overrideIntervalDays: number | null;
    isRequired: boolean;
    isActive: boolean;
    order: number;
}

// ─── Default interval if no config exists ────────────────────────────────────

const DEFAULT_INTERVAL_DAYS = 14;

// ─── Core Functions ──────────────────────────────────────────────────────────

/**
 * Calculate reminder status for an entity.
 *
 * @param lastActionDate - When the entity was last actioned (null = never actioned)
 * @param createdAt - Entity creation date (fallback baseline)
 * @param intervalDays - How many days between expected actions
 */
export function calculateReminderStatus(
    lastActionDate: Date | string | null,
    createdAt: Date | string,
    intervalDays: number
): ReminderStatus {
    const now = new Date();
    const baseline = lastActionDate
        ? new Date(lastActionDate)
        : new Date(createdAt);

    const diffMs = now.getTime() - baseline.getTime();
    const daysSinceLastAction = Math.floor(diffMs / (1000 * 60 * 60 * 24));
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
 * Get the effective reminder interval for a deal or listing.
 *
 * Priority:
 * 1. If a playbook entry for the current stage has `reminderOverride = true`, use its `overrideIntervalDays`
 * 2. Otherwise, use the PotentialConfig interval for the entity's tier/grade
 * 3. Fallback to DEFAULT_INTERVAL_DAYS if no config found
 */
export function getEffectiveInterval(
    potentialConfigs: PotentialConfigRow[],
    tierLabel: string | null,
    stagePlaybooks?: PlaybookRow[],
    currentStageId?: string | null
): number {
    // Check for stage-level override first
    if (stagePlaybooks && currentStageId) {
        const overridePlaybook = stagePlaybooks.find(
            (p) =>
                p.pipelineStageId === currentStageId &&
                p.reminderOverride &&
                p.overrideIntervalDays != null &&
                p.isActive
        );
        if (overridePlaybook) {
            return overridePlaybook.overrideIntervalDays!;
        }
    }

    // Fall back to tier config
    if (tierLabel) {
        const config = potentialConfigs.find(
            (c) => c.potentialLabel === tierLabel && c.isActive
        );
        if (config?.reminderInterval != null) {
            return config.reminderInterval;
        }
    }

    return DEFAULT_INTERVAL_DAYS;
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
    const { urgency, daysUntilDue, daysSinceLastAction } = status;
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
