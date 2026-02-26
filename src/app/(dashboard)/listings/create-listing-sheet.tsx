"use client";

import { useState, useTransition, useEffect } from "react";
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
import { Loader2, Pencil, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createListing } from "./listing-actions";
import { PropertyTypeSelect, PROPERTY_TYPE_THAI } from "@/components/shared/property-type-select";
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

function useContacts() {
    const [contacts, setContacts] = useState<{ id: string; first_name: string; last_name: string; nickname: string | null }[]>([]);
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
    return contacts;
}

function useProjects() {
    const [projects, setProjects] = useState<{
        id: string;
        project_name_english: string;
        property_type: string;
        zone_id: string | null;
        bts: string | null;
        mrt: string | null;
        zones: { zone_name_english: string } | null;
    }[]>([]);
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
    return projects;
}

export function CreateListingSheet({
    open,
    onOpenChange,
    workspaceId,
    userId,
}: CreateListingSheetProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const contacts = useContacts();
    const projects = useProjects();

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

    function handleSave() {
        if (!effectiveName.trim() || !propertyType || !listingType || !sellerContactId) {
            toast.error("Listing name, property type, listing type, and seller contact are required.");
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

                toast.success("Listing created.");
                resetForm();
                onOpenChange(false);
                router.push(`/listings/${data.id}`);
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "Failed to create listing."
                );
            }
        });
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>New Listing</SheetTitle>
                    <SheetDescription>
                        Add a new property listing. Select a project to auto-fill location details.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-6">
                    {/* Required */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Required
                        </h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Listing Name <span className="text-red-500">*</span></Label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!isManualName) setListingName(autoName);
                                        setIsManualName(!isManualName);
                                    }}
                                    className="inline-flex items-center gap-1 text-[11px] text-orange-600 hover:text-orange-700 font-medium transition-colors duration-150 active:scale-[0.98]"
                                >
                                    {isManualName ? (
                                        <><Wand2 className="w-3 h-3" strokeWidth={1.75} />Use auto</>
                                    ) : (
                                        <><Pencil className="w-3 h-3" strokeWidth={1.75} />Edit manually</>
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
                                <div className="flex items-center justify-between h-9 px-3 rounded-lg border border-stone-200 bg-stone-50 text-sm">
                                    <span className={autoName ? "text-stone-800" : "text-stone-400 italic"}>
                                        {autoName || "Fill property type & street / soi below"}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[11px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md font-medium shrink-0 ml-2">
                                        <Wand2 className="w-2.5 h-2.5" strokeWidth={1.75} />
                                        Auto
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Property Type <span className="text-red-500">*</span></Label>
                                <PropertyTypeSelect value={propertyType} onValueChange={setPropertyType} />
                            </div>
                            <div className="space-y-2">
                                <Label>Listing Type <span className="text-red-500">*</span></Label>
                                <Select value={listingType} onValueChange={setListingType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SELL">Sell</SelectItem>
                                        <SelectItem value="RENT">Rent</SelectItem>
                                        <SelectItem value="SELL_AND_RENT">Sell & Rent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Project */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Project
                        </h4>
                        <div className="space-y-2">
                            <Label>Select Project</Label>
                            <Select value={projectId} onValueChange={handleProjectChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="No project (standalone)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__" className="text-muted-foreground">
                                        No project (standalone)
                                    </SelectItem>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.project_name_english}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {projectId && (
                                <p className="text-[11px] text-muted-foreground">
                                    ✓ Zone, BTS, MRT auto-filled from project
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Seller */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Seller Contact <span className="text-red-500">*</span>
                        </h4>
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

                    {/* Location */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Location
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Label>Zone</Label>
                                <Input value={zone} onChange={(e) => setZone(e.target.value)} placeholder="Sukhumvit" />
                            </div>
                            <div className="space-y-2">
                                <Label>BTS</Label>
                                <Input value={bts} onChange={(e) => setBts(e.target.value)} placeholder="Siam" />
                            </div>
                            <div className="space-y-2">
                                <Label>MRT</Label>
                                <Input value={mrt} onChange={(e) => setMrt(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Street / Soi</Label>
                            <Input value={streetSoi} onChange={(e) => setStreetSoi(e.target.value)} placeholder="ทองหล่อ ซ.22" />
                        </div>
                    </div>

                    {/* Unit Details */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Unit Details
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Label>Unit No</Label>
                                <Input value={unitNo} onChange={(e) => setUnitNo(e.target.value)} placeholder="2808" />
                            </div>
                            <div className="space-y-2">
                                <Label>Beds</Label>
                                <Input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="1" />
                            </div>
                            <div className="space-y-2">
                                <Label>Baths</Label>
                                <Input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="1" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Label>Size (sqm)</Label>
                                <Input type="number" value={sizeSqm} onChange={(e) => setSizeSqm(e.target.value)} placeholder="34" />
                            </div>
                            <div className="space-y-2">
                                <Label>Floor</Label>
                                <Input type="number" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="28" />
                            </div>
                            <div className="space-y-2">
                                <Label>Building</Label>
                                <Input value={building} onChange={(e) => setBuilding(e.target.value)} placeholder="A" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Label>View</Label>
                                <Input value={viewField} onChange={(e) => setViewField(e.target.value)} placeholder="City View" />
                            </div>
                            <div className="space-y-2">
                                <Label>Direction</Label>
                                <Input value={direction} onChange={(e) => setDirection(e.target.value)} placeholder="North" />
                            </div>
                            <div className="space-y-2">
                                <Label>Condition</Label>
                                <Input value={unitCondition} onChange={(e) => setUnitCondition(e.target.value)} placeholder="Furnished" />
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Pricing
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Label>Asking Price (฿)</Label>
                                <Input type="number" value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} placeholder="5,200,000" />
                            </div>
                            <div className="space-y-2">
                                <Label>Rental (฿/mo)</Label>
                                <Input type="number" value={rentalPrice} onChange={(e) => setRentalPrice(e.target.value)} placeholder="25,000" />
                            </div>
                            <div className="space-y-2">
                                <Label>Commission %</Label>
                                <Input type="number" step="0.5" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} placeholder="3" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Price Remark (เงื่อนไขค่าโอนฯ)</Label>
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
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                        Create Listing
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
