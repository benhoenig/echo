import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-4 w-44" />
                </div>
                <Skeleton className="h-9 w-28 rounded-lg" />
            </div>

            {/* Search */}
            <Skeleton className="h-9 max-w-sm rounded-lg" />

            {/* Table */}
            <div className="rounded-xl border border-stone-200 bg-white">
                <div className="flex items-center gap-4 px-4 h-10 bg-stone-50 border-b border-stone-200 rounded-t-xl">
                    {[180, 80, 100, 100, 60, 80, 100].map((w, i) => (
                        <Skeleton key={i} className="h-3" style={{ width: w }} />
                    ))}
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 px-4 h-10 border-b border-stone-100 last:border-0"
                    >
                        {[180, 80, 100, 100, 60, 80, 100].map((w, j) => (
                            <Skeleton key={j} className="h-3.5" style={{ width: w }} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
