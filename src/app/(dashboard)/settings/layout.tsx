"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
    Building,
    Users,
    GitBranch,
    Gauge,
    BookOpen,
    Bell,
    Plug,
    MapPin,
} from "lucide-react";

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const t = useTranslations("settings");

    const settingsNav = [
        { label: t("workspace"), href: "/settings", icon: Building },
        { label: t("team"), href: "/settings/team", icon: Users },
        { label: t("pipelineStages"), href: "/settings/pipeline", icon: GitBranch },
        { label: t("potentialTiers"), href: "/settings/potential", icon: Gauge },
        { label: t("playbook"), href: "/settings/playbook", icon: BookOpen },
        { label: t("zones"), href: "/settings/zones", icon: MapPin },
        { label: t("notifications"), href: "/settings/notifications", icon: Bell },
        { label: t("integrations"), href: "/settings/integrations", icon: Plug },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {t("subtitle")}
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Settings nav */}
                <nav className="w-full md:w-48 shrink-0">
                    <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                        {settingsNav.map((item) => {
                            const isActive =
                                item.href === "/settings"
                                    ? pathname === "/settings"
                                    : pathname.startsWith(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-100",
                                        isActive
                                            ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="w-4 h-4" strokeWidth={1.75} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Settings content */}
                <div className="flex-1 max-w-2xl">{children}</div>
            </div>
        </div>
    );
}
