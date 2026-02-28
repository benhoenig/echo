"use client";

import { useState, useTransition, ReactNode, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowLeft,
    Save,
    Loader2,
    Phone,
    Mail,
    Archive,
    ArchiveRestore,
    User,
    MessageSquare,
    Activity,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateContact, archiveContact, restoreContact } from "../contact-actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContactData = any;

const CONTACT_TYPE_OPTIONS = ["Buyer", "Seller", "Both", "Referrer"] as const;

const CONTACT_STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Active" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "CLOSED_WON", label: "Closed Won" },
    { value: "CLOSED_LOST", label: "Closed Lost" },
    { value: "UNQUALIFIED", label: "Unqualified" },
    { value: "REACTIVATE", label: "Reactivate" },
];

const CONTACT_SOURCE_OPTIONS = [
    { value: "LINE", label: "LINE" },
    { value: "WEBSITE", label: "Website" },
    { value: "REFERRAL", label: "Referral" },
    { value: "FACEBOOK", label: "Facebook" },
    { value: "WALK_IN", label: "Walk-in" },
    { value: "COLD_CALL", label: "Cold Call" },
];

const POTENTIAL_TIER_OPTIONS = [
    { value: "A", label: "A — Hot" },
    { value: "B", label: "B — Warm" },
    { value: "C", label: "C — Cool" },
    { value: "D", label: "D — Cold" },
];

interface ContactDetailContentProps {
    contact: ContactData;
    agents: Array<{ id: string; name: string }>;
    contactOptions: Array<{ id: string; name: string }>;
    commentsNode: ReactNode;
    activityFeedNode: ReactNode;
}

function getCompletenessScore(contact: ContactData): number {
    const coreFields = [
        contact.phone_primary,
        contact.email,
        contact.line_id,
        contact.nationality,
        contact.contact_source,
        contact.contact_status,
        contact.potential_tier,
        contact.notes,
    ];
    const filled = coreFields.filter(
        (v) => v !== null && v !== undefined && v !== ""
    ).length;
    return Math.round((filled / coreFields.length) * 100);
}

