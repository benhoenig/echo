"use client";

import { useState, useCallback, useRef } from "react";
import { UploadCloud, X, FileIcon, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
    workspaceId: string;
    listingId: string;
    bucket?: string;
    pathPrefix?: string;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    onUploadComplete?: (urls: string[]) => void;
    returnType?: 'publicUrl' | 'filePath';
    className?: string;
}

export function FileUploadZone({
    workspaceId,
    listingId,
    bucket = "listings",
    pathPrefix = "photos",
    accept = "image/*",
    multiple = true,
    maxFiles = 20,
    onUploadComplete,
    returnType = 'publicUrl',
    className,
}: FileUploadZoneProps) {
    const supabase = createClient();
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const uploadFiles = async (files: File[]) => {
        if (!files.length) return;

        if (files.length > maxFiles) {
            toast.error(`You can only upload up to ${maxFiles} files at once.`);
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        const uploadedUrls: string[] = [];
        const totalFiles = files.length;
        let completedFiles = 0;

        try {
            for (const file of files) {
                // Generate a unique file name
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
                const filePath = `${workspaceId}/${listingId}/${pathPrefix}/${fileName}`;

                const { error, data } = await supabase.storage
                    .from(bucket)
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) {
                    console.error("Upload error:", error);
                    toast.error(`Failed to upload ${file.name}`);
                    continue; // Skip and continue
                }

                if (returnType === 'filePath') {
                    uploadedUrls.push(filePath);
                } else {
                    // Get public URL
                    const { data: publicUrlData } = supabase.storage
                        .from(bucket)
                        .getPublicUrl(filePath);

                    if (publicUrlData.publicUrl) {
                        uploadedUrls.push(publicUrlData.publicUrl);
                    }
                }

                completedFiles++;
                setUploadProgress((completedFiles / totalFiles) * 100);
            }

            if (uploadedUrls.length > 0) {
                toast.success(`Successfully uploaded ${uploadedUrls.length} file(s)`);
                onUploadComplete?.(uploadedUrls);
            }
        } catch (error) {
            console.error("Upload process error:", error);
            toast.error("An error occurred during upload.");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            if (isUploading) return;

            const droppedFiles = Array.from(e.dataTransfer.files);
            uploadFiles(droppedFiles);
        },
        [isUploading, workspaceId, listingId, bucket, pathPrefix]
    );

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files);
        uploadFiles(selectedFiles);
        // Reset input so the same files can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center w-full px-6 py-10 border-2 border-dashed rounded-xl transition-all duration-200",
                isDragging
                    ? "border-orange-500 bg-orange-50/50 dark:bg-orange-500/10"
                    : "border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900",
                isUploading ? "opacity-75 pointer-events-none" : "cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800",
                className
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={accept}
                multiple={multiple}
                onChange={handleFileInput}
                disabled={isUploading}
            />

            {isUploading ? (
                <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    <div className="text-sm font-medium text-stone-600 dark:text-stone-400">
                        Uploading... {Math.round(uploadProgress)}%
                    </div>
                    {/* Progress bar */}
                    <div className="w-48 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-orange-500 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="p-3 bg-white dark:bg-stone-800 rounded-full shadow-sm mb-2 border border-stone-100 dark:border-stone-700">
                        <UploadCloud className="w-6 h-6 text-stone-500 dark:text-stone-400" />
                    </div>
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 max-w-[200px]">
                        {accept.includes("image") ? "SVG, PNG, JPG or GIF (max. 10MB)" : "PDF, DOCX, XLSX (max. 20MB)"}
                    </p>
                </div>
            )}
        </div>
    );
}
