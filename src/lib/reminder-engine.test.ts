import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    calculateReminderStatus,
    findMatchingPlaybooks,
    getEffectiveInterval,
    shouldNonRecurringTrigger,
    getUrgencyStyles,
    getUrgencyLabel,
    getActionTypeIcon,
    getActionTypeLabel,
    type PlaybookRow,
    type EntityMatchProps,
} from "./reminder-engine";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

function daysFromNow(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d;
}

const makePlaybook = (overrides: Partial<PlaybookRow> = {}): PlaybookRow => ({
    id: "playbook-1",
    module: "DEALS",
    pipelineStageId: "stage-1",
    listingStatus: null,
    potentialTier: null,
    propertyType: null,
    listingType: null,
    dealType: null,
    actionType: "CALL",
    actionLabel: "Call Client",
    actionDescription: null,
    actionTemplate: null,
    reminderOverride: true,
    overrideIntervalDays: 3,
    isRecurring: true,
    isRequired: false,
    isActive: true,
    order: 1,
    ...overrides,
});

// ─── findMatchingPlaybooks ──────────────────────────────────────────────────

describe("findMatchingPlaybooks", () => {
    it("matches playbooks by module", () => {
        const playbooks = [
            makePlaybook({ module: "DEALS", pipelineStageId: null }),
            makePlaybook({ id: "p2", module: "LISTINGS", pipelineStageId: null }),
        ];
        const entity: EntityMatchProps = { module: "DEALS" };
        expect(findMatchingPlaybooks(playbooks, entity)).toHaveLength(1);
        expect(findMatchingPlaybooks(playbooks, entity)[0]?.id).toBe("playbook-1");
    });

    it("excludes inactive playbooks", () => {
        const playbooks = [makePlaybook({ isActive: false })];
        const entity: EntityMatchProps = { module: "DEALS" };
        expect(findMatchingPlaybooks(playbooks, entity)).toHaveLength(0);
    });

    it("matches with null filter fields as wildcards", () => {
        const playbooks = [makePlaybook({ pipelineStageId: null, potentialTier: null })];
        const entity: EntityMatchProps = {
            module: "DEALS",
            pipelineStageId: "any-stage",
            potentialTier: "A",
        };
        expect(findMatchingPlaybooks(playbooks, entity)).toHaveLength(1);
    });

    it("requires all non-null filter fields to match", () => {
        const playbooks = [
            makePlaybook({ pipelineStageId: "stage-1", potentialTier: "A" }),
        ];

        // Matches: both filters match
        expect(
            findMatchingPlaybooks(playbooks, {
                module: "DEALS",
                pipelineStageId: "stage-1",
                potentialTier: "A",
            })
        ).toHaveLength(1);

        // Doesn't match: potentialTier mismatch
        expect(
            findMatchingPlaybooks(playbooks, {
                module: "DEALS",
                pipelineStageId: "stage-1",
                potentialTier: "B",
            })
        ).toHaveLength(0);

        // Doesn't match: pipelineStageId mismatch
        expect(
            findMatchingPlaybooks(playbooks, {
                module: "DEALS",
                pipelineStageId: "stage-99",
                potentialTier: "A",
            })
        ).toHaveLength(0);
    });

    it("matches listing playbooks with multi-variable filters", () => {
        const playbooks = [
            makePlaybook({
                id: "listing-pb",
                module: "LISTINGS",
                pipelineStageId: null,
                listingStatus: "ACTIVE",
                propertyType: "CONDO",
                listingType: "RENT",
                potentialTier: "A",
            }),
        ];

        // All filters match
        expect(
            findMatchingPlaybooks(playbooks, {
                module: "LISTINGS",
                listingStatus: "ACTIVE",
                propertyType: "CONDO",
                listingType: "RENT",
                potentialTier: "A",
            })
        ).toHaveLength(1);

        // One filter mismatch
        expect(
            findMatchingPlaybooks(playbooks, {
                module: "LISTINGS",
                listingStatus: "ACTIVE",
                propertyType: "HOUSE", // mismatch
                listingType: "RENT",
                potentialTier: "A",
            })
        ).toHaveLength(0);
    });

    it("matches deal playbooks with dealType filter", () => {
        const playbooks = [
            makePlaybook({ pipelineStageId: null, dealType: "BUY_SIDE" }),
        ];

        expect(
            findMatchingPlaybooks(playbooks, { module: "DEALS", dealType: "BUY_SIDE" })
        ).toHaveLength(1);

        expect(
            findMatchingPlaybooks(playbooks, { module: "DEALS", dealType: "SELL_SIDE" })
        ).toHaveLength(0);
    });
});

