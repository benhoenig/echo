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
import { useTranslations } from "next-intl";
import {
    updateNotificationPreference,
    type NotificationPref,
} from "./notification-pref-actions";

const NOTIFICATION_TYPE_ICONS: Record<string, typeof Clock> = {
    ACTION_REMINDER: Clock,
    STAGE_CHANGE: GitBranch,
    MENTION: AtSign,
    LISTING_EXPIRY: FileWarning,
    SMART_MATCH: Sparkles,
};

type NotificationSettingsKey = "actionReminders" | "stageChanges" | "mentions" | "listingExpiry" | "smartMatches" | "actionRemindersDesc" | "stageChangesDesc" | "mentionsDesc" | "listingExpiryDesc" | "smartMatchesDesc";

const NOTIFICATION_TYPE_KEYS: Record<string, { labelKey: NotificationSettingsKey; descKey: NotificationSettingsKey }> = {
    ACTION_REMINDER: { labelKey: "actionReminders", descKey: "actionRemindersDesc" },
    STAGE_CHANGE: { labelKey: "stageChanges", descKey: "stageChangesDesc" },
    MENTION: { labelKey: "mentions", descKey: "mentionsDesc" },
    LISTING_EXPIRY: { labelKey: "listingExpiry", descKey: "listingExpiryDesc" },
    SMART_MATCH: { labelKey: "smartMatches", descKey: "smartMatchesDesc" },
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
    const t = useTranslations("notificationSettings");
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
                        {t("title")}
                    </CardTitle>
                    <CardDescription>
                        {t("description")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Column headers */}
                    <div className="flex items-center gap-4 pb-3 mb-1 border-b border-border">
                        <div className="flex-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t("notificationType")}
                        </div>
                        <div className="w-16 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t("inApp")}
                        </div>
                        <div className="w-16 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t("email")}
                        </div>
                    </div>

                    {/* Preference rows */}
                    <div className="divide-y divide-border">
                        {preferences.map((pref) => {
                            const keys =
                                NOTIFICATION_TYPE_KEYS[pref.notificationType];
                            const Icon = NOTIFICATION_TYPE_ICONS[pref.notificationType];
                            if (!keys || !Icon) return null;

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
                                                {t(keys.labelKey)}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {t(keys.descKey)}
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
