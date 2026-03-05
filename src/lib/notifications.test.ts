import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendNotification, sendNotificationBatch } from "./notifications";

// ─── Mock setup ──────────────────────────────────────────────────────────────
// Use vi.hoisted so mock variables are available inside the vi.mock() factory
const { mockFindUnique, mockCreate, mockCreateMany, mockFindMany, mockSendEmail } =
    vi.hoisted(() => ({
        mockFindUnique: vi.fn(),
        mockCreate: vi.fn(),
        mockCreateMany: vi.fn(),
        mockFindMany: vi.fn(),
        mockSendEmail: vi.fn(),
    }));

vi.mock("@/lib/prisma", () => ({
    prisma: {
        notificationPreference: {
            findUnique: (...args: unknown[]) => mockFindUnique(...args),
            findMany: (...args: unknown[]) => mockFindMany(...args),
        },
        notification: {
            create: (...args: unknown[]) => mockCreate(...args),
            createMany: (...args: unknown[]) => mockCreateMany(...args),
        },
        user: {
            findUnique: (...args: unknown[]) => mockFindUnique(...args),
            findMany: (...args: unknown[]) => mockFindMany(...args),
        },
    },
}));

vi.mock("@/lib/email", () => ({
    sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}));


// ─── Base notification params ─────────────────────────────────────────────────

const baseParams = {
    workspaceId: "workspace-1",
    userId: "user-1",
    type: "ACTION_REMINDER" as const,
    entityType: "DEAL" as const,
    entityId: "deal-1",
    title: "Follow-up overdue",
    message: "Deal is overdue.",
    actionUrl: "/crm/deals/deal-1",
};

// ─── sendNotification ─────────────────────────────────────────────────────────

describe("sendNotification", () => {
    beforeEach(() => {
        // resetAllMocks flushes queued mockResolvedValueOnce responses between tests
        vi.resetAllMocks();
        mockSendEmail.mockResolvedValue({ success: true });
    });

    describe("in-app notifications", () => {
        it("creates an in-app notification when inApp pref=true (default)", async () => {
            mockFindUnique.mockResolvedValueOnce(null); // no pref saved → defaults to inApp=true

            await sendNotification(baseParams);

            expect(mockCreate).toHaveBeenCalledOnce();
            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        workspaceId: "workspace-1",
                        userId: "user-1",
                        type: "ACTION_REMINDER",
                        entityType: "DEAL",
                        entityId: "deal-1",
                        title: "Follow-up overdue",
                        message: "Deal is overdue.",
                        isRead: false,
                    }),
                })
            );
        });

        it("does NOT create in-app notification when inApp pref=false", async () => {
            mockFindUnique.mockResolvedValueOnce({ inApp: false, email: false });

            await sendNotification(baseParams);

            expect(mockCreate).not.toHaveBeenCalled();
        });

        it("stores the actionUrl in the notification", async () => {
            mockFindUnique.mockResolvedValueOnce(null);

            await sendNotification(baseParams);

            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        actionUrl: "/crm/deals/deal-1",
                    }),
                })
            );
        });

        it("stores null actionUrl when not provided", async () => {
            mockFindUnique.mockResolvedValueOnce(null);
            const { actionUrl: _removed, ...paramsWithoutUrl } = baseParams;

            await sendNotification(paramsWithoutUrl);

            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        actionUrl: undefined,
                    }),
                })
            );
        });
    });

    describe("email notifications", () => {
        it("sends an email when email pref=true and user has email", async () => {
            // First call: preference lookup
            mockFindUnique.mockResolvedValueOnce({ inApp: true, email: true });
            // Second call: user lookup
            mockFindUnique.mockResolvedValueOnce({
                email: "user@example.com",
                firstName: "Ben",
            });

            await sendNotification(baseParams);

            expect(mockSendEmail).toHaveBeenCalledOnce();
            expect(mockSendEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: "user@example.com",
                    subject: "Follow-up overdue",
                })
            );
        });

        it("does NOT send email when email pref=false (default)", async () => {
            mockFindUnique.mockResolvedValueOnce(null); // defaults: inApp=true, email=false

            await sendNotification(baseParams);

            expect(mockSendEmail).not.toHaveBeenCalled();
        });

        it("does NOT send email when user has no email address", async () => {
            mockFindUnique.mockResolvedValueOnce({ inApp: true, email: true });
            mockFindUnique.mockResolvedValueOnce({ email: null, firstName: "Ben" });

            await sendNotification(baseParams);

            expect(mockSendEmail).not.toHaveBeenCalled();
        });

        it("does NOT send email when user record is not found", async () => {
            mockFindUnique.mockResolvedValueOnce({ inApp: true, email: true });
            mockFindUnique.mockResolvedValueOnce(null);

            await sendNotification(baseParams);

            expect(mockSendEmail).not.toHaveBeenCalled();
        });

        it("does not throw even if email dispatch fails", async () => {
            mockFindUnique.mockResolvedValueOnce({ inApp: true, email: true });
            mockFindUnique.mockResolvedValueOnce({ email: "user@example.com", firstName: "Ben" });
            mockSendEmail.mockRejectedValueOnce(new Error("SMTP error"));

            await expect(sendNotification(baseParams)).resolves.not.toThrow();
        });
    });

    describe("combined behavior", () => {
        it("both creates in-app AND sends email when both prefs=true", async () => {
            mockFindUnique.mockResolvedValueOnce({ inApp: true, email: true });
            mockFindUnique.mockResolvedValueOnce({ email: "user@example.com", firstName: "Ben" });

            await sendNotification(baseParams);

            expect(mockCreate).toHaveBeenCalledOnce();
            expect(mockSendEmail).toHaveBeenCalledOnce();
        });

        it("skips both when both prefs=false", async () => {
            mockFindUnique.mockResolvedValueOnce({ inApp: false, email: false });

            await sendNotification(baseParams);

            expect(mockCreate).not.toHaveBeenCalled();
            expect(mockSendEmail).not.toHaveBeenCalled();
        });
    });
});

