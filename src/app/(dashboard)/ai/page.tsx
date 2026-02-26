import { Bot } from "lucide-react";

export default function AIPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Bot className="w-12 h-12 text-stone-300 dark:text-stone-600" strokeWidth={1.75} />
            <h2 className="text-sm font-semibold text-foreground mt-4">AI Assistant</h2>
            <p className="text-sm text-muted-foreground mt-1">Coming in Phase 4</p>
        </div>
    );
}
