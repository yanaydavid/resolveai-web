import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupportTicket, updateSupportTicket } from "@/lib/kv-store";

export async function POST(req: NextRequest) {
  try {
    const { id, token, finalDraft } = await req.json();

    if (!id || !token || !finalDraft) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const ticket = await getSupportTicket(id);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    if (ticket.token !== token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }
    if (ticket.status !== "pending") {
      return NextResponse.json({ error: "already_handled", status: ticket.status }, { status: 409 });
    }

    // Send email to customer
    const resend = new Resend(process.env.RESEND_API_KEY || "");
    await resend.emails.send({
      from: "ResolveAI תמיכה <no-reply@resolveai.co.il>",
      to: ticket.from,
      replyTo: "support@resolveai.co.il",
      subject: `Re: ${ticket.subject}`,
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a2744;">
          <div style="background:#1a2744;padding:24px 32px;">
            <h1 style="color:#c9a84c;margin:0;font-size:20px;">ResolveAI</h1>
            <p style="color:#a0907a;margin:6px 0 0;font-size:13px;">מענה מצוות התמיכה</p>
          </div>
          <div style="padding:32px;background:#fffdf7;">
            <p style="white-space:pre-wrap;font-size:15px;line-height:1.8;color:#1a2744;">${finalDraft.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
            <hr style="border:none;border-top:1px solid #e8d9a0;margin:28px 0;">
            <p style="font-size:12px;color:#aaa;margin:0;">
              לפניות נוספות: <a href="mailto:support@resolveai.co.il" style="color:#c9a84c;">support@resolveai.co.il</a>
            </p>
          </div>
          <div style="background:#1a2744;padding:16px 32px;text-align:center;">
            <p style="color:#a0907a;margin:0;font-size:12px;">ResolveAI © 2026 | resolveai.co.il</p>
          </div>
        </div>
      `,
    });

    await updateSupportTicket(id, { status: "sent", draft: finalDraft });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("support-approve error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, token } = await req.json();
    const ticket = await getSupportTicket(id);
    if (!ticket || ticket.token !== token) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await updateSupportTicket(id, { status: "rejected" });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("support-reject error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
