import { Redis } from "@upstash/redis";

function getKv(): Redis {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    "";
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    "";
  return new Redis({ url, token });
}

export interface CaseSummary {
  caseId: string;
  caseTitle: string;
  partyOneName: string;
  partyOneEmail: string;
  partyOnePhone?: string;
  partyTwoName: string;
  partyTwoEmail: string;
  partyTwoPhone?: string;
  category: string;
  description?: string;
  submittedAt: string;
  status: "pending" | "responded" | "verdict_issued";
  nameFoundInDoc: boolean;
  documentSummary: string;
}

export async function storeCase(data: CaseSummary): Promise<void> {
  try {
    await getKv().set(`case:${data.caseId}`, data);
    await getKv().lpush("cases:all", data.caseId);
  } catch (err) {
    console.error("KV store error:", err);
  }
}

export async function updateCaseStatus(
  caseId: string,
  status: CaseSummary["status"]
): Promise<void> {
  try {
    const existing = await getKv().get<CaseSummary>(`case:${caseId}`);
    if (existing) {
      await getKv().set(`case:${caseId}`, { ...existing, status });
    }
  } catch (err) {
    console.error("KV update error:", err);
  }
}

export async function getCaseById(caseId: string): Promise<CaseSummary | null> {
  try {
    const data = await getKv().get<CaseSummary>(`case:${caseId}`);
    return data || null;
  } catch (err) {
    console.error("KV get case error:", err);
    return null;
  }
}

export async function getAllCases(): Promise<CaseSummary[]> {
  try {
    const ids = await getKv().lrange<string>("cases:all", 0, -1);
    if (!ids || ids.length === 0) return [];
    const cases = await Promise.all(
      ids.map((id) => getKv().get<CaseSummary>(`case:${id}`))
    );
    return cases.filter(Boolean) as CaseSummary[];
  } catch (err) {
    console.error("KV get all error:", err);
    return [];
  }
}

// ── Support Tickets ───────────────────────────────────────────

export interface SupportTicket {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  body: string;
  draft: string;
  token: string;
  status: "pending" | "sent" | "rejected";
  createdAt: string;
}

export async function storeSupportTicket(ticket: SupportTicket): Promise<void> {
  try {
    await getKv().set(`support:${ticket.id}`, ticket, { ex: 60 * 60 * 24 * 30 });
  } catch (err) {
    console.error("KV support store error:", err);
  }
}

export async function getSupportTicket(id: string): Promise<SupportTicket | null> {
  try {
    return await getKv().get<SupportTicket>(`support:${id}`) || null;
  } catch (err) {
    console.error("KV support get error:", err);
    return null;
  }
}

export async function updateSupportTicket(
  id: string,
  updates: Partial<SupportTicket>
): Promise<void> {
  try {
    const existing = await getKv().get<SupportTicket>(`support:${id}`);
    if (existing) {
      await getKv().set(`support:${id}`, { ...existing, ...updates }, { ex: 60 * 60 * 24 * 30 });
    }
  } catch (err) {
    console.error("KV support update error:", err);
  }
}

// ── WhatsApp Conversations ────────────────────────────────────

import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";

export interface WhatsAppConversation {
  from: string;
  twilioTo: string;
  history: MessageParam[];
  agentName: string;
  agentGender: "female" | "male";
  pendingSwitch?: {
    newName: string;
    newGender: "female" | "male";
    sendAfter: number; // unix ms
  };
  escalatedToManager?: boolean;
  startedAt: number;
  lastMessageAt: number;
}

export async function getWAConversation(
  phone: string
): Promise<WhatsAppConversation | null> {
  try {
    return (await getKv().get<WhatsAppConversation>(`wa:${phone}`)) || null;
  } catch {
    return null;
  }
}

export async function setWAConversation(
  phone: string,
  conv: WhatsAppConversation
): Promise<void> {
  try {
    await getKv().set(`wa:${phone}`, conv, { ex: 60 * 60 * 24 * 30 });
  } catch (err) {
    console.error("KV wa conv error:", err);
  }
}

