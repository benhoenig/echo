import { getCurrentUser } from "@/lib/queries";
import { getProjects } from "./project-actions";
import { ProjectsContent } from "./projects-content";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const projects = await getProjects(user.workspace_id);

    return (
        <ProjectsContent
            initialProjects={projects}
            workspaceId={user.workspace_id}
            userId={user.id}
        />
    );
}

