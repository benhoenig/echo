"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { markAsActioned } from "@/app/(dashboard)/reminder-actions";
import {
    calculateReminderStatus,
    getUrgencyStyles,
    getUrgencyLabel,
    getActionTypeIcon,
    getActionTypeLabel,
} from "@/lib/reminder-engine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Clock,
    CheckCircle2,
    Phone,
    MessageSquare,
    Mail,
    MapPin,
    FileText,
    Home,
    Eye,
    FileCheck,
    StickyNote,
    Zap,
    ClipboardCheck,
    AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Icon map ────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
    Phone,
    MessageSquare,
    Mail,
    MapPin,
    FileText,
    Home,
    Eye,
    FileCheck,
    StickyNote,
    Zap,
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlaybookAction {
    id: string;
    actionType: string;
    actionLabel: string;
    actionDescription: string | null;
    actionTemplate: string | null;
    isRequired: boolean;
}

interface SuggestedActionsPanelProps {
    entityType: "DEAL" | "LISTING" | "CONTACT";
    entityId: string;
    entityName: string;
    workspaceId: string;
    lastActionDate: string | null;
    createdAt: string;
    intervalDays: number;
    playbooks?: PlaybookAction[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SuggestedActionsPanel({
    entityType,
    entityId,
    entityName,
    workspaceId,
    lastActionDate,
    createdAt,
    intervalDays,
    playbooks = [],
}: SuggestedActionsPanelProps) {
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

    const status = calculateReminderStatus(lastActionDate, createdAt, intervalDays);
    const urgencyStyles = getUrgencyStyles(status.urgency);
    const urgencyLabel = getUrgencyLabel(status);

    const handleMarkAsActioned = () => {
        startTransition(async () => {
            try {
                await markAsActioned(entityType, entityId, workspaceId, pathname);
                toast.success("Marked as actioned — follow-up clock reset");
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "Failed to mark as actioned"
                );
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Reminder Status Card */}
            <div className="flex items-center justify-between rounded-xl border bg-white p-5 shadow-sm dark:bg-stone-900">
                <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${status.isOverdue ? "bg-red-100 dark:bg-red-900/30" : "bg-stone-100 dark:bg-stone-800"}`}>
                        <Clock className={`h-5 w-5 ${urgencyStyles.icon}`} strokeWidth={1.75} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                                Follow-Up Status
                            </span>
                            <Badge variant="secondary" className={urgencyStyles.badge}>
                                {urgencyLabel}
                            </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                            {lastActionDate
                                ? `Last actioned ${status.daysSinceLastAction}d ago`
                                : "No action recorded yet"}
                            {" · "}
                            Tier interval: every {intervalDays}d
                        </p>
                    </div>
                </div>

                <Button
                    variant={status.isOverdue ? "default" : "outline"}
                    size="sm"
                    onClick={handleMarkAsActioned}
                    disabled={isPending}
                    className="gap-2"
                >
                    <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                    {isPending ? "Saving..." : "Mark as Actioned"}
                </Button>
            </div>

            {/* Playbook Actions */}
            {playbooks.length > 0 && (
                <div className="rounded-xl border bg-white p-5 shadow-sm dark:bg-stone-900">
                    <div className="mb-4 flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-stone-500" strokeWidth={1.75} />
                        <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                            Suggested Actions for This Stage
                        </h4>
                    </div>

                    <div className="space-y-3">
                        {playbooks.map((action) => {
                            const iconName = getActionTypeIcon(action.actionType);
                            const IconComponent = ICON_MAP[iconName] || Zap;
                            const typeLabel = getActionTypeLabel(action.actionType);
                            const isExpanded = expandedTemplate === action.id;

                            return (
                                <div
                                    key={action.id}
                                    className="flex items-start gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 transition-all duration-150 dark:border-stone-700 dark:bg-stone-800/50"
                                >
                                    <div className="mt-0.5 rounded-md bg-white p-1.5 shadow-sm dark:bg-stone-800">
                                        <IconComponent
                                            className="h-4 w-4 text-stone-600 dark:text-stone-400"
                                            strokeWidth={1.75}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-stone-800 dark:text-stone-100">
                                                {action.actionLabel}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-wider text-stone-400">
                                                {typeLabel}
                                            </span>
                                            {action.isRequired && (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0 dark:bg-orange-900/30 dark:text-orange-400"
                                                >
                                                    Required
                                                </Badge>
                                            )}
                                        </div>
                                        {action.actionDescription && (
                                            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                                {action.actionDescription}
                                            </p>
                                        )}
                                        {action.actionTemplate && (
                                            <button
                                                onClick={() =>
                                                    setExpandedTemplate(
                                                        isExpanded ? null : action.id
                                                    )
                                                }
                                                className="mt-1.5 text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                                            >
                                                {isExpanded
                                                    ? "Hide template"
                                                    : "View template"}
                                            </button>
                                        )}
                                        {isExpanded && action.actionTemplate && (
                                            <pre className="mt-2 rounded-md bg-stone-100 p-3 text-xs text-stone-700 whitespace-pre-wrap dark:bg-stone-900 dark:text-stone-300">
                                                {action.actionTemplate}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Empty state when no playbooks configured */}
            {playbooks.length === 0 && entityType === "DEAL" && (
                <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/50 p-5 text-center dark:border-stone-700 dark:bg-stone-900/50">
                    <ClipboardCheck className="mx-auto h-8 w-8 text-stone-300 dark:text-stone-600" strokeWidth={1.75} />
                    <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                        No suggested actions configured for this pipeline stage.
                    </p>
                    <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                        Configure actions in Settings → Stage Action Playbook.
                    </p>
                </div>
            )}
        </div>
    );
}
