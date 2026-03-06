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
import { useTranslations } from "next-intl";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContactRow = any;

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
    const tf = useTranslations("filters");

    const STATUS_OPTIONS = useMemo(
        () => [
            { value: "__all__", label: tf("allStatuses") },
            { value: "ACTIVE", label: tf("active") },
            { value: "ON_HOLD", label: tf("onHold") },
            { value: "CLOSED_WON", label: tf("closedWon") },
            { value: "CLOSED_LOST", label: tf("closedLost") },
            { value: "UNQUALIFIED", label: tf("unqualified") },
            { value: "REACTIVATE", label: tf("reactivate") },
        ],
        [tf]
    );

    const TYPE_OPTIONS = useMemo(
        () => [
            { value: "__all__", label: tf("allTypes") },
            { value: "Buyer", label: tf("buyer") },
            { value: "Seller", label: tf("seller") },
            { value: "Both", label: tf("both") },
            { value: "Referrer", label: tf("referrer") },
        ],
        [tf]
    );

    const POTENTIAL_OPTIONS = useMemo(
        () => [
            { value: "__all__", label: tf("allTiers") },
            { value: "A", label: tf("tierAHot") },
            { value: "B", label: tf("tierBWarm") },
            { value: "C", label: tf("tierCCool") },
            { value: "D", label: tf("tierDCold") },
        ],
        [tf]
    );

    const SOURCE_OPTIONS = useMemo(
        () => [
            { value: "__all__", label: tf("allSources") },
            { value: "LINE", label: tf("line") },
            { value: "WEBSITE", label: tf("website") },
            { value: "REFERRAL", label: tf("referral") },
            { value: "FACEBOOK", label: tf("facebook") },
            { value: "WALK_IN", label: tf("walkIn") },
            { value: "COLD_CALL", label: tf("coldCall") },
        ],
        [tf]
    );

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
                    {tf("clear")}
                </Button>
            )}
        </div>
    );
}
