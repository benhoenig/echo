"use client";

import { useState, useTransition } from "react";
import {
    Plus,
    Trash2,
    Pencil,
    Users,
    Building2,
    Clock,
    Repeat,
    ArrowRight,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getActionTypeLabel } from "@/lib/reminder-engine";
import {
    createPlaybookAction,
    updatePlaybookAction,
    deletePlaybookAction,
    type PlaybookItem,
    type PlaybookFormData,
    type PipelineStageOption,
} from "./playbook-actions";

// ─── Constants (values only — labels come from i18n) ─────────────────────────

const ACTION_TYPE_VALUES = [
    "CALL", "LINE_MESSAGE", "EMAIL", "SITE_VISIT", "SEND_REPORT",
    "SEND_LISTING", "SCHEDULE_VIEWING", "SEND_CONTRACT", "INTERNAL_NOTE", "CUSTOM",
] as const;

const ACTION_TYPE_KEYS: Record<string, string> = {
    CALL: "call", LINE_MESSAGE: "lineMessage", EMAIL: "email",
    SITE_VISIT: "siteVisit", SEND_REPORT: "sendReport", SEND_LISTING: "sendListing",
    SCHEDULE_VIEWING: "scheduleViewing", SEND_CONTRACT: "sendContract",
    INTERNAL_NOTE: "internalNote", CUSTOM: "custom",
};

const LISTING_STATUS_VALUES = ["NEW", "ACTIVE", "RESERVED", "SOLD", "EXPIRED", "WITHDRAWN"] as const;
const LISTING_STATUS_KEYS: Record<string, string> = {
    NEW: "new", ACTIVE: "active", RESERVED: "reserved", SOLD: "sold", EXPIRED: "expired", WITHDRAWN: "withdrawn",
};

const PROPERTY_TYPE_VALUES = ["HOUSE", "CONDO", "TOWNHOUSE", "LAND", "COMMERCIAL", "OTHER"] as const;
const PROPERTY_TYPE_KEYS: Record<string, string> = {
    HOUSE: "house", CONDO: "condo", TOWNHOUSE: "townhouse", LAND: "land", COMMERCIAL: "commercial", OTHER: "other",
};

const POTENTIAL_TIER_VALUES = ["A", "B", "C", "D"] as const;

const LISTING_TYPE_VALUES = ["SELL", "RENT", "SELL_AND_RENT"] as const;
const LISTING_TYPE_KEYS: Record<string, string> = {
    SELL: "sell", RENT: "rent", SELL_AND_RENT: "sellAndRent",
};

// ─── Empty form state ────────────────────────────────────────────────────────

function emptyForm(): PlaybookFormData {
    return {
        module: "DEALS",
        pipelineStageId: null,
        listingStatus: null,
        potentialTier: null,
        propertyType: null,
        listingType: null,
        dealType: null,
        actionType: "CALL",
        actionLabel: "",
        actionDescription: null,
        actionTemplate: null,
        overrideIntervalDays: 3,
        isRecurring: false,
        isRequired: false,
    };
}

// ─── Filter badge helper ─────────────────────────────────────────────────────

function FilterBadges({ item }: { item: PlaybookItem }) {
    const t = useTranslations("playbook");
    const badges: { label: string; className: string }[] = [];

    if (item.pipelineStageName) {
        badges.push({ label: item.pipelineStageName, className: "border-purple-300 text-purple-600 dark:border-purple-700 dark:text-purple-400" });
    }
    if (item.listingStatus) {
        badges.push({ label: item.listingStatus, className: "border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400" });
    }
    if (item.potentialTier) {
        badges.push({ label: t("tierLabel", { tier: item.potentialTier }), className: "border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400" });
    }
    if (item.propertyType) {
        badges.push({ label: item.propertyType, className: "border-stone-300 text-stone-600 dark:border-stone-600 dark:text-stone-400" });
    }
    if (item.listingType) {
        badges.push({ label: item.listingType, className: "border-stone-300 text-stone-600 dark:border-stone-600 dark:text-stone-400" });
    }

    if (badges.length === 0) {
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-stone-200 text-stone-400">{t("allNoFilter")}</Badge>;
    }

    return (
        <div className="flex items-center gap-1 flex-wrap">
            {badges.map((b, i) => (
                <Badge key={i} variant="outline" className={cn("text-[10px] px-1.5 py-0", b.className)}>
                    {b.label}
                </Badge>
            ))}
        </div>
    );
}

