import { NextRequest, NextResponse } from "next/server";
import { getHearingRequest } from "@/lib/kv-store";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing hearing ID" }, { status: 400 });
  }

  const hearing = await getHearingRequest(id);
  if (!hearing) {
    return NextResponse.json({ error: "Hearing not found" }, { status: 404 });
  }

  // Return only the fields the respond page needs (no internal emails for security)
  return NextResponse.json({
    hearingId:             hearing.hearingId,
    caseId:                hearing.caseId,
    caseTitle:             hearing.caseTitle,
    requestedBy:           hearing.requestedBy,
    requesterName:         hearing.requesterName,
    otherPartyName:        hearing.otherPartyName,
    partyOneName:          hearing.partyOneName,
    partyTwoName:          hearing.partyTwoName,
    newEvidence:           hearing.newEvidence,
    newDocSummary:         hearing.newDocSummary,
    originalFinding:       hearing.originalFinding,
    originalSummary:       hearing.originalSummary,
    status:                hearing.status,
    submittedAt:           hearing.submittedAt,
    lang:                  hearing.lang,
  });
}
