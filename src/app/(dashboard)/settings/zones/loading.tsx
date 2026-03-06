import { Skeleton } from "@/components/ui/skeleton";

export default function ZonesLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-1.5">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-64" />
            </div>

            <div className="rounded-xl border border-stone-200 bg-white">
                <div className="flex items-center gap-4 px-4 h-10 bg-stone-50 border-b border-stone-200 rounded-t-xl">
                    {[160, 160, 120].map((w, i) => (
                        <Skeleton key={i} className="h-3" style={{ width: w }} />
                    ))}
                </div>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 px-4 h-10 border-b border-stone-100 last:border-0"
                    >
                        {[160, 160, 120].map((w, j) => (
                            <Skeleton key={j} className="h-3.5" style={{ width: w }} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
