"use client";

import { useTransition } from "react";
import { usePathname } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteComment } from "@/app/(dashboard)/comments/comment-actions";
import { toast } from "sonner";

export function DeleteCommentButton({ commentId }: { commentId: string }) {
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();

    function handleDelete() {
        startTransition(async () => {
            try {
                await deleteComment(commentId, pathname);
                toast.success("Comment deleted.");
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to delete comment."
                );
            }
        });
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleDelete}
            disabled={isPending}
        >
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors" />
        </Button>
    );
}
