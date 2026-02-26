"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    FolderOpen,
    Plus,
    Search,
    Building2,
    MapPin,
    ArrowUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CreateProjectDialog } from "./create-project-dialog";
import { PROPERTY_TYPES } from "@/components/shared/property-type-select";

type ProjectWithZone = {
    id: string;
    project_name_english: string;
    project_name_thai: string;
    property_type: string;
    zone_id: string | null;
    developer: string | null;
    number_of_units: number | null;
    avg_sale_price_sqm: number | null;
    avg_rental_price_sqm: number | null;
    year_built: number | null;
    bts: string | null;
    mrt: string | null;
    created_at: string;
    zones: {
        zone_name_english: string;
        zone_name_thai: string;
    } | null;
    [key: string]: unknown;
};

interface ProjectsContentProps {
    initialProjects: ProjectWithZone[];
    workspaceId: string;
    userId: string;
}

function getPropertyTypeLabel(value: string) {
    return (
        PROPERTY_TYPES.find((t) => t.value === value)?.label ?? value
    );
}

function formatPrice(price: number | null) {
    if (!price) return "—";
    return `฿${price.toLocaleString()}`;
}

export function ProjectsContent({ initialProjects, workspaceId, userId }: ProjectsContentProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const filteredProjects = useMemo(() => {
        if (!search.trim()) return initialProjects;
        const q = search.toLowerCase();
        return initialProjects.filter(
            (p) =>
                p.project_name_english.toLowerCase().includes(q) ||
                p.project_name_thai.toLowerCase().includes(q) ||
                p.developer?.toLowerCase().includes(q) ||
                p.zones?.zone_name_english.toLowerCase().includes(q)
        );
    }, [initialProjects, search]);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Projects
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {initialProjects.length} project
                        {initialProjects.length !== 1 ? "s" : ""} in your
                        database
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-1.5" />
                    New Project
                </Button>
            </div>

            {/* Search bar */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search projects..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Projects Table */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
                {filteredProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <FolderOpen
                            className="w-12 h-12 text-stone-300 dark:text-stone-600"
                            strokeWidth={1.75}
                        />
                        <p className="text-sm font-medium text-foreground mt-4">
                            {search
                                ? "No projects match your search"
                                : "No projects yet"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {search
                                ? "Try a different search term."
                                : "Add your first project to get started."}
                        </p>
                        {!search && (
                            <Button
                                className="mt-4"
                                size="sm"
                                onClick={() => setCreateDialogOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                New Project
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
                                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                        Project Name
                                    </th>
                                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                        Type
                                    </th>
                                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                        Zone
                                    </th>
                                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                        Developer
                                    </th>
                                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                        Units
                                    </th>
                                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                        Avg ฿/sqm
                                    </th>
                                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                        BTS / MRT
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {filteredProjects.map((project) => (
                                    <tr
                                        key={project.id}
                                        className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer group"
                                        onClick={() =>
                                            router.push(
                                                `/projects/${project.id}`
                                            )
                                        }
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-orange-500 shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                                        {
                                                            project.project_name_english
                                                        }
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {
                                                            project.project_name_thai
                                                        }
                                                    </p>
                                                </div>
                                                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {getPropertyTypeLabel(
                                                    project.property_type
                                                )}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            {project.zones ? (
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {
                                                        project.zones
                                                            .zone_name_english
                                                    }
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {project.developer ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground text-right tabular-nums">
                                            {project.number_of_units?.toLocaleString() ??
                                                "—"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground text-right tabular-nums">
                                            {formatPrice(
                                                project.avg_sale_price_sqm
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {[project.bts, project.mrt]
                                                .filter(Boolean)
                                                .join(" / ") || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Project Dialog */}
            <CreateProjectDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                workspaceId={workspaceId}
                userId={userId}
            />
        </div>
    );
}
