"use client";

import { useState, useTransition, useMemo } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createDeal } from "./deal-actions";

interface PipelineStage {
    id: string;
    name: string;
    pipelineType: string;
    color: string | null;
    order: number;
    isDefault: boolean;
}

interface CreateDealSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
    pipelineStages: PipelineStage[];
    contacts: Array<{ id: string; name: string; contactType: string[] | null }>;
    agents: Array<{ id: string; name: string }>;
    listings: Array<{ id: string; name: string }>;
}

export function CreateDealSheet({
    open,
    onOpenChange,
    workspaceId,
    pipelineStages,
    contacts,
    agents,
    listings,
}: CreateDealSheetProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [dealName, setDealName] = useState("");
    const [dealType, setDealType] = useState<"BUY_SIDE" | "SELL_SIDE">("BUY_SIDE");
    const [buyerContactId, setBuyerContactId] = useState("");
    const [sellerContactId, setSellerContactId] = useState("");
    const [listingId, setListingId] = useState("");
    const [assignedToId, setAssignedToId] = useState("");
    const [leadSource, setLeadSource] = useState("");
    const [estimatedValue, setEstimatedValue] = useState("");
    const [commissionRate, setCommissionRate] = useState("");
    const [notes, setNotes] = useState("");

    // Get the default stage for the selected deal type
    const relevantStages = useMemo(
        () =>
            pipelineStages.filter((s) =>
                dealType === "BUY_SIDE"
                    ? s.pipelineType === "BUYER"
                    : s.pipelineType === "SELLER"
            ),
        [pipelineStages, dealType]
    );

    const defaultStage = relevantStages.find((s) => s.isDefault) ?? relevantStages[0];

    const [pipelineStageId, setPipelineStageId] = useState("");

    // Auto-generate deal name
    const autoName = useMemo(() => {
        const contactId =
            dealType === "BUY_SIDE" ? buyerContactId : sellerContactId;
        const contact = contacts.find((c) => c.id === contactId);
        const listing = listings.find((l) => l.id === listingId);
        const parts = [
            contact?.name,
            listing?.name,
            dealType === "BUY_SIDE" ? "Buy" : "Sell",
        ].filter(Boolean);
        return parts.join(" — ");
    }, [dealType, buyerContactId, sellerContactId, listingId, contacts, listings]);

    function resetForm() {
        setDealName("");
        setDealType("BUY_SIDE");
        setBuyerContactId("");
        setSellerContactId("");
        setListingId("");
        setAssignedToId("");
        setLeadSource("");
        setEstimatedValue("");
        setCommissionRate("");
        setNotes("");
        setPipelineStageId("");
    }

    function handleSubmit() {
        const stageId = pipelineStageId || defaultStage?.id;
        if (!stageId) {
            toast.error("No pipeline stage available. Please configure pipeline stages in Settings.");
            return;
        }

        const finalName = dealName.trim() || autoName || "Untitled Deal";

        startTransition(async () => {
            try {
                const estValue = estimatedValue
                    ? parseFloat(estimatedValue)
                    : null;
                const commRate = commissionRate
                    ? parseFloat(commissionRate)
                    : null;
                const estCommission =
                    estValue && commRate ? (estValue * commRate) / 100 : null;

                await createDeal(workspaceId, {
                    deal_name: finalName,
                    deal_type: dealType,
                    buyer_contact_id: buyerContactId || null,
                    seller_contact_id: sellerContactId || null,
                    listing_id: listingId || null,
                    pipeline_stage_id: stageId,
                    deal_status: "ACTIVE",
                    lead_source: leadSource || null,
                    assigned_to_id: assignedToId || null,
                    estimated_deal_value: estValue,
                    commission_rate: commRate,
                    estimated_commission: estCommission,
                    notes: notes.trim() || null,
                });

                toast.success("Deal created.");
                resetForm();
                onOpenChange(false);
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to create deal."
                );
            }
        });
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Create New Deal</SheetTitle>
                    <SheetDescription>
                        Create a deal to track a buyer or seller journey.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 mt-6">
                    {/* Deal Type */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Deal Type *</Label>
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

                    {/* Contact */}
                    {dealType === "BUY_SIDE" ? (
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">
                                Buyer Contact
                            </Label>
                            <Select
                                value={buyerContactId}
                                onValueChange={setBuyerContactId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select buyer..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {contacts.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">
                                Seller Contact
                            </Label>
                            <Select
                                value={sellerContactId}
                                onValueChange={setSellerContactId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select seller..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {contacts.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Listing */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                            Linked Listing
                        </Label>
                        <Select value={listingId} onValueChange={setListingId}>
                            <SelectTrigger>
                                <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent>
                                {listings.map((l) => (
                                    <SelectItem key={l.id} value={l.id}>
                                        {l.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Deal Name */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                            Deal Name
                        </Label>
                        <Input
                            value={dealName}
                            onChange={(e) => setDealName(e.target.value)}
                            placeholder={autoName || "Auto-generated from contact + listing"}
                        />
                        {!dealName && autoName && (
                            <p className="text-[10px] text-muted-foreground">
                                Will use: {autoName}
                            </p>
                        )}
                    </div>

                    {/* Pipeline Stage */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                            Pipeline Stage
                        </Label>
                        <Select
                            value={pipelineStageId || defaultStage?.id || ""}
                            onValueChange={setPipelineStageId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select stage..." />
                            </SelectTrigger>
                            <SelectContent>
                                {relevantStages.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.name}
                                        {s.isDefault ? " (Default)" : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Value & Commission */}
                    <div className="grid grid-cols-2 gap-3">
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
                    </div>

                    {/* Lead Source */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                            Lead Source
                        </Label>
                        <Select value={leadSource} onValueChange={setLeadSource}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select source..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LINE">LINE</SelectItem>
                                <SelectItem value="WEBSITE">Website</SelectItem>
                                <SelectItem value="REFERRAL">Referral</SelectItem>
                                <SelectItem value="FACEBOOK">Facebook</SelectItem>
                                <SelectItem value="WALK_IN">Walk-in</SelectItem>
                                <SelectItem value="COLD_CALL">Cold Call</SelectItem>
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
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
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

                    <Button
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={isPending}
                    >
                        {isPending && (
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        )}
                        Create Deal
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
