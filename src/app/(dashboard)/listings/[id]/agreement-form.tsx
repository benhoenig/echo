"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { createAgreement } from "../agreement-actions";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploadZone } from "@/components/shared/file-upload-zone";

// We'll define a unified schema that will validate conditionally based on the type
const agreementSchema = z.object({
    agreementType: z.enum(["SPA", "OPEN_AGENT", "EXCLUSIVE_AGENT"]),
    sellerContactId: z.string().optional(),
    buyerContactId: z.string().optional(),
    assignedAgentId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    commissionType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
    commissionRate: z.coerce.number().optional(),
    fixedFeeAmount: z.coerce.number().optional(),
    salePrice: z.coerce.number().optional(),
    depositAmount: z.coerce.number().optional(),
    notes: z.string().optional(),
    // For files, we will just handle string urls here for now
    agreementFilesUrl: z.array(z.string()).optional()
});

type FormValues = z.infer<typeof agreementSchema>;

interface AgreementFormProps {
    listingId: string;
    workspaceId: string;
    onSuccess: () => void;
    // Options for dropdowns
    agents: { id: string; name: string }[];
    contacts: { id: string; name: string }[];
}

export function AgreementForm({ listingId, workspaceId, onSuccess, agents, contacts }: AgreementFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(agreementSchema) as any,
        defaultValues: {
            agreementType: "OPEN_AGENT",
            commissionType: "PERCENTAGE",
            agreementFilesUrl: []
        }
    });

    const watchType = form.watch("agreementType");
    const watchFiles = form.watch("agreementFilesUrl") || [];

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            // transform dates
            const payload = {
                listingId,
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            };

            const result = await createAgreement(payload as any);
            if (result.success) {
                toast.success("Agreement created");
                onSuccess();
            } else {
                toast.error(result.error || "Failed to create agreement");
            }
        } catch (e) {
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">

                {/* Type Selection */}
                <FormField
                    control={form.control}
                    name="agreementType"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    render={({ field }: any) => (
                        <FormItem>
                            <FormLabel>Agreement Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="OPEN_AGENT">Open Agent Agreement</SelectItem>
                                    <SelectItem value="EXCLUSIVE_AGENT">Exclusive Agent Agreement</SelectItem>
                                    <SelectItem value="SPA">Sale & Purchase Agreement (SPA)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Dynamic Fields */}
                <div className="grid grid-cols-2 gap-4">

                    {(watchType === "OPEN_AGENT" || watchType === "EXCLUSIVE_AGENT") && (
                        <>
                            <FormField control={form.control} name="assignedAgentId" render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>Assigned Agent</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Agent" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {agents.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="sellerContactId" render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>Seller Contact</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Seller" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="startDate" render={({ field }: any) => (
                                <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl></FormItem>
                            )} />

                            <FormField control={form.control} name="endDate" render={({ field }: any) => (
                                <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl></FormItem>
                            )} />

                            <FormField control={form.control} name="commissionRate" render={({ field }: any) => (
                                <FormItem><FormLabel>Commission (%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value || ""} /></FormControl></FormItem>
                            )} />
                        </>
                    )}

                    {watchType === "SPA" && (
                        <>
                            <FormField control={form.control} name="sellerContactId" render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>Seller</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Seller" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="buyerContactId" render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>Buyer</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Buyer" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="salePrice" render={({ field }: any) => (
                                <FormItem><FormLabel>Sale Price ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value || ""} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="depositAmount" render={({ field }: any) => (
                                <FormItem><FormLabel>Deposit Amount ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value || ""} /></FormControl></FormItem>
                            )} />

                            <FormField control={form.control} name="startDate" render={({ field }: any) => (
                                <FormItem><FormLabel>Date of Signature</FormLabel><FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl></FormItem>
                            )} />
                        </>
                    )}
                </div>

                <FormField control={form.control} name="notes" render={({ field }: any) => (
                    <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea className="resize-none" {...field} value={field.value || ""} /></FormControl></FormItem>
                )} />

                <div className="space-y-2">
                    <FormLabel>Agreement PDF Documents</FormLabel>
                    <FileUploadZone
                        workspaceId={workspaceId}
                        listingId={listingId}
                        bucket="agreements"
                        pathPrefix="documents"
                        accept="application/pdf,image/*"
                        multiple={true}
                        maxFiles={5}
                        returnType="filePath"
                        onUploadComplete={(urls) => {
                            const current = form.getValues("agreementFilesUrl") || [];
                            form.setValue("agreementFilesUrl", [...current, ...urls]);
                        }}
                    />
                    {watchFiles.length > 0 && (
                        <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                            {watchFiles.length} file(s) attached and ready.
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Agreement"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
