import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationSettingsLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-1.5">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-64" />
            </div>

            {/* Notification preference rows */}
            <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4"
                    >
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-56" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-5 w-10 rounded-full" />
                            <Skeleton className="h-5 w-10 rounded-full" />
                            <Skeleton className="h-5 w-10 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
