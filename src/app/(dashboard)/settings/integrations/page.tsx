import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare } from "lucide-react";

export default function IntegrationsSettingsPage() {
    const hasResendKey = !!process.env.RESEND_API_KEY;

    return (
        <div className="space-y-6">
            {/* Email Integration */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                                <Mail
                                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                    strokeWidth={1.75}
                                />
                            </div>
                            <div>
                                <CardTitle className="text-lg">
                                    Email (Resend)
                                </CardTitle>
                                <CardDescription>
                                    Transactional email for notification
                                    delivery.
                                </CardDescription>
                            </div>
                        </div>
                        <Badge
                            variant={hasResendKey ? "default" : "secondary"}
                            className={
                                hasResendKey
                                    ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                                    : ""
                            }
                        >
                            {hasResendKey ? "Configured" : "Not configured"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {hasResendKey
                            ? "Email notifications are active. Users can enable email delivery per notification type in their notification preferences."
                            : "Set the RESEND_API_KEY environment variable to enable email notifications."}
                    </p>
                </CardContent>
            </Card>

            {/* LINE Integration */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                                <MessageSquare
                                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                                    strokeWidth={1.75}
                                />
                            </div>
                            <div>
                                <CardTitle className="text-lg">
                                    LINE Messaging
                                </CardTitle>
                                <CardDescription>
                                    Send notifications via LINE, Thailand's
                                    primary messaging platform.
                                </CardDescription>
                            </div>
                        </div>
                        <Badge variant="secondary">Coming soon</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        LINE integration will be available in a future update.
                        This will allow agents to receive deal reminders,
                        mentions, and stage change alerts directly in LINE.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