export function ContactDetailContent({
    contact,
    agents,
    contactOptions,
    commentsNode,
    activityFeedNode,
}: ContactDetailContentProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Core fields
    const [firstName, setFirstName] = useState(contact.first_name ?? "");
    const [lastName, setLastName] = useState(contact.last_name ?? "");
    const [nickname, setNickname] = useState(contact.nickname ?? "");
    const [contactTypes, setContactTypes] = useState<string[]>(
        contact.contact_type ?? []
    );
    const [phonePrimary, setPhonePrimary] = useState(
        contact.phone_primary ?? ""
    );
    const [phoneSecondary, setPhoneSecondary] = useState(
        contact.phone_secondary ?? ""
    );
    const [email, setEmail] = useState(contact.email ?? "");
    const [lineId, setLineId] = useState(contact.line_id ?? "");
    const [nationality, setNationality] = useState(contact.nationality ?? "");
    const [idCardOrPassport, setIdCardOrPassport] = useState(
        contact.id_card_or_passport_no ?? ""
    );
    const [contactSource, setContactSource] = useState(
        contact.contact_source ?? ""
    );
    const [contactStatus, setContactStatus] = useState(
        contact.contact_status ?? ""
    );
    const [potentialTier, setPotentialTier] = useState(
        contact.potential_tier ?? ""
    );
    const [assignedToId, setAssignedToId] = useState(
        contact.assigned_to_id ?? ""
    );
    const [referredById, setReferredById] = useState(
        contact.referred_by_id ?? ""
    );
    const [notes, setNotes] = useState(contact.notes ?? "");


    const completeness = useMemo(
        () => getCompletenessScore(contact),
        [contact]
    );

    function toggleContactType(type: string) {
        setContactTypes((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type]
        );
    }

    function handleSave() {
        if (!firstName.trim() || !lastName.trim()) {
            toast.error("First name and last name are required.");
            return;
        }

        startTransition(async () => {
            try {
                await updateContact(contact.id, {
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    nickname: nickname.trim() || null,
                    contact_type: contactTypes,
                    phone_primary: phonePrimary.trim() || null,
                    phone_secondary: phoneSecondary.trim() || null,
                    email: email.trim() || null,
                    line_id: lineId.trim() || null,
                    nationality: nationality.trim() || null,
                    id_card_or_passport_no: idCardOrPassport.trim() || null,
                    contact_source: contactSource || null,
                    contact_status: contactStatus || null,
                    potential_tier: potentialTier || null,
                    assigned_to_id: assignedToId || null,
                    referred_by_id: referredById || null,
                    notes: notes.trim() || null,
                });

                toast.success("Contact updated.");
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to update contact."
                );
            }
        });
    }

    function handleArchiveRestore() {
        startTransition(async () => {
            try {
                if (contact.archived) {
                    await restoreContact(contact.id);
                    toast.success("Contact restored.");
                } else {
                    await archiveContact(contact.id);
                    toast.success("Contact archived.");
                }
                router.refresh();
                router.push("/crm/contacts");
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to update contact."
                );
            }
        });
    }

    const referrerName = contact.referrer
        ? contact.referrer.nickname ||
          [contact.referrer.first_name, contact.referrer.last_name]
              .filter(Boolean)
              .join(" ")
        : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/crm/contacts">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            {contact.first_name} {contact.last_name}
                            {contact.nickname
                                ? ` (${contact.nickname})`
                                : ""}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            {(contact.contact_type as string[])?.map(
                                (t: string) => (
                                    <Badge
                                        key={t}
                                        variant="secondary"
                                        className="text-[10px] px-1.5 py-0"
                                    >
                                        {t}
                                    </Badge>
                                )
                            )}
                            {contact.contact_status && (
                                <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0"
                                >
                                    {contact.contact_status.replace(/_/g, " ")}
                                </Badge>
                            )}
                            {/* Completeness Score */}
                            <div className="flex items-center gap-1.5 ml-2">
                                <div className="w-12 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${completeness >= 80 ? "bg-emerald-500" : completeness >= 50 ? "bg-amber-500" : "bg-red-400"}`}
                                        style={{
                                            width: `${completeness}%`,
                                        }}
                                    />
                                </div>
                                <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                                    {completeness}% complete
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleArchiveRestore}
                        disabled={isPending}
                    >
                        {contact.archived ? (
                            <ArchiveRestore className="w-4 h-4 mr-1.5" />
                        ) : (
                            <Archive className="w-4 h-4 mr-1.5" />
                        )}
                        {contact.archived ? "Restore" : "Archive"}
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isPending}>
                        {isPending ? (
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-1.5" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="details" className="gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        Details
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Comments
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        Activity
                    </TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-6">
                        <h2 className="text-sm font-semibold text-foreground mb-4">
                            Contact Information
                        </h2>

                        {/* Contact Type */}
                        <div className="space-y-2 mb-5">
                            <Label className="text-sm font-medium">
                                Contact Type
                            </Label>
                            <div className="flex gap-3">
                                {CONTACT_TYPE_OPTIONS.map((type) => (
                                    <label
                                        key={type}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={contactTypes.includes(
                                                type
                                            )}
                                            onCheckedChange={() =>
                                                toggleContactType(type)
                                            }
                                        />
                                        <span className="text-sm">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    First Name *
                                </Label>
                                <Input
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Last Name *
                                </Label>
                                <Input
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Nickname
                                </Label>
                                <Input
                                    value={nickname}
                                    onChange={(e) =>
                                        setNickname(e.target.value)
                                    }
                                />
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Phone (Primary)
                                </Label>
                                <Input
                                    value={phonePrimary}
                                    onChange={(e) =>
                                        setPhonePrimary(e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Phone (Secondary)
                                </Label>
                                <Input
                                    value={phoneSecondary}
                                    onChange={(e) =>
                                        setPhoneSecondary(e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Email
                                </Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    LINE ID
                                </Label>
                                <Input
                                    value={lineId}
                                    onChange={(e) => setLineId(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Nationality
                                </Label>
                                <Input
                                    value={nationality}
                                    onChange={(e) =>
                                        setNationality(e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    ID Card / Passport
                                </Label>
                                <Input
                                    value={idCardOrPassport}
                                    onChange={(e) =>
                                        setIdCardOrPassport(e.target.value)
                                    }
                                />
                            </div>

                            {/* Status & Assignment */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Status
                                </Label>
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
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Potential Tier
                                </Label>
                                <Select
                                    value={potentialTier}
                                    onValueChange={setPotentialTier}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select tier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {POTENTIAL_TIER_OPTIONS.map((opt) => (
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
                                <Label className="text-xs text-muted-foreground">
                                    Source
                                </Label>
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
                                <Label className="text-xs text-muted-foreground">
                                    Assigned To
                                </Label>
                                <Select
                                    value={assignedToId}
                                    onValueChange={setAssignedToId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Unassigned" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {agents.map((a) => (
                                            <SelectItem
                                                key={a.id}
                                                value={a.id}
                                            >
                                                {a.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Referred By
                                </Label>
                                <Select
                                    value={referredById}
                                    onValueChange={setReferredById}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="None" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contactOptions.map((c) => (
                                            <SelectItem
                                                key={c.id}
                                                value={c.id}
                                            >
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mt-5 space-y-1.5">
                            <Label className="text-xs text-muted-foreground">
                                Notes
                            </Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                placeholder="Any additional notes..."
                            />
                        </div>
                    </div>

                    {/* Referral chain display */}
                    {referrerName && (
                        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-6">
                            <h2 className="text-sm font-semibold text-foreground mb-3">
                                Referral Chain
                            </h2>
                            <div className="flex items-center gap-2 text-sm">
                                <Badge variant="outline" className="text-xs">
                                    Referred by
                                </Badge>
                                <Link
                                    href={`/crm/contacts/${contact.referred_by_id}`}
                                    className="text-orange-600 hover:underline"
                                >
                                    {referrerName}
                                </Link>
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* Comments Tab */}
                <TabsContent value="comments">{commentsNode}</TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity">{activityFeedNode}</TabsContent>
            </Tabs>
        </div>
    );
}
