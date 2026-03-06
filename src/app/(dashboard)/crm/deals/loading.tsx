import { Skeleton } from "@/components/ui/skeleton";

export default function DealsLoading() {
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
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-4 w-36" />
                </div>
                <Skeleton className="h-9 w-28 rounded-lg" />
            </div>

            {/* Deal type tabs */}
            <div className="flex items-center gap-1">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-20 rounded-lg" />
            </div>

            {/* Search + view toggle */}
            <div className="flex items-center gap-3">
                <Skeleton className="h-9 flex-1 max-w-sm rounded-lg" />
                <Skeleton className="h-9 w-20 rounded-lg" />
            </div>

            {/* Kanban columns */}
            <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="min-w-[260px] flex-1 space-y-3">
                        {/* Column header */}
                        <div className="flex items-center justify-between px-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-5 w-6 rounded-full" />
                        </div>
                        {/* Cards */}
                        {Array.from({ length: i < 3 ? 3 : 1 }).map((_, j) => (
                            <div
                                key={j}
                                className="rounded-xl border border-stone-200 bg-white p-3 space-y-2"
                            >
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                    <Skeleton className="h-5 w-12 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
