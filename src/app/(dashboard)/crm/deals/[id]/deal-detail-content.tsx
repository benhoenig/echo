"use client";

import { useState, useTransition, ReactNode, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowLeft,
    Save,
    Loader2,
    Archive,
    ArchiveRestore,
    Handshake,
    MessageSquare,
    Activity,
    ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateDeal, updateDealStage, archiveDeal, restoreDeal } from "../deal-actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DealData = any;

interface PipelineStage {
    id: string;
    name: string;
    pipelineType: string;
    color: string | null;
    order: number;
    isDefault: boolean;
}

const DEAL_STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Active" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "CLOSED_WON", label: "Closed Won" },
    { value: "CLOSED_LOST", label: "Closed Lost" },
];

const LEAD_SOURCE_OPTIONS = [
    { value: "LINE", label: "LINE" },
    { value: "WEBSITE", label: "Website" },
    { value: "REFERRAL", label: "Referral" },
    { value: "FACEBOOK", label: "Facebook" },
    { value: "WALK_IN", label: "Walk-in" },
    { value: "COLD_CALL", label: "Cold Call" },
];

const TIMELINE_OPTIONS = [
    { value: "IMMEDIATE", label: "Immediate" },
    { value: "ONE_TO_THREE_MONTHS", label: "1–3 months" },
    { value: "THREE_TO_SIX_MONTHS", label: "3–6 months" },
    { value: "SIX_PLUS_MONTHS", label: "6+ months" },
];

const PURCHASE_PURPOSE_OPTIONS = [
    { value: "OWN_USE", label: "Own use" },
    { value: "INVESTMENT", label: "Investment" },
    { value: "BOTH", label: "Both" },
];

const FINANCING_OPTIONS = [
    { value: "CASH", label: "Cash" },
    { value: "MORTGAGE", label: "Mortgage" },
    { value: "MIXED", label: "Mixed" },
];

const PROPERTY_TYPE_OPTIONS = [
    "HOUSE",
    "CONDO",
    "TOWNHOUSE",
    "LAND",
    "COMMERCIAL",
    "OTHER",
] as const;

interface DealDetailContentProps {
    deal: DealData;
    agents: Array<{ id: string; name: string }>;
    contacts: Array<{ id: string; name: string; contactType: string[] | null }>;
    listings: Array<{ id: string; name: string }>;
    pipelineStages: PipelineStage[];
    zones: Array<{ id: string; nameEnglish: string; nameThai: string }>;
    commentsNode: ReactNode;
    activityFeedNode: ReactNode;
}

