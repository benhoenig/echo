"use client";

import { useState, useTransition } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, MoreHorizontal, Mail, X } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { inviteTeamMember, updateTeamMemberRole, removeTeamMember, revokeInvitation } from "../actions";
import type { Tables } from "@/types/supabase";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = {
    owner: "Owner",
    admin: "Admin",
    co_worker: "Agent",
    listing_support: "Support",
    OWNER: "Owner",
    ADMIN: "Admin",
    CO_WORKER: "Agent",
    LISTING_SUPPORT: "Support",
};

const ROLE_COLORS: Record<string, string> = {
    owner: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
    admin: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    co_worker: "bg-stone-100 text-stone-700 dark:bg-stone-500/20 dark:text-stone-300",
    listing_support: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300",
    OWNER: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
    ADMIN: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    CO_WORKER: "bg-stone-100 text-stone-700 dark:bg-stone-500/20 dark:text-stone-300",
    LISTING_SUPPORT: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300",
};

export function TeamContent({
    members,
    pendingInvites,
    currentUserId,
    workspaceId,
}: {
    members: Tables<"users">[];
    pendingInvites: Tables<"workspace_invitations">[];
    currentUserId: string;
    workspaceId: string;
}) {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [inviteOpen, setInviteOpen] = useState(false);

    const handleInvite = async (formData: FormData) => {
        setError(null);
        formData.set("workspaceId", workspaceId);
        startTransition(async () => {
            const result = await inviteTeamMember(formData);
            if (result?.error) {
                setError(result.error);
                toast.error(result.error);
            } else {
                setInviteOpen(false);
                toast.success("Invitation sent successfully!");
            }
        });
    };

    const handleRoleChange = (userId: string, newRole: string) => {
        const formData = new FormData();
        formData.set("userId", userId);
        formData.set("role", newRole);
        startTransition(async () => {
            await updateTeamMemberRole(formData);
            toast.success("Role updated successfully.");
        });
    };

    const handleRemove = (userId: string) => {
        const formData = new FormData();
        formData.set("userId", userId);
        startTransition(async () => {
            await removeTeamMember(formData);
            toast.success("Member removed from workspace.");
        });
    };

    const handleRevokeInvite = (invitationId: string) => {
        const formData = new FormData();
        formData.set("invitationId", invitationId);
        startTransition(async () => {
            await revokeInvitation(formData);
            toast.success("Invitation revoked.");
        });
    };

    const activeMembers = members.filter((m) => m.is_active);

    return (
        <div className="space-y-6 max-w-2xl">
            {error && (
                <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">
                    {error}
                </div>
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <CardTitle className="text-base">
                        Active Members ({activeMembers.length})
                    </CardTitle>
                    <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <UserPlus className="w-4 h-4 mr-2" strokeWidth={1.75} />
                                Invite
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Invite Team Member</DialogTitle>
                            </DialogHeader>
                            <form action={handleInvite} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First name</Label>
                                        <Input id="firstName" name="firstName" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last name</Label>
                                        <Input id="lastName" name="lastName" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="teammate@company.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select name="role" defaultValue="co_worker">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="co_worker">Agent</SelectItem>
                                            <SelectItem value="listing_support">
                                                Listing Support
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending ? "Inviting..." : "Send invite"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="divide-y divide-border">
                        {activeMembers.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-9 h-9">
                                        <AvatarFallback className="bg-orange-100 text-orange-700 text-xs font-semibold">
                                            {member.first_name[0]}
                                            {member.last_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {member.first_name} {member.last_name}
                                            {member.id === currentUserId && (
                                                <span className="text-muted-foreground ml-1">(you)</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {member.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="secondary"
                                        className={ROLE_COLORS[member.role] || ""}
                                    >
                                        {ROLE_LABELS[member.role] || member.role}
                                    </Badge>
                                    {member.role !== "OWNER" && member.id !== currentUserId && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="p-1">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleRoleChange(
                                                            member.id,
                                                            member.role === "ADMIN" ? "CO_WORKER" : "ADMIN"
                                                        )
                                                    }
                                                >
                                                    {member.role === "ADMIN"
                                                        ? "Change to Agent"
                                                        : "Promote to Admin"}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => handleRemove(member.id)}
                                                >
                                                    Remove
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {pendingInvites && pendingInvites.length > 0 && (
                <Card>
                    <CardHeader className="border-b pb-4">
                        <CardTitle className="text-base text-muted-foreground">
                            Pending Invitations ({pendingInvites.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="divide-y divide-border">
                            {pendingInvites.map((invite) => (
                                <div
                                    key={invite.id}
                                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center opacity-70">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div className="opacity-80">
                                            <p className="text-sm font-medium">
                                                {invite.email}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Sent {new Date(invite.invited_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className="bg-transparent opacity-70"
                                        >
                                            {ROLE_LABELS[invite.role] || invite.role}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-destructive p-1"
                                            onClick={() => handleRevokeInvite(invite.id)}
                                            disabled={isPending}
                                            title="Revoke invitation"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
