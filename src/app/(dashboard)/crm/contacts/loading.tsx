import { Skeleton } from "@/components/ui/skeleton";

export default function ContactsLoading() {
    return (
        <div className="space-y-4">
            {/* CRM Sub-nav */}
            <div className="flex items-center gap-1 border-b border-stone-200 pb-2">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-9 w-32 rounded-lg" />
            </div>

            {/* Search + controls */}
            <div className="flex items-center gap-3">
                <Skeleton className="h-9 flex-1 max-w-sm rounded-lg" />
                <Skeleton className="h-9 w-32 rounded-lg" />
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-24 rounded-lg" />
                ))}
            </div>

            {/* Table */}
            <div className="rounded-xl border border-stone-200 bg-white">
                <div className="flex items-center gap-4 px-4 h-10 bg-stone-50 border-b border-stone-200 rounded-t-xl">
                    {[120, 160, 120, 100, 80, 80].map((w, i) => (
                        <Skeleton key={i} className="h-3" style={{ width: w }} />
                    ))}
                </div>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 px-4 h-10 border-b border-stone-100 last:border-0"
                    >
                        {[120, 160, 120, 100, 80, 80].map((w, j) => (
                            <Skeleton key={j} className="h-3.5" style={{ width: w }} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
