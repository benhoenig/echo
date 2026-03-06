"use client";

import { useState, useTransition } from "react";
import { CopyTemplate } from "@prisma/client";
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
import { useTranslations } from "next-intl";

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
    const t = useTranslations("copyTemplates");
    const tc = useTranslations("common");
    const tpt = useTranslations("propertyTypes");
    const tlt = useTranslations("listingTypes");
    const tg = useTranslations("grades");
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
            toast.error(t("nameAndContentRequired"));
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
                    toast.success(t("templateUpdated"));
                } else {
                    await createCopyTemplate(workspaceId, payload);
                    toast.success(t("templateCreated"));
                }

                // Temporary optimistic update until page refresh
                setIsOpen(false);
                window.location.reload(); // Hard reload for now to get fresh data
            } catch (error) {
                toast.error(error instanceof Error ? error.message : t("failedToSave"));
            }
        });
    }

    function handleDelete(id: string) {
        if (!confirm(t("confirmDelete"))) return;
        startTransition(async () => {
            try {
                await deleteCopyTemplate(id);
                setTemplates((prev) => prev.filter((tmpl) => tmpl.id !== id));
                toast.success(t("templateDeleted"));
            } catch (error) {
                toast.error(error instanceof Error ? error.message : t("failedToDelete"));
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
                    <h3 className="font-medium text-foreground">{t("yourTemplates")}</h3>
                    <p className="text-sm text-stone-500">{templates.length} {t("totalTemplates")}</p>
                </div>
                <Button onClick={handleOpenCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("createTemplate")}
                </Button>
            </div>

            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("templateName")}</TableHead>
                            <TableHead>{t("propertyType")}</TableHead>
                            <TableHead>{t("listingType")}</TableHead>
                            <TableHead>{t("targetGrade")}</TableHead>
                            <TableHead>{tc("default")}</TableHead>
                            <TableHead className="text-right">{tc("actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {templates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-stone-500">
                                    {t("noTemplates")}
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
                                            <span className="text-stone-400 italic text-sm">{tc("all")}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {template.listingType ? (
                                            <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md">
                                                {template.listingType}
                                            </span>
                                        ) : (
                                            <span className="text-stone-400 italic text-sm">{tc("all")}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {template.listingGrade ? (
                                            <ListingGradeBadge grade={template.listingGrade} />
                                        ) : (
                                            <span className="text-stone-400 italic text-sm">{tc("all")}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {template.isDefault && (
                                            <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md">
                                                {tc("default")}
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
                        <DialogTitle>{editingId ? t("editCopyTemplate") : t("createCopyTemplate")}</DialogTitle>
                        <DialogDescription>
                            {t("templateDescription")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-3 gap-6 py-4 flex-1 overflow-y-auto">
                        <div className="col-span-2 space-y-4">
                            <div className="space-y-2">
                                <Label>{t("templateName")}</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Grade A Luxury Condo Sell"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>{t("applyToPropertyType")}</Label>
                                    <Select value={propertyType} onValueChange={setPropertyType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ANY">{t("anyTypeFallback")}</SelectItem>
                                            <SelectItem value="HOUSE">{tpt("house")}</SelectItem>
                                            <SelectItem value="CONDO">{tpt("condo")}</SelectItem>
                                            <SelectItem value="TOWNHOUSE">{tpt("townhouse")}</SelectItem>
                                            <SelectItem value="LAND">{tpt("land")}</SelectItem>
                                            <SelectItem value="COMMERCIAL">{tpt("commercial")}</SelectItem>
                                            <SelectItem value="OTHER">{tpt("other")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("applyToListingType")}</Label>
                                    <Select value={listingType} onValueChange={setListingType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ANY">{t("anyTypeFallback")}</SelectItem>
                                            <SelectItem value="SELL">{tlt("sell")}</SelectItem>
                                            <SelectItem value="RENT">{tlt("rent")}</SelectItem>
                                            <SelectItem value="SELL_AND_RENT">{tlt("sellAndRent")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("applyToGrade")}</Label>
                                    <Select value={listingGrade} onValueChange={setListingGrade}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ANY">{tg("anyGrade")}</SelectItem>
                                            <SelectItem value="A">{tg("a")}</SelectItem>
                                            <SelectItem value="B">{tg("b")}</SelectItem>
                                            <SelectItem value="C">{tg("c")}</SelectItem>
                                            <SelectItem value="D">{tg("d")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg bg-stone-50">
                                <div className="space-y-0.5">
                                    <Label className="text-sm">{t("setAsDefault")}</Label>
                                    <p className="text-xs text-stone-500">
                                        {t("setAsDefaultDesc")}
                                    </p>
                                </div>
                                <Switch checked={isDefault} onCheckedChange={setIsDefault} />
                            </div>

                            <div className="space-y-2 flex-1 flex flex-col">
                                <div className="flex items-center justify-between">
                                    <Label>{t("templateContent")}</Label>
                                    <span className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold flex items-center gap-1">
                                        <Wand2 className="w-3 h-3" /> {t("autoReplacesTags")}
                                    </span>
                                </div>
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={t("pasteTemplateHere")}
                                    className="flex-1 min-h-[300px] font-mono text-sm leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* Sidebar panel for tags */}
                        <div className="border-l pl-6 space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm mb-1 text-foreground">{t("availableTags")}</h4>
                                <p className="text-xs text-stone-500 mb-4">{t("clickToAppend")}</p>
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
                            {tc("cancel")}
                        </Button>
                        <Button onClick={handleSave} disabled={isPending}>
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {t("saveTemplate")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
