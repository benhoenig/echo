"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripHorizontal, Star, Image as ImageIcon } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "@/components/shared/file-upload-zone";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ListingPhotoGalleryProps {
    workspaceId: string;
    listingId: string;
    initialPhotos: string[];
    onPhotosChange: (photos: string[]) => Promise<void>;
}

// Ensure the item ID is simple (we will use the URL string itself)
function SortablePhotoItem({
    url,
    index,
    onDeleteRequest,
}: {
    url: string;
    index: number;
    onDeleteRequest: (url: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: url });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative group rounded-xl overflow-hidden border-2 bg-stone-100 dark:bg-stone-800 ${index === 0
                ? "border-orange-500 shadow-md sm:col-span-2 sm:row-span-2 aspect-[4/3]"
                : "border-transparent aspect-square"
                }`}
        >
            <Image
                src={url}
                alt={`Property photo ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="w-8 h-8 rounded-full shadow-sm"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRequest(url);
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>

                {/* Drag Handle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                        className="bg-white/90 dark:bg-stone-900/90 p-2 rounded-full shadow-lg backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-transform cursor-grab active:cursor-grabbing pointer-events-auto"
                        {...attributes}
                        {...listeners}
                    >
                        <GripHorizontal className="w-5 h-5 text-stone-700 dark:text-stone-300" />
                    </div>
                </div>
            </div>

            {/* Cover photo badge */}
            {index === 0 && (
                <div className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 fill-current" />
                    COVER PHOTO
                </div>
            )}
        </div>
    );
}

export function ListingPhotoGallery({
    workspaceId,
    listingId,
    initialPhotos,
    onPhotosChange,
}: ListingPhotoGalleryProps) {
    const supabase = createClient();
    const [photos, setPhotos] = useState<string[]>(initialPhotos || []);
    const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Sync external changes
    useEffect(() => {
        setPhotos(initialPhotos || []);
    }, [initialPhotos]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = photos.indexOf(active.id as string);
            const newIndex = photos.indexOf(over.id as string);

            const newPhotos = arrayMove(photos, oldIndex, newIndex);
            setPhotos(newPhotos);

            // Persist order to db
            try {
                // Background optimistic update
                await onPhotosChange(newPhotos);
            } catch (err) {
                // Revert on error
                setPhotos(photos);
                toast.error("Failed to save new photo order");
            }
        }
    };

    const handleDeleteConfirm = async () => {
        if (!photoToDelete) return;

        setIsUpdating(true);
        const urlToRemove = photoToDelete;
        const newPhotos = photos.filter((p) => p !== urlToRemove);

        try {
            // 1. Remove from array in DB first
            setPhotos(newPhotos);
            await onPhotosChange(newPhotos);

            // 2. Extract path from URL to delete from storage
            // Public URL format: .../storage/v1/object/public/listings/workspaceId/listingId/photos/filename.ext
            const urlParts = urlToRemove.split('/listings/');
            if (urlParts.length === 2) {
                const filePath = urlParts[1];
                await supabase.storage.from("listings").remove([filePath]);
            }

            toast.success("Photo deleted successfully");
        } catch (error) {
            console.error("Delete error", error);
            // Revert array
            setPhotos(photos);
            toast.error("Failed to delete photo");
        } finally {
            setIsUpdating(false);
            setPhotoToDelete(null);
        }
    };

    const handleUploadComplete = async (urls: string[]) => {
        const newPhotos = [...photos, ...urls];
        setPhotos(newPhotos);
        try {
            await onPhotosChange(newPhotos);
        } catch (error) {
            toast.error("Failed to save newly uploaded photos to database");
        }
    };

    return (
        <div className="space-y-6">
            {photos.length === 0 ? (
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center p-4 bg-stone-100 dark:bg-stone-800 rounded-full mb-4">
                        <ImageIcon className="w-8 h-8 text-stone-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">No photos yet</h4>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mb-6 max-w-sm mx-auto">
                        Upload high-quality photos of the property. The first photo will be used as the cover image.
                    </p>
                    <FileUploadZone
                        workspaceId={workspaceId}
                        listingId={listingId}
                        pathPrefix="photos"
                        accept="image/*"
                        multiple={true}
                        onUploadComplete={handleUploadComplete}
                    />
                </div>
            ) : (
                <>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={photos} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                                {photos.map((url, index) => (
                                    <SortablePhotoItem
                                        key={url}
                                        url={url}
                                        index={index}
                                        onDeleteRequest={setPhotoToDelete}
                                    />
                                ))}

                                {/* Upload More Zone */}
                                <div className="aspect-square">
                                    <FileUploadZone
                                        workspaceId={workspaceId}
                                        listingId={listingId}
                                        pathPrefix="photos"
                                        accept="image/*"
                                        multiple={true}
                                        onUploadComplete={handleUploadComplete}
                                        className="h-full py-0 border-dashed hover:border-orange-400"
                                    />
                                </div>
                            </div>
                        </SortableContext>
                    </DndContext>
                </>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={!!photoToDelete} onOpenChange={(open: boolean) => !open && setPhotoToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete this photo? This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                handleDeleteConfirm();
                            }}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            disabled={isUpdating}
                        >
                            {isUpdating ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
