import { Redis } from "@upstash/redis";

// ── Plans ─────────────────────────────────────────────────────────────────────

export interface Plan {
  id: "basic" | "standard" | "premium";
  nameHe: string;
  nameEn: string;
  price: number; // ILS
  features: string[];
  featuresEn: string[];
  recommended?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "basic",
    nameHe: "בסיסי",
    nameEn: "Basic",
    price: 299,
    features: [
      "פסיקה מנומקת מלאה",
      "הגשת מסמך אחד",
      "מייל פסיקה לשני הצדדים",
      "תמיכה במייל",
    ],
    featuresEn: [
      "Full reasoned decision",
      "Submit 1 document",
      "Decision emailed to both parties",
      "Email support",
    ],
  },
  {
    id: "standard",
    nameHe: "סטנדרט",
    nameEn: "Standard",
    price: 599,
    recommended: true,
    features: [
      "כל מה שבבסיסי",
      "עד 5 מסמכים",
      "אפשרות דיון נוסף",
      "עדיפות בתור",
      "תמיכה טלפונית",
    ],
    featuresEn: [
      "Everything in Basic",
      "Up to 5 documents",
      "New hearing option",
      "Priority queue",
      "Phone support",
    ],
  },
  {
    id: "premium",
    nameHe: "פרמיום",
    nameEn: "Premium",
    price: 1990,
    features: [
      "כל מה שבסטנדרט",
      "מסמכים ללא הגבלה",
      "שני דיונים נוספים",
      "ניתוח מסמכים מורחב",
      "מנהל תיק אישי",
    ],
    featuresEn: [
      "Everything in Standard",
      "Unlimited documents",
      "Two additional hearings",
      "Extended document analysis",
      "Personal case manager",
    ],
  },
];

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

// ── Payment provider abstraction ──────────────────────────────────────────────

export type PaymentProvider = "tranzila" | "cardcom" | "meshulam" | "payplus" | "none";

export function getPaymentProvider(): PaymentProvider {
  return (process.env.PAYMENT_PROVIDER as PaymentProvider) || "none";
}

export function isPaymentEnabled(): boolean {
  // Override with BETA_FREE_ACCESS=false to require payment even in dev
  if (process.env.BETA_FREE_ACCESS === "false") return true;
  // If no provider configured, run in beta free mode
  return getPaymentProvider() !== "none";
}

// ── Payment token (stored in KV) ──────────────────────────────────────────────

export interface PaymentToken {
  token: string;
  planId: string;
  amount: number;
  provider: PaymentProvider;
  providerTxnId?: string; // transaction ID from provider
  createdAt: string;
  usedAt?: string;
  isBeta: boolean;
}

function getKv(): Redis {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "",
  });
}

export async function createPaymentToken(
  planId: string,
  providerTxnId?: string,
  isBeta = false
): Promise<string> {
  const plan = getPlanById(planId);
  if (!plan) throw new Error(`Unknown plan: ${planId}`);

  const token = crypto.randomUUID();
  const record: PaymentToken = {
    token,
    planId,
    amount: isBeta ? 0 : plan.price,
    provider: isBeta ? "none" : getPaymentProvider(),
    providerTxnId,
    createdAt: new Date().toISOString(),
    isBeta,
  };

  await getKv().set(`payment:${token}`, record, { ex: 60 * 60 * 2 }); // 2h TTL
  return token;
}

export async function verifyPaymentToken(token: string): Promise<PaymentToken | null> {
  try {
    return await getKv().get<PaymentToken>(`payment:${token}`) || null;
  } catch {
    return null;
  }
}

export async function markTokenUsed(token: string): Promise<void> {
  try {
    const existing = await getKv().get<PaymentToken>(`payment:${token}`);
    if (existing) {
      await getKv().set(
        `payment:${token}`,
        { ...existing, usedAt: new Date().toISOString() },
        { ex: 60 * 60 * 24 * 7 } // keep 7 days for records
      );
    }
  } catch { /* non-critical */ }
}
