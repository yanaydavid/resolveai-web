import { NextRequest, NextResponse, after } from "next/server";
import { analyzeCase } from "@/lib/analyze";
import { sendDefenseReceived } from "@/lib/email";
import { updateCaseStatus } from "@/lib/kv-store";

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();

    const caseId        = (fd.get("caseId")           as string) || `RA-${Date.now().toString().slice(-8)}`;
    const caseTitle     = fd.get("caseTitle")          as string;
    const partyOneName  = fd.get("partyOneName")       as string;
    const partyOneEmail = fd.get("partyOneEmail")      as string || "";
    const partyTwoName  = fd.get("partyTwoName")       as string;
    const partyTwoEmail = fd.get("partyTwoEmail")      as string || "";
    const category      = fd.get("category")           as string;
    const description   = fd.get("description")        as string;
    const defendantResponse = fd.get("defendantResponse") as string;
    const lang          = (fd.get("lang")              as string) || "he";
    const docFile       = fd.get("document")           as File | null;

    if (!caseTitle || !partyOneName || !partyTwoName || !description || !defendantResponse) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Read file into Buffer NOW (before the request lifecycle ends)
    let docBuffer: Buffer | undefined;
    let docMime: string | undefined;
    if (docFile && docFile.size > 0) {
      docBuffer = Buffer.from(await docFile.arrayBuffer());
      docMime = docFile.type || "application/pdf";
    }

    // Update KV: mark case as "responded"
    await updateCaseStatus(caseId, "responded");

    // Send confirmation email to defendant
    if (partyTwoEmail) {
      try {
        await sendDefenseReceived({
          to: partyTwoEmail,
          defendantName: partyTwoName,
          claimantName: partyOneName,
          caseId,
          caseTitle,
          lang,
        });
      } catch (e) { console.error("Defense received email failed:", e); }
    }

    // ── Run analysis in background (after response is sent) ────
    after(async () => {
      try {
        await analyzeCase({
          caseId,
          caseTitle,
          category,
          partyOneName,
          partyOneEmail,
          partyTwoName,
          partyTwoEmail,
          description,
          defendantResponse,
          lang,
          docBuffer,
          docMime,
        });
      } catch (err) {
        console.error("Background analysis failed:", err);
      }
    });

    return NextResponse.json({ status: "received", caseId });
  } catch (err) {
    console.error("submit-defense error:", err);
    return NextResponse.json({ error: "Failed to submit defense" }, { status: 500 });
  }
}
