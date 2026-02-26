"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ArrowLeft,
    Save,
    Trash2,
    Loader2,
    Building2,
    MapPin,
    ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateProject, deleteProject } from "../project-actions";
import { PropertyTypeSelect, PROPERTY_TYPES } from "@/components/shared/property-type-select";
import { ZoneSelector } from "@/components/shared/zone-selector";

type ProjectRow = {
    id: string;
    workspace_id: string;
    project_name_english: string;
    project_name_thai: string;
    property_type: string;
    zone_id: string | null;
    bts: string | null;
    mrt: string | null;
    developer: string | null;
    year_built: number | null;
    number_of_buildings: number | null;
    number_of_floors: number | null;
    number_of_units: number | null;
    parking_slot_ratio: string | null;
    parking_slot_trade_allow: boolean | null;
    facilities: string[] | null;
    maintenance_fee: number | null;
    maintenance_fee_payment_terms: string | null;
    maintenance_fee_collection_ratio: string | null;
    juristic_company: string | null;
    avg_sale_price_sqm: number | null;
    avg_rental_price_sqm: number | null;
    unit_types: string[] | null;
    floor_to_ceiling_height: number | null;
    max_units_per_floor: number | null;
    project_segment: string | null;
    comparable_projects: string[] | null;
    best_view: string | null;
    best_direction: string | null;
    best_unit_position: string | null;
    household_nationality_ratio: string | null;
    nearest_station_type: string | null;
    nearest_station_distance: string | null;
    nearest_station_transport: string | null;
    target_customer_group: string | null;
    strengths: string | null;
    weaknesses: string | null;
    google_maps_link: string | null;
    matching_tags: string[] | null;
    created_at: string;
    zones: {
        zone_name_english: string;
        zone_name_thai: string;
    } | null;
    [key: string]: unknown;
};

interface ProjectDetailContentProps {
    project: ProjectRow;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 mt-8 first:mt-0">
            {children}
        </h3>
    );
}

function FieldRow({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            {children}
        </div>
    );
}

