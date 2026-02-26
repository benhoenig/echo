"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    NEW: {
        label: "New",
        className: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700",
    },
    ACTIVE: {
        label: "Active",
        className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
    },
    RESERVED: {
        label: "Reserved",
        className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
    },
    SOLD: {
        label: "Sold",
        className: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
    },
    EXPIRED: {
        label: "Expired",
        className: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/30",
    },
    WITHDRAWN: {
        label: "Withdrawn",
        className: "bg-stone-50 text-stone-500 dark:bg-stone-800 dark:text-stone-500 border-stone-200 dark:border-stone-700",
    },
};

export function ListingStatusBadge({ status }: { status: string }) {
    const config = STATUS_CONFIG[status] ?? {
        label: status,
        className: "bg-stone-100 text-stone-500",
    };

    return (
        <Badge
            variant="outline"
            className={cn("text-[11px] font-medium px-2 py-0.5", config.className)}
        >
            {config.label}
        </Badge>
    );
}

export const LISTING_STATUSES = Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({
    value,
    label,
}));

/** Terminal statuses that warrant a confirmation warning */
export const TERMINAL_STATUSES = ["SOLD", "EXPIRED", "WITHDRAWN"];
