import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { sendVerdictToClaimant, sendVerdictToDefendant } from "@/lib/email";
import { updateCaseStatus } from "@/lib/kv-store";

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
    docBuffer,
    docMime = "application/pdf",
  } = params;

  const client = new Anthropic({ apiKey: getAnthropicKey() });
  const outputLang = lang === "he" ? "Hebrew" : "English";
  const hasBothSides = !!defendantResponse && defendantResponse.trim().length > 10;

  // ── Analyze defendant's document if uploaded ─────────────────
  let defDocSummary = "";
  if (docBuffer && docBuffer.length > 0) {
    try {
      const base64 = docBuffer.toString("base64");
      const isImage = docMime.startsWith("image/");
      const docContent = isImage
        ? [{ type: "image" as const, source: { type: "base64" as const, media_type: docMime as "image/jpeg" | "image/png" | "image/gif" | "image/webp", data: base64 } }]
        : [{ type: "document" as const, source: { type: "base64" as const, media_type: "application/pdf" as const, data: base64 } }];
      const docRes = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 512,
        messages: [{ role: "user", content: [...docContent, { type: "text" as const, text: `סכם בקצרה (עד 3 משפטים) מה מוכיח מסמך זה לטובת הנתבע ${partyTwoName} בסכסוך: ${caseTitle}` }] }],
      });
      defDocSummary = (docRes.content[0] as { type: string; text: string }).text;
    } catch (e) { console.error("Defendant doc analysis failed:", e); }
  }

  const defSection = hasBothSides
    ? `- Respondent's Position (Party 2 — ${partyTwoName}):\n${defendantResponse}${defDocSummary ? `\n- Respondent's Document Evidence: ${defDocSummary}` : ""}`
    : `- Respondent's Position: NOT SUBMITTED — decision based on claimant's account only. Note this clearly in your analysis.`;

  const prompt = `You are a senior AI arbitrator with expertise in commercial law, contract disputes, employment law, real estate law, and financial disputes. You approach every case with strict impartiality, basing your analysis exclusively on the facts and arguments presented. Your decisions are thorough, reasoned, and professionally written.

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

INSTRUCTIONS:
1. Carefully analyze both parties' positions (or note if only one side was presented).
2. ${hasBothSides ? "Give equal weight to both parties' accounts and identify points of agreement and dispute." : "Since only the claimant's account is available, analyze the claim objectively and note that the respondent did not submit a position."}
3. Apply relevant legal frameworks and principles of fairness.
4. Render a clear, definitive finding.
5. Provide comprehensive legal reasoning.
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
