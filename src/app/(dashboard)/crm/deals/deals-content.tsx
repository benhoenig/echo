"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
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
import { Plus, Search, Layers, Archive } from "lucide-react";
import type { ColumnFiltersState, GroupingState } from "@tanstack/react-table";
import { DealsDataTable } from "./deals-data-table";
import { DealsFilterBar } from "./deals-filter-bar";
import { CreateDealSheet } from "./create-deal-sheet";
import { restoreDeal } from "./deal-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CrmSubNav } from "../crm-sub-nav";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DealRow = any;

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
    archivedDeals: DealRow[];
    pipelineStages: PipelineStage[];
    contacts: Array<{ id: string; name: string; contactType: string[] | null }>;
    agents: Array<{ id: string; name: string }>;
    listings: Array<{ id: string; name: string }>;
    workspaceId: string;
    userId: string;
}

const GROUP_OPTIONS = [
    { value: "__none__", label: "None" },
    { value: "deal_status", label: "Status" },
    { value: "stage_name", label: "Pipeline Stage" },
    { value: "potential_display", label: "Potential Tier" },
];

export function DealsContent({
    initialDeals,
    archivedDeals,
    pipelineStages,
    contacts,
    agents,
    listings,
    workspaceId,
    userId,
}: DealsContentProps) {
    const [search, setSearch] = useState("");
    const [sheetOpen, setSheetOpen] = useState(false);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [grouping, setGrouping] = useState<GroupingState>([]);
    const [showArchived, setShowArchived] = useState(false);
    const [dealTypeFilter, setDealTypeFilter] = useState<"ALL" | "BUY_SIDE" | "SELL_SIDE">("ALL");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const activeData = showArchived ? archivedDeals : initialDeals;

    const filteredByType = useMemo(() => {
        if (dealTypeFilter === "ALL") return activeData;
        return activeData.filter((d: DealRow) => d.deal_type === dealTypeFilter);
    }, [activeData, dealTypeFilter]);

    const filteredDeals = useMemo(() => {
        if (!search.trim()) return filteredByType;
        const q = search.toLowerCase();
        return filteredByType.filter(
            (d: DealRow) =>
                d.deal_name?.toLowerCase().includes(q) ||
                d.buyer_contact?.first_name
                    ?.toLowerCase()
                    .includes(q) ||
                d.buyer_contact?.last_name
                    ?.toLowerCase()
                    .includes(q) ||
                d.seller_contact?.first_name
                    ?.toLowerCase()
                    .includes(q) ||
                d.seller_contact?.last_name
                    ?.toLowerCase()
                    .includes(q)
        );
    }, [filteredByType, search]);

    useEffect(() => {
        if (showArchived && archivedDeals.length === 0) {
            setShowArchived(false);
        }
    }, [showArchived, archivedDeals.length]);

    function handleRestore(dealId: string) {
        startTransition(async () => {
            try {
                await restoreDeal(dealId);
                toast.success("Deal restored.");
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to restore deal."
                );
            }
        });
    }

    return (
        <div className="space-y-4">
            <CrmSubNav />
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">
                        {showArchived ? "Archived Deals" : "Deals"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {showArchived
                            ? `${archivedDeals.length} archived deal${archivedDeals.length !== 1 ? "s" : ""}`
                            : `${filteredDeals.length} deal${filteredDeals.length !== 1 ? "s" : ""}`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {archivedDeals.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={showArchived}
                                onCheckedChange={setShowArchived}
                                id="show-archived"
                            />
                            <Label
                                htmlFor="show-archived"
                                className="text-xs text-muted-foreground flex items-center gap-1"
                            >
                                <Archive className="w-3.5 h-3.5" />
                                Archived
                            </Label>
                        </div>
                    )}
                    <Button size="sm" onClick={() => setSheetOpen(true)}>
                        <Plus className="w-4 h-4 mr-1.5" />
                        New Deal
                    </Button>
                </div>
            </div>

            {/* Deal Type Tabs */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-1 w-fit">
                {(
                    [
                        { value: "ALL", label: "All Deals" },
                        { value: "BUY_SIDE", label: "Buy-side" },
                        { value: "SELL_SIDE", label: "Sell-side" },
                    ] as const
                ).map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setDealTypeFilter(tab.value)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            dealTypeFilter === tab.value
                                ? "bg-white dark:bg-stone-700 text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search & Group */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search deals..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-sm"
                    />
                </div>
                <Select
                    value={grouping[0] ?? "__none__"}
                    onValueChange={(v) =>
                        setGrouping(v === "__none__" ? [] : [v])
                    }
                >
                    <SelectTrigger className="w-[160px] h-9 text-xs">
                        <Layers className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                        <SelectValue placeholder="Group by..." />
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
            </div>

            {/* Filter Bar */}
            <DealsFilterBar
                data={filteredDeals}
                columnFilters={columnFilters}
                onColumnFiltersChange={setColumnFilters}
                pipelineStages={pipelineStages}
                dealTypeFilter={dealTypeFilter}
            />

            {/* Data Table */}
            {filteredDeals.length === 0 && columnFilters.length === 0 ? (
                <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-xl flex items-center justify-center mb-4">
                            <Search className="w-6 h-6 text-stone-400" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {showArchived
                                ? "No archived deals"
                                : "No deals yet"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {showArchived
                                ? "Archived deals will appear here."
                                : "Create your first deal to get started."}
                        </p>
                        {!showArchived && (
                            <Button
                                size="sm"
                                className="mt-4"
                                onClick={() => setSheetOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                New Deal
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <DealsDataTable
                    data={filteredDeals}
                    columnFilters={columnFilters}
                    onColumnFiltersChange={setColumnFilters}
                    grouping={grouping}
                    showArchived={showArchived}
                    onRestore={handleRestore}
                    pipelineStages={pipelineStages}
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
        </div>
    );
}
