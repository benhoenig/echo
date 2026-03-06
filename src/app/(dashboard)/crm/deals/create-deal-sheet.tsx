"use client";

import { useState, useTransition, useMemo } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
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
import { useTranslations } from "next-intl";

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
    const t = useTranslations("crm");
    const tc = useTranslations("common");
    const tf = useTranslations("filters");

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [dealName, setDealName] = useState("");
    const [buyerContactId, setBuyerContactId] = useState("");
    const [listingId, setListingId] = useState("");
    const [assignedToId, setAssignedToId] = useState("");
    const [leadSource, setLeadSource] = useState("");
    const [estimatedValue, setEstimatedValue] = useState("");
    const [commissionRate, setCommissionRate] = useState("");
    const [notes, setNotes] = useState("");

    // Get the default stage for buy-side deals
    const relevantStages = useMemo(
        () => pipelineStages.filter((s) => s.pipelineType === "BUYER"),
        [pipelineStages]
    );

    const defaultStage = relevantStages.find((s) => s.isDefault) ?? relevantStages[0];

    const [pipelineStageId, setPipelineStageId] = useState("");

    // Auto-generate deal name
    const autoName = useMemo(() => {
        const contact = contacts.find((c) => c.id === buyerContactId);
        const listing = listings.find((l) => l.id === listingId);
        const parts = [contact?.name, listing?.name, t("buy")].filter(Boolean);
        return parts.join(" — ");
    }, [buyerContactId, listingId, contacts, listings, t]);

    function resetForm() {
        setDealName("");
        setBuyerContactId("");
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
            toast.error(t("noPipelineStage"));
            return;
        }

        const finalName = dealName.trim() || autoName || t("untitledDeal");

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
                    deal_type: "BUY_SIDE",
                    buyer_contact_id: buyerContactId || null,
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

                toast.success(t("dealCreated"));
                resetForm();
                onOpenChange(false);
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : t("failedToCreateDeal")
                );
            }
        });
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{t("newDeal")}</SheetTitle>
                    <SheetDescription>
                        {t("createDealDescription")}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {/* Contact & Listing */}
                    <div className="space-y-3 py-4 border-b border-stone-100 dark:border-stone-800">
                        <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                            {t("contactAndListing")}
                        </h4>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                {t("buyerContact")}
                            </Label>
                            <Select
                                value={buyerContactId}
                                onValueChange={setBuyerContactId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("selectBuyer")} />
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

                        {/* Listing */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                {t("linkedListing")}
                            </Label>
                            <Select value={listingId} onValueChange={setListingId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={tc("none")} />
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
                    </div>

                    {/* Deal Details */}
                    <div className="space-y-3 py-4 border-b border-stone-100 dark:border-stone-800">
                        <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                            {t("dealDetails")}
                        </h4>

                        {/* Deal Name */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                {t("dealName")}
                            </Label>
                            <Input
                                value={dealName}
                                onChange={(e) => setDealName(e.target.value)}
                                placeholder={autoName || t("autoGeneratedName")}
                            />
                            {!dealName && autoName && (
                                <p className="text-xs text-stone-500">
                                    Will use: {autoName}
                                </p>
                            )}
                        </div>

                        {/* Pipeline Stage */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                {t("pipelineStage")}
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
                                            {s.isDefault ? ` (${tc("default")})` : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Value & Commission */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                    {t("estimatedValue")}
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
                                <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                    {t("commissionRate")}
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
                    </div>

                    {/* Assignment & Source */}
                    <div className="space-y-3 py-4 border-b border-stone-100 dark:border-stone-800">
                        <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                            {t("assignment")}
                        </h4>

                        {/* Lead Source */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                {t("leadSource")}
                            </Label>
                            <Select value={leadSource} onValueChange={setLeadSource}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("selectSource")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LINE">{tf("line")}</SelectItem>
                                    <SelectItem value="WEBSITE">{tf("website")}</SelectItem>
                                    <SelectItem value="REFERRAL">{tf("referral")}</SelectItem>
                                    <SelectItem value="FACEBOOK">{tf("facebook")}</SelectItem>
                                    <SelectItem value="WALK_IN">{tf("walkIn")}</SelectItem>
                                    <SelectItem value="COLD_CALL">{tf("coldCall")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Assigned To */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                {t("assignedTo")}
                            </Label>
                            <Select
                                value={assignedToId}
                                onValueChange={setAssignedToId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={tc("unassigned")} />
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
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5 py-4">
                        <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                            {tc("notes")}
                        </Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder=""
                        />
                    </div>
                </div>

                <SheetFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {tc("cancel")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending}
                    >
                        {isPending && (
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        )}
                        {t("createDeal")}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
