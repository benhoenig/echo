"use client";

import { useState, useEffect } from "react";
import { FileIcon, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "@/components/shared/file-upload-zone";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
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

interface ListingMediaFilesProps {
    workspaceId: string;
    listingId: string;
    initialFiles: string[];
    onFilesChange: (files: string[]) => Promise<void>;
}

export function ListingMediaFiles({
    workspaceId,
    listingId,
    initialFiles,
    onFilesChange,
}: ListingMediaFilesProps) {
    const supabase = createClient();
    const [files, setFiles] = useState<string[]>(initialFiles || []);
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        setFiles(initialFiles || []);
    }, [initialFiles]);

    const handleUploadComplete = async (urls: string[]) => {
        const newFiles = [...files, ...urls];
        setFiles(newFiles);
        try {
            await onFilesChange(newFiles);
        } catch (error) {
            toast.error("Failed to save newly uploaded files to database");
        }
    };

    const handleDeleteConfirm = async () => {
        if (!fileToDelete) return;
        setIsUpdating(true);
        const urlToRemove = fileToDelete;
        const newFiles = files.filter((f) => f !== urlToRemove);

        try {
            // 1. Remove from array in DB first
            setFiles(newFiles);
            await onFilesChange(newFiles);

            // 2. Extract path from URL to delete from storage
            const urlParts = urlToRemove.split('/listings/');
            if (urlParts.length === 2) {
                const filePath = urlParts[1];
                await supabase.storage.from("listings").remove([filePath]);
            }

            toast.success("File deleted successfully");
        } catch (error) {
            console.error("Delete error", error);
            // Revert array
            setFiles(files);
            toast.error("Failed to delete file");
        } finally {
            setIsUpdating(false);
            setFileToDelete(null);
        }
    };

    const getFilenameFromUrl = (url: string) => {
        const parts = url.split('/');
        const filenameWithTime = parts[parts.length - 1];
        // The filename is random_time.ext, let's just return it or decode if needed
        try {
            return decodeURIComponent(filenameWithTime);
        } catch {
            return filenameWithTime;
        }
    };

    return (
        <div className="space-y-6">
            <FileUploadZone
                workspaceId={workspaceId}
                listingId={listingId}
                pathPrefix="documents"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                multiple={true}
                onUploadComplete={handleUploadComplete}
            />

            {files.length > 0 && (
                <div className="space-y-3">
                    {files.map((url, idx) => (
                        <div
                            key={url}
                            className="flex items-center justify-between p-3 border border-stone-200 dark:border-stone-800 rounded-lg bg-stone-50 dark:bg-stone-900/50"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-white dark:bg-stone-800 rounded-md border shadow-sm shrink-0">
                                    <FileIcon className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                                        {getFilenameFromUrl(url)}
                                    </p>
                                    <div className="flex gap-2 mt-0.5">
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                                        >
                                            View <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                onClick={() => setFileToDelete(url)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={!!fileToDelete} onOpenChange={(open: boolean) => !open && setFileToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete file</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete this document? This cannot be undone.
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
