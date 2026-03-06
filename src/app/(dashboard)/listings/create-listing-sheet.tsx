"use client";

import { useState, useTransition, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Pencil, Plus, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createListing } from "./listing-actions";
import { createContact } from "@/app/(dashboard)/crm/contacts/contact-actions";
import { createProject } from "@/app/(dashboard)/projects/project-actions";
import { PropertyTypeSelect, PROPERTY_TYPE_THAI } from "@/components/shared/property-type-select";
import { ZoneSelector } from "@/components/shared/zone-selector";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

type PropertyType = Database["public"]["Enums"]["PropertyType"];
type ListingType = Database["public"]["Enums"]["ListingType"];

interface CreateListingSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
    userId: string;
}

// ── Simple Contact / Project Selectors ────────────────────────

type ContactItem = { id: string; first_name: string; last_name: string; nickname: string | null };
type ProjectItem = {
    id: string;
    project_name_english: string;
    property_type: string;
    zone_id: string | null;
    bts: string | null;
    mrt: string | null;
    zones: { zone_name_english: string } | null;
};

function useContacts(): [ContactItem[], React.Dispatch<React.SetStateAction<ContactItem[]>>] {
    const [contacts, setContacts] = useState<ContactItem[]>([]);
    useEffect(() => {
        const supabase = createBrowserClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        supabase
            .from("contacts")
            .select("id, first_name, last_name, nickname")
            .eq("archived", false)
            .order("first_name")
            .then(({ data }) => setContacts(data ?? []));
    }, []);
    return [contacts, setContacts];
}

function useProjects(): [ProjectItem[], React.Dispatch<React.SetStateAction<ProjectItem[]>>] {
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    useEffect(() => {
        const supabase = createBrowserClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        supabase
            .from("projects")
            .select("id, project_name_english, property_type, zone_id, bts, mrt, zones!projects_zone_id_fkey(zone_name_english)")
            .order("project_name_english")
            .then(({ data }) => setProjects((data as typeof projects) ?? []));
    }, []);
    return [projects, setProjects];
}

// ── Quick Create Contact Dialog ────────────────────────

