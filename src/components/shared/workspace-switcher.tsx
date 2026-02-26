"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, Settings } from "lucide-react";
import { getActiveWorkspaceContext } from "@/app/(dashboard)/actions";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkspaceContext {
    user: { id: string; first_name: string; last_name: string; email: string };
    workspace: { id: string; workspace_name: string; primary_color: string | null; plan_tier: string };
}

export function WorkspaceSwitcher({ isCollapsed }: { isCollapsed: boolean }) {
    const router = useRouter();
    const [context, setContext] = useState<WorkspaceContext | null>(null);
    const { workspaceName, setWorkspaceName } = useWorkspaceStore();

    useEffect(() => {
        getActiveWorkspaceContext().then((data) => {
            if (data) {
                setContext(data as unknown as WorkspaceContext);
                setWorkspaceName(data.workspace.workspace_name);
            }
        });
    }, []);

    if (!context) {
        // Loading state
        return (
            <div
                className={cn(
                    "flex items-center gap-3 bg-stone-800/50 rounded-lg p-2 animate-pulse",
                    isCollapsed && "justify-center"
                )}
            >
                <div className="w-8 h-8 rounded-lg bg-stone-700 shrink-0" />
                {!isCollapsed && (
                    <div className="min-w-0 flex-1 space-y-1">
                        <div className="h-3.5 bg-stone-700 rounded w-20" />
                        <div className="h-2.5 bg-stone-700 rounded w-12" />
                    </div>
                )}
            </div>
        );
    }

    const { workspace } = context;
    const displayName = workspaceName ?? workspace.workspace_name;
    const initial = displayName.charAt(0).toUpperCase();
    const brandColor = workspace.primary_color || "#F97316"; // fallback orange

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="w-full focus:outline-none">
                <div
                    className={cn(
                        "flex items-center gap-3 bg-stone-800/50 hover:bg-stone-800 transition-colors rounded-lg p-2 text-left cursor-pointer",
                        isCollapsed && "justify-center"
                    )}
                >
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: brandColor }}
                    >
                        {initial}
                    </div>
                    {!isCollapsed && (
                        <>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-white truncate">
                                    {displayName}
                                </p>
                                <p className="text-[11px] text-stone-500 truncate capitalize">
                                    {workspace.plan_tier.toLowerCase()} Plan
                                </p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                        </>
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                side={isCollapsed ? "right" : "bottom"}
                className="w-56"
            >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Workspaces
                </DropdownMenuLabel>
                <DropdownMenuItem className="gap-2 cursor-default bg-muted/50">
                    <div
                        className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-[10px] shrink-0"
                        style={{ backgroundColor: brandColor }}
                    >
                        {initial}
                    </div>
                    <span className="truncate flex-1 font-medium">{displayName}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                    className="cursor-pointer"
                >
                    <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
                    Workspace Settings
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="cursor-not-allowed">
                    <Plus className="w-4 h-4 mr-2 text-muted-foreground" />
                    Create New Workspace
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
