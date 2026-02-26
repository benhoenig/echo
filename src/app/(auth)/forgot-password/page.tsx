"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { forgotPassword } from "../actions";

export default function ForgotPasswordPage() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            const result = await forgotPassword(formData);
            if (result?.error) {
                setError(result.error);
            } else if (result?.success) {
                setSuccess(true);
            }
        });
    };

    if (success) {
        return (
            <Card className="shadow-lg">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                        <CheckCircle2
                            className="w-10 h-10 text-green-500"
                            strokeWidth={1.75}
                        />
                    </div>
                    <CardTitle className="text-xl">Check your email</CardTitle>
                    <CardDescription>
                        We&apos;ve sent a password reset link to your email address.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Link href="/login">
                        <Button variant="secondary" className="w-full">
                            Back to sign in
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Reset your password</CardTitle>
                <CardDescription>
                    Enter your email and we&apos;ll send you a reset link
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3 mb-4">
                        {error}
                    </div>
                )}
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@company.com"
                            required
                            disabled={isPending}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Sending..." : "Send reset link"}
                    </Button>
                </form>
                <div className="mt-4 text-center">
                    <Link
                        href="/login"
                        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Back to sign in
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
