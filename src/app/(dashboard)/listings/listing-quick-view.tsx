import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingStatusBadge } from "@/components/shared/listing-status-badge";
import { ListingGradeBadge } from "@/components/shared/listing-grade-badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Archive, FileImage, MessageSquare, Briefcase, Info } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { fetchListingQuickViewData } from "./listing-quick-view-actions";
import { useEffect, useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { CommentForm } from "@/components/shared/comment-form";

// We will load the actual content asynchronously or pass it in.
// For now, this is the wrapper framework that receives the selected ListingRow.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ListingRow = any;

interface ListingQuickViewProps {
    listing: ListingRow | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onArchive?: (listingId: string) => void;
}

const parseCommentContent = (text: string) => {
    if (!text) return null;

    // Split text by matching react-mentions format: @[Display Name](type:id)
    const regex = /([@#]\[[^\]]+\]\([^:]+:[^\)]+\))/g;
    const parts = text.split(regex);

    return parts.map((part, i) => {
        // Extract the prefix and the display name
        const match = part.match(/^([@#])\[([^\]]+)\]\([^:]+:[^\)]+\)$/);

        if (match) {
            const prefix = match[1]; // @ or #
            const display = match[2]; // John Doe

            return (
                <span key={i} className="font-semibold text-primary/90 bg-primary/10 px-1 py-0.5 rounded-sm">
                    {prefix}{display}
                </span>
            );
        }

        // For line breaks or generic spaces, return plain text segment
        return <span key={i}>{part}</span>;
    });
};

export function ListingQuickView({
    listing,
    open,
    onOpenChange,
    onArchive,
}: ListingQuickViewProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [comments, setComments] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [activityLogs, setActivityLogs] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [activityFilter, setActivityFilter] = useState<"ALL" | "COMMENTS" | "SYSTEM">("ALL");

    const loadData = () => {
        if (!listing?.id) return;
        setIsLoadingData(true);
        fetchListingQuickViewData(listing.workspace_id, listing.id)
            .then((data) => {
                if (data.error) {
                    toast.error(data.error);
                    console.error("Server Action Error:", data.error);
                } else {
                    setComments(data.comments || []);
                    setActivityLogs(data.activityLogs || []);
                }
            })
            .catch((err) => {
                console.error("Failed to load drawer data", err);
                toast.error("Failed to load activity and comments.");
            })
            .finally(() => {
                setIsLoadingData(false);
            });
    };

    useEffect(() => {
        if (open && listing?.id) {
            loadData();
        } else {
            // Reset when closed
            setComments([]);
            setActivityLogs([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, listing?.id, listing?.workspace_id]);

    if (!listing) return null;

    const copyLink = () => {
        const url = `${window.location.origin}/listings/${listing.id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {/* Panel width per DESIGN_SYSTEM.md Section 8.8: w-[480px] or w-[600px] */}
            <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto bg-white dark:bg-stone-900 p-0 flex flex-col">
                <div className="px-6 py-4 bg-white dark:bg-stone-900 border-b sticky top-0 z-10 space-y-4">
                    <SheetHeader className="text-left flex flex-row items-start justify-between space-y-0">
                        <div>
                            <SheetTitle className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                                {listing.unit_no ? `${listing.unit_no} - ` : ""}
                                {listing.project_name || "Unknown Project"}
                            </SheetTitle>
                            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                <span>{listing.property_type?.replace(/_/g, " ")}</span>
                                <span>•</span>
                                <span>{listing.listing_type?.replace(/_/g, " ")}</span>
                                {listing.size_sqm && (
                                    <>
                                        <span>•</span>
                                        <span>{listing.size_sqm} sqm</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <ListingStatusBadge status={listing.listing_status} />
                            {listing.listing_grade && <ListingGradeBadge grade={listing.listing_grade} />}
                        </div>
                    </SheetHeader>

                    {/* Quick Actions Row */}
                    <div className="flex items-center gap-2 pt-2">
                        <Button variant="outline" size="sm" asChild className="gap-2">
                            <Link href={`/listings/${listing.id}`}>
                                <ExternalLink className="w-4 h-4" />
                                Edit Full Details
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
                            <Copy className="w-4 h-4" />
                            Copy Link
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-destructive hover:text-destructive ml-auto"
                            onClick={() => {
                                if (listing?.id && onArchive) {
                                    onArchive(listing.id);
                                    onOpenChange(false);
                                }
                            }}
                        >
                            <Archive className="w-4 h-4" />
                            Archive
                        </Button>
                    </div>
                </div>

                <div className="flex-1 px-6 py-4">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-6">
                            <TabsTrigger value="overview" className="gap-2">
                                <Info className="w-4 h-4" />
                                <span className="hidden sm:inline">Overview</span>
                            </TabsTrigger>
                            <TabsTrigger value="media" className="gap-2">
                                <FileImage className="w-4 h-4" />
                                <span className="hidden sm:inline">Media & Links</span>
                            </TabsTrigger>
                            <TabsTrigger value="activity" className="gap-2">
                                <MessageSquare className="w-4 h-4" />
                                <span className="hidden sm:inline">Activity</span>
                            </TabsTrigger>
                            <TabsTrigger value="agreements" className="gap-2">
                                <Briefcase className="w-4 h-4" />
                                <span className="hidden sm:inline">Legal</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6 min-h-[400px]">
                            {/* OVERVIEW CONTENT */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4 space-y-4">
                                    <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">Pricing</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Asking Price</p>
                                            <p className="text-sm font-medium">
                                                {listing.asking_price ? `฿${listing.asking_price.toLocaleString()}` : "—"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Rental / mo</p>
                                            <p className="text-sm font-medium">
                                                {listing.rental_price ? `฿${listing.rental_price.toLocaleString()}` : "—"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Comm.</p>
                                            <p className="text-sm font-medium">
                                                {listing.commission_rate ? `${listing.commission_rate}%` : "—"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4 space-y-4">
                                    <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">Details</h4>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Bed/Bath</p>
                                            <p className="text-sm font-medium text-foreground">
                                                {listing.bedrooms || "-"} / {listing.bathrooms || "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Floor</p>
                                            <p className="text-sm font-medium text-foreground">{listing.floor || "—"}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-xs text-muted-foreground">Seller</p>
                                            <p className="text-sm font-medium text-foreground">
                                                {listing.contacts?.first_name || "Unknown Seller"}
                                            </p>
                                            {listing.seller_phone && (
                                                <p className="text-xs text-muted-foreground mt-0.5">{listing.seller_phone}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="media" className="space-y-6">
                            {/* MEDIA CONTENT */}
                            {listing.unit_photos && listing.unit_photos.length > 0 ? (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                        <FileImage className="w-4 h-4" />
                                        Photo Gallery
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {listing.unit_photos.map((url: string, index: number) => (
                                            <div
                                                key={url}
                                                className={`relative rounded-xl overflow-hidden border bg-stone-100 dark:bg-stone-800 ${index === 0 ? "sm:col-span-2 sm:row-span-2 aspect-[4/3]" : "aspect-square"}`}
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={url}
                                                    alt={`Property photo ${index + 1}`}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
                                    <FileImage className="w-12 h-12 text-stone-300 dark:text-stone-600 mb-4" />
                                    <h3 className="text-sm font-medium text-foreground">No Photos Uploaded</h3>
                                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                        Click "Edit Full Details" above to upload photos, arrange the gallery, and manage external marketing links.
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="activity" className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold">Activity Feed</h3>
                                <div className="flex items-center bg-muted/50 p-1 rounded-md border text-xs">
                                    <button
                                        onClick={() => setActivityFilter("ALL")}
                                        className={`px-3 py-1.5 rounded-sm font-medium transition-colors ${activityFilter === "ALL" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setActivityFilter("COMMENTS")}
                                        className={`px-3 py-1.5 rounded-sm font-medium transition-colors ${activityFilter === "COMMENTS" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        Comments
                                    </button>
                                    <button
                                        onClick={() => setActivityFilter("SYSTEM")}
                                        className={`px-3 py-1.5 rounded-sm font-medium transition-colors ${activityFilter === "SYSTEM" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        System
                                    </button>
                                </div>
                            </div>
                            {/* ACTIVITY & COMMENTS */}
                            {isLoadingData ? (
                                <div className="py-12 flex justify-center text-muted-foreground text-sm">Loading activity...</div>
                            ) : (
                                <>
                                    {(activityFilter === "ALL" || activityFilter === "COMMENTS") && (
                                        <div className="flex flex-col gap-6">
                                            <div className="space-y-4">
                                                {comments.length === 0 ? (
                                                    <div className="text-sm text-muted-foreground italic">No comments yet. Be the first!</div>
                                                ) : (
                                                    comments.map((comment) => {
                                                        const user = Array.isArray(comment.users) ? comment.users[0] : comment.users;
                                                        const authorName = user
                                                            ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                                                            : "Unknown User";

                                                        const initials = user
                                                            ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
                                                            : "??";

                                                        if (comment.is_deleted) {
                                                            return (
                                                                <div key={comment.id} className="flex gap-4">
                                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                                                                        {initials}
                                                                    </div>
                                                                    <div className="flex-1 space-y-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="text-sm font-medium leading-none">{authorName}</p>
                                                                            <p className="text-xs text-muted-foreground" title={format(new Date(comment.created_at), "PPpp")}>
                                                                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
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
                                                            <div key={comment.id} className="flex gap-4 group">
                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                                                                    {initials}
                                                                </div>
                                                                <div className="flex-1 space-y-1">
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="text-sm font-medium leading-none">{authorName}</p>
                                                                            <p className="text-xs text-muted-foreground" title={format(new Date(comment.created_at), "PPpp")}>
                                                                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-sm text-foreground mt-1 bg-muted/40 p-3 rounded-md whitespace-pre-wrap leading-relaxed shadow-sm">
                                                                        {parseCommentContent(comment.content)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>

                                            <CommentForm
                                                workspaceId={listing.workspace_id}
                                                entityType="LISTING"
                                                entityId={listing.id}
                                                onSuccess={loadData}
                                            />
                                        </div>
                                    )}

                                    {(activityFilter === "ALL" || activityFilter === "SYSTEM") && (
                                        <div className={`pt-4 space-y-0 ${activityFilter === "ALL" ? "mt-8 border-t" : ""}`}>
                                            {activityLogs.length === 0 ? (
                                                <div className="text-sm text-muted-foreground italic">No system activity yet.</div>
                                            ) : (
                                                activityLogs.map((log) => {
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
                                                        PHOTO_UPLOADED: "bg-cyan-500",
                                                        LOGIN: "bg-slate-500",
                                                        EXPORT: "bg-gray-500",
                                                    };
                                                    const dotColor = ACTION_DOT_COLORS[log.action_type] || "bg-stone-300";
                                                    const user = Array.isArray(log.users) ? log.users[0] : log.users;
                                                    const actorName = user
                                                        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                                                        : "System";

                                                    return (
                                                        <div key={log.id} className="flex items-start gap-3 py-2">
                                                            <span className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 shrink-0`} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm text-stone-500 dark:text-stone-400">
                                                                    <span className="font-medium text-stone-800 dark:text-stone-100">{actorName}</span>
                                                                    {" "}
                                                                    {log.description}
                                                                </p>
                                                                <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5" title={format(new Date(log.created_at), "PPpp")}>
                                                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </TabsContent>

                        <TabsContent value="agreements" className="space-y-6">
                            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
                                <Briefcase className="w-12 h-12 text-stone-300 dark:text-stone-600 mb-4" />
                                <h3 className="text-sm font-medium text-foreground">Exclusive Agreements</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                    Contract forms, signatures, and agreement tracking will be built in Sub-Phase 1I.
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
}
