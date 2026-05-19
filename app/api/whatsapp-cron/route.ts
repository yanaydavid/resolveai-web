import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import twilio from "twilio";
import fs from "fs";
import path from "path";
import {
  getWAConversation,
  setWAConversation,
  getPendingSwitches,
  removePendingSwitch,
} from "@/lib/kv-store";

function readEnvKey(key: string): string {
  if (process.env[key]) return process.env[key]!;
  try {
    const content = fs.readFileSync(
      path.join(process.cwd(), ".env.local"),
      "utf8"
    );
    const match = content.match(new RegExp(`${key}=(.+)`));
    return match ? match[1].trim() : "";
  } catch {
    return "";
  }
}

// Generates a natural handover intro from the new agent
async function generateHandoverIntro(
  anthropicKey: string,
  newAgentName: string,
  previousAgentName: string,
  recentHistory: Anthropic.MessageParam[]
): Promise<string> {
  const anthropic = new Anthropic({ apiKey: anthropicKey });

  const historyText = recentHistory
    .slice(-6)
    .map((m) => `${m.role === "user" ? "לקוח" : previousAgentName}: ${typeof m.content === "string" ? m.content : ""}`)
    .join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 200,
    system: `אתה ${newAgentName}, נציג שירות לקוחות של ResolveAI. קיבלת שיחה שהועברה אליך מ-${previousAgentName}.
כתוב הודעת פתיחה קצרה וטבעית של 1-2 משפטים.
הצג את עצמך בשמך, ציין שעברה אליך השיחה מ-${previousAgentName}, ושאל במה תוכל לעזור — כאילו ראית את ההיסטוריה.
אל תמציא מידע. אל תתייחס לתוכן הספציפי של השיחה אם לא בטוח. WhatsApp-friendly, ישראלי וחם.`,
    messages: [
      {
        role: "user",
        content: `היסטוריית השיחה האחרונה:\n${historyText}`,
      },
    ],
  });

  const content = response.content[0];
  return content.type === "text" ? content.text.trim() : `שלום, אני ${newAgentName}. ${previousAgentName} העבירה אלי את השיחה — במה אוכל לעזור?`;
}

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const cronSecret = readEnvKey("CRON_SECRET");
  const authHeader = req.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const accountSid = readEnvKey("TWILIO_ACCOUNT_SID");
  const authToken = readEnvKey("TWILIO_AUTH_TOKEN");
  const anthropicKey = readEnvKey("ANTHROPIC_API_KEY");

  const pendingPhones = await getPendingSwitches();
  if (pendingPhones.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const twilioClient = twilio(accountSid, authToken);
  let processed = 0;

  for (const phone of pendingPhones) {
    try {
      const conv = await getWAConversation(phone);
      if (!conv?.pendingSwitch) {
        // No longer pending — clean up
        await removePendingSwitch(phone);
        continue;
      }

      const { newName, newGender, sendAfter } = conv.pendingSwitch;

      // Not time yet — skip
      if (Date.now() < sendAfter) continue;

      // Generate handover intro
      const introMessage = await generateHandoverIntro(
        anthropicKey,
        newName,
        conv.agentName,
        conv.history
      );

      // Send intro message to customer
      await twilioClient.messages.create({
        from: conv.twilioTo,
        to: phone,
        body: introMessage,
      });

      // Update conversation: switch to new agent, add intro to history, clear pending
      const updatedConv = {
        ...conv,
        agentName: newName,
        agentGender: newGender,
        pendingSwitch: undefined,
        lastMessageAt: Date.now(),
        history: [
          ...conv.history,
          { role: "assistant" as const, content: introMessage },
        ].slice(-30),
      };

      await setWAConversation(phone, updatedConv);
      await removePendingSwitch(phone);
      processed++;
    } catch (err) {
      console.error(`Cron: error processing ${phone}:`, err);
    }
  }

  return NextResponse.json({ processed, total: pendingPhones.length });
}
