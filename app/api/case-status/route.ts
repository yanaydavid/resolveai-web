import { NextRequest, NextResponse } from "next/server";
import { getCaseById } from "@/lib/kv-store";

export async function GET(req: NextRequest) {
  const caseId = req.nextUrl.searchParams.get("id");
  const email = req.nextUrl.searchParams.get("email");

  if (!caseId || !email) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const caseData = await getCaseById(caseId);

  if (!caseData) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  if (caseData.partyOneEmail !== email && caseData.partyTwoEmail !== email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    caseId: caseData.caseId,
    caseTitle: caseData.caseTitle,
    partyOneName: caseData.partyOneName,
    partyTwoName: caseData.partyTwoName,
    category: caseData.category,
    submittedAt: caseData.submittedAt,
    status: caseData.status,
    documentSummary: caseData.documentSummary,
  });
}