// ─── Playbook Row ────────────────────────────────────────────────────────────

function PlaybookRow({
    item,
    workspaceId,
    pipelineStages,
    onRefresh,
}: {
    item: PlaybookItem;
    workspaceId: string;
    pipelineStages: PipelineStageOption[];
    onRefresh: () => void;
}) {
    const t = useTranslations("playbook");
    const tc = useTranslations("common");
    const [isPending, startTransition] = useTransition();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    const handleToggleActive = (checked: boolean) => {
        startTransition(async () => {
            try {
                await updatePlaybookAction(item.id, workspaceId, { isActive: checked });
                onRefresh();
            } catch {
                toast.error(t("failedToUpdatePlaybook"));
            }
        });
    };

    const handleDelete = () => {
        startTransition(async () => {
            try {
                await deletePlaybookAction(item.id, workspaceId);
                setShowDeleteConfirm(false);
                onRefresh();
                toast.success(t("playbookDeleted"));
            } catch {
                toast.error(t("failedToDeletePlaybook"));
            }
        });
    };

    return (
        <>
            <div
                className={cn(
                    "flex items-start gap-4 rounded-lg border p-4 transition-all",
                    item.isActive
                        ? "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700"
                        : "bg-stone-50 dark:bg-stone-800/50 border-stone-200/50 dark:border-stone-700/50 opacity-60"
                )}
            >
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Header row */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                            {item.actionLabel}
                        </span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {getActionTypeLabel(item.actionType)}
                        </Badge>
                        {item.isRequired && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                {t("required")}
                            </Badge>
                        )}
                        {!item.isActive && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-stone-300 text-stone-400">
                                {t("disabled")}
                            </Badge>
                        )}
                    </div>

                    {/* Trigger filters */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-stone-400 shrink-0">{t("triggers")}:</span>
                        <FilterBadges item={item} />
                    </div>

                    {/* Timing row */}
                    <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
                        {item.overrideIntervalDays != null ? (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {t("everyXDays", { days: item.overrideIntervalDays })}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-stone-400">
                                <Clock className="w-3 h-3" />
                                {t("noTiming")}
                            </span>
                        )}
                        {item.isRecurring && (
                            <span className="flex items-center gap-1 text-blue-500">
                                <Repeat className="w-3 h-3" />
                                {t("recurring")}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {item.actionDescription && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
                            {item.actionDescription}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <Switch
                        checked={item.isActive}
                        onCheckedChange={handleToggleActive}
                        disabled={isPending}
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-stone-400 hover:text-stone-600"
                        onClick={() => setShowEdit(true)}
                        disabled={isPending}
                        title={tc("edit")}
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-stone-400 hover:text-red-500"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isPending}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Edit dialog */}
            <EditPlaybookDialog
                item={item}
                workspaceId={workspaceId}
                pipelineStages={pipelineStages}
                open={showEdit}
                onOpenChange={setShowEdit}
                onSaved={() => {
                    setShowEdit(false);
                    onRefresh();
                }}
            />

            {/* Delete confirmation */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t("deletePlaybook")}</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-stone-500">
                        {t("deleteConfirm", { name: item.actionLabel })}
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                            {tc("cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            {tc("delete")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// ─── Edit Dialog ────────────────────────────────────────────────────────────

function EditPlaybookDialog({
    item,
    workspaceId,
    pipelineStages,
    open,
    onOpenChange,
    onSaved,
}: {
    item: PlaybookItem;
    workspaceId: string;
    pipelineStages: PipelineStageOption[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved: () => void;
}) {
    const t = useTranslations("playbook");
    const tc = useTranslations("common");
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState<PlaybookFormData>(() => itemToForm(item));

    // Reset form when dialog opens with a (possibly different) item
    const handleOpenChange = (v: boolean) => {
        if (v) setForm(itemToForm(item));
        onOpenChange(v);
    };

    const handleSave = () => {
        if (!form.actionLabel.trim()) {
            toast.error(t("actionNameRequired"));
            return;
        }
        startTransition(async () => {
            try {
                await updatePlaybookAction(item.id, workspaceId, form);
                toast.success(t("playbookUpdated"));
                onSaved();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : t("failedToUpdatePlaybook"));
            }
        });
    };

    const isDeals = form.module === "DEALS";

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("editPlaybook")}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-2">
                    {/* Step 1: Trigger Logic */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold dark:bg-orange-900/30 dark:text-orange-400">1</span>
                            {t("triggerLogic")}
                            <span className="text-xs font-normal text-stone-400">({t("optionalFilters")})</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <PlaybookFormFields
                                form={form}
                                setForm={setForm}
                                pipelineStages={pipelineStages}
                                section="trigger"
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 border-t border-stone-200 dark:border-stone-700" />
                        <ArrowRight className="w-4 h-4 text-stone-300" />
                        <div className="flex-1 border-t border-stone-200 dark:border-stone-700" />
                    </div>

                    {/* Step 2: Action Output */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold dark:bg-orange-900/30 dark:text-orange-400">2</span>
                            {t("actionOutput")}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <PlaybookFormFields
                                form={form}
                                setForm={setForm}
                                pipelineStages={pipelineStages}
                                section="action"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label className="text-xs">{tc("description")} ({tc("optional").toLowerCase()})</Label>
                            <Textarea
                                className="min-h-[60px] text-sm"
                                placeholder={t("descriptionPlaceholder")}
                                value={form.actionDescription ?? ""}
                                onChange={(e) => setForm({ ...form, actionDescription: e.target.value || null })}
                            />
                        </div>

                        {/* Template */}
                        <div className="space-y-1.5">
                            <Label className="text-xs">{t("messageTemplate")} ({tc("optional").toLowerCase()})</Label>
                            <Textarea
                                className="min-h-[60px] text-sm font-mono"
                                placeholder={t("templatePlaceholder")}
                                value={form.actionTemplate ?? ""}
                                onChange={(e) => setForm({ ...form, actionTemplate: e.target.value || null })}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        {tc("cancel")}
                    </Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? tc("saving") : tc("save")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function itemToForm(item: PlaybookItem): PlaybookFormData {
    return {
        module: item.module as "DEALS" | "LISTINGS",
        pipelineStageId: item.pipelineStageId,
        listingStatus: item.listingStatus,
        potentialTier: item.potentialTier,
        propertyType: item.propertyType,
        listingType: item.listingType,
        dealType: item.dealType,
        actionType: item.actionType,
        actionLabel: item.actionLabel,
        actionDescription: item.actionDescription,
        actionTemplate: item.actionTemplate,
        overrideIntervalDays: item.overrideIntervalDays,
        isRecurring: item.isRecurring,
        isRequired: item.isRequired,
    };
}

// ─── Shared Form Fields ─────────────────────────────────────────────────────

function PlaybookFormFields({
    form,
    setForm,
    pipelineStages,
    section,
}: {
    form: PlaybookFormData;
    setForm: (f: PlaybookFormData) => void;
    pipelineStages: PipelineStageOption[];
    section: "trigger" | "action";
}) {
    const t = useTranslations("playbook");
    const tPropTypes = useTranslations("propertyTypes");
    const tListStatuses = useTranslations("listingStatuses");
    const tListTypes = useTranslations("listingTypes");
    const isDeals = form.module === "DEALS";

    if (section === "trigger") {
        return (
            <>
                {/* Module */}
                <div className="space-y-1.5">
                    <Label className="text-xs">{t("module")}</Label>
                    <Select
                        value={form.module}
                        onValueChange={(v: "DEALS" | "LISTINGS") =>
                            setForm({ ...form, module: v, pipelineStageId: null, listingStatus: null, listingType: null })
                        }
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DEALS">
                                <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {t("deals")}</span>
                            </SelectItem>
                            <SelectItem value="LISTINGS">
                                <span className="flex items-center gap-1.5"><Building2 className="w-3 h-3" /> {t("listings")}</span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Pipeline Stage (Deals) or Listing Status (Listings) */}
                {isDeals ? (
                    <div className="space-y-1.5">
                        <Label className="text-xs">{t("pipelineStage")}</Label>
                        <Select
                            value={form.pipelineStageId ?? "__none__"}
                            onValueChange={(v) => setForm({ ...form, pipelineStageId: v === "__none__" ? null : v })}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder={t("anyStage")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">{t("anyStage")}</SelectItem>
                                {pipelineStages.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        <span className="flex items-center gap-1.5">
                                            <span
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: s.stageColor || "#78716C" }}
                                            />
                                            {s.name}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        <Label className="text-xs">{t("listingStatus")}</Label>
                        <Select
                            value={form.listingStatus ?? "__none__"}
                            onValueChange={(v) => setForm({ ...form, listingStatus: v === "__none__" ? null : v })}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder={t("anyStatus")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">{t("anyStatus")}</SelectItem>
                                {LISTING_STATUS_VALUES.map((v) => (
                                    <SelectItem key={v} value={v}>{tListStatuses(LISTING_STATUS_KEYS[v])}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Potential Tier */}
                <div className="space-y-1.5">
                    <Label className="text-xs">{t("potentialTier")}</Label>
                    <Select
                        value={form.potentialTier ?? "__none__"}
                        onValueChange={(v) => setForm({ ...form, potentialTier: v === "__none__" ? null : v })}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder={t("anyTier")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__none__">{t("anyTier")}</SelectItem>
                            {POTENTIAL_TIER_VALUES.map((v) => (
                                <SelectItem key={v} value={v}>{t("tierLabel", { tier: v })}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Property Type */}
                <div className="space-y-1.5">
                    <Label className="text-xs">{t("propertyType")}</Label>
                    <Select
                        value={form.propertyType ?? "__none__"}
                        onValueChange={(v) => setForm({ ...form, propertyType: v === "__none__" ? null : v })}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder={t("anyType")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__none__">{t("anyType")}</SelectItem>
                            {PROPERTY_TYPE_VALUES.map((v) => (
                                <SelectItem key={v} value={v}>{tPropTypes(PROPERTY_TYPE_KEYS[v])}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Listing Type (listings only) */}
                {!isDeals && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">{t("listingType")}</Label>
                        <Select
                            value={form.listingType ?? "__none__"}
                            onValueChange={(v) => setForm({ ...form, listingType: v === "__none__" ? null : v })}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder={t("anyListingType")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">{t("anyListingType")}</SelectItem>
                                {LISTING_TYPE_VALUES.map((v) => (
                                    <SelectItem key={v} value={v}>{tListTypes(LISTING_TYPE_KEYS[v])}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </>
        );
    }

    // section === "action"
    return (
        <>
            {/* Action Name */}
            <div className="space-y-1.5">
                <Label className="text-xs">{t("actionName")}</Label>
                <Input
                    className="h-9"
                    placeholder={t("actionNamePlaceholder")}
                    value={form.actionLabel}
                    onChange={(e) => setForm({ ...form, actionLabel: e.target.value })}
                />
            </div>

            {/* Action Type */}
            <div className="space-y-1.5">
                <Label className="text-xs">{t("actionType")}</Label>
                <Select
                    value={form.actionType}
                    onValueChange={(v) => setForm({ ...form, actionType: v })}
                >
                    <SelectTrigger className="h-9">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {ACTION_TYPE_VALUES.map((v) => (
                            <SelectItem key={v} value={v}>{t(ACTION_TYPE_KEYS[v])}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Interval Days */}
            <div className="space-y-1.5">
                <Label className="text-xs">{t("intervalDays")}</Label>
                <Input
                    className="h-9"
                    type="number"
                    min={1}
                    placeholder={t("intervalPlaceholder")}
                    value={form.overrideIntervalDays ?? ""}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            overrideIntervalDays: e.target.value ? parseInt(e.target.value, 10) : null,
                        })
                    }
                />
                <p className="text-[10px] text-stone-400">
                    {t("intervalHelp")}
                </p>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                    <Label className="text-xs">
                        {t("recurring")}
                        <span className="block text-[10px] text-stone-400 font-normal">
                            {t("recurringHelp")}
                        </span>
                    </Label>
                    <Switch
                        checked={form.isRecurring}
                        onCheckedChange={(v) => setForm({ ...form, isRecurring: v })}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Label className="text-xs">
                        {t("required")}
                        <span className="block text-[10px] text-stone-400 font-normal">
                            {t("requiredHelp")}
                        </span>
                    </Label>
                    <Switch
                        checked={form.isRequired}
                        onCheckedChange={(v) => setForm({ ...form, isRequired: v })}
                    />
                </div>
            </div>
        </>
    );
}

// ─── Create Form ─────────────────────────────────────────────────────────────

function CreatePlaybookForm({
    workspaceId,
    pipelineStages,
    onCreated,
    onCancel,
}: {
    workspaceId: string;
    pipelineStages: PipelineStageOption[];
    onCreated: () => void;
    onCancel: () => void;
}) {
    const t = useTranslations("playbook");
    const tc = useTranslations("common");
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState<PlaybookFormData>(emptyForm());

    const handleSubmit = () => {
        if (!form.actionLabel.trim()) {
            toast.error(t("actionNameRequired"));
            return;
        }

        startTransition(async () => {
            try {
                await createPlaybookAction(workspaceId, form);
                toast.success(t("playbookCreated"));
                onCreated();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : t("failedToCreatePlaybook"));
            }
        });
    };

    return (
        <Card className="border-orange-200 dark:border-orange-800/50">
            <CardHeader className="pb-4">
                <CardTitle className="text-base">{t("addPlaybook")}</CardTitle>
                <CardDescription>
                    {t("description")}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Step 1: Trigger Logic */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold dark:bg-orange-900/30 dark:text-orange-400">1</span>
                        {t("triggerLogic")}
                        <span className="text-xs font-normal text-stone-400">({tc("optional").toLowerCase()})</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <PlaybookFormFields
                            form={form}
                            setForm={setForm}
                            pipelineStages={pipelineStages}
                            section="trigger"
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 border-t border-stone-200 dark:border-stone-700" />
                    <ArrowRight className="w-4 h-4 text-stone-300" />
                    <div className="flex-1 border-t border-stone-200 dark:border-stone-700" />
                </div>

                {/* Step 2: Action Output */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold dark:bg-orange-900/30 dark:text-orange-400">2</span>
                        {t("actionOutput")}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <PlaybookFormFields
                            form={form}
                            setForm={setForm}
                            pipelineStages={pipelineStages}
                            section="action"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">{tc("description")} ({tc("optional").toLowerCase()})</Label>
                        <Textarea
                            className="min-h-[60px] text-sm"
                            placeholder="Explain what this action involves..."
                            value={form.actionDescription ?? ""}
                            onChange={(e) => setForm({ ...form, actionDescription: e.target.value || null })}
                        />
                    </div>

                    {/* Template */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">Message Template ({tc("optional").toLowerCase()})</Label>
                        <Textarea
                            className="min-h-[60px] text-sm font-mono"
                            placeholder="Template for the message or script..."
                            value={form.actionTemplate ?? ""}
                            onChange={(e) => setForm({ ...form, actionTemplate: e.target.value || null })}
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-2 justify-end pt-2">
                    <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
                        {tc("cancel")}
                    </Button>
                    <Button size="sm" onClick={handleSubmit} disabled={isPending}>
                        {isPending ? tc("saving") : t("addPlaybook")}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Main Content ────────────────────────────────────────────────────────────

export function PlaybookContent({
    initialPlaybooks,
    pipelineStages,
    workspaceId,
}: {
    initialPlaybooks: PlaybookItem[];
    pipelineStages: PipelineStageOption[];
    workspaceId: string;
}) {
    const t = useTranslations("playbook");
    const tReminders = useTranslations("reminders");
    const [playbooks, setPlaybooks] = useState(initialPlaybooks);
    const [showCreate, setShowCreate] = useState(false);
    const [dealsOpen, setDealsOpen] = useState(true);
    const [listingsOpen, setListingsOpen] = useState(true);

    const refreshPlaybooks = async () => {
        try {
            const { getPlaybooks } = await import("./playbook-actions");
            const fresh = await getPlaybooks(workspaceId);
            setPlaybooks(fresh);
        } catch {
            // Rely on revalidation
        }
    };

    const dealPlaybooks = playbooks.filter((p) => p.module === "DEALS");
    const listingPlaybooks = playbooks.filter((p) => p.module === "LISTINGS");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                        {t("actionPlaybooks")}
                    </h2>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                        {t("description")}
                    </p>
                </div>
                {!showCreate && (
                    <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
                        <Plus className="w-4 h-4" />
                        {t("addPlaybook")}
                    </Button>
                )}
            </div>

            {/* Create form */}
            {showCreate && (
                <CreatePlaybookForm
                    workspaceId={workspaceId}
                    pipelineStages={pipelineStages}
                    onCreated={() => {
                        setShowCreate(false);
                        refreshPlaybooks();
                    }}
                    onCancel={() => setShowCreate(false)}
                />
            )}

            {/* Deals Section */}
            <Card>
                <button
                    onClick={() => setDealsOpen(!dealsOpen)}
                    className="flex items-center gap-2 w-full px-6 py-4 text-left"
                >
                    {dealsOpen ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronRight className="w-4 h-4 text-stone-400" />}
                    <Users className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">{tReminders("deals")}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">
                        {dealPlaybooks.length}
                    </Badge>
                </button>
                {dealsOpen && (
                    <CardContent className="pt-0 space-y-2">
                        {dealPlaybooks.length === 0 ? (
                            <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-6">
                                {t("noPlaybooksDeals")}
                            </p>
                        ) : (
                            dealPlaybooks.map((p) => (
                                <PlaybookRow key={p.id} item={p} workspaceId={workspaceId} pipelineStages={pipelineStages} onRefresh={refreshPlaybooks} />
                            ))
                        )}
                    </CardContent>
                )}
            </Card>

            {/* Listings Section */}
            <Card>
                <button
                    onClick={() => setListingsOpen(!listingsOpen)}
                    className="flex items-center gap-2 w-full px-6 py-4 text-left"
                >
                    {listingsOpen ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronRight className="w-4 h-4 text-stone-400" />}
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">{tReminders("listings")}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">
                        {listingPlaybooks.length}
                    </Badge>
                </button>
                {listingsOpen && (
                    <CardContent className="pt-0 space-y-2">
                        {listingPlaybooks.length === 0 ? (
                            <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-6">
                                {t("noPlaybooksListings")}
                            </p>
                        ) : (
                            listingPlaybooks.map((p) => (
                                <PlaybookRow key={p.id} item={p} workspaceId={workspaceId} pipelineStages={pipelineStages} onRefresh={refreshPlaybooks} />
                            ))
                        )}
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
