"use server";

import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

export interface NotificationPref {
    notificationType: string;
    inApp: boolean;
    email: boolean;
}

const ALL_NOTIFICATION_TYPES: NotificationType[] = [
    "ACTION_REMINDER",
    "LISTING_EXPIRY",
    "STAGE_CHANGE",
    "MENTION",
    "SMART_MATCH",
];

/**
 * Get notification preferences for a user.
 * Returns defaults for any types that don't have a saved preference.
 */
export async function getNotificationPreferences(
    workspaceId: string,
    userId: string
): Promise<NotificationPref[]> {
    try {
        const saved = await prisma.notificationPreference.findMany({
            where: { workspaceId, userId },
        });

        const savedMap = new Map(
            saved.map((p) => [
                p.notificationType,
                {
                    notificationType: p.notificationType,
                    inApp: p.inApp,
                    email: p.email,
                },
            ])
        );

        return ALL_NOTIFICATION_TYPES.map(
            (t) =>
                savedMap.get(t) ?? {
                    notificationType: t,
                    inApp: true,
                    email: false,
                }
        );
    } catch (error) {
        console.error("Failed to fetch notification preferences:", error);
        return ALL_NOTIFICATION_TYPES.map((t) => ({
            notificationType: t,
            inApp: true,
            email: false,
        }));
    }
}

/**
 * Update a single notification preference (upsert).
 */
export async function updateNotificationPreference(
    workspaceId: string,
    userId: string,
    notificationType: string,
    channel: "in_app" | "email",
    enabled: boolean
) {
    try {
        const updateData =
            channel === "in_app"
                ? { inApp: enabled }
                : { email: enabled };

        await prisma.notificationPreference.upsert({
            where: {
                userId_notificationType: {
                    userId,
                    notificationType:
                        notificationType as NotificationType,
                },
            },
            update: updateData,
            create: {
                workspaceId,
                userId,
                notificationType:
                    notificationType as NotificationType,
                inApp: channel === "in_app" ? enabled : true,
                email: channel === "email" ? enabled : false,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to update notification preference:", error);
        return {
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to update preference",
        };
    }
}
