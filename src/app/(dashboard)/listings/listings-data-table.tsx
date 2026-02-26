"use client";

import { useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getGroupedRowModel,
    getExpandedRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type VisibilityState,
    type ColumnFiltersState,
    type GroupingState,
    type ExpandedState,
    type FilterFn,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ArrowUpDown,
    Star,
    Globe,
    Columns3,
    ChevronRight,
    ChevronDown,
    AlertTriangle,
    Crosshair,
    Lock,
    ImageOff,
    FileWarning,
    Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ListingStatusBadge, LISTING_STATUSES, TERMINAL_STATUSES } from "@/components/shared/listing-status-badge";
import { ListingGradeBadge, LISTING_GRADES } from "@/components/shared/listing-grade-badge";
import { updateListingField } from "./listing-actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ListingRow = any;

// ── Multi-value filter function ──────────────────────────────

const multiValueFilter: FilterFn<ListingRow> = (row, columnId, filterValue) => {
    const values = filterValue as string[];
    if (!values || values.length === 0) return true;
    const cellValue = row.getValue(columnId) as string;
    return values.includes(cellValue);
};

// ── Inline Editable Cell Components ──────────────────────────

function InlineNumberCell({
    value,
    listingId,
    field,
    prefix = "",
    format = false,
}: {
    value: number | null;
    listingId: string;
    field: string;
    prefix?: string;
    format?: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value?.toString() ?? "");

    const display = value
        ? `${prefix}${format ? value.toLocaleString() : value}`
        : "—";

    async function handleSave() {
        setEditing(false);
        const newVal = inputValue ? parseFloat(inputValue) : null;
        if (newVal === value) return;
        try {
            await updateListingField(listingId, field, newVal);
        } catch {
            toast.error("Failed to update.");
        }
    }

    if (editing) {
        return (
            <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") setEditing(false);
                }}
                className="h-7 w-20 text-xs"
                autoFocus
            />
        );
    }

    return (
        <span
            className="cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800 px-1.5 py-0.5 rounded text-xs"
            onClick={(e) => {
                e.stopPropagation();
                setInputValue(value?.toString() ?? "");
                setEditing(true);
            }}
        >
            {display}
        </span>
    );
}

function InlineSelectCell({
    value,
    listingId,
    field,
    options,
    renderValue,
}: {
    value: string | null;
    listingId: string;
    field: string;
    options: { value: string; label: string }[];
    renderValue: (val: string | null) => React.ReactNode;
}) {
    const [editing, setEditing] = useState(false);

    async function handleChange(newVal: string) {
        setEditing(false);
        if (newVal === value) return;
        try {
            await updateListingField(listingId, field, newVal);
        } catch {
            toast.error("Failed to update.");
        }
    }

    if (editing) {
        return (
            <Select defaultValue={value ?? undefined} onValueChange={handleChange}>
                <SelectTrigger
                    className="h-7 w-24 text-xs"
                    autoFocus
                    onBlur={() => setTimeout(() => setEditing(false), 200)}
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }

    return (
        <span
            className="cursor-pointer"
            onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
            }}
        >
            {renderValue(value)}
        </span>
    );
}

// ── Status Cell with Confirmation Dialog ─────────────────────

