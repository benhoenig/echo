"use server";

import { prisma } from "@/lib/prisma";
import type { ListingType } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateCopyFromTemplate(workspaceId: string, params: {
    listing_type: ListingType;
    listing_grade: string | null;
    property_type: string | null;
    data: any;
}) {
    try {
        // 1. Find exact match for all 3 (Type, Grade, PropertyType)
        let template = await prisma.copyTemplate.findFirst({
            where: {
                workspaceId: workspaceId,
                listingType: params.listing_type,
                listingGrade: params.listing_grade,
                propertyType: params.property_type as any,
            },
        });

        // 2. Fallback: Match Type and PropertyType (Any Grade)
        if (!template && params.property_type) {
            template = await prisma.copyTemplate.findFirst({
                where: {
                    workspaceId: workspaceId,
                    listingType: params.listing_type,
                    listingGrade: null,
                    propertyType: params.property_type as any,
                },
            });
        }

        // 3. Fallback: Match Type and Grade (Any PropertyType)
        if (!template) {
            template = await prisma.copyTemplate.findFirst({
                where: {
                    workspaceId: workspaceId,
                    listingType: params.listing_type,
                    listingGrade: params.listing_grade,
                    propertyType: null,
                },
            });
        }

        // 4. Fallback: Match just Type (Any Grade, Any PropertyType)
        if (!template) {
            template = await prisma.copyTemplate.findFirst({
                where: {
                    workspaceId: workspaceId,
                    listingType: params.listing_type,
                    listingGrade: null,
                    propertyType: null,
                },
            });
        }

        // 5. Fallback: Match just PropertyType
        if (!template && params.property_type) {
            template = await prisma.copyTemplate.findFirst({
                where: {
                    workspaceId: workspaceId,
                    listingType: null,
                    listingGrade: null,
                    propertyType: params.property_type as any,
                },
            });
        }

        // 6. Fallback: Match just Grade
        if (!template && params.listing_grade) {
            template = await prisma.copyTemplate.findFirst({
                where: {
                    workspaceId: workspaceId,
                    listingType: null,
                    listingGrade: params.listing_grade,
                    propertyType: null,
                },
            });
        }

        // 7. Fallback: Default template
        if (!template) {
            template = await prisma.copyTemplate.findFirst({
                where: {
                    workspaceId: workspaceId,
                    isDefault: true,
                },
            });
        }

        if (!template) {
            return {
                success: false,
                error: "No matching template found. Please create a template in Copy Templates.",
            };
        }

        // 5. Replace Tags
        let content = template.content;
        const d = params.data;

        // Formatter helpers
        const formatPrice = (price: number | null | undefined) => {
            if (price == null) return "____";
            return price.toLocaleString();
        };

        const replacements: Record<string, string> = {
            "{{Project Name (Thai)}}": d.projects?.project_name_thai || d.project_name || "____",
            "{{Project Name (Eng)}}": d.projects?.project_name_english || d.project_name || "____",
            "{{Listing Name}}": d.listing_name || "____",
            "{{Zone}}": d.zone || "____",
            "{{BTS/MRT}}": [d.bts, d.mrt].filter(Boolean).join(" / ") || "____",
            "{{Property Type}}": d.property_type || "____",
            "{{Listing Type}}": d.listing_type === "SELL" ? "Sale" : d.listing_type === "RENT" ? "Rent" : "Sale/Rent",
            "{{Bed}}": d.bedrooms?.toString() || "-",
            "{{Bath}}": d.bathrooms?.toString() || "-",
            "{{Sqm.}}": d.size_sqm?.toString() || "____",
            "{{Floor}}": d.floor?.toString() || "-",
            "{{Building}}": d.building || "-",
            "{{Parking}}": d.parking_slots?.toString() || "0",
            "{{Direction}}": d.direction || "-",
            "{{View}}": d.view || "-",
            "{{Asking Price}}": formatPrice(d.asking_price),
            "{{Rental Price}}": formatPrice(d.rental_price),
            "{{Price Remark}}": d.price_remark || "",
            "{{Rental Remark}}": d.rental_remark || "",
            "{{Agent Name}}": d.users?.first_name ? `${d.users.first_name} ${d.users.last_name || ''}` : "____",
            "{{Agent Phone}}": d.users?.phone || "____",
        };

        // Replace all known tags globally using string replaceAll
        for (const [tag, value] of Object.entries(replacements)) {
            // Using replaceAll ensures special characters like () in tags aren't treated as regex patterns
            content = content.replaceAll(tag, value);
        }

        // Append brand signature if configured
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { brandSignature: true },
        });

        if (workspace?.brandSignature) {
            content = content + "\n\n" + workspace.brandSignature;
        }

        return {
            success: true,
            content,
            templateName: template.name
        };

    } catch (error) {
        console.error("Error generating copy:", error);
        return {
            success: false,
            error: "An error occurred while generating copy.",
        };
    }
}
