import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function IntegrationsSettingsPage() {
    const t = await getTranslations("integrations");
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
                                    {t("emailResend")}
                                </CardTitle>
                                <CardDescription>
                                    {t("emailResendDesc")}
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
                            {hasResendKey ? t("configured") : t("notConfigured")}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {hasResendKey
                            ? t("emailActiveDesc")
                            : t("emailSetupDesc")}
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
                                    {t("lineMessaging")}
                                </CardTitle>
                                <CardDescription>
                                    {t("lineDesc")}
                                </CardDescription>
                            </div>
                        </div>
                        <Badge variant="secondary">{t("comingSoon")}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {t("lineComingSoonDesc")}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