export function ProjectDetailContent({ project }: ProjectDetailContentProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Form state — initialized from project
    const [nameThai, setNameThai] = useState(project.project_name_thai);
    const [nameEnglish, setNameEnglish] = useState(project.project_name_english);
    const [propertyType, setPropertyType] = useState(project.property_type);
    const [zoneId, setZoneId] = useState(project.zone_id ?? "");
    const [developer, setDeveloper] = useState(project.developer ?? "");
    const [yearBuilt, setYearBuilt] = useState(project.year_built?.toString() ?? "");
    const [bts, setBts] = useState(project.bts ?? "");
    const [mrt, setMrt] = useState(project.mrt ?? "");
    const [numberOfBuildings, setNumberOfBuildings] = useState(project.number_of_buildings?.toString() ?? "");
    const [numberOfFloors, setNumberOfFloors] = useState(project.number_of_floors?.toString() ?? "");
    const [numberOfUnits, setNumberOfUnits] = useState(project.number_of_units?.toString() ?? "");
    const [parkingSlotRatio, setParkingSlotRatio] = useState(project.parking_slot_ratio ?? "");
    const [parkingSlotTradeAllow, setParkingSlotTradeAllow] = useState(project.parking_slot_trade_allow ?? false);
    const [maintenanceFee, setMaintenanceFee] = useState(project.maintenance_fee?.toString() ?? "");
    const [maintenanceFeeTerms, setMaintenanceFeeTerms] = useState(project.maintenance_fee_payment_terms ?? "");
    const [maintenanceFeeRatio, setMaintenanceFeeRatio] = useState(project.maintenance_fee_collection_ratio ?? "");
    const [juristicCompany, setJuristicCompany] = useState(project.juristic_company ?? "");
    const [avgSalePriceSqm, setAvgSalePriceSqm] = useState(project.avg_sale_price_sqm?.toString() ?? "");
    const [avgRentalPriceSqm, setAvgRentalPriceSqm] = useState(project.avg_rental_price_sqm?.toString() ?? "");
    const [floorToCeilingHeight, setFloorToCeilingHeight] = useState(project.floor_to_ceiling_height?.toString() ?? "");
    const [maxUnitsPerFloor, setMaxUnitsPerFloor] = useState(project.max_units_per_floor?.toString() ?? "");
    const [projectSegment, setProjectSegment] = useState(project.project_segment ?? "");
    const [bestView, setBestView] = useState(project.best_view ?? "");
    const [bestDirection, setBestDirection] = useState(project.best_direction ?? "");
    const [bestUnitPosition, setBestUnitPosition] = useState(project.best_unit_position ?? "");
    const [householdNatRatio, setHouseholdNatRatio] = useState(project.household_nationality_ratio ?? "");
    const [nearestStationType, setNearestStationType] = useState(project.nearest_station_type ?? "");
    const [nearestStationDistance, setNearestStationDistance] = useState(project.nearest_station_distance ?? "");
    const [nearestStationTransport, setNearestStationTransport] = useState(project.nearest_station_transport ?? "");
    const [targetCustomerGroup, setTargetCustomerGroup] = useState(project.target_customer_group ?? "");
    const [strengths, setStrengths] = useState(project.strengths ?? "");
    const [weaknesses, setWeaknesses] = useState(project.weaknesses ?? "");
    const [googleMapsLink, setGoogleMapsLink] = useState(project.google_maps_link ?? "");
    const [facilities, setFacilities] = useState((project.facilities ?? []).join(", "));
    const [unitTypes, setUnitTypes] = useState((project.unit_types ?? []).join(", "));
    const [comparableProjects, setComparableProjects] = useState((project.comparable_projects ?? []).join(", "));

    function markChanged() {
        if (!hasChanges) setHasChanges(true);
    }

    function handleSave() {
        if (!nameThai.trim() || !nameEnglish.trim() || !propertyType) {
            toast.error("Thai name, English name, and property type are required.");
            return;
        }

        startTransition(async () => {
            try {
                await updateProject(project.id, {
                    project_name_thai: nameThai.trim(),
                    project_name_english: nameEnglish.trim(),
                    property_type: propertyType,
                    zone_id: zoneId || null,
                    developer: developer.trim() || null,
                    year_built: yearBuilt ? parseInt(yearBuilt) : null,
                    bts: bts.trim() || null,
                    mrt: mrt.trim() || null,
                    number_of_buildings: numberOfBuildings ? parseInt(numberOfBuildings) : null,
                    number_of_floors: numberOfFloors ? parseInt(numberOfFloors) : null,
                    number_of_units: numberOfUnits ? parseInt(numberOfUnits) : null,
                    parking_slot_ratio: parkingSlotRatio.trim() || null,
                    parking_slot_trade_allow: parkingSlotTradeAllow,
                    maintenance_fee: maintenanceFee ? parseFloat(maintenanceFee) : null,
                    maintenance_fee_payment_terms: maintenanceFeeTerms.trim() || null,
                    maintenance_fee_collection_ratio: maintenanceFeeRatio.trim() || null,
                    juristic_company: juristicCompany.trim() || null,
                    avg_sale_price_sqm: avgSalePriceSqm ? parseFloat(avgSalePriceSqm) : null,
                    avg_rental_price_sqm: avgRentalPriceSqm ? parseFloat(avgRentalPriceSqm) : null,
                    floor_to_ceiling_height: floorToCeilingHeight ? parseFloat(floorToCeilingHeight) : null,
                    max_units_per_floor: maxUnitsPerFloor ? parseInt(maxUnitsPerFloor) : null,
                    project_segment: projectSegment.trim() || null,
                    best_view: bestView.trim() || null,
                    best_direction: bestDirection.trim() || null,
                    best_unit_position: bestUnitPosition.trim() || null,
                    household_nationality_ratio: householdNatRatio.trim() || null,
                    nearest_station_type: nearestStationType.trim() || null,
                    nearest_station_distance: nearestStationDistance.trim() || null,
                    nearest_station_transport: nearestStationTransport.trim() || null,
                    target_customer_group: targetCustomerGroup.trim() || null,
                    strengths: strengths.trim() || null,
                    weaknesses: weaknesses.trim() || null,
                    google_maps_link: googleMapsLink.trim() || null,
                    facilities: facilities ? facilities.split(",").map((s) => s.trim()).filter(Boolean) : [],
                    unit_types: unitTypes ? unitTypes.split(",").map((s) => s.trim()).filter(Boolean) : [],
                    comparable_projects: comparableProjects ? comparableProjects.split(",").map((s) => s.trim()).filter(Boolean) : [],
                });

                setHasChanges(false);
                toast.success("Project saved.");
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to save project."
                );
            }
        });
    }

    function handleDelete() {
        startTransition(async () => {
            try {
                await deleteProject(project.id);
                toast.success("Project deleted.");
                router.push("/projects");
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to delete project."
                );
            }
        });
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/projects")}
                        className="shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-orange-500" />
                            <h1 className="text-2xl font-bold text-foreground">
                                {project.project_name_english}
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground ml-7">
                            {project.project_name_thai}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Delete
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isPending || !hasChanges}
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-1.5" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Form sections */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-6">
                {/* Basic Info */}
                <SectionHeader>Basic Information</SectionHeader>
                <div className="grid grid-cols-2 gap-4">
                    <FieldRow label="Thai Name *">
                        <Input value={nameThai} onChange={(e) => { setNameThai(e.target.value); markChanged(); }} />
                    </FieldRow>
                    <FieldRow label="English Name *">
                        <Input value={nameEnglish} onChange={(e) => { setNameEnglish(e.target.value); markChanged(); }} />
                    </FieldRow>
                    <FieldRow label="Property Type *">
                        <PropertyTypeSelect value={propertyType} onValueChange={(v) => { setPropertyType(v); markChanged(); }} />
                    </FieldRow>
                    <FieldRow label="Zone">
                        <ZoneSelector value={zoneId} onValueChange={(v) => { setZoneId(v); markChanged(); }} />
                    </FieldRow>
                    <FieldRow label="Developer">
                        <Input value={developer} onChange={(e) => { setDeveloper(e.target.value); markChanged(); }} placeholder="e.g. Ananda" />
                    </FieldRow>
                    <FieldRow label="Year Built">
                        <Input type="number" value={yearBuilt} onChange={(e) => { setYearBuilt(e.target.value); markChanged(); }} placeholder="2020" />
                    </FieldRow>
                    <FieldRow label="Project Segment">
                        <Input value={projectSegment} onChange={(e) => { setProjectSegment(e.target.value); markChanged(); }} placeholder="e.g. Mid-to-High" />
                    </FieldRow>
                </div>

                {/* Transit / Location */}
                <SectionHeader>Transit & Location</SectionHeader>
                <div className="grid grid-cols-2 gap-4">
                    <FieldRow label="BTS Station">
                        <Input value={bts} onChange={(e) => { setBts(e.target.value); markChanged(); }} placeholder="e.g. Siam" />
                    </FieldRow>
                    <FieldRow label="MRT Station">
                        <Input value={mrt} onChange={(e) => { setMrt(e.target.value); markChanged(); }} placeholder="e.g. Sukhumvit" />
                    </FieldRow>
                    <FieldRow label="Nearest Station Type">
                        <Input value={nearestStationType} onChange={(e) => { setNearestStationType(e.target.value); markChanged(); }} placeholder="BTS / MRT / ARL" />
                    </FieldRow>
                    <FieldRow label="Nearest Station Distance">
                        <Input value={nearestStationDistance} onChange={(e) => { setNearestStationDistance(e.target.value); markChanged(); }} placeholder="e.g. 150m" />
                    </FieldRow>
                    <FieldRow label="Station Transport">
                        <Input value={nearestStationTransport} onChange={(e) => { setNearestStationTransport(e.target.value); markChanged(); }} placeholder="Walk / Shuttle" />
                    </FieldRow>
                    <FieldRow label="Google Maps">
                        <div className="flex gap-2">
                            <Input value={googleMapsLink} onChange={(e) => { setGoogleMapsLink(e.target.value); markChanged(); }} placeholder="https://maps.app.goo.gl/..." className="flex-1" />
                            {googleMapsLink && (
                                <Button variant="ghost" size="icon" asChild className="shrink-0">
                                    <a href={googleMapsLink} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </Button>
                            )}
                        </div>
                    </FieldRow>
                </div>

                {/* Building Details */}
                <SectionHeader>Building Details</SectionHeader>
                <div className="grid grid-cols-3 gap-4">
                    <FieldRow label="Buildings">
                        <Input type="number" value={numberOfBuildings} onChange={(e) => { setNumberOfBuildings(e.target.value); markChanged(); }} />
                    </FieldRow>
                    <FieldRow label="Floors">
                        <Input type="number" value={numberOfFloors} onChange={(e) => { setNumberOfFloors(e.target.value); markChanged(); }} />
                    </FieldRow>
                    <FieldRow label="Units">
                        <Input type="number" value={numberOfUnits} onChange={(e) => { setNumberOfUnits(e.target.value); markChanged(); }} />
                    </FieldRow>
                    <FieldRow label="Max Units/Floor">
                        <Input type="number" value={maxUnitsPerFloor} onChange={(e) => { setMaxUnitsPerFloor(e.target.value); markChanged(); }} />
                    </FieldRow>
                    <FieldRow label="Floor-to-Ceiling (m)">
                        <Input type="number" step="0.01" value={floorToCeilingHeight} onChange={(e) => { setFloorToCeilingHeight(e.target.value); markChanged(); }} />
                    </FieldRow>
                    <FieldRow label="Parking Ratio">
                        <Input value={parkingSlotRatio} onChange={(e) => { setParkingSlotRatio(e.target.value); markChanged(); }} placeholder="e.g. 40%" />
                    </FieldRow>
                </div>
                <div className="flex items-center gap-3 mt-4">
                    <Switch checked={parkingSlotTradeAllow} onCheckedChange={(v) => { setParkingSlotTradeAllow(v); markChanged(); }} />
                    <Label className="text-sm">Parking slot trading allowed</Label>
                </div>

                {/* Financials */}
                <SectionHeader>Financials</SectionHeader>
                <div className="grid grid-cols-2 gap-4">
                    <FieldRow label="Avg Sale ฿/sqm">
                        <Input type="number" value={avgSalePriceSqm} onChange={(e) => { setAvgSalePriceSqm(e.target.value); markChanged(); }} />
                    </FieldRow>
                    <FieldRow label="Avg Rental ฿/sqm">
                        <Input type="number" value={avgRentalPriceSqm} onChange={(e) => { setAvgRentalPriceSqm(e.target.value); markChanged(); }} />
                    </FieldRow>
                    <FieldRow label="Maintenance Fee (฿/sqm)">
                        <Input type="number" value={maintenanceFee} onChange={(e) => { setMaintenanceFee(e.target.value); markChanged(); }} />
                    </FieldRow>
                    <FieldRow label="Fee Payment Terms">
                        <Input value={maintenanceFeeTerms} onChange={(e) => { setMaintenanceFeeTerms(e.target.value); markChanged(); }} placeholder="e.g. Monthly" />
                    </FieldRow>
                    <FieldRow label="Fee Collection Ratio">
                        <Input value={maintenanceFeeRatio} onChange={(e) => { setMaintenanceFeeRatio(e.target.value); markChanged(); }} />
                    </FieldRow>
                    <FieldRow label="Juristic Company">
                        <Input value={juristicCompany} onChange={(e) => { setJuristicCompany(e.target.value); markChanged(); }} placeholder="e.g. Plus Property" />
                    </FieldRow>
                </div>

                {/* Unit & Facilities */}
                <SectionHeader>Units & Facilities</SectionHeader>
                <div className="grid grid-cols-1 gap-4">
                    <FieldRow label="Unit Types (comma-separated)">
                        <Input value={unitTypes} onChange={(e) => { setUnitTypes(e.target.value); markChanged(); }} placeholder="Studio, 1BR, 2BR" />
                    </FieldRow>
                    <FieldRow label="Facilities (comma-separated)">
                        <Input value={facilities} onChange={(e) => { setFacilities(e.target.value); markChanged(); }} placeholder="Pool, Gym, Sauna" />
                    </FieldRow>
                </div>

                {/* Analysis */}
                <SectionHeader>Analysis & Market Position</SectionHeader>
                <div className="grid grid-cols-3 gap-4">
                    <FieldRow label="Best View">
                        <Input value={bestView} onChange={(e) => { setBestView(e.target.value); markChanged(); }} placeholder="e.g. City View" />
                    </FieldRow>
                    <FieldRow label="Best Direction">
                        <Input value={bestDirection} onChange={(e) => { setBestDirection(e.target.value); markChanged(); }} placeholder="e.g. North" />
                    </FieldRow>
                    <FieldRow label="Best Unit Position">
                        <Input value={bestUnitPosition} onChange={(e) => { setBestUnitPosition(e.target.value); markChanged(); }} />
                    </FieldRow>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <FieldRow label="Target Customer Group">
                        <Textarea value={targetCustomerGroup} onChange={(e) => { setTargetCustomerGroup(e.target.value); markChanged(); }} placeholder="e.g. Young professionals, investors" rows={2} />
                    </FieldRow>
                    <FieldRow label="Household Nationality Ratio">
                        <Input value={householdNatRatio} onChange={(e) => { setHouseholdNatRatio(e.target.value); markChanged(); }} />
                    </FieldRow>
                    <FieldRow label="Strengths">
                        <Textarea value={strengths} onChange={(e) => { setStrengths(e.target.value); markChanged(); }} rows={3} />
                    </FieldRow>
                    <FieldRow label="Weaknesses">
                        <Textarea value={weaknesses} onChange={(e) => { setWeaknesses(e.target.value); markChanged(); }} rows={3} />
                    </FieldRow>
                    <FieldRow label="Comparable Projects (comma-separated)">
                        <Input value={comparableProjects} onChange={(e) => { setComparableProjects(e.target.value); markChanged(); }} placeholder="e.g. Noble Refine, Ideo Mobi" />
                    </FieldRow>
                </div>
            </div>

            {/* Delete Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &ldquo;
                            {project.project_name_english}&rdquo;? This action
                            cannot be undone. Projects with linked listings
                            cannot be deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            {isPending && (
                                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                            )}
                            Delete Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
