import { NextRequest, NextResponse } from "next/server";
import { getCaseById, updateCaseStatus } from "@/lib/kv-store";
import { analyzeCase } from "@/lib/analyze";

/** Count Israeli business days (Sun–Thu) since a date */
function israeliBusinessDaysSince(submittedAt: string): number {
  const start = new Date(submittedAt);
  const now = new Date();
  let count = 0;
  const cursor = new Date(start);
  cursor.setDate(cursor.getDate() + 1); // start counting from the day after submission

  while (cursor <= now) {
    const day = cursor.getDay(); // 0=Sun … 6=Sat
    if (day !== 5 && day !== 6) count++; // skip Friday & Saturday
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export async function POST(req: NextRequest) {
  try {
    const { caseId, email } = await req.json();

    if (!caseId || !email) {
      return NextResponse.json({ error: "Missing caseId or email" }, { status: 400 });
    }

    const caseData = await getCaseById(caseId);
    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Only the claimant can request a one-sided verdict
    if (caseData.partyOneEmail !== email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Must be in pending status
    if (caseData.status !== "pending") {
      return NextResponse.json({ error: "Verdict already issued or defendant already responded" }, { status: 409 });
    }

    // Must be at least 14 Israeli business days since submission
    const daysPassed = israeliBusinessDaysSince(caseData.submittedAt);
    if (daysPassed < 14) {
      return NextResponse.json({
        error: `ניתן לבקש פסיקה חד-צדדית רק לאחר 14 ימי עסקים. חלפו ${daysPassed} ימים עד כה.`,
        daysPassed,
        daysRemaining: 14 - daysPassed,
      }, { status: 403 });
    }

    // Generate verdict — defendant did not respond
    const verdict = await analyzeCase({
      caseId: caseData.caseId,
      caseTitle: caseData.caseTitle,
      category: caseData.category,
      partyOneName: caseData.partyOneName,
      partyOneEmail: caseData.partyOneEmail,
      partyTwoName: caseData.partyTwoName,
      partyTwoEmail: caseData.partyTwoEmail,
      description: caseData.description || "",
      defendantResponse: undefined, // one-sided — no defendant response
      lang: "he",
      // Signal to analyzeCase that this is a default judgment
      // heardBothSides will be false automatically since no defendantResponse
    });

    // Update case status
    await updateCaseStatus(caseId, "verdict_issued");

    return NextResponse.json({ success: true, verdict });
  } catch (err) {
    console.error("One-sided verdict error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
