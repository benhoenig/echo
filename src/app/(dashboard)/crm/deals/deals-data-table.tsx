"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    ArchiveRestore,
    ChevronDown,
    ChevronRight,
    ArrowUpDown,
    Columns3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateDealField } from "./deal-actions";

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

interface DealsDataTableProps {
    data: DealRow[];
    columnFilters: ColumnFiltersState;
    onColumnFiltersChange: (filters: ColumnFiltersState) => void;
    grouping: GroupingState;
    showArchived: boolean;
    onRestore: (id: string) => void;
    pipelineStages: PipelineStage[];
}

function getContactName(contactData: DealRow | null): string {
    if (!contactData) return "—";
    return (
        contactData.nickname ||
        [contactData.first_name, contactData.last_name]
            .filter(Boolean)
            .join(" ") ||
        "Unknown"
    );
}

function getStatusColor(status: string): string {
    switch (status) {
        case "ACTIVE":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        case "ON_HOLD":
            return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
        case "CLOSED_WON":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        case "CLOSED_LOST":
            return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
        default:
            return "bg-stone-100 text-stone-700";
    }
}

const TIER_COLORS: Record<string, string> = {
    A: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    B: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    C: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    D: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
};

const STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Active" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "CLOSED_WON", label: "Closed Won" },
    { value: "CLOSED_LOST", label: "Closed Lost" },
];

const TIER_OPTIONS = [
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "C", label: "C" },
    { value: "D", label: "D" },
];

