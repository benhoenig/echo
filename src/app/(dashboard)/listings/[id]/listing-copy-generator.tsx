"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Wand2, Copy, Check, Loader2 } from "lucide-react";
import { generateCopyFromTemplate } from "./listing-copy-actions";
import { toast } from "sonner";
import { ListingType } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props {
    listing: any; // Using any for now to match the existing listing-detail-content type
}

export function ListingCopyGenerator({ listing }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedText, setGeneratedText] = useState("");
    const [isCopied, setIsCopied] = useState(false);

    async function handleGenerate() {
        setIsOpen(true);
        setIsLoading(true);
        setIsCopied(false);

        try {
            // Need to pass relevant data to the server action to do the tag replacement
            const result = await generateCopyFromTemplate(listing.workspace_id, {
                listing_type: listing.listing_type as ListingType,
                listing_grade: listing.listing_grade,
                property_type: listing.property_type,
                data: listing,
            });

            if (result.success) {
                setGeneratedText(result.content ?? "");
            } else {
                toast.error(result.error || "Failed to generate copy");
                setGeneratedText("Error generating copy. Please check your templates.");
            }
        } catch (error) {
            toast.error("An error occurred while generating.");
            setGeneratedText("");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCopy() {
        if (!generatedText) return;

        try {
            await navigator.clipboard.writeText(generatedText);
            setIsCopied(true);
            toast.success("Copied to clipboard!");
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy to clipboard.");
        }
    }

    return (
        <>
            <Button variant="secondary" size="sm" onClick={handleGenerate}>
                <Wand2 className="w-4 h-4 mr-1.5 text-orange-600" />
                Generate Copy
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-orange-600" />
                        Generated Listing Copy
                    </DialogTitle>
                    <DialogDescription>
                        Review and tweak the generated text before copying. This uses your templates from Settings.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 py-4 min-h-[300px] flex flex-col relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-stone-950/50 backdrop-blur-sm z-10">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-4" />
                            <p className="text-sm text-stone-600 font-medium">Finding template and generating copy...</p>
                        </div>
                    ) : null}

                    <Textarea
                        value={generatedText}
                        onChange={(e) => setGeneratedText(e.target.value)}
                        className="flex-1 resize-none font-mono text-sm leading-relaxed p-4 bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 focus-visible:ring-orange-500"
                        placeholder="Generated text will appear here..."
                    />
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Close
                    </Button>
                    <Button
                        onClick={handleCopy}
                        disabled={isLoading || !generatedText}
                    >
                        {isCopied ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy to Clipboard
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </>
    );
}
