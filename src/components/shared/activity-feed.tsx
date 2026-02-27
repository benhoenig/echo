import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import { format } from "date-fns";
import type { Database } from "@/types/supabase";

type ActionType = Database["public"]["Enums"]["ActionType"];
type EntityType = Database["public"]["Enums"]["EntityType"];

interface ActivityFeedProps {
    workspaceId: string;
    entityType: EntityType;
    entityId: string;
}

const ACTION_DOT_COLORS: Record<ActionType, string> = {
    CREATED: "bg-green-500",
    UPDATED: "bg-blue-500",
    DELETED: "bg-red-500",
    ARCHIVED: "bg-orange-500",
    RESTORED: "bg-teal-500",
    STATUS_CHANGED: "bg-purple-500",
    STAGE_CHANGED: "bg-indigo-500",
    COMMENT_ADDED: "bg-pink-500",
    MENTION: "bg-yellow-500",
    PHOTO_UPLOADED: "bg-cyan-500",
    LOGIN: "bg-slate-500",
    EXPORT: "bg-gray-500",
};

export async function ActivityFeed({ workspaceId, entityType, entityId }: ActivityFeedProps) {
    const supabase = await createClient();

    const { data: logs, error } = await supabase
        .from("activity_logs")
        .select(`
            id,
            action_type,
            description,
            created_at,
            actor_user_id,
            users:actor_user_id (
                first_name,
                last_name,
                profile_photo_url
            )
        `)
        .eq("workspace_id", workspaceId)
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to fetch activity logs:", error);
        return <div className="text-sm text-destructive">Failed to load activity feed.</div>;
    }

    if (!logs || logs.length === 0) {
        return <div className="text-sm text-muted-foreground italic">No activity yet.</div>;
    }

    return (
        <div className="space-y-0">
            {logs.map((log) => {
                const dotColor = ACTION_DOT_COLORS[log.action_type] || "bg-stone-300";

                const user = Array.isArray(log.users) ? log.users[0] : log.users;
                const actorName = user
                    ? `${user.first_name} ${user.last_name || ""}`.trim()
                    : "System";

                return (
                    <div key={log.id} className="flex items-start gap-3 py-2">
                        <span className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 shrink-0`} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-stone-500 dark:text-stone-400">
                                <span className="font-medium text-stone-800 dark:text-stone-100">{actorName}</span>
                                {" "}
                                {log.description}
                            </p>
                            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5" title={format(new Date(log.created_at), "PPpp")}>
                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
