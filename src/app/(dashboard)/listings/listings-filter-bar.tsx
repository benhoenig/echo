"use client";

import { useState, useTransition, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Filter,
    X,
    Bookmark,
    Plus,
    Trash2,
    Users,
} from "lucide-react";
import { toast } from "sonner";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { LISTING_STATUSES } from "@/components/shared/listing-status-badge";
import { LISTING_GRADES } from "@/components/shared/listing-grade-badge";
import { createSavedFilter, deleteSavedFilter } from "./saved-filter-actions";

// ── Types ────────────────────────────────────────────────────

interface SavedFilter {
    id: string;
    filter_name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter_config: Record<string, any>;
    is_shared: boolean;
    user_id: string;
    created_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ListingRow = any;

const LISTING_TYPES = [
    { value: "SELL", label: "Sell" },
    { value: "RENT", label: "Rent" },
    { value: "SELL_AND_RENT", label: "Both" },
];

const PROPERTY_TYPES = [
    { value: "HOUSE", label: "House" },
    { value: "CONDO", label: "Condo" },
    { value: "TOWNHOUSE", label: "Townhouse" },
    { value: "LAND", label: "Land" },
    { value: "COMMERCIAL", label: "Commercial" },
    { value: "OTHER", label: "Other" },
];

// ── Filter Bar ───────────────────────────────────────────────

interface ListingsFilterBarProps {
    data: ListingRow[];
    columnFilters: ColumnFiltersState;
    onColumnFiltersChange: (filters: ColumnFiltersState) => void;
    savedFilters: SavedFilter[];
    workspaceId: string;
    userId: string;
}

export function ListingsFilterBar({
    data,
    columnFilters,
    onColumnFiltersChange,
    savedFilters,
    workspaceId,
    userId,
}: ListingsFilterBarProps) {
    const [isPending, startTransition] = useTransition();

    // Extract unique values from data for dynamic filters
    const uniqueZones = useMemo(
        () => [...new Set(data.map((d: ListingRow) => d.zone).filter(Boolean))].sort(),
        [data]
    );
    const uniqueProjects = useMemo(
        () => [...new Set(data.map((d: ListingRow) => d.project_name).filter(Boolean))].sort(),
        [data]
    );

    // Helper: get current filter values
    const getFilterValues = useCallback(
        (columnId: string): string[] => {
            const f = columnFilters.find((f) => f.id === columnId);
            return (f?.value as string[]) ?? [];
        },
        [columnFilters]
    );

    // Helper: toggle a value in a multi-select filter
    function toggleFilter(columnId: string, value: string) {
        const current = getFilterValues(columnId);
        const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];

        onColumnFiltersChange(
            next.length === 0
                ? columnFilters.filter((f) => f.id !== columnId)
                : columnFilters
                    .filter((f) => f.id !== columnId)
                    .concat({ id: columnId, value: next })
        );
    }

    // Helper: set a single-value filter
    function setSingleFilter(columnId: string, value: string | null) {
        onColumnFiltersChange(
            value
                ? columnFilters
                    .filter((f) => f.id !== columnId)
                    .concat({ id: columnId, value: [value] })
                : columnFilters.filter((f) => f.id !== columnId)
        );
    }

    function clearAll() {
        onColumnFiltersChange([]);
    }

    const hasActiveFilters = columnFilters.length > 0;

    // ── Save Filter ───────────────────────────────────────────
    const [saveOpen, setSaveOpen] = useState(false);
    const [saveName, setSaveName] = useState("");
    const [saveShared, setSaveShared] = useState(false);

    async function handleSaveFilter() {
        if (!saveName.trim()) {
            toast.error("Enter a filter name.");
            return;
        }
        startTransition(async () => {
            try {
                // Convert columnFilters to a serializable config
                const config: Record<string, string[]> = {};
                for (const f of columnFilters) {
                    config[f.id] = f.value as string[];
                }
                await createSavedFilter(workspaceId, userId, saveName.trim(), config, saveShared);
                toast.success(`Filter "${saveName.trim()}" saved.`);
                setSaveName("");
                setSaveShared(false);
                setSaveOpen(false);
            } catch {
                toast.error("Failed to save filter.");
            }
        });
    }

    function applyFilter(config: Record<string, string[]>) {
        const filters: ColumnFiltersState = Object.entries(config).map(([id, value]) => ({
            id,
            value,
        }));
        onColumnFiltersChange(filters);
    }

