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
  partyTwoName: string;
  partyTwoEmail: string;
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
