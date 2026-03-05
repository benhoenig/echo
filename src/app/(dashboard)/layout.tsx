"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { NotificationProvider } from "@/components/shared/notification-provider";
import { useSidebarStore } from "@/stores/sidebar-store";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isCollapsed } = useSidebarStore();

    return (
        <NotificationProvider>
            <div className="min-h-screen bg-background">
                <Sidebar />
                <div
                    className={cn(
                        "transition-all duration-200",
                        isCollapsed ? "lg:pl-16" : "lg:pl-60"
                    )}
                >
                    <Header />
                    <main className="p-6">{children}</main>
                </div>
            </div>
        </NotificationProvider>
    );
}
