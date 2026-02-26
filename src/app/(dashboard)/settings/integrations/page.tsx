import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function IntegrationsSettingsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Integrations</CardTitle>
                    <CardDescription>
                        Connect LINE Notify, email, and other services.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Coming in Phase 2 with LINE Notify and email integration.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
