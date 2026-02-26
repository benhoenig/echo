"use client";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Building2,
    Users,
    FolderOpen,
    LayoutDashboard,
    Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const quickNavItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        group: "Navigation",
    },
    {
        label: "Listings",
        href: "/listings",
        icon: Building2,
        group: "Navigation",
    },
    { label: "CRM", href: "/crm", icon: Users, group: "Navigation" },
    {
        label: "Projects",
        href: "/projects",
        icon: FolderOpen,
        group: "Navigation",
    },
    {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        group: "Navigation",
    },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
    const router = useRouter();

    // Keyboard shortcut: Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onOpenChange(!open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [open, onOpenChange]);

    const handleSelect = (href: string) => {
        onOpenChange(false);
        router.push(href);
    };

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput placeholder="Search or jump to..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Navigation">
                    {quickNavItems.map((item) => (
                        <CommandItem
                            key={item.href}
                            onSelect={() => handleSelect(item.href)}
                            className="gap-2"
                        >
                            <item.icon className="w-4 h-4" strokeWidth={1.75} />
                            <span>{item.label}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
