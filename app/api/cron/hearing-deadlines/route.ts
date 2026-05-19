/**
 * Cron job: automatically issue one-sided verdicts for new-hearing requests
 * where the other party has not responded within 5 Israeli business days.
 *
 * Runs daily at 08:00 UTC (10:00–11:00 Israel time).
 * Secured by Vercel's built-in CRON_SECRET header check.
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  getActiveHearingIds,
  getHearingRequest,
  getCaseFullData,
  updateHearingRequest,
  removeActiveHearing,
} from "@/lib/kv-store";
import { analyzeNewHearing } from "@/lib/analyze";

// ── Israeli business day helpers (mirrors status page + one-sided API) ────────

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

// ── Verdict email HTML ────────────────────────────────────────────────────────

function buildVerdictEmail(params: {
  recipientName: string;
  caseTitle: string;
  caseId: string;
  hearingId: string;
  summary: string;
  finding: string;
  rationale: string;
  lang: string;
}): string {
  const { recipientName, caseTitle, caseId, hearingId, summary, finding, rationale, lang } = params;
  const isHe = lang === "he";
  const note = isHe
    ? `<p style="font-size:12px;color:#888;border-top:1px solid #e8d9a0;padding-top:12px;margin-top:20px;">
        * פסיקה זו ניתנה על בסיס הראיות החדשות שהוגשו בלבד, מכיוון שהצד שכנגד לא הגיב בתוך 5 ימי עסקים.
       </p>`
    : `<p style="font-size:12px;color:#888;border-top:1px solid #e8d9a0;padding-top:12px;margin-top:20px;">
        * This decision was issued based solely on the new evidence submitted, as the other party did not respond within 5 business days.
       </p>`;

  return `
<div dir="${isHe ? "rtl" : "ltr"}" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a2744;">
  <div style="background:#1a2744;padding:24px 32px;">
    <h1 style="color:#c9a84c;margin:0;font-size:22px;">ResolveAI</h1>
    <p style="color:#a0907a;margin:6px 0 0;font-size:13px;">${isHe ? "פסיקה מחודשת" : "Revised Decision"} — ${hearingId}</p>
  </div>
  <div style="padding:32px;background:#fffdf7;">
    <p>${isHe ? "שלום" : "Hello"} ${recipientName},</p>
    <p>${isHe
      ? `הדיון הנוסף בתיק <strong>${caseTitle}</strong> (${caseId}) הסתיים.`
      : `The new hearing for case <strong>${caseTitle}</strong> (${caseId}) has concluded.`}</p>

    <p style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">
      ${isHe ? "תקציר" : "Summary"}
    </p>
    <p style="font-size:14px;line-height:1.7;color:#333;margin-bottom:20px;">${summary}</p>

    <div style="background:#f5f0e8;border-right:4px solid #c9a84c;padding:20px;margin:20px 0;">
      <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;">
        ${isHe ? "פסיקה מחודשת" : "Revised Finding"}
      </p>
      <p style="margin:0;font-size:17px;font-style:italic;color:#1a2744;line-height:1.6;">${finding}</p>
    </div>

    <p style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">
      ${isHe ? "נימוקים" : "Rationale"}
    </p>
    <p style="font-size:14px;line-height:1.7;color:#333;white-space:pre-wrap;">${rationale}</p>

    ${note}

    <hr style="border:none;border-top:1px solid #e8d9a0;margin:24px 0;">
    <p style="font-size:11px;color:#aaa;margin:0;">${isHe ? "מספר דיון" : "Hearing ID"}: ${hearingId} | ${isHe ? "תיק" : "Case"}: ${caseId}</p>
  </div>
  <div style="background:#1a2744;padding:16px 32px;text-align:center;">
    <p style="color:#a0907a;margin:0;font-size:12px;">ResolveAI © 2026 | resolveai.co.il</p>
  </div>
</div>`;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // Vercel automatically sets Authorization: Bearer <CRON_SECRET> for cron invocations.
  // In development there is no CRON_SECRET, so we skip the check.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results: { hearingId: string; action: string; error?: string }[] = [];

  try {
    const activeIds = await getActiveHearingIds();
    console.log(`[hearing-deadlines cron] Checking ${activeIds.length} active hearing(s)`);

    for (const hearingId of activeIds) {
      try {
        const hearing = await getHearingRequest(hearingId);

        // Stale entry — remove from active set
        if (!hearing) {
          await removeActiveHearing(hearingId);
          results.push({ hearingId, action: "removed_stale" });
          continue;
        }

        // Already resolved — remove from active set
        if (hearing.status !== "awaiting_response") {
          await removeActiveHearing(hearingId);
          results.push({ hearingId, action: "removed_resolved", });
          continue;
        }

        // Check business days elapsed
        const elapsed = businessDaysSince(new Date(hearing.submittedAt));
        if (elapsed < 5) {
          results.push({ hearingId, action: `skipped_${elapsed}d` });
          continue;
        }

        // ── 5+ days, no response → issue one-sided verdict ────────────────
        console.log(`[hearing-deadlines cron] Issuing one-sided verdict for ${hearingId} (${elapsed} biz days)`);

        const caseFullData = await getCaseFullData(hearing.caseId);

        await updateHearingRequest(hearingId, { status: "response_received" });

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
          counterEvidence:         "",
          counterDocSummary:       "",
        });

        await updateHearingRequest(hearingId, { status: "verdict_issued" });
        await removeActiveHearing(hearingId);

        // Send verdict emails
        const resend = new Resend(process.env.RESEND_API_KEY || "");
        const emailParams = {
          caseTitle: hearing.caseTitle,
          caseId: hearing.caseId,
          hearingId,
          summary: verdict.summary,
          finding: verdict.finding,
          rationale: verdict.rationale,
          lang: hearing.lang,
        };
        const subject = hearing.lang === "he"
          ? `פסיקה מחודשת — דיון נוסף ${hearingId} | ResolveAI`
          : `Revised Decision — New Hearing ${hearingId} | ResolveAI`;

        if (hearing.partyOneEmail) {
          await resend.emails.send({
            from: "ResolveAI <no-reply@resolveai.co.il>",
            to: hearing.partyOneEmail,
            replyTo: "support@resolveai.co.il",
            subject,
            html: buildVerdictEmail({ ...emailParams, recipientName: hearing.partyOneName }),
          }).catch((e) => console.error(`Cron verdict email party1 ${hearingId}:`, e));
        }

        if (hearing.partyTwoEmail) {
          await resend.emails.send({
            from: "ResolveAI <no-reply@resolveai.co.il>",
            to: hearing.partyTwoEmail,
            replyTo: "support@resolveai.co.il",
            subject,
            html: buildVerdictEmail({ ...emailParams, recipientName: hearing.partyTwoName }),
          }).catch((e) => console.error(`Cron verdict email party2 ${hearingId}:`, e));
        }

        results.push({ hearingId, action: "verdict_issued" });
      } catch (err) {
        console.error(`[hearing-deadlines cron] Error processing ${hearingId}:`, err);
        results.push({ hearingId, action: "error", error: String(err) });
      }
    }
  } catch (err) {
    console.error("[hearing-deadlines cron] Fatal error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  console.log(`[hearing-deadlines cron] Done. Results:`, results);
  return NextResponse.json({ processed: results.length, results });
}
