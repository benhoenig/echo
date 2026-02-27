"use client";

import { useState, useTransition, useEffect } from "react";
import { usePathname } from "next/navigation";
import { addComment } from "@/app/(dashboard)/comments/comment-actions";
import { fetchWorkspaceMentions } from "@/app/(dashboard)/listings/listing-quick-view-actions";
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/types/supabase";
import { MentionsInput, Mention, SuggestionDataItem } from "react-mentions";

type EntityType = Database["public"]["Enums"]["EntityType"];

interface CommentFormProps {
    workspaceId: string;
    entityType: EntityType;
    entityId: string;
    onSuccess?: () => void;
}

export function CommentForm({ workspaceId, entityType, entityId, onSuccess }: CommentFormProps) {
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();

    const [users, setUsers] = useState<SuggestionDataItem[]>([]);
    const [contacts, setContacts] = useState<SuggestionDataItem[]>([]);

    useEffect(() => {
        let mounted = true;
        fetchWorkspaceMentions(workspaceId).then((data) => {
            if (mounted) {
                setUsers(data.users);
                setContacts(data.contacts);
            }
        });
        return () => { mounted = false; };
    }, [workspaceId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) return;

        startTransition(async () => {
            try {
                await addComment(
                    workspaceId,
                    entityType,
                    entityId,
                    content.trim(),
                    pathname, // Pass current URL so Server Action knows what to revalidate
                    [] // Mentions array (stretch goal)
                );
                setContent("");
                toast.success("Comment added");
                onSuccess?.();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to add comment");
            }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Submit on Cmd+Enter or Ctrl+Enter
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4 border-t pt-6">
            <h4 className="text-sm font-semibold tracking-tight">Add a Comment</h4>
            <div className="relative border rounded-md shadow-sm bg-background focus-within:ring-1 focus-within:ring-ring">
                <MentionsInput
                    value={content}
                    onChange={(e, newValue, newPlainTextValue) => setContent(newValue)}
                    placeholder="Type your comment... Use @ to tag users, # to tag contacts"
                    disabled={isPending}
                    className="min-h-[100px] text-sm [&_textarea]:!ring-0 [&_textarea]:focus:!ring-0 [&_textarea]:focus-visible:!ring-0 [&_textarea]:!outline-none [&_textarea]:focus:!outline-none [&_textarea]:focus-visible:!outline-none [&_textarea]:!shadow-none [&_textarea]:focus:!shadow-none [&_textarea]:focus-visible:!shadow-none [&_textarea]:!border-none [&_textarea]:!rounded-md"
                    style={{
                        control: {
                            fontSize: "0.875rem",
                            fontWeight: "normal",
                            lineHeight: "20px"
                        },
                        highlighter: {
                            padding: "12px",
                            paddingBottom: "48px",
                            minHeight: "100px",
                            lineHeight: "20px",
                            border: "none",
                            margin: 0,
                            wordWrap: "break-word"
                        },
                        input: {
                            padding: "12px",
                            outline: "none",
                            border: "none",
                            minHeight: "100px",
                            paddingBottom: "48px",
                            lineHeight: "20px",
                            backgroundColor: "transparent",
                            margin: 0,
                            boxShadow: "none",
                            wordWrap: "break-word"
                        },
                        suggestions: {
                            list: {
                                backgroundColor: "var(--background)",
                                border: "1px solid var(--border)",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.12)", // shadow-lg
                                fontSize: "0.875rem",
                                borderRadius: "12px", // rounded-xl
                                overflow: "hidden",
                                marginTop: "8px",
                                padding: "4px" // p-1
                            },
                            item: {
                                padding: "0",
                            }
                        }
                    }}
                >
                    <Mention
                        trigger="@"
                        data={users}
                        markup="@[__display__](user:__id__)"
                        displayTransform={(id, display) => `@${display}`}
                        style={{ backgroundColor: "rgba(249, 115, 22, 0.15)", borderRadius: "4px" }}
                        renderSuggestion={(suggestion, search, highlightedDisplay, index, focused) => (
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${focused ? "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400" : "text-foreground"}`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${focused ? "bg-orange-200/50" : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"}`}>
                                    {suggestion.display?.charAt(0) || "?"}
                                </div>
                                <span className="font-medium">{highlightedDisplay}</span>
                            </div>
                        )}
                    />
                    <Mention
                        trigger="#"
                        data={contacts}
                        markup="#[__display__](contact:__id__)"
                        displayTransform={(id, display) => `#${display}`}
                        style={{ backgroundColor: "rgba(59, 130, 246, 0.15)", borderRadius: "4px" }}
                        renderSuggestion={(suggestion, search, highlightedDisplay, index, focused) => (
                            <div className={`flex flex-col px-3 py-2 rounded-lg transition-colors ${focused ? "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400" : "text-foreground"}`}>
                                <span className="font-medium">{highlightedDisplay}</span>
                                <span className={`text-[10px] uppercase tracking-wider mt-0.5 ${focused ? "text-orange-600/70 dark:text-orange-400/70" : "text-muted-foreground"}`}>
                                    Contact
                                </span>
                            </div>
                        )}
                    />
                </MentionsInput>
                <div className="absolute bottom-2 right-2">
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!content.trim() || isPending}
                        className="gap-2"
                    >
                        {isPending ? "Sending..." : "Send"}
                        {!isPending && <SendIcon className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
            <p className="text-xs text-muted-foreground">
                Visible to everyone in this workspace. Type <strong>@</strong> to mention users, <strong>#</strong> to tag contacts.
            </p>
        </form>
    );
}