export function DealDetailContent({
    deal,
    agents,
    contacts,
    listings,
    pipelineStages,
    zones,
    commentsNode,
    activityFeedNode,
}: DealDetailContentProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Core deal fields
    const [dealName, setDealName] = useState(deal.deal_name ?? "");
    const [dealType, setDealType] = useState<"BUY_SIDE" | "SELL_SIDE">(
        deal.deal_type ?? "BUY_SIDE"
    );
    const [buyerContactId, setBuyerContactId] = useState(
        deal.buyer_contact_id ?? ""
    );
    const [sellerContactId, setSellerContactId] = useState(
        deal.seller_contact_id ?? ""
    );
    const [listingId, setListingId] = useState(deal.listing_id ?? "");
    const [dealStatus, setDealStatus] = useState(deal.deal_status ?? "ACTIVE");
    const [closedLostReason, setClosedLostReason] = useState(
        deal.closed_lost_reason ?? ""
    );
    const [leadSource, setLeadSource] = useState(deal.lead_source ?? "");
    const [estimatedValue, setEstimatedValue] = useState(
        deal.estimated_deal_value?.toString() ?? ""
    );
    const [commissionRate, setCommissionRate] = useState(
        deal.commission_rate?.toString() ?? ""
    );
    const [assignedToId, setAssignedToId] = useState(
        deal.assigned_to_id ?? ""
    );
    const [notes, setNotes] = useState(deal.notes ?? "");

    // Pipeline stage
    const [pipelineStageId, setPipelineStageId] = useState(
        deal.pipeline_stage_id ?? ""
    );

    const relevantStages = useMemo(
        () =>
            pipelineStages.filter((s) =>
                dealType === "BUY_SIDE"
                    ? s.pipelineType === "BUYER"
                    : s.pipelineType === "SELLER"
            ),
        [pipelineStages, dealType]
    );

    // Buyer requirement fields
    const [budgetMin, setBudgetMin] = useState(
        deal.budget_min?.toString() ?? ""
    );
    const [budgetMax, setBudgetMax] = useState(
        deal.budget_max?.toString() ?? ""
    );
    const [preferredZoneIds, setPreferredZoneIds] = useState<string[]>(
        deal.preferred_zone_ids ?? []
    );
    const [preferredPropertyType, setPreferredPropertyType] = useState<
        string[]
    >(deal.preferred_property_type ?? []);
    const [preferredBedrooms, setPreferredBedrooms] = useState(
        deal.preferred_bedrooms?.toString() ?? ""
    );
    const [preferredSizeMin, setPreferredSizeMin] = useState(
        deal.preferred_size_min?.toString() ?? ""
    );
    const [preferredSizeMax, setPreferredSizeMax] = useState(
        deal.preferred_size_max?.toString() ?? ""
    );
    const [preferredFloorMin, setPreferredFloorMin] = useState(
        deal.preferred_floor_min?.toString() ?? ""
    );
    const [preferredFloorMax, setPreferredFloorMax] = useState(
        deal.preferred_floor_max?.toString() ?? ""
    );
    const [preferredFacilities, setPreferredFacilities] = useState<string[]>(
        deal.preferred_facilities ?? []
    );
    const [hasPet, setHasPet] = useState<boolean>(deal.has_pet ?? false);
    const [hasEvCar, setHasEvCar] = useState<boolean>(deal.has_ev_car ?? false);
    const [parkingSlotsNeeded, setParkingSlotsNeeded] = useState(
        deal.parking_slots_needed?.toString() ?? ""
    );
    const [painPoints, setPainPoints] = useState(deal.pain_points ?? "");
    const [specialRequirements, setSpecialRequirements] = useState(
        deal.special_requirements ?? ""
    );
    const [timeline, setTimeline] = useState(deal.timeline ?? "");
    const [purposeOfPurchase, setPurposeOfPurchase] = useState(
        deal.purpose_of_purchase ?? ""
    );
    const [financingMethod, setFinancingMethod] = useState(
        deal.financing_method ?? ""
    );
    const [preApprovedAmount, setPreApprovedAmount] = useState(
        deal.pre_approved_amount?.toString() ?? ""
    );
    const [preApprovalExpiryDate, setPreApprovalExpiryDate] = useState(
        deal.pre_approval_expiry_date
            ? new Date(deal.pre_approval_expiry_date)
                  .toISOString()
                  .split("T")[0]
            : ""
    );

    // Facility input
    const [facilityInput, setFacilityInput] = useState("");

    function toggleZone(zoneId: string) {
        setPreferredZoneIds((prev) =>
            prev.includes(zoneId)
                ? prev.filter((id) => id !== zoneId)
                : [...prev, zoneId]
        );
    }

    function togglePropertyType(type: string) {
        setPreferredPropertyType((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type]
        );
    }

    function addFacility() {
        const val = facilityInput.trim();
        if (val && !preferredFacilities.includes(val)) {
            setPreferredFacilities((prev) => [...prev, val]);
        }
        setFacilityInput("");
    }

    function removeFacility(facility: string) {
        setPreferredFacilities((prev) => prev.filter((f) => f !== facility));
    }

    // Stage change handler
    function handleStageChange(newStageId: string) {
        if (newStageId === pipelineStageId) return;
        setPipelineStageId(newStageId);
        startTransition(async () => {
            try {
                await updateDealStage(deal.id, newStageId);
                toast.success("Pipeline stage updated.");
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to update stage."
                );
                setPipelineStageId(deal.pipeline_stage_id);
            }
        });
    }

    function handleSave() {
        if (!dealName.trim()) {
            toast.error("Deal name is required.");
            return;
        }

        const estValue = estimatedValue ? parseFloat(estimatedValue) : null;
        const commRate = commissionRate ? parseFloat(commissionRate) : null;
        const estCommission =
            estValue && commRate ? (estValue * commRate) / 100 : null;

        startTransition(async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const updates: Record<string, any> = {
                    deal_name: dealName.trim(),
                    deal_type: dealType,
                    buyer_contact_id: buyerContactId || null,
                    seller_contact_id: sellerContactId || null,
                    listing_id: listingId || null,
                    deal_status: dealStatus,
                    closed_lost_reason:
                        dealStatus === "CLOSED_LOST"
                            ? closedLostReason.trim() || null
                            : null,
                    lead_source: leadSource || null,
                    estimated_deal_value: estValue,
                    commission_rate: commRate,
                    estimated_commission: estCommission,
                    assigned_to_id: assignedToId || null,
                    notes: notes.trim() || null,
                };

                // Include buyer requirements for buy-side deals
                if (dealType === "BUY_SIDE") {
                    updates.budget_min = budgetMin
                        ? parseFloat(budgetMin)
                        : null;
                    updates.budget_max = budgetMax
                        ? parseFloat(budgetMax)
                        : null;
                    updates.preferred_zone_ids = preferredZoneIds;
                    updates.preferred_property_type = preferredPropertyType;
                    updates.preferred_bedrooms = preferredBedrooms
                        ? parseInt(preferredBedrooms)
                        : null;
                    updates.preferred_size_min = preferredSizeMin
                        ? parseFloat(preferredSizeMin)
                        : null;
                    updates.preferred_size_max = preferredSizeMax
                        ? parseFloat(preferredSizeMax)
                        : null;
                    updates.preferred_floor_min = preferredFloorMin
                        ? parseInt(preferredFloorMin)
                        : null;
                    updates.preferred_floor_max = preferredFloorMax
                        ? parseInt(preferredFloorMax)
                        : null;
                    updates.preferred_facilities = preferredFacilities;
                    updates.has_pet = hasPet;
                    updates.has_ev_car = hasEvCar;
                    updates.parking_slots_needed = parkingSlotsNeeded
                        ? parseInt(parkingSlotsNeeded)
                        : null;
                    updates.pain_points = painPoints.trim() || null;
                    updates.special_requirements =
                        specialRequirements.trim() || null;
                    updates.timeline = timeline || null;
                    updates.purpose_of_purchase = purposeOfPurchase || null;
                    updates.financing_method = financingMethod || null;
                    updates.pre_approved_amount = preApprovedAmount
                        ? parseFloat(preApprovedAmount)
                        : null;
                    updates.pre_approval_expiry_date = preApprovalExpiryDate
                        ? new Date(preApprovalExpiryDate).toISOString()
                        : null;
                }

                await updateDeal(deal.id, updates);
                toast.success("Deal updated.");
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to update deal."
                );
            }
        });
    }

    function handleArchiveRestore() {
        startTransition(async () => {
            try {
                if (deal.archived) {
                    await restoreDeal(deal.id);
                    toast.success("Deal restored.");
                } else {
                    await archiveDeal(deal.id);
                    toast.success("Deal archived.");
                }
                router.refresh();
                router.push("/crm/deals");
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to update deal."
                );
            }
        });
    }

    // Display helpers
    const buyerName = deal.buyer_contact
        ? deal.buyer_contact.nickname ||
          [
              deal.buyer_contact.first_name,
              deal.buyer_contact.last_name,
          ]
              .filter(Boolean)
              .join(" ")
        : null;

    const sellerName = deal.seller_contact
        ? deal.seller_contact.nickname ||
          [
              deal.seller_contact.first_name,
              deal.seller_contact.last_name,
          ]
              .filter(Boolean)
              .join(" ")
        : null;

    const currentStage = deal.pipeline_stages;
    const isBuySide = dealType === "BUY_SIDE";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/crm/deals">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            {deal.deal_name}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                            >
                                {deal.deal_type === "BUY_SIDE"
                                    ? "Buy-side"
                                    : "Sell-side"}
                            </Badge>
                            {currentStage && (
                                <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0"
                                    style={{
                                        borderColor:
                                            currentStage.stage_color || undefined,
                                        color:
                                            currentStage.stage_color || undefined,
                                    }}
                                >
                                    {currentStage.pipeline_stage_name}
                                </Badge>
                            )}
                            <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0"
                            >
                                {deal.deal_status?.replace(/_/g, " ")}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleArchiveRestore}
                        disabled={isPending}
                    >
                        {deal.archived ? (
                            <ArchiveRestore className="w-4 h-4 mr-1.5" />
                        ) : (
                            <Archive className="w-4 h-4 mr-1.5" />
                        )}
                        {deal.archived ? "Restore" : "Archive"}
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isPending}
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

            {/* Tabs */}
            <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="details" className="gap-1.5">
                        <Handshake className="w-3.5 h-3.5" />
                        Details
                    </TabsTrigger>
                    {isBuySide && (
                        <TabsTrigger value="requirements" className="gap-1.5">
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Buyer Requirements
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="comments" className="gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Comments
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        Activity
                    </TabsTrigger>
                </TabsList>

                {/* ─── Details Tab ─── */}
                <TabsContent value="details" className="space-y-6">
                    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-6">
                        <h2 className="text-sm font-semibold text-foreground mb-4">
                            Deal Information
                        </h2>

                        {/* Deal Type Toggle */}
                        <div className="space-y-2 mb-5">
                            <Label className="text-sm font-medium">
                                Deal Type
                            </Label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDealType("BUY_SIDE")}
                                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${
                                        dealType === "BUY_SIDE"
                                            ? "border-orange-500 bg-orange-500/10 text-orange-600"
                                            : "border-stone-200 dark:border-stone-700 text-muted-foreground hover:bg-stone-50 dark:hover:bg-stone-800"
                                    }`}
                                >
                                    Buy-side
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDealType("SELL_SIDE")}
                                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${
                                        dealType === "SELL_SIDE"
                                            ? "border-orange-500 bg-orange-500/10 text-orange-600"
                                            : "border-stone-200 dark:border-stone-700 text-muted-foreground hover:bg-stone-50 dark:hover:bg-stone-800"
                                    }`}
                                >
                                    Sell-side
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Deal Name */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Deal Name *
                                </Label>
                                <Input
                                    value={dealName}
                                    onChange={(e) =>
                                        setDealName(e.target.value)
                                    }
                                />
                            </div>

                            {/* Buyer Contact */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Buyer Contact
                                </Label>
                                <Select
                                    value={buyerContactId}
                                    onValueChange={setBuyerContactId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="None" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contacts.map((c) => (
                                            <SelectItem
                                                key={c.id}
                                                value={c.id}
                                            >
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Seller Contact */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Seller Contact
                                </Label>
                                <Select
                                    value={sellerContactId}
                                    onValueChange={setSellerContactId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="None" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contacts.map((c) => (
                                            <SelectItem
                                                key={c.id}
                                                value={c.id}
                                            >
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Linked Listing */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Linked Listing
                                </Label>
                                <Select
                                    value={listingId}
                                    onValueChange={setListingId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="None" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {listings.map((l) => (
                                            <SelectItem
                                                key={l.id}
                                                value={l.id}
                                            >
                                                {l.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Pipeline Stage */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Pipeline Stage
                                </Label>
                                <Select
                                    value={pipelineStageId}
                                    onValueChange={handleStageChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select stage..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {relevantStages.map((s) => (
                                            <SelectItem
                                                key={s.id}
                                                value={s.id}
                                            >
                                                {s.name}
                                                {s.isDefault
                                                    ? " (Default)"
                                                    : ""}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Status
                                </Label>
                                <Select
                                    value={dealStatus}
                                    onValueChange={setDealStatus}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DEAL_STATUS_OPTIONS.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Estimated Value */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Estimated Value (THB)
                                </Label>
                                <Input
                                    type="number"
                                    value={estimatedValue}
                                    onChange={(e) =>
                                        setEstimatedValue(e.target.value)
                                    }
                                    placeholder="e.g. 5000000"
                                    className="font-mono tabular-nums"
                                />
                            </div>

                            {/* Commission Rate */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Commission Rate (%)
                                </Label>
                                <Input
                                    type="number"
                                    value={commissionRate}
                                    onChange={(e) =>
                                        setCommissionRate(e.target.value)
                                    }
                                    placeholder="e.g. 3"
                                    className="font-mono tabular-nums"
                                />
                            </div>

                            {/* Lead Source */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Lead Source
                                </Label>
                                <Select
                                    value={leadSource}
                                    onValueChange={setLeadSource}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select source..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LEAD_SOURCE_OPTIONS.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Assigned To */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Assigned To
                                </Label>
                                <Select
                                    value={assignedToId}
                                    onValueChange={setAssignedToId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Unassigned" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {agents.map((a) => (
                                            <SelectItem
                                                key={a.id}
                                                value={a.id}
                                            >
                                                {a.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Closed Lost Reason */}
                        {dealStatus === "CLOSED_LOST" && (
                            <div className="mt-4 space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Closed Lost Reason *
                                </Label>
                                <Textarea
                                    value={closedLostReason}
                                    onChange={(e) =>
                                        setClosedLostReason(e.target.value)
                                    }
                                    rows={2}
                                    placeholder="Why was this deal lost?"
                                />
                            </div>
                        )}

                        {/* Notes */}
                        <div className="mt-4 space-y-1.5">
                            <Label className="text-xs text-muted-foreground">
                                Notes
                            </Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                placeholder="Any additional notes..."
                            />
                        </div>
                    </div>

                    {/* Quick Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {buyerName && (
                            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-4">
                                <p className="text-xs text-muted-foreground mb-1">
                                    Buyer
                                </p>
                                <Link
                                    href={`/crm/contacts/${deal.buyer_contact_id}`}
                                    className="text-sm font-medium text-orange-600 hover:underline"
                                >
                                    {buyerName}
                                </Link>
                            </div>
                        )}
                        {sellerName && (
                            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-4">
                                <p className="text-xs text-muted-foreground mb-1">
                                    Seller
                                </p>
                                <Link
                                    href={`/crm/contacts/${deal.seller_contact_id}`}
                                    className="text-sm font-medium text-orange-600 hover:underline"
                                >
                                    {sellerName}
                                </Link>
                            </div>
                        )}
                        {deal.listing_id && deal.listing && (
                            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-4">
                                <p className="text-xs text-muted-foreground mb-1">
                                    Listing
                                </p>
                                <Link
                                    href={`/listings/${deal.listing_id}`}
                                    className="text-sm font-medium text-orange-600 hover:underline"
                                >
                                    {deal.listing.listing_name ||
                                        "View Listing"}
                                </Link>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* ─── Buyer Requirements Tab ─── */}
                {isBuySide && (
                    <TabsContent value="requirements" className="space-y-6">
                        {/* Budget & Size */}
                        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-6">
                            <h2 className="text-sm font-semibold text-foreground mb-4">
                                Budget & Size
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">
                                        Budget Min (THB)
                                    </Label>
                                    <Input
                                        type="number"
                                        value={budgetMin}
                                        onChange={(e) =>
                                            setBudgetMin(e.target.value)
                                        }
                                        placeholder="e.g. 3000000"
                                        className="font-mono tabular-nums"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">
                                        Budget Max (THB)
                                    </Label>
                                    <Input
                                        type="number"
                                        value={budgetMax}
                                        onChange={(e) =>
                                            setBudgetMax(e.target.value)
                                        }
                                        placeholder="e.g. 8000000"
                                        className="font-mono tabular-nums"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">
                                        Min Bedrooms
                                    </Label>
                                    <Input
                                        type="number"
                                        value={preferredBedrooms}
                                        onChange={(e) =>
                                            setPreferredBedrooms(
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. 2"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">
                                        Size Min (sqm)
                                    </Label>
                                    <Input
                                        type="number"
                                        value={preferredSizeMin}
                                        onChange={(e) =>
                                            setPreferredSizeMin(e.target.value)
                                        }
                                        placeholder="e.g. 35"
                                        className="font-mono tabular-nums"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">
                                        Size Max (sqm)
                                    </Label>
                                    <Input
                                        type="number"
                                        value={preferredSizeMax}
                                        onChange={(e) =>
                                            setPreferredSizeMax(e.target.value)
                                        }
                                        placeholder="e.g. 80"
                                        className="font-mono tabular-nums"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">
                                        Parking Slots Needed
                                    </Label>
                                    <Input
                                        type="number"
                                        value={parkingSlotsNeeded}
                                        onChange={(e) =>
                                            setParkingSlotsNeeded(
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. 1"
                                    />
                                </div>
                            </div>

                            {/* Floor Preference */}
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">
                                        Floor Min
                                    </Label>
                                    <Input
                                        type="number"
                                        value={preferredFloorMin}
                                        onChange={(e) =>
                                            setPreferredFloorMin(
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. 10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">
                                        Floor Max
                                    </Label>
                                    <Input
                                        type="number"
                                        value={preferredFloorMax}
                                        onChange={(e) =>
                                            setPreferredFloorMax(
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. 30"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Property Type */}
                        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-6">
                            <h2 className="text-sm font-semibold text-foreground mb-4">
                                Property Type
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {PROPERTY_TYPE_OPTIONS.map((type) => (
                                    <label
                                        key={type}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={preferredPropertyType.includes(
                                                type
                                            )}
                                            onCheckedChange={() =>
                                                togglePropertyType(type)
                                            }
                                        />
                                        <span className="text-sm capitalize">
                                            {type.toLowerCase().replace(/_/g, " ")}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Preferred Zones */}
                        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-6">
                            <h2 className="text-sm font-semibold text-foreground mb-4">
                                Preferred Zones
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {zones.map((zone) => (
                                    <button
                                        key={zone.id}
                                        type="button"
                                        onClick={() => toggleZone(zone.id)}
                                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                                            preferredZoneIds.includes(zone.id)
                                                ? "border-orange-500 bg-orange-500/10 text-orange-600 font-medium"
                                                : "border-stone-200 dark:border-stone-700 text-muted-foreground hover:bg-stone-50 dark:hover:bg-stone-800"
                                        }`}
                                    >
                                        {zone.nameEnglish}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Lifestyle & Preferences */}
                        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-6">
                            <h2 className="text-sm font-semibold text-foreground mb-4">
                                Lifestyle
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center justify-between rounded-lg border border-stone-200 dark:border-stone-700 px-4 py-3">
                                    <Label className="text-sm">Pet Owner</Label>
                                    <Switch
                                        checked={hasPet}
                                        onCheckedChange={setHasPet}
                                    />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-stone-200 dark:border-stone-700 px-4 py-3">
                                    <Label className="text-sm">
                                        EV Car Owner
                                    </Label>
                                    <Switch
                                        checked={hasEvCar}
                                        onCheckedChange={setHasEvCar}
                                    />
                                </div>
                            </div>

                            {/* Facilities */}
                            <div className="mt-4 space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                    Preferred Facilities
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={facilityInput}
                                        onChange={(e) =>
                                            setFacilityInput(e.target.value)
                                        }
                                        placeholder="e.g. Pool, Gym, Sauna..."
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addFacility();
                                            }
                                        }}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addFacility}
                                    >
                                        Add
                                    </Button>
                                </div>
                                {preferredFacilities.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {preferredFacilities.map(
                                            (f: string) => (
                                                <Badge
                                                    key={f}
                                                    variant="secondary"
                                                    className="text-xs cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30"
                                                    onClick={() =>
                                                        removeFacility(f)
                                                    }
                                                >
                                                    {f} ×
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Purchase Intent */}
                        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-6">
                            <h2 className="text-sm font-semibold text-foreground mb-4">
                                Purchase Intent
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">
                                        Timeline
                                    </Label>
                                    <Select
                                        value={timeline}
                                        onValueChange={setTimeline}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TIMELINE_OPTIONS.map((opt) => (
                                                <SelectItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">
                                        Purpose of Purchase
                                    </Label>
                                    <Select
                                        value={purposeOfPurchase}
                                        onValueChange={setPurposeOfPurchase}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PURCHASE_PURPOSE_OPTIONS.map(
                                                (opt) => (
                                                    <SelectItem
                                                        key={opt.value}
                                                        value={opt.value}
                                                    >
                                                        {opt.label}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">
                                        Financing Method
                                    </Label>
                                    <Select
                                        value={financingMethod}
                                        onValueChange={setFinancingMethod}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FINANCING_OPTIONS.map((opt) => (
                                                <SelectItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {(financingMethod === "MORTGAGE" ||
                                    financingMethod === "MIXED") && (
                                    <>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">
                                                Pre-approved Amount (THB)
                                            </Label>
                                            <Input
                                                type="number"
                                                value={preApprovedAmount}
                                                onChange={(e) =>
                                                    setPreApprovedAmount(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g. 5000000"
                                                className="font-mono tabular-nums"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">
                                                Pre-approval Expiry Date
                                            </Label>
                                            <Input
                                                type="date"
                                                value={preApprovalExpiryDate}
                                                onChange={(e) =>
                                                    setPreApprovalExpiryDate(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Pain Points & Special Requirements */}
                        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-6">
                            <h2 className="text-sm font-semibold text-foreground mb-4">
                                Additional Notes
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">
                                        Pain Points
                                    </Label>
                                    <Textarea
                                        value={painPoints}
                                        onChange={(e) =>
                                            setPainPoints(e.target.value)
                                        }
                                        rows={3}
                                        placeholder="What issues or frustrations does the buyer have with their current situation?"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">
                                        Special Requirements
                                    </Label>
                                    <Textarea
                                        value={specialRequirements}
                                        onChange={(e) =>
                                            setSpecialRequirements(
                                                e.target.value
                                            )
                                        }
                                        rows={3}
                                        placeholder="Any specific requirements not covered by the fields above..."
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                )}

                {/* Comments Tab */}
                <TabsContent value="comments">{commentsNode}</TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity">
                    {activityFeedNode}
                </TabsContent>
            </Tabs>
        </div>
    );
}
