"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const PROPERTY_TYPES = [
    { value: "CONDO", label: "Condo" },
    { value: "HOUSE", label: "House" },
    { value: "TOWNHOUSE", label: "Townhouse" },
    { value: "LAND", label: "Land" },
    { value: "COMMERCIAL", label: "Commercial" },
    { value: "OTHER", label: "Other" },
] as const;

interface PropertyTypeSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function PropertyTypeSelect({
    value,
    onValueChange,
    placeholder = "Select type",
    disabled = false,
}: PropertyTypeSelectProps) {
    return (
        <Select
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
        >
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                        {type.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export { PROPERTY_TYPES };

export const PROPERTY_TYPE_THAI: Record<string, string> = {
    CONDO: "คอนโด",
    HOUSE: "บ้านเดี่ยว",
    TOWNHOUSE: "ทาวน์เฮ้าส์",
    LAND: "ที่ดิน",
    COMMERCIAL: "อาคารพาณิชย์",
    OTHER: "อื่นๆ",
};