function formatThb(value: number | null): string {
    if (value === null || value === undefined) return "—";
    return `฿${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

// ── Inline Editable Cell Components ──────────────────────────

function InlineNumberCell({
    value,
    dealId,
    field,
    prefix = "",
    format = false,
}: {
    value: number | null;
    dealId: string;
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
            await updateDealField(dealId, field, newVal);
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
                className="h-7 w-24 text-xs"
                autoFocus
            />
        );
    }

    return (
        <span
            className="cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800 px-1.5 py-0.5 rounded text-xs font-mono tabular-nums"
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
    dealId,
    field,
    options,
    renderValue,
}: {
    value: string | null;
    dealId: string;
    field: string;
    options: { value: string; label: string }[];
    renderValue: (val: string | null) => React.ReactNode;
}) {
    const [editing, setEditing] = useState(false);

    async function handleChange(newVal: string) {
        setEditing(false);
        if (newVal === value) return;
        try {
            await updateDealField(dealId, field, newVal);
        } catch {
            toast.error("Failed to update.");
        }
    }

    if (editing) {
        return (
            <Select
                defaultValue={value ?? undefined}
                onValueChange={handleChange}
                defaultOpen
                onOpenChange={(open) => {
                    if (!open) setEditing(false);
                }}
            >
                <SelectTrigger className="h-7 w-28 text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
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

// ── Status Cell with Closed-Lost Dialog ──────────────────────

function StatusSelectCell({
    value,
    dealId,
}: {
    value: string;
    dealId: string;
}) {
    const [editing, setEditing] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);
    const [closedLostReason, setClosedLostReason] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    function handleChange(newVal: string) {
        setEditing(false);
        if (newVal === value) return;

        if (newVal === "CLOSED_LOST") {
            setPendingStatus(newVal);
            setClosedLostReason("");
            setDialogOpen(true);
        } else {
            doUpdate(newVal);
        }
    }

    async function doUpdate(status: string, reason?: string) {
        setIsPending(true);
        try {
            await updateDealField(dealId, "deal_status", status);
            if (reason) {
                await updateDealField(dealId, "closed_lost_reason", reason);
            }
            toast.success(`Status changed to ${status.replace(/_/g, " ")}`);
        } catch {
            toast.error("Failed to update status.");
        } finally {
            setIsPending(false);
            setDialogOpen(false);
            setPendingStatus(null);
        }
    }

    async function confirmClosedLost() {
        if (!closedLostReason.trim()) {
            toast.error("Please provide a reason for closing as lost.");
            return;
        }
        await doUpdate("CLOSED_LOST", closedLostReason);
    }

    return (
        <>
            {editing ? (
                <Select
                    defaultValue={value}
                    onValueChange={handleChange}
                    defaultOpen
                    onOpenChange={(open) => {
                        if (!open) setEditing(false);
                    }}
                >
                    <SelectTrigger className="h-7 w-28 text-xs">
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
            ) : (
                <span
                    className="cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        setEditing(true);
                    }}
                >
                    <Badge
                        className={`text-[10px] px-1.5 py-0 border-0 ${getStatusColor(value)}`}
                    >
                        {value?.replace(/_/g, " ")}
                    </Badge>
                </span>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Close Deal as Lost</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for marking this deal as
                            lost. This is required.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="e.g., Buyer found another property, budget changed..."
                        value={closedLostReason}
                        onChange={(e) => setClosedLostReason(e.target.value)}
                        className="min-h-[80px]"
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setDialogOpen(false);
                                setPendingStatus(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={confirmClosedLost}
                            disabled={isPending || !closedLostReason.trim()}
                        >
                            {isPending ? "Saving..." : "Mark as Lost"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// ── Stage Select Cell ────────────────────────────────────────

function StageSelectCell({
    dealId,
    currentStageId,
    stageName,
    stageColor,
    pipelineStages,
    dealType,
}: {
    dealId: string;
    currentStageId: string;
    stageName: string;
    stageColor: string;
    pipelineStages: PipelineStage[];
    dealType: string;
}) {
    const [editing, setEditing] = useState(false);

    const relevantStages = pipelineStages.filter((s) => {
        if (dealType === "BUY_SIDE") return s.pipelineType === "BUYER";
        if (dealType === "SELL_SIDE") return s.pipelineType === "SELLER";
        return true;
    });

    async function handleChange(newStageId: string) {
        setEditing(false);
        if (newStageId === currentStageId) return;
        try {
            await updateDealField(dealId, "pipeline_stage_id", newStageId);
            toast.success("Pipeline stage updated.");
        } catch {
            toast.error("Failed to update stage.");
        }
    }

    if (editing) {
        return (
            <Select
                defaultValue={currentStageId}
                onValueChange={handleChange}
                defaultOpen
                onOpenChange={(open) => {
                    if (!open) setEditing(false);
                }}
            >
                <SelectTrigger className="h-7 w-36 text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {relevantStages.map((s) => (
                        <SelectItem
                            key={s.id}
                            value={s.id}
                            className="text-xs"
                        >
                            {s.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }

    const color = stageColor || "#78716c";
    return (
        <span
            className="cursor-pointer"
            onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
            }}
        >
            <Badge
                className="text-[10px] px-2 py-0.5 border-0"
                style={{
                    backgroundColor: `${color}20`,
                    color: color,
                }}
            >
                {stageName}
            </Badge>
        </span>
    );
}

// ── Main Data Table ──────────────────────────────────────────

export function DealsDataTable({
    data,
    columnFilters,
    onColumnFiltersChange,
    grouping,
    showArchived,
    onRestore,
    pipelineStages,
}: DealsDataTableProps) {
    const router = useRouter();
    const mountedRef = useRef(false);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    );

    const columns: ColumnDef<DealRow>[] = useMemo(
        () => [
            {
                accessorKey: "deal_name",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3 text-xs font-medium"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Deal Name
                        <ArrowUpDown className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <span className="font-medium text-sm">
                        {row.original.deal_name || "Untitled Deal"}
                    </span>
                ),
                enableHiding: false,
            },
            {
                accessorKey: "deal_type",
                header: "Type",
                cell: ({ row }) => (
                    <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                    >
                        {row.original.deal_type === "BUY_SIDE"
                            ? "Buy"
                            : "Sell"}
                    </Badge>
                ),
            },
            {
                id: "contact_name",
                header: "Contact",
                cell: ({ row }) => {
                    const buyer = row.original.buyer_contact;
                    const seller = row.original.seller_contact;
                    const contact =
                        row.original.deal_type === "BUY_SIDE" ? buyer : seller;
                    return (
                        <span className="text-sm">
                            {getContactName(contact)}
                        </span>
                    );
                },
            },
            {
                id: "stage_name",
                accessorFn: (row: DealRow) =>
                    row.pipeline_stages?.pipeline_stage_name ?? "—",
                header: "Stage",
                cell: ({ row }) => {
                    const stage = row.original.pipeline_stages;
                    if (!stage) return <span className="text-sm">—</span>;
                    if (showArchived) {
                        const color = stage.stage_color || "#78716c";
                        return (
                            <Badge
                                className="text-[10px] px-2 py-0.5 border-0"
                                style={{
                                    backgroundColor: `${color}20`,
                                    color: color,
                                }}
                            >
                                {stage.pipeline_stage_name}
                            </Badge>
                        );
                    }
                    return (
                        <StageSelectCell
                            dealId={row.original.id}
                            currentStageId={stage.id}
                            stageName={stage.pipeline_stage_name}
                            stageColor={stage.stage_color || "#78716c"}
                            pipelineStages={pipelineStages}
                            dealType={row.original.deal_type}
                        />
                    );
                },
                filterFn: "equals",
            },
            {
                accessorKey: "deal_status",
                header: "Status",
                cell: ({ row }) => {
                    if (showArchived) {
                        return (
                            <Badge
                                className={`text-[10px] px-1.5 py-0 border-0 ${getStatusColor(row.original.deal_status)}`}
                            >
                                {row.original.deal_status?.replace(/_/g, " ")}
                            </Badge>
                        );
                    }
                    return (
                        <StatusSelectCell
                            value={row.original.deal_status}
                            dealId={row.original.id}
                        />
                    );
                },
                filterFn: "equals",
            },
            {
                id: "potential_display",
                accessorFn: (row: DealRow) => row.potential_tier ?? "—",
                header: "Tier",
                cell: ({ row }) => {
                    const tier = row.original.potential_tier;
                    if (showArchived) {
                        if (!tier)
                            return (
                                <span className="text-xs text-muted-foreground">
                                    —
                                </span>
                            );
                        return (
                            <Badge
                                className={`text-[10px] px-1.5 py-0 border-0 ${TIER_COLORS[tier] ?? ""}`}
                            >
                                {tier}
                            </Badge>
                        );
                    }
                    return (
                        <InlineSelectCell
                            value={tier}
                            dealId={row.original.id}
                            field="potential_tier"
                            options={TIER_OPTIONS}
                            renderValue={(val) =>
                                val ? (
                                    <Badge
                                        className={`text-[10px] px-1.5 py-0 border-0 ${TIER_COLORS[val] ?? ""}`}
                                    >
                                        {val}
                                    </Badge>
                                ) : (
                                    <span className="text-xs text-muted-foreground hover:bg-stone-100 dark:hover:bg-stone-800 px-1.5 py-0.5 rounded">
                                        —
                                    </span>
                                )
                            }
                        />
                    );
                },
                filterFn: "equals",
            },
            {
                accessorKey: "estimated_deal_value",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3 text-xs font-medium"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Value
                        <ArrowUpDown className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                ),
                cell: ({ row }) => {
                    if (showArchived) {
                        return (
                            <span className="font-mono tabular-nums text-sm">
                                {formatThb(
                                    row.original.estimated_deal_value
                                )}
                            </span>
                        );
                    }
                    return (
                        <InlineNumberCell
                            value={row.original.estimated_deal_value}
                            dealId={row.original.id}
                            field="estimated_deal_value"
                            prefix="฿"
                            format
                        />
                    );
                },
            },
            {
                id: "assigned_to_display",
                accessorFn: (row: DealRow) => {
                    const u = row.assigned_user;
                    if (!u) return "Unassigned";
                    return (
                        [u.first_name, u.last_name].filter(Boolean).join(" ") ||
                        "Unknown"
                    );
                },
                header: "Assigned To",
                cell: ({ getValue }) => (
                    <span className="text-sm text-muted-foreground">
                        {getValue() as string}
                    </span>
                ),
            },
            {
                accessorKey: "created_at",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3 text-xs font-medium"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Created
                        <ArrowUpDown className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {new Date(row.original.created_at).toLocaleDateString()}
                    </span>
                ),
            },
            ...(showArchived
                ? [
                      {
                          id: "actions",
                          header: "",
                          cell: ({
                              row,
                          }: {
                              row: { original: DealRow };
                          }) => (
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      onRestore(row.original.id);
                                  }}
                              >
                                  <ArchiveRestore className="w-3.5 h-3.5 mr-1" />
                                  Restore
                              </Button>
                          ),
                      } as ColumnDef<DealRow>,
                  ]
                : []),
        ],
        [showArchived, onRestore, pipelineStages]
    );

    const [expanded, setExpanded] = useState<true | Record<string, boolean>>(
        true
    );

    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnFilters, grouping, expanded, columnVisibility },
        onSortingChange: (updater) => {
            const newSorting =
                typeof updater === "function" ? updater(sorting) : updater;
            queueMicrotask(() => { if (mountedRef.current) setSorting(newSorting); });
        },
        onColumnFiltersChange: (updater) => {
            const newFilters: ColumnFiltersState =
                typeof updater === "function"
                    ? updater(columnFilters)
                    : updater;
            queueMicrotask(() => { if (mountedRef.current) onColumnFiltersChange(newFilters); });
        },
        onExpandedChange: (updater) => {
            const newExpanded =
                typeof updater === "function" ? updater(expanded) : updater;
            queueMicrotask(() => { if (mountedRef.current) setExpanded(newExpanded); });
        },
        onGroupingChange: (updater) => {
            void updater;
        },
        onColumnVisibilityChange: (updater) => {
            const newVis =
                typeof updater === "function"
                    ? updater(columnVisibility)
                    : updater;
            queueMicrotask(() => { if (mountedRef.current) setColumnVisibility(newVis); });
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    });

    return (
        <div className="space-y-2">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                    {columnFilters.length > 0
                        ? `Showing ${table.getFilteredRowModel().rows.length} of ${data.length} deals`
                        : `${data.length} deals`}
                </p>

                {/* Column visibility toggle */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                        >
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
                                    onCheckedChange={(v) =>
                                        col.toggleVisibility(!!v)
                                    }
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
                                    className="bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-50 dark:hover:bg-stone-800/50"
                                >
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className="h-10 text-xs font-medium text-muted-foreground"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
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
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center text-sm text-muted-foreground"
                                    >
                                        No deals match your filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map((row) => {
                                    if (row.getIsGrouped()) {
                                        return (
                                            <TableRow
                                                key={row.id}
                                                className="bg-stone-50/50 dark:bg-stone-800/30 hover:bg-stone-100/50 cursor-pointer"
                                                onClick={row.getToggleExpandedHandler()}
                                            >
                                                <TableCell
                                                    colSpan={columns.length}
                                                    className="py-2"
                                                >
                                                    <div className="flex items-center gap-2 text-sm font-medium">
                                                        {row.getIsExpanded() ? (
                                                            <ChevronDown className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4" />
                                                        )}
                                                        <span>
                                                            {String(
                                                                row.groupingValue
                                                            )?.replace(
                                                                /_/g,
                                                                " "
                                                            ) || "—"}
                                                        </span>
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-[10px] px-1.5 py-0"
                                                        >
                                                            {
                                                                row.subRows
                                                                    .length
                                                            }
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }

                                    return (
                                        <TableRow
                                            key={row.id}
                                            className="h-10 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                                            onClick={() =>
                                                router.push(
                                                    `/crm/deals/${row.original.id}`
                                                )
                                            }
                                        >
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <TableCell
                                                        key={cell.id}
                                                        className="py-2"
                                                    >
                                                        {cell.getIsGrouped() ||
                                                        cell.getIsPlaceholder()
                                                            ? null
                                                            : flexRender(
                                                                  cell.column
                                                                      .columnDef
                                                                      .cell,
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
