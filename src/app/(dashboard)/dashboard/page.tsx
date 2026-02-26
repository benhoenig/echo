import { getCurrentUser, getDashboardMetrics } from "@/lib/queries";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FolderKanban, Users, Clock } from "lucide-react";

export default async function DashboardPage() {
    console.log("[Dashboard Page] Fetching current user...");
    const user = await getCurrentUser();
    console.log("[Dashboard Page] Current user result:", user ? "FOUND USER" : "NULL");

    if (!user) {
        console.log("[Dashboard Page] Redirecting to /login because user is null!");
        redirect("/login");
    }

    const metrics = await getDashboardMetrics(user.workspace_id);
    const workspace = user.workspaces as { workspace_name: string } | null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Welcome to {workspace?.workspace_name ?? "ECHO"}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Here&apos;s an overview of your workspace activity
                </p>
            </div>

            {/* Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Listings"
                    value={metrics.totalListings}
                    icon={<Building2 className="w-4 h-4" strokeWidth={1.75} />}
                    description="Active properties"
                />
                <MetricCard
                    title="Active Deals"
                    value={metrics.totalDeals}
                    icon={<FolderKanban className="w-4 h-4" strokeWidth={1.75} />}
                    description="In pipeline"
                />
                <MetricCard
                    title="CRM Contacts"
                    value={metrics.totalContacts}
                    icon={<Users className="w-4 h-4" strokeWidth={1.75} />}
                    description="Buyers & sellers"
                />
                <MetricCard
                    title="Recent Activity"
                    value={metrics.recentActivity.length}
                    icon={<Clock className="w-4 h-4" strokeWidth={1.75} />}
                    description="Last 24 hours"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {metrics.recentActivity.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-8 text-center">
                                No recent activity — start by adding your first listing!
                            </p>
                        ) : (
                            <ul className="space-y-3">
                                {metrics.recentActivity.map((activity) => (
                                    <li
                                        key={activity.id}
                                        className="flex items-start gap-3 text-sm"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                                        <div>
                                            <p>{activity.description || `${activity.action_type} on ${activity.entity_type}`}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(activity.created_at).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Quick Start</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <QuickAction
                            title="Add your first listing"
                            description="Create a property listing to get started"
                            href="/listings"
                        />
                        <QuickAction
                            title="Import contacts"
                            description="Add your buyer and seller contacts to CRM"
                            href="/crm"
                        />
                        <QuickAction
                            title="Configure pipeline"
                            description="Set up your deal pipeline stages"
                            href="/settings/pipeline"
                        />
                        <QuickAction
                            title="Invite your team"
                            description="Add team members to collaborate"
                            href="/settings/team"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function MetricCard({
    title,
    value,
    icon,
    description,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    description: string;
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <div className="text-muted-foreground">{icon}</div>
                </div>
                <p className="text-2xl font-bold tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    );
}

function QuickAction({
    title,
    description,
    href,
}: {
    title: string;
    description: string;
    href: string;
}) {
    return (
        <a
            href={href}
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
        >
            <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
            <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </a>
    );
}