function QuickCreateContactDialog({
    open,
    onOpenChange,
    workspaceId,
    onCreated,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
    onCreated: (contact: ContactItem) => void;
}) {
    const t = useTranslations("listings");
    const tc = useTranslations("common");
    const [isPending, startTransition] = useTransition();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [nickname, setNickname] = useState("");
    const [phone, setPhone] = useState("");
    const [lineId, setLineId] = useState("");

    function resetForm() {
        setFirstName("");
        setLastName("");
        setNickname("");
        setPhone("");
        setLineId("");
    }

    function handleSave() {
        if (!firstName.trim() || !lastName.trim()) {
            toast.error(t("validationRequired"));
            return;
        }

        startTransition(async () => {
            try {
                const data = await createContact({
                    workspace_id: workspaceId,
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    nickname: nickname.trim() || null,
                    contact_type: ["Seller"],
                    phone_primary: phone.trim() || null,
                    line_id: lineId.trim() || null,
                    last_updated_at: new Date().toISOString(),
                });

                onCreated({
                    id: data.id,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    nickname: data.nickname,
                });
                toast.success(t("contactCreatedAndSelected"));
                resetForm();
                onOpenChange(false);
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : tc("error")
                );
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("quickCreateContact")}</DialogTitle>
                    <DialogDescription>
                        {t("quickCreateContactDesc")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                {t("firstName")} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Somchai"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                {t("lastName")} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Srichai"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                            {t("nickname")}
                        </Label>
                        <Input
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Chai"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                {t("phone")}
                            </Label>
                            <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="08X-XXX-XXXX"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                {t("lineId")}
                            </Label>
                            <Input
                                value={lineId}
                                onChange={(e) => setLineId(e.target.value)}
                                placeholder="@lineid"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {tc("cancel")}
                    </Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                        {t("createAndSelect")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Quick Create Project Dialog ────────────────────────

function QuickCreateProjectDialog({
    open,
    onOpenChange,
    workspaceId,
    userId,
    onCreated,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
    userId: string;
    onCreated: (project: ProjectItem) => void;
}) {
    const t = useTranslations("listings");
    const tc = useTranslations("common");
    const [isPending, startTransition] = useTransition();
    const [nameThai, setNameThai] = useState("");
    const [nameEnglish, setNameEnglish] = useState("");
    const [propertyType, setPropertyType] = useState("");
    const [zoneId, setZoneId] = useState("");
    const [zoneName, setZoneName] = useState("");

    function resetForm() {
        setNameThai("");
        setNameEnglish("");
        setPropertyType("");
        setZoneId("");
        setZoneName("");
    }

    function handleSave() {
        if (!nameThai.trim() || !nameEnglish.trim() || !propertyType) {
            toast.error(t("nameAndTypeRequired"));
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
                    created_by_id: userId,
                    last_updated_by_id: userId,
                    last_updated_at: new Date().toISOString(),
                });

                onCreated({
                    id: data.id,
                    project_name_english: data.project_name_english,
                    property_type: data.property_type,
                    zone_id: data.zone_id,
                    bts: data.bts,
                    mrt: data.mrt,
                    zones: zoneName ? { zone_name_english: zoneName } : null,
                });
                toast.success(t("projectCreatedAndSelected"));
                resetForm();
                onOpenChange(false);
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : tc("error")
                );
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("quickCreateProject")}</DialogTitle>
                    <DialogDescription>
                        {t("quickCreateProjectDesc")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                {t("thaiName")} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={nameThai}
                                onChange={(e) => setNameThai(e.target.value)}
                                placeholder="ชื่อโครงการ"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                {t("englishName")} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={nameEnglish}
                                onChange={(e) => setNameEnglish(e.target.value)}
                                placeholder="Project name"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                {t("propertyType")} <span className="text-red-500">*</span>
                            </Label>
                            <PropertyTypeSelect value={propertyType} onValueChange={setPropertyType} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                {t("zone")}
                            </Label>
                            <ZoneSelector
                                value={zoneId}
                                onValueChange={(id: string) => {
                                    setZoneId(id);
                                    // We need the zone name for the project item
                                    // The ZoneSelector doesn't expose it, so we'll read it from the DOM
                                    // Actually, we store it via a workaround: set it after selection
                                }}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {tc("cancel")}
                    </Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                        {t("createAndSelect")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Main Component ────────────────────────

export function CreateListingSheet({
    open,
    onOpenChange,
    workspaceId,
    userId,
}: CreateListingSheetProps) {
    const t = useTranslations("listings");
    const tc = useTranslations("common");
    const tlt = useTranslations("listingTypes");
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [contacts, setContacts] = useContacts();
    const [projects, setProjects] = useProjects();

    // Quick-create dialog state
    const [showQuickContact, setShowQuickContact] = useState(false);
    const [showQuickProject, setShowQuickProject] = useState(false);

    // Form state
    const [listingName, setListingName] = useState("");
    const [propertyType, setPropertyType] = useState("");
    const [listingType, setListingType] = useState("");
    const [projectId, setProjectId] = useState("");
    const [sellerContactId, setSellerContactId] = useState("");
    const [zone, setZone] = useState("");
    const [bts, setBts] = useState("");
    const [mrt, setMrt] = useState("");
    const [unitNo, setUnitNo] = useState("");
    const [bedrooms, setBedrooms] = useState("");
    const [bathrooms, setBathrooms] = useState("");
    const [sizeSqm, setSizeSqm] = useState("");
    const [floor, setFloor] = useState("");
    const [building, setBuilding] = useState("");
    const [viewField, setViewField] = useState("");
    const [direction, setDirection] = useState("");
    const [unitCondition, setUnitCondition] = useState("");
    const [streetSoi, setStreetSoi] = useState("");
    const [askingPrice, setAskingPrice] = useState("");
    const [rentalPrice, setRentalPrice] = useState("");
    const [commissionRate, setCommissionRate] = useState("");
    const [priceRemark, setPriceRemark] = useState("");
    const [isManualName, setIsManualName] = useState(false);

    // Auto-generated name: project_name when in_project, else property_type_thai + street_soi
    const autoName = (() => {
        if (projectId) {
            const proj = projects.find((p) => p.id === projectId);
            return proj?.project_name_english ?? "";
        }
        const typeThai = PROPERTY_TYPE_THAI[propertyType] ?? "";
        return [typeThai, streetSoi].filter(Boolean).join(" ");
    })();

    const effectiveName = isManualName ? listingName : autoName;

    function resetForm() {
        setListingName(""); setPropertyType(""); setListingType("");
        setProjectId(""); setSellerContactId(""); setZone("");
        setBts(""); setMrt(""); setStreetSoi(""); setUnitNo(""); setBedrooms("");
        setBathrooms(""); setSizeSqm(""); setFloor(""); setBuilding("");
        setViewField(""); setDirection(""); setUnitCondition("");
        setAskingPrice(""); setRentalPrice(""); setCommissionRate(""); setPriceRemark("");
        setIsManualName(false);
    }

    // Project auto-fill
    function handleProjectChange(id: string) {
        if (id === "__none__") {
            setProjectId("");
            return;
        }
        setProjectId(id);
        const proj = projects.find((p) => p.id === id);
        if (!proj) return;

        // Auto-fill fields from project
        if (proj.property_type && !propertyType) setPropertyType(proj.property_type);
        if (proj.zones?.zone_name_english && !zone) setZone(proj.zones.zone_name_english);
        if (proj.bts && !bts) setBts(proj.bts);
        if (proj.mrt && !mrt) setMrt(proj.mrt);
    }

    function handleContactCreated(contact: ContactItem) {
        setContacts((prev) => [...prev, contact].sort((a, b) => a.first_name.localeCompare(b.first_name)));
        setSellerContactId(contact.id);
    }

    function handleProjectCreated(project: ProjectItem) {
        setProjects((prev) => [...prev, project].sort((a, b) => a.project_name_english.localeCompare(b.project_name_english)));
        // Auto-select and auto-fill from the new project
        handleProjectChange(project.id);
        // Need to set projectId explicitly since handleProjectChange uses the projects array
        // which may not have the new project yet in the closure
        setProjectId(project.id);
        if (project.property_type && !propertyType) setPropertyType(project.property_type);
        if (project.zones?.zone_name_english && !zone) setZone(project.zones.zone_name_english);
        if (project.bts && !bts) setBts(project.bts);
        if (project.mrt && !mrt) setMrt(project.mrt);
    }

    function handleSave() {
        if (!effectiveName.trim() || !propertyType || !listingType || !sellerContactId) {
            toast.error(t("validationRequired"));
            return;
        }

        startTransition(async () => {
            try {
                const selectedProject = projects.find((p) => p.id === projectId);
                const data = await createListing({
                    workspace_id: workspaceId,
                    listing_name: effectiveName.trim(),
                    property_type: propertyType as PropertyType,
                    listing_type: listingType as ListingType,
                    project_id: projectId || null,
                    project_name: selectedProject?.project_name_english ?? null,
                    in_project: !!projectId,
                    seller_contact_id: sellerContactId || null,
                    zone: zone || null,
                    bts: bts.trim() || null,
                    mrt: mrt.trim() || null,
                    street_soi: streetSoi.trim() || null,
                    unit_no: unitNo.trim() || null,
                    bedrooms: bedrooms ? parseInt(bedrooms) : null,
                    bathrooms: bathrooms ? parseInt(bathrooms) : null,
                    size_sqm: sizeSqm ? parseFloat(sizeSqm) : null,
                    floor: floor ? parseInt(floor) : null,
                    building: building.trim() || null,
                    view: viewField.trim() || null,
                    direction: direction.trim() || null,
                    unit_condition: unitCondition.trim() || null,
                    asking_price: askingPrice ? parseFloat(askingPrice) : null,
                    rental_price: rentalPrice ? parseFloat(rentalPrice) : null,
                    commission_rate: commissionRate ? parseFloat(commissionRate) : null,
                    price_remark: priceRemark.trim() || null,
                    created_by_id: userId,
                    last_updated_by_id: userId,
                    last_updated_at: new Date().toISOString(),
                });

                toast.success(t("listingCreated"));
                resetForm();
                onOpenChange(false);
                router.push(`/listings/${data.id}`);
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : t("failedToCreate")
                );
            }
        });
    }

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{t("newListing")}</SheetTitle>
                        <SheetDescription>
                            {t("createDescription")}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {/* Required */}
                        <div className="space-y-3 pb-4 border-b border-stone-100 dark:border-stone-800">
                            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                {tc("required")}
                            </h4>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("listingName")} <span className="text-red-500">*</span></Label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!isManualName) setListingName(autoName);
                                            setIsManualName(!isManualName);
                                        }}
                                        className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium transition-all duration-150 ease-in-out active:scale-[0.98]"
                                    >
                                        {isManualName ? (
                                            <><Wand2 className="w-3 h-3" strokeWidth={1.75} />{t("useAuto")}</>
                                        ) : (
                                            <><Pencil className="w-3 h-3" strokeWidth={1.75} />{t("editManually")}</>
                                        )}
                                    </button>
                                </div>
                                {isManualName ? (
                                    <Input
                                        placeholder="e.g. Ideo Q Siam - 1BR High Floor"
                                        value={listingName}
                                        onChange={(e) => setListingName(e.target.value)}
                                    />
                                ) : (
                                    <div className="flex items-center justify-between h-9 px-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm">
                                        <span className={autoName ? "text-stone-800 dark:text-stone-200" : "text-stone-400 italic"}>
                                            {autoName || "Fill property type & street / soi below"}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 rounded-md font-medium shrink-0 ml-2">
                                            <Wand2 className="w-2.5 h-2.5" strokeWidth={1.75} />
                                            {t("auto")}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("propertyType")} <span className="text-red-500">*</span></Label>
                                    <PropertyTypeSelect value={propertyType} onValueChange={setPropertyType} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("listingType")} <span className="text-red-500">*</span></Label>
                                    <Select value={listingType} onValueChange={setListingType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SELL">{tlt("sell")}</SelectItem>
                                            <SelectItem value="RENT">{tlt("rent")}</SelectItem>
                                            <SelectItem value="SELL_AND_RENT">{tlt("sellAndRent")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Project */}
                        <div className="space-y-3 py-4 border-b border-stone-100 dark:border-stone-800">
                            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                {t("project")}
                            </h4>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("selectProject")}</Label>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Select value={projectId} onValueChange={handleProjectChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("noProjectStandalone")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__none__" className="text-muted-foreground">
                                                    {t("noProjectStandalone")}
                                                </SelectItem>
                                                {projects.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.project_name_english}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-9 shrink-0"
                                        onClick={() => setShowQuickProject(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-1" strokeWidth={1.75} />
                                        {t("newButton")}
                                    </Button>
                                </div>
                                {projectId && (
                                    <p className="text-xs text-stone-500">
                                        {t("autoFilledFromProject")}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Seller */}
                        <div className="space-y-3 py-4 border-b border-stone-100 dark:border-stone-800">
                            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                {t("sellerContact")} <span className="text-red-500">*</span>
                            </h4>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Select value={sellerContactId} onValueChange={setSellerContactId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select contact..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {contacts.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.nickname
                                                        ? `${c.nickname} (${c.first_name})`
                                                        : `${c.first_name} ${c.last_name}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-9 shrink-0"
                                    onClick={() => setShowQuickContact(true)}
                                >
                                    <Plus className="w-4 h-4 mr-1" strokeWidth={1.75} />
                                    {t("newButton")}
                                </Button>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-3 py-4 border-b border-stone-100 dark:border-stone-800">
                            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                {t("location")}
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("zone")}</Label>
                                    <Input value={zone} onChange={(e) => setZone(e.target.value)} placeholder="Sukhumvit" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("bts")}</Label>
                                    <Input value={bts} onChange={(e) => setBts(e.target.value)} placeholder="Siam" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("mrt")}</Label>
                                    <Input value={mrt} onChange={(e) => setMrt(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("streetSoi")}</Label>
                                <Input value={streetSoi} onChange={(e) => setStreetSoi(e.target.value)} placeholder="ทองหล่อ ซ.22" />
                            </div>
                        </div>

                        {/* Unit Details */}
                        <div className="space-y-3 py-4 border-b border-stone-100 dark:border-stone-800">
                            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                {t("unitDetails")}
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("unitNo")}</Label>
                                    <Input value={unitNo} onChange={(e) => setUnitNo(e.target.value)} placeholder="2808" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("beds")}</Label>
                                    <Input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="1" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("baths")}</Label>
                                    <Input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="1" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("sqm")}</Label>
                                    <Input type="number" value={sizeSqm} onChange={(e) => setSizeSqm(e.target.value)} placeholder="34" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("floor")}</Label>
                                    <Input type="number" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="28" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("building")}</Label>
                                    <Input value={building} onChange={(e) => setBuilding(e.target.value)} placeholder="A" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("view")}</Label>
                                    <Input value={viewField} onChange={(e) => setViewField(e.target.value)} placeholder="City View" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("direction")}</Label>
                                    <Input value={direction} onChange={(e) => setDirection(e.target.value)} placeholder="North" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("condition")}</Label>
                                    <Input value={unitCondition} onChange={(e) => setUnitCondition(e.target.value)} placeholder="Furnished" />
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="space-y-3 py-4">
                            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                {t("pricing")}
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("askingPriceFull")}</Label>
                                    <Input type="number" value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} placeholder="5,200,000" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("rentalPerMonth")}</Label>
                                    <Input type="number" value={rentalPrice} onChange={(e) => setRentalPrice(e.target.value)} placeholder="25,000" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("commissionPercent")}</Label>
                                    <Input type="number" step="0.5" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} placeholder="3" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">{t("priceRemark")}</Label>
                                <Textarea
                                    value={priceRemark}
                                    onChange={(e) => setPriceRemark(e.target.value)}
                                    placeholder="e.g. 50/50 transfer fee, or seller pays all transfer fees"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    <SheetFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            {tc("cancel")}
                        </Button>
                        <Button onClick={handleSave} disabled={isPending}>
                            {isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                            {t("createListing")}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Quick-create dialogs rendered outside Sheet to avoid nested overlay issues */}
            <QuickCreateContactDialog
                open={showQuickContact}
                onOpenChange={setShowQuickContact}
                workspaceId={workspaceId}
                onCreated={handleContactCreated}
            />
            <QuickCreateProjectDialog
                open={showQuickProject}
                onOpenChange={setShowQuickProject}
                workspaceId={workspaceId}
                userId={userId}
                onCreated={handleProjectCreated}
            />
        </>
    );
}
