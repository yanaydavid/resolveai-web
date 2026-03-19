import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  try {
    const {
      partyTwoName,
      partyTwoPhone,
      partyOneName,
      caseTitle,
      caseId,
    } = await req.json();

    if (!partyTwoPhone) {
      return NextResponse.json({ sent: false, reason: "no_phone" });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const from = process.env.TWILIO_WHATSAPP_FROM!;

    const client = twilio(accountSid, authToken);

    // Normalize Israeli phone number to E.164 format
    let phone = partyTwoPhone.replace(/\D/g, "");
    if (phone.startsWith("0")) {
      phone = "972" + phone.slice(1);
    }
    if (!phone.startsWith("+")) {
      phone = "+" + phone;
    }

    const message = `🏛️ *ResolveAI — הודעה רשמית*

שלום ${partyTwoName},

נפתחה תביעה נגדך במערכת הבוררות של ResolveAI.

*פרטי התיק:*
• מספר תיק: ${caseId}
• כותרת: ${caseTitle}
• מגיש התביעה: ${partyOneName}

לפרטים נוספים, אנא צור קשר עם המגיש.

_ResolveAI — בוררות חכמה מבוססת בינה מלאכותית_`;

    await client.messages.create({
      from,
      to: `whatsapp:${phone}`,
      body: message,
    });

    return NextResponse.json({ sent: true });
  } catch (error: unknown) {
    console.error("WhatsApp notification error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ sent: false, error: message }, { status: 500 });
  }
}
