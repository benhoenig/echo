import { Skeleton } from "@/components/ui/skeleton";

export default function RemindersLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1.5">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-80" />
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-stone-200 bg-white p-4 flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-7 w-8" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-28 rounded-lg" />
                <Skeleton className="h-9 w-28 rounded-lg" />
                <Skeleton className="h-9 w-24 rounded-lg" />
                <div className="flex-1" />
                <Skeleton className="h-4 w-20" />
            </div>

            {/* Reminder items */}
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-xl border border-stone-200 bg-white p-4 flex items-center gap-4"
                >
                    <Skeleton className="h-5 w-5 rounded" />
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                    <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
            ))}
        </div>
    );
}
