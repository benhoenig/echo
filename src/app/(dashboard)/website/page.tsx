import { Globe } from "lucide-react";

export default function WebsitePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Globe className="w-12 h-12 text-stone-300 dark:text-stone-600" strokeWidth={1.75} />
            <h2 className="text-sm font-semibold text-foreground mt-4">Website Builder</h2>
            <p className="text-sm text-muted-foreground mt-1">Coming in Phase 3</p>
        </div>
    );
}
