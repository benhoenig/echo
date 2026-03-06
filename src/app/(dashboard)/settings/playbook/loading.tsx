import { Skeleton } from "@/components/ui/skeleton";

export default function PlaybookLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-1.5">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-72" />
            </div>

            {/* Module tabs */}
            <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20 rounded-lg" />
                <Skeleton className="h-9 w-20 rounded-lg" />
            </div>

            {/* Playbook cards */}
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-8 w-16 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, j) => (
                            <div key={j} className="space-y-2">
                                <Skeleton className="h-3.5 w-20" />
                                <Skeleton className="h-9 w-full rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
