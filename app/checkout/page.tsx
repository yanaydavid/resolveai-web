"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { RaHeader } from "@/components/ra-header";
import { RaFooter } from "@/components/ra-footer";
import { PLANS, type Plan } from "@/lib/payment";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const planId  = searchParams.get("plan") || "basic";
  const error   = searchParams.get("error");
  const plan: Plan | undefined = PLANS.find((p) => p.id === planId);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(error ? "התשלום נכשל. אנא נסו שנית." : "");

  // Auto-redirect if plan not found
  useEffect(() => {
    if (!plan) router.replace("/pricing");
  }, [plan, router]);

  if (!plan) return null;

  async function handleCheckout() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      if (data.redirectTo) {
        window.location.href = data.redirectTo;
      } else {
        throw new Error("No redirect URL");
      }
    } catch {
      setErr("אירעה שגיאה. אנא נסו שנית.");
      setLoading(false);
    }
  }

  const isBeta = true; // will be false in production

  return (
    <>
      <RaHeader />

      {/* Header */}
      <div className="py-14 border-b"
        style={{ backgroundColor: "var(--ra-navy-950)", borderColor: "hsl(215 45% 18%)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/pricing"
            className="text-xs tracking-[0.15em] uppercase mb-6 inline-flex items-center gap-2"
            style={{ color: "var(--ra-gold-300)", fontFamily: "var(--font-sans)" }}>
            ← חזרה לתמחור
          </Link>
          <h1 className="text-3xl font-light mt-4"
            style={{ color: "var(--ra-cream-50)", fontFamily: "var(--font-display)" }}>
            סיום הזמנה
          </h1>
        </div>
      </div>

      <main className="flex-1 py-16" style={{ backgroundColor: "var(--ra-cream-50)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

            {/* ── Order summary ────────────────────────────────── */}
            <div className="md:col-span-2">
              <div className="border p-6 sticky top-24"
                style={{ borderColor: "var(--ra-gold-200)", backgroundColor: "white" }}>
                <p className="text-xs tracking-[0.2em] uppercase mb-5"
                  style={{ color: "hsl(215 20% 55%)", fontFamily: "var(--font-sans)" }}>
                  סיכום הזמנה
                </p>

                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold"
                    style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-sans)" }}>
                    תוכנית {plan.nameHe}
                  </span>
                  <span className="text-sm font-semibold"
                    style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-sans)" }}>
                    {isBeta ? "חינם" : `₪${plan.price.toLocaleString("he-IL")}`}
                  </span>
                </div>
                <p className="text-xs mb-6"
                  style={{ color: "hsl(215 20% 58%)", fontFamily: "var(--font-sans)" }}>
                  {isBeta ? "גרסת בטא — ללא עלות" : "כולל מע״מ, תשלום חד-פעמי"}
                </p>

                <div className="border-t pt-4 mb-6"
                  style={{ borderColor: "var(--ra-gold-100)" }}>
                  <div className="flex justify-between text-sm font-semibold">
                    <span style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-sans)" }}>סה״כ לתשלום</span>
                    <span style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-sans)" }}>
                      {isBeta ? "₪0" : `₪${plan.price.toLocaleString("he-IL")}`}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs"
                      style={{ color: "hsl(215 20% 45%)", fontFamily: "var(--font-sans)" }}>
                      <span style={{ color: "var(--ra-gold-600)" }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Payment form ─────────────────────────────────── */}
            <div className="md:col-span-3">

              {isBeta ? (
                /* ── Beta mode ─────────────────────────────────── */
                <div className="border p-8 text-center"
                  style={{ borderColor: "var(--ra-gold-300)", backgroundColor: "hsl(42 55% 97%)" }}>
                  <p className="text-3xl mb-3">✨</p>
                  <h2 className="text-xl font-semibold mb-3"
                    style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}>
                    גרסת בטא — גישה חינמית
                  </h2>
                  <p className="text-sm leading-relaxed mb-8 max-w-xs mx-auto"
                    style={{ color: "hsl(215 20% 40%)", fontFamily: "var(--font-sans)" }}>
                    כל התיקים בתקופת הבטא מטופלים ללא עלות. לא נדרש פרטי כרטיס אשראי.
                  </p>

                  {err && (
                    <p className="text-sm mb-4"
                      style={{ color: "hsl(0 60% 40%)", fontFamily: "var(--font-sans)" }}>
                      {err}
                    </p>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-5 text-sm tracking-[0.2em] uppercase font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: loading ? "var(--ra-navy-700)" : "var(--ra-navy-800)",
                      color: "var(--ra-cream-50)",
                      fontFamily: "var(--font-sans)",
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--ra-navy-900)"; }}
                    onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--ra-navy-800)"; }}
                  >
                    {loading ? "מעבד..." : `המשך לפתיחת תיק (${plan.nameHe})`}
                  </button>
                </div>
              ) : (
                /* ── Real payment form placeholder ─────────────── */
                <div className="border p-8"
                  style={{ borderColor: "var(--ra-gold-200)", backgroundColor: "white" }}>
                  <p className="text-xs tracking-[0.2em] uppercase mb-6"
                    style={{ color: "hsl(215 20% 55%)", fontFamily: "var(--font-sans)" }}>
                    פרטי תשלום
                  </p>

                  {/* Card fields — visual placeholder, real form injected by provider */}
                  <div className="space-y-4 mb-6 opacity-50 pointer-events-none select-none">
                    <div>
                      <label className="block text-xs tracking-[0.15em] uppercase mb-2"
                        style={{ color: "hsl(215 20% 45%)", fontFamily: "var(--font-sans)" }}>
                        מספר כרטיס
                      </label>
                      <div className="w-full h-11 border"
                        style={{ borderColor: "var(--ra-gold-200)", backgroundColor: "hsl(215 20% 98%)" }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs tracking-[0.15em] uppercase mb-2"
                          style={{ color: "hsl(215 20% 45%)", fontFamily: "var(--font-sans)" }}>
                          תוקף
                        </label>
                        <div className="w-full h-11 border"
                          style={{ borderColor: "var(--ra-gold-200)", backgroundColor: "hsl(215 20% 98%)" }} />
                      </div>
                      <div>
                        <label className="block text-xs tracking-[0.15em] uppercase mb-2"
                          style={{ color: "hsl(215 20% 45%)", fontFamily: "var(--font-sans)" }}>
                          CVV
                        </label>
                        <div className="w-full h-11 border"
                          style={{ borderColor: "var(--ra-gold-200)", backgroundColor: "hsl(215 20% 98%)" }} />
                      </div>
                    </div>
                  </div>

                  {err && (
                    <p className="text-sm mb-4"
                      style={{ color: "hsl(0 60% 40%)", fontFamily: "var(--font-sans)" }}>
                      {err}
                    </p>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-5 text-sm tracking-[0.2em] uppercase font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: loading ? "var(--ra-navy-700)" : "var(--ra-navy-800)",
                      color: "var(--ra-cream-50)",
                      fontFamily: "var(--font-sans)",
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--ra-navy-900)"; }}
                    onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--ra-navy-800)"; }}
                  >
                    {loading ? "מעבד תשלום..." : `שלם ₪${plan.price.toLocaleString("he-IL")} ופתח תיק`}
                  </button>

                  <p className="text-xs text-center mt-4"
                    style={{ color: "hsl(215 20% 58%)", fontFamily: "var(--font-sans)" }}>
                    🔒 תשלום מאובטח SSL
                  </p>
                </div>
              )}

              {/* Change plan link */}
              <p className="text-xs text-center mt-4"
                style={{ color: "hsl(215 20% 55%)", fontFamily: "var(--font-sans)" }}>
                <Link href="/pricing" style={{ color: "var(--ra-gold-700)", textDecoration: "underline" }}>
                  שנה תוכנית
                </Link>
              </p>
            </div>

          </div>
        </div>
      </main>

      <RaFooter />
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}
