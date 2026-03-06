import { Skeleton } from "@/components/ui/skeleton";

export default function IntegrationsLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-1.5">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-4 w-56" />
            </div>

            {/* Integration cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="flex-1 space-y-1">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
