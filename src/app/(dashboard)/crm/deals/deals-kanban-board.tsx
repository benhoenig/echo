"use client";

import { useState, useMemo } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    useDroppable,
    useDraggable,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
} from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateDealStage } from "./deal-actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DealRow = any;

interface PipelineStage {
    id: string;
    name: string;
    pipelineType: string;
    color: string | null;
    order: number;
    isDefault: boolean;
}

interface DealsKanbanBoardProps {
    deals: DealRow[];
    pipelineStages: PipelineStage[];
    dealTypeFilter: "ALL" | "BUY_SIDE" | "SELL_SIDE";
    onCardClick?: (deal: DealRow) => void;
}

// ── Helpers (duplicated from deals-data-table.tsx) ──────────

function getContactName(contactData: DealRow | null): string {
    if (!contactData) return "—";
    return (
        contactData.nickname ||
        [contactData.first_name, contactData.last_name]
            .filter(Boolean)
            .join(" ") ||
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

// ── Sub-components ──────────────────────────────────────────

function KanbanDealCard({ deal, onCardClick }: { deal: DealRow; onCardClick?: (deal: DealRow) => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id: deal.id });
    const router = useRouter();

    const style: React.CSSProperties = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          }
        : {};

    const contact =
        deal.deal_type === "BUY_SIDE"
            ? deal.buyer_contact
            : deal.seller_contact;
    const contactName = getContactName(contact);
    const assignedName = deal.assigned_user
        ? [deal.assigned_user.first_name, deal.assigned_user.last_name]
              .filter(Boolean)
              .join(" ")
        : null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-3 shadow-sm",
                "cursor-grab active:cursor-grabbing",
                "hover:shadow-md transition-all duration-150 ease-in-out",
                isDragging && "opacity-30"
            )}
            onClick={() => onCardClick ? onCardClick(deal) : router.push(`/crm/deals/${deal.id}`)}
        >
            {/* Deal Name */}
            <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">
                {deal.deal_name || "Untitled Deal"}
            </p>

            {/* Contact */}
            <p className="text-xs text-muted-foreground mt-1 truncate">
                {contactName}
            </p>

            {/* Badges Row */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <Badge
                    className={`text-[10px] px-1.5 py-0 border-0 ${getStatusColor(deal.deal_status)}`}
                >
                    {deal.deal_status?.replace(/_/g, " ")}
                </Badge>
                {deal.potential_tier && (
                    <Badge
                        className={`text-[10px] px-1.5 py-0 border-0 ${TIER_COLORS[deal.potential_tier] ?? ""}`}
                    >
                        {deal.potential_tier}
                    </Badge>
                )}
            </div>

            {/* Bottom Row: Value + Agent */}
            <div className="flex items-center justify-between mt-2">
                {deal.estimated_deal_value ? (
                    <span className="text-xs font-mono tabular-nums text-stone-700 dark:text-stone-300">
                        ฿
                        {deal.estimated_deal_value.toLocaleString("en-US", {
                            maximumFractionDigits: 0,
                        })}
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                )}
                {assignedName && (
                    <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                        {assignedName}
                    </span>
                )}
            </div>
        </div>
    );
}

function DragOverlayCard({ deal }: { deal: DealRow | undefined }) {
    if (!deal) return null;

    const contact =
        deal.deal_type === "BUY_SIDE"
            ? deal.buyer_contact
            : deal.seller_contact;
    const contactName = getContactName(contact);

    return (
        <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-3 shadow-xl rotate-2 w-[264px]">
            <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">
                {deal.deal_name || "Untitled Deal"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 truncate">
                {contactName}
            </p>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <Badge
                    className={`text-[10px] px-1.5 py-0 border-0 ${getStatusColor(deal.deal_status)}`}
                >
                    {deal.deal_status?.replace(/_/g, " ")}
                </Badge>
                {deal.potential_tier && (
                    <Badge
                        className={`text-[10px] px-1.5 py-0 border-0 ${TIER_COLORS[deal.potential_tier] ?? ""}`}
                    >
                        {deal.potential_tier}
                    </Badge>
                )}
            </div>
            {deal.estimated_deal_value && (
                <p className="text-xs font-mono tabular-nums text-stone-700 dark:text-stone-300 mt-2">
                    ฿
                    {deal.estimated_deal_value.toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                    })}
                </p>
            )}
        </div>
    );
}

