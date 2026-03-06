"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Copy,
    ExternalLink,
    Archive,
    Info,
    ShoppingCart,
    MessageSquare,
    User,
    Building2,
    FileText,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { CommentForm } from "@/components/shared/comment-form";
import {
    fetchDealQuickViewData,
    fetchDealBuyerRequirements,
} from "./deal-quick-view-actions";
import { useTranslations } from "next-intl";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DealRow = any;

interface DealQuickViewProps {
    deal: DealRow | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onArchive?: (dealId: string) => void;
}

// ── Helpers ──────────────────────────────────────────────────

function getContactName(contact: DealRow | null): string {
    if (!contact) return "—";
    return (
        contact.nickname ||
        [contact.first_name, contact.last_name].filter(Boolean).join(" ") ||
        "Unknown"
    );
}

function getStatusColor(status: string): string {
    switch (status) {
        case "ACTIVE":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        case "ON_HOLD":
            return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
        case "CLOSED_WON":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        case "CLOSED_LOST":
            return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
        default:
            return "bg-stone-100 text-stone-700";
    }
}

const TIER_COLORS: Record<string, string> = {
    A: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    B: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    C: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    D: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
};

const ACTION_DOT_COLORS: Record<string, string> = {
    CREATED: "bg-green-500",
    UPDATED: "bg-blue-500",
    DELETED: "bg-red-500",
    ARCHIVED: "bg-orange-500",
    RESTORED: "bg-teal-500",
    STATUS_CHANGED: "bg-purple-500",
    STAGE_CHANGED: "bg-indigo-500",
    COMMENT_ADDED: "bg-pink-500",
    MENTION: "bg-yellow-500",
};

