import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updatePassword } from "@/app/(auth)/actions";
import { AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type PageProps = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function UpdatePasswordPage({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    const error = resolvedParams?.error as string | undefined;

    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
        redirect("/login");
    }

    return (
        <Card className="mx-auto max-w-sm w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Create Password</CardTitle>
                <CardDescription>
                    Welcome to ECHO! Please set a secure password to complete your account setup.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={updatePassword} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                        />
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                            <AlertCircle className="h-4 w-4" />
                            <p>{error}</p>
                        </div>
                    )}
                    <Button type="submit" className="w-full">
                        Complete Setup
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
