"use client";

import { useState, useTransition } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Plus,
    GripVertical,
    Trash2,
    Pencil,
    EyeOff,
    Eye,
    AlertTriangle,
} from "lucide-react";
import {
    createPipelineStage,
    updatePipelineStage,
    deletePipelineStage,
    deactivatePipelineStage,
    reactivatePipelineStage,
    reorderPipelineStages,
} from "../pipeline-actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { Tables } from "@/types/supabase";

const STAGE_COLORS = [
    "#78716C", "#3B82F6", "#8B5CF6", "#F97316",
    "#EAB308", "#22C55E", "#10B981", "#EF4444",
    "#F43F5E", "#06B6D4",
];

// ── Sortable Stage Row ────────────────────────────────────────

function SortableStageRow({
    stage,
    index,
    isPending,
    dealCount,
    onEdit,
    onDelete,
    onToggleActive,
}: {
    stage: Tables<"pipeline_stages">;
    index: number;
    isPending: boolean;
    dealCount: number;
    onEdit: (stage: Tables<"pipeline_stages">) => void;
    onDelete: (stageId: string, dealCount: number) => void;
    onToggleActive: (stageId: string, isActive: boolean) => void;
}) {
    const t = useTranslations("pipeline");
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: stage.id });

    const isActive = stage.is_active;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : isActive ? 1 : 0.5,
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 p-3 rounded-lg border border-border bg-card ${isDragging ? "shadow-lg" : ""}`}
        >
            <button
                type="button"
                className="touch-none cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
            <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: stage.stage_color || "#78716C" }}
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                        {stage.pipeline_stage_name}
                    </p>
                    {!isActive && (
                        <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 text-muted-foreground"
                        >
                            Inactive
                        </Badge>
                    )}
                </div>
                {stage.stage_description && (
                    <p className="text-xs text-muted-foreground truncate">
                        {stage.stage_description}
                    </p>
                )}
            </div>
            {dealCount > 0 && (
                <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 shrink-0"
                >
                    {dealCount} deal{dealCount !== 1 ? "s" : ""}
                </Badge>
            )}
            <Badge variant="outline" className="text-xs shrink-0">
                {index + 1}
            </Badge>
            <Button
                variant="ghost"
                size="sm"
                className="p-1"
                onClick={() => onEdit(stage)}
            >
                <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="p-1"
                onClick={() => onToggleActive(stage.id, isActive)}
                disabled={isPending}
                title={isActive ? t("deactivateStage") : t("reactivateStage")}
            >
                {isActive ? (
                    <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                )}
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="p-1 text-destructive"
                onClick={() => onDelete(stage.id, dealCount)}
                disabled={isPending}
            >
                <Trash2 className="w-3.5 h-3.5" />
            </Button>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────

export function PipelineContent({
    stages: initialStages,
    workspaceId,
    dealCounts,
}: {
    stages: Tables<"pipeline_stages">[];
    workspaceId: string;
    dealCounts: Record<string, number>;
}) {
    const t = useTranslations("pipeline");
    const tc = useTranslations("common");
    const [isPending, startTransition] = useTransition();
    const [editingStage, setEditingStage] = useState<Tables<"pipeline_stages"> | null>(null);
    const [selectedColor, setSelectedColor] = useState("#78716C");
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{
        stageId: string;
        dealCount: number;
    } | null>(null);
    const [addType] = useState<"buyer">("buyer");
    const [error, setError] = useState<string | null>(null);

    // Local state for optimistic reorder
    const [stages, setStages] = useState(initialStages);

    // Sync when server data changes (e.g. after add/edit/delete)
    if (initialStages !== stages && initialStages.length !== stages.length) {
        setStages(initialStages);
    }

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const buyerStages = stages
        .filter((s) => s.pipeline_type === "BUYER")
        .sort((a, b) => a.stage_order - b.stage_order);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const currentList = buyerStages;
        const oldIndex = currentList.findIndex((s) => s.id === active.id);
        const newIndex = currentList.findIndex((s) => s.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(currentList, oldIndex, newIndex);

        // Optimistic UI update
        setStages((prev) => {
            const otherType = prev.filter((s) => s.pipeline_type !== "BUYER");
            const updatedList = reordered.map((s, i) => ({ ...s, stage_order: i + 1 }));
            return [...otherType, ...updatedList];
        });

        // Persist to server
        const newOrder = reordered.map((s) => s.id);
        startTransition(async () => {
            await reorderPipelineStages(newOrder);
        });
    };

    const handleCreate = (formData: FormData) => {
        setError(null);
        formData.set("workspaceId", workspaceId);
        formData.set("pipelineType", addType);
        formData.set("stageColor", selectedColor);
        startTransition(async () => {
            const result = await createPipelineStage(formData);
            if (result?.error) setError(result.error);
            else setAddOpen(false);
        });
    };

    const handleUpdate = (formData: FormData) => {
        setError(null);
        if (editingStage) formData.set("stageId", editingStage.id);
        formData.set("stageColor", selectedColor);
        startTransition(async () => {
            const result = await updatePipelineStage(formData);
            if (result?.error) setError(result.error);
            else setEditOpen(false);
        });
    };

    const handleDelete = (stageId: string, dealCount: number) => {
        if (dealCount > 0) {
            setDeleteTarget({ stageId, dealCount });
            setDeleteConfirmOpen(true);
            return;
        }
        setDeleteTarget({ stageId, dealCount: 0 });
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        const fd = new FormData();
        fd.set("stageId", deleteTarget.stageId);
        startTransition(async () => {
            const result = await deletePipelineStage(fd);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success(t("stageDeleted"));
            }
            setDeleteConfirmOpen(false);
            setDeleteTarget(null);
        });
    };

    const handleToggleActive = (stageId: string, currentlyActive: boolean) => {
        startTransition(async () => {
            if (currentlyActive) {
                const result = await deactivatePipelineStage(stageId);
                if (result?.error) {
                    toast.error(result.error);
                } else {
                    toast.success(t("stageDeactivated"));
                }
            } else {
                const result = await reactivatePipelineStage(stageId);
                if (result?.error) {
                    toast.error(result.error);
                } else {
                    toast.success(t("stageReactivated"));
                }
            }
        });
    };

    const renderStages = (
        stagesList: Tables<"pipeline_stages">[],
    ) => (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event)}
        >
            <SortableContext
                items={stagesList.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-2">
                    {stagesList.map((stage, index) => (
                        <SortableStageRow
                            key={stage.id}
                            stage={stage}
                            index={index}
                            isPending={isPending}
                            dealCount={dealCounts[stage.id] ?? 0}
                            onEdit={(s) => {
                                setEditingStage(s);
                                setSelectedColor(s.stage_color || "#78716C");
                                setEditOpen(true);
                            }}
                            onDelete={handleDelete}
                            onToggleActive={handleToggleActive}
                        />
                    ))}
                    {stagesList.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            {t("noStagesYet")}
                        </p>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                            setSelectedColor("#78716C");
                            setAddOpen(true);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        {t("addStage")}
                    </Button>
                </div>
            </SortableContext>
        </DndContext>
    );

    return (
        <div className="max-w-2xl">
            {error && (
                <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3 mb-4">
                    {error}
                </div>
            )}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{t("buyerDealStages")}</CardTitle>
                </CardHeader>
                <CardContent>{renderStages(buyerStages)}</CardContent>
            </Card>

            {/* Add Stage Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {t("addStage")}
                        </DialogTitle>
                    </DialogHeader>
                    <form action={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t("stageName")}</Label>
                            <Input id="name" name="name" placeholder="e.g. Viewing" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">{tc("description")}</Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="Optional description"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{tc("color")}</Label>
                            <div className="flex gap-2 flex-wrap">
                                {STAGE_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setSelectedColor(c)}
                                        className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColor === c
                                            ? "border-foreground scale-110"
                                            : "border-transparent"
                                            }`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">{tc("cancel")}</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? tc("saving") : t("addStage")}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Stage Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("editStage")}</DialogTitle>
                    </DialogHeader>
                    <form action={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="editName">{t("stageName")}</Label>
                            <Input
                                id="editName"
                                name="name"
                                defaultValue={editingStage?.pipeline_stage_name}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editDescription">{tc("description")}</Label>
                            <Input
                                id="editDescription"
                                name="description"
                                defaultValue={editingStage?.stage_description || ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{tc("color")}</Label>
                            <div className="flex gap-2 flex-wrap">
                                {STAGE_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setSelectedColor(c)}
                                        className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColor === c
                                            ? "border-foreground scale-110"
                                            : "border-transparent"
                                            }`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">{tc("cancel")}</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? tc("saving") : tc("save")}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onOpenChange={(open) => {
                    setDeleteConfirmOpen(open);
                    if (!open) setDeleteTarget(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {deleteTarget && deleteTarget.dealCount > 0
                                ? t("cannotDelete")
                                : t("deleteStage")}
                        </DialogTitle>
                    </DialogHeader>
                    {deleteTarget && deleteTarget.dealCount > 0 ? (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-amber-800 dark:text-amber-200">
                                        {deleteTarget.dealCount} active deal
                                        {deleteTarget.dealCount !== 1
                                            ? "s are"
                                            : " is"}{" "}
                                        using this stage.
                                    </p>
                                    <p className="text-amber-700 dark:text-amber-300 mt-1">
                                        Move or archive all deals in this stage
                                        before deleting it, or deactivate the
                                        stage instead.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <DialogClose asChild>
                                    <Button variant="secondary">{tc("close")}</Button>
                                </DialogClose>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Are you sure you want to delete this pipeline
                                stage? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">{tc("cancel")}</Button>
                                </DialogClose>
                                <Button
                                    variant="destructive"
                                    onClick={confirmDelete}
                                    disabled={isPending}
                                >
                                    {isPending ? tc("loading") : tc("delete")}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