export async function addPendingSwitch(phone: string): Promise<void> {
  try {
    await getKv().sadd("wa:pending_switches", phone);
  } catch (err) {
    console.error("KV pending switch add error:", err);
  }
}

export async function getPendingSwitches(): Promise<string[]> {
  try {
    const result = await getKv().smembers("wa:pending_switches");
    return (result as string[]) || [];
  } catch {
    return [];
  }
}

export async function removePendingSwitch(phone: string): Promise<void> {
  try {
    await getKv().srem("wa:pending_switches", phone);
  } catch (err) {
    console.error("KV pending switch remove error:", err);
  }
}

// ── Full Case Data (original description + defense for re-analysis) ──────────

export interface CaseFullData {
  caseId: string;
  description: string;
  defendantResponse: string;
  storedAt: string;
}

export async function storeCaseFullData(data: CaseFullData): Promise<void> {
  try {
    await getKv().set(`case-full:${data.caseId}`, data, { ex: 60 * 60 * 24 * 365 });
  } catch (err) {
    console.error("KV case-full store error:", err);
  }
}

export async function getCaseFullData(caseId: string): Promise<CaseFullData | null> {
  try {
    return (await getKv().get<CaseFullData>(`case-full:${caseId}`)) || null;
  } catch (err) {
    console.error("KV case-full get error:", err);
    return null;
  }
}

// ── Hearing Requests ──────────────────────────────────────────────────────────

export interface HearingRequest {
  hearingId: string;
  caseId: string;
  requestedBy: "claimant" | "respondent";
  requesterName: string;
  requesterEmail: string;
  newEvidence: string;
  newDocSummary: string;
  submittedAt: string;
  status: "awaiting_response" | "response_received" | "verdict_issued";
  // Other party
  otherPartyName: string;
  otherPartyEmail: string;
  otherPartyPhone?: string;
  otherPartyEvidence?: string;
  otherPartyDocSummary?: string;
  respondedAt?: string;
  // Original case snapshot
  caseTitle: string;
  category: string;
  partyOneName: string;
  partyOneEmail: string;
  partyTwoName: string;
  partyTwoEmail: string;
  lang: string;
  originalFinding: string;
  originalSummary: string;
}

export async function storeHearingRequest(data: HearingRequest): Promise<void> {
  try {
    const kv = getKv();
    await kv.set(`hearing:${data.hearingId}`, data, { ex: 60 * 60 * 24 * 90 });
    // Track active (awaiting) hearings for cron processing
    await kv.sadd("hearings:active", data.hearingId);
  } catch (err) {
    console.error("KV hearing store error:", err);
  }
}

export async function getActiveHearingIds(): Promise<string[]> {
  try {
    const result = await getKv().smembers("hearings:active");
    return (result as string[]) || [];
  } catch (err) {
    console.error("KV hearing active ids error:", err);
    return [];
  }
}

export async function removeActiveHearing(hearingId: string): Promise<void> {
  try {
    await getKv().srem("hearings:active", hearingId);
  } catch (err) {
    console.error("KV hearing remove active error:", err);
  }
}

export async function getHearingRequest(hearingId: string): Promise<HearingRequest | null> {
  try {
    return (await getKv().get<HearingRequest>(`hearing:${hearingId}`)) || null;
  } catch (err) {
    console.error("KV hearing get error:", err);
    return null;
  }
}

export async function updateHearingRequest(
  hearingId: string,
  updates: Partial<HearingRequest>
): Promise<void> {
  try {
    const existing = await getKv().get<HearingRequest>(`hearing:${hearingId}`);
    if (existing) {
      await getKv().set(
        `hearing:${hearingId}`,
        { ...existing, ...updates },
        { ex: 60 * 60 * 24 * 90 }
      );
    }
  } catch (err) {
    console.error("KV hearing update error:", err);
  }
}