// ─── sendNotificationBatch ────────────────────────────────────────────────────

describe("sendNotificationBatch", () => {
    beforeEach(() => {
        // resetAllMocks prevents queued mockResolvedValueOnce responses from leaking
        vi.resetAllMocks();
        mockSendEmail.mockResolvedValue({ success: true });
    });

    it("is a no-op when called with an empty array", async () => {
        await sendNotificationBatch([]);

        expect(mockFindMany).not.toHaveBeenCalled();
        expect(mockCreateMany).not.toHaveBeenCalled();
        expect(mockSendEmail).not.toHaveBeenCalled();
    });

    it("bulk-creates in-app notifications via createMany", async () => {
        // Empty prefs → defaults: inApp=true, email=false for all
        // emailBatch will be empty so user.findMany is NOT called
        mockFindMany.mockResolvedValueOnce([]);

        await sendNotificationBatch([baseParams, { ...baseParams, entityId: "deal-2" }]);

        expect(mockCreateMany).toHaveBeenCalledOnce();
        expect(mockCreateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({ entityId: "deal-1" }),
                    expect.objectContaining({ entityId: "deal-2" }),
                ]),
            })
        );
    });

    it("sends emails to users with email pref=true", async () => {
        // Preferences: user-1 has email=true
        mockFindMany.mockResolvedValueOnce([
            {
                userId: "user-1",
                notificationType: "ACTION_REMINDER",
                inApp: true,
                email: true,
            },
        ]);
        // User lookup for email dispatch
        mockFindMany.mockResolvedValueOnce([
            { id: "user-1", email: "user@example.com", firstName: "Ben" },
        ]);

        await sendNotificationBatch([baseParams]);

        expect(mockSendEmail).toHaveBeenCalledOnce();
        expect(mockSendEmail).toHaveBeenCalledWith(
            expect.objectContaining({ to: "user@example.com" })
        );
    });

    it("deduplicates userIds when fetching preferences", async () => {
        // Two notifications for the same user
        mockFindMany.mockResolvedValueOnce([]);

        await sendNotificationBatch([
            baseParams,
            { ...baseParams, entityId: "deal-2" },
        ]);

        const prefCallArgs = mockFindMany.mock.calls[0][0];
        expect(prefCallArgs.where.userId.in).toHaveLength(1);
        expect(prefCallArgs.where.userId.in[0]).toBe("user-1");
    });

    it("does not call createMany when all notifications have inApp=false", async () => {
        mockFindMany.mockResolvedValueOnce([
            {
                userId: "user-1",
                notificationType: "ACTION_REMINDER",
                inApp: false,
                email: false,
            },
        ]);

        await sendNotificationBatch([baseParams]);

        expect(mockCreateMany).not.toHaveBeenCalled();
    });

    it("does not throw if an email send fails for one recipient", async () => {
        mockFindMany.mockResolvedValueOnce([
            {
                userId: "user-1",
                notificationType: "ACTION_REMINDER",
                inApp: true,
                email: true,
            },
        ]);
        mockFindMany.mockResolvedValueOnce([
            { id: "user-1", email: "user@example.com", firstName: "Ben" },
        ]);
        mockSendEmail.mockRejectedValueOnce(new Error("SMTP error"));

        await expect(sendNotificationBatch([baseParams])).resolves.not.toThrow();
    });

    it("creates in-app for inApp users and sends emails for email users in the same batch", async () => {
        const params2 = { ...baseParams, userId: "user-2", entityId: "deal-2" };

        // user-1: inApp=true, email=false; user-2: inApp=false, email=true
        mockFindMany.mockResolvedValueOnce([
            { userId: "user-1", notificationType: "ACTION_REMINDER", inApp: true, email: false },
            { userId: "user-2", notificationType: "ACTION_REMINDER", inApp: false, email: true },
        ]);
        // User email lookup for user-2
        mockFindMany.mockResolvedValueOnce([
            { id: "user-2", email: "user2@example.com", firstName: "User2" },
        ]);

        await sendNotificationBatch([baseParams, params2]);

        // createMany only contains user-1's notification
        expect(mockCreateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({ userId: "user-1" }),
                ]),
            })
        );
        expect(mockCreateMany.mock.calls[0][0].data).toHaveLength(1);

        // Email sent only to user-2
        expect(mockSendEmail).toHaveBeenCalledOnce();
        expect(mockSendEmail).toHaveBeenCalledWith(
            expect.objectContaining({ to: "user2@example.com" })
        );
    });
});
