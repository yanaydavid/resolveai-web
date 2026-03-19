import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

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
    const body = await req.json();
    const {
      caseTitle,
      partyOneName,
      partyOneEmail,
      partyTwoName,
      partyTwoEmail,
      partyTwoPhone,
      category,
      description,
      lang = "he",
    } = body;

    if (!caseTitle || !partyOneName || !partyTwoName || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const caseId = `RA-${Date.now().toString().slice(-8)}`;

    // Encode all case data into a base64url token — no DB needed
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
      submittedAt: new Date().toISOString(),
    };

    const token = Buffer.from(JSON.stringify(caseData)).toString("base64url");

    // Determine the site origin for the respond link
    const origin =
      req.headers.get("origin") ||
      req.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
      "https://resolveai.co.il";

    const respondUrl = `${origin}/respond?c=${token}`;

    // Send WhatsApp to defendant if phone provided
    const accountSid = readEnvKey("TWILIO_ACCOUNT_SID");
    const authToken = readEnvKey("TWILIO_AUTH_TOKEN");
    const from = readEnvKey("TWILIO_WHATSAPP_FROM");

    if (partyTwoPhone && accountSid && authToken) {
      try {
        const client = twilio(accountSid, authToken);

        let phone = partyTwoPhone.replace(/\D/g, "");
        if (phone.startsWith("0")) phone = "972" + phone.slice(1);
        if (!phone.startsWith("+")) phone = "+" + phone;

        const message =
          lang === "he"
            ? `🏛️ *ResolveAI — הודעה רשמית*\n\nשלום ${partyTwoName},\n\n${partyOneName} הגיש/ה נגדך בקשה לבוררות ב-ResolveAI.\n\n*פרטי התיק:*\n• מספר תיק: ${caseId}\n• כותרת: ${caseTitle}\n• קטגוריה: ${category}\n\n⚖️ *יש לך זכות להגיש את עמדתך לפני מתן הפסיקה.*\n\nלחץ/י על הקישור הבא להגשת תגובתך:\n${respondUrl}\n\n_ResolveAI — בוררות חכמה מבוססת בינה מלאכותית_`
            : `🏛️ *ResolveAI — Official Notice*\n\nDear ${partyTwoName},\n\n${partyOneName} has filed an arbitration request against you on ResolveAI.\n\n*Case Details:*\n• Case ID: ${caseId}\n• Title: ${caseTitle}\n• Category: ${category}\n\n⚖️ *You have the right to submit your position before a decision is rendered.*\n\nClick the link below to submit your response:\n${respondUrl}\n\n_ResolveAI — Smart AI-Powered Arbitration_`;

        await client.messages.create({
          from,
          to: `whatsapp:${phone}`,
          body: message,
        });
      } catch (err) {
        console.error("WhatsApp send error:", err);
        // Non-fatal — continue
      }
    }

    return NextResponse.json({ caseId, respondUrl, token });
  } catch (err) {
    console.error("submit-claim error:", err);
    return NextResponse.json({ error: "Failed to submit claim" }, { status: 500 });
  }
}
