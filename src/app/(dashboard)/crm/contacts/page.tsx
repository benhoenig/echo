import { getCurrentUser } from "@/lib/queries";
import { getContacts, getArchivedContacts } from "./contact-actions";
import { ContactsContent } from "./contacts-content";
import { redirect } from "next/navigation";

export default async function ContactsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const [contacts, archivedContacts] = await Promise.all([
        getContacts(user.workspace_id),
        getArchivedContacts(user.workspace_id),
    ]);

    return (
        <ContactsContent
            initialContacts={contacts}
            archivedContacts={archivedContacts}
            workspaceId={user.workspace_id}
            userId={user.id}
        />
    );
}
