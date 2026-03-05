import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import type { NotificationType, EntityType } from "@prisma/client";

interface SendNotificationParams {
    workspaceId: string;
    userId: string;
    type: NotificationType;
    entityType: EntityType;
    entityId: string;
    title: string;
    message: string;
    actionUrl?: string;
}

/**
 * Send a single notification — creates in-app record and dispatches
 * to email based on user preferences.
 */
export async function sendNotification(params: SendNotificationParams) {
    const {
        workspaceId,
        userId,
        type,
        entityType,
        entityId,
        title,
        message,
        actionUrl,
    } = params;

    // Look up user preferences for this notification type
    const preference = await prisma.notificationPreference.findUnique({
        where: {
            userId_notificationType: { userId, notificationType: type },
        },
    });

    // Defaults: inApp=true, email=false
    const inAppEnabled = preference?.inApp ?? true;
    const emailEnabled = preference?.email ?? false;

    // Create in-app notification
    if (inAppEnabled) {
        await prisma.notification.create({
            data: {
                workspaceId,
                userId,
                type,
                entityType,
                entityId,
                title,
                message,
                actionUrl,
                isRead: false,
            },
        });
    }

    // Dispatch email
    if (emailEnabled) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, firstName: true },
            });
            if (user?.email) {
                await sendEmail({
                    to: user.email,
                    subject: title,
                    html: buildNotificationEmailHtml(
                        title,
                        message,
                        actionUrl
                    ),
                });
            }
        } catch (error) {
            console.error("Failed to send notification email:", error);
        }
    }
}

/**
 * Send notifications in batch — used by cron jobs for efficiency.
 * Batch-fetches preferences, bulk-creates in-app notifications,
 * and dispatches emails individually.
 */
export async function sendNotificationBatch(
    notifications: SendNotificationParams[]
) {
    if (notifications.length === 0) return;

    // Batch-fetch all preferences for involved users
    const userIds = [...new Set(notifications.map((n) => n.userId))];
    const preferences = await prisma.notificationPreference.findMany({
        where: { userId: { in: userIds } },
    });
    const prefMap = new Map(
        preferences.map((p) => [`${p.userId}:${p.notificationType}`, p])
    );

    // Separate into in-app and email batches based on preferences
    const inAppBatch: SendNotificationParams[] = [];
    const emailBatch: SendNotificationParams[] = [];

    for (const n of notifications) {
        const pref = prefMap.get(`${n.userId}:${n.type}`);
        const inAppEnabled = pref?.inApp ?? true;
        const emailEnabled = pref?.email ?? false;

        if (inAppEnabled) inAppBatch.push(n);
        if (emailEnabled) emailBatch.push(n);
    }

    // Bulk create in-app notifications
    if (inAppBatch.length > 0) {
        await prisma.notification.createMany({
            data: inAppBatch.map((n) => ({
                workspaceId: n.workspaceId,
                userId: n.userId,
                type: n.type,
                entityType: n.entityType,
                entityId: n.entityId,
                title: n.title,
                message: n.message,
                actionUrl: n.actionUrl,
                isRead: false,
            })),
        });
    }

    // Dispatch emails individually (external API calls)
    if (emailBatch.length > 0) {
        // Batch-fetch user emails
        const emailUserIds = [...new Set(emailBatch.map((n) => n.userId))];
        const users = await prisma.user.findMany({
            where: { id: { in: emailUserIds } },
            select: { id: true, email: true, firstName: true },
        });
        const userMap = new Map(users.map((u) => [u.id, u]));

        for (const n of emailBatch) {
            const user = userMap.get(n.userId);
            if (user?.email) {
                try {
                    await sendEmail({
                        to: user.email,
                        subject: n.title,
                        html: buildNotificationEmailHtml(
                            n.title,
                            n.message,
                            n.actionUrl
                        ),
                    });
                } catch (error) {
                    console.error(
                        `Failed to send email to ${user.email}:`,
                        error
                    );
                }
            }
        }
    }
}

function buildNotificationEmailHtml(
    title: string,
    message: string,
    actionUrl?: string
): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const fullUrl = actionUrl ? `${appUrl}${actionUrl}` : null;

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #fafaf9;">
    <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e7e5e4;">
        <div style="border-bottom: 1px solid #e7e5e4; padding-bottom: 16px; margin-bottom: 16px;">
            <span style="font-size: 18px; font-weight: 600; color: #f97316;">ECHO</span>
        </div>
        <h2 style="color: #292524; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">${title}</h2>
        <p style="color: #78716c; font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">${message}</p>
        ${
            fullUrl
                ? `<a href="${fullUrl}" style="display: inline-block; background: #f97316; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">View in ECHO</a>`
                : ""
        }
    </div>
    <p style="color: #a8a29e; font-size: 12px; text-align: center; margin-top: 16px;">
        You received this because of your notification preferences in ECHO.
    </p>
</body>
</html>`.trim();
}
