"use client";

import { useEffect, useState, useTransition, useMemo, useCallback } from "react";
import Link from "next/link";
import {
    Building2,
    Users,
    CheckCircle2,
    Clock,
    AlertTriangle,
    AlertCircle,
    Filter,
    Loader2,
    ClipboardCheck,
    ChevronDown,
    MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    getUrgencyStyles,
    getUrgencyLabel,
    getActionTypeLabel,
    type Urgency,
    type ReminderStatus,
} from "@/lib/reminder-engine";
import { getOverdueItems, type OverdueItem } from "./reminders-actions";
import { markAsActioned } from "../reminder-actions";
import { useTranslations } from "next-intl";

// ─── Filter types ────────────────────────────────────────────────────────────

type ModuleFilter = "ALL" | "DEAL" | "LISTING";
type UrgencyFilter = "ALL" | "overdue" | "due" | "approaching";
type TierFilter = "ALL" | "A" | "B" | "C" | "D";

// ─── Urgency icon helper ────────────────────────────────────────────────────

function UrgencyIcon({ urgency, className }: { urgency: Urgency; className?: string }) {
    switch (urgency) {
        case "overdue":
            return <AlertCircle className={cn("w-4 h-4", className)} />;
        case "due":
            return <AlertTriangle className={cn("w-4 h-4", className)} />;
        case "approaching":
            return <Clock className={cn("w-4 h-4", className)} />;
        default:
            return <CheckCircle2 className={cn("w-4 h-4", className)} />;
    }
}

// ─── Stats bar ──────────────────────────────────────────────────────────────

function StatsBar({ items }: { items: OverdueItem[] }) {
    const t = useTranslations("reminders");
    const overdue = items.filter((i) => i.urgency === "overdue").length;
    const due = items.filter((i) => i.urgency === "due").length;
    const approaching = items.filter((i) => i.urgency === "approaching").length;

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("overdue")}</span>
                </div>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{overdue}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("dueToday")}</span>
                </div>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{due}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("approaching")}</span>
                </div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{approaching}</p>
            </div>
        </div>
    );
}

// ─── Reminder Item Row ──────────────────────────────────────────────────────

