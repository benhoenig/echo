"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signup, signInWithGoogle } from "../actions";

export default function SignupPage() {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleSignup = async (formData: FormData) => {
        setError(null);

        // Client-side validation
        const password = formData.get("password") as string;
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        startTransition(async () => {
            const result = await signup(formData);
            if (result?.error) {
                setError(result.error);
            }
        });
    };

    const handleGoogleSignup = async () => {
        setError(null);
        startTransition(async () => {
            const result = await signInWithGoogle();
            if (result?.error) {
                setError(result.error);
            }
        });
    };

    return (
        <Card className="shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Create your account</CardTitle>
                <CardDescription>Start your ECHO workspace in seconds</CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3 mb-4">
                        {error}
                    </div>
                )}
                <form action={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First name</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                placeholder="John"
                                required
                                disabled={isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last name</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                placeholder="Doe"
                                required
                                disabled={isPending}
                            />
                        </div>
                    </div>
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
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
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
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Creating account..." : "Create account"}
                    </Button>
                </form>

                <div className="relative my-4">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                        or
                    </span>
                </div>

                <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleGoogleSignup}
                    disabled={isPending}
                >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Continue with Google
                </Button>

                <p className="text-center text-sm text-muted-foreground mt-4">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                        Sign in
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
}
