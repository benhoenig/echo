"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const GRADE_CONFIG: Record<string, { label: string; className: string }> = {
    A: {
        label: "A",
        className: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/30",
    },
    B: {
        label: "B",
        className: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/30",
    },
    C: {
        label: "C",
        className: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
    },
    D: {
        label: "D",
        className: "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-500 border-stone-200 dark:border-stone-700",
    },
};

export function ListingGradeBadge({ grade }: { grade: string | null }) {
    if (!grade) return <span className="text-xs text-muted-foreground">—</span>;

    const config = GRADE_CONFIG[grade] ?? {
        label: grade,
        className: "bg-stone-100 text-stone-500",
    };

    return (
        <Badge
            variant="outline"
            className={cn("text-[11px] font-semibold px-1.5 py-0 min-w-[22px] justify-center", config.className)}
        >
            {config.label}
        </Badge>
    );
}

export const LISTING_GRADES = Object.entries(GRADE_CONFIG).map(([value, { label }]) => ({
    value,
    label,
}));