// ─── shouldNonRecurringTrigger ──────────────────────────────────────────────

describe("shouldNonRecurringTrigger", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-03-04T12:00:00Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns true when never actioned", () => {
        expect(shouldNonRecurringTrigger(null, daysAgo(5))).toBe(true);
    });

    it("returns true when no stage entry date", () => {
        expect(shouldNonRecurringTrigger(daysAgo(3), null)).toBe(true);
    });

    it("returns true when actioned before entering stage", () => {
        // Actioned 10 days ago, entered stage 5 days ago → should trigger
        expect(shouldNonRecurringTrigger(daysAgo(10), daysAgo(5))).toBe(true);
    });

    it("returns false when actioned after entering stage", () => {
        // Entered stage 10 days ago, actioned 5 days ago → already actioned
        expect(shouldNonRecurringTrigger(daysAgo(5), daysAgo(10))).toBe(false);
    });

    it("returns false when actioned at the same time as stage entry", () => {
        const sameTime = daysAgo(5);
        expect(shouldNonRecurringTrigger(sameTime, sameTime)).toBe(false);
    });
});

// ─── getEffectiveInterval ─────────────────────────────────────────────────────

describe("getEffectiveInterval", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-03-04T12:00:00Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns null when no playbooks provided", () => {
        expect(getEffectiveInterval([])).toBeNull();
    });

    it("returns null when no playbook has overrideIntervalDays", () => {
        const playbooks = [makePlaybook({ overrideIntervalDays: null })];
        expect(getEffectiveInterval(playbooks)).toBeNull();
    });

    it("returns the interval from a recurring playbook", () => {
        const playbooks = [makePlaybook({ overrideIntervalDays: 5, isRecurring: true })];
        expect(getEffectiveInterval(playbooks)).toBe(5);
    });

    it("returns minimum interval across multiple playbooks", () => {
        const playbooks = [
            makePlaybook({ id: "p1", overrideIntervalDays: 7, isRecurring: true }),
            makePlaybook({ id: "p2", overrideIntervalDays: 3, isRecurring: true }),
            makePlaybook({ id: "p3", overrideIntervalDays: 10, isRecurring: true }),
        ];
        expect(getEffectiveInterval(playbooks)).toBe(3);
    });

    it("excludes non-recurring playbooks that have been actioned in current stage", () => {
        const playbooks = [
            makePlaybook({ overrideIntervalDays: 3, isRecurring: false }),
        ];
        // Actioned 2 days ago, entered stage 5 days ago → already actioned this stage
        expect(getEffectiveInterval(playbooks, daysAgo(2), daysAgo(5))).toBeNull();
    });

    it("includes non-recurring playbooks that have NOT been actioned in current stage", () => {
        const playbooks = [
            makePlaybook({ overrideIntervalDays: 3, isRecurring: false }),
        ];
        // Actioned 10 days ago, entered stage 5 days ago → not actioned since entering stage
        expect(getEffectiveInterval(playbooks, daysAgo(10), daysAgo(5))).toBe(3);
    });

    it("includes non-recurring playbooks when never actioned", () => {
        const playbooks = [
            makePlaybook({ overrideIntervalDays: 3, isRecurring: false }),
        ];
        expect(getEffectiveInterval(playbooks, null, daysAgo(5))).toBe(3);
    });

    it("mixes recurring and non-recurring, takes minimum of applicable", () => {
        const playbooks = [
            makePlaybook({ id: "p1", overrideIntervalDays: 7, isRecurring: true }),
            makePlaybook({ id: "p2", overrideIntervalDays: 2, isRecurring: false }),
        ];
        // Non-recurring already actioned → only recurring applies (7)
        expect(getEffectiveInterval(playbooks, daysAgo(1), daysAgo(5))).toBe(7);
    });
});

// ─── calculateReminderStatus ──────────────────────────────────────────────────

