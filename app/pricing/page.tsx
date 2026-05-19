import type { Metadata } from "next";
import Link from "next/link";
import { RaHeader } from "@/components/ra-header";
import { RaFooter } from "@/components/ra-footer";
import { PLANS } from "@/lib/payment";

export const metadata: Metadata = {
  title: "תמחור — בחרו תוכנית בוררות | ResolveAI",
  description:
    "בוררות מקוונת מבוססת AI החל מ-₪299. בסיסי, סטנדרט או פרמיום — פתרון סכסוכים מהיר, זול ומנומק ללא עורך דין.",
  alternates: { canonical: "https://resolveai.co.il/pricing" },
};

const CHECK = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
    style={{ display: "inline-block", flexShrink: 0, marginTop: "2px" }}>
    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function PricingPage() {
  return (
    <>
      <RaHeader />

      {/* ── Header ──────────────────────────────────────────────── */}
      <div
        className="py-20 border-b text-center"
        style={{ backgroundColor: "var(--ra-navy-950)", borderColor: "hsl(215 45% 18%)" }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs tracking-[0.3em] uppercase mb-4"
            style={{ color: "var(--ra-gold-400)", fontFamily: "var(--font-sans)" }}>
            תמחור
          </p>
          <h1 className="text-3xl md:text-4xl font-light mb-5"
            style={{ color: "var(--ra-cream-50)", fontFamily: "var(--font-display)" }}>
            בחרו את התוכנית המתאימה לכם
          </h1>
          <p className="text-base leading-relaxed max-w-xl mx-auto"
            style={{ color: "hsl(40 28% 68%)", fontFamily: "var(--font-sans)" }}>
            כל התיקים בגרסת הבטא מטופלים ללא עלות. בהמשך יופעל תשלום.
          </p>

          {/* Beta badge */}
          <div className="inline-block mt-6 px-5 py-2 border text-xs tracking-[0.15em] uppercase"
            style={{
              borderColor: "var(--ra-gold-500)",
              color: "var(--ra-gold-400)",
              fontFamily: "var(--font-sans)",
              backgroundColor: "hsl(42 48% 10%)",
            }}>
            ✨ גרסת בטא — כל התוכניות חינמיות כעת
          </div>
        </div>
      </div>

      <main className="flex-1 py-20" style={{ backgroundColor: "var(--ra-cream-50)" }}>
        <div className="max-w-5xl mx-auto px-6">

          {/* ── Plan cards ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-col border"
                style={{
                  borderColor: plan.recommended ? "var(--ra-gold-500)" : "var(--ra-gold-200)",
                  backgroundColor: "white",
                  position: "relative",
                }}
              >
                {plan.recommended && (
                  <div
                    className="absolute -top-4 right-0 left-0 flex justify-center"
                    aria-label="מומלץ"
                  >
                    <span
                      className="px-4 py-1 text-xs tracking-[0.15em] uppercase font-semibold"
                      style={{
                        backgroundColor: "var(--ra-gold-500)",
                        color: "var(--ra-navy-950)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      הכי פופולרי
                    </span>
                  </div>
                )}

                <div className="p-7 border-b" style={{ borderColor: "var(--ra-gold-100)" }}>
                  <p className="text-xs tracking-[0.2em] uppercase mb-3"
                    style={{ color: "hsl(215 20% 55%)", fontFamily: "var(--font-sans)" }}>
                    {plan.nameHe}
                  </p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-light"
                      style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}>
                      ₪{plan.price.toLocaleString("he-IL")}
                    </span>
                    <span className="text-sm"
                      style={{ color: "hsl(215 20% 55%)", fontFamily: "var(--font-sans)" }}>
                      / תיק
                    </span>
                  </div>
                  <p className="text-xs"
                    style={{ color: "hsl(215 20% 65%)", fontFamily: "var(--font-sans)" }}>
                    כולל מע״מ
                  </p>
                </div>

                <div className="p-7 flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm"
                        style={{ color: "hsl(215 20% 35%)", fontFamily: "var(--font-sans)" }}>
                        <span style={{ color: "var(--ra-gold-600)", marginTop: "1px" }}>
                          {CHECK}
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-7 pt-0">
                  <Link
                    href={`/checkout?plan=${plan.id}`}
                    className="block w-full py-4 text-sm tracking-[0.18em] uppercase font-semibold text-center transition-colors"
                    style={{
                      backgroundColor: plan.recommended ? "var(--ra-navy-800)" : "transparent",
                      color: plan.recommended ? "var(--ra-cream-50)" : "var(--ra-navy-800)",
                      border: plan.recommended ? "none" : "1px solid var(--ra-navy-800)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    בחר תוכנית
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* ── Comparison footnotes ─────────────────────────────── */}
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-sm leading-relaxed"
              style={{ color: "hsl(215 20% 50%)", fontFamily: "var(--font-sans)" }}>
              כל התוכניות כוללות: פסיקה מנומקת מבוססת AI, שליחת פסיקה לשני הצדדים, תמיכה בעברית ואנגלית.
              אין חידוש אוטומטי — תשלום חד-פעמי לתיק.
            </p>
          </div>

          {/* ── FAQ strip ────────────────────────────────────────── */}
          <div className="border-t pt-12" style={{ borderColor: "var(--ra-gold-100)" }}>
            <h2 className="text-xl font-light text-center mb-8"
              style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}>
              שאלות נפוצות על תמחור
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {[
                {
                  q: "האם יש תשלום חוזר?",
                  a: "לא. כל תיק הוא תשלום חד-פעמי. אין דמי מנוי.",
                },
                {
                  q: "מה קורה אם הצד השני מסרב?",
                  a: "ניתן לבקש פסיקה חד-צדדית ללא עלות נוספת.",
                },
                {
                  q: "האם יש החזר כספי?",
                  a: "החזר מלא תוך 48 שעות אם הפסיקה לא נשלחה.",
                },
                {
                  q: "אילו אמצעי תשלום מתקבלים?",
                  a: "כרטיסי אשראי ודביט, Bit — בקרוב.",
                },
              ].map(({ q, a }) => (
                <div key={q}>
                  <p className="text-sm font-semibold mb-1"
                    style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-sans)" }}>
                    {q}
                  </p>
                  <p className="text-sm leading-relaxed"
                    style={{ color: "hsl(215 20% 45%)", fontFamily: "var(--font-sans)" }}>
                    {a}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <RaFooter />
    </>
  );
}
