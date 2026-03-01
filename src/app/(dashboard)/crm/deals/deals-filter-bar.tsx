"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import type { ColumnFiltersState } from "@tanstack/react-table";

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

interface DealsFilterBarProps {
    data: DealRow[];
    columnFilters: ColumnFiltersState;
    onColumnFiltersChange: (filters: ColumnFiltersState) => void;
    pipelineStages: PipelineStage[];
    dealTypeFilter: string;
}

function getFilterValue(
    filters: ColumnFiltersState,
    id: string
): string | undefined {
    const f = filters.find((filter) => filter.id === id);
    return f?.value as string | undefined;
}

function setFilter(
    filters: ColumnFiltersState,
    id: string,
    value: string
): ColumnFiltersState {
    if (value === "__all__") {
        return filters.filter((f) => f.id !== id);
    }
    const existing = filters.findIndex((f) => f.id === id);
    if (existing >= 0) {
        const updated = [...filters];
        updated[existing] = { id, value };
        return updated;
    }
    return [...filters, { id, value }];
}

export function DealsFilterBar({
    data,
    columnFilters,
    onColumnFiltersChange,
    pipelineStages,
    dealTypeFilter,
}: DealsFilterBarProps) {
    const hasFilters = columnFilters.length > 0;

    // Filter stages by current deal type tab
    const relevantStages = pipelineStages.filter((s) => {
        if (dealTypeFilter === "BUY_SIDE") return s.pipelineType === "BUYER";
        if (dealTypeFilter === "SELL_SIDE") return s.pipelineType === "SELLER";
        return true;
    });

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Status */}
            <Select
                value={
                    getFilterValue(columnFilters, "deal_status") ?? "__all__"
                }
                onValueChange={(v) =>
                    onColumnFiltersChange(
                        setFilter(columnFilters, "deal_status", v)
                    )
                }
            >
                <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="__all__" className="text-xs">
                        All Statuses
                    </SelectItem>
                    <SelectItem value="ACTIVE" className="text-xs">
                        Active
                    </SelectItem>
                    <SelectItem value="ON_HOLD" className="text-xs">
                        On Hold
                    </SelectItem>
                    <SelectItem value="CLOSED_WON" className="text-xs">
                        Closed Won
                    </SelectItem>
                    <SelectItem value="CLOSED_LOST" className="text-xs">
                        Closed Lost
                    </SelectItem>
                </SelectContent>
            </Select>

            {/* Pipeline Stage */}
            <Select
                value={
                    getFilterValue(columnFilters, "stage_name") ?? "__all__"
                }
                onValueChange={(v) =>
                    onColumnFiltersChange(
                        setFilter(columnFilters, "stage_name", v)
                    )
                }
            >
                <SelectTrigger className="w-[160px] h-8 text-xs">
                    <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="__all__" className="text-xs">
                        All Stages
                    </SelectItem>
                    {relevantStages.map((stage) => (
                        <SelectItem
                            key={stage.id}
                            value={stage.name}
                            className="text-xs"
                        >
                            {stage.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Clear */}
            {hasFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-muted-foreground"
                    onClick={() => onColumnFiltersChange([])}
                >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Clear
                </Button>
            )}
        </div>
    );
}
