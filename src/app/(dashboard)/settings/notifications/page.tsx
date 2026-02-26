import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function NotificationSettingsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Notification Preferences</CardTitle>
                    <CardDescription>
                        Configure which notifications you receive and how.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Coming in Phase 2 with the full notification system.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
