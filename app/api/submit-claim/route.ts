import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { sendClaimConfirmation, sendClaimNotificationToDefendant } from "@/lib/email";
import { storeCase } from "@/lib/kv-store";
import { verifyPaymentToken, markTokenUsed, isPaymentEnabled } from "@/lib/payment";

function readEnvKey(key: string): string {
  if (process.env[key]) return process.env[key]!;
  try {
    const fs = require("fs");
    const path = require("path");
    const content = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
    const match = content.match(new RegExp(`${key}=(.+)`));
    return match ? match[1].trim() : "";
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const caseTitle     = formData.get("caseTitle")     as string;
    const partyOneName  = formData.get("partyOneName")  as string;
    const partyOneEmail = formData.get("partyOneEmail") as string;
    const partyOnePhone = formData.get("partyOnePhone") as string | null;
    const partyTwoName  = formData.get("partyTwoName")  as string;
    const partyTwoEmail = formData.get("partyTwoEmail") as string;
    const partyTwoPhone = formData.get("partyTwoPhone") as string | null;
    const category      = formData.get("category")      as string;
    const description   = formData.get("description")   as string;
    const lang          = (formData.get("lang") as string) || "he";
    const file          = formData.get("document")      as File | null;
    const paymentToken  = formData.get("paymentToken")  as string | null;

    if (!caseTitle || !partyOneName || !partyTwoName || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── Payment gate ──────────────────────────────────────────
    if (isPaymentEnabled()) {
      if (!paymentToken) {
        return NextResponse.json({ error: "Payment required" }, { status: 402 });
      }
      const tokenRecord = await verifyPaymentToken(paymentToken);
      if (!tokenRecord) {
        return NextResponse.json({ error: "Invalid or expired payment token" }, { status: 402 });
      }
    }

    if (!file) {
      return NextResponse.json({ error: "Document is required" }, { status: 400 });
    }

    const caseId = `RA-${Date.now().toString().slice(-8)}`;

    const CATEGORY_HE: Record<string, string> = {
      business:   "מסחרי ועסקי",
      property:   'נדל"ן ורכוש',
      financial:  "פיננסי וכספי",
      employment: "עבודה ותעסוקה",
      contract:   "הפרת חוזה",
      other:      "אחר",
    };
    const categoryLabel = lang === "he"
      ? (CATEGORY_HE[category] || category)
      : category;

    // ── Analyze document with Claude ──────────────────────────
    let documentSummary = "";
    let nameFoundInDoc = false;

    try {
      const anthropic = new Anthropic({ apiKey: readEnvKey("ANTHROPIC_API_KEY") });
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mimeType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp" | "application/pdf";

      type ContentBlock =
        | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
        | { type: "document"; source: { type: "base64"; media_type: string; data: string } }
        | { type: "text"; text: string };

      const contentBlocks: ContentBlock[] = [];

      if (mimeType.startsWith("image/")) {
        contentBlocks.push({
          type: "image",
          source: { type: "base64", media_type: mimeType, data: base64 },
        });
      } else if (mimeType === "application/pdf") {
        contentBlocks.push({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: base64 },
        });
      }

      contentBlocks.push({
        type: "text",
        text: `זהו מסמך שהוגש כראיה בתביעת בוררות.
שם הנתבע: ${partyTwoName}
נושא התביעה: ${caseTitle}
תיאור: ${description}

אנא ענה בעברית על שלוש שאלות:
1. האם המסמך רלוונטי לתביעה המתוארת? (כן/לא) — תמונה אישית, מסמך דתי, או כל מסמך שאין לו קשר לנושא התביעה הוא לא רלוונטי.
2. האם שם הנתבע "${partyTwoName}" מופיע במסמך? (כן/לא)
3. מה הנקודות העיקריות במסמך הרלוונטיות לתביעה? (עד 3 משפטים)

פורמט תשובה:
רלוונטי: [כן/לא]
נמצא שם: [כן/לא]
סיכום: [הסיכום]`,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 512,
        messages: [{ role: "user", content: contentBlocks as any }],
      });

      const text = (response.content[0] as { type: string; text: string }).text;

      nameFoundInDoc = text.includes("נמצא שם: כן");
      const summaryMatch = text.match(/סיכום:\s*([\s\S]+)/);
      documentSummary = summaryMatch ? summaryMatch[1].trim() : text;
    } catch (err) {
      console.error("Document analysis error:", err);
      documentSummary = "לא ניתן לנתח את המסמך";
    }

    // ── Encode case data into token ───────────────────────────
    const caseData = {
      caseId,
      caseTitle,
      partyOneName,
      partyOneEmail,
      partyTwoName,
      partyTwoEmail,
      partyTwoPhone: partyTwoPhone || "",
      category,
      description,
      lang,
      documentSummary,
      nameFoundInDoc,
      submittedAt: new Date().toISOString(),
    };

    const token = Buffer.from(JSON.stringify(caseData)).toString("base64url");

    const origin =
      req.headers.get("origin") ||
      req.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
      "https://resolveai.co.il";

    const respondUrl = `${origin}/respond?c=${token}`;

    // Shorten the URL
    let shortUrl = respondUrl;
    try {
      const tinyRes = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(respondUrl)}`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (tinyRes.ok) {
        const tiny = await tinyRes.text();
        if (tiny.startsWith("https://")) shortUrl = tiny.trim();
      }
    } catch {
      // Not critical
    }

    // WhatsApp is now sent by the claimant directly via wa.me link on the success page

    // ── Consume payment token (idempotent — no-op in beta) ────
    if (paymentToken) {
      try { await markTokenUsed(paymentToken); } catch { /* non-fatal */ }
    }

    // ── Store in KV ───────────────────────────────────────────
    await storeCase({
      caseId,
      caseTitle,
      partyOneName,
      partyOneEmail,
      partyOnePhone: partyOnePhone || undefined,
      partyTwoName,
      partyTwoEmail,
      partyTwoPhone: partyTwoPhone || undefined,
      category,
      description,
      submittedAt: new Date().toISOString(),
      status: "pending",
      nameFoundInDoc,
      documentSummary,
    });

    // ── Send confirmation email to claimant ───────────────────
    const trackingUrl = `${origin}/status?id=${caseId}&email=${encodeURIComponent(partyOneEmail)}`;

    try {
      await sendClaimConfirmation({
        to: partyOneEmail,
        claimantName: partyOneName,
        defendantName: partyTwoName,
        caseId,
        caseTitle,
        category: categoryLabel,
        description,
        submittedAt: new Date().toISOString(),
        lang,
        trackingUrl,
      });
    } catch (e) { console.error("Claimant confirmation email failed:", e); }

    // ── Send notification email to defendant ──────────────────
    if (partyTwoEmail) {
      try {
        await sendClaimNotificationToDefendant({
          to: partyTwoEmail,
          defendantName: partyTwoName,
          claimantName: partyOneName,
          caseId,
          caseTitle,
          category: categoryLabel,
          description,
          respondUrl: shortUrl || respondUrl,
          lang,
        });
      } catch (e) { console.error("Defendant notification email failed:", e); }
    }

    return NextResponse.json({
      caseId,
      respondUrl,
      shortUrl,
      token,
      documentSummary,
      nameFoundInDoc,
    });
  } catch (err) {
    console.error("submit-claim error:", err);
    return NextResponse.json({ error: "Failed to submit claim" }, { status: 500 });
  }
}