function StatusSelectCell({
    value,
    listingId,
    listingName,
}: {
    value: string;
    listingId: string;
    listingName: string;
}) {
    const [editing, setEditing] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    function handleChange(newVal: string) {
        setEditing(false);
        if (newVal === value) return;
        setPendingStatus(newVal);
        setDialogOpen(true);
    }

    async function confirmChange() {
        if (!pendingStatus) return;
        setIsPending(true);
        try {
            await updateListingField(listingId, "listing_status", pendingStatus);
            toast.success(`Status changed to ${pendingStatus}`);
        } catch {
            toast.error("Failed to update status.");
        } finally {
            setIsPending(false);
            setDialogOpen(false);
            setPendingStatus(null);
        }
    }

    function cancelChange() {
        setDialogOpen(false);
        setPendingStatus(null);
    }

    const isTerminal = pendingStatus ? TERMINAL_STATUSES.includes(pendingStatus) : false;

    return (
        <>
            {editing ? (
                <Select defaultValue={value} onValueChange={handleChange}>
                    <SelectTrigger
                        className="h-7 w-24 text-xs"
                        autoFocus
                        onBlur={() => setTimeout(() => setEditing(false), 200)}
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {LISTING_STATUSES.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <span
                    className="cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        setEditing(true);
                    }}
                >
                    <ListingStatusBadge status={value} />
                </span>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {isTerminal && (
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                            )}
                            Confirm Status Change
                        </DialogTitle>
                        <DialogDescription className="space-y-2">
                            <span className="block">
                                Change <strong>{listingName}</strong> from{" "}
                                <ListingStatusBadge status={value} /> to{" "}
                                <ListingStatusBadge status={pendingStatus ?? ""} />?
                            </span>
                            {isTerminal && (
                                <span className="block text-amber-600 dark:text-amber-400 text-xs font-medium">
                                    ⚠️ This is a terminal status. The listing will no longer appear in active views.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={cancelChange} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={confirmChange}
                            disabled={isPending}
                            className={isTerminal ? "bg-amber-600 hover:bg-amber-700" : ""}
                        >
                            {isPending ? "Updating..." : "Confirm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function InlineToggleCell({
    value,
    listingId,
    field,
    icon: Icon,
}: {
    value: boolean;
    listingId: string;
    field: string;
    icon: React.ComponentType<{ className?: string }>;
}) {
    async function handleToggle(e: React.MouseEvent) {
        e.stopPropagation();
        try {
            await updateListingField(listingId, field, !value);
        } catch {
            toast.error("Failed to update.");
        }
    }

    return (
        <button onClick={handleToggle} className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
            <Icon
                className={`w-3.5 h-3.5 ${value
                    ? "text-amber-500"
                    : "text-stone-300 dark:text-stone-600"
                    }`}
            />
        </button>
    );
}

// ── Listing Type Labels ──────────────────────────────────────

const LISTING_TYPE_LABELS: Record<string, string> = {
    SELL: "Sell",
    RENT: "Rent",
    SELL_AND_RENT: "Both",
};

// ── Column Definitions ───────────────────────────────────────

function getColumns(): ColumnDef<ListingRow>[] {
    return [
        {
            accessorKey: "listing_name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 text-xs"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Listing Name
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="max-w-[200px]">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {row.getValue("listing_name")}
                    </p>
                    {row.original.unit_no && (
                        <p className="text-[11px] text-muted-foreground">
                            Unit {row.original.unit_no}
                        </p>
                    )}
                </div>
            ),
            size: 200,
        },
        {
            accessorKey: "listing_status",
            header: "Status",
            cell: ({ row }) => (
                <StatusSelectCell
                    value={row.original.listing_status}
                    listingId={row.original.id}
                    listingName={row.original.listing_name}
                />
            ),
            filterFn: multiValueFilter,
            size: 100,
        },
        {
            accessorKey: "listing_grade",
            header: "Grade",
            cell: ({ row }) => (
                <InlineSelectCell
                    value={row.original.listing_grade}
                    listingId={row.original.id}
                    field="listing_grade"
                    options={LISTING_GRADES}
                    renderValue={(v) => <ListingGradeBadge grade={v} />}
                />
            ),
            filterFn: multiValueFilter,
            size: 60,
        },
        {
            accessorKey: "listing_type",
            header: "Type",
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">
                    {LISTING_TYPE_LABELS[row.getValue("listing_type") as string] ?? row.getValue("listing_type")}
                </span>
            ),
            filterFn: multiValueFilter,
            size: 70,
        },
        {
            accessorKey: "property_type",
            header: "Property",
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">
                    {(row.getValue("property_type") as string)?.charAt(0) + (row.getValue("property_type") as string)?.slice(1).toLowerCase()}
                </span>
            ),
            filterFn: multiValueFilter,
            size: 80,
            enableHiding: true,
        },
        {
            accessorKey: "project_name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 text-xs"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Project
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground truncate max-w-[140px] block">
                    {row.getValue("project_name") ?? "—"}
                </span>
            ),
            filterFn: multiValueFilter,
            size: 150,
        },
        {
            accessorKey: "zone",
            header: "Zone",
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">
                    {row.getValue("zone") ?? "—"}
                </span>
            ),
            filterFn: multiValueFilter,
            size: 100,
        },
        {
            accessorKey: "bedrooms",
            header: "Beds",
            cell: ({ row }) => (
                <InlineNumberCell
                    value={row.original.bedrooms}
                    listingId={row.original.id}
                    field="bedrooms"
                />
            ),
            size: 55,
        },
        {
            accessorKey: "size_sqm",
            header: "SQM",
            cell: ({ row }) => (
                <InlineNumberCell
                    value={row.original.size_sqm}
                    listingId={row.original.id}
                    field="size_sqm"
                />
            ),
            size: 70,
        },
        {
            accessorKey: "floor",
            header: "Floor",
            cell: ({ row }) => (
                <InlineNumberCell
                    value={row.original.floor}
                    listingId={row.original.id}
                    field="floor"
                />
            ),
            size: 55,
        },
        {
            accessorKey: "asking_price",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 text-xs"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Asking ฿
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <InlineNumberCell
                    value={row.original.asking_price}
                    listingId={row.original.id}
                    field="asking_price"
                    prefix="฿"
                    format
                />
            ),
            size: 110,
        },
        {
            accessorKey: "rental_price",
            header: "Rental ฿",
            cell: ({ row }) => (
                <InlineNumberCell
                    value={row.original.rental_price}
                    listingId={row.original.id}
                    field="rental_price"
                    prefix="฿"
                    format
                />
            ),
            size: 100,
        },
        {
            id: "seller",
            header: "Seller",
            cell: ({ row }) => {
                const c = row.original.contacts;
                if (!c) return <span className="text-xs text-muted-foreground">—</span>;
                const name = c.nickname || `${c.first_name} ${c.last_name}`;
                return <span className="text-xs text-muted-foreground truncate max-w-[110px] block">{name}</span>;
            },
            size: 120,
        },
        {
            id: "transit",
            header: "BTS/MRT",
            cell: ({ row }) => {
                const parts = [row.original.bts, row.original.mrt].filter(Boolean);
                return (
                    <span className="text-xs text-muted-foreground">
                        {parts.length > 0 ? parts.join(" / ") : "—"}
                    </span>
                );
            },
            size: 100,
        },
        {
            id: "days_on_market",
            header: () => (
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" strokeWidth={1.75} />
                    <span className="text-[10px]">DOM</span>
                </div>
            ),
            cell: ({ row }) => {
                const d = row.original;
                // Calculate days on market from listing_status_changed_at for ACTIVE listings,
                // or show stored value for non-active
                if (d.days_on_market != null) {
                    // For active listings, calculate live DOM from when status changed
                    if (d.listing_status === "ACTIVE" && d.listing_status_changed_at) {
                        const changedAt = new Date(d.listing_status_changed_at);
                        const now = new Date();
                        const diffDays = Math.floor(
                            (now.getTime() - changedAt.getTime()) / (1000 * 60 * 60 * 24)
                        );
                        return (
                            <span className="text-xs tabular-nums text-muted-foreground">
                                {diffDays}d
                            </span>
                        );
                    }
                    return (
                        <span className="text-xs tabular-nums text-muted-foreground">
                            {d.days_on_market}d
                        </span>
                    );
                }
                return <span className="text-xs text-muted-foreground">—</span>;
            },
            size: 55,
            enableSorting: true,
            sortingFn: (rowA, rowB) => {
                const a = rowA.original.days_on_market ?? -1;
                const b = rowB.original.days_on_market ?? -1;
                return a - b;
            },
        },
        {
            id: "featured",
            header: () => <Star className="w-3.5 h-3.5 text-muted-foreground mx-auto" />,
            cell: ({ row }) => (
                <div className="text-center">
                    <InlineToggleCell
                        value={row.original.featured_flag}
                        listingId={row.original.id}
                        field="featured_flag"
                        icon={Star}
                    />
                </div>
            ),
            size: 40,
        },
        {
            id: "website",
            header: () => <Globe className="w-3.5 h-3.5 text-muted-foreground mx-auto" />,
            cell: ({ row }) => (
                <div className="text-center">
                    <InlineToggleCell
                        value={row.original.website_visible}
                        listingId={row.original.id}
                        field="website_visible"
                        icon={Globe}
                    />
                </div>
            ),
            size: 40,
        },
        {
            id: "focus",
            header: () => <Crosshair className="w-3.5 h-3.5 text-muted-foreground mx-auto" />,
            cell: ({ row }) => (
                <div className="text-center">
                    <InlineToggleCell
                        value={row.original.focus_flag}
                        listingId={row.original.id}
                        field="focus_flag"
                        icon={Crosshair}
                    />
                </div>
            ),
            size: 40,
        },
        {
            id: "exclusive",
            header: () => <Lock className="w-3.5 h-3.5 text-muted-foreground mx-auto" />,
            cell: ({ row }) => (
                <div className="text-center">
                    <InlineToggleCell
                        value={row.original.exclusive_agreement}
                        listingId={row.original.id}
                        field="exclusive_agreement"
                        icon={Lock}
                    />
                </div>
            ),
            size: 40,
        },
        {
            id: "missing",
            header: () => <FileWarning className="w-3.5 h-3.5 text-muted-foreground mx-auto" />,
            cell: ({ row }) => {
                const d = row.original;
                const missingPhoto = !d.unit_photos || d.unit_photos.length === 0;
                const missingDetails =
                    d.bedrooms == null ||
                    d.size_sqm == null ||
                    (d.listing_type !== "RENT" && d.asking_price == null) ||
                    (d.listing_type !== "SELL" && d.rental_price == null) ||
                    !d.zone;

                if (!missingPhoto && !missingDetails) return null;

                const tips: string[] = [];
                if (missingPhoto) tips.push("No photos");
                if (missingDetails) tips.push("Missing details");

                return (
                    <div className="flex items-center justify-center gap-0.5">
                        {missingPhoto && (
                            <ImageOff className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        {missingDetails && (
                            <FileWarning className="w-3.5 h-3.5 text-amber-400" />
                        )}
                    </div>
                );
            },
            size: 50,
            enableSorting: false,
        },
    ];
}

