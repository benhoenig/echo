"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createProject } from "./project-actions";
import { PropertyTypeSelect } from "@/components/shared/property-type-select";
import { ZoneSelector } from "@/components/shared/zone-selector";
import type { Database } from "@/types/supabase";

type PropertyType = Database["public"]["Enums"]["PropertyType"];

interface CreateProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
    userId: string;
}

export function CreateProjectDialog({
    open,
    onOpenChange,
    workspaceId,
    userId,
}: CreateProjectDialogProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Required fields
    const [nameThai, setNameThai] = useState("");
    const [nameEnglish, setNameEnglish] = useState("");
    const [propertyType, setPropertyType] = useState("");
    const [zoneId, setZoneId] = useState("");

    // Optional basic fields
    const [developer, setDeveloper] = useState("");
    const [yearBuilt, setYearBuilt] = useState("");
    const [bts, setBts] = useState("");
    const [mrt, setMrt] = useState("");
    const [numberOfBuildings, setNumberOfBuildings] = useState("");
    const [numberOfFloors, setNumberOfFloors] = useState("");
    const [numberOfUnits, setNumberOfUnits] = useState("");

    function resetForm() {
        setNameThai("");
        setNameEnglish("");
        setPropertyType("");
        setZoneId("");
        setDeveloper("");
        setYearBuilt("");
        setBts("");
        setMrt("");
        setNumberOfBuildings("");
        setNumberOfFloors("");
        setNumberOfUnits("");
    }

    function handleSave() {
        if (!nameThai.trim() || !nameEnglish.trim() || !propertyType) {
            toast.error("Thai name, English name, and property type are required.");
            return;
        }

        startTransition(async () => {
            try {
                const data = await createProject({
                    workspace_id: workspaceId,
                    project_name_thai: nameThai.trim(),
                    project_name_english: nameEnglish.trim(),
                    property_type: propertyType as PropertyType,
                    zone_id: zoneId || null,
                    developer: developer.trim() || null,
                    year_built: yearBuilt ? parseInt(yearBuilt) : null,
                    bts: bts.trim() || null,
                    mrt: mrt.trim() || null,
                    number_of_buildings: numberOfBuildings ? parseInt(numberOfBuildings) : null,
                    number_of_floors: numberOfFloors ? parseInt(numberOfFloors) : null,
                    number_of_units: numberOfUnits ? parseInt(numberOfUnits) : null,
                    created_by_id: userId,
                    last_updated_by_id: userId,
                    last_updated_at: new Date().toISOString(),
                });

                toast.success("Project created successfully.");
                resetForm();
                onOpenChange(false);
                router.push(`/projects/${data.id}`);
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to create project."
                );
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>New Project</DialogTitle>
                    <DialogDescription>
                        Add a new condominium or development to your database.
                        You can fill in more details on the project page.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Required fields */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Required Information
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="name-thai">
                                    Thai Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name-thai"
                                    placeholder="ชื่อโครงการ"
                                    value={nameThai}
                                    onChange={(e) => setNameThai(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name-english">
                                    English Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name-english"
                                    placeholder="Project name"
                                    value={nameEnglish}
                                    onChange={(e) => setNameEnglish(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>
                                    Property Type <span className="text-red-500">*</span>
                                </Label>
                                <PropertyTypeSelect
                                    value={propertyType}
                                    onValueChange={setPropertyType}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Zone</Label>
                                <ZoneSelector
                                    value={zoneId}
                                    onValueChange={setZoneId}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Optional fields */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Basic Details
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="developer">Developer</Label>
                                <Input
                                    id="developer"
                                    placeholder="e.g. Ananda"
                                    value={developer}
                                    onChange={(e) => setDeveloper(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="year-built">Year Built</Label>
                                <Input
                                    id="year-built"
                                    type="number"
                                    placeholder="e.g. 2020"
                                    value={yearBuilt}
                                    onChange={(e) => setYearBuilt(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="bts">BTS Station</Label>
                                <Input
                                    id="bts"
                                    placeholder="e.g. Siam"
                                    value={bts}
                                    onChange={(e) => setBts(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mrt">MRT Station</Label>
                                <Input
                                    id="mrt"
                                    placeholder="e.g. Sukhumvit"
                                    value={mrt}
                                    onChange={(e) => setMrt(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="buildings">Buildings</Label>
                                <Input
                                    id="buildings"
                                    type="number"
                                    placeholder="1"
                                    value={numberOfBuildings}
                                    onChange={(e) => setNumberOfBuildings(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="floors">Floors</Label>
                                <Input
                                    id="floors"
                                    type="number"
                                    placeholder="35"
                                    value={numberOfFloors}
                                    onChange={(e) => setNumberOfFloors(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="units">Units</Label>
                                <Input
                                    id="units"
                                    type="number"
                                    placeholder="413"
                                    value={numberOfUnits}
                                    onChange={(e) => setNumberOfUnits(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending && (
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        )}
                        Create Project
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
