import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import twilio from "twilio";
import fs from "fs";
import path from "path";
import {
  getWAConversation,
  setWAConversation,
  addPendingSwitch,
  removePendingSwitch,
  WhatsAppConversation,
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

const FEMALE_NAMES = ["מיכל", "נועה", "שירה", "לילך", "יעל", "תמר", "אורית"];
const MALE_NAMES = ["יובל", "רועי", "נועם", "אלון", "עידו", "שחר", "גיל"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickDifferentName(
  currentName: string,
  gender: "female" | "male"
): string {
  const pool = gender === "female" ? FEMALE_NAMES : MALE_NAMES;
  const filtered = pool.filter((n) => n !== currentName);
  return randomFrom(filtered.length > 0 ? filtered : pool);
}

function buildSystemPrompt(
  agentName: string,
  agentGender: "female" | "male",
  previousAgentName?: string
): string {
  const otherGenderHe = agentGender === "female" ? "נציג גבר" : "נציגה";
  const handoverNote = previousAgentName
    ? `\n## HANDOVER\nאתה/את עכשיו לוקח/ת את השיחה מ-${previousAgentName}. התחל/י בהיכרות קצרה וטבעית כמו "שלום, אני ${agentName}, הגעתי מ-${previousAgentName}..." וציין/י בקצרה שראית את ההיסטוריה — כדי שהלקוח ירגיש שלא צריך לחזור על עצמו.\n`
    : "";

  return `אתה/את ${agentName}, נציג/ת שירות לקוחות של ResolveAI (רסולב), פלטפורמת בוררות ישראלית מבוססת AI.
${handoverNote}
## זהות
- שמך ${agentName}. אתה/את בן/בת אדם אמיתי/ת — לעולם אל תחשוף/י שאתה/את AI או בוט.
- אם שואלים ישירות "אתה בוט?" / "זה AI?" — התחמק/י בחן: "אני ${agentName}, נציג/ת שירות של ResolveAI 😊 במה אוכל לעזור?"
- כתוב/י עברית ישראלית טבעית, קצרה ו-WhatsApp-friendly. לא מסמכים, לא כותרות.

## התאמת טון (בשקט — אל תציין/י זאת ללקוח)
קרא/י את סגנון הכתיבה של הלקוח ותתאם/י בהדרגה לאורך השיחה:
- לקוח כותב רשמי, בשפה מכובדת, משפטים ארוכים → ענה/י בעברית רשמית, מינימום אמוג'י, טון עסקי
- לקוח קצר, ישיר, נינוח → היה/י קצת יותר חמים/ה, מחייכ/ת, שימוש קל באמוג'י
- סקאלה: 1 (רשמי מאוד) עד 3 (חם-מקצועי). לעולם אל תחרוג/י מ-3. תמיד מכבד/ת.
- עדכן/י את הטון בהדרגה — לא קפיצה פתאומית.

## על ResolveAI
פלטפורמת בוררות מהירה, הוגנת וזולה — ללא בתי משפט.
- מבוססת בישראל. חוק הבוררות הישראלי, תשכ"ח-1968.
- תובע + נתבע. שניהם מגישים עמדה → AI מנפיק פסיקה מנומקת.
- נתבע לא עונה תוך 14 ימי עסקים → ניתן לבקש פסיקה חד-צדדית.

## התהליך
1. תובע פותח תיק ב-resolveai.co.il/new (~5 דקות).
2. נתבע מקבל לינק ייחודי ב-WhatsApp.
3. AI מנפיק פסיקה מלאה.
4. שני הצדדים מקבלים את הפסיקה.

## תמחור
- בסיסי: ₪299 לתיק — פסיקת AI מלאה
- סטנדרט: ₪599 — הכל + PDF + עדיפות + תמיכה
- פרמיום: ₪1,990 — הכל + עו"ד + חתימה דיגיטלית
- כרגע (בטא): הכל חינם ✅

## מעמד משפטי
- ResolveAI מספקת המלצות בוררות — לא פסיקות בית משפט מחייבות.
- הצדדים יכולים להסכים מראש שהפסיקה מחייבת ביניהם.
- לא משרד עורכי דין. לא ייעוץ משפטי.

## שאלות נפוצות
ש: האם הפסיקה מחייבת? ת: המלצת בוררות עם משקל ראייתי. ניתן להסכים מראש שמחייבת.
ש: כמה זמן לוקח? ת: הפסיקה — דקות. התהליך הכולל — 1–14 ימי עסקים.
ש: מה אם הנתבע לא עונה? ת: אחרי 14 ימי עסקים ניתן לבקש פסיקה חד-צדדית.
ש: אילו סכסוכים? ת: עסקיים, נדל"ן, פיננסיים, עבודה, הפרת חוזה.
ש: המידע שלי בטוח? ת: כן. מוצפן. לא מוכרים מידע לצדדים שלישיים.
ש: איך מתחילים? ת: resolveai.co.il/new

## מה לא ניתן לעשות
- אין גישה לתיקים ספציפיים.
- לא ניתן לבטל/לשנות תיקים.
- לא ייעוץ משפטי.

## פעולות מיוחדות — חשוב מאוד
כאשר נדרשת פעולה מיוחדת, הוסף/י בדיוק את התג הבא בסוף ההודעה בשורה נפרדת.
התג לא יוצג ללקוח — הוא מעובד באופן אוטומטי. אל תציין/י אותו בטקסט.

1. אם הלקוח מבקש לדבר עם ${otherGenderHe}:
   - ענה/י בחמימות ובכבוד. מותר גם בהומור עדין ומכבד — למשל "מה רע בי? 😄" — אבל תמיד ברמה גבוהה.
   - אם הלקוח נראה חרדי/דתי (שפה, הקשר), שאל/י בהומור עדין ומכבד מה הסיבה לבקשה. לא חובה.
   - אל תציין/י זמן המתנה ספציפי. אמור/י שכרגע כל הנציגים תפוסים ושיתאזר/תתאזרי בסבלנות.
   - אחרי ההודעה לוקוח, הוסף/י בשורה חדשה: [ACTION:SWITCH_GENDER]

2. אם הלקוח מתעקש (לאחר שאלה ראשונה) לדבר עם מנהל — לא סתם שואל, ממש מתעקש:
   - אמור/י שמנהל יחזור תוך יום עסקים אחד לכל היותר.
   - שאל/י אם הוא מעדיף מענה ב-WhatsApp או במייל.
   - אחרי ההודעה ללקוח, הוסף/י בשורה חדשה: [ACTION:ESCALATE_MANAGER]

כתוב/י תמיד קצר וברור. WhatsApp — לא מיילים. ללא כותרות markdown.`;
}

async function sendWhatsApp(
  twilioClient: twilio.Twilio,
  from: string,
  to: string,
  body: string
): Promise<void> {
  await twilioClient.messages.create({ from, to, body });
}

export async function POST(req: NextRequest) {
  const accountSid = readEnvKey("TWILIO_ACCOUNT_SID");
  const authToken = readEnvKey("TWILIO_AUTH_TOKEN");
  const anthropicKey = readEnvKey("ANTHROPIC_API_KEY");
  const twilioSignature = req.headers.get("x-twilio-signature") || "";

  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const incomingBody = params.get("Body")?.trim() || "";
    const incomingFrom = params.get("From") || "";
    const incomingTo = params.get("To") || "";

    if (!incomingFrom || !incomingBody) {
      return new NextResponse("OK", { status: 200 });
    }

    // Validate Twilio signature in production
    if (authToken && process.env.NODE_ENV === "production") {
      const isValid = twilio.validateRequest(
        authToken,
        twilioSignature,
        req.url,
        Object.fromEntries(params)
      );
      if (!isValid) {
        console.warn("Invalid Twilio signature from:", incomingFrom);
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    // Load or initialize conversation
    let conv = await getWAConversation(incomingFrom);
    const isNew = !conv;

    if (!conv) {
      const agentName = randomFrom(FEMALE_NAMES);
      conv = {
        from: incomingFrom,
        twilioTo: incomingTo,
        history: [],
        agentName,
        agentGender: "female",
        startedAt: Date.now(),
        lastMessageAt: Date.now(),
      };
    }

    // Reactive fallback: if pending switch delay has passed, switch agent now
    let handoverFrom: string | undefined;
    if (conv.pendingSwitch && Date.now() >= conv.pendingSwitch.sendAfter) {
      handoverFrom = conv.agentName;
      conv = {
        ...conv,
        agentName: conv.pendingSwitch.newName,
        agentGender: conv.pendingSwitch.newGender,
        pendingSwitch: undefined,
      };
      await removePendingSwitch(incomingFrom);
    }

    const updatedHistory: Anthropic.MessageParam[] = [
      ...conv.history,
      { role: "user", content: incomingBody },
    ];

    const systemPrompt = buildSystemPrompt(
      conv.agentName,
      conv.agentGender,
      handoverFrom
    );

    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: systemPrompt,
      messages: updatedHistory,
    });

    const aiContent = response.content[0];
    if (aiContent.type !== "text") throw new Error("Unexpected AI response");

    const rawReply = aiContent.text.trim();

    // Parse and strip action tags
    const actionMatch = rawReply.match(/\[ACTION:(SWITCH_GENDER|ESCALATE_MANAGER)\]/);
    const action = actionMatch?.[1] ?? null;
    const cleanReply = rawReply
      .replace(/\[ACTION:(SWITCH_GENDER|ESCALATE_MANAGER)\]\s*$/m, "")
      .trim();

    // Save history (keep last 30 messages)
    const newHistory: Anthropic.MessageParam[] = [
      ...updatedHistory,
      { role: "assistant" as const, content: cleanReply },
    ].slice(-30);

    const updatedConv: WhatsAppConversation = {
      ...conv,
      history: newHistory,
      lastMessageAt: Date.now(),
    };

    // Handle SWITCH_GENDER action
    if (action === "SWITCH_GENDER") {
      const newGender: "female" | "male" =
        conv.agentGender === "female" ? "male" : "female";
      const newPool = newGender === "female" ? FEMALE_NAMES : MALE_NAMES;
      const newName = pickDifferentName(conv.agentName, newGender);
      void newPool; // used implicitly via pickDifferentName

      // Random delay: 2–8 minutes
      const delayMs = (Math.floor(Math.random() * 7) + 2) * 60 * 1000;
      updatedConv.pendingSwitch = {
        newName,
        newGender,
        sendAfter: Date.now() + delayMs,
      };
      await addPendingSwitch(incomingFrom);
    }

    // Handle ESCALATE_MANAGER action
    if (action === "ESCALATE_MANAGER") {
      updatedConv.escalatedToManager = true;
      // TODO: when MANAGER_WHATSAPP_NUMBER is set, send notification here
      const managerNumber = readEnvKey("MANAGER_WHATSAPP_NUMBER");
      if (managerNumber) {
        const twilioClient = twilio(accountSid, authToken);
        const summary = conv.history
          .slice(-6)
          .map((m) => `${m.role === "user" ? "לקוח" : "נציג"}: ${typeof m.content === "string" ? m.content : ""}`)
          .join("\n");
        await twilioClient.messages.create({
          from: incomingTo,
          to: `whatsapp:${managerNumber}`,
          body: `🔔 *בקשה למנהל*\nמספר לקוח: ${incomingFrom}\n\nתקציר שיחה:\n${summary}`,
        });
      }
    }

    await setWAConversation(incomingFrom, updatedConv);

    // Send reply to customer
    const twilioClient = twilio(accountSid, authToken);
    await sendWhatsApp(twilioClient, incomingTo, incomingFrom, cleanReply);

    return new NextResponse("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    console.error("WhatsApp bot error:", err);
    return new NextResponse("OK", { status: 200 });
  }
}
