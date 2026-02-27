import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import { format } from "date-fns";
import type { Database } from "@/types/supabase";
import { Trash2 } from "lucide-react";
import { CommentForm } from "./comment-form";

type EntityType = Database["public"]["Enums"]["EntityType"];

interface CommentSectionProps {
    workspaceId: string;
    entityType: EntityType;
    entityId: string;
    currentUserAuthId: string;
}

export async function CommentSection({
    workspaceId,
    entityType,
    entityId,
    currentUserAuthId,
}: CommentSectionProps) {
    const supabase = await createClient();

    const { data: comments, error } = await supabase
        .from("comments")
        .select(`
            id,
            content,
            created_at,
            is_deleted,
            author_user_id,
            users:author_user_id (
                first_name,
                last_name,
                profile_photo_url
            )
        `)
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Failed to load comments:", error);
        return <div className="text-sm text-destructive">Failed to load comments.</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Display existing comments */}
            <div className="space-y-4">
                {!comments || comments.length === 0 ? (
                    <div className="text-sm text-muted-foreground italic">No comments yet. Be the first!</div>
                ) : (
                    comments.map((comment) => {
                        const user = Array.isArray(comment.users) ? comment.users[0] : comment.users;
                        const authorName = user
                            ? `${user.first_name} ${user.last_name || ""}`.trim()
                            : "Unknown User";

                        // Extract initials
                        const initials = user
                            ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
                            : "??";

                        // Handle deleted state visually
                        if (comment.is_deleted) {
                            return (
                                <div key={comment.id} className="flex gap-4">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                                        {initials}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium leading-none">{authorName}</p>
                                            <p className="text-xs text-muted-foreground" title={format(new Date(comment.created_at), "PPpp")}>
                                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <div className="text-sm italic text-muted-foreground mt-1 rounded-md bg-muted/50 p-3">
                                            This comment was deleted.
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={comment.id} className="flex gap-4 group">
                                {/* Avatar Fallback equivalent */}
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                                    {initials}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium leading-none">{authorName}</p>
                                            <p className="text-xs text-muted-foreground" title={format(new Date(comment.created_at), "PPpp")}>
                                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* We only render the delete logic in CommentForm or we pass it via client logic */}
                                        </div>
                                    </div>
                                    {/* Preserving whitespace and line breaks natively with whitespace-pre-wrap */}
                                    <div className="text-sm text-foreground mt-1 bg-muted/40 p-3 rounded-md whitespace-pre-wrap leading-relaxed shadow-sm">
                                        {comment.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Render the unified input form to type comments */}
            <CommentForm
                workspaceId={workspaceId}
                entityType={entityType}
                entityId={entityId}
            />
        </div>
    );
}
