import { NextRequest, NextResponse, after } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import twilio from "twilio";
import {
  getCaseById,
  storeHearingRequest,
  type HearingRequest,
} from "@/lib/kv-store";

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();

    const caseId        = (fd.get("caseId")         as string)?.trim();
    const requestedBy   = fd.get("requestedBy")     as "claimant" | "respondent";
    const requesterName = (fd.get("requesterName")  as string)?.trim();
    const requesterEmail= (fd.get("requesterEmail") as string)?.trim();
    const otherPartyPhone = (fd.get("otherPartyPhone") as string)?.trim() || "";
    const newEvidence   = (fd.get("newEvidence")    as string)?.trim();
    const originalFinding = (fd.get("originalFinding") as string) || "";
    const originalSummary = (fd.get("originalSummary") as string) || "";
    const formCaseTitle   = (fd.get("caseTitle")   as string) || "";
    const formPartyOne    = (fd.get("partyOneName") as string) || "";
    const formPartyTwo    = (fd.get("partyTwoName") as string) || "";
    const docFiles = fd.getAll("documents") as File[];

    if (!caseId || !requestedBy || !requesterName || !requesterEmail || !newEvidence) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Load case data from KV (best-effort — may be null for old cases)
    const caseData = await getCaseById(caseId);

    // Resolve names/emails — prefer KV, fall back to form values
    const caseTitle    = caseData?.caseTitle    || formCaseTitle    || caseId;
    const partyOneName = caseData?.partyOneName || formPartyOne     || "צד א";
    const partyTwoName = caseData?.partyTwoName || formPartyTwo     || "צד ב";
    const partyOneEmail= caseData?.partyOneEmail || "";
    const partyTwoEmail= caseData?.partyTwoEmail || "";
    const category     = caseData?.category     || "other";
    const lang         = "he";

    const otherPartyName  = requestedBy === "claimant" ? partyTwoName  : partyOneName;
    const otherPartyEmail = requestedBy === "claimant" ? partyTwoEmail : partyOneEmail;
    // Prefer phone from KV; fall back to what the user typed in the form
    const kvOtherPhone = requestedBy === "claimant"
      ? caseData?.partyTwoPhone
      : caseData?.partyOnePhone;
    const resolvedOtherPhone = kvOtherPhone || otherPartyPhone;

    // Summarize newly uploaded documents (best-effort, lightweight)
    let newDocSummary = "";
    if (docFiles.length > 0 && process.env.ANTHROPIC_API_KEY) {
      try {
        const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const summaries: string[] = [];
        for (const file of docFiles.slice(0, 3)) {
          if (file.size === 0) continue;
          const base64   = Buffer.from(await file.arrayBuffer()).toString("base64");
          const isImage  = file.type.startsWith("image/");
          const docBlock = isImage
            ? { type: "image"    as const, source: { type: "base64" as const, media_type: file.type as "image/jpeg", data: base64 } }
            : { type: "document" as const, source: { type: "base64" as const, media_type: "application/pdf"    as const, data: base64 } };
          const r = await ai.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 256,
            messages: [{ role: "user", content: [docBlock, { type: "text" as const, text: `סכם בקצרה (2 משפטים) מה מוכיח המסמך "${file.name}" לטובת ${requesterName} בתיק: ${caseTitle}` }] }],
          });
          summaries.push(`[${file.name}]: ${(r.content[0] as { text: string }).text}`);
        }
        newDocSummary = summaries.join("\n");
      } catch { /* doc summary is non-critical */ }
    }

    const hearingId = `RH-${Date.now().toString().slice(-8)}`;

    const origin =
      req.headers.get("origin") ||
      req.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
      "https://resolveai.co.il";

    const respondUrl = `${origin}/new-hearing/respond/${hearingId}`;

    const hearing: HearingRequest = {
      hearingId,
      caseId,
      requestedBy,
      requesterName,
      requesterEmail,
      newEvidence,
      newDocSummary,
      submittedAt: new Date().toISOString(),
      status: "awaiting_response",
      otherPartyName,
      otherPartyEmail,
      otherPartyPhone: resolvedOtherPhone,
      caseTitle,
      category,
      partyOneName,
      partyOneEmail,
      partyTwoName,
      partyTwoEmail,
      lang,
      originalFinding,
      originalSummary,
    };

    await storeHearingRequest(hearing);

    // ── WhatsApp to other party ──────────────────────────────────
    if (resolvedOtherPhone) {
      after(async () => {
        try {
          const sid   = process.env.TWILIO_ACCOUNT_SID;
          const token = process.env.TWILIO_AUTH_TOKEN;
          const from  = process.env.TWILIO_WHATSAPP_FROM;
          if (!sid || !token || !from) return;

          const client = twilio(sid, token);
          let phone = resolvedOtherPhone.replace(/\D/g, "");
          if (phone.startsWith("0")) phone = "972" + phone.slice(1);
          if (!phone.startsWith("+")) phone = "+" + phone;

          const body = `⚖️ *ResolveAI — דיון נוסף*\n\nשלום ${otherPartyName},\n\n${requesterName} הגיש/ה בקשת דיון נוסף בתיק *${caseId}* (${caseTitle}).\n\nיש לך *5 ימי עסקים* להגיש תגובה לראיות החדשות שהוגשו.\n\nלצפייה ותגובה:\n${respondUrl}\n\n_ResolveAI — בוררות חכמה מבוססת AI_`;
          await client.messages.create({ from, to: `whatsapp:${phone}`, body });
        } catch (e) { console.error("WA new-hearing error:", e); }
      });
    }

    // ── Email to other party ─────────────────────────────────────
    if (otherPartyEmail) {
      after(async () => {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY || "");
          const preview = newEvidence.substring(0, 400) + (newEvidence.length > 400 ? "..." : "");
          await resend.emails.send({
            from: "ResolveAI <no-reply@resolveai.co.il>",
            to: otherPartyEmail,
            replyTo: "support@resolveai.co.il",
            subject: `⚖️ בקשת דיון נוסף בתיק ${caseId} — ResolveAI`,
            html: `
<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a2744;">
  <div style="background:#1a2744;padding:24px 32px;">
    <h1 style="color:#c9a84c;margin:0;font-size:22px;">ResolveAI</h1>
    <p style="color:#a0907a;margin:6px 0 0;font-size:13px;">דיון נוסף — תיק ${caseId}</p>
  </div>
  <div style="padding:32px;background:#fffdf7;">
    <p style="font-size:15px;">שלום ${otherPartyName},</p>
    <p>${requesterName} הגיש/ה בקשת <strong>דיון נוסף</strong> בתיק <strong>${caseTitle}</strong>.</p>
    <p>הדיון הנוסף מאפשר הגשת ראיות חדשות שלא היו קיימות בעת הדיון המקורי.</p>
    <div style="background:#f5f0e8;border-right:4px solid #c9a84c;padding:16px;margin:20px 0;">
      <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;">הראיות החדשות שהוגשו</p>
      <p style="margin:0;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap;">${preview}</p>
    </div>
    <p>יש לך <strong>5 ימי עסקים</strong> להגיש תגובה. אם לא תגיב, תינתן פסיקה על בסיס הראיות החדשות בלבד.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${respondUrl}" style="background:#1a2744;color:#c9a84c;padding:14px 32px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">הגש תגובה לדיון הנוסף</a>
    </div>
    <p style="font-size:12px;color:#aaa;">מספר דיון: ${hearingId}</p>
  </div>
  <div style="background:#1a2744;padding:16px 32px;text-align:center;">
    <p style="color:#a0907a;margin:0;font-size:12px;">ResolveAI © 2026 | resolveai.co.il</p>
  </div>
</div>`,
          });
        } catch (e) { console.error("New-hearing notify email error:", e); }
      });
    }

    // ── Confirmation to requester ────────────────────────────────
    after(async () => {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY || "");
        await resend.emails.send({
          from: "ResolveAI <no-reply@resolveai.co.il>",
          to: requesterEmail,
          replyTo: "support@resolveai.co.il",
          subject: `אישור בקשת דיון נוסף ${hearingId} — ResolveAI`,
          html: `
<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a2744;">
  <div style="background:#1a2744;padding:24px 32px;">
    <h1 style="color:#c9a84c;margin:0;font-size:22px;">ResolveAI</h1>
    <p style="color:#a0907a;margin:6px 0 0;font-size:13px;">אישור בקשת דיון נוסף</p>
  </div>
  <div style="padding:32px;background:#fffdf7;">
    <p>שלום ${requesterName},</p>
    <p>בקשת הדיון הנוסף שלך התקבלה בהצלחה.</p>
    <div style="background:white;border:1px solid #e8d9a0;padding:20px;margin:20px 0;">
      <p style="margin:0 0 6px;"><strong>תיק:</strong> ${caseTitle} (${caseId})</p>
      <p style="margin:0 0 6px;"><strong>מספר דיון:</strong> ${hearingId}</p>
      <p style="margin:0;"><strong>הוגש:</strong> ${new Date().toLocaleDateString("he-IL")}</p>
    </div>
    <p>${otherPartyName} יקבל/תקבל הודעה ויהיו לו/לה 5 ימי עסקים להגיש תגובה. לאחר מכן תישלח פסיקה מחודשת לשני הצדדים.</p>
  </div>
  <div style="background:#1a2744;padding:16px 32px;text-align:center;">
    <p style="color:#a0907a;margin:0;font-size:12px;">ResolveAI © 2026 | resolveai.co.il</p>
  </div>
</div>`,
        });
      } catch { /* non-critical */ }
    });

    return NextResponse.json({ hearingId, status: "submitted" });
  } catch (err) {
    console.error("new-hearing/submit error:", err);
    return NextResponse.json({ error: "Failed to submit hearing request" }, { status: 500 });
  }
}
