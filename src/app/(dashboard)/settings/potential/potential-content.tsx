"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import { updatePotentialConfig } from "../pipeline-actions";
import type { Tables } from "@/types/supabase";

const MODULE_LABELS: Record<string, string> = {
    LISTINGS: "Listings",
    BUYER_CRM: "Buyer CRM",
    SELLER_CRM: "Seller CRM",
};

const TIER_COLORS = [
    "#EF4444", "#F97316", "#EAB308", "#22C55E",
    "#3B82F6", "#8B5CF6", "#78716C", "#06B6D4",
];

export function PotentialContent({
    configs,
}: {
    configs: Tables<"potential_configs">[];
}) {
    const [isPending, startTransition] = useTransition();
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const modules = ["LISTINGS", "BUYER_CRM", "SELLER_CRM"];

    const handleSave = (formData: FormData) => {
        setError(null);
        setSuccess(null);
        startTransition(async () => {
            const result = await updatePotentialConfig(formData);
            if (result?.error) setError(result.error);
            else {
                setSuccess("Saved!");
                setTimeout(() => setSuccess(null), 2000);
            }
        });
    };

    const getModuleConfigs = (module: string) =>
        configs.filter((c) => c.module === module);

    return (
        <div className="max-w-2xl">
            {error && (
                <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3 mb-4">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-500/10 text-green-700 dark:text-green-400 text-sm rounded-md p-3 mb-4">
                    {success}
                </div>
            )}
            <Tabs defaultValue="LISTINGS">
                <TabsList>
                    {modules.map((m) => (
                        <TabsTrigger key={m} value={m}>
                            {MODULE_LABELS[m]}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {modules.map((m) => (
                    <TabsContent key={m} value={m} className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {MODULE_LABELS[m]} Tiers
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {getModuleConfigs(m).map((config) => (
                                    <TierRow
                                        key={config.id}
                                        config={config}
                                        onSave={handleSave}
                                        isPending={isPending}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

function TierRow({
    config,
    onSave,
    isPending,
}: {
    config: Tables<"potential_configs">;
    onSave: (formData: FormData) => void;
    isPending: boolean;
}) {
    const [color, setColor] = useState(config.color);
    const [showColors, setShowColors] = useState(false);

    return (
        <form action={onSave} className="flex items-end gap-3">
            <input type="hidden" name="configId" value={config.id} />
            <input type="hidden" name="color" value={color || ""} />

            {/* Tier Label */}
            <div className="shrink-0">
                <Label className="text-xs text-muted-foreground">Tier</Label>
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm mt-1 cursor-pointer"
                    style={{ backgroundColor: color || undefined }}
                    onClick={() => setShowColors(!showColors)}
                    title="Click to change color"
                >
                    {config.potential_label}
                </div>
                {showColors && (
                    <div className="flex gap-1 mt-1 flex-wrap max-w-[120px]">
                        {TIER_COLORS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => {
                                    setColor(c);
                                    setShowColors(false);
                                }}
                                className={`w-5 h-5 rounded-full border ${color === c ? "border-foreground" : "border-transparent"
                                    }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
                <Label htmlFor={`name-${config.id}`} className="text-xs">
                    Display Name
                </Label>
                <Input
                    id={`name-${config.id}`}
                    name="potentialName"
                    defaultValue={config.potential_name || ""}
                    placeholder="e.g. Hot"
                    className="mt-1"
                />
            </div>

            {/* Reminder */}
            <div className="w-20 shrink-0">
                <Label htmlFor={`reminder-${config.id}`} className="text-xs">
                    Days
                </Label>
                <Input
                    id={`reminder-${config.id}`}
                    name="reminderInterval"
                    type="number"
                    min={1}
                    max={365}
                    defaultValue={config.reminder_interval ?? ""}
                    className="mt-1"
                />
            </div>

            {/* Description */}
            <div className="flex-1 min-w-0 hidden lg:block">
                <Label htmlFor={`desc-${config.id}`} className="text-xs">
                    Description
                </Label>
                <Input
                    id={`desc-${config.id}`}
                    name="description"
                    defaultValue={config.description || ""}
                    placeholder="Optional"
                    className="mt-1"
                />
            </div>

            <Button type="submit" size="sm" disabled={isPending} className="shrink-0">
                <Save className="w-3.5 h-3.5" />
            </Button>
        </form>
    );
}
