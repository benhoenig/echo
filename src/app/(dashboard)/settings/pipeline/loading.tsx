import { Skeleton } from "@/components/ui/skeleton";

export default function PipelineSettingsLoading() {
    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="space-y-1.5">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-72" />
            </div>

            {/* Pipeline stage rows */}
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border"
                    >
                        <Skeleton className="w-4 h-4 shrink-0" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-8 w-16 shrink-0" />
                    </div>
                ))}
            </div>

            <Skeleton className="h-9 w-32" />
        </div>
    );
}
