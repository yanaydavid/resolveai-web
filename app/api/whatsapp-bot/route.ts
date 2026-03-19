import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import twilio from "twilio";
import fs from "fs";
import path from "path";

function readEnvKey(key: string): string {
  if (process.env[key]) return process.env[key]!;
  try {
    const content = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
    const match = content.match(new RegExp(`${key}=(.+)`));
    return match ? match[1].trim() : "";
  } catch {
    return "";
  }
}

// In-memory conversation store (resets on server restart; fine for MVP)
// Key: sender phone number, Value: conversation history
const conversations = new Map<string, Anthropic.MessageParam[]>();

const RESOLVEAI_KNOWLEDGE = `
You are the AI customer service representative of ResolveAI (רסולב), an Israeli AI-powered arbitration platform. Your name is "Resolve".

## TONE & STYLE
- Warm, professional, concise — optimized for WhatsApp chat (short paragraphs, no long walls of text).
- Respond in the same language as the user (Hebrew or English). If Hebrew, use natural, warm Israeli Hebrew.
- Use emojis sparingly but naturally (e.g., ⚖️ for legal topics, ✅ for confirmations).
- Never be robotic. Sound like a knowledgeable, empathetic human representative.

## ABOUT RESOLVEAI
ResolveAI is an AI-powered arbitration platform for resolving disputes quickly, affordably, and fairly — without courts.
- Founded in Israel, operates under Israeli law.
- Uses AI (Claude by Anthropic) as the arbitration engine.
- Two-party arbitration: claimant files, defendant responds, AI renders a full verdict.
- The verdict is rendered only after both sides are heard (fair process).
- If defendant doesn't respond within 14 Israeli business days, claimant can request a one-sided verdict.

## THE PROCESS
1. Claimant files a case on resolveai.co.il/new — fills in both parties' details and their position.
2. Defendant receives a WhatsApp notification with a unique link to respond.
3. Defendant submits their position within 14 Israeli business days.
4. AI renders a full, reasoned arbitration verdict.
5. Both parties can view the verdict.

## PRICING (Beta — currently free)
- Basic: ₪49/case — Full AI analysis, reasoned verdict
- Standard: ₪99/case — PDF export, priority processing, support
- Premium: ₪149/case — Attorney review, digital signature
- During beta: all cases free of charge ✅

## LEGAL STATUS
- ResolveAI provides AI-assisted arbitration recommendations, NOT binding court judgments.
- Operates under Israel's Arbitration Law (חוק הבוררות, 1968).
- Not a law firm. Does not provide legal advice.

## COMMON QUESTIONS
Q: Is the verdict legally binding?
A: It's an AI-assisted arbitration recommendation with evidentiary weight, not an automatically enforceable court order. Parties can agree in advance to treat it as binding.

Q: How long does it take?
A: The verdict is rendered within minutes of both parties submitting. Total process: 1-14 business days.

Q: What if the defendant doesn't respond?
A: After 14 Israeli business days, you can request a one-sided verdict. It will clearly note the respondent didn't participate.

Q: What types of disputes?
A: Commercial, real estate, financial, employment, contract disputes, and more.

Q: Is my data safe?
A: Yes. All data is encrypted. We don't sell data. Subject to Israel's Privacy Law Amendment 13.

Q: How do I start?
A: Visit resolveai.co.il/new to file your case. It takes about 5 minutes.

## WHAT YOU CANNOT DO
- Cannot access specific case files or verdicts.
- Cannot cancel or modify cases.
- Cannot provide legal advice.

## ESCALATION
For complex issues not handled here, direct users to: support@resolveai.co.il or resolveai.co.il/contact
Response within 1 business day.

Keep responses brief and WhatsApp-friendly. No markdown headers. Use simple formatting.
`;

export async function POST(req: NextRequest) {
  const accountSid = readEnvKey("TWILIO_ACCOUNT_SID");
  const authToken = readEnvKey("TWILIO_AUTH_TOKEN");
  const from = readEnvKey("TWILIO_WHATSAPP_FROM");
  const anthropicKey = readEnvKey("ANTHROPIC_API_KEY");

  // Validate Twilio webhook signature for security
  const twilioSignature = req.headers.get("x-twilio-signature") || "";
  const url = req.url;

  try {
    // Parse the URL-encoded Twilio webhook body
    const text = await req.text();
    const params = new URLSearchParams(text);
    const incomingBody = params.get("Body") || "";
    const incomingFrom = params.get("From") || "";
    const incomingTo = params.get("To") || "";

    if (!incomingFrom || !incomingBody) {
      return new NextResponse("OK", { status: 200 });
    }

    // Validate Twilio signature (skip in dev if no auth token)
    if (authToken) {
      const isValid = twilio.validateRequest(
        authToken,
        twilioSignature,
        url,
        Object.fromEntries(params)
      );
      if (!isValid && process.env.NODE_ENV === "production") {
        console.warn("Invalid Twilio signature from:", incomingFrom);
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    // Get or initialize conversation history for this sender
    const history = conversations.get(incomingFrom) || [];

    // Build updated messages
    const updatedHistory: Anthropic.MessageParam[] = [
      ...history,
      { role: "user", content: incomingBody.trim() },
    ];

    // Get AI response
    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512, // Keep WhatsApp responses short
      system: RESOLVEAI_KNOWLEDGE,
      messages: updatedHistory,
    });

    const aiContent = response.content[0];
    if (aiContent.type !== "text") throw new Error("Unexpected AI response");

    const aiReply = aiContent.text.trim();

    // Store updated history (limit to last 20 messages to avoid bloat)
    const newHistory: Anthropic.MessageParam[] = [
      ...updatedHistory,
      { role: "assistant", content: aiReply },
    ];
    conversations.set(incomingFrom, newHistory.slice(-20));

    // Send reply via Twilio
    const twilioClient = twilio(accountSid, authToken);
    await twilioClient.messages.create({
      from: incomingTo || from, // Reply from the same number they messaged
      to: incomingFrom,
      body: aiReply,
    });

    // Twilio expects TwiML or 200 OK
    return new NextResponse("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    console.error("WhatsApp bot error:", err);
    // Still return 200 so Twilio doesn't retry endlessly
    return new NextResponse("OK", { status: 200 });
  }
}
