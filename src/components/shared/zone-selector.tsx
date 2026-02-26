"use client";

import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/supabase";

type Zone = Tables<"zones">;

interface ZoneSelectorProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function ZoneSelector({
    value,
    onValueChange,
    placeholder = "Select zone",
    disabled = false,
}: ZoneSelectorProps) {
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchZones() {
            const supabase = createClient();
            const { data } = await supabase
                .from("zones")
                .select("*")
                .order("zone_name_english", { ascending: true });
            setZones(data ?? []);
            setLoading(false);
        }
        fetchZones();
    }, []);

    return (
        <Select
            value={value}
            onValueChange={onValueChange}
            disabled={disabled || loading}
        >
            <SelectTrigger>
                <SelectValue
                    placeholder={loading ? "Loading zones..." : placeholder}
                />
            </SelectTrigger>
            <SelectContent>
                {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                        {zone.zone_name_english} ({zone.zone_name_thai})
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
