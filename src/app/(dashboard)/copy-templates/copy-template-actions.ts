"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ListingType } from "@prisma/client";

// Create template
export async function createCopyTemplate(workspaceId: string, data: {
    name: string;
    content: string;
    property_type?: string | null;
    listing_type?: string | null;
    listing_grade?: string | null;
    is_default?: boolean;
}) {
    // If setting as default, unset other defaults first
    if (data.is_default) {
        await prisma.copyTemplate.updateMany({
            where: { workspaceId: workspaceId, isDefault: true },
            data: { isDefault: false },
        });
    }

    const template = await prisma.copyTemplate.create({
        data: {
            workspaceId: workspaceId,
            name: data.name,
            content: data.content,
            propertyType: data.property_type as any | null,
            listingType: data.listing_type as ListingType | null,
            listingGrade: data.listing_grade || null,
            isDefault: data.is_default ?? false,
        },
    });

    revalidatePath("/copy-templates");
    return template;
}

// Update template
export async function updateCopyTemplate(id: string, data: {
    name?: string;
    content?: string;
    property_type?: string | null;
    listing_type?: string | null;
    listing_grade?: string | null;
    is_default?: boolean;
}) {
    // Fetch current to check workspace
    const existing = await prisma.copyTemplate.findUnique({ where: { id } });
    if (!existing) throw new Error("Template not found");

    // If setting as default, unset other defaults first
    if (data.is_default) {
        await prisma.copyTemplate.updateMany({
            where: { workspaceId: existing.workspaceId, isDefault: true },
            data: { isDefault: false },
        });
    }

    const template = await prisma.copyTemplate.update({
        where: { id },
        data: {
            name: data.name,
            content: data.content,
            isDefault: data.is_default,
            propertyType: data.property_type !== undefined ? (data.property_type as any | null) : undefined,
            listingType: data.listing_type !== undefined ? (data.listing_type as ListingType | null) : undefined,
            listingGrade: data.listing_grade !== undefined ? (data.listing_grade || null) : undefined,
        },
    });

    revalidatePath("/copy-templates");
    return template;
}

// Delete template
export async function deleteCopyTemplate(id: string) {
    await prisma.copyTemplate.delete({
        where: { id },
    });
    revalidatePath("/copy-templates");
}
