"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X, Filter } from "lucide-react";
import type { ColumnFiltersState } from "@tanstack/react-table";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContactRow = any;

const STATUS_OPTIONS = [
    { value: "__all__", label: "All Statuses" },
    { value: "ACTIVE", label: "Active" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "CLOSED_WON", label: "Closed Won" },
    { value: "CLOSED_LOST", label: "Closed Lost" },
    { value: "UNQUALIFIED", label: "Unqualified" },
    { value: "REACTIVATE", label: "Reactivate" },
];

const TYPE_OPTIONS = [
    { value: "__all__", label: "All Types" },
    { value: "Buyer", label: "Buyer" },
    { value: "Seller", label: "Seller" },
    { value: "Both", label: "Both" },
    { value: "Referrer", label: "Referrer" },
];

const POTENTIAL_OPTIONS = [
    { value: "__all__", label: "All Tiers" },
    { value: "A", label: "A — Hot" },
    { value: "B", label: "B — Warm" },
    { value: "C", label: "C — Cool" },
    { value: "D", label: "D — Cold" },
];

const SOURCE_OPTIONS = [
    { value: "__all__", label: "All Sources" },
    { value: "LINE", label: "LINE" },
    { value: "WEBSITE", label: "Website" },
    { value: "REFERRAL", label: "Referral" },
    { value: "FACEBOOK", label: "Facebook" },
    { value: "WALK_IN", label: "Walk-in" },
    { value: "COLD_CALL", label: "Cold Call" },
];

interface ContactsFilterBarProps {
    data: ContactRow[];
    columnFilters: ColumnFiltersState;
    onColumnFiltersChange: (filters: ColumnFiltersState) => void;
}

function getFilterValue(
    filters: ColumnFiltersState,
    id: string
): string | undefined {
    const found = filters.find((f) => f.id === id);
    return found?.value as string | undefined;
}

function setFilter(
    filters: ColumnFiltersState,
    id: string,
    value: string | undefined
): ColumnFiltersState {
    const without = filters.filter((f) => f.id !== id);
    if (!value || value === "__all__") return without;
    return [...without, { id, value }];
}

export function ContactsFilterBar({
    data,
    columnFilters,
    onColumnFiltersChange,
}: ContactsFilterBarProps) {
    const hasFilters = columnFilters.length > 0;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />

            {/* Contact Type */}
            <Select
                value={getFilterValue(columnFilters, "contact_type_display") ?? "__all__"}
                onValueChange={(v) =>
                    onColumnFiltersChange(
                        setFilter(columnFilters, "contact_type_display", v)
                    )
                }
            >
                <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {TYPE_OPTIONS.map((opt) => (
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

            {/* Status */}
            <Select
                value={
                    getFilterValue(columnFilters, "contact_status") ?? "__all__"
                }
                onValueChange={(v) =>
                    onColumnFiltersChange(
                        setFilter(columnFilters, "contact_status", v)
                    )
                }
            >
                <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
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

            {/* Potential Tier */}
            <Select
                value={
                    getFilterValue(columnFilters, "potential_tier") ?? "__all__"
                }
                onValueChange={(v) =>
                    onColumnFiltersChange(
                        setFilter(columnFilters, "potential_tier", v)
                    )
                }
            >
                <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {POTENTIAL_OPTIONS.map((opt) => (
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

            {/* Source */}
            <Select
                value={
                    getFilterValue(columnFilters, "contact_source") ?? "__all__"
                }
                onValueChange={(v) =>
                    onColumnFiltersChange(
                        setFilter(columnFilters, "contact_source", v)
                    )
                }
            >
                <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {SOURCE_OPTIONS.map((opt) => (
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

            {/* Clear Filters */}
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
