import { Skeleton } from "@/components/ui/skeleton";

export default function DealDetailLoading() {
    return (
        <div className="space-y-6">
            {/* Back button + header */}
            <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                        <Skeleton className="h-7 w-48" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-5 w-24 rounded-full" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-20 rounded-lg" />
                        <Skeleton className="h-9 w-9 rounded-lg" />
                    </div>
                </div>
            </div>

            {/* Stage progress bar */}
            <div className="flex items-center gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-2 flex-1 rounded-full" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {Array.from({ length: 3 }).map((_, section) => (
                        <div key={section} className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
                            <Skeleton className="h-5 w-36" />
                            <div className="grid grid-cols-2 gap-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-3.5 w-24" />
                                        <Skeleton className="h-9 w-full rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Suggested Actions */}
                    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
                        <Skeleton className="h-5 w-36" />
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-2">
                                <Skeleton className="h-4 w-4 rounded" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        ))}
                    </div>

                    {/* Comments */}
                    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-20 w-full rounded-lg" />
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-3.5 w-24" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Activity */}
                    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
                        <Skeleton className="h-5 w-28" />
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="h-2 w-2 rounded-full mt-2 shrink-0" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-3.5 w-full" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
