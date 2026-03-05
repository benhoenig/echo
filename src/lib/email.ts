import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    if (!resend) {
        console.warn("RESEND_API_KEY not configured — skipping email send");
        return { success: false, error: "RESEND_API_KEY not configured" };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.NODE_ENV === "production"
                ? "ECHO <notifications@echo-app.com>"
                : "ECHO <onboarding@resend.dev>",
            to,
            subject,
            html,
        });

        if (error) {
            console.error("Resend error:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, error };
    }
}
