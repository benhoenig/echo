"use client";

import { useState, useMemo, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Plus,
    Search,
    Layers,
    Archive,
    Bookmark,
    BookmarkPlus,
    Trash2,
    LayoutGrid,
    Table2,
} from "lucide-react";
import type { ColumnFiltersState, GroupingState } from "@tanstack/react-table";
import { DealsDataTable } from "./deals-data-table";
import { DealsKanbanBoard } from "./deals-kanban-board";
import { DealsFilterBar } from "./deals-filter-bar";
import { CreateDealSheet } from "./create-deal-sheet";
import { DealQuickView } from "./deal-quick-view";
import { restoreDeal, getArchivedDeals } from "./deal-actions";
import { createSavedFilter, deleteSavedFilter } from "./saved-filter-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CrmSubNav } from "../crm-sub-nav";
import { useTranslations } from "next-intl";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DealRow = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SavedFilter = any;

interface PipelineStage {
    id: string;
    name: string;
    pipelineType: string;
    color: string | null;
    order: number;
    isDefault: boolean;
}

interface DealsContentProps {
    initialDeals: DealRow[];
    pipelineStages: PipelineStage[];
    contacts: Array<{
        id: string;
        name: string;
        contactType: string[] | null;
    }>;
    agents: Array<{ id: string; name: string }>;
    listings: Array<{ id: string; name: string }>;
    savedFilters: SavedFilter[];
    workspaceId: string;
    userId: string;
}

