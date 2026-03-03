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
    GitBranch,
    Clock,
    ClipboardCheck,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StageHistoryEntry = any;

interface DealDetailContentProps {
    deal: DealData;
    agents: Array<{ id: string; name: string }>;
    contacts: Array<{ id: string; name: string; contactType: string[] | null }>;
    listings: Array<{ id: string; name: string }>;
    pipelineStages: PipelineStage[];
    zones: Array<{ id: string; nameEnglish: string; nameThai: string }>;
    stageHistory: StageHistoryEntry[];
    actionsNode: ReactNode;
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
    stageHistory,
    actionsNode,
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
    const [potentialTier, setPotentialTier] = useState(deal.potential_tier ?? "");
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

        if (dealStatus === "CLOSED_LOST" && !closedLostReason.trim()) {
            toast.error("Closed lost reason is required when status is Closed Lost.");
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
                    potential_tier: potentialTier || null,
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
                    <TabsTrigger value="pipeline" className="gap-1.5">
                        <GitBranch className="w-3.5 h-3.5" />
                        Pipeline
                    </TabsTrigger>
                    <TabsTrigger value="actions" className="gap-1.5">
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        Actions
                    </TabsTrigger>
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

                            {/* Potential Tier */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Potential Tier
                                </Label>
                                <Select
                                    value={potentialTier}
                                    onValueChange={setPotentialTier}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select tier..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[
                                            { value: "A", label: "A — Hot" },
                                            { value: "B", label: "B — Warm" },
                                            { value: "C", label: "C — Cool" },
                                            { value: "D", label: "D — Cold" },
                                        ].map((opt) => (
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

                {/* Pipeline Tab */}
                <TabsContent value="pipeline" className="space-y-6">
                    <PipelineStageTimeline
                        history={stageHistory}
                        currentStage={currentStage}
                        dealCreatedAt={deal.created_at}
                        relevantStages={relevantStages}
                        pipelineStageId={pipelineStageId}
                        onStageChange={handleStageChange}
                    />
                </TabsContent>

                {/* Actions Tab */}
                <TabsContent value="actions">{actionsNode}</TabsContent>

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

// ── Pipeline Stage Timeline ──────────────────────────────────

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

function StageBadge({
    name,
    color,
}: {
    name: string;
    color: string | null;
}) {
    const badgeColor = color || "#78716c";
    return (
        <Badge
            className="text-[10px] px-2 py-0.5 border-0"
            style={{
                backgroundColor: `${badgeColor}20`,
                color: badgeColor,
            }}
        >
            {name}
        </Badge>
    );
}

function PipelineStageTimeline({
    history,
    currentStage,
    dealCreatedAt,
    relevantStages,
    pipelineStageId,
    onStageChange,
}: {
    history: StageHistoryEntry[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentStage: any;
    dealCreatedAt: string;
    relevantStages: PipelineStage[];
    pipelineStageId: string;
    onStageChange: (stageId: string) => void;
}) {
    // Build timeline entries from stage history
    const timelineEntries = history.map(
        (entry: StageHistoryEntry, idx: number) => {
            const nextEntry = history[idx + 1];

            let duration: string | null = null;
            if (nextEntry) {
                const diff =
                    new Date(nextEntry.changed_at).getTime() -
                    new Date(entry.changed_at).getTime();
                duration = formatDuration(diff);
            } else {
                // Current/latest — duration from this change to now
                const diff =
                    new Date().getTime() -
                    new Date(entry.changed_at).getTime();
                duration = formatDuration(diff);
            }

            const userName = entry.changed_by_user
                ? [
                      entry.changed_by_user.first_name,
                      entry.changed_by_user.last_name,
                  ]
                      .filter(Boolean)
                      .join(" ")
                : null;

            return {
                fromStage: entry.from_stage,
                toStage: entry.to_stage,
                changedAt: entry.changed_at,
                userName,
                duration,
                timeInPreviousStage: entry.time_in_previous_stage,
            };
        }
    );

    // Days in current stage
    const daysInCurrentStage = (() => {
        if (history.length === 0) {
            // No stage changes — calculate from deal creation
            const diff =
                new Date().getTime() - new Date(dealCreatedAt).getTime();
            return Math.floor(diff / (1000 * 60 * 60 * 24));
        }
        const lastEntry = history[history.length - 1];
        if (lastEntry) {
            const diff =
                new Date().getTime() -
                new Date(lastEntry.changed_at).getTime();
            return Math.floor(diff / (1000 * 60 * 60 * 24));
        }
        return null;
    })();

    return (
        <div className="space-y-6">
            {/* Current Stage Card */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <GitBranch
                            className="w-4 h-4 text-stone-500"
                            strokeWidth={1.75}
                        />
                        Current Stage
                    </h3>
                    {daysInCurrentStage != null && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-md">
                            <Clock
                                className="w-3 h-3"
                                strokeWidth={1.75}
                            />
                            {daysInCurrentStage} days in current stage
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Select
                        value={pipelineStageId}
                        onValueChange={onStageChange}
                    >
                        <SelectTrigger className="w-[240px]">
                            <SelectValue placeholder="Select stage..." />
                        </SelectTrigger>
                        <SelectContent>
                            {relevantStages.map((s: PipelineStage) => (
                                <SelectItem key={s.id} value={s.id}>
                                    {s.name}
                                    {s.isDefault ? " (Default)" : ""}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {currentStage && (
                        <StageBadge
                            name={currentStage.pipeline_stage_name}
                            color={currentStage.stage_color}
                        />
                    )}
                </div>
            </div>

            {/* Stage History Timeline */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                    <Clock
                        className="w-4 h-4 text-stone-500"
                        strokeWidth={1.75}
                    />
                    Stage History
                </h3>

                {timelineEntries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No stage transitions recorded yet. Deal created on{" "}
                        {formatDate(dealCreatedAt)}.
                    </p>
                ) : (
                    <div className="relative">
                        {timelineEntries.map(
                            (
                                entry: {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    fromStage: any;
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    toStage: any;
                                    changedAt: string;
                                    userName: string | null;
                                    duration: string | null;
                                    timeInPreviousStage: number | null;
                                },
                                idx: number
                            ) => {
                                const isLast =
                                    idx === timelineEntries.length - 1;

                                return (
                                    <div
                                        key={idx}
                                        className="flex gap-3 relative"
                                    >
                                        {/* Vertical line + dot */}
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                                                    isLast
                                                        ? "bg-orange-500 ring-2 ring-orange-200 dark:ring-orange-800"
                                                        : "bg-stone-300 dark:bg-stone-600"
                                                }`}
                                            />
                                            {!isLast && (
                                                <div className="w-px flex-1 bg-stone-200 dark:bg-stone-700 min-h-[24px]" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div
                                            className={`pb-4 ${isLast ? "pb-0" : ""}`}
                                        >
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {entry.fromStage && (
                                                    <>
                                                        <StageBadge
                                                            name={
                                                                entry.fromStage
                                                                    .pipeline_stage_name
                                                            }
                                                            color={
                                                                entry.fromStage
                                                                    .stage_color
                                                            }
                                                        />
                                                        <span className="text-[11px] text-muted-foreground">
                                                            →
                                                        </span>
                                                    </>
                                                )}
                                                <StageBadge
                                                    name={
                                                        entry.toStage
                                                            .pipeline_stage_name
                                                    }
                                                    color={
                                                        entry.toStage
                                                            .stage_color
                                                    }
                                                />
                                                {entry.duration && (
                                                    <span className="text-[11px] text-muted-foreground">
                                                        for {entry.duration}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[11px] text-muted-foreground">
                                                    {formatDate(
                                                        entry.changedAt
                                                    )}{" "}
                                                    at{" "}
                                                    {formatTime(
                                                        entry.changedAt
                                                    )}
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
                            }
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