const parseCommentContent = (text: string) => {
    if (!text) return null;
    // Match @[Name](user:UUID), #[Name](contact:UUID), #[Name](listing:UUID)
    const regex = /([@#]\[[^\]]+\]\([^:]+:[^\)]+\))/g;
    const parts = text.split(regex);
    return parts.map((part: string, i: number) => {
        const match = part.match(/^([@#])\[([^\]]+)\]\(([^:]+):[^\)]+\)$/);
        if (match) {
            const type = match[3]; // "user", "contact", or "listing"
            const isUser = type === "user";
            const isListing = type === "listing";
            return (
                <span
                    key={i}
                    className={`font-semibold px-1 py-0.5 rounded-sm ${
                        isUser
                            ? "text-orange-600 bg-orange-500/10"
                            : isListing
                              ? "text-emerald-600 bg-emerald-500/10"
                              : "text-blue-600 bg-blue-500/10"
                    }`}
                >
                    {match[1]}
                    {match[2]}
                </span>
            );
        }
        return <span key={i}>{part}</span>;
    });
};

// ── Main Component ──────────────────────────────────────────

export function DealQuickView({
    deal,
    open,
    onOpenChange,
    onArchive,
}: DealQuickViewProps) {
    const t = useTranslations("crm");
    const tc = useTranslations("common");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [comments, setComments] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [activityLogs, setActivityLogs] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [activityFilter, setActivityFilter] = useState<
        "ALL" | "COMMENTS" | "SYSTEM"
    >("ALL");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [buyerRequirements, setBuyerRequirements] = useState<any>(null);
    const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
    const [requirementsLoaded, setRequirementsLoaded] = useState(false);

    const TIMELINE_LABELS: Record<string, string> = useMemo(
        () => ({
            IMMEDIATE: t("immediate"),
            "1_3_MONTHS": t("oneToThreeMonths"),
            "3_6_MONTHS": t("threeToSixMonths"),
            "6_PLUS_MONTHS": t("sixPlusMonths"),
        }),
        [t]
    );

    const PURPOSE_LABELS: Record<string, string> = useMemo(
        () => ({
            OWN_USE: t("ownUse"),
            INVESTMENT: t("investment"),
            BOTH: t("both"),
        }),
        [t]
    );

    const FINANCING_LABELS: Record<string, string> = useMemo(
        () => ({
            CASH: t("cash"),
            MORTGAGE: t("mortgage"),
            MIXED: t("mixed"),
        }),
        [t]
    );

    const loadData = () => {
        if (!deal?.id || !deal?.workspace_id) return;
        setIsLoadingData(true);
        fetchDealQuickViewData(deal.workspace_id, deal.id)
            .then((data) => {
                if (data.error) {
                    toast.error(data.error);
                } else {
                    setComments(data.comments || []);
                    setActivityLogs(data.activityLogs || []);
                }
            })
            .catch(() => {
                toast.error(t("failedToLoadActivity"));
            })
            .finally(() => {
                setIsLoadingData(false);
            });
    };

    const loadRequirements = () => {
        if (!deal?.id || requirementsLoaded) return;
        setIsLoadingRequirements(true);
        fetchDealBuyerRequirements(deal.id)
            .then((data) => {
                if (!data.error) {
                    setBuyerRequirements(data.requirements);
                }
            })
            .finally(() => {
                setIsLoadingRequirements(false);
                setRequirementsLoaded(true);
            });
    };

    useEffect(() => {
        if (open && deal?.id) {
            loadData();
            setBuyerRequirements(null);
            setRequirementsLoaded(false);
        } else {
            setComments([]);
            setActivityLogs([]);
            setBuyerRequirements(null);
            setRequirementsLoaded(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, deal?.id]);

    if (!deal) return null;

    const buyerContact = deal.buyer_contact;
    const assignedName = deal.assigned_user
        ? [deal.assigned_user.first_name, deal.assigned_user.last_name]
              .filter(Boolean)
              .join(" ")
        : null;

    const stageColor =
        deal.pipeline_stages?.stage_color || "#78716c";
    const stageName =
        deal.pipeline_stages?.pipeline_stage_name || "Unknown";

    const copyLink = () => {
        const url = `${window.location.origin}/crm/deals/${deal.id}`;
        navigator.clipboard.writeText(url);
        toast.success(tc("linkCopied"));
    };

    const tabCount = 3;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto bg-white dark:bg-stone-900 p-0 flex flex-col">
                {/* Sticky Header */}
                <div className="px-6 py-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-10 space-y-3">
                    <SheetHeader className="text-left flex flex-row items-start justify-between space-y-0 p-0 border-0">
                        <div className="flex-1 min-w-0">
                            <SheetTitle className="text-lg font-semibold text-stone-800 dark:text-stone-100 truncate">
                                {deal.deal_name || t("untitledDeal")}
                            </SheetTitle>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {/* Pipeline Stage */}
                                <Badge
                                    variant="secondary"
                                    className="text-xs gap-1.5"
                                >
                                    <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{
                                            backgroundColor: stageColor,
                                        }}
                                    />
                                    {stageName}
                                </Badge>
                                {/* Status */}
                                <Badge
                                    className={`text-xs border-0 ${getStatusColor(deal.deal_status)}`}
                                >
                                    {deal.deal_status?.replace(/_/g, " ")}
                                </Badge>
                                {/* Tier */}
                                {deal.potential_tier && (
                                    <Badge
                                        className={`text-xs border-0 ${TIER_COLORS[deal.potential_tier] ?? ""}`}
                                    >
                                        {t("tier")} {deal.potential_tier}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </SheetHeader>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-2"
                        >
                            <Link href={`/crm/deals/${deal.id}`}>
                                <ExternalLink className="w-4 h-4" />
                                {tc("viewDetails")}
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={copyLink}
                            className="gap-2"
                        >
                            <Copy className="w-4 h-4" />
                            {tc("copyLink")}
                        </Button>
                        {onArchive && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-destructive hover:text-destructive ml-auto"
                                onClick={() => {
                                    onArchive(deal.id);
                                    onOpenChange(false);
                                }}
                            >
                                <Archive className="w-4 h-4" />
                                {tc("archive")}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tabs Content */}
                <div className="flex-1 px-6 py-4">
                    <Tabs
                        defaultValue="overview"
                        className="w-full"
                        onValueChange={(v) => {
                            if (v === "requirements") {
                                loadRequirements();
                            }
                        }}
                    >
                        <TabsList
                            className="grid w-full mb-6 grid-cols-3"
                        >
                            <TabsTrigger value="overview" className="gap-2">
                                <Info className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    {tc("overview")}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="requirements"
                                className="gap-2"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    {t("requirements")}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="activity" className="gap-2">
                                <MessageSquare className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    {tc("activity")}
                                </span>
                            </TabsTrigger>
                        </TabsList>

                        {/* ── Overview Tab ─────────────────────────── */}
                        <TabsContent
                            value="overview"
                            className="space-y-4 min-h-[400px]"
                        >
                            {/* Deal Info Card */}
                            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4 space-y-4">
                                <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                                    {t("dealInformation")}
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoField
                                        label={t("estimatedValue")}
                                        value={
                                            deal.estimated_deal_value
                                                ? `฿${deal.estimated_deal_value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                                                : null
                                        }
                                        mono
                                    />
                                    <InfoField
                                        label={t("commissionRate")}
                                        value={
                                            deal.commission_rate
                                                ? `${deal.commission_rate}%`
                                                : null
                                        }
                                    />
                                    <InfoField
                                        label={t("estCommission")}
                                        value={
                                            deal.estimated_commission
                                                ? `฿${deal.estimated_commission.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                                                : null
                                        }
                                        mono
                                    />
                                    <InfoField
                                        label={t("leadSource")}
                                        value={deal.lead_source?.replace(
                                            /_/g,
                                            " "
                                        )}
                                    />
                                    <InfoField
                                        label={t("assignedAgent")}
                                        value={assignedName}
                                    />
                                </div>
                            </div>

                            {/* Contact Card */}
                            {buyerContact && (
                                <ContactCard
                                    label={t("buyer")}
                                    contact={buyerContact}
                                />
                            )}

                            {/* Linked Listing */}
                            {deal.listing && (
                                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-stone-400" />
                                        <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                                            {t("linkedListing")}
                                        </h4>
                                    </div>
                                    <Link
                                        href={`/listings/${deal.listing.id}`}
                                        className="text-sm text-orange-600 hover:text-orange-700 mt-2 block"
                                    >
                                        {deal.listing.listing_name ||
                                            t("untitled")}
                                    </Link>
                                </div>
                            )}

                            {/* Notes */}
                            {deal.notes && (
                                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-stone-400" />
                                        <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                                            {tc("notes")}
                                        </h4>
                                    </div>
                                    <p className="text-sm text-stone-600 dark:text-stone-400 whitespace-pre-wrap">
                                        {deal.notes}
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        {/* ── Requirements Tab ──────────────────── */}
                        <TabsContent
                            value="requirements"
                            className="space-y-4 min-h-[400px]"
                        >
                            {isLoadingRequirements ? (
                                <div className="py-12 flex justify-center text-muted-foreground text-sm">
                                    {t("loadingRequirements")}
                                </div>
                            ) : buyerRequirements ? (
                                <RequirementsDisplay
                                    req={buyerRequirements}
                                    timelineLabels={TIMELINE_LABELS}
                                    purposeLabels={PURPOSE_LABELS}
                                    financingLabels={FINANCING_LABELS}
                                />
                            ) : (
                                <div className="py-12 text-center text-sm text-muted-foreground">
                                    {t("noRequirementsSet")}
                                </div>
                            )}
                        </TabsContent>

                        {/* ── Activity Tab ────────────────────────── */}
                        <TabsContent
                            value="activity"
                            className="space-y-6 min-h-[400px]"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold">
                                    {tc("activityFeed")}
                                </h3>
                                <div className="flex items-center bg-muted/50 p-1 rounded-md border text-xs">
                                    {(
                                        ["ALL", "COMMENTS", "SYSTEM"] as const
                                    ).map((f) => (
                                        <button
                                            key={f}
                                            onClick={() =>
                                                setActivityFilter(f)
                                            }
                                            className={`px-3 py-1.5 rounded-sm font-medium transition-colors ${
                                                activityFilter === f
                                                    ? "bg-background shadow-sm text-foreground"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            {f === "ALL"
                                                ? tc("all")
                                                : f === "COMMENTS"
                                                  ? tc("comments")
                                                  : tc("system")}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {isLoadingData ? (
                                <div className="py-12 flex justify-center text-muted-foreground text-sm">
                                    {tc("loadingActivity")}
                                </div>
                            ) : (
                                <>
                                    {(activityFilter === "ALL" ||
                                        activityFilter === "COMMENTS") && (
                                        <div className="flex flex-col gap-6">
                                            <div className="space-y-4">
                                                {comments.length === 0 ? (
                                                    <div className="text-sm text-muted-foreground italic">
                                                        {tc("noCommentsYet")}
                                                    </div>
                                                ) : (
                                                    comments.map(
                                                        (comment: any) => (
                                                            <CommentItem
                                                                key={
                                                                    comment.id
                                                                }
                                                                comment={
                                                                    comment
                                                                }
                                                            />
                                                        )
                                                    )
                                                )}
                                            </div>

                                            <CommentForm
                                                workspaceId={
                                                    deal.workspace_id
                                                }
                                                entityType="DEAL"
                                                entityId={deal.id}
                                                onSuccess={loadData}
                                            />
                                        </div>
                                    )}

                                    {(activityFilter === "ALL" ||
                                        activityFilter === "SYSTEM") && (
                                        <div
                                            className={`pt-4 space-y-0 ${activityFilter === "ALL" ? "mt-8 border-t" : ""}`}
                                        >
                                            {activityLogs.length === 0 ? (
                                                <div className="text-sm text-muted-foreground italic">
                                                    {tc("noSystemActivity")}
                                                </div>
                                            ) : (
                                                activityLogs.map(
                                                    (log: any) => (
                                                        <ActivityLogItem
                                                            key={log.id}
                                                            log={log}
                                                        />
                                                    )
                                                )
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ── Sub-components ──────────────────────────────────────────

function InfoField({
    label,
    value,
    mono,
}: {
    label: string;
    value: string | null | undefined;
    mono?: boolean;
}) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p
                className={`text-sm font-medium ${mono ? "font-mono tabular-nums" : ""}`}
            >
                {value || "—"}
            </p>
        </div>
    );
}

function ContactCard({
    label,
    contact,
}: {
    label: string;
    contact: DealRow;
}) {
    const name = getContactName(contact);
    return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-stone-400" />
                <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                    {label}
                </h4>
            </div>
            <Link
                href={`/crm/contacts/${contact.id}`}
                className="text-sm text-orange-600 hover:text-orange-700 block"
            >
                {name}
            </Link>
            {contact.phone_primary && (
                <p className="text-xs text-muted-foreground mt-1">
                    {contact.phone_primary}
                </p>
            )}
            {contact.email && (
                <p className="text-xs text-muted-foreground mt-0.5">
                    {contact.email}
                </p>
            )}
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CommentItem({ comment }: { comment: any }) {
    const tc = useTranslations("common");

    const user = Array.isArray(comment.users)
        ? comment.users[0]
        : comment.users;
    const authorName = user
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
        : tc("unknownUser");
    const initials = user
        ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
        : "??";

    if (comment.is_deleted) {
        return (
            <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                    {initials}
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">
                            {authorName}
                        </p>
                        <p
                            className="text-xs text-muted-foreground"
                            title={format(
                                new Date(comment.created_at),
                                "PPpp"
                            )}
                        >
                            {formatDistanceToNow(
                                new Date(comment.created_at),
                                { addSuffix: true }
                            )}
                        </p>
                    </div>
                    <div className="text-sm italic text-muted-foreground mt-1 rounded-md bg-muted/50 p-3">
                        {tc("commentDeleted")}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-4 group">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {initials}
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">
                        {authorName}
                    </p>
                    <p
                        className="text-xs text-muted-foreground"
                        title={format(
                            new Date(comment.created_at),
                            "PPpp"
                        )}
                    >
                        {formatDistanceToNow(
                            new Date(comment.created_at),
                            { addSuffix: true }
                        )}
                    </p>
                </div>
                <div className="text-sm text-foreground mt-1 bg-muted/40 p-3 rounded-md whitespace-pre-wrap leading-relaxed shadow-sm">
                    {parseCommentContent(comment.content)}
                </div>
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActivityLogItem({ log }: { log: any }) {
    const dotColor = ACTION_DOT_COLORS[log.action_type] || "bg-stone-300";
    const user = Array.isArray(log.users) ? log.users[0] : log.users;
    const actorName = user
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
        : "System";

    return (
        <div className="flex items-start gap-3 py-2">
            <span
                className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 shrink-0`}
            />
            <div className="flex-1 min-w-0">
                <p className="text-sm text-stone-500 dark:text-stone-400">
                    <span className="font-medium text-stone-800 dark:text-stone-100">
                        {actorName}
                    </span>{" "}
                    {log.description}
                </p>
                <p
                    className="text-xs text-stone-400 dark:text-stone-500 mt-0.5"
                    title={format(new Date(log.created_at), "PPpp")}
                >
                    {formatDistanceToNow(new Date(log.created_at), {
                        addSuffix: true,
                    })}
                </p>
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RequirementsDisplay({
    req,
    timelineLabels,
    purposeLabels,
    financingLabels,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req: any;
    timelineLabels: Record<string, string>;
    purposeLabels: Record<string, string>;
    financingLabels: Record<string, string>;
}) {
    const t = useTranslations("crm");

    const hasAnyValue =
        req.budget_min ||
        req.budget_max ||
        req.preferred_bedrooms ||
        req.preferred_size_min ||
        req.preferred_size_max ||
        req.preferred_property_type?.length > 0 ||
        req.preferred_zone_ids?.length > 0 ||
        req.timeline ||
        req.purpose_of_purchase ||
        req.financing_method;

    if (!hasAnyValue) {
        return (
            <div className="py-12 text-center text-sm text-muted-foreground">
                {t("noRequirementsSet")}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Budget & Size */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                    {t("budgetAndSize")}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <InfoField
                        label={t("budgetRange")}
                        value={
                            req.budget_min || req.budget_max
                                ? `฿${(req.budget_min ?? 0).toLocaleString()} – ฿${(req.budget_max ?? 0).toLocaleString()}`
                                : null
                        }
                        mono
                    />
                    <InfoField
                        label={t("bedrooms")}
                        value={
                            req.preferred_bedrooms
                                ? `${req.preferred_bedrooms}+`
                                : null
                        }
                    />
                    <InfoField
                        label={t("sizeRange")}
                        value={
                            req.preferred_size_min || req.preferred_size_max
                                ? `${req.preferred_size_min ?? "—"} – ${req.preferred_size_max ?? "—"} sqm`
                                : null
                        }
                    />
                    <InfoField
                        label={t("floorRange")}
                        value={
                            req.preferred_floor_min || req.preferred_floor_max
                                ? `${req.preferred_floor_min ?? "—"} – ${req.preferred_floor_max ?? "—"}`
                                : null
                        }
                    />
                    <InfoField
                        label={t("parking")}
                        value={
                            req.parking_slots_needed
                                ? t("parkingSlots", { count: req.parking_slots_needed })
                                : null
                        }
                    />
                </div>
                {(req.has_pet || req.has_ev_car) && (
                    <div className="flex gap-2 mt-2">
                        {req.has_pet && (
                            <Badge variant="secondary" className="text-xs">
                                {t("hasPet")}
                            </Badge>
                        )}
                        {req.has_ev_car && (
                            <Badge variant="secondary" className="text-xs">
                                {t("hasEvCar")}
                            </Badge>
                        )}
                    </div>
                )}
            </div>

            {/* Property Types */}
            {req.preferred_property_type?.length > 0 && (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                        {t("propertyTypes")}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {req.preferred_property_type.map((pt: string) => (
                            <Badge
                                key={pt}
                                variant="secondary"
                                className="text-xs"
                            >
                                {pt.replace(/_/g, " ")}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Facilities */}
            {req.preferred_facilities?.length > 0 && (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                        {t("facilities")}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {req.preferred_facilities.map((f: string) => (
                            <Badge
                                key={f}
                                variant="secondary"
                                className="text-xs"
                            >
                                {f}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Timeline & Financing */}
            {(req.timeline ||
                req.purpose_of_purchase ||
                req.financing_method) && (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                        {t("purchaseDetails")}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <InfoField
                            label={t("timeline")}
                            value={
                                timelineLabels[req.timeline] ?? req.timeline
                            }
                        />
                        <InfoField
                            label={t("purpose")}
                            value={
                                purposeLabels[req.purpose_of_purchase] ??
                                req.purpose_of_purchase
                            }
                        />
                        <InfoField
                            label={t("financing")}
                            value={
                                financingLabels[req.financing_method] ??
                                req.financing_method
                            }
                        />
                        <InfoField
                            label={t("preApproved")}
                            value={
                                req.pre_approved_amount
                                    ? `฿${req.pre_approved_amount.toLocaleString()}`
                                    : null
                            }
                            mono
                        />
                    </div>
                </div>
            )}

            {/* Pain Points / Special Requirements */}
            {(req.pain_points || req.special_requirements) && (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                        {t("additionalNotes")}
                    </h4>
                    {req.pain_points && (
                        <div>
                            <p className="text-xs text-muted-foreground">
                                {t("painPoints")}
                            </p>
                            <p className="text-sm text-stone-600 dark:text-stone-400 whitespace-pre-wrap mt-0.5">
                                {req.pain_points}
                            </p>
                        </div>
                    )}
                    {req.special_requirements && (
                        <div>
                            <p className="text-xs text-muted-foreground">
                                {t("specialRequirements")}
                            </p>
                            <p className="text-sm text-stone-600 dark:text-stone-400 whitespace-pre-wrap mt-0.5">
                                {req.special_requirements}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
