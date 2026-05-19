import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  getHearingRequest,
  getCaseFullData,
  updateHearingRequest,
} from "@/lib/kv-store";
import { analyzeNewHearing } from "@/lib/analyze";

// ── Israeli business day helpers ──────────────────────────────────────────────

const IL_HOLIDAYS = new Set([
  // 2024
  "2024-10-02", "2024-10-03", "2024-10-11", "2024-10-12",
  "2024-10-16", "2024-10-17", "2024-10-23", "2024-10-24",
  // 2025
  "2025-04-12", "2025-04-13", "2025-04-18", "2025-04-19",
  "2025-06-02",
  "2025-09-22", "2025-09-23", "2025-10-01", "2025-10-02",
  "2025-10-06", "2025-10-07", "2025-10-13", "2025-10-14",
  // 2026
  "2026-03-31", "2026-04-01", "2026-04-06", "2026-04-07",
  "2026-05-20",
  "2026-09-11", "2026-09-12", "2026-09-20", "2026-09-21",
  "2026-09-25", "2026-09-26", "2026-10-02", "2026-10-03",
]);

function isILBusinessDay(d: Date): boolean {
  const day = d.getDay();
  if (day === 5 || day === 6) return false;
  return !IL_HOLIDAYS.has(d.toISOString().split("T")[0]);
}

function businessDaysSince(from: Date): number {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let count = 0;
  const cur = new Date(start);
  while (cur < today) {
    cur.setDate(cur.getDate() + 1);
    if (isILBusinessDay(cur)) count++;
  }
  return count;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { hearingId } = await req.json();

    if (!hearingId) {
      return NextResponse.json({ error: "Missing hearingId" }, { status: 400 });
    }

    const hearing = await getHearingRequest(hearingId);
    if (!hearing) {
      return NextResponse.json({ error: "Hearing not found" }, { status: 404 });
    }
    if (hearing.status !== "awaiting_response") {
      return NextResponse.json({ error: "Hearing already processed" }, { status: 409 });
    }

    // Enforce 5 business day minimum
    const elapsed = businessDaysSince(new Date(hearing.submittedAt));
    if (elapsed < 5) {
      return NextResponse.json(
        { error: `Too early — only ${elapsed} of 5 business days have passed` },
        { status: 422 }
      );
    }

    // Load original case data for context
    const caseFullData = await getCaseFullData(hearing.caseId);

    // Mark as processing
    await updateHearingRequest(hearingId, { status: "response_received" });

    // Run analysis synchronously (we need the result to send emails)
    const verdict = await analyzeNewHearing({
      hearingId,
      caseId:                  hearing.caseId,
      caseTitle:               hearing.caseTitle,
      category:                hearing.category,
      partyOneName:            hearing.partyOneName,
      partyOneEmail:           hearing.partyOneEmail,
      partyTwoName:            hearing.partyTwoName,
      partyTwoEmail:           hearing.partyTwoEmail,
      lang:                    hearing.lang,
      originalDescription:     caseFullData?.description      || "",
      originalDefenseResponse: caseFullData?.defendantResponse || "",
      originalFinding:         hearing.originalFinding,
      originalSummary:         hearing.originalSummary,
      requestedBy:             hearing.requestedBy,
      newEvidence:             hearing.newEvidence,
      newDocSummary:           hearing.newDocSummary,
      counterEvidence:         "",   // No response from other party
      counterDocSummary:       "",
    });

    await updateHearingRequest(hearingId, { status: "verdict_issued" });

    // ── Send verdict emails ──────────────────────────────────────
    const resend = new Resend(process.env.RESEND_API_KEY || "");

    const noteHe = hearing.lang === "he"
      ? `<p style="font-size:12px;color:#888;border-top:1px solid #e8d9a0;padding-top:12px;margin-top:20px;">
          * פסיקה זו ניתנה על בסיס הראיות החדשות שהוגשו בלבד, מכיוון שהצד שכנגד לא הגיש תגובה בתוך 5 ימי עסקים.
        </p>`
      : `<p style="font-size:12px;color:#888;border-top:1px solid #e8d9a0;padding-top:12px;margin-top:20px;">
          * This decision was issued based solely on the new evidence submitted, as the other party did not respond within 5 business days.
        </p>`;

    const emailHtml = (recipientName: string) => `
<div dir="${hearing.lang === "he" ? "rtl" : "ltr"}" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a2744;">
  <div style="background:#1a2744;padding:24px 32px;">
    <h1 style="color:#c9a84c;margin:0;font-size:22px;">ResolveAI</h1>
    <p style="color:#a0907a;margin:6px 0 0;font-size:13px;">פסיקה מחודשת — דיון נוסף ${hearingId}</p>
  </div>
  <div style="padding:32px;background:#fffdf7;">
    <p>שלום ${recipientName},</p>
    <p>הדיון הנוסף בתיק <strong>${hearing.caseTitle}</strong> (${hearing.caseId}) הסתיים.</p>

    <p style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">תקציר</p>
    <p style="font-size:14px;line-height:1.7;color:#333;margin-bottom:20px;">${verdict.summary}</p>

    <div style="background:#f5f0e8;border-right:4px solid #c9a84c;padding:20px;margin:20px 0;">
      <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;">פסיקה מחודשת</p>
      <p style="margin:0;font-size:17px;font-style:italic;color:#1a2744;line-height:1.6;">${verdict.finding}</p>
    </div>

    <p style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">נימוקים</p>
    <p style="font-size:14px;line-height:1.7;color:#333;white-space:pre-wrap;">${verdict.rationale}</p>

    ${noteHe}

    <hr style="border:none;border-top:1px solid #e8d9a0;margin:24px 0;">
    <p style="font-size:11px;color:#aaa;margin:0;">מספר דיון: ${hearingId} | תיק: ${hearing.caseId}</p>
  </div>
  <div style="background:#1a2744;padding:16px 32px;text-align:center;">
    <p style="color:#a0907a;margin:0;font-size:12px;">ResolveAI © 2026 | resolveai.co.il</p>
  </div>
</div>`;

    const subject = `פסיקה מחודשת — דיון נוסף ${hearingId} | ResolveAI`;

    if (hearing.partyOneEmail) {
      await resend.emails.send({
        from: "ResolveAI <no-reply@resolveai.co.il>",
        to: hearing.partyOneEmail,
        replyTo: "support@resolveai.co.il",
        subject,
        html: emailHtml(hearing.partyOneName),
      }).catch((e) => console.error("One-sided verdict email to party1 failed:", e));
    }

    if (hearing.partyTwoEmail) {
      await resend.emails.send({
        from: "ResolveAI <no-reply@resolveai.co.il>",
        to: hearing.partyTwoEmail,
        replyTo: "support@resolveai.co.il",
        subject,
        html: emailHtml(hearing.partyTwoName),
      }).catch((e) => console.error("One-sided verdict email to party2 failed:", e));
    }

    return NextResponse.json({ status: "verdict_issued", hearingId });
  } catch (err) {
    console.error("new-hearing/one-sided error:", err);
    return NextResponse.json({ error: "Failed to issue one-sided verdict" }, { status: 500 });
  }
}
