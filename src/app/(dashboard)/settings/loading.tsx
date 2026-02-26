import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceSettingsLoading() {
    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="space-y-1.5">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-4 w-56" />
            </div>

            {/* Form fields */}
            <div className="space-y-4 max-w-2xl">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-9 w-full" />
                </div>
                <Skeleton className="h-9 w-24" />
            </div>
        </div>
    );
}
