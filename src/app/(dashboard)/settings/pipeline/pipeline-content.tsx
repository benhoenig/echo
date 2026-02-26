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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Plus, GripVertical, Trash2, Pencil } from "lucide-react";
import {
    createPipelineStage,
    updatePipelineStage,
    deletePipelineStage,
    reorderPipelineStages,
} from "../pipeline-actions";
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
    onEdit,
    onDelete,
}: {
    stage: Tables<"pipeline_stages">;
    index: number;
    isPending: boolean;
    onEdit: (stage: Tables<"pipeline_stages">) => void;
    onDelete: (stageId: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: stage.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
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
                <p className="text-sm font-medium truncate">{stage.pipeline_stage_name}</p>
                {stage.stage_description && (
                    <p className="text-xs text-muted-foreground truncate">
                        {stage.stage_description}
                    </p>
                )}
            </div>
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
                className="p-1 text-destructive"
                onClick={() => onDelete(stage.id)}
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
}: {
    stages: Tables<"pipeline_stages">[];
    workspaceId: string;
}) {
    const [isPending, startTransition] = useTransition();
    const [editingStage, setEditingStage] = useState<Tables<"pipeline_stages"> | null>(null);
    const [selectedColor, setSelectedColor] = useState("#78716C");
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [addType, setAddType] = useState<"buyer" | "seller">("buyer");
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
    const sellerStages = stages
        .filter((s) => s.pipeline_type === "SELLER")
        .sort((a, b) => a.stage_order - b.stage_order);

    const handleDragEnd = (event: DragEndEvent, type: "buyer" | "seller") => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const currentList = type === "buyer" ? buyerStages : sellerStages;
        const oldIndex = currentList.findIndex((s) => s.id === active.id);
        const newIndex = currentList.findIndex((s) => s.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(currentList, oldIndex, newIndex);

        // Optimistic UI update
        setStages((prev) => {
            const otherType = prev.filter((s) => s.pipeline_type !== type.toUpperCase());
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

    const handleDelete = (stageId: string) => {
        if (!confirm("Delete this pipeline stage?")) return;
        const fd = new FormData();
        fd.set("stageId", stageId);
        startTransition(async () => {
            await deletePipelineStage(fd);
        });
    };

    const renderStages = (
        stagesList: Tables<"pipeline_stages">[],
        type: "buyer" | "seller"
    ) => (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event, type)}
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
                            onEdit={(s) => {
                                setEditingStage(s);
                                setSelectedColor(s.stage_color || "#78716C");
                                setEditOpen(true);
                            }}
                            onDelete={handleDelete}
                        />
                    ))}
                    {stagesList.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No stages configured yet
                        </p>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                            setAddType(type);
                            setSelectedColor("#78716C");
                            setAddOpen(true);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Stage
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
            <Tabs defaultValue="buyer">
                <TabsList>
                    <TabsTrigger value="buyer">
                        Buyer Pipeline ({buyerStages.length})
                    </TabsTrigger>
                    <TabsTrigger value="seller">
                        Seller Pipeline ({sellerStages.length})
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="buyer" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Buyer Deal Stages</CardTitle>
                        </CardHeader>
                        <CardContent>{renderStages(buyerStages, "buyer")}</CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="seller" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Seller Deal Stages</CardTitle>
                        </CardHeader>
                        <CardContent>{renderStages(sellerStages, "seller")}</CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add Stage Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Add {addType === "buyer" ? "Buyer" : "Seller"} Stage
                        </DialogTitle>
                    </DialogHeader>
                    <form action={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Stage Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Viewing" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="Optional description"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Color</Label>
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
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Adding..." : "Add Stage"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Stage Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Stage</DialogTitle>
                    </DialogHeader>
                    <form action={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="editName">Stage Name</Label>
                            <Input
                                id="editName"
                                name="name"
                                defaultValue={editingStage?.pipeline_stage_name}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editDescription">Description</Label>
                            <Input
                                id="editDescription"
                                name="description"
                                defaultValue={editingStage?.stage_description || ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Color</Label>
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
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
