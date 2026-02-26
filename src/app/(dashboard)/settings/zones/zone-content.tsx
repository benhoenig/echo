"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createZone, updateZone, deleteZone } from "./zone-actions";
import type { Tables } from "@/types/supabase";

type Zone = Tables<"zones">;

interface ZoneContentProps {
    initialZones: Zone[];
}

export function ZoneContent({ initialZones }: ZoneContentProps) {
    const [zones, setZones] = useState<Zone[]>(initialZones);
    const [isPending, startTransition] = useTransition();

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<Zone | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingZone, setDeletingZone] = useState<Zone | null>(null);

    // Form state
    const [nameEnglish, setNameEnglish] = useState("");
    const [nameThai, setNameThai] = useState("");

    function openCreateDialog() {
        setEditingZone(null);
        setNameEnglish("");
        setNameThai("");
        setDialogOpen(true);
    }

    function openEditDialog(zone: Zone) {
        setEditingZone(zone);
        setNameEnglish(zone.zone_name_english);
        setNameThai(zone.zone_name_thai);
        setDialogOpen(true);
    }

    function openDeleteDialog(zone: Zone) {
        setDeletingZone(zone);
        setDeleteDialogOpen(true);
    }

    function handleSave() {
        if (!nameEnglish.trim() || !nameThai.trim()) {
            toast.error("Both English and Thai names are required.");
            return;
        }

        startTransition(async () => {
            try {
                const formData = {
                    zone_name_english: nameEnglish.trim(),
                    zone_name_thai: nameThai.trim(),
                };

                if (editingZone) {
                    await updateZone(editingZone.id, formData);
                    setZones((prev) =>
                        prev
                            .map((z) =>
                                z.id === editingZone.id
                                    ? { ...z, ...formData }
                                    : z
                            )
                            .sort((a, b) =>
                                a.zone_name_english.localeCompare(
                                    b.zone_name_english
                                )
                            )
                    );
                    toast.success("Zone updated.");
                } else {
                    await createZone(formData);
                    // Refresh from server after create to get the new ID
                    window.location.reload();
                }

                setDialogOpen(false);
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to save zone."
                );
            }
        });
    }

    function handleDelete() {
        if (!deletingZone) return;

        startTransition(async () => {
            try {
                await deleteZone(deletingZone.id);
                setZones((prev) =>
                    prev.filter((z) => z.id !== deletingZone.id)
                );
                setDeleteDialogOpen(false);
                setDeletingZone(null);
                toast.success("Zone deleted.");
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to delete zone."
                );
            }
        });
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Zones
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Manage location zones for your projects and listings.
                    </p>
                </div>
                <Button onClick={openCreateDialog} size="sm">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Zone
                </Button>
            </div>

            {/* Zone table */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
                {zones.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <MapPin
                            className="w-10 h-10 text-stone-300 dark:text-stone-600"
                            strokeWidth={1.75}
                        />
                        <p className="text-sm font-medium text-foreground mt-3">
                            No zones yet
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Add zones to organize your projects by area.
                        </p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-stone-200 dark:border-stone-800">
                                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    English Name
                                </th>
                                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    Thai Name
                                </th>
                                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-24">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                            {zones.map((zone) => (
                                <tr
                                    key={zone.id}
                                    className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm text-foreground font-medium">
                                        {zone.zone_name_english}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {zone.zone_name_thai}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() =>
                                                    openEditDialog(zone)
                                                }
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                onClick={() =>
                                                    openDeleteDialog(zone)
                                                }
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingZone ? "Edit Zone" : "Add Zone"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingZone
                                ? "Update the zone details."
                                : "Add a new location zone."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="name-english">
                                English Name
                            </Label>
                            <Input
                                id="name-english"
                                placeholder="e.g. Sukhumvit"
                                value={nameEnglish}
                                onChange={(e) =>
                                    setNameEnglish(e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name-thai">Thai Name</Label>
                            <Input
                                id="name-thai"
                                placeholder="e.g. สุขุมวิท"
                                value={nameThai}
                                onChange={(e) =>
                                    setNameThai(e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isPending}>
                            {isPending && (
                                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                            )}
                            {editingZone ? "Save Changes" : "Add Zone"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Zone</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &ldquo;
                            {deletingZone?.zone_name_english}&rdquo;? This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            {isPending && (
                                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                            )}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
