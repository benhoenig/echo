"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateWorkspace } from "./actions";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Tables } from "@/types/supabase";

const COLORS = [
    { name: "Orange", value: "#F97316" },
    { name: "Blue", value: "#3B82F6" },
    { name: "Green", value: "#22C55E" },
    { name: "Purple", value: "#A855F7" },
    { name: "Rose", value: "#F43F5E" },
    { name: "Teal", value: "#14B8A6" },
];

export function WorkspaceSettingsForm({
    workspace,
    userId,
}: {
    workspace: Tables<"workspaces">;
    userId: string;
}) {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [selectedColor, setSelectedColor] = useState(workspace.primary_color || "#F97316");
    const [isPending, startTransition] = useTransition();
    const setWorkspaceName = useWorkspaceStore((s) => s.setWorkspaceName);

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        setSuccess(false);
        formData.set("primaryColor", selectedColor);
        startTransition(async () => {
            const result = await updateWorkspace(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                const newName = formData.get("workspace_name") as string;
                if (newName) setWorkspaceName(newName);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        });
    };

    void userId; // unused for now, will be used for profile updates

    return (
        <div className="space-y-6 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">General</CardTitle>
                    <CardDescription>Update your workspace name and branding</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3 mb-4">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-500/10 text-green-700 dark:text-green-400 text-sm rounded-md p-3 mb-4">
                            Settings updated successfully
                        </div>
                    )}
                    <form action={handleSubmit} className="space-y-4">
                        <input type="hidden" name="workspaceId" value={workspace.id} />
                        <div className="space-y-2">
                            <Label htmlFor="name">Workspace Name</Label>
                            <Input
                                id="name"
                                name="workspace_name"
                                defaultValue={workspace.workspace_name}
                                placeholder="My Workspace"
                                disabled={isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Brand Color</Label>
                            <div className="flex gap-2">
                                {COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setSelectedColor(color.value)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color.value
                                            ? "border-foreground scale-110"
                                            : "border-transparent"
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                        <Button type="submit" disabled={isPending} size="sm">
                            {isPending ? "Saving..." : "Save changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Workspace Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Plan</span>
                        <span className="font-medium capitalize">{workspace.plan_tier}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium">
                            {new Date(workspace.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium capitalize">{workspace.subscription_status}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Brand Signature</CardTitle>
                    <CardDescription>
                        This signature block will be appended to the bottom of all generated listing copies.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <input type="hidden" name="workspaceId" value={workspace.id} />
                        <div className="space-y-2">
                            <Label htmlFor="brand_signature">Signature Text</Label>
                            <textarea
                                id="brand_signature"
                                name="brand_signature"
                                defaultValue={(workspace as Record<string, unknown>).brand_signature as string || ""}
                                placeholder={"---\n📲 Contact:\nTel: 065-359-9541\nLine: @klaichanproperty"}
                                className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={isPending}
                            />
                        </div>
                        <Button type="submit" disabled={isPending} size="sm">
                            {isPending ? "Saving..." : "Save Signature"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
