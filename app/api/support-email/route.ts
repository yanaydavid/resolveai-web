import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { randomUUID } from "crypto";
import { storeSupportTicket } from "@/lib/kv-store";

function getKey(name: string) {
  return process.env[name] || "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ImprovMX webhook payload fields
    const from: string     = body.from      || body.envelope?.from || "";
    const fromName: string = body.from_name || body.name           || from.split("@")[0] || "לקוח";
    const subject: string  = body.subject   || "(ללא נושא)";
    const rawBody: string  = body.text || body.plain || body.body || "";

    if (!from || !rawBody) {
      return NextResponse.json({ error: "Missing email data" }, { status: 400 });
    }

    // ── Draft AI response with Claude ─────────────────────────
    const client = new Anthropic({ apiKey: getKey("ANTHROPIC_API_KEY") });

    const draftRes = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `אתה נציג תמיכה מקצועי ואדיב של ResolveAI — פלטפורמת בוררות AI ישראלית.
קיבלת את המייל הבא מלקוח:

שולח: ${fromName} (${from})
נושא: ${subject}
תוכן:
${rawBody}

כתוב תגובה רהוטה, ענייניות ומקצועית בעברית.
— פתח בברכה אישית לשם הלקוח
— טפל בבעיה/שאלה שעלתה
— אם אין לך מידע מספיק — הסבר שנבדוק ונחזור תוך 24 שעות
— סיים בנימוס עם חתימה: "בברכה, צוות ResolveAI"
— אל תוסיף הערות או הסברים — רק את התגובה עצמה`
      }],
    });

    const draft = (draftRes.content[0] as { type: string; text: string }).text.trim();

    // ── Save ticket to KV ─────────────────────────────────────
    const id    = randomUUID().replace(/-/g, "").slice(0, 16);
    const token = randomUUID().replace(/-/g, "");

    await storeSupportTicket({
      id,
      from,
      fromName,
      subject,
      body: rawBody,
      draft,
      token,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    // ── Email admin for approval ──────────────────────────────
    const adminEmail = getKey("ADMIN_EMAIL") || "resolvai13@gmail.com";
    const approveUrl = `https://resolveai.co.il/support/approve?id=${id}&token=${token}`;

    const resend = new Resend(getKey("RESEND_API_KEY"));
    await resend.emails.send({
      from: "ResolveAI Support <no-reply@resolveai.co.il>",
      to: adminEmail,
      subject: `[תמיכה] פנייה חדשה מ-${fromName} — ממתין לאישורך`,
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#1a2744;">
          <div style="background:#1a2744;padding:24px 32px;display:flex;align-items:center;justify-content:space-between;">
            <h1 style="color:#c9a84c;margin:0;font-size:20px;">ResolveAI — פנייה חדשה</h1>
            <span style="background:#c9a84c;color:#1a2744;padding:4px 12px;font-size:12px;font-weight:bold;border-radius:2px;">ממתין לאישור</span>
          </div>

          <div style="padding:28px 32px;background:#fffdf7;">
            <h2 style="font-size:15px;color:#1a2744;margin:0 0 16px;">פנייה מקורית מהלקוח</h2>
            <div style="background:white;border:1px solid #e8d9a0;padding:20px;border-radius:4px;margin-bottom:24px;">
              <p style="margin:0 0 6px;font-size:12px;color:#888;"><strong>שולח:</strong> ${fromName} &lt;${from}&gt;</p>
              <p style="margin:0 0 12px;font-size:12px;color:#888;"><strong>נושא:</strong> ${subject}</p>
              <hr style="border:none;border-top:1px solid #f0e8d0;margin-bottom:12px;">
              <p style="margin:0;font-size:14px;color:#333;white-space:pre-wrap;line-height:1.7;">${rawBody.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
            </div>

            <h2 style="font-size:15px;color:#1a2744;margin:0 0 16px;">תגובה מוצעת מ-AI</h2>
            <div style="background:#f5f0e8;border-right:4px solid #c9a84c;padding:20px;border-radius:4px;margin-bottom:28px;">
              <p style="margin:0;font-size:14px;color:#333;white-space:pre-wrap;line-height:1.7;">${draft.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
            </div>

            <div style="text-align:center;">
              <a href="${approveUrl}"
                style="display:inline-block;background:#1a2744;color:#c9a84c;padding:16px 40px;font-size:15px;font-weight:bold;text-decoration:none;border-radius:4px;letter-spacing:0.05em;">
                צפה, ערוך ואשר שליחה
              </a>
            </div>
            <p style="text-align:center;font-size:12px;color:#aaa;margin-top:12px;">
              הקישור בתוקף 30 יום
            </p>
          </div>

          <div style="background:#1a2744;padding:16px 32px;text-align:center;">
            <p style="color:#a0907a;margin:0;font-size:12px;">ResolveAI © 2026 | resolveai.co.il</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("support-email webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
