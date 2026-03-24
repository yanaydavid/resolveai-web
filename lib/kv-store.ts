import { Redis } from "@upstash/redis";

const kv = Redis.fromEnv();

export interface CaseSummary {
  caseId: string;
  caseTitle: string;
  partyOneName: string;
  partyOneEmail: string;
  partyTwoName: string;
  partyTwoEmail: string;
  category: string;
  submittedAt: string;
  status: "pending" | "responded" | "verdict_issued";
  nameFoundInDoc: boolean;
  documentSummary: string;
}

export async function storeCase(data: CaseSummary): Promise<void> {
  try {
    await kv.set(`case:${data.caseId}`, data);
    await kv.lpush("cases:all", data.caseId);
  } catch (err) {
    console.error("KV store error:", err);
  }
}

export async function updateCaseStatus(
  caseId: string,
  status: CaseSummary["status"]
): Promise<void> {
  try {
    const existing = await kv.get<CaseSummary>(`case:${caseId}`);
    if (existing) {
      await kv.set(`case:${caseId}`, { ...existing, status });
    }
  } catch (err) {
    console.error("KV update error:", err);
  }
}

export async function getAllCases(): Promise<CaseSummary[]> {
  try {
    const ids = await kv.lrange<string>("cases:all", 0, -1);
    if (!ids || ids.length === 0) return [];
    const cases = await Promise.all(
      ids.map((id) => kv.get<CaseSummary>(`case:${id}`))
    );
    return cases.filter(Boolean) as CaseSummary[];
  } catch (err) {
    console.error("KV get all error:", err);
    return [];
  }
}
