"use client";

import { useMemo, useState, useTransition } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getGroupedRowModel,
    getExpandedRowModel,
    flexRender,
    type ColumnDef,
    type ColumnFiltersState,
    type GroupingState,
    type SortingState,
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ArrowUpDown,
    MoreHorizontal,
    ChevronRight,
    ChevronDown,
    Archive,
    ArchiveRestore,
    ExternalLink,
    Phone,
    Mail,
} from "lucide-react";
import { updateContactField } from "./contact-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContactRow = any;

const CONTACT_STATUS_COLORS: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    ON_HOLD: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    CLOSED_WON: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    CLOSED_LOST: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    UNQUALIFIED: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
    REACTIVATE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const POTENTIAL_TIER_COLORS: Record<string, string> = {
    A: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    B: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    C: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    D: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
};

const CONTACT_SOURCE_LABELS: Record<string, string> = {
    LINE: "LINE",
    WEBSITE: "Website",
    REFERRAL: "Referral",
    FACEBOOK: "Facebook",
    WALK_IN: "Walk-in",
    COLD_CALL: "Cold Call",
};

function formatContactType(types: string[] | null): string {
    if (!types || types.length === 0) return "—";
    return types.join(", ");
}

function ContactName({ row }: { row: ContactRow }) {
    const name = [row.first_name, row.last_name].filter(Boolean).join(" ");
    const nickname = row.nickname ? `(${row.nickname})` : "";
    return (
        <div className="min-w-0">
            <div className="font-medium text-foreground truncate">
                {name} {nickname}
            </div>
            {row.email && (
                <div className="text-xs text-muted-foreground truncate">
                    {row.email}
                </div>
            )}
        </div>
    );
}

/**
 * Calculate completeness score as a percentage.
 * Core fields (name) = always filled. Check optional fields.
 */
function getCompletenessScore(row: ContactRow): number {
    const fields = [
        row.phone_primary,
        row.email,
        row.line_id,
        row.nationality,
        row.contact_source,
        row.contact_status,
        row.potential_tier,
        row.notes,
    ];
    // Check buyer fields if contact is a buyer
    const isBuyer = (row.contact_type as string[] | null)?.includes("Buyer");
    if (isBuyer) {
        fields.push(
            row.budget_min,
            row.budget_max,
            row.preferred_bedrooms,
            row.timeline,
            row.financing_method
        );
    }
    const filled = fields.filter(
        (v) => v !== null && v !== undefined && v !== ""
    ).length;
    return Math.round((filled / fields.length) * 100);
}

interface ContactsDataTableProps {
    data: ContactRow[];
    columnFilters: ColumnFiltersState;
    onColumnFiltersChange: (filters: ColumnFiltersState) => void;
    grouping: GroupingState;
    showArchived: boolean;
    onRestore: (id: string) => void;
    onArchive: (id: string) => void;
}

