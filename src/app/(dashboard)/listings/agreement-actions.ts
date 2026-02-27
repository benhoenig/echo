"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-logger";
import {
    AgreementType,
    AgreementStatus,
    CommissionType
} from "@prisma/client";

export type CreateAgreementInput = {
    listingId: string;
    agreementType: AgreementType;
    sellerContactId?: string | null;
    buyerContactId?: string | null;
    assignedAgentId?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    commissionRate?: number | null;
    commissionType?: CommissionType;
    fixedFeeAmount?: number | null;
    salePrice?: number | null;
    depositAmount?: number | null;
    agreementFilesUrl?: string[];
    notes?: string | null;
};

export async function createAgreement(input: CreateAgreementInput) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { listingId, ...agreementData } = input;

        // Use a transaction since we might need to update the listing's exclusive flag
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await prisma.$transaction(async (tx: any) => {
            const newAgreement = await tx.agreement.create({
                data: {
                    listingId,
                    createdById: user.id,
                    lastUpdatedById: user.id,
                    ...agreementData
                }
            });

            // If this is an EXCLUSIVE_AGENT agreement, auto-flag the listing
            if (input.agreementType === "EXCLUSIVE_AGENT") {
                await tx.listing.update({
                    where: { id: listingId },
                    data: {
                        exclusiveAgreement: true,
                        lastUpdatedById: user.id
                    }
                });
            }

            // fetch workspace directly
            const listing = await tx.listing.findUnique({
                where: { id: listingId },
                select: { workspaceId: true }
            });

            return { newAgreement, workspaceId: listing?.workspaceId };
        });

        if (result.workspaceId) {
            // Log the activity
            await logActivity({
                workspaceId: result.workspaceId,
                entityType: "LISTING",
                entityId: listingId,
                actionType: "UPDATED",
                actorUserId: user.id,
                description: `Created new ${input.agreementType} agreement`
            });
        }

        revalidatePath(`/listings/${listingId}`);
        return { success: true, data: result.newAgreement };

    } catch (error: any) {
        console.error("Error creating agreement:", error);
        return { success: false, error: error.message || "Failed to create agreement" };
    }
}

export async function getAgreements(listingId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const agreements = await prisma.agreement.findMany({
            where: { listingId },
            include: {
                assignedAgent: { select: { firstName: true, lastName: true, email: true } },
                sellerContact: { select: { firstName: true, lastName: true } },
                buyerContact: { select: { firstName: true, lastName: true } },
                createdBy: { select: { firstName: true, lastName: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        return { success: true, data: agreements };
    } catch (error: any) {
        console.error("Error fetching agreements:", error);
        return { success: false, error: error.message || "Failed to fetch agreements" };
    }
}

export async function updateAgreementStatus(agreementId: string, status: AgreementStatus, listingId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const updated = await prisma.agreement.update({
            where: { id: agreementId },
            data: {
                agreementStatus: status,
                lastUpdatedById: user.id
            },
            include: { listing: { select: { workspaceId: true } } }
        });

        // We should also potentially un-flag the listing if the last Exclusive agreement is expired/cancelled
        // But for simplicity, we'll leave the flag as true and let the user manage it manually if they turn off all exclusives.
        // Or we could do a check here.

        if (status === "EXPIRED" || status === "CANCELLED") {
            if (updated.agreementType === "EXCLUSIVE_AGENT") {
                const activeExclusivesCount = await prisma.agreement.count({
                    where: {
                        listingId: updated.listingId,
                        agreementType: "EXCLUSIVE_AGENT",
                        agreementStatus: "ACTIVE",
                        id: { not: agreementId }
                    }
                });

                if (activeExclusivesCount === 0) {
                    await prisma.listing.update({
                        where: { id: updated.listingId },
                        data: {
                            exclusiveAgreement: false,
                            lastUpdatedById: user.id
                        }
                    });
                }
            }
        }

        await logActivity({
            workspaceId: updated.listing.workspaceId,
            entityId: listingId,
            entityType: "LISTING",
            actionType: "UPDATED",
            actorUserId: user.id,
            description: `Updated agreement status to ${status}`
        });

        revalidatePath(`/listings/${listingId}`);
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("Error updating agreement status:", error);
        return { success: false, error: error.message || "Failed to update agreement status" };
    }
}

export async function renewAgreement(previousId: string, listingId: string, newData: Partial<CreateAgreementInput>) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const result = await prisma.$transaction(async (tx: any) => {
            // Find the old agreement
            const oldAgreement = await tx.agreement.findUnique({
                where: { id: previousId },
                include: { listing: { select: { workspaceId: true } } }
            });

            if (!oldAgreement) throw new Error("Previous agreement not found");

            // Set old to RENEWED
            await tx.agreement.update({
                where: { id: previousId },
                data: {
                    agreementStatus: "RENEWED",
                    lastUpdatedById: user.id
                }
            });

            // Create new one
            const newAgreement = await tx.agreement.create({
                data: {
                    listingId,
                    agreementType: oldAgreement.agreementType, // inherit type
                    previousAgreementId: previousId,
                    renewalCount: oldAgreement.renewalCount + 1,
                    createdById: user.id,
                    lastUpdatedById: user.id,
                    ...newData as any // pass through the new dates, rates, etc.
                }
            });

            return { newAgreement, workspaceId: oldAgreement.listing.workspaceId };
        });

        await logActivity({
            workspaceId: result.workspaceId,
            entityId: listingId,
            entityType: "LISTING",
            actionType: "UPDATED",
            actorUserId: user.id,
            description: `Renewed agreement`
        });

        revalidatePath(`/listings/${listingId}`);
        return { success: true, data: result.newAgreement };

    } catch (error: any) {
        console.error("Error renewing agreement:", error);
        return { success: false, error: error.message || "Failed to renew agreement" };
    }
}