function ReminderItemRow({
    item,
    workspaceId,
    onActioned,
}: {
    item: OverdueItem;
    workspaceId: string;
    onActioned: () => void;
}) {
    const t = useTranslations("reminders");
    const [isPending, startTransition] = useTransition();
    const [showNote, setShowNote] = useState(false);
    const [note, setNote] = useState("");
    const urgencyStyles = getUrgencyStyles(item.urgency);

    const reminderStatus: ReminderStatus = {
        isOverdue: item.daysUntilDue != null ? item.daysUntilDue < 0 : false,
        daysSinceLastAction: item.daysSinceLastAction,
        intervalDays: item.intervalDays,
        daysUntilDue: item.daysUntilDue,
        urgency: item.urgency,
    };

    const handleMarkActioned = useCallback(() => {
        startTransition(async () => {
            try {
                await markAsActioned(
                    item.entityType,
                    item.id,
                    workspaceId,
                    "/reminders",
                    note || undefined
                );
                onActioned();
            } catch (error) {
                console.error("Failed to mark as actioned:", error);
            }
        });
    }, [item.entityType, item.id, workspaceId, note, onActioned]);

    return (
        <div
            className={cn(
                "group bg-white dark:bg-stone-900 border rounded-xl p-4 transition-all hover:shadow-md",
                item.urgency === "overdue"
                    ? "border-red-200 dark:border-red-800/50"
                    : item.urgency === "due"
                        ? "border-amber-200 dark:border-amber-800/50"
                        : "border-stone-200 dark:border-stone-700"
            )}
        >
            <div className="flex items-start gap-4">
                {/* Urgency indicator */}
                <div className={cn("mt-0.5 shrink-0", urgencyStyles.icon)}>
                    <UrgencyIcon urgency={item.urgency} />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link
                            href={item.actionUrl}
                            className="text-sm font-semibold text-stone-900 dark:text-stone-100 hover:text-orange-600 dark:hover:text-orange-400 truncate transition-colors"
                        >
                            {item.name}
                        </Link>

                        {/* Entity type badge */}
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-[10px] px-1.5 py-0 shrink-0",
                                item.entityType === "DEAL"
                                    ? "border-purple-300 text-purple-600 dark:border-purple-700 dark:text-purple-400"
                                    : "border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400"
                            )}
                        >
                            {item.entityType === "DEAL" ? (
                                <Users className="w-3 h-3 mr-0.5 inline" />
                            ) : (
                                <Building2 className="w-3 h-3 mr-0.5 inline" />
                            )}
                            {item.entityType === "DEAL" ? t("deal") : t("listing")}
                        </Badge>

                        {/* Tier badge */}
                        {item.tier && (
                            <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 shrink-0"
                            >
                                Tier {item.tier}
                            </Badge>
                        )}

                        {/* Deal type */}
                        {item.dealType && (
                            <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 shrink-0 border-stone-300 dark:border-stone-600"
                            >
                                {item.dealType === "SELL_SIDE" ? t("seller") : t("buyer")}
                            </Badge>
                        )}
                    </div>

                    {/* Details line */}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-500 dark:text-stone-400">
                        <span className={cn("font-medium", urgencyStyles.text)}>
                            {getUrgencyLabel(reminderStatus)}
                        </span>
                        <span>•</span>
                        <span>{t("daysSinceAction", { days: item.daysSinceLastAction })}</span>
                        <span>•</span>
                        <span>{item.intervalDays != null ? t("everyDays", { days: item.intervalDays }) : "—"}</span>
                        {item.pipelineStageName && (
                            <>
                                <span>•</span>
                                <span className="text-stone-400 dark:text-stone-500">
                                    {item.pipelineStageName}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Suggested actions */}
                    {item.suggestedActions.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <MessageSquare className="w-3 h-3 text-stone-400" />
                            {item.suggestedActions.map((action) => (
                                <Badge
                                    key={action.id}
                                    variant="outline"
                                    className={cn(
                                        "text-[10px] px-1.5 py-0",
                                        action.isRequired
                                            ? "border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400"
                                            : "border-stone-200 text-stone-500 dark:border-stone-700"
                                    )}
                                >
                                    {getActionTypeLabel(action.actionType)}: {action.actionLabel}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Note input */}
                    {showNote && (
                        <div className="mt-2">
                            <Input
                                placeholder="Add a note (optional)..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="h-8 text-xs"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleMarkActioned();
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-stone-400 hover:text-stone-600"
                        onClick={() => setShowNote(!showNote)}
                    >
                        {showNote ? t("hide") : t("note")}
                    </Button>
                    <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={handleMarkActioned}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                        )}
                        {t("done")}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Content ───────────────────────────────────────────────────────────

export function RemindersContent({ workspaceId }: { workspaceId: string }) {
    const t = useTranslations("reminders");
    const tc = useTranslations("common");
    const [items, setItems] = useState<OverdueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [moduleFilter, setModuleFilter] = useState<ModuleFilter>("ALL");
    const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>("ALL");
    const [tierFilter, setTierFilter] = useState<TierFilter>("ALL");

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getOverdueItems(workspaceId);
            setItems(data);
        } catch (error) {
            console.error("Failed to fetch overdue items:", error);
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Apply client-side filters
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            if (moduleFilter !== "ALL" && item.entityType !== moduleFilter) return false;
            if (urgencyFilter !== "ALL" && item.urgency !== urgencyFilter) return false;
            if (tierFilter !== "ALL" && item.tier !== tierFilter) return false;
            return true;
        });
    }, [items, moduleFilter, urgencyFilter, tierFilter]);

    const activeFilterCount = [moduleFilter, urgencyFilter, tierFilter].filter(
        (f) => f !== "ALL"
    ).length;

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Stats skeleton */}
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-stone-100 dark:bg-stone-800 rounded-xl p-4 animate-pulse h-[88px]"
                        />
                    ))}
                </div>
                {/* List skeleton */}
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="bg-stone-100 dark:bg-stone-800 rounded-xl h-[76px] animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <StatsBar items={items} />

            {/* Filter bar */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-stone-400" />

                {/* Module filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-8 text-xs gap-1",
                                moduleFilter !== "ALL" && "border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20"
                            )}
                        >
                            {moduleFilter === "ALL" ? t("allTypes") : moduleFilter === "DEAL" ? t("deals") : t("listings")}
                            <ChevronDown className="w-3 h-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setModuleFilter("ALL")}>{t("allTypes")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setModuleFilter("DEAL")}>{t("deals")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setModuleFilter("LISTING")}>{t("listings")}</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Urgency filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-8 text-xs gap-1",
                                urgencyFilter !== "ALL" && "border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20"
                            )}
                        >
                            {urgencyFilter === "ALL"
                                ? t("allUrgency")
                                : urgencyFilter === "overdue"
                                    ? t("overdue")
                                    : urgencyFilter === "due"
                                        ? t("dueToday")
                                        : t("approaching")}
                            <ChevronDown className="w-3 h-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setUrgencyFilter("ALL")}>{t("allUrgency")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setUrgencyFilter("overdue")}>{t("overdue")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setUrgencyFilter("due")}>{t("dueToday")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setUrgencyFilter("approaching")}>{t("approaching")}</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Tier filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-8 text-xs gap-1",
                                tierFilter !== "ALL" && "border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20"
                            )}
                        >
                            {tierFilter === "ALL" ? t("allTiers") : `Tier ${tierFilter}`}
                            <ChevronDown className="w-3 h-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setTierFilter("ALL")}>{t("allTiers")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTierFilter("A")}>Tier A</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTierFilter("B")}>Tier B</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTierFilter("C")}>Tier C</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTierFilter("D")}>Tier D</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {activeFilterCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-stone-400 hover:text-stone-600"
                        onClick={() => {
                            setModuleFilter("ALL");
                            setUrgencyFilter("ALL");
                            setTierFilter("ALL");
                        }}
                    >
                        {tc("clearFilters")}
                    </Button>
                )}

                <div className="ml-auto text-xs text-stone-400">
                    {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
                </div>
            </div>

            {/* Item list */}
            {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                        <ClipboardCheck className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
                        {t("allCaughtUp")}
                    </h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm">
                        {items.length === 0
                            ? t("nothingNeedsFollowUp")
                            : t("noMatchFilters")}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredItems.map((item) => (
                        <ReminderItemRow
                            key={`${item.entityType}-${item.id}`}
                            item={item}
                            workspaceId={workspaceId}
                            onActioned={fetchItems}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