function KanbanColumn({
    stage,
    deals,
    isOver,
    onCardClick,
}: {
    stage: PipelineStage;
    deals: DealRow[];
    isOver: boolean;
    onCardClick?: (deal: DealRow) => void;
}) {
    const { setNodeRef } = useDroppable({ id: stage.id });
    const stageColor = stage.color || "#78716c";

    const totalValue = deals.reduce(
        (sum: number, d: DealRow) => sum + (d.estimated_deal_value ?? 0),
        0
    );

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col min-w-[280px] w-[280px] bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200 dark:border-stone-800",
                "transition-all duration-150 ease-in-out",
                isOver &&
                    "ring-2 ring-orange-500/40 bg-orange-50/30 dark:bg-orange-950/10"
            )}
        >
            {/* Column Header */}
            <div className="px-3 py-2.5 border-b border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-2">
                    <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: stageColor }}
                    />
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                        {stage.name}
                    </span>
                    <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 ml-auto"
                    >
                        {deals.length}
                    </Badge>
                </div>
                {totalValue > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono tabular-nums">
                        ฿
                        {totalValue.toLocaleString("en-US", {
                            maximumFractionDigits: 0,
                        })}
                    </p>
                )}
            </div>

            {/* Cards Area */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px] max-h-[calc(100vh-280px)]">
                {deals.map((deal: DealRow) => (
                    <KanbanDealCard key={deal.id} deal={deal} onCardClick={onCardClick} />
                ))}
                {deals.length === 0 && (
                    <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                        No deals
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main Component ──────────────────────────────────────────

export function DealsKanbanBoard({
    deals,
    pipelineStages,
    dealTypeFilter,
    onCardClick,
}: DealsKanbanBoardProps) {
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [overColumnId, setOverColumnId] = useState<string | null>(null);
    const [optimisticMoves, setOptimisticMoves] = useState<
        Map<string, string>
    >(new Map());

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor)
    );

    // Filter stages by deal type
    const relevantStages = useMemo(() => {
        return pipelineStages.filter((s: PipelineStage) => {
            if (dealTypeFilter === "BUY_SIDE")
                return s.pipelineType === "BUYER";
            if (dealTypeFilter === "SELL_SIDE")
                return s.pipelineType === "SELLER";
            return true;
        });
    }, [pipelineStages, dealTypeFilter]);

    // Group deals by stage, accounting for optimistic moves
    const dealsByStage = useMemo(() => {
        const map = new Map<string, DealRow[]>();
        for (const stage of relevantStages) {
            map.set(stage.id, []);
        }
        for (const deal of deals) {
            const effectiveStageId =
                optimisticMoves.get(deal.id) ?? deal.pipeline_stage_id;
            const bucket = map.get(effectiveStageId);
            if (bucket) {
                bucket.push(deal);
            }
        }
        return map;
    }, [deals, relevantStages, optimisticMoves]);

    function handleDragStart(event: DragStartEvent) {
        setActiveDragId(event.active.id as string);
    }

    function handleDragOver(event: DragOverEvent) {
        const overId = event.over?.id as string | undefined;
        setOverColumnId(overId ?? null);

        if (!overId || !activeDragId) return;

        const deal = deals.find((d: DealRow) => d.id === activeDragId);
        const currentStage =
            optimisticMoves.get(activeDragId) ?? deal?.pipeline_stage_id;

        if (overId !== currentStage) {
            setOptimisticMoves(
                (prev) => new Map(prev).set(activeDragId, overId)
            );
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveDragId(null);
        setOverColumnId(null);

        if (!over) {
            // Dropped outside — revert
            setOptimisticMoves((prev) => {
                const next = new Map(prev);
                next.delete(active.id as string);
                return next;
            });
            return;
        }

        const dealId = active.id as string;
        const newStageId = over.id as string;
        const deal = deals.find((d: DealRow) => d.id === dealId);
        const oldStageId = deal?.pipeline_stage_id;

        if (newStageId === oldStageId) {
            setOptimisticMoves((prev) => {
                const next = new Map(prev);
                next.delete(dealId);
                return next;
            });
            return;
        }

        try {
            await updateDealStage(dealId, newStageId);
            toast.success("Pipeline stage updated.");
        } catch {
            toast.error("Failed to update stage.");
        }

        // Clear optimistic state — server revalidation will update real data
        setOptimisticMoves((prev) => {
            const next = new Map(prev);
            next.delete(dealId);
            return next;
        });
    }

    const activeDeal = activeDragId
        ? deals.find((d: DealRow) => d.id === activeDragId)
        : undefined;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="overflow-x-auto pb-4">
                <div className="flex gap-3 min-w-min">
                    {relevantStages.map((stage: PipelineStage) => (
                        <KanbanColumn
                            key={stage.id}
                            stage={stage}
                            deals={dealsByStage.get(stage.id) ?? []}
                            isOver={overColumnId === stage.id}
                            onCardClick={onCardClick}
                        />
                    ))}
                </div>
            </div>
            <DragOverlay>
                {activeDragId ? (
                    <DragOverlayCard deal={activeDeal} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