export function ContactsDataTable({
    data,
    columnFilters,
    onColumnFiltersChange,
    grouping,
    showArchived,
    onRestore,
    onArchive,
}: ContactsDataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    function handleInlineUpdate(id: string, field: string, value: unknown) {
        startTransition(async () => {
            try {
                await updateContactField(id, field, value);
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to update field."
                );
            }
        });
    }

    const columns = useMemo<ColumnDef<ContactRow>[]>(
        () => [
            {
                accessorKey: "first_name",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 text-xs font-semibold"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Name
                        <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                ),
                cell: ({ row }) => <ContactName row={row.original} />,
                enableGrouping: false,
            },
            {
                id: "contact_type_display",
                accessorFn: (row) => formatContactType(row.contact_type),
                header: "Type",
                cell: ({ row }) => {
                    const types = row.original.contact_type as string[] | null;
                    if (!types?.length) return <span className="text-muted-foreground">—</span>;
                    return (
                        <div className="flex gap-1 flex-wrap">
                            {types.map((t: string) => (
                                <Badge
                                    key={t}
                                    variant="secondary"
                                    className="text-[10px] px-1.5 py-0"
                                >
                                    {t}
                                </Badge>
                            ))}
                        </div>
                    );
                },
                enableGrouping: false,
            },
            {
                accessorKey: "phone_primary",
                header: "Phone",
                cell: ({ getValue }) => {
                    const phone = getValue() as string | null;
                    if (!phone)
                        return (
                            <span className="text-muted-foreground">—</span>
                        );
                    return (
                        <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span className="font-mono text-xs tabular-nums">
                                {phone}
                            </span>
                        </div>
                    );
                },
                enableGrouping: false,
            },
            {
                accessorKey: "contact_status",
                header: "Status",
                cell: ({ row }) => {
                    const status = row.original.contact_status as
                        | string
                        | null;
                    if (!status)
                        return (
                            <span className="text-muted-foreground text-xs">
                                Not set
                            </span>
                        );
                    return (
                        <Badge
                            variant="secondary"
                            className={`text-[10px] px-1.5 py-0 ${CONTACT_STATUS_COLORS[status] ?? ""}`}
                        >
                            {status.replace(/_/g, " ")}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "potential_tier",
                header: "Potential",
                cell: ({ row }) => {
                    const tier = row.original.potential_tier as string | null;
                    if (!tier)
                        return (
                            <span className="text-muted-foreground text-xs">
                                —
                            </span>
                        );
                    return (
                        <Badge
                            variant="secondary"
                            className={`text-[10px] px-2 py-0 ${POTENTIAL_TIER_COLORS[tier] ?? ""}`}
                        >
                            {tier}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "contact_source",
                header: "Source",
                cell: ({ getValue }) => {
                    const source = getValue() as string | null;
                    if (!source)
                        return (
                            <span className="text-muted-foreground text-xs">
                                —
                            </span>
                        );
                    return (
                        <span className="text-xs">
                            {CONTACT_SOURCE_LABELS[source] ?? source}
                        </span>
                    );
                },
            },
            {
                id: "assigned_to",
                accessorFn: (row) => {
                    const user = row.users;
                    if (!user) return null;
                    return [user.first_name, user.last_name]
                        .filter(Boolean)
                        .join(" ");
                },
                header: "Assigned To",
                cell: ({ getValue }) => {
                    const name = getValue() as string | null;
                    if (!name)
                        return (
                            <span className="text-muted-foreground text-xs">
                                Unassigned
                            </span>
                        );
                    return <span className="text-xs">{name}</span>;
                },
                enableGrouping: false,
            },
            {
                id: "completeness",
                accessorFn: (row) => getCompletenessScore(row),
                header: "Score",
                cell: ({ getValue }) => {
                    const score = getValue() as number;
                    const color =
                        score >= 80
                            ? "text-emerald-600"
                            : score >= 50
                              ? "text-amber-600"
                              : "text-red-500";
                    return (
                        <div className="flex items-center gap-1.5">
                            <div className="w-10 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-400"}`}
                                    style={{ width: `${score}%` }}
                                />
                            </div>
                            <span
                                className={`text-[10px] font-mono tabular-nums ${color}`}
                            >
                                {score}%
                            </span>
                        </div>
                    );
                },
                enableGrouping: false,
            },
            {
                accessorKey: "created_at",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 text-xs font-semibold"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Created
                        <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                ),
                cell: ({ getValue }) => {
                    const date = getValue() as string;
                    return (
                        <span className="text-xs text-muted-foreground tabular-nums">
                            {new Date(date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })}
                        </span>
                    );
                },
                enableGrouping: false,
            },
            {
                id: "actions",
                cell: ({ row }) => {
                    const contact = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                >
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/crm/contacts/${contact.id}`}>
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View Details
                                    </Link>
                                </DropdownMenuItem>
                                {contact.phone_primary && (
                                    <DropdownMenuItem asChild>
                                        <a
                                            href={`tel:${contact.phone_primary}`}
                                        >
                                            <Phone className="w-4 h-4 mr-2" />
                                            Call
                                        </a>
                                    </DropdownMenuItem>
                                )}
                                {contact.email && (
                                    <DropdownMenuItem asChild>
                                        <a
                                            href={`mailto:${contact.email}`}
                                        >
                                            <Mail className="w-4 h-4 mr-2" />
                                            Email
                                        </a>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {showArchived ? (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            onRestore(contact.id)
                                        }
                                    >
                                        <ArchiveRestore className="w-4 h-4 mr-2" />
                                        Restore
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            onArchive(contact.id)
                                        }
                                        className="text-red-600"
                                    >
                                        <Archive className="w-4 h-4 mr-2" />
                                        Archive
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
                enableGrouping: false,
            },
        ],
        [showArchived, onRestore, onArchive]
    );

    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnFilters, grouping, expanded: true },
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
                            className="bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800"
                        >
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className="h-10 text-xs font-semibold text-muted-foreground"
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
                                className="h-24 text-center text-muted-foreground"
                            >
                                No contacts match your filters.
                            </TableCell>
                        </TableRow>
                    ) : (
                        table.getRowModel().rows.map((row) => {
                            if (row.getIsGrouped()) {
                                return (
                                    <TableRow
                                        key={row.id}
                                        className="bg-stone-50/50 dark:bg-stone-800/50 cursor-pointer"
                                        onClick={() => row.toggleExpanded()}
                                    >
                                        <TableCell
                                            colSpan={columns.length}
                                            className="py-2"
                                        >
                                            <div className="flex items-center gap-2">
                                                {row.getIsExpanded() ? (
                                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                )}
                                                <span className="text-sm font-medium">
                                                    {String(
                                                        row.groupingValue ??
                                                            "Not set"
                                                    ).replace(/_/g, " ")}
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
                                    className="h-10 border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer"
                                    onClick={() =>
                                        router.push(
                                            `/crm/contacts/${row.original.id}`
                                        )
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="py-2"
                                            onClick={
                                                cell.column.id === "actions"
                                                    ? (e) =>
                                                          e.stopPropagation()
                                                    : undefined
                                            }
                                        >
                                            {flexRender(
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
    );
}