describe("calculateReminderStatus", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-03-04T12:00:00Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("with null interval (no playbook)", () => {
        it("returns ok urgency with no reminder scheduled", () => {
            const result = calculateReminderStatus(daysAgo(30), daysAgo(60), null);
            expect(result.urgency).toBe("ok");
            expect(result.isOverdue).toBe(false);
            expect(result.intervalDays).toBeNull();
            expect(result.daysUntilDue).toBeNull();
            expect(result.daysSinceLastAction).toBe(30);
        });

        it("still computes daysSinceLastAction correctly", () => {
            const result = calculateReminderStatus(null, daysAgo(10), null);
            expect(result.daysSinceLastAction).toBe(10);
        });
    });

    describe("urgency classification", () => {
        it("returns urgency=ok when well within interval", () => {
            const result = calculateReminderStatus(daysAgo(2), daysAgo(10), 7);
            expect(result.urgency).toBe("ok");
            expect(result.isOverdue).toBe(false);
            expect(result.daysUntilDue).toBe(5);
        });

        it("returns urgency=approaching when 1 day until due", () => {
            const result = calculateReminderStatus(daysAgo(6), daysAgo(10), 7);
            expect(result.urgency).toBe("approaching");
            expect(result.isOverdue).toBe(false);
            expect(result.daysUntilDue).toBe(1);
        });

        it("returns urgency=due when exactly at the interval", () => {
            const result = calculateReminderStatus(daysAgo(7), daysAgo(10), 7);
            expect(result.urgency).toBe("due");
            expect(result.isOverdue).toBe(false);
            expect(result.daysUntilDue).toBe(0);
        });

        it("returns urgency=overdue when past the interval", () => {
            const result = calculateReminderStatus(daysAgo(10), daysAgo(20), 7);
            expect(result.urgency).toBe("overdue");
            expect(result.isOverdue).toBe(true);
            expect(result.daysUntilDue).toBe(-3);
        });
    });

    describe("baseline selection", () => {
        it("uses lastActionDate as baseline when provided", () => {
            const result = calculateReminderStatus(daysAgo(3), daysAgo(30), 7);
            expect(result.daysSinceLastAction).toBe(3);
        });

        it("falls back to createdAt when lastActionDate is null", () => {
            const result = calculateReminderStatus(null, daysAgo(5), 7);
            expect(result.daysSinceLastAction).toBe(5);
        });

        it("accepts ISO string dates", () => {
            const result = calculateReminderStatus(
                "2026-03-01T12:00:00Z",
                "2026-02-01T12:00:00Z",
                7
            );
            expect(result.daysSinceLastAction).toBe(3);
        });
    });

    describe("intervalDays passthrough", () => {
        it("reflects the provided intervalDays in the result", () => {
            const result = calculateReminderStatus(daysAgo(1), daysAgo(5), 14);
            expect(result.intervalDays).toBe(14);
        });
    });

    describe("edge cases", () => {
        it("handles intervalDays=0 (always overdue)", () => {
            const result = calculateReminderStatus(daysAgo(1), daysAgo(5), 0);
            expect(result.isOverdue).toBe(true);
        });

        it("handles a very large interval (never overdue)", () => {
            const result = calculateReminderStatus(daysAgo(30), daysAgo(30), 365);
            expect(result.isOverdue).toBe(false);
            expect(result.daysUntilDue).toBe(335);
        });

        it("handles entity created today with no action", () => {
            const result = calculateReminderStatus(null, new Date(), 7);
            expect(result.daysSinceLastAction).toBe(0);
            expect(result.isOverdue).toBe(false);
        });

        it("handles future lastActionDate gracefully", () => {
            const result = calculateReminderStatus(daysFromNow(2), daysAgo(10), 7);
            expect(result.isOverdue).toBe(false);
        });
    });
});

// ─── getUrgencyStyles ─────────────────────────────────────────────────────────

describe("getUrgencyStyles", () => {
    it("returns red styles for overdue", () => {
        const styles = getUrgencyStyles("overdue");
        expect(styles.badge).toContain("red");
        expect(styles.text).toContain("red");
        expect(styles.icon).toContain("red");
    });

    it("returns amber styles for due", () => {
        const styles = getUrgencyStyles("due");
        expect(styles.badge).toContain("amber");
    });

    it("returns amber styles for approaching", () => {
        const styles = getUrgencyStyles("approaching");
        expect(styles.badge).toContain("amber");
    });

    it("returns emerald styles for ok", () => {
        const styles = getUrgencyStyles("ok");
        expect(styles.badge).toContain("emerald");
    });

    it("returns an object with badge, text, and icon keys", () => {
        const styles = getUrgencyStyles("ok");
        expect(styles).toHaveProperty("badge");
        expect(styles).toHaveProperty("text");
        expect(styles).toHaveProperty("icon");
    });
});

