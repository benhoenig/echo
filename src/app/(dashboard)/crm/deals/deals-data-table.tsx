"use client";

import { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArchiveRestore,
    ChevronDown,
    ChevronRight,
    ArrowUpDown,
} from "lucide-react";
import { useRouter } from "next/navigation";

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

function formatThb(value: number | null): string {
    if (value === null || value === undefined) return "—";
    return `฿${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

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
    const [sorting, setSorting] = useState<SortingState>([]);

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
                },
                filterFn: "equals",
            },
            {
                accessorKey: "deal_status",
                header: "Status",
                cell: ({ row }) => (
                    <Badge
                        className={`text-[10px] px-1.5 py-0 border-0 ${getStatusColor(row.original.deal_status)}`}
                    >
                        {row.original.deal_status?.replace(/_/g, " ")}
                    </Badge>
                ),
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
                cell: ({ row }) => (
                    <span className="font-mono tabular-nums text-sm">
                        {formatThb(row.original.estimated_deal_value)}
                    </span>
                ),
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
                          cell: ({ row }: { row: { original: DealRow } }) => (
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
        [showArchived, onRestore]
    );

    const [expanded, setExpanded] = useState<true | Record<string, boolean>>(
        true
    );

    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnFilters, grouping, expanded },
        onSortingChange: (updater) => {
            const newSorting =
                typeof updater === "function" ? updater(sorting) : updater;
            queueMicrotask(() => setSorting(newSorting));
        },
        onColumnFiltersChange: (updater) => {
            const newFilters: ColumnFiltersState =
                typeof updater === "function"
                    ? updater(columnFilters)
                    : updater;
            queueMicrotask(() => onColumnFiltersChange(newFilters));
        },
        onExpandedChange: (updater) => {
            const newExpanded =
                typeof updater === "function" ? updater(expanded) : updater;
            queueMicrotask(() => setExpanded(newExpanded));
        },
        onGroupingChange: (updater) => {
            // grouping is controlled externally, but we need this handler
            // to prevent TanStack from trying to set state during render
            void updater;
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    });

    return (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
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
                                                    )?.replace(/_/g, " ") ||
                                                        "—"}
                                                </span>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] px-1.5 py-0"
                                                >
                                                    {row.subRows.length}
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
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="py-2"
                                        >
                                            {cell.getIsGrouped() ||
                                            cell.getIsPlaceholder()
                                                ? null
                                                : flexRender(
                                                      cell.column.columnDef
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
    );
}