export function DealsContent({
    initialDeals,
    pipelineStages,
    contacts,
    agents,
    listings,
    savedFilters,
    workspaceId,
    userId,
}: DealsContentProps) {
    const t = useTranslations("crm");
    const tc = useTranslations("common");

    const GROUP_OPTIONS = useMemo(
        () => [
            { value: "__none__", label: tc("none") },
            { value: "deal_status", label: tc("status") },
            { value: "stage_name", label: t("pipelineStageLabel") },
            { value: "potential_display", label: t("potentialTier") },
        ],
        [t, tc]
    );

    const [search, setSearch] = useState("");
    const [sheetOpen, setSheetOpen] = useState(false);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [grouping, setGrouping] = useState<GroupingState>([]);
    const [showArchived, setShowArchived] = useState(false);
    const [archivedDeals, setArchivedDeals] = useState<DealRow[]>([]);
    const [archivedLoading, setArchivedLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [viewMode, setViewMode] = useState<"table" | "kanban">("kanban");
    const [quickViewDeal, setQuickViewDeal] = useState<DealRow | null>(null);
    const router = useRouter();

    // Saved filters state
    const [saveFilterOpen, setSaveFilterOpen] = useState(false);
    const [newFilterName, setNewFilterName] = useState("");
    const [newFilterShared, setNewFilterShared] = useState(false);

    const activeData = showArchived ? archivedDeals : initialDeals;

    const filteredDeals = useMemo(() => {
        if (!search.trim()) return activeData;
        const q = search.toLowerCase();
        return activeData.filter(
            (d: DealRow) =>
                d.deal_name?.toLowerCase().includes(q) ||
                d.buyer_contact?.first_name?.toLowerCase().includes(q) ||
                d.buyer_contact?.last_name?.toLowerCase().includes(q)
        );
    }, [activeData, search]);

    // Apply column filters manually for kanban (TanStack Table handles them internally for table view)
    const kanbanDeals = useMemo(() => {
        let result = filteredDeals;
        for (const filter of columnFilters) {
            if (filter.id === "deal_status") {
                result = result.filter(
                    (d: DealRow) => d.deal_status === filter.value
                );
            } else if (filter.id === "stage_name") {
                result = result.filter(
                    (d: DealRow) =>
                        d.pipeline_stages?.pipeline_stage_name === filter.value
                );
            } else if (filter.id === "potential_display") {
                result = result.filter(
                    (d: DealRow) =>
                        (d.potential_tier ?? "—") === filter.value
                );
            }
        }
        return result;
    }, [filteredDeals, columnFilters]);

    // Lazy-load archived deals when toggled on
    function handleToggleArchived(checked: boolean) {
        setShowArchived(checked);
        if (checked && archivedDeals.length === 0) {
            setArchivedLoading(true);
            startTransition(async () => {
                try {
                    const data = await getArchivedDeals(workspaceId);
                    setArchivedDeals(data);
                } catch {
                    toast.error(t("failedToLoadArchivedDeals"));
                    setShowArchived(false);
                } finally {
                    setArchivedLoading(false);
                }
            });
        }
    }

    function handleRestore(dealId: string) {
        startTransition(async () => {
            try {
                await restoreDeal(dealId);
                toast.success(t("dealRestored"));
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : t("failedToRestoreDeal")
                );
            }
        });
    }

    function loadSavedFilter(filter: SavedFilter) {
        const config = filter.filter_config;
        if (config.columnFilters) setColumnFilters(config.columnFilters);
        if (config.grouping) setGrouping(config.grouping);
        toast.success(t("loadedFilter", { name: filter.filter_name }));
    }

    function handleSaveFilter() {
        if (!newFilterName.trim()) {
            toast.error(t("filterNameRequired"));
            return;
        }

        startTransition(async () => {
            try {
                await createSavedFilter(
                    workspaceId,
                    newFilterName.trim(),
                    {
                        columnFilters,
                        grouping,
                    },
                    newFilterShared
                );
                toast.success(t("filterSaved"));
                setNewFilterName("");
                setNewFilterShared(false);
                setSaveFilterOpen(false);
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : t("failedToSaveFilter")
                );
            }
        });
    }

    function handleDeleteFilter(filterId: string, filterName: string) {
        startTransition(async () => {
            try {
                await deleteSavedFilter(filterId);
                toast.success(t("deletedFilter", { name: filterName }));
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : t("failedToDeleteFilter")
                );
            }
        });
    }

    const hasActiveFilters =
        columnFilters.length > 0 ||
        grouping.length > 0;

    return (
        <div className="space-y-4">
            <CrmSubNav />
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">
                        {showArchived ? t("archivedDeals") : t("deals")}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {showArchived
                            ? t("archivedDealCount", { count: archivedDeals.length })
                            : t("dealCount", { count: filteredDeals.length })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={showArchived}
                            onCheckedChange={handleToggleArchived}
                            id="show-archived"
                            disabled={archivedLoading}
                        />
                        <Label
                            htmlFor="show-archived"
                            className="text-xs text-muted-foreground flex items-center gap-1"
                        >
                            <Archive className="w-3.5 h-3.5" />
                            {archivedLoading ? tc("loading") : tc("showArchived")}
                        </Label>
                    </div>
                    <Button size="sm" onClick={() => setSheetOpen(true)}>
                        <Plus className="w-4 h-4 mr-1.5" />
                        {t("newDeal")}
                    </Button>
                </div>
            </div>

            {/* Search, Group & View Toggle */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder={t("searchDeals")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-sm"
                    />
                </div>
                {/* Group-by (table view only) */}
                {viewMode === "table" && (
                    <Select
                        value={grouping[0] ?? "__none__"}
                        onValueChange={(v) =>
                            setGrouping(v === "__none__" ? [] : [v])
                        }
                    >
                        <SelectTrigger className="w-[160px] h-9 text-xs">
                            <Layers className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                            <SelectValue placeholder={tc("groupBy")} />
                        </SelectTrigger>
                        <SelectContent>
                            {GROUP_OPTIONS.map((opt) => (
                                <SelectItem
                                    key={opt.value}
                                    value={opt.value}
                                    className="text-xs"
                                >
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                {/* View Toggle — right aligned */}
                {!showArchived && (
                    <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-1 ml-auto">
                        <button
                            onClick={() => setViewMode("kanban")}
                            className={`p-1.5 rounded-md transition-colors ${
                                viewMode === "kanban"
                                    ? "bg-white dark:bg-stone-700 text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                            title={t("kanbanView")}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-1.5 rounded-md transition-colors ${
                                viewMode === "table"
                                    ? "bg-white dark:bg-stone-700 text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                            title={t("tableView")}
                        >
                            <Table2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Filter Bar + Saved Filters */}
            <div className="flex items-center gap-3">
                <DealsFilterBar
                    data={filteredDeals}
                    columnFilters={columnFilters}
                    onColumnFiltersChange={setColumnFilters}
                    pipelineStages={pipelineStages}
                />

                <div className="flex items-center gap-1 ml-auto">
                    {/* Load saved filter */}
                    {savedFilters.length > 0 && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                >
                                    <Bookmark className="w-3.5 h-3.5 mr-1" />
                                    {t("saved")}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                align="end"
                                className="w-64 p-2"
                            >
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                                        {tc("savedFilters")}
                                    </p>
                                    {savedFilters.map(
                                        (sf: SavedFilter) => (
                                            <div
                                                key={sf.id}
                                                className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 group"
                                            >
                                                <button
                                                    className="text-xs text-left flex-1 truncate"
                                                    onClick={() =>
                                                        loadSavedFilter(sf)
                                                    }
                                                >
                                                    {sf.filter_name}
                                                    {sf.is_shared && (
                                                        <span className="text-muted-foreground ml-1">
                                                            ({t("shared")})
                                                        </span>
                                                    )}
                                                </button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() =>
                                                        handleDeleteFilter(
                                                            sf.id,
                                                            sf.filter_name
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}

                    {/* Save current filter */}
                    {hasActiveFilters && (
                        <Popover
                            open={saveFilterOpen}
                            onOpenChange={setSaveFilterOpen}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                >
                                    <BookmarkPlus className="w-3.5 h-3.5 mr-1" />
                                    {tc("saveFilter")}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                align="end"
                                className="w-64 p-3"
                            >
                                <div className="space-y-3">
                                    <p className="text-xs font-medium">
                                        {t("saveCurrentFilter")}
                                    </p>
                                    <Input
                                        placeholder={tc("filterName")}
                                        value={newFilterName}
                                        onChange={(e) =>
                                            setNewFilterName(e.target.value)
                                        }
                                        className="h-8 text-xs"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                                handleSaveFilter();
                                        }}
                                    />
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={newFilterShared}
                                            onCheckedChange={setNewFilterShared}
                                            id="filter-shared"
                                        />
                                        <Label
                                            htmlFor="filter-shared"
                                            className="text-xs text-muted-foreground"
                                        >
                                            {tc("shareWithTeam")}
                                        </Label>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="w-full h-8 text-xs"
                                        onClick={handleSaveFilter}
                                        disabled={isPending}
                                    >
                                        {tc("save")}
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>

            {/* Data Table / Kanban Board */}
            {filteredDeals.length === 0 && columnFilters.length === 0 ? (
                <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-xl flex items-center justify-center mb-4">
                            <Search className="w-6 h-6 text-stone-400" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {showArchived
                                ? t("noArchivedDeals")
                                : t("noDealsYet")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {showArchived
                                ? t("archivedDealsAppearHere")
                                : t("createFirstDeal")}
                        </p>
                        {!showArchived && (
                            <Button
                                size="sm"
                                className="mt-4"
                                onClick={() => setSheetOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                {t("newDeal")}
                            </Button>
                        )}
                    </div>
                </div>
            ) : viewMode === "kanban" && !showArchived ? (
                <DealsKanbanBoard
                    deals={kanbanDeals}
                    pipelineStages={pipelineStages}
                    onCardClick={setQuickViewDeal}
                />
            ) : (
                <DealsDataTable
                    data={filteredDeals}
                    columnFilters={columnFilters}
                    onColumnFiltersChange={setColumnFilters}
                    grouping={grouping}
                    showArchived={showArchived}
                    onRestore={handleRestore}
                    pipelineStages={pipelineStages}
                    onRowClick={setQuickViewDeal}
                />
            )}

            <CreateDealSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                workspaceId={workspaceId}
                pipelineStages={pipelineStages}
                contacts={contacts}
                agents={agents}
                listings={listings}
            />

            <DealQuickView
                deal={quickViewDeal}
                open={!!quickViewDeal}
                onOpenChange={(open) => {
                    if (!open) setQuickViewDeal(null);
                }}
            />
        </div>
    );
}