// ─── getUrgencyLabel ─────────────────────────────────────────────────────────

describe("getUrgencyLabel", () => {
    it("shows 'No reminder' when daysUntilDue is null", () => {
        const label = getUrgencyLabel({
            urgency: "ok",
            daysUntilDue: null,
            daysSinceLastAction: 30,
            intervalDays: null,
            isOverdue: false,
        });
        expect(label).toBe("No reminder");
    });

    it("shows days overdue for overdue status", () => {
        const label = getUrgencyLabel({
            urgency: "overdue",
            daysUntilDue: -5,
            daysSinceLastAction: 19,
            intervalDays: 14,
            isOverdue: true,
        });
        expect(label).toBe("5d overdue");
    });

    it("shows Due today for due status", () => {
        const label = getUrgencyLabel({
            urgency: "due",
            daysUntilDue: 0,
            daysSinceLastAction: 14,
            intervalDays: 14,
            isOverdue: false,
        });
        expect(label).toBe("Due today");
    });

    it("shows Due tomorrow for approaching status", () => {
        const label = getUrgencyLabel({
            urgency: "approaching",
            daysUntilDue: 1,
            daysSinceLastAction: 13,
            intervalDays: 14,
            isOverdue: false,
        });
        expect(label).toBe("Due tomorrow");
    });

    it("shows days until due for ok status", () => {
        const label = getUrgencyLabel({
            urgency: "ok",
            daysUntilDue: 10,
            daysSinceLastAction: 4,
            intervalDays: 14,
            isOverdue: false,
        });
        expect(label).toBe("10d until due");
    });

    it("handles 1d overdue correctly (not showing -1)", () => {
        const label = getUrgencyLabel({
            urgency: "overdue",
            daysUntilDue: -1,
            daysSinceLastAction: 15,
            intervalDays: 14,
            isOverdue: true,
        });
        expect(label).toBe("1d overdue");
    });
});

// ─── getActionTypeIcon ────────────────────────────────────────────────────────

describe("getActionTypeIcon", () => {
    const cases: [string, string][] = [
        ["CALL", "Phone"],
        ["LINE_MESSAGE", "MessageSquare"],
        ["EMAIL", "Mail"],
        ["SITE_VISIT", "MapPin"],
        ["SEND_REPORT", "FileText"],
        ["SEND_LISTING", "Home"],
        ["SCHEDULE_VIEWING", "Eye"],
        ["SEND_CONTRACT", "FileCheck"],
        ["INTERNAL_NOTE", "StickyNote"],
        ["CUSTOM", "Zap"],
    ];

    it.each(cases)('maps %s → %s', (type, icon) => {
        expect(getActionTypeIcon(type)).toBe(icon);
    });

    it("returns Zap for unknown action types", () => {
        expect(getActionTypeIcon("UNKNOWN_TYPE")).toBe("Zap");
    });

    it("returns Zap for empty string", () => {
        expect(getActionTypeIcon("")).toBe("Zap");
    });
});

// ─── getActionTypeLabel ───────────────────────────────────────────────────────

describe("getActionTypeLabel", () => {
    const cases: [string, string][] = [
        ["CALL", "Call"],
        ["LINE_MESSAGE", "LINE Message"],
        ["EMAIL", "Email"],
        ["SITE_VISIT", "Site Visit"],
        ["SEND_REPORT", "Send Report"],
        ["SEND_LISTING", "Send Listing"],
        ["SCHEDULE_VIEWING", "Schedule Viewing"],
        ["SEND_CONTRACT", "Send Contract"],
        ["INTERNAL_NOTE", "Internal Note"],
        ["CUSTOM", "Custom Action"],
    ];

    it.each(cases)('maps %s → "%s"', (type, label) => {
        expect(getActionTypeLabel(type)).toBe(label);
    });

    it("returns 'Custom Action' for unknown types", () => {
        expect(getActionTypeLabel("WHATEVER")).toBe("Custom Action");
    });

    it("returns 'Custom Action' for empty string", () => {
        expect(getActionTypeLabel("")).toBe("Custom Action");
    });
});
