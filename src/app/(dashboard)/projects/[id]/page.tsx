import { getProject } from "../project-actions";
import { ProjectDetailContent } from "./project-detail-content";
import { notFound } from "next/navigation";

interface ProjectDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({
    params,
}: ProjectDetailPageProps) {
    const { id } = await params;

    let project;
    try {
        project = await getProject(id);
    } catch {
        notFound();
    }

    if (!project) notFound();

    return <ProjectDetailContent project={project} />;
}
