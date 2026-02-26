import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail } from "lucide-react";

export default async function ConfirmPage({
    searchParams,
}: {
    searchParams: Promise<{ email?: string }>;
}) {
    const params = await searchParams;
    const email = params.email || "your email";

    return (
        <Card className="shadow-lg">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                    <Mail className="w-10 h-10 text-orange-500" strokeWidth={1.75} />
                </div>
                <CardTitle className="text-xl">Check your email</CardTitle>
                <CardDescription>
                    We sent a confirmation link to <strong>{email}</strong>
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                    Click the link in the email to verify your account and get started with ECHO.
                </p>
                <Link href="/login">
                    <Button variant="secondary" className="w-full">
                        Back to sign in
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