// ── DataTable Component ──────────────────────────────────────

interface ListingsDataTableProps {
    data: ListingRow[];
    columnFilters: ColumnFiltersState;
    onColumnFiltersChange: (filters: ColumnFiltersState) => void;
    grouping: GroupingState;
}

export function ListingsDataTable({
    data,
    columnFilters,
    onColumnFiltersChange,
    grouping,
}: ListingsDataTableProps) {
    const router = useRouter();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [expanded, setExpanded] = useState<ExpandedState>(true);

    const columns = getColumns();

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnFiltersChange: (updater) => {
            const next = typeof updater === "function" ? updater(columnFilters) : updater;
            onColumnFiltersChange(next);
        },
        onExpandedChange: setExpanded,
        state: {
            sorting,
            columnVisibility,
            columnFilters,
            grouping,
            expanded,
        },
    });

    const filteredCount = table.getFilteredRowModel().rows.length;

    return (
        <div className="space-y-2">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                {/* Count */}
                <p className="text-xs text-muted-foreground">
                    {columnFilters.length > 0
                        ? `Showing ${filteredCount} of ${data.length} listings`
                        : `${data.length} listings`}
                </p>

                {/* Column visibility toggle */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs">
                            <Columns3 className="w-3.5 h-3.5 mr-1.5" />
                            Columns
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {table
                            .getAllColumns()
                            .filter((col) => col.getCanHide())
                            .map((col) => (
                                <DropdownMenuCheckboxItem
                                    key={col.id}
                                    className="text-xs capitalize"
                                    checked={col.getIsVisible()}
                                    onCheckedChange={(v) => col.toggleVisibility(!!v)}
                                >
                                    {col.id.replace(/_/g, " ")}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow
                                    key={headerGroup.id}
                                    className="bg-stone-50/50 dark:bg-stone-800/30 hover:bg-stone-50/50"
                                >
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className="text-xs font-medium text-muted-foreground uppercase tracking-wider h-10"
                                            style={{ width: header.getSize() }}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                                        No listings match your filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map((row) => {
                                    // Group header row
                                    if (row.getIsGrouped()) {
                                        return (
                                            <TableRow
                                                key={row.id}
                                                className="bg-stone-50 dark:bg-stone-800/50 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800"
                                                onClick={() => row.toggleExpanded()}
                                            >
                                                <TableCell
                                                    colSpan={row.getVisibleCells().length}
                                                    className="py-2 px-4"
                                                >
                                                    <div className="flex items-center gap-2 font-medium text-sm">
                                                        {row.getIsExpanded() ? (
                                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                        )}
                                                        <span className="text-foreground">
                                                            {String(row.groupingValue ?? "—")}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground bg-stone-200 dark:bg-stone-700 px-1.5 py-0.5 rounded-full">
                                                            {row.subRows.length}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }

                                    // Normal data row
                                    return (
                                        <TableRow
                                            key={row.id}
                                            className="cursor-pointer group hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                                            onClick={() =>
                                                router.push(`/listings/${row.original.id}`)
                                            }
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell
                                                    key={cell.id}
                                                    className="py-2.5 px-4"
                                                    style={{ width: cell.column.getSize() }}
                                                >
                                                    {cell.getIsGrouped() ||
                                                        cell.getIsPlaceholder()
                                                        ? null
                                                        : flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
