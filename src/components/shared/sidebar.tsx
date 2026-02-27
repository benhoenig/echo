"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Building2,
    Users,
    FolderOpen,
    Globe,
    Bot,
    Settings,
    ChevronLeft,
    Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/stores/sidebar-store";
import { Badge } from "@/components/ui/badge";
import { WorkspaceSwitcher } from "./workspace-switcher";

const mainNavItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        phase: null,
    },
    {
        label: "Listings",
        href: "/listings",
        icon: Building2,
        phase: "Phase 1",
    },
    {
        label: "CRM",
        href: "/crm",
        icon: Users,
        phase: "Phase 2",
    },
    {
        label: "Projects",
        href: "/projects",
        icon: FolderOpen,
        phase: "Phase 1",
    },
];

const toolNavItems = [
    {
        label: "Website",
        href: "/website",
        icon: Globe,
        phase: "Phase 3",
    },
    {
        label: "AI Assistant",
        href: "/ai",
        icon: Bot,
        phase: "Phase 4",
    },
];

const configNavItems = [
    {
        label: "Copy Templates",
        href: "/copy-templates",
        icon: Bot, // Using Bot or maybe FileText, let's use a generic doc icon
        phase: null,
    },
    {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        phase: null,
    },
];

interface NavSectionProps {
    label: string;
    items: typeof mainNavItems;
    pathname: string;
    collapsed: boolean;
}

function NavSection({ label, items, pathname, collapsed }: NavSectionProps) {
    return (
        <div>
            {!collapsed && (
                <div className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                    {label}
                </div>
            )}
            <nav className="flex flex-col gap-0.5">
                {items.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 mx-3 rounded-lg text-sm font-medium transition-colors duration-100",
                                isActive
                                    ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/15"
                                    : "text-stone-400 hover:bg-stone-800 hover:text-stone-200"
                            )}
                        >
                            <item.icon
                                className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-5 h-5")}
                                strokeWidth={1.75}
                            />
                            {!collapsed && (
                                <>
                                    <span className="truncate">{item.label}</span>
                                    {item.phase && (
                                        <Badge
                                            variant="secondary"
                                            className="ml-auto text-[10px] px-1.5 py-0 bg-stone-800 text-stone-500 border-stone-700"
                                        >
                                            {item.phase}
                                        </Badge>
                                    )}
                                </>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const { isOpen, isCollapsed, setOpen, setCollapsed } = useSidebarStore();

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen bg-stone-900 border-r border-stone-800 flex flex-col transition-all duration-200",
                    isCollapsed ? "w-16" : "w-60",
                    // Mobile: hidden by default, shown when open
                    "max-lg:translate-x-0",
                    !isOpen && "max-lg:-translate-x-full"
                )}
            >
                {/* Workspace switcher */}
                <div className="p-3">
                    <WorkspaceSwitcher isCollapsed={isCollapsed} />
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-2">
                    <NavSection
                        label="Main"
                        items={mainNavItems}
                        pathname={pathname}
                        collapsed={isCollapsed}
                    />
                    <div className="border-t border-stone-800 mx-3 my-2" />
                    <NavSection
                        label="Tools"
                        items={toolNavItems}
                        pathname={pathname}
                        collapsed={isCollapsed}
                    />
                    <div className="border-t border-stone-800 mx-3 my-2" />
                    <NavSection
                        label="Configuration"
                        items={configNavItems}
                        pathname={pathname}
                        collapsed={isCollapsed}
                    />
                </div>

                {/* Collapse toggle (desktop only) */}
                <div className="hidden lg:flex p-3 border-t border-stone-800">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCollapsed(!isCollapsed)}
                        className="w-full text-stone-400 hover:text-stone-200 hover:bg-stone-800"
                    >
                        <ChevronLeft
                            className={cn(
                                "w-4 h-4 transition-transform",
                                isCollapsed && "rotate-180"
                            )}
                            strokeWidth={1.75}
                        />
                        {!isCollapsed && <span className="ml-2 text-xs">Collapse</span>}
                    </Button>
                </div>
            </aside>

            {/* Mobile hamburger button — rendered outside sidebar so it's always visible */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(true)}
                className="fixed top-3.5 left-3 z-30 lg:hidden text-stone-600 hover:text-stone-800 dark:text-stone-400"
            >
                <Menu className="w-5 h-5" strokeWidth={1.75} />
            </Button>
        </>
    );
}
