import { NextRequest, NextResponse } from "next/server";
import { analyzeCase } from "@/lib/analyze";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any;
    let docBuffer: Buffer | undefined;
    let docMime: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      body = Object.fromEntries(fd.entries());
      const docFile = fd.get("document") as File | null;
      if (docFile && docFile.size > 0) {
        docBuffer = Buffer.from(await docFile.arrayBuffer());
        docMime = docFile.type || "application/pdf";
      }
    } else {
      body = await req.json();
    }

    const {
      caseTitle,
      partyOneName,
      partyOneEmail,
      partyTwoName,
      partyTwoEmail,
      category,
      description,
      defendantResponse,
      lang = "he",
    } = body;

    if (!caseTitle || !partyOneName || !partyTwoName || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const caseId = body.caseId || `RA-${Date.now().toString().slice(-8)}`;

    const verdict = await analyzeCase({
      caseId,
      caseTitle,
      category,
      partyOneName,
      partyOneEmail: partyOneEmail || "",
      partyTwoName,
      partyTwoEmail: partyTwoEmail || "",
      description,
      defendantResponse,
      lang,
      docBuffer,
      docMime,
    });

    return NextResponse.json(verdict);
  } catch (err) {
    console.error("Analyze API error:", err);
    return NextResponse.json(
      { error: "Failed to process arbitration request" },
      { status: 500 }
    );
  }
}
