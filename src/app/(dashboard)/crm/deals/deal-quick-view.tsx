"use client";

import { useEffect, useState } from "react";
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

const TIMELINE_LABELS: Record<string, string> = {
    IMMEDIATE: "Immediate",
    "1_3_MONTHS": "1–3 months",
    "3_6_MONTHS": "3–6 months",
    "6_PLUS_MONTHS": "6+ months",
};

const PURPOSE_LABELS: Record<string, string> = {
    OWN_USE: "Own use",
    INVESTMENT: "Investment",
    BOTH: "Both",
};

const FINANCING_LABELS: Record<string, string> = {
    CASH: "Cash",
    MORTGAGE: "Mortgage",
    MIXED: "Mixed",
};

const parseCommentContent = (text: string) => {
    if (!text) return null;
    const regex = /([@#]\[[^\]]+\]\([^:]+:[^\)]+\))/g;
    const parts = text.split(regex);
    return parts.map((part: string, i: number) => {
        const match = part.match(/^([@#])\[([^\]]+)\]\([^:]+:[^\)]+\)$/);
        if (match) {
            return (
                <span
                    key={i}
                    className="font-semibold text-primary/90 bg-primary/10 px-1 py-0.5 rounded-sm"
                >
                    {match[1]}
                    {match[2]}
                </span>
            );
        }
        return <span key={i}>{part}</span>;
    });
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

// ── Main Component ──────────────────────────────────────────

export function DealQuickView({
    deal,
    open,
    onOpenChange,
    onArchive,
}: DealQuickViewProps) {
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
                toast.error("Failed to load activity and comments.");
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

    const isBuySide = deal.deal_type === "BUY_SIDE";
    const buyerContact = deal.buyer_contact;
    const sellerContact = deal.seller_contact;
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
        toast.success("Link copied to clipboard");
    };

    const tabCount = isBuySide ? 3 : 2;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto bg-white dark:bg-stone-900 p-0 flex flex-col">
                {/* Sticky Header */}
                <div className="px-6 py-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-10 space-y-3">
                    <SheetHeader className="text-left flex flex-row items-start justify-between space-y-0 p-0 border-0">
                        <div className="flex-1 min-w-0">
                            <SheetTitle className="text-lg font-semibold text-stone-800 dark:text-stone-100 truncate">
                                {deal.deal_name || "Untitled Deal"}
                            </SheetTitle>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {/* Deal Type */}
                                <Badge
                                    variant="outline"
                                    className="text-xs font-medium"
                                >
                                    {isBuySide ? "Buy-side" : "Sell-side"}
                                </Badge>
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
                                        Tier {deal.potential_tier}
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
                                View Full Details
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={copyLink}
                            className="gap-2"
                        >
                            <Copy className="w-4 h-4" />
                            Copy Link
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
                                Archive
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
                            if (v === "requirements" && isBuySide) {
                                loadRequirements();
                            }
                        }}
                    >
                        <TabsList
                            className={`grid w-full mb-6 ${tabCount === 3 ? "grid-cols-3" : "grid-cols-2"}`}
                        >
                            <TabsTrigger value="overview" className="gap-2">
                                <Info className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    Overview
                                </span>
                            </TabsTrigger>
                            {isBuySide && (
                                <TabsTrigger
                                    value="requirements"
                                    className="gap-2"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span className="hidden sm:inline">
                                        Requirements
                                    </span>
                                </TabsTrigger>
                            )}
                            <TabsTrigger value="activity" className="gap-2">
                                <MessageSquare className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    Activity
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
                                    Deal Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoField
                                        label="Estimated Value"
                                        value={
                                            deal.estimated_deal_value
                                                ? `฿${deal.estimated_deal_value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                                                : null
                                        }
                                        mono
                                    />
                                    <InfoField
                                        label="Commission Rate"
                                        value={
                                            deal.commission_rate
                                                ? `${deal.commission_rate}%`
                                                : null
                                        }
                                    />
                                    <InfoField
                                        label="Est. Commission"
                                        value={
                                            deal.estimated_commission
                                                ? `฿${deal.estimated_commission.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                                                : null
                                        }
                                        mono
                                    />
                                    <InfoField
                                        label="Lead Source"
                                        value={deal.lead_source?.replace(
                                            /_/g,
                                            " "
                                        )}
                                    />
                                    <InfoField
                                        label="Assigned Agent"
                                        value={assignedName}
                                    />
                                </div>
                            </div>

                            {/* Contact Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                {buyerContact && (
                                    <ContactCard
                                        label="Buyer"
                                        contact={buyerContact}
                                    />
                                )}
                                {sellerContact && (
                                    <ContactCard
                                        label="Seller"
                                        contact={sellerContact}
                                    />
                                )}
                            </div>

                            {/* Linked Listing */}
                            {deal.listing && (
                                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-stone-400" />
                                        <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                                            Linked Listing
                                        </h4>
                                    </div>
                                    <Link
                                        href={`/listings/${deal.listing.id}`}
                                        className="text-sm text-orange-600 hover:text-orange-700 mt-2 block"
                                    >
                                        {deal.listing.listing_name ||
                                            "Untitled"}
                                    </Link>
                                </div>
                            )}

                            {/* Notes */}
                            {deal.notes && (
                                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-stone-400" />
                                        <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                                            Notes
                                        </h4>
                                    </div>
                                    <p className="text-sm text-stone-600 dark:text-stone-400 whitespace-pre-wrap">
                                        {deal.notes}
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        {/* ── Requirements Tab (BUY_SIDE only) ──── */}
                        {isBuySide && (
                            <TabsContent
                                value="requirements"
                                className="space-y-4 min-h-[400px]"
                            >
                                {isLoadingRequirements ? (
                                    <div className="py-12 flex justify-center text-muted-foreground text-sm">
                                        Loading requirements...
                                    </div>
                                ) : buyerRequirements ? (
                                    <RequirementsDisplay
                                        req={buyerRequirements}
                                    />
                                ) : (
                                    <div className="py-12 text-center text-sm text-muted-foreground">
                                        No buyer requirements set. Edit the deal
                                        to add requirements.
                                    </div>
                                )}
                            </TabsContent>
                        )}

                        {/* ── Activity Tab ────────────────────────── */}
                        <TabsContent
                            value="activity"
                            className="space-y-6 min-h-[400px]"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold">
                                    Activity Feed
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
                                                ? "All"
                                                : f === "COMMENTS"
                                                  ? "Comments"
                                                  : "System"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {isLoadingData ? (
                                <div className="py-12 flex justify-center text-muted-foreground text-sm">
                                    Loading activity...
                                </div>
                            ) : (
                                <>
                                    {(activityFilter === "ALL" ||
                                        activityFilter === "COMMENTS") && (
                                        <div className="flex flex-col gap-6">
                                            <div className="space-y-4">
                                                {comments.length === 0 ? (
                                                    <div className="text-sm text-muted-foreground italic">
                                                        No comments yet. Be the
                                                        first!
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
                                                    No system activity yet.
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
    const user = Array.isArray(comment.users)
        ? comment.users[0]
        : comment.users;
    const authorName = user
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
        : "Unknown User";
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
                        This comment was deleted.
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
function RequirementsDisplay({ req }: { req: any }) {
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
                No buyer requirements set. Edit the deal to add requirements.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Budget & Size */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                    Budget & Size
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <InfoField
                        label="Budget Range"
                        value={
                            req.budget_min || req.budget_max
                                ? `฿${(req.budget_min ?? 0).toLocaleString()} – ฿${(req.budget_max ?? 0).toLocaleString()}`
                                : null
                        }
                        mono
                    />
                    <InfoField
                        label="Bedrooms"
                        value={
                            req.preferred_bedrooms
                                ? `${req.preferred_bedrooms}+`
                                : null
                        }
                    />
                    <InfoField
                        label="Size Range"
                        value={
                            req.preferred_size_min || req.preferred_size_max
                                ? `${req.preferred_size_min ?? "—"} – ${req.preferred_size_max ?? "—"} sqm`
                                : null
                        }
                    />
                    <InfoField
                        label="Floor Range"
                        value={
                            req.preferred_floor_min || req.preferred_floor_max
                                ? `${req.preferred_floor_min ?? "—"} – ${req.preferred_floor_max ?? "—"}`
                                : null
                        }
                    />
                    <InfoField
                        label="Parking"
                        value={
                            req.parking_slots_needed
                                ? `${req.parking_slots_needed} slot(s)`
                                : null
                        }
                    />
                </div>
                {(req.has_pet || req.has_ev_car) && (
                    <div className="flex gap-2 mt-2">
                        {req.has_pet && (
                            <Badge variant="secondary" className="text-xs">
                                Has Pet
                            </Badge>
                        )}
                        {req.has_ev_car && (
                            <Badge variant="secondary" className="text-xs">
                                Has EV Car
                            </Badge>
                        )}
                    </div>
                )}
            </div>

            {/* Property Types */}
            {req.preferred_property_type?.length > 0 && (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                        Property Types
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {req.preferred_property_type.map((t: string) => (
                            <Badge
                                key={t}
                                variant="secondary"
                                className="text-xs"
                            >
                                {t.replace(/_/g, " ")}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Facilities */}
            {req.preferred_facilities?.length > 0 && (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                        Facilities
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
                        Purchase Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <InfoField
                            label="Timeline"
                            value={
                                TIMELINE_LABELS[req.timeline] ?? req.timeline
                            }
                        />
                        <InfoField
                            label="Purpose"
                            value={
                                PURPOSE_LABELS[req.purpose_of_purchase] ??
                                req.purpose_of_purchase
                            }
                        />
                        <InfoField
                            label="Financing"
                            value={
                                FINANCING_LABELS[req.financing_method] ??
                                req.financing_method
                            }
                        />
                        <InfoField
                            label="Pre-approved"
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
                        Additional Notes
                    </h4>
                    {req.pain_points && (
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Pain Points
                            </p>
                            <p className="text-sm text-stone-600 dark:text-stone-400 whitespace-pre-wrap mt-0.5">
                                {req.pain_points}
                            </p>
                        </div>
                    )}
                    {req.special_requirements && (
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Special Requirements
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
