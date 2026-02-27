"use client";

import { useState, useTransition } from "react";
import { CopyTemplate, ListingType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, Wand2 } from "lucide-react";
import {
    createCopyTemplate,
    updateCopyTemplate,
    deleteCopyTemplate,
} from "./copy-template-actions";
import { toast } from "sonner";
import { ListingGradeBadge } from "@/components/shared/listing-grade-badge";

interface Props {
    initialTemplates: CopyTemplate[];
    workspaceId: string;
}

const TEMPLATE_TAGS = [
    "{{Project Name (Thai)}}",
    "{{Project Name (Eng)}}",
    "{{Listing Name}}",
    "{{Zone}}",
    "{{BTS/MRT}}",
    "{{Property Type}}",
    "{{Listing Type}}",
    "{{Bed}}",
    "{{Bath}}",
    "{{Sqm.}}",
    "{{Floor}}",
    "{{Building}}",
    "{{Parking}}",
    "{{Direction}}",
    "{{View}}",
    "{{Asking Price}}",
    "{{Rental Price}}",
    "{{Price Remark}}",
    "{{Rental Remark}}",
    "{{Agent Name}}",
    "{{Agent Phone}}",
];

export function CopyTemplateList({ initialTemplates, workspaceId }: Props) {
    const [templates, setTemplates] = useState<CopyTemplate[]>(initialTemplates);
    const [isPending, startTransition] = useTransition();

    // Dialog State
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState("");
    const [content, setContent] = useState("");
    const [propertyType, setPropertyType] = useState<string>("ANY");
    const [listingType, setListingType] = useState<string>("ANY");
    const [listingGrade, setListingGrade] = useState<string>("ANY");
    const [isDefault, setIsDefault] = useState(false);

    function handleOpenCreate() {
        setEditingId(null);
        setName("");
        setContent("");
        setPropertyType("ANY");
        setListingType("ANY");
        setListingGrade("ANY");
        setIsDefault(initialTemplates.length === 0); // Default to true if it's the first one
        setIsOpen(true);
    }

    function handleOpenEdit(template: CopyTemplate) {
        setEditingId(template.id);
        setName(template.name);
        setContent(template.content);
        setPropertyType(template.propertyType || "ANY");
        setListingType(template.listingType || "ANY");
        setListingGrade(template.listingGrade || "ANY");
        setIsDefault(template.isDefault);
        setIsOpen(true);
    }

    function handleSave() {
        if (!name || !content) {
            toast.error("Name and Content are required.");
            return;
        }

        const payload = {
            name,
            content,
            property_type: propertyType === "ANY" ? null : propertyType,
            listing_type: listingType === "ANY" ? null : listingType,
            listing_grade: listingGrade === "ANY" ? null : listingGrade,
            is_default: isDefault,
        };

        startTransition(async () => {
            try {
                if (editingId) {
                    await updateCopyTemplate(editingId, payload);
                    toast.success("Template updated successfully.");
                } else {
                    await createCopyTemplate(workspaceId, payload);
                    toast.success("Template created successfully.");
                }

                // Temporary optimistic update until page refresh
                setIsOpen(false);
                window.location.reload(); // Hard reload for now to get fresh data
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to save template.");
            }
        });
    }

    function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this template?")) return;
        startTransition(async () => {
            try {
                await deleteCopyTemplate(id);
                setTemplates((prev) => prev.filter((t) => t.id !== id));
                toast.success("Template deleted.");
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to delete.");
            }
        });
    }

    function insertTag(tag: string) {
        // Simple append for now. In a real rich text setting, we'd insert at cursor.
        setContent((prev) => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + tag);
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                <div>
                    <h3 className="font-medium text-foreground">Your Templates</h3>
                    <p className="text-sm text-stone-500">{templates.length} total templates</p>
                </div>
                <Button onClick={handleOpenCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                </Button>
            </div>

            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Template Name</TableHead>
                            <TableHead>Property Type</TableHead>
                            <TableHead>Listing Type</TableHead>
                            <TableHead>Target Grade</TableHead>
                            <TableHead>Default</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {templates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-stone-500">
                                    No copy templates found. Create one to get started!
                                </TableCell>
                            </TableRow>
                        ) : (
                            templates.map((template) => (
                                <TableRow key={template.id}>
                                    <TableCell className="font-medium text-foreground">
                                        {template.name}
                                    </TableCell>
                                    <TableCell>
                                        {template.propertyType ? (
                                            <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md">
                                                {template.propertyType}
                                            </span>
                                        ) : (
                                            <span className="text-stone-400 italic text-sm">Any</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {template.listingType ? (
                                            <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md">
                                                {template.listingType}
                                            </span>
                                        ) : (
                                            <span className="text-stone-400 italic text-sm">Any</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {template.listingGrade ? (
                                            <ListingGradeBadge grade={template.listingGrade} />
                                        ) : (
                                            <span className="text-stone-400 italic text-sm">Any</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {template.isDefault && (
                                            <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md">
                                                Default
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-stone-500 hover:text-orange-600 hover:bg-orange-50"
                                                onClick={() => handleOpenEdit(template)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-stone-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(template.id)}
                                                disabled={isPending}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-5xl sm:max-w-5xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit" : "Create"} Copy Template</DialogTitle>
                        <DialogDescription>
                            Define the template and the rules for when it should be suggested.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-3 gap-6 py-4 flex-1 overflow-y-auto">
                        <div className="col-span-2 space-y-4">
                            <div className="space-y-2">
                                <Label>Template Name</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Grade A Luxury Condo Sell"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Apply to Property Type</Label>
                                    <Select value={propertyType} onValueChange={setPropertyType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ANY">Any Type (Fallback)</SelectItem>
                                            <SelectItem value="HOUSE">House</SelectItem>
                                            <SelectItem value="CONDO">Condo</SelectItem>
                                            <SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
                                            <SelectItem value="LAND">Land</SelectItem>
                                            <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Apply to Listing Type</Label>
                                    <Select value={listingType} onValueChange={setListingType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ANY">Any Type (Fallback)</SelectItem>
                                            <SelectItem value="SELL">Sell</SelectItem>
                                            <SelectItem value="RENT">Rent</SelectItem>
                                            <SelectItem value="SELL_AND_RENT">Sell & Rent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Apply to Grade</Label>
                                    <Select value={listingGrade} onValueChange={setListingGrade}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ANY">Any Grade (Fallback)</SelectItem>
                                            <SelectItem value="A">Grade A (Luxury)</SelectItem>
                                            <SelectItem value="B">Grade B (Premium)</SelectItem>
                                            <SelectItem value="C">Grade C (Standard)</SelectItem>
                                            <SelectItem value="D">Grade D (Budget)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg bg-stone-50">
                                <div className="space-y-0.5">
                                    <Label className="text-sm">Set as Default Template</Label>
                                    <p className="text-xs text-stone-500">
                                        Use this template if no specific type/grade match is found.
                                    </p>
                                </div>
                                <Switch checked={isDefault} onCheckedChange={setIsDefault} />
                            </div>

                            <div className="space-y-2 flex-1 flex flex-col">
                                <div className="flex items-center justify-between">
                                    <Label>Template Content</Label>
                                    <span className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold flex items-center gap-1">
                                        <Wand2 className="w-3 h-3" /> Auto-replaces tags
                                    </span>
                                </div>
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={`Paste your marketing text here...\nUse the tags on the right to insert dynamic data.`}
                                    className="flex-1 min-h-[300px] font-mono text-sm leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* Sidebar panel for tags */}
                        <div className="border-l pl-6 space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm mb-1 text-foreground">Available Tags</h4>
                                <p className="text-xs text-stone-500 mb-4">Click a tag to append it to your content.</p>
                            </div>
                            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                {TEMPLATE_TAGS.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => insertTag(tag)}
                                        className="text-left px-2 py-1.5 rounded bg-stone-100 hover:bg-stone-200 text-[11px] font-mono text-stone-700 transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isPending}>
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Template
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
