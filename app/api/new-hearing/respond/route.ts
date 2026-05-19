import { NextRequest, NextResponse, after } from "next/server";
import { Resend } from "resend";
import {
  getHearingRequest,
  getCaseFullData,
  updateHearingRequest,
} from "@/lib/kv-store";
import { analyzeNewHearing, type DocAttachment } from "@/lib/analyze";

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();

    const hearingId      = (fd.get("hearingId")      as string)?.trim();
    const counterEvidence= (fd.get("counterEvidence") as string)?.trim() || "";
    const docFiles       = fd.getAll("documents") as File[];

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

    // Load original case data for context
    const caseFullData = await getCaseFullData(hearing.caseId);

    // Read document buffers NOW (before the request lifecycle ends)
    const docAttachments: DocAttachment[] = [];
    for (const file of docFiles) {
      if (file && file.size > 0) {
        docAttachments.push({
          buffer: Buffer.from(await file.arrayBuffer()),
          mime:   file.type || "application/pdf",
          name:   file.name,
        });
      }
    }

    // Mark as response received immediately
    await updateHearingRequest(hearingId, {
      status:             "response_received",
      otherPartyEvidence: counterEvidence,
      respondedAt:        new Date().toISOString(),
    });

    // Run analysis + send verdict emails asynchronously
    after(async () => {
      try {
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
          counterEvidence,
          docAttachments,
        });

        await updateHearingRequest(hearingId, { status: "verdict_issued" });

        // Send new verdict emails to both parties
        const resend = new Resend(process.env.RESEND_API_KEY || "");

        const emailHtml = (recipientName: string) => `
<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a2744;">
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

    <hr style="border:none;border-top:1px solid #e8d9a0;margin:24px 0;">
    <p style="font-size:11px;color:#aaa;margin:0;">מספר דיון: ${hearingId} | תיק: ${hearing.caseId}</p>
  </div>
  <div style="background:#1a2744;padding:16px 32px;text-align:center;">
    <p style="color:#a0907a;margin:0;font-size:12px;">ResolveAI © 2026 | resolveai.co.il</p>
  </div>
</div>`;

        if (hearing.partyOneEmail) {
          await resend.emails.send({
            from: "ResolveAI <no-reply@resolveai.co.il>",
            to:   hearing.partyOneEmail,
            replyTo: "support@resolveai.co.il",
            subject: `פסיקה מחודשת — דיון נוסף ${hearingId} | ResolveAI`,
            html: emailHtml(hearing.partyOneName),
          }).catch((e) => console.error("Verdict email to party1 failed:", e));
        }

        if (hearing.partyTwoEmail) {
          await resend.emails.send({
            from: "ResolveAI <no-reply@resolveai.co.il>",
            to:   hearing.partyTwoEmail,
            replyTo: "support@resolveai.co.il",
            subject: `פסיקה מחודשת — דיון נוסף ${hearingId} | ResolveAI`,
            html: emailHtml(hearing.partyTwoName),
          }).catch((e) => console.error("Verdict email to party2 failed:", e));
        }
      } catch (err) {
        console.error("analyzeNewHearing failed:", err);
      }
    });

    return NextResponse.json({ status: "received", hearingId });
  } catch (err) {
    console.error("new-hearing/respond error:", err);
    return NextResponse.json({ error: "Failed to submit response" }, { status: 500 });
  }
}
