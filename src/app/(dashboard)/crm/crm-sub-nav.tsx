"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, Handshake } from "lucide-react";

const tabs = [
    { label: "Contacts", href: "/crm/contacts", icon: Users },
    { label: "Deals", href: "/crm/deals", icon: Handshake },
];

export function CrmSubNav() {
    const pathname = usePathname();

    return (
        <div className="flex items-center gap-1 border-b border-stone-200 dark:border-stone-800 mb-6">
            {tabs.map((tab) => {
                const isActive =
                    pathname === tab.href || pathname.startsWith(tab.href + "/");
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                            isActive
                                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                                : "border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                        )}
                    >
                        <tab.icon className="w-4 h-4" strokeWidth={1.75} />
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
