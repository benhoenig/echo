"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createContact, checkDuplicateContacts } from "./contact-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateContactSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
    userId: string;
}

const CONTACT_TYPE_OPTIONS = ["Buyer", "Seller", "Both", "Referrer"] as const;

const CONTACT_SOURCE_OPTIONS = [
    { value: "LINE", label: "LINE" },
    { value: "WEBSITE", label: "Website" },
    { value: "REFERRAL", label: "Referral" },
    { value: "FACEBOOK", label: "Facebook" },
    { value: "WALK_IN", label: "Walk-in" },
    { value: "COLD_CALL", label: "Cold Call" },
] as const;

const CONTACT_STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Active" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "UNQUALIFIED", label: "Unqualified" },
] as const;

export function CreateContactSheet({
    open,
    onOpenChange,
    workspaceId,
    userId,
}: CreateContactSheetProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Core fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [nickname, setNickname] = useState("");
    const [contactTypes, setContactTypes] = useState<string[]>([]);
    const [phonePrimary, setPhonePrimary] = useState("");
    const [phoneSecondary, setPhoneSecondary] = useState("");
    const [email, setEmail] = useState("");
    const [lineId, setLineId] = useState("");
    const [nationality, setNationality] = useState("");
    const [contactSource, setContactSource] = useState<string>("");
    const [contactStatus, setContactStatus] = useState<string>("ACTIVE");
    const [notes, setNotes] = useState("");

    // Duplicate detection
    const [duplicates, setDuplicates] = useState<
        Array<{
            id: string;
            first_name: string;
            last_name: string;
            nickname: string | null;
            phone_primary: string | null;
            email: string | null;
            match_reason: string;
        }>
    >([]);
    const [duplicateChecked, setDuplicateChecked] = useState(false);

    function resetForm() {
        setFirstName("");
        setLastName("");
        setNickname("");
        setContactTypes([]);
        setPhonePrimary("");
        setPhoneSecondary("");
        setEmail("");
        setLineId("");
        setNationality("");
        setContactSource("");
        setContactStatus("ACTIVE");
        setNotes("");
        setDuplicates([]);
        setDuplicateChecked(false);
    }

    function toggleContactType(type: string) {
        setContactTypes((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type]
        );
    }

    function handleSubmit() {
        if (!firstName.trim() || !lastName.trim()) {
            toast.error("First name and last name are required.");
            return;
        }
        if (contactTypes.length === 0) {
            toast.error("Please select at least one contact type.");
            return;
        }

        startTransition(async () => {
            try {
                // Check for duplicates first (if not already checked)
                if (!duplicateChecked && (phonePrimary || email)) {
                    const dupes = await checkDuplicateContacts(
                        workspaceId,
                        phonePrimary || null,
                        email || null,
                        firstName,
                        lastName
                    );
                    if (dupes.length > 0) {
                        setDuplicates(dupes);
                        setDuplicateChecked(true);
                        return; // Show warning, let user confirm
                    }
                }

                await createContact({
                    workspace_id: workspaceId,
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    nickname: nickname.trim() || null,
                    contact_type: contactTypes,
                    phone_primary: phonePrimary.trim() || null,
                    phone_secondary: phoneSecondary.trim() || null,
                    email: email.trim() || null,
                    line_id: lineId.trim() || null,
                    nationality: nationality.trim() || null,
                    contact_source: (contactSource || null) as any,
                    contact_status: (contactStatus || null) as any,
                    notes: notes.trim() || null,
                    last_updated_at: new Date().toISOString(),
                });

                toast.success("Contact created.");
                resetForm();
                onOpenChange(false);
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to create contact."
                );
            }
        });
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>New Contact</SheetTitle>
                    <SheetDescription>
                        Add a new contact to your workspace.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-5 py-6">
                    {/* Duplicate Warning */}
                    {duplicates.length > 0 && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <p className="font-medium mb-1">
                                    Possible duplicate contact
                                    {duplicates.length > 1 ? "s" : ""} found:
                                </p>
                                <ul className="text-xs space-y-1">
                                    {duplicates.map((d) => (
                                        <li key={d.id}>
                                            {d.first_name} {d.last_name}
                                            {d.nickname
                                                ? ` (${d.nickname})`
                                                : ""}{" "}
                                            — {d.match_reason}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-xs mt-2">
                                    Click &ldquo;Create Contact&rdquo; again to
                                    proceed anyway.
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Contact Type */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Contact Type *
                        </Label>
                        <div className="flex gap-3">
                            {CONTACT_TYPE_OPTIONS.map((type) => (
                                <label
                                    key={type}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <Checkbox
                                        checked={contactTypes.includes(type)}
                                        onCheckedChange={() =>
                                            toggleContactType(type)
                                        }
                                    />
                                    <span className="text-sm">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Name */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="firstName" className="text-sm">
                                First Name *
                            </Label>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => {
                                    setFirstName(e.target.value);
                                    setDuplicateChecked(false);
                                }}
                                placeholder="Somchai"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="lastName" className="text-sm">
                                Last Name *
                            </Label>
                            <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => {
                                    setLastName(e.target.value);
                                    setDuplicateChecked(false);
                                }}
                                placeholder="Srichai"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="nickname" className="text-sm">
                            Nickname
                        </Label>
                        <Input
                            id="nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Chai"
                        />
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="phonePrimary" className="text-sm">
                                Phone (Primary)
                            </Label>
                            <Input
                                id="phonePrimary"
                                value={phonePrimary}
                                onChange={(e) => {
                                    setPhonePrimary(e.target.value);
                                    setDuplicateChecked(false);
                                }}
                                placeholder="08X-XXX-XXXX"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="phoneSecondary" className="text-sm">
                                Phone (Secondary)
                            </Label>
                            <Input
                                id="phoneSecondary"
                                value={phoneSecondary}
                                onChange={(e) =>
                                    setPhoneSecondary(e.target.value)
                                }
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setDuplicateChecked(false);
                                }}
                                placeholder="email@example.com"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="lineId" className="text-sm">
                                LINE ID
                            </Label>
                            <Input
                                id="lineId"
                                value={lineId}
                                onChange={(e) => setLineId(e.target.value)}
                                placeholder="@lineid"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="nationality" className="text-sm">
                            Nationality
                        </Label>
                        <Input
                            id="nationality"
                            value={nationality}
                            onChange={(e) => setNationality(e.target.value)}
                            placeholder="Thai"
                        />
                    </div>

                    {/* Source & Status */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-sm">Source</Label>
                            <Select
                                value={contactSource}
                                onValueChange={setContactSource}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CONTACT_SOURCE_OPTIONS.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm">Status</Label>
                            <Select
                                value={contactStatus}
                                onValueChange={setContactStatus}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CONTACT_STATUS_OPTIONS.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <Label htmlFor="notes" className="text-sm">
                            Notes
                        </Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional notes..."
                            rows={3}
                        />
                    </div>
                </div>

                <SheetFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            resetForm();
                            onOpenChange(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending && (
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        )}
                        {duplicates.length > 0
                            ? "Create Anyway"
                            : "Create Contact"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
