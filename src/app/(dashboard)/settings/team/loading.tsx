import { Skeleton } from "@/components/ui/skeleton";

export default function TeamSettingsLoading() {
    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="space-y-1.5">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-56" />
            </div>

            {/* Invite button area */}
            <Skeleton className="h-9 w-32" />

            {/* Team member rows */}
            <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border"
                    >
                        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-5 w-14 rounded-full shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}
