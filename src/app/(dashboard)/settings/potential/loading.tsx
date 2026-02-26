import { Skeleton } from "@/components/ui/skeleton";

export default function PotentialSettingsLoading() {
    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="space-y-1.5">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-80" />
            </div>

            {/* Potential tier rows (A/B/C/D) */}
            <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border"
                    >
                        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                        <Skeleton className="h-8 w-20 shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}
