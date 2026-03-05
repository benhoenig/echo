"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useNotificationStore } from "@/stores/notification-store";
import {
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "@/app/(dashboard)/notification-actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Bell,
    Clock,
    GitBranch,
    AtSign,
    Sparkles,
    FileWarning,
    CheckCheck,
    BellOff,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/stores/notification-store";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const TYPE_ICONS: Record<string, typeof Clock> = {
    ACTION_REMINDER: Clock,
    STAGE_CHANGE: GitBranch,
    MENTION: AtSign,
    LISTING_EXPIRY: FileWarning,
    SMART_MATCH: Sparkles,
};

const TYPE_COLORS: Record<string, string> = {
    ACTION_REMINDER: "text-amber-500",
    STAGE_CHANGE: "text-blue-500",
    MENTION: "text-orange-500",
    LISTING_EXPIRY: "text-red-500",
    SMART_MATCH: "text-emerald-500",
};

const TYPE_LABELS: Record<string, string> = {
    ACTION_REMINDER: "Reminder",
    STAGE_CHANGE: "Stage Change",
    MENTION: "Mention",
    LISTING_EXPIRY: "Listing Expiry",
    SMART_MATCH: "Smart Match",
};

function NotificationItemRow({
    notification,
    onMarkAsRead,
}: {
    notification: NotificationItem;
    onMarkAsRead: (id: string, actionUrl: string | null) => void;
}) {
    const Icon = TYPE_ICONS[notification.type] || Bell;
    const iconColor = TYPE_COLORS[notification.type] || "text-stone-500";

    return (
        <button
            onClick={() =>
                onMarkAsRead(notification.id, notification.actionUrl)
            }
            className={cn(
                "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors duration-100 hover:bg-stone-50 dark:hover:bg-stone-800",
                !notification.isRead &&
                    "bg-orange-50/50 dark:bg-orange-500/5"
            )}
        >
            <div
                className={cn(
                    "mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                    !notification.isRead
                        ? "bg-stone-100 dark:bg-stone-800"
                        : "bg-stone-50 dark:bg-stone-800/50"
                )}
            >
                <Icon
                    className={cn("w-4 h-4", iconColor)}
                    strokeWidth={1.75}
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            "text-xs font-medium",
                            iconColor
                        )}
                    >
                        {TYPE_LABELS[notification.type] || notification.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true }
                        )}
                    </span>
                </div>
                {notification.title && (
                    <p
                        className={cn(
                            "text-sm mt-0.5 truncate",
                            notification.isRead
                                ? "text-muted-foreground"
                                : "text-foreground font-medium"
                        )}
                    >
                        {notification.title}
                    </p>
                )}
                <p
                    className={cn(
                        "text-xs mt-0.5 line-clamp-2",
                        notification.isRead
                            ? "text-muted-foreground/70"
                            : "text-muted-foreground"
                    )}
                >
                    {notification.message}
                </p>
            </div>

            {!notification.isRead && (
                <div className="mt-2 shrink-0 w-2 h-2 rounded-full bg-orange-500" />
            )}
        </button>
    );
}

export function NotificationPanel() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const [userContext, setUserContext] = useState<{
        userId: string;
        workspaceId: string;
    } | null>(null);

    const notifications = useNotificationStore(
        (state) => state.notifications
    );
    const unreadCount = useNotificationStore((state) => state.unreadCount);
    const markAsReadLocal = useNotificationStore(
        (state) => state.markAsRead
    );
    const markAllAsReadLocal = useNotificationStore(
        (state) => state.markAllAsRead
    );

    // Get user context for mark-all-as-read
    useEffect(() => {
        async function getUser() {
            const supabase = createClient();
            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();
            if (!authUser) return;

            const { data } = await supabase
                .from("users")
                .select("id, workspace_id")
                .eq("id", authUser.id)
                .single();

            if (data) {
                setUserContext({
                    userId: data.id,
                    workspaceId: data.workspace_id,
                });
            }
        }
        getUser();
    }, []);

    const handleMarkAsRead = (id: string, actionUrl: string | null) => {
        // Optimistic update
        markAsReadLocal(id);

        startTransition(async () => {
            await markNotificationAsRead(id);
        });

        if (actionUrl) {
            setOpen(false);
            router.push(actionUrl);
        }
    };

    const handleMarkAllAsRead = () => {
        if (!userContext) return;

        // Optimistic update
        markAllAsReadLocal();

        startTransition(async () => {
            const result = await markAllNotificationsAsRead(
                userContext.workspaceId,
                userContext.userId
            );
            if (result.error) {
                toast.error("Failed to mark all as read");
            }
        });
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground p-2 relative"
                        >
                            <Bell
                                className="w-[18px] h-[18px]"
                                strokeWidth={1.75}
                            />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-orange-500 text-white text-[10px] font-semibold leading-none">
                                    {unreadCount > 99
                                        ? "99+"
                                        : unreadCount}
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
            </Tooltip>

            <PopoverContent
                align="end"
                className="w-96 p-0 rounded-xl shadow-lg"
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-orange-100 text-orange-700 text-xs font-medium dark:bg-orange-500/10 dark:text-orange-400">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            disabled={isPending}
                            className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
                        >
                            <CheckCheck
                                className="w-3.5 h-3.5 mr-1"
                                strokeWidth={1.75}
                            />
                            Mark all read
                        </Button>
                    )}
                </div>

                {/* Notification list */}
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <BellOff
                            className="w-8 h-8 mb-2"
                            strokeWidth={1.5}
                        />
                        <p className="text-sm">No notifications yet</p>
                    </div>
                ) : (
                    <ScrollArea className="max-h-[400px]">
                        <div className="divide-y divide-border">
                            {notifications.map(
                                (notification: NotificationItem) => (
                                    <NotificationItemRow
                                        key={notification.id}
                                        notification={notification}
                                        onMarkAsRead={handleMarkAsRead}
                                    />
                                )
                            )}
                        </div>
                    </ScrollArea>
                )}

                {/* Footer */}
                {notifications.length > 0 && (
                    <>
                        <Separator />
                        <div className="px-4 py-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setOpen(false);
                                    router.push("/settings/notifications");
                                }}
                                className="w-full text-xs text-muted-foreground hover:text-foreground h-7"
                            >
                                Notification settings
                            </Button>
                        </div>
                    </>
                )}
            </PopoverContent>
        </Popover>
    );
}
