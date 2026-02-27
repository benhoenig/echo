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
import { Plus, Search, Building2, Layers, Archive, ArchiveRestore } from "lucide-react";
import type { ColumnFiltersState, GroupingState } from "@tanstack/react-table";
import { ListingsDataTable } from "./listings-data-table";
import { ListingsFilterBar } from "./listings-filter-bar";
import { CreateListingSheet } from "./create-listing-sheet";
import { ListingQuickView } from "./listing-quick-view";
import { restoreListing, archiveListing } from "./listing-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ListingRow = any;

interface SavedFilter {
    id: string;
    filter_name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter_config: Record<string, any>;
    is_shared: boolean;
    user_id: string;
    created_at: string;
}

interface ListingsContentProps {
    initialListings: ListingRow[];
    archivedListings: ListingRow[];
    workspaceId: string;
    userId: string;
    savedFilters: SavedFilter[];
}

const GROUP_OPTIONS = [
    { value: "__none__", label: "None" },
    { value: "listing_status", label: "Status" },
    { value: "listing_grade", label: "Grade" },
    { value: "project_name", label: "Project" },
    { value: "zone", label: "Zone" },
    { value: "property_type", label: "Property" },
];

export function ListingsContent({
    initialListings,
    archivedListings,
    workspaceId,
    userId,
    savedFilters,
}: ListingsContentProps) {
    const [search, setSearch] = useState("");
    const [sheetOpen, setSheetOpen] = useState(false);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [grouping, setGrouping] = useState<GroupingState>([]);
    const [selectedListing, setSelectedListing] = useState<ListingRow | null>(null);
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const activeData = showArchived ? archivedListings : initialListings;

    const filteredListings = useMemo(() => {
        if (!search.trim()) return activeData;
        const q = search.toLowerCase();
        return activeData.filter(
            (l: ListingRow) =>
                l.listing_name?.toLowerCase().includes(q) ||
                l.project_name?.toLowerCase().includes(q) ||
                l.zone?.toLowerCase().includes(q) ||
                l.contacts?.first_name?.toLowerCase().includes(q) ||
                l.contacts?.last_name?.toLowerCase().includes(q)
        );
    }, [activeData, search]);

    // Auto-switch back to active view when archived list becomes empty after server refresh
    useEffect(() => {
        if (showArchived && archivedListings.length === 0) {
            setShowArchived(false);
        }
    }, [showArchived, archivedListings.length]);

    function handleRestore(listingId: string) {
        startTransition(async () => {
            try {
                await restoreListing(listingId);
                toast.success("Listing restored.");
                router.refresh();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to restore listing.");
            }
        });
    }

    function handleArchive(listingId: string) {
        startTransition(async () => {
            try {
                await archiveListing(listingId);
                toast.success("Listing archived.");
                router.refresh();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to archive listing.");
            }
        });
    }

    function handleGroupChange(value: string) {
        setGrouping(value === "__none__" ? [] : [value]);
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">
                        {showArchived ? "Archived Listings" : "Listings"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {showArchived
                            ? `${archivedListings.length} archived listing${archivedListings.length !== 1 ? "s" : ""}`
                            : `${initialListings.length} listing${initialListings.length !== 1 ? "s" : ""} in your database`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {archivedListings.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Switch
                                id="show-archived"
                                checked={showArchived}
                                onCheckedChange={setShowArchived}
                            />
                            <Label htmlFor="show-archived" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1.5">
                                <Archive className="w-3.5 h-3.5" />
                                Archived ({archivedListings.length})
                            </Label>
                        </div>
                    )}
                    {!showArchived && (
                        <Button onClick={() => setSheetOpen(true)}>
                            <Plus className="w-4 h-4 mr-1.5" />
                            New Listing
                        </Button>
                    )}
                </div>
            </div>

            {/* Search + Group By Row */}
            <div className="flex items-center gap-3">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search listings..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Group By */}
                <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    <Select
                        value={grouping.length > 0 ? grouping[0] : "__none__"}
                        onValueChange={handleGroupChange}
                    >
                        <SelectTrigger className="w-[130px] h-9 text-xs">
                            <SelectValue placeholder="Group by" />
                        </SelectTrigger>
                        <SelectContent>
                            {GROUP_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Filter Bar */}
            <ListingsFilterBar
                data={filteredListings}
                columnFilters={columnFilters}
                onColumnFiltersChange={setColumnFilters}
                savedFilters={savedFilters}
                workspaceId={workspaceId}
                userId={userId}
            />

            {/* Data Table */}
            {filteredListings.length === 0 && columnFilters.length === 0 ? (
                <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        {showArchived ? (
                            <>
                                <Archive
                                    className="w-12 h-12 text-stone-300 dark:text-stone-600"
                                    strokeWidth={1.75}
                                />
                                <p className="text-sm font-medium text-foreground mt-4">
                                    No archived listings
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Archived listings will appear here.
                                </p>
                            </>
                        ) : (
                            <>
                                <Building2
                                    className="w-12 h-12 text-stone-300 dark:text-stone-600"
                                    strokeWidth={1.75}
                                />
                                <p className="text-sm font-medium text-foreground mt-4">
                                    {search ? "No listings match your search" : "No listings yet"}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {search
                                        ? "Try a different search term."
                                        : "Add your first listing to get started."}
                                </p>
                                {!search && (
                                    <Button className="mt-4" size="sm" onClick={() => setSheetOpen(true)}>
                                        <Plus className="w-4 h-4 mr-1.5" />
                                        New Listing
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <ListingsDataTable
                    data={filteredListings}
                    columnFilters={columnFilters}
                    onColumnFiltersChange={setColumnFilters}
                    grouping={grouping}
                    showArchived={showArchived}
                    onRestore={handleRestore}
                    onRowClick={showArchived ? undefined : (row) => {
                        setSelectedListing(row);
                        setQuickViewOpen(true);
                    }}
                />
            )}

            {/* Create Sheet */}
            <CreateListingSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                workspaceId={workspaceId}
                userId={userId}
            />

            {/* Quick View Drawer */}
            <ListingQuickView
                listing={selectedListing}
                open={quickViewOpen}
                onOpenChange={(open) => {
                    setQuickViewOpen(open);
                    if (!open) {
                        // Delay clearing listing data so the close animation can play
                        setTimeout(() => setSelectedListing(null), 200);
                    }
                }}
                onArchive={handleArchive}
            />
        </div>
    );
}
