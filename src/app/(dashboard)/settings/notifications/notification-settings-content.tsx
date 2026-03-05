"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Clock,
    GitBranch,
    AtSign,
    Sparkles,
    FileWarning,
} from "lucide-react";
import { toast } from "sonner";
import {
    updateNotificationPreference,
    type NotificationPref,
} from "./notification-pref-actions";

const NOTIFICATION_TYPE_META: Record<
    string,
    { label: string; description: string; icon: typeof Clock }
> = {
    ACTION_REMINDER: {
        label: "Action Reminders",
        description:
            "Follow-up reminders when deals or listings are overdue based on potential tier intervals.",
        icon: Clock,
    },
    STAGE_CHANGE: {
        label: "Stage Changes",
        description:
            "Alerts when a deal you're assigned to moves to a new pipeline stage.",
        icon: GitBranch,
    },
    MENTION: {
        label: "Mentions",
        description:
            "Notifications when someone @mentions you in a comment.",
        icon: AtSign,
    },
    LISTING_EXPIRY: {
        label: "Listing Expiry",
        description:
            "Alerts for listing-related milestones such as exclusive agreement expiry.",
        icon: FileWarning,
    },
    SMART_MATCH: {
        label: "Smart Matches",
        description:
            "Notifications when a new listing matches a buyer's requirements.",
        icon: Sparkles,
    },
};

interface NotificationSettingsContentProps {
    initialPreferences: NotificationPref[];
    workspaceId: string;
    userId: string;
}

export function NotificationSettingsContent({
    initialPreferences,
    workspaceId,
    userId,
}: NotificationSettingsContentProps) {
    const [preferences, setPreferences] =
        useState<NotificationPref[]>(initialPreferences);
    const [isPending, startTransition] = useTransition();

    const handleToggle = (
        notificationType: string,
        channel: "in_app" | "email",
        enabled: boolean
    ) => {
        // Optimistic update
        setPreferences((prev) =>
            prev.map((p) =>
                p.notificationType === notificationType
                    ? {
                          ...p,
                          [channel === "in_app" ? "inApp" : "email"]:
                              enabled,
                      }
                    : p
            )
        );

        startTransition(async () => {
            const result = await updateNotificationPreference(
                workspaceId,
                userId,
                notificationType,
                channel,
                enabled
            );
            if (result.error) {
                // Revert on error
                setPreferences((prev) =>
                    prev.map((p) =>
                        p.notificationType === notificationType
                            ? {
                                  ...p,
                                  [channel === "in_app" ? "inApp" : "email"]:
                                      !enabled,
                              }
                            : p
                    )
                );
                toast.error("Failed to update preference");
            }
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Notification Preferences
                    </CardTitle>
                    <CardDescription>
                        Choose which notifications you receive and how
                        they're delivered.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Column headers */}
                    <div className="flex items-center gap-4 pb-3 mb-1 border-b border-border">
                        <div className="flex-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Notification Type
                        </div>
                        <div className="w-16 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            In-App
                        </div>
                        <div className="w-16 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Email
                        </div>
                    </div>

                    {/* Preference rows */}
                    <div className="divide-y divide-border">
                        {preferences.map((pref) => {
                            const meta =
                                NOTIFICATION_TYPE_META[pref.notificationType];
                            if (!meta) return null;

                            const Icon = meta.icon;

                            return (
                                <div
                                    key={pref.notificationType}
                                    className="flex items-center gap-4 py-4"
                                >
                                    <div className="flex-1 flex items-start gap-3">
                                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
                                            <Icon
                                                className="w-4 h-4 text-stone-600 dark:text-stone-400"
                                                strokeWidth={1.75}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {meta.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {meta.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-16 flex justify-center">
                                        <Switch
                                            checked={pref.inApp}
                                            onCheckedChange={(checked: boolean) =>
                                                handleToggle(
                                                    pref.notificationType,
                                                    "in_app",
                                                    checked
                                                )
                                            }
                                            disabled={isPending}
                                        />
                                    </div>
                                    <div className="w-16 flex justify-center">
                                        <Switch
                                            checked={pref.email}
                                            onCheckedChange={(checked: boolean) =>
                                                handleToggle(
                                                    pref.notificationType,
                                                    "email",
                                                    checked
                                                )
                                            }
                                            disabled={isPending}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
