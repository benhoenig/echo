import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailLoading() {
    return (
        <div className="space-y-6">
            {/* Back button + header */}
            <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                        <Skeleton className="h-7 w-56" />
                        <Skeleton className="h-4 w-36" />
                    </div>
                    <Skeleton className="h-9 w-20 rounded-lg" />
                </div>
            </div>

            {/* Form sections */}
            {Array.from({ length: 2 }).map((_, section) => (
                <div key={section} className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
                    <Skeleton className="h-5 w-36" />
                    <div className="grid grid-cols-2 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-3.5 w-24" />
                                <Skeleton className="h-9 w-full rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
