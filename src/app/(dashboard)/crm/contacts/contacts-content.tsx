"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Users, Layers, Archive } from "lucide-react";
import type { ColumnFiltersState, GroupingState } from "@tanstack/react-table";
import { ContactsDataTable } from "./contacts-data-table";
import { ContactsFilterBar } from "./contacts-filter-bar";
import { CreateContactSheet } from "./create-contact-sheet";
import { restoreContact, archiveContact } from "./contact-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CrmSubNav } from "../crm-sub-nav";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContactRow = any;

interface ContactsContentProps {
    initialContacts: ContactRow[];
    archivedContacts: ContactRow[];
    workspaceId: string;
    userId: string;
}

const GROUP_OPTIONS = [
    { value: "__none__", label: "None" },
    { value: "contact_status", label: "Status" },
    { value: "potential_tier", label: "Potential" },
    { value: "contact_source", label: "Source" },
];

export function ContactsContent({
    initialContacts,
    archivedContacts,
    workspaceId,
    userId,
}: ContactsContentProps) {
    const [search, setSearch] = useState("");
    const [sheetOpen, setSheetOpen] = useState(false);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [grouping, setGrouping] = useState<GroupingState>([]);
    const [showArchived, setShowArchived] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const activeData = showArchived ? archivedContacts : initialContacts;

    const filteredContacts = useMemo(() => {
        if (!search.trim()) return activeData;
        const q = search.toLowerCase();
        return activeData.filter(
            (c: ContactRow) =>
                c.first_name?.toLowerCase().includes(q) ||
                c.last_name?.toLowerCase().includes(q) ||
                c.nickname?.toLowerCase().includes(q) ||
                c.phone_primary?.toLowerCase().includes(q) ||
                c.email?.toLowerCase().includes(q) ||
                c.line_id?.toLowerCase().includes(q)
        );
    }, [activeData, search]);

    useEffect(() => {
        if (showArchived && archivedContacts.length === 0) {
            setShowArchived(false);
        }
    }, [showArchived, archivedContacts.length]);

    function handleRestore(contactId: string) {
        startTransition(async () => {
            try {
                await restoreContact(contactId);
                toast.success("Contact restored.");
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to restore contact."
                );
            }
        });
    }

    function handleArchive(contactId: string) {
        startTransition(async () => {
            try {
                await archiveContact(contactId);
                toast.success("Contact archived.");
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to archive contact."
                );
            }
        });
    }

    function handleGroupChange(value: string) {
        setGrouping(value === "__none__" ? [] : [value]);
    }

    // Derive contact type counts for the header
    const typeCounts = useMemo(() => {
        const counts = { buyer: 0, seller: 0, referrer: 0, total: initialContacts.length };
        for (const c of initialContacts) {
            const types = c.contact_type as string[] | null;
            if (types?.includes("Buyer")) counts.buyer++;
            if (types?.includes("Seller")) counts.seller++;
            if (types?.includes("Referrer")) counts.referrer++;
        }
        return counts;
    }, [initialContacts]);

    return (
        <div className="space-y-4">
            <CrmSubNav />
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">
                        {showArchived ? "Archived Contacts" : "Contacts"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {showArchived
                            ? `${archivedContacts.length} archived contact${archivedContacts.length !== 1 ? "s" : ""}`
                            : `${typeCounts.total} contact${typeCounts.total !== 1 ? "s" : ""} — ${typeCounts.buyer} buyers, ${typeCounts.seller} sellers`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {archivedContacts.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Switch
                                id="show-archived-contacts"
                                checked={showArchived}
                                onCheckedChange={setShowArchived}
                            />
                            <Label
                                htmlFor="show-archived-contacts"
                                className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1.5"
                            >
                                <Archive className="w-3.5 h-3.5" />
                                Archived ({archivedContacts.length})
                            </Label>
                        </div>
                    )}
                    {!showArchived && (
                        <Button onClick={() => setSheetOpen(true)}>
                            <Plus className="w-4 h-4 mr-1.5" />
                            New Contact
                        </Button>
                    )}
                </div>
            </div>

            {/* Search + Group By Row */}
            <div className="flex items-center gap-3">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search contacts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Group By */}
                <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    <Select
                        value={grouping.length > 0 ? grouping[0] : "__none__"}
                        onValueChange={handleGroupChange}
                    >
                        <SelectTrigger className="w-[130px] h-9 text-xs">
                            <SelectValue placeholder="Group by" />
                        </SelectTrigger>
                        <SelectContent>
                            {GROUP_OPTIONS.map((opt) => (
                                <SelectItem
                                    key={opt.value}
                                    value={opt.value}
                                    className="text-xs"
                                >
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Filter Bar */}
            <ContactsFilterBar
                data={filteredContacts}
                columnFilters={columnFilters}
                onColumnFiltersChange={setColumnFilters}
            />

            {/* Data Table */}
            {filteredContacts.length === 0 && columnFilters.length === 0 ? (
                <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        {showArchived ? (
                            <>
                                <Archive
                                    className="w-12 h-12 text-stone-300 dark:text-stone-600"
                                    strokeWidth={1.75}
                                />
                                <p className="text-sm font-medium text-foreground mt-4">
                                    No archived contacts
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Archived contacts will appear here.
                                </p>
                            </>
                        ) : (
                            <>
                                <Users
                                    className="w-12 h-12 text-stone-300 dark:text-stone-600"
                                    strokeWidth={1.75}
                                />
                                <p className="text-sm font-medium text-foreground mt-4">
                                    {search
                                        ? "No contacts match your search"
                                        : "No contacts yet"}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {search
                                        ? "Try a different search term."
                                        : "Add your first contact to get started."}
                                </p>
                                {!search && (
                                    <Button
                                        className="mt-4"
                                        size="sm"
                                        onClick={() => setSheetOpen(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-1.5" />
                                        New Contact
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <ContactsDataTable
                    data={filteredContacts}
                    columnFilters={columnFilters}
                    onColumnFiltersChange={setColumnFilters}
                    grouping={grouping}
                    showArchived={showArchived}
                    onRestore={handleRestore}
                    onArchive={handleArchive}
                />
            )}

            {/* Create Sheet */}
            <CreateContactSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                workspaceId={workspaceId}
                userId={userId}
            />
        </div>
    );
}
