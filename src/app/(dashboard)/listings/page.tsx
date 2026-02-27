import { getCurrentUser } from "@/lib/queries";
import { getListings, getArchivedListings } from "./listing-actions";
import { getSavedFilters } from "./saved-filter-actions";
import { ListingsContent } from "./listings-content";
import { redirect } from "next/navigation";

export default async function ListingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const [listings, archivedListings, savedFilters] = await Promise.all([
        getListings(user.workspace_id),
        getArchivedListings(user.workspace_id),
        getSavedFilters(user.workspace_id, user.id),
    ]);

    return (
        <ListingsContent
            initialListings={listings}
            archivedListings={archivedListings}
            workspaceId={user.workspace_id}
            userId={user.id}
            savedFilters={savedFilters}
        />
    );
}
