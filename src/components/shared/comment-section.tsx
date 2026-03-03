import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import { format } from "date-fns";
import type { Database } from "@/types/supabase";
import { CommentForm } from "./comment-form";
import { DeleteCommentButton } from "./delete-comment-button";

type EntityType = Database["public"]["Enums"]["EntityType"];

interface CommentSectionProps {
    workspaceId: string;
    entityType: EntityType;
    entityId: string;
    currentUserAuthId: string | null;
}

function parseCommentContent(text: string) {
    if (!text) return null;
    // Match @[Name](user:UUID), #[Name](contact:UUID), #[Name](listing:UUID)
    const regex = /([@#]\[[^\]]+\]\([^:]+:[^\)]+\))/g;
    const parts = text.split(regex);
    return parts.map((part: string, i: number) => {
        const match = part.match(/^([@#])\[([^\]]+)\]\(([^:]+):[^\)]+\)$/);
        if (match) {
            const trigger = match[1];
            const type = match[3]; // "user", "contact", or "listing"
            const isUser = type === "user";
            const isListing = type === "listing";
            return (
                <span
                    key={i}
                    className={`font-semibold px-1 py-0.5 rounded-sm ${
                        isUser
                            ? "text-orange-600 bg-orange-500/10"
                            : isListing
                              ? "text-emerald-600 bg-emerald-500/10"
                              : "text-blue-600 bg-blue-500/10"
                    }`}
                >
                    {trigger}
                    {match[2]}
                </span>
            );
        }
        return <span key={i}>{part}</span>;
    });
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

                        const isOwn = currentUserAuthId && comment.author_user_id === currentUserAuthId;

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
                                        {isOwn && (
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <DeleteCommentButton commentId={comment.id} />
                                            </div>
                                        )}
                                    </div>
                                    {/* Render with parsed mentions */}
                                    <div className="text-sm text-foreground mt-1 bg-muted/40 p-3 rounded-md whitespace-pre-wrap leading-relaxed shadow-sm">
                                        {parseCommentContent(comment.content)}
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
