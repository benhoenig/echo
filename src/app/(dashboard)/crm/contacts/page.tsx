import { getCurrentUser } from "@/lib/queries";
import { getContacts } from "./contact-actions";
import { ContactsContent } from "./contacts-content";
import { redirect } from "next/navigation";

export default async function ContactsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const contacts = await getContacts(user.workspace_id);

    return (
        <ContactsContent
            initialContacts={contacts}
            workspaceId={user.workspace_id}
            userId={user.id}
        />
    );
}
