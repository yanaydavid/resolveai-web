import { NextRequest, NextResponse } from "next/server";
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

export async function POST(req: NextRequest) {
  const client = new Anthropic({ apiKey: getAnthropicKey() });
  try {
    const body = await req.json();
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

    const outputLang = lang === "he" ? "Hebrew" : "English";
    const caseId = body.caseId || `RA-${Date.now().toString().slice(-8)}`;
    const hasBothSides = !!defendantResponse && defendantResponse.trim().length > 10;

    const defSection = hasBothSides
      ? `- Respondent's Position (Party 2 — ${partyTwoName}):\n${defendantResponse}`
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
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Extract JSON - strip markdown fences if present
    let raw = content.text.trim();
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) {
      raw = fenceMatch[1].trim();
    }
    // Find the outermost JSON object
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      raw = jsonMatch[0];
    }

    const verdict = JSON.parse(raw);
    // Ensure required fields have the correct values
    verdict.caseId = verdict.caseId || caseId;
    verdict.caseTitle = verdict.caseTitle || caseTitle;
    verdict.partyOneName = verdict.partyOneName || partyOneName;
    verdict.partyTwoName = verdict.partyTwoName || partyTwoName;
    verdict.category = verdict.category || category;
    verdict.lang = verdict.lang || lang;
    if (verdict.heardBothSides === undefined) verdict.heardBothSides = hasBothSides;

    // ── Send ruling email to claimant ─────────────────────────
    if (body.partyOneEmail) {
      await sendVerdictToClaimant({
        to: body.partyOneEmail,
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
    }

    // ── Send ruling email to defendant ────────────────────────
    if (body.partyTwoEmail) {
      await sendVerdictToDefendant({
        to: body.partyTwoEmail,
        defendantName: partyTwoName,
        claimantName: partyOneName,
        caseId: verdict.caseId,
        caseTitle,
        description,
        defendantResponse: body.defendantResponse || "",
        summary: verdict.summary,
        finding: verdict.finding,
        rationale: verdict.rationale,
        nextSteps: verdict.nextSteps || [],
        heardBothSides: verdict.heardBothSides,
        lang,
      });
    }

    // ── Update case status in KV ──────────────────────────────
    await updateCaseStatus(verdict.caseId, "verdict_issued");

    return NextResponse.json(verdict);
  } catch (err) {
    console.error("Analyze API error:", err);
    return NextResponse.json(
      { error: "Failed to process arbitration request" },
      { status: 500 }
    );
  }
}
