import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { sendVerdictToClaimant, sendVerdictToDefendant } from "@/lib/email";
import { updateCaseStatus, storeCaseFullData } from "@/lib/kv-store";

function getAnthropicKey(): string {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  try {
    const content = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
    const match = content.match(/ANTHROPIC_API_KEY=(.+)/);
    return match ? match[1].trim() : "";
  } catch {
    return "";
  }
}

export interface DocAttachment {
  buffer: Buffer;
  mime: string;
  name?: string;
}

export interface AnalyzeCaseParams {
  caseId: string;
  caseTitle: string;
  category: string;
  partyOneName: string;
  partyOneEmail: string;
  partyTwoName: string;
  partyTwoEmail: string;
  description: string;
  defendantResponse?: string;
  lang?: string;
  /** Multiple defendant documents */
  docAttachments?: DocAttachment[];
  /** Legacy single-doc support */
  docBuffer?: Buffer;
  docMime?: string;
}

export interface AnalyzeCaseResult {
  caseId: string;
  caseTitle: string;
  partyOneName: string;
  partyTwoName: string;
  category: string;
  lang: string;
  heardBothSides: boolean;
  summary: string;
  analysis: string;
  finding: string;
  rationale: string;
  nextSteps: string[];
}

export async function analyzeCase(params: AnalyzeCaseParams): Promise<AnalyzeCaseResult> {
  const {
    caseId,
    caseTitle,
    category,
    partyOneName,
    partyOneEmail,
    partyTwoName,
    partyTwoEmail,
    description,
    defendantResponse = "",
    lang = "he",
    docAttachments: rawAttachments,
    docBuffer,
    docMime = "application/pdf",
  } = params;

  // Normalize: support both multi-doc and legacy single-doc
  const docAttachments: DocAttachment[] =
    rawAttachments && rawAttachments.length > 0
      ? rawAttachments
      : docBuffer && docBuffer.length > 0
        ? [{ buffer: docBuffer, mime: docMime }]
        : [];

  const client = new Anthropic({ apiKey: getAnthropicKey() });
  const outputLang = lang === "he" ? "Hebrew" : "English";
  const hasBothSides = !!defendantResponse && defendantResponse.trim().length > 10;

  // ── Analyze all defendant documents ──────────────────────────
  const docSummaries: string[] = [];
  for (let i = 0; i < docAttachments.length; i++) {
    const { buffer, mime, name } = docAttachments[i];
    try {
      const base64   = buffer.toString("base64");
      const isImage  = mime.startsWith("image/");
      const docBlock = isImage
        ? { type: "image" as const,    source: { type: "base64" as const, media_type: mime as "image/jpeg" | "image/png" | "image/gif" | "image/webp", data: base64 } }
        : { type: "document" as const, source: { type: "base64" as const, media_type: "application/pdf" as const, data: base64 } };
      const label = name ? `מסמך "${name}"` : `מסמך ${i + 1}`;
      const docRes = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 512,
        messages: [{ role: "user", content: [docBlock, { type: "text" as const, text: `סכם בקצרה (עד 3 משפטים) מה מוכיח ${label} לטובת הנתבע ${partyTwoName} בסכסוך: ${caseTitle}` }] }],
      });
      const summary = (docRes.content[0] as { type: string; text: string }).text;
      docSummaries.push(name ? `[${name}]: ${summary}` : summary);
    } catch (e) { console.error(`Doc ${i + 1} analysis failed:`, e); }
  }
  const defDocSummary = docSummaries.join("\n");

  const defSection = hasBothSides
    ? `- Respondent's Position (Party 2 — ${partyTwoName}):\n${defendantResponse}${defDocSummary ? `\n- Respondent's Document Evidence: ${defDocSummary}` : ""}`
    : `- Respondent's Position: NOT SUBMITTED — decision based on claimant's account only. Note this clearly in your analysis.`;

  // ── Legal frameworks by category ─────────────────────────────
  const legalFrameworks: Record<string, string> = {
    business: `APPLICABLE ISRAELI LAW — COMMERCIAL / BUSINESS DISPUTES:
• חוק החוזים (חלק כללי), תשל"ג-1973 — כריתה, תוקף, פרשנות, עקרון תום הלב (סעיפים 12, 39)
• חוק התרופות בשל הפרת חוזה, תשל"א-1970 — אכיפה, ביטול, פיצויים, הקטנת נזק (סעיף 14)
• חוק החברות, תשנ"ט-1999 — סכסוכי בעלי מניות, חובת אמון, דירקטורים
• פקודת השותפויות [נוסח חדש], תשל"ה-1975 — סכסוכי שותפים
• חוק עשיית עושר ולא במשפט, תשל"ט-1979 — השבת רווח שלא כדין
• פקודת הנזיקין [נוסח חדש] — אחריות נזיקית, רשלנות, הטעיה
• חוק הגנת הצרכן, תשמ"א-1981 — עסקאות B2C, תנאים מקפחים
• חוק המכר, תשכ"ח-1968 — מכר טובין, אחריות ספק
• חוק הסוכנות המסחרית, תשע"ב-2012 — יחסי סוכן-שולח
• חוק איסור לשון הרע, תשכ"ה-1965 — פגיעה מסחרית במוניטין`,

    property: `APPLICABLE ISRAELI LAW — REAL ESTATE / PROPERTY DISPUTES:
• חוק המקרקעין, תשכ"ט-1969 — בעלות, שיתוף, רישום, עסקאות נוגדות
• חוק השכירות והשאילה, תשל"א-1971 — חוזי שכירות, חובות משכיר ושוכר
• חוק הגנת הדייר [נוסח משולב], תשל"ב-1972 — דיירות מוגנת
• חוק המכר (דירות), תשל"ג-1973 — רכישת דירה מקבלן, אחריות לליקויי בנייה
• חוק המכר (דירות) (הבטחת השקעות), תשל"ה-1974 — בטוחות לרוכשי דירות
• חוק התכנון והבנייה, תשכ"ה-1965 — בנייה ללא היתר, פיצויי הפקעה
• חוק שכר דירה הוגן, תשנ"ח-1998 — שכירות למגורים
• חוק עסקאות גופים ציבוריים, תשל"ו-1976
• חוק החוזים (חלק כללי), תשל"ג-1973 — עקרון תום הלב בעסקאות מקרקעין
• חוק התרופות בשל הפרת חוזה, תשל"א-1970 — ביטול עסקה, פיצויים`,

    financial: `APPLICABLE ISRAELI LAW — FINANCIAL / MONETARY DISPUTES:
• חוק עשיית עושר ולא במשפט, תשל"ט-1979 — החזר כספים שנלקחו שלא כדין
• חוק החוזים (חלק כללי), תשל"ג-1973 — הסכמי הלוואה, ערבות, פיקדון
• חוק הערבות, תשכ"ז-1967 — ערבים, היקף אחריות
• חוק הבנקאות (שירות ללקוח), תשמ"א-1981 — חובות בנק כלפי לקוח
• חוק הסדרת הלוואות חוץ-בנקאיות, תשנ"ג-1993 — ריבית מירבית, הסכמי הלוואה
• חוק אשראי הוגן, תשנ"ג-1993 — תנאי אשראי צרכני
• חוק הביטוח, תשמ"א-1981 — תביעות ביטוח, סירוב לפצות
• חוק ניירות ערך, תשכ"ח-1968 — הגנה על משקיעים
• חוק הגנת הצרכן, תשמ"א-1981 — עסקאות פיננסיות צרכניות
• פקודת הנזיקין [נוסח חדש] — נזק כספי עקב רשלנות
• חוק פסיקת ריבית והצמדה, תשכ"א-1961 — חישוב ריבית וקרן`,

    employment: `APPLICABLE ISRAELI LAW — EMPLOYMENT / LABOR DISPUTES:
• חוק פיצויי פיטורים, תשכ"ג-1963 — זכאות לפיצויי פיטורים, סייגים
• חוק הודעה מוקדמת לפיטורים ולהתפטרות, תשס"א-2001 — תקופות הודעה מוקדמת
• חוק שכר מינימום, תשמ"ז-1987 — שכר מינימום נוכחי
• חוק הגנת השכר, תשי"ח-1958 — איחור בתשלום, ניכויים מותרים
• חוק שעות עבודה ומנוחה, תשי"א-1951 — שעות נוספות, מנוחה שבועית
• חוק החופשה השנתית, תשי"א-1951 — זכות לחופשה, פדיון חופשה
• חוק דמי מחלה, תשל"ו-1976 — ימי מחלה, תשלום דמי מחלה
• חוק עבודת נשים, תשי"ד-1954 — הגנה בהיריון, לידה, הנקה
• חוק שוויון הזדמנויות בעבודה, תשמ"ח-1988 — איסור אפליה
• חוק שוויון זכויות לאנשים עם מוגבלות, תשנ"ח-1998
• חוק הסכמים קיבוציים, תשי"ז-1957 — תחולת הסכמים קיבוציים
• פסיקת בית הדין הארצי לעבודה — הלכות מחייבות בדיני עבודה`,

    contract: `APPLICABLE ISRAELI LAW — CONTRACT BREACH:
• חוק החוזים (חלק כללי), תשל"ג-1973 — כריתה (סעיפים 1-9), תוקף (10-31), ביצוע (38-41), תום לב (39)
• חוק התרופות בשל הפרת חוזה, תשל"א-1970 — אכיפה (סעיף 3), ביטול (סעיפים 7-9), פיצויים (סעיפים 10-13), הקטנת נזק (סעיף 14)
• חוק החוזים האחידים, תשמ"ג-1982 — תנאים מקפחים בחוזים אחידים
• חוק עשיית עושר ולא במשפט, תשל"ט-1979 — השבה עם ביטול חוזה
• חוק המכר, תשכ"ח-1968 — מכר טובין: אחריות למום, אי-התאמה
• פקודת הנזיקין [נוסח חדש] — תרמית, הטעיה, רשלנות
• חוק הגנת הצרכן, תשמ"א-1981 — עסקאות צרכניות, הטעיה
• חוק פסיקת ריבית והצמדה, תשכ"א-1961 — ריבית על חיובים כספיים
DISTINCTIONS: הפרה יסודית (מזכה בביטול) לעומת הפרה רגילה (מזכה בפיצויים בלבד)`,

    divorce: `APPLICABLE ISRAELI LAW — DIVORCE PROPERTY DIVISION:
• חוק יחסי ממון בין בני זוג, תשל"ג-1973 — עיקרון איזון המשאבים, נכסים פטורים (ירושה, מתנה, נכסים מלפני הנישואין)
• חוק הירושה, תשכ"ה-1965 — ירושות ומתנות שאינן נכללות באיזון המשאבים
• חוק המקרקעין, תשכ"ט-1969 — בעלות ושיתוף בנכסי מקרקעין משותפים
• חוק החברות, תשנ"ט-1999 — חלוקת עסק משותף
• חוק משפחה (עזרה הדדית), תשי"ט-1959 — מזונות אישה
• פסיקת בית המשפט העליון — הלכות מרכזיות על שיתוף ספציפי ואיזון משאבים
⚠️ SCOPE: רכוש, נכסים, חשבונות, חובות, עסק — בלבד.
   גט → בית דין רבני בלבד. משמורת/מזונות ילדים → בית משפט למשפחה בלבד.`,

    other: `APPLICABLE GENERAL ISRAELI LAW:
• חוק החוזים (חלק כללי), תשל"ג-1973
• חוק התרופות בשל הפרת חוזה, תשל"א-1970
• פקודת הנזיקין [נוסח חדש]
• חוק עשיית עושר ולא במשפט, תשל"ט-1979
• חוק הגנת הצרכן, תשמ"א-1981`,
  };

  const legalNote = legalFrameworks[category] ?? legalFrameworks["other"];

  const prompt = `You are a senior AI arbitrator specializing in Israeli law. You approach every case with strict impartiality, basing your analysis exclusively on the facts, arguments, and the specific Israeli legal sources listed below. Your decisions are thorough, legally grounded, and professionally written. Do NOT invent laws — cite ONLY the laws provided in the legal framework section.

Analyze the following arbitration case and render a decision.

CASE DETAILS:
- Case ID: ${caseId}
- Title: ${caseTitle}
- Category: ${category}
- Claimant (Party 1): ${partyOneName} (${partyOneEmail})
- Respondent (Party 2): ${partyTwoName} (${partyTwoEmail})

CLAIMANT'S POSITION (Party 1 — ${partyOneName}):
${description}

${defSection}

${legalNote}

INSTRUCTIONS:
1. Carefully analyze both parties' positions (or note if only one side was presented).
2. ${hasBothSides ? "Give equal weight to both parties' accounts and identify points of agreement and dispute." : "Since only the claimant's account is available, analyze the claim objectively and note that the respondent did not submit a position."}
3. Apply ONLY the Israeli legal frameworks listed above. Explicitly cite the specific laws and sections in your rationale.
4. Render a clear, definitive finding based on the law.
5. Provide comprehensive legal reasoning with specific legal citations.
6. Write ALL response text in ${outputLang}.
${!hasBothSides ? "7. Clearly indicate at the start of your summary that this decision was rendered in the absence of the respondent's position." : ""}

CRITICAL: Respond ONLY with a valid JSON object — no markdown fences, no text before or after the JSON.
All string values must be properly JSON-escaped (escape double quotes as \\", newlines as \\n).
The structure must be exactly:
{
  "caseId": <string>,
  "caseTitle": <string>,
  "partyOneName": <string>,
  "partyTwoName": <string>,
  "category": <string>,
  "lang": <string>,
  "heardBothSides": ${hasBothSides},
  "summary": <2-3 sentence neutral summary in ${outputLang}>,
  "analysis": <thorough analysis in 3-4 paragraphs in ${outputLang}>,
  "finding": <clear definitive finding in 2-3 sentences in ${outputLang}>,
  "rationale": <legal reasoning in 2-3 paragraphs in ${outputLang}>,
  "nextSteps": [<step1>, <step2>, <step3>, <step4 if applicable>]
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type from Claude");

  // Strip markdown fences if present
  let raw = content.text.trim();
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) raw = fenceMatch[1].trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) raw = jsonMatch[0];

  const verdict: AnalyzeCaseResult = JSON.parse(raw);
  verdict.caseId = verdict.caseId || caseId;
  verdict.caseTitle = verdict.caseTitle || caseTitle;
  verdict.partyOneName = verdict.partyOneName || partyOneName;
  verdict.partyTwoName = verdict.partyTwoName || partyTwoName;
  verdict.category = verdict.category || category;
  verdict.lang = verdict.lang || lang;
  if ((verdict as { heardBothSides?: boolean }).heardBothSides === undefined) {
    verdict.heardBothSides = hasBothSides;
  }

  // ── Store full case data for potential re-analysis ───────────
  await storeCaseFullData({
    caseId: verdict.caseId,
    description,
    defendantResponse,
    storedAt: new Date().toISOString(),
  });

  // ── Send verdict email to claimant ───────────────────────────
  if (partyOneEmail) {
    try {
      await sendVerdictToClaimant({
        to: partyOneEmail,
        claimantName: partyOneName,
        caseId: verdict.caseId,
        caseTitle,
        partyOneName,
        partyTwoName,
        summary: verdict.summary,
        finding: verdict.finding,
        rationale: verdict.rationale,
        nextSteps: verdict.nextSteps || [],
        heardBothSides: verdict.heardBothSides,
        lang,
      });
    } catch (e) { console.error("Email to claimant failed:", e); }
  }

  // ── Send verdict email to defendant ──────────────────────────
  if (partyTwoEmail) {
    try {
      await sendVerdictToDefendant({
        to: partyTwoEmail,
        defendantName: partyTwoName,
        claimantName: partyOneName,
        caseId: verdict.caseId,
        caseTitle,
        description,
        defendantResponse,
        summary: verdict.summary,
        finding: verdict.finding,
        rationale: verdict.rationale,
        nextSteps: verdict.nextSteps || [],
        heardBothSides: verdict.heardBothSides,
        lang,
      });
    } catch (e) { console.error("Email to defendant failed:", e); }
  }

  // ── Update KV status ─────────────────────────────────────────
  await updateCaseStatus(verdict.caseId, "verdict_issued");

  return verdict;
}

// ── New Hearing (re-analysis with new evidence) ───────────────────────────────

export interface AnalyzeNewHearingParams {
  hearingId: string;
  caseId: string;
  caseTitle: string;
  category: string;
  partyOneName: string;
  partyOneEmail: string;
  partyTwoName: string;
  partyTwoEmail: string;
  lang: string;
  // Original case
  originalDescription: string;
  originalDefenseResponse: string;
  originalFinding: string;
  originalSummary: string;
  // New evidence
  requestedBy: "claimant" | "respondent";
  newEvidence: string;
  newDocSummary?: string;
  // Counter evidence (may be empty if other party didn't respond)
  counterEvidence?: string;
  counterDocSummary?: string;
  // New documents submitted with new hearing request
  docAttachments?: DocAttachment[];
}

export async function analyzeNewHearing(
  params: AnalyzeNewHearingParams
): Promise<AnalyzeCaseResult> {
  const {
    hearingId,
    caseId,
    caseTitle,
    category,
    partyOneName,
    partyOneEmail,
    partyTwoName,
    partyTwoEmail,
    lang,
    originalDescription,
    originalDefenseResponse,
    originalFinding,
    originalSummary,
    requestedBy,
    newEvidence,
    newDocSummary = "",
    counterEvidence = "",
    counterDocSummary = "",
    docAttachments = [],
  } = params;

  const client = new Anthropic({ apiKey: getAnthropicKey() });
  const outputLang = lang === "he" ? "Hebrew" : "English";

  const requesterName = requestedBy === "claimant" ? partyOneName : partyTwoName;
  const counterPartyName = requestedBy === "claimant" ? partyTwoName : partyOneName;
  const hasCounter = counterEvidence.trim().length > 10;

  // Summarize any newly submitted documents
  const newDocSummaries: string[] = [];
  for (let i = 0; i < docAttachments.length; i++) {
    const { buffer, mime, name } = docAttachments[i];
    try {
      const base64  = buffer.toString("base64");
      const isImage = mime.startsWith("image/");
      const docBlock = isImage
        ? { type: "image" as const, source: { type: "base64" as const, media_type: mime as "image/jpeg", data: base64 } }
        : { type: "document" as const, source: { type: "base64" as const, media_type: "application/pdf" as const, data: base64 } };
      const label = name ? `מסמך "${name}"` : `מסמך ${i + 1}`;
      const docRes = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 512,
        messages: [{ role: "user", content: [docBlock, { type: "text" as const, text: `סכם בקצרה (עד 3 משפטים) מה מוכיח ${label} לטובת ${requesterName} בסכסוך: ${caseTitle}` }] }],
      });
      newDocSummaries.push((docRes.content[0] as { type: string; text: string }).text);
    } catch { /* ignore doc errors */ }
  }
  const allNewDocSummary = [newDocSummary, ...newDocSummaries].filter(Boolean).join("\n");

  const legalFrameworks: Record<string, string> = {
    business: `חוק החוזים (חלק כללי) תשל"ג-1973, חוק התרופות תשל"א-1970, חוק החברות תשנ"ט-1999, פקודת הנזיקין, חוק הגנת הצרכן תשמ"א-1981`,
    property:  `חוק המקרקעין תשכ"ט-1969, חוק השכירות תשל"א-1971, חוק המכר (דירות) תשל"ג-1973, חוק התכנון והבנייה תשכ"ה-1965`,
    financial: `חוק עשיית עושר תשל"ט-1979, חוק הערבות תשכ"ז-1967, חוק הבנקאות תשמ"א-1981, חוק פסיקת ריבית תשכ"א-1961`,
    employment:`חוק פיצויי פיטורים תשכ"ג-1963, חוק הגנת השכר תשי"ח-1958, חוק שעות עבודה תשי"א-1951, חוק שוויון הזדמנויות תשמ"ח-1988`,
    contract:  `חוק החוזים (חלק כללי) תשל"ג-1973, חוק התרופות תשל"א-1970, חוק החוזים האחידים תשמ"ג-1982`,
    divorce:   `חוק יחסי ממון בין בני זוג תשל"ג-1973, חוק הירושה תשכ"ה-1965, חוק המקרקעין תשכ"ט-1969`,
    other:     `חוק החוזים תשל"ג-1973, פקודת הנזיקין, חוק עשיית עושר תשל"ט-1979`,
  };
  const legalNote = legalFrameworks[category] ?? legalFrameworks["other"];

  const prompt = `You are a senior AI arbitrator reviewing a NEW HEARING REQUEST in an existing arbitration case.
Your task is to determine whether the newly presented evidence changes the original finding.

═══════════════════════════════════════════════════
ORIGINAL CASE (Case ID: ${caseId})
═══════════════════════════════════════════════════
Title: ${caseTitle}
Category: ${category}
Party 1 (Claimant): ${partyOneName}
Party 2 (Respondent): ${partyTwoName}
Hearing ID: ${hearingId}

ORIGINAL CLAIM (${partyOneName}):
${originalDescription}

ORIGINAL DEFENSE (${partyTwoName}):
${originalDefenseResponse || "[No defense was submitted in the original case]"}

ORIGINAL VERDICT SUMMARY: ${originalSummary}
ORIGINAL FINDING: ${originalFinding}

═══════════════════════════════════════════════════
NEW HEARING REQUEST
═══════════════════════════════════════════════════
Requested by: ${requesterName} (${requestedBy === "claimant" ? "Claimant / Party 1" : "Respondent / Party 2"})

NEW EVIDENCE submitted by ${requesterName}:
${newEvidence}
${allNewDocSummary ? `\nSupporting document summary: ${allNewDocSummary}` : ""}

${hasCounter
  ? `COUNTER-EVIDENCE submitted by ${counterPartyName}:\n${counterEvidence}${counterDocSummary ? `\nSupporting document summary: ${counterDocSummary}` : ""}`
  : `NOTE: ${counterPartyName} did not submit a response to the new evidence within the allotted time.`
}

═══════════════════════════════════════════════════
APPLICABLE LAW: ${legalNote}
═══════════════════════════════════════════════════

INSTRUCTIONS:
1. Carefully evaluate whether the new evidence is genuinely new (not available at the original hearing).
2. Assess the materiality of the new evidence — does it significantly change the factual picture?
3. If counter-evidence was submitted, evaluate it with equal weight.
4. Apply the same Israeli legal frameworks as the original case.
5. Issue a NEW VERDICT that either: (a) affirms the original finding with explanation, or (b) revises the finding based on the new evidence.
6. In your summary, note that this is a new hearing and briefly describe what changed (or didn't).
7. Write ALL response text in ${outputLang}.

CRITICAL: Respond ONLY with a valid JSON object — no markdown, no text before/after.
{
  "caseId": "${caseId}",
  "caseTitle": "${caseTitle} [דיון נוסף — ${hearingId}]",
  "partyOneName": "${partyOneName}",
  "partyTwoName": "${partyTwoName}",
  "category": "${category}",
  "lang": "${lang}",
  "heardBothSides": ${hasCounter},
  "summary": <2-3 sentence summary noting this is a new hearing and what new evidence was considered, in ${outputLang}>,
  "analysis": <thorough analysis of original case + new evidence in 3-4 paragraphs, in ${outputLang}>,
  "finding": <clear revised or affirmed finding in 2-3 sentences, in ${outputLang}>,
  "rationale": <legal reasoning citing specific laws, in 2-3 paragraphs, in ${outputLang}>,
  "nextSteps": [<step1>, <step2>, <step3>]
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response from Claude");

  let raw = content.text.trim();
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) raw = fenceMatch[1].trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) raw = jsonMatch[0];

  return JSON.parse(raw) as AnalyzeCaseResult;
}
