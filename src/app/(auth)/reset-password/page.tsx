"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@supabase/ssr";

export default function ResetPasswordPage() {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        startTransition(async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const { error } = await supabase.auth.updateUser({
                password,
            });

            if (error) {
                setError(error.message);
            } else {
                router.push("/dashboard");
            }
        });
    };

    return (
        <Card className="shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Set new password</CardTitle>
                <CardDescription>
                    Enter your new password below
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
                        <Label htmlFor="password">New password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Minimum 6 characters"
                            required
                            minLength={6}
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            required
                            minLength={6}
                            disabled={isPending}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Updating..." : "Update password"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
