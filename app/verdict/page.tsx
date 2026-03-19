"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { RaHeader } from "@/components/ra-header";
import { RaFooter } from "@/components/ra-footer";
import { useLanguage } from "@/lib/lang-context";

interface VerdictData {
  caseId: string;
  caseTitle: string;
  partyOneName: string;
  partyTwoName: string;
  category: string;
  lang: string;
  heardBothSides?: boolean;
  summary: string;
  analysis: string;
  finding: string;
  rationale: string;
  nextSteps: string[];
}

function VerdictSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <p
        className="text-xs tracking-[0.25em] uppercase mb-4"
        style={{ color: "var(--ra-gold-700)", fontFamily: "var(--font-sans)" }}
      >
        {label}
      </p>
      {children}
      <div
        className="mt-8 border-t"
        style={{ borderColor: "var(--ra-gold-100)" }}
        aria-hidden="true"
      />
    </div>
  );
}

export default function VerdictPage() {
  const { t, lang } = useLanguage();
  const v = t.verdict;
  const [verdict, setVerdict] = useState<VerdictData | null>(null);
  const [loading, setLoading] = useState(true);
  const [date] = useState(() =>
    new Date().toLocaleDateString(lang === "he" ? "he-IL" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ra-verdict");
      if (raw) {
        setVerdict(JSON.parse(raw));
      }
    } catch {
      // malformed JSON — show error state
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <>
        <RaHeader />
        <main
          className="flex-1 flex items-center justify-center min-h-[60vh]"
          style={{ backgroundColor: "var(--ra-cream-50)" }}
        >
          <p
            className="text-base"
            style={{
              color: "hsl(215 20% 45%)",
              fontFamily: "var(--font-sans)",
            }}
          >
            ...
          </p>
        </main>
        <RaFooter />
      </>
    );
  }

  if (!verdict) {
    return (
      <>
        <RaHeader />
        <main
          className="flex-1 flex items-center justify-center min-h-[60vh] py-20"
          style={{ backgroundColor: "var(--ra-cream-50)" }}
        >
          <div className="max-w-md mx-auto px-6 text-center">
            <span className="gold-rule block w-16 mx-auto mb-10" aria-hidden="true" />
            <h1
              className="text-2xl md:text-3xl font-light mb-4"
              style={{
                color: "var(--ra-navy-900)",
                fontFamily: "var(--font-display)",
              }}
            >
              {v.noData}
            </h1>
            <p
              className="text-sm mb-10 leading-relaxed"
              style={{
                color: "hsl(215 20% 45%)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {v.noDataSub}
            </p>
            <Link
              href="/new"
              className="inline-block px-8 py-3 text-xs tracking-[0.15em] uppercase font-semibold transition-colors"
              style={{
                backgroundColor: "var(--ra-navy-800)",
                color: "var(--ra-cream-50)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {v.noDataAction}
            </Link>
          </div>
        </main>
        <RaFooter />
      </>
    );
  }

  return (
    <>
      <RaHeader />

      <main className="flex-1" style={{ backgroundColor: "var(--ra-cream-50)" }}>
        {/* Document Header */}
        <div
          className="border-b py-12"
          style={{
            backgroundColor: "var(--ra-navy-950)",
            borderColor: "hsl(215 45% 18%)",
          }}
        >
          <div className="max-w-3xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div>
                <p
                  className="text-xs tracking-[0.25em] uppercase mb-3"
                  style={{
                    color: "var(--ra-gold-300)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {v.caseLabel} {verdict.caseId}
                </p>
                <h1
                  className="text-3xl md:text-4xl font-light mb-3"
                  style={{
                    color: "var(--ra-cream-50)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {v.title}
                </h1>
                <p
                  className="text-base italic"
                  style={{
                    color: "hsl(40 28% 65%)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {verdict.caseTitle}
                </p>
              </div>

              <div className="shrink-0 text-start sm:text-end">
                <p
                  className="text-xs tracking-[0.15em] uppercase mb-1"
                  style={{
                    color: "hsl(215 20% 45%)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {v.date}
                </p>
                <p
                  className="text-sm"
                  style={{
                    color: "hsl(40 28% 70%)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {date}
                </p>
              </div>
            </div>

            {/* Parties */}
            <div
              className="mt-8 pt-8 border-t flex flex-col sm:flex-row gap-6"
              style={{ borderColor: "hsl(215 45% 18%)" }}
            >
              <div className="flex-1">
                <p
                  className="text-xs tracking-[0.2em] uppercase mb-1"
                  style={{
                    color: "hsl(215 20% 40%)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {lang === "he" ? "צד א" : "Party A"}
                </p>
                <p
                  className="text-base"
                  style={{
                    color: "var(--ra-cream-50)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {verdict.partyOneName}
                </p>
              </div>
              <div
                className="hidden sm:block w-px self-stretch"
                style={{ backgroundColor: "hsl(215 45% 22%)" }}
                aria-hidden="true"
              />
              <div className="flex-1">
                <p
                  className="text-xs tracking-[0.2em] uppercase mb-1"
                  style={{
                    color: "hsl(215 20% 40%)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {lang === "he" ? "צד ב" : "Party B"}
                </p>
                <p
                  className="text-base"
                  style={{
                    color: "var(--ra-cream-50)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {verdict.partyTwoName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Body */}
        <div className="max-w-3xl mx-auto px-6 py-16">

          {/* One-sided notice */}
          {verdict.heardBothSides === false && (
            <div
              className="p-5 mb-10 border-s-4"
              style={{
                borderColor: "hsl(42 58% 37%)",
                backgroundColor: "hsl(42 55% 94%)",
              }}
            >
              <p
                className="text-sm leading-relaxed"
                style={{ color: "hsl(215 30% 30%)", fontFamily: "var(--font-sans)" }}
              >
                ⚠️{" "}
                {lang === "he"
                  ? "פסיקה זו ניתנה על בסיס עמדת הצד המגיש בלבד. הנתבע לא הגיש את עמדתו. פסיקה ניתנת בכפוף לזכות הנתבע לבקש עיון חוזר."
                  : "This decision was rendered based solely on the claimant's account. The respondent did not submit a position. The decision is subject to the respondent's right to request review."}
              </p>
            </div>
          )}

          {verdict.heardBothSides === true && (
            <div
              className="p-5 mb-10 border-s-4"
              style={{
                borderColor: "var(--ra-gold-500)",
                backgroundColor: "hsl(42 55% 96%)",
              }}
            >
              <p
                className="text-sm"
                style={{ color: "hsl(215 30% 30%)", fontFamily: "var(--font-sans)" }}
              >
                ✅{" "}
                {lang === "he"
                  ? "פסיקה זו ניתנה לאחר שמיעת עמדות שני הצדדים."
                  : "This decision was rendered after hearing both parties' positions."}
              </p>
            </div>
          )}

          {/* Summary */}
          <VerdictSection label={v.sections.summary}>
            <p
              className="text-base leading-relaxed"
              style={{
                color: "hsl(215 20% 30%)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {verdict.summary}
            </p>
          </VerdictSection>

          {/* Analysis */}
          <VerdictSection label={v.sections.analysis}>
            {verdict.analysis.split("\n\n").map((para, i) => (
              <p
                key={i}
                className="text-base leading-relaxed mb-4 last:mb-0"
                style={{
                  color: "hsl(215 20% 30%)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {para}
              </p>
            ))}
          </VerdictSection>

          {/* Finding — highlighted */}
          <div className="mb-10">
            <p
              className="text-xs tracking-[0.25em] uppercase mb-4"
              style={{
                color: "var(--ra-gold-700)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {v.sections.finding}
            </p>
            <div
              className="p-8 border-s-4"
              style={{
                borderColor: "var(--ra-gold-500)",
                backgroundColor: "hsl(42 55% 96%)",
              }}
            >
              <p
                className="text-xl md:text-2xl font-light leading-relaxed italic"
                style={{
                  color: "var(--ra-navy-900)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {verdict.finding}
              </p>
            </div>
            <div
              className="mt-8 border-t"
              style={{ borderColor: "var(--ra-gold-100)" }}
              aria-hidden="true"
            />
          </div>

          {/* Rationale */}
          <VerdictSection label={v.sections.rationale}>
            {verdict.rationale.split("\n\n").map((para, i) => (
              <p
                key={i}
                className="text-base leading-relaxed mb-4 last:mb-0"
                style={{
                  color: "hsl(215 20% 30%)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {para}
              </p>
            ))}
          </VerdictSection>

          {/* Next Steps */}
          <div className="mb-14">
            <p
              className="text-xs tracking-[0.25em] uppercase mb-6"
              style={{
                color: "var(--ra-gold-700)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {v.sections.nextSteps}
            </p>
            <ol className="space-y-4">
              {verdict.nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span
                    className="shrink-0 text-sm font-light leading-relaxed mt-0.5"
                    style={{
                      color: "var(--ra-gold-500)",
                      fontFamily: "var(--font-display)",
                      minWidth: "1.5rem",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}.
                  </span>
                  <p
                    className="text-base leading-relaxed"
                    style={{
                      color: "hsl(215 20% 30%)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* Footer note */}
          <div
            className="border-t pt-8 mb-12"
            style={{ borderColor: "var(--ra-gold-100)" }}
          >
            <p
              className="text-xs leading-relaxed"
              style={{
                color: "hsl(215 15% 58%)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {v.generatedBy}.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.print()}
              className="inline-block px-8 py-4 text-xs tracking-[0.15em] uppercase font-semibold text-center transition-colors no-print"
              style={{
                backgroundColor: "var(--ra-gold-500)",
                color: "var(--ra-navy-950)",
                fontFamily: "var(--font-sans)",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor =
                  "var(--ra-gold-700)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor =
                  "var(--ra-gold-500)")
              }
            >
              🖨️ {v.print}
            </button>

            <Link
              href="/new"
              className="inline-block px-8 py-4 text-xs tracking-[0.15em] uppercase font-semibold text-center transition-colors"
              style={{
                backgroundColor: "var(--ra-navy-800)",
                color: "var(--ra-cream-50)",
                fontFamily: "var(--font-sans)",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor =
                  "var(--ra-navy-900)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor =
                  "var(--ra-navy-800)")
              }
            >
              {v.newCase}
            </Link>

            <Link
              href="/"
              className="inline-block px-8 py-4 text-xs tracking-[0.15em] uppercase border text-center transition-colors"
              style={{
                borderColor: "var(--ra-gold-300)",
                color: "hsl(215 30% 38%)",
                fontFamily: "var(--font-sans)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.backgroundColor = "var(--ra-gold-100)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.backgroundColor = "transparent";
              }}
            >
              {v.backHome}
            </Link>
          </div>
        </div>
      </main>

      <RaFooter />
    </>
  );
}
