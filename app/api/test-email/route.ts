// app/api/test-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { to } = await req.json();

    if (!to) {
      return NextResponse.json(
        { ok: false, error: "Email address required" },
        { status: 400 }
      );
    }

    // Send a test email
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "BeMyMentor <noreply@bemymentor.dev>",
      to,
      subject: "Test Email from BeMyMentor.dev",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">✅ Email Test Successful!</h1>
            </div>

            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #667eea; margin-top: 0;">Your email is working perfectly!</h2>

              <p>This is a test email from <strong>BeMyMentor.dev</strong> to confirm your email configuration is working correctly.</p>

              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <h3 style="margin-top: 0; color: #333;">Configuration Details:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li>✉️ <strong>From:</strong> noreply@bemymentor.dev</li>
                  <li>📧 <strong>To:</strong> ${to}</li>
                  <li>🚀 <strong>Provider:</strong> Resend</li>
                  <li>🔐 <strong>DKIM:</strong> Verified</li>
                  <li>✅ <strong>Status:</strong> Working</li>
                </ul>
              </div>

              <p>Your email system is now ready to send:</p>
              <ul>
                <li>Welcome emails to new users</li>
                <li>Booking confirmations</li>
                <li>Session reminders</li>
                <li>Admin notifications</li>
                <li>And more!</li>
              </ul>

              <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>💡 Tip:</strong> All your business emails (support@, abuse@, billing@, etc.) are now forwarding to your personal inbox via Cloudflare Email Routing.</p>
              </div>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

              <p style="color: #666; font-size: 14px; text-align: center;">
                If you have any questions, contact us at <a href="mailto:support@bemymentor.dev" style="color: #667eea;">support@bemymentor.dev</a>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json(
      {
        ok: true,
        message: `Test email sent successfully to ${to}`,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[api/test-email] Failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to send test email",
      },
      { status: 500 }
    );
  }
}
