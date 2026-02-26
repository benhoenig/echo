import { getListing, getListingUpdates } from "../listing-actions";
import { ListingDetailContent } from "./listing-detail-content";
import { notFound } from "next/navigation";

export default async function ListingDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    try {
        const [listing, updates] = await Promise.all([
            getListing(id),
            getListingUpdates(id),
        ]);
        if (!listing) notFound();
        return <ListingDetailContent listing={listing} updates={updates} />;
    } catch {
        notFound();
    }
}
