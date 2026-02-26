"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    ArrowLeft,
    Save,
    Trash2,
    Loader2,
    Pencil,
    Wand2,
    Clock,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateListing, archiveListing } from "../listing-actions";
import { ListingStatusBadge, LISTING_STATUSES } from "@/components/shared/listing-status-badge";
import { ListingGradeBadge, LISTING_GRADES } from "@/components/shared/listing-grade-badge";
import { PropertyTypeSelect, PROPERTY_TYPE_THAI } from "@/components/shared/property-type-select";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ListingDetail = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ListingUpdate = any;

interface PriceHistoryEntry {
    price: number;
    date: string;
    changed_by: string | null;
}

interface ListingDetailContentProps {
    listing: ListingDetail;
    updates: ListingUpdate[];
}

export function ListingDetailContent({ listing, updates }: ListingDetailContentProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Form state — initialise from listing
    const [form, setForm] = useState({
        listing_name: listing.listing_name ?? "",
        listing_status: listing.listing_status ?? "NEW",
        listing_grade: listing.listing_grade ?? "",
        listing_type: listing.listing_type ?? "SELL",
        property_type: listing.property_type ?? "",
        project_name: listing.project_name ?? "",
        zone: listing.zone ?? "",
        bts: listing.bts ?? "",
        mrt: listing.mrt ?? "",
        street_soi: listing.street_soi ?? "",
        unit_no: listing.unit_no ?? "",
        bedrooms: listing.bedrooms?.toString() ?? "",
        bathrooms: listing.bathrooms?.toString() ?? "",
        size_sqm: listing.size_sqm?.toString() ?? "",
        floor: listing.floor?.toString() ?? "",
        stories: listing.stories?.toString() ?? "",
        building: listing.building ?? "",
        view: listing.view ?? "",
        direction: listing.direction ?? "",
        parking_slots: listing.parking_slots?.toString() ?? "",
        unit_condition: listing.unit_condition ?? "",
        asking_price: listing.asking_price?.toString() ?? "",
        price_remark: listing.price_remark ?? "",
        rental_price: listing.rental_price?.toString() ?? "",
        rental_remark: listing.rental_remark ?? "",
        commission_rate: listing.commission_rate?.toString() ?? "",
        seller_phone: listing.seller_phone ?? "",
        seller_line: listing.seller_line ?? "",
        google_maps_link: listing.google_maps_link ?? "",
        featured_flag: listing.featured_flag ?? false,
        focus_flag: listing.focus_flag ?? false,
        website_visible: listing.website_visible ?? false,
        exclusive_agreement: listing.exclusive_agreement ?? false,
        ddproperty_url: listing.ddproperty_url ?? "",
        livinginsider_url: listing.livinginsider_url ?? "",
        propertyhub_url: listing.propertyhub_url ?? "",
        facebook_group_url: listing.facebook_group_url ?? "",
        facebook_page_url: listing.facebook_page_url ?? "",
        tiktok_url: listing.tiktok_url ?? "",
        instagram_url: listing.instagram_url ?? "",
        youtube_url: listing.youtube_url ?? "",
    });

    const [original] = useState(form);

    // Auto-name: project_name when in_project, else property_type_thai + street_soi
    const autoName = (() => {
        if (listing.in_project && form.project_name) return form.project_name;
        const typeThai = PROPERTY_TYPE_THAI[form.property_type] ?? "";
        return [typeThai, form.street_soi].filter(Boolean).join(" ");
    })();

    const initialIsManual = (() => {
        if (listing.in_project && listing.project_name) return listing.listing_name !== listing.project_name;
        const typeThai = PROPERTY_TYPE_THAI[listing.property_type] ?? "";
        const initialAuto = [typeThai, listing.street_soi].filter(Boolean).join(" ");
        return listing.listing_name !== initialAuto;
    })();
    const [isManualName, setIsManualName] = useState(initialIsManual);

    const hasChanges =
        JSON.stringify(form) !== JSON.stringify(original) ||
        (!isManualName && autoName !== original.listing_name);

    function updateField(field: string, value: string | boolean) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleSave() {
        startTransition(async () => {
            try {
                const payload: Record<string, unknown> = {};
                for (const [key, val] of Object.entries(form)) {
                    if (val !== (original as Record<string, unknown>)[key]) {
                        // Convert numeric strings to numbers
                        if (["bedrooms", "bathrooms", "floor", "stories", "parking_slots"].includes(key)) {
                            payload[key] = val ? parseInt(val as string) : null;
                        } else if (["size_sqm", "asking_price", "rental_price", "commission_rate"].includes(key)) {
                            payload[key] = val ? parseFloat(val as string) : null;
                        } else if (val === "") {
                            payload[key] = null;
                        } else {
                            payload[key] = val;
                        }
                    }
                }

                // If auto mode, override listing_name with auto-generated value when it changed
                if (!isManualName && autoName !== (original as Record<string, unknown>).listing_name) {
                    payload.listing_name = autoName;
                }

                await updateListing(listing.id, payload);
                toast.success("Listing updated.");
                router.refresh();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to update.");
            }
        });
    }

    function handleArchive() {
        startTransition(async () => {
            try {
                await archiveListing(listing.id);
                toast.success("Listing archived.");
                router.push("/listings");
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to archive.");
            }
        });
    }

    // Contact info
    const sellerContact = listing.contacts;
    const sellerName = sellerContact
        ? sellerContact.nickname || `${sellerContact.first_name} ${sellerContact.last_name}`
        : null;

    // Project info
    const project = listing.projects;

    // Filter updates to status changes only for the timeline
    const statusUpdates = updates.filter(
        (u: ListingUpdate) => u.field_changed === "listing_status"
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/listings")}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {listing.listing_name}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <ListingStatusBadge status={listing.listing_status} />
                            <ListingGradeBadge grade={listing.listing_grade} />
                            {listing.featured_flag && (
                                <span className="text-[11px] text-amber-600 font-medium">⭐ Featured</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={!hasChanges || isPending}
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-1.5" />
                        )}
                        Save Changes
                    </Button>
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4 mr-1.5" />
                                Archive
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Archive this listing?</DialogTitle>
                                <DialogDescription>
                                    This will hide the listing from the main table. You can restore it later.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleArchive} disabled={isPending}>
                                    {isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                                    Archive Listing
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Cards */}
            <div className="space-y-4">
                {/* Key Info */}
                <Section title="Key Information">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Listing Name with auto/manual toggle */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-muted-foreground">Listing Name</Label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!isManualName) updateField("listing_name", autoName);
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
                                <Input value={form.listing_name} onChange={(e) => updateField("listing_name", e.target.value)} />
                            ) : (
                                <div className="flex items-center justify-between h-9 px-3 rounded-lg border border-stone-200 bg-stone-50 text-sm">
                                    <span className={autoName ? "text-stone-800" : "text-stone-400 italic"}>
                                        {autoName || "—"}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[11px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md font-medium shrink-0 ml-2">
                                        <Wand2 className="w-2.5 h-2.5" strokeWidth={1.75} />
                                        Auto
                                    </span>
                                </div>
                            )}
                        </div>
                        <Field label="Property Type">
                            <PropertyTypeSelect value={form.property_type} onValueChange={(v) => updateField("property_type", v)} />
                        </Field>
                        <Field label="Listing Type">
                            <Select value={form.listing_type} onValueChange={(v) => updateField("listing_type", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SELL">Sell</SelectItem>
                                    <SelectItem value="RENT">Rent</SelectItem>
                                    <SelectItem value="SELL_AND_RENT">Sell & Rent</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Status">
                            <Select value={form.listing_status} onValueChange={(v) => updateField("listing_status", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {LISTING_STATUSES.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Grade">
                            <Select value={form.listing_grade} onValueChange={(v) => updateField("listing_grade", v)}>
                                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                <SelectContent>
                                    {LISTING_GRADES.map((g) => (
                                        <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Project">
                            <p className="text-sm text-foreground">
                                {project?.project_name_english ?? listing.project_name ?? "—"}
                            </p>
                        </Field>
                    </div>
                    {/* Seller */}
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                        <Field label="Seller Contact">
                            <p className="text-sm text-foreground">{sellerName ?? "—"}</p>
                        </Field>
                        <Field label="Seller Phone">
                            <Input value={form.seller_phone} onChange={(e) => updateField("seller_phone", e.target.value)} />
                        </Field>
                        <Field label="Seller LINE">
                            <Input value={form.seller_line} onChange={(e) => updateField("seller_line", e.target.value)} />
                        </Field>
                    </div>
                </Section>

                {/* Location */}
                <Section title="Location">
                    <div className="grid grid-cols-3 gap-4">
                        <Field label="Zone">
                            <Input value={form.zone} onChange={(e) => updateField("zone", e.target.value)} />
                        </Field>
                        <Field label="BTS">
                            <Input value={form.bts} onChange={(e) => updateField("bts", e.target.value)} />
                        </Field>
                        <Field label="MRT">
                            <Input value={form.mrt} onChange={(e) => updateField("mrt", e.target.value)} />
                        </Field>
                        <Field label="Street / Soi">
                            <Input value={form.street_soi} onChange={(e) => updateField("street_soi", e.target.value)} />
                        </Field>
                        <div className="col-span-2">
                            <Field label="Google Maps Link">
                                <Input value={form.google_maps_link} onChange={(e) => updateField("google_maps_link", e.target.value)} />
                            </Field>
                        </div>
                    </div>
                </Section>

                {/* Unit Details */}
                <Section title="Unit Details">
                    <div className="grid grid-cols-4 gap-4">
                        <Field label="Unit No">
                            <Input value={form.unit_no} onChange={(e) => updateField("unit_no", e.target.value)} />
                        </Field>
                        <Field label="Bedrooms">
                            <Input type="number" value={form.bedrooms} onChange={(e) => updateField("bedrooms", e.target.value)} />
                        </Field>
                        <Field label="Bathrooms">
                            <Input type="number" value={form.bathrooms} onChange={(e) => updateField("bathrooms", e.target.value)} />
                        </Field>
                        <Field label="Size (sqm)">
                            <Input type="number" value={form.size_sqm} onChange={(e) => updateField("size_sqm", e.target.value)} />
                        </Field>
                        <Field label="Floor">
                            <Input type="number" value={form.floor} onChange={(e) => updateField("floor", e.target.value)} />
                        </Field>
                        <Field label="Stories">
                            <Input type="number" value={form.stories} onChange={(e) => updateField("stories", e.target.value)} />
                        </Field>
                        <Field label="Building">
                            <Input value={form.building} onChange={(e) => updateField("building", e.target.value)} />
                        </Field>
                        <Field label="Parking Slots">
                            <Input type="number" value={form.parking_slots} onChange={(e) => updateField("parking_slots", e.target.value)} />
                        </Field>
                        <Field label="View">
                            <Input value={form.view} onChange={(e) => updateField("view", e.target.value)} />
                        </Field>
                        <Field label="Direction">
                            <Input value={form.direction} onChange={(e) => updateField("direction", e.target.value)} />
                        </Field>
                        <div className="col-span-2">
                            <Field label="Unit Condition">
                                <Input value={form.unit_condition} onChange={(e) => updateField("unit_condition", e.target.value)} />
                            </Field>
                        </div>
                    </div>
                </Section>

                {/* Pricing */}
                <Section title="Pricing">
                    <div className="grid grid-cols-3 gap-4">
                        <Field label="Asking Price (฿)">
                            <Input type="number" value={form.asking_price} onChange={(e) => updateField("asking_price", e.target.value)} />
                        </Field>
                        <Field label="Rental Price (฿/mo)">
                            <Input type="number" value={form.rental_price} onChange={(e) => updateField("rental_price", e.target.value)} />
                        </Field>
                        <Field label="Commission Rate (%)">
                            <Input type="number" step="0.5" value={form.commission_rate} onChange={(e) => updateField("commission_rate", e.target.value)} />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <Field label="Price Remark">
                            <Textarea value={form.price_remark} onChange={(e) => updateField("price_remark", e.target.value)} rows={2} placeholder="Price Remark (เงื่อนไขค่าโอนฯ) — e.g. 50/50 transfer fee, or seller pays all" />
                        </Field>
                        <Field label="Rental Remark">
                            <Textarea value={form.rental_remark} onChange={(e) => updateField("rental_remark", e.target.value)} rows={2} />
                        </Field>
                    </div>
                </Section>

                {/* Flags */}
                <Section title="Flags & Visibility">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        <ToggleField label="Featured Listing" description="Highlight in search results" checked={form.featured_flag} onCheckedChange={(v) => updateField("featured_flag", v)} />
                        <ToggleField label="Focus Listing" description="Priority for team focus" checked={form.focus_flag} onCheckedChange={(v) => updateField("focus_flag", v)} />
                        <ToggleField label="Website Visible" description="Display on public website" checked={form.website_visible} onCheckedChange={(v) => updateField("website_visible", v)} />
                        <ToggleField label="Exclusive Agreement" description="Under exclusive contract" checked={form.exclusive_agreement} onCheckedChange={(v) => updateField("exclusive_agreement", v)} />
                    </div>
                </Section>

                {/* Marketing URLs */}
                <Section title="Marketing Links">
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { key: "ddproperty_url", label: "DDProperty" },
                            { key: "livinginsider_url", label: "LivingInsider" },
                            { key: "propertyhub_url", label: "PropertyHub" },
                            { key: "facebook_group_url", label: "Facebook Group" },
                            { key: "facebook_page_url", label: "Facebook Page" },
                            { key: "tiktok_url", label: "TikTok" },
                            { key: "instagram_url", label: "Instagram" },
                            { key: "youtube_url", label: "YouTube" },
                        ].map(({ key, label }) => (
                            <Field key={key} label={label}>
                                <Input
                                    value={form[key as keyof typeof form] as string}
                                    onChange={(e) => updateField(key, e.target.value)}
                                    placeholder={`https://...`}
                                />
                            </Field>
                        ))}
                    </div>
                </Section>

                {/* Status Timeline */}
                <StatusTimeline
                    updates={statusUpdates}
                    currentStatus={listing.listing_status}
                    createdAt={listing.created_at}
                    daysOnMarket={listing.days_on_market}
                    statusChangedAt={listing.listing_status_changed_at}
                />

                {/* Price History */}
                <PriceHistory
                    askingPriceHistory={listing.asking_price_history as PriceHistoryEntry[] | null}
                    currentAskingPrice={listing.asking_price}
                    currentRentalPrice={listing.rental_price}
                />
            </div>
        </div>
    );
}

// ── Helper Components ────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
            {children}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            {children}
        </div>
    );
}

function ToggleField({
    label,
    description,
    checked,
    onCheckedChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );
}

// ── Status Timeline ──────────────────────────────────────────

function formatDuration(ms: number): string {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    if (days === 0) return "< 1 day";
    if (days === 1) return "1 day";
    return `${days} days`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function StatusTimeline({
    updates,
    currentStatus,
    createdAt,
    daysOnMarket,
    statusChangedAt,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updates: any[];
    currentStatus: string;
    createdAt: string;
    daysOnMarket: number | null;
    statusChangedAt: string | null;
}) {
    // Build timeline entries from status updates
    const timelineEntries: {
        status: string;
        date: string;
        userName: string | null;
        duration: string | null;
    }[] = [];

    for (let i = 0; i < updates.length; i++) {
        const update = updates[i];
        const nextUpdate = updates[i + 1];

        const userName = update.users
            ? `${update.users.first_name} ${update.users.last_name}`
            : null;

        let duration: string | null = null;
        if (nextUpdate) {
            const diff =
                new Date(nextUpdate.updated_at).getTime() -
                new Date(update.updated_at).getTime();
            duration = formatDuration(diff);
        } else if (update.new_value === currentStatus) {
            // Current status — show duration from last change to now
            const diff =
                new Date().getTime() - new Date(update.updated_at).getTime();
            duration = formatDuration(diff);
        }

        timelineEntries.push({
            status: update.new_value ?? currentStatus,
            date: update.updated_at,
            userName,
            duration,
        });
    }

    // Calculate live days on market
    const liveDom = (() => {
        if (currentStatus === "ACTIVE" && statusChangedAt) {
            return Math.floor(
                (new Date().getTime() - new Date(statusChangedAt).getTime()) /
                    (1000 * 60 * 60 * 24)
            );
        }
        return daysOnMarket;
    })();

    return (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-500" strokeWidth={1.75} />
                    Status Timeline
                </h3>
                {liveDom != null && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-md">
                        <Clock className="w-3 h-3" strokeWidth={1.75} />
                        {liveDom} days on market
                    </span>
                )}
            </div>

            {timelineEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No status changes recorded yet. Created on{" "}
                    {formatDate(createdAt)}.
                </p>
            ) : (
                <div className="relative">
                    {timelineEntries.map((entry, idx) => {
                        const isLast = idx === timelineEntries.length - 1;
                        const isCurrent = entry.status === currentStatus && isLast;

                        return (
                            <div key={idx} className="flex gap-3 relative">
                                {/* Vertical line */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                                            isCurrent
                                                ? "bg-orange-500 ring-2 ring-orange-200 dark:ring-orange-800"
                                                : "bg-stone-300 dark:bg-stone-600"
                                        }`}
                                    />
                                    {!isLast && (
                                        <div className="w-px flex-1 bg-stone-200 dark:bg-stone-700 min-h-[24px]" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className={`pb-4 ${isLast ? "pb-0" : ""}`}>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <ListingStatusBadge status={entry.status} />
                                        {entry.duration && (
                                            <span className="text-[11px] text-muted-foreground">
                                                for {entry.duration}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[11px] text-muted-foreground">
                                            {formatDate(entry.date)} at{" "}
                                            {formatTime(entry.date)}
                                        </span>
                                        {entry.userName && (
                                            <span className="text-[11px] text-muted-foreground">
                                                by {entry.userName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Price History ────────────────────────────────────────────

function PriceHistory({
    askingPriceHistory,
    currentAskingPrice,
    currentRentalPrice,
}: {
    askingPriceHistory: PriceHistoryEntry[] | null;
    currentAskingPrice: number | null;
    currentRentalPrice: number | null;
}) {
    const history = Array.isArray(askingPriceHistory)
        ? askingPriceHistory
        : [];

    if (history.length === 0 && currentAskingPrice == null) {
        return null;
    }

    // Build full price timeline: history entries + current price
    const entries = [...history];

    // Calculate price change direction for each entry
    const priceChanges: {
        price: number;
        date: string;
        change: number | null; // absolute change from previous
        direction: "up" | "down" | "same" | null;
    }[] = [];

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (!entry) continue;
        const prev = entries[i - 1];
        const change = prev ? entry.price - prev.price : null;
        const direction =
            change == null
                ? null
                : change > 0
                  ? "up"
                  : change < 0
                    ? "down"
                    : "same";
        priceChanges.push({
            price: entry.price,
            date: entry.date,
            change,
            direction,
        });
    }

    // Add current price as the last entry
    if (currentAskingPrice != null) {
        const lastHistorical = entries[entries.length - 1];
        const change = lastHistorical
            ? currentAskingPrice - lastHistorical.price
            : null;
        const direction =
            change == null
                ? null
                : change > 0
                  ? "up"
                  : change < 0
                    ? "down"
                    : "same";
        priceChanges.push({
            price: currentAskingPrice,
            date: new Date().toISOString(),
            change,
            direction,
        });
    }

    if (priceChanges.length <= 1) {
        return null; // No history to show (only current price)
    }

    return (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                <TrendingDown className="w-4 h-4 text-stone-500" strokeWidth={1.75} />
                Price History
            </h3>

            <div className="space-y-0">
                {priceChanges.map((entry, idx) => {
                    const isLast = idx === priceChanges.length - 1;
                    const isCurrent = isLast;

                    return (
                        <div key={idx} className="flex gap-3 relative">
                            {/* Vertical line */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                                        isCurrent
                                            ? "bg-orange-500 ring-2 ring-orange-200 dark:ring-orange-800"
                                            : entry.direction === "down"
                                              ? "bg-green-500"
                                              : entry.direction === "up"
                                                ? "bg-red-500"
                                                : "bg-stone-300 dark:bg-stone-600"
                                    }`}
                                />
                                {!isLast && (
                                    <div className="w-px flex-1 bg-stone-200 dark:bg-stone-700 min-h-[24px]" />
                                )}
                            </div>

                            {/* Content */}
                            <div className={`pb-4 ${isLast ? "pb-0" : ""}`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium tabular-nums text-foreground">
                                        ฿{entry.price.toLocaleString()}
                                    </span>
                                    {isCurrent && (
                                        <span className="text-[10px] font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 rounded">
                                            Current
                                        </span>
                                    )}
                                    {entry.change != null && entry.change !== 0 && (
                                        <span
                                            className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
                                                entry.direction === "down"
                                                    ? "text-green-600 dark:text-green-400"
                                                    : "text-red-600 dark:text-red-400"
                                            }`}
                                        >
                                            {entry.direction === "down" ? (
                                                <TrendingDown className="w-3 h-3" />
                                            ) : (
                                                <TrendingUp className="w-3 h-3" />
                                            )}
                                            {entry.direction === "down" ? "-" : "+"}
                                            ฿{Math.abs(entry.change).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] text-muted-foreground">
                                    {isCurrent ? "Current price" : formatDate(entry.date)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