    async function handleDeleteFilter(id: string) {
        startTransition(async () => {
            try {
                await deleteSavedFilter(id);
                toast.success("Filter deleted.");
            } catch {
                toast.error("Failed to delete filter.");
            }
        });
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />

                {/* Status (multi) */}
                <MultiSelectDropdown
                    label="Status"
                    options={LISTING_STATUSES}
                    selected={getFilterValues("listing_status")}
                    onToggle={(v) => toggleFilter("listing_status", v)}
                />

                {/* Grade (multi) */}
                <MultiSelectDropdown
                    label="Grade"
                    options={LISTING_GRADES}
                    selected={getFilterValues("listing_grade")}
                    onToggle={(v) => toggleFilter("listing_grade", v)}
                />

                {/* Listing Type */}
                <MultiSelectDropdown
                    label="Type"
                    options={LISTING_TYPES}
                    selected={getFilterValues("listing_type")}
                    onToggle={(v) => toggleFilter("listing_type", v)}
                />

                {/* Property Type */}
                <MultiSelectDropdown
                    label="Property"
                    options={PROPERTY_TYPES}
                    selected={getFilterValues("property_type")}
                    onToggle={(v) => toggleFilter("property_type", v)}
                />

                {/* Zone */}
                <MultiSelectDropdown
                    label="Zone"
                    options={uniqueZones.map((z) => ({ value: z, label: z }))}
                    selected={getFilterValues("zone")}
                    onToggle={(v) => toggleFilter("zone", v)}
                />

                {/* Project */}
                <MultiSelectDropdown
                    label="Project"
                    options={uniqueProjects.map((p) => ({ value: p, label: p }))}
                    selected={getFilterValues("project_name")}
                    onToggle={(v) => toggleFilter("project_name", v)}
                />

                {/* Save filter */}
                {hasActiveFilters && (
                    <Popover open={saveOpen} onOpenChange={setSaveOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-xs h-7 gap-1 text-orange-600">
                                <Bookmark className="w-3 h-3" />
                                Save
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3 space-y-3" align="start">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Filter name</Label>
                                <Input
                                    value={saveName}
                                    onChange={(e) => setSaveName(e.target.value)}
                                    placeholder="e.g. Hot Listings"
                                    className="h-8 text-xs"
                                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveFilter(); }}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-xs flex items-center gap-1.5">
                                    <Users className="w-3 h-3" /> Share with team
                                </Label>
                                <Switch checked={saveShared} onCheckedChange={setSaveShared} />
                            </div>
                            <Button
                                size="sm"
                                className="w-full h-7 text-xs"
                                onClick={handleSaveFilter}
                                disabled={isPending}
                            >
                                <Plus className="w-3 h-3 mr-1" /> Save Filter
                            </Button>
                        </PopoverContent>
                    </Popover>
                )}

                {/* Saved Filters */}
                {savedFilters.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs h-7 ml-auto gap-1">
                                <Bookmark className="w-3 h-3" />
                                Saved ({savedFilters.length})
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            {savedFilters.map((sf) => (
                                <div
                                    key={sf.id}
                                    className="flex items-center justify-between px-2 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-stone-800 rounded cursor-pointer group"
                                >
                                    <button
                                        className="flex-1 text-left truncate"
                                        onClick={() => applyFilter(sf.filter_config as Record<string, string[]>)}
                                    >
                                        {sf.filter_name}
                                        {sf.is_shared && (
                                            <Users className="w-3 h-3 inline ml-1 text-muted-foreground" />
                                        )}
                                    </button>
                                    {sf.user_id === userId && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteFilter(sf.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 p-0.5"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {/* Clear All */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 text-red-500 hover:text-red-600"
                        onClick={clearAll}
                    >
                        <X className="w-3 h-3 mr-1" /> Clear All
                    </Button>
                )}
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    {columnFilters.map((f) => {
                        const values = f.value as string[];
                        return values.map((v) => (
                            <Badge
                                key={`${f.id}-${v}`}
                                variant="secondary"
                                className="text-[10px] h-5 gap-1 cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10"
                                onClick={() => toggleFilter(f.id, v)}
                            >
                                {f.id.replace(/_/g, " ")}: {v}
                                <X className="w-2.5 h-2.5" />
                            </Badge>
                        ));
                    })}
                </div>
            )}
        </div>
    );
}

// ── Multi-Select Dropdown ────────────────────────────────────

function MultiSelectDropdown({
    label,
    options,
    selected,
    onToggle,
}: {
    label: string;
    options: { value: string; label: string }[];
    selected: string[];
    onToggle: (value: string) => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={`text-xs h-7 ${selected.length > 0
                        ? "border-orange-300 bg-orange-50/50 dark:border-orange-500/30 dark:bg-orange-500/5 text-orange-700 dark:text-orange-400"
                        : ""
                        }`}
                >
                    {label}
                    {selected.length > 0 && (
                        <Badge className="ml-1 h-4 w-4 p-0 text-[9px] rounded-full bg-orange-500 text-white flex items-center justify-center">
                            {selected.length}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
                {options.map((opt) => (
                    <DropdownMenuCheckboxItem
                        key={opt.value}
                        className="text-xs"
                        checked={selected.includes(opt.value)}
                        onCheckedChange={() => onToggle(opt.value)}
                    >
                        {opt.label}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
