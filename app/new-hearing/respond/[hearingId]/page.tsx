"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RaHeader } from "@/components/ra-header";
import { RaFooter } from "@/components/ra-footer";
import { useLanguage } from "@/lib/lang-context";

interface HearingData {
  hearingId: string;
  caseId: string;
  caseTitle: string;
  requestedBy: "claimant" | "respondent";
  requesterName: string;
  otherPartyName: string;
  partyOneName: string;
  partyTwoName: string;
  newEvidence: string;
  newDocSummary: string;
  originalFinding: string;
  originalSummary: string;
  status: string;
  submittedAt: string;
  lang: string;
}

const inputStyle: React.CSSProperties = {
  backgroundColor: "hsl(0 0% 100%)",
  border: "1px solid var(--ra-gold-300)",
  color: "var(--ra-navy-900)",
  fontFamily: "var(--font-sans)",
  fontSize: "0.9rem",
  padding: "0.75rem 1rem",
  width: "100%",
  outline: "none",
};

export default function NewHearingRespondPage() {
  const { t, lang } = useLanguage();
  const nh = t.newHearing;
  const params = useParams<{ hearingId: string }>();
  const hearingId = params.hearingId;

  const [hearing, setHearing] = useState<HearingData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const [counterEvidence, setCounterEvidence] = useState("");
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldError, setFieldError] = useState("");

  useEffect(() => {
    if (!hearingId) return;
    fetch(`/api/new-hearing/status?id=${hearingId}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setLoadError(err.error || nh.respondNotFound);
        } else {
          const data = await res.json();
          setHearing(data);
          if (data.status !== "awaiting_response") {
            setLoadError(nh.respondAlreadyDone);
          }
        }
      })
      .catch(() => setLoadError(nh.respondNotFound))
      .finally(() => setLoading(false));
  }, [hearingId, nh.respondNotFound, nh.respondAlreadyDone]);

  async function submit(skip: boolean) {
    if (!hearing) return;

    if (!skip && counterEvidence.trim().length < 10) {
      setFieldError(lang === "he" ? "יש להזין לפחות 10 תווים" : "Please enter at least 10 characters");
      return;
    }
    setFieldError("");
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const fd = new FormData();
      fd.append("hearingId", hearingId);
      fd.append("counterEvidence", skip ? "" : counterEvidence.trim());
      docFiles.forEach((f) => fd.append("documents", f));

      const res = await fetch("/api/new-hearing/respond", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("API error");
      setSubmitted(true);
    } catch {
      setSubmitError(lang === "he" ? "אירעה שגיאה. אנא נסו שנית." : "An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  }

  // ── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <RaHeader />
        <main className="flex-1 flex items-center justify-center min-h-[60vh]"
          style={{ backgroundColor: "var(--ra-cream-50)" }}>
          <p style={{ color: "hsl(215 20% 45%)", fontFamily: "var(--font-sans)" }}>
            {nh.respondLoading}
          </p>
        </main>
        <RaFooter />
      </>
    );
  }

  // ── Error / already done ──────────────────────────────────────
  if (loadError) {
    return (
      <>
        <RaHeader />
        <main className="flex-1 flex items-center justify-center min-h-[60vh] py-20"
          style={{ backgroundColor: "var(--ra-cream-50)" }}>
          <div className="max-w-md mx-auto px-6 text-center">
            <span className="gold-rule block w-16 mx-auto mb-10" aria-hidden="true" />
            <h1 className="text-2xl font-light mb-6"
              style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}>
              {loadError}
            </h1>
            <Link href="/"
              className="inline-block px-8 py-4 text-xs tracking-[0.15em] uppercase font-semibold"
              style={{ backgroundColor: "var(--ra-navy-800)", color: "var(--ra-cream-50)", fontFamily: "var(--font-sans)" }}>
              {nh.backToHome}
            </Link>
          </div>
        </main>
        <RaFooter />
      </>
    );
  }

  // ── Success ───────────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <RaHeader />
        <main className="flex-1 flex items-center justify-center min-h-[70vh] py-20"
          style={{ backgroundColor: "var(--ra-cream-50)" }}>
          <div className="max-w-lg mx-auto px-6 text-center">
            <span className="gold-rule block w-16 mx-auto mb-10" aria-hidden="true" />
            <h1 className="text-2xl md:text-3xl font-light mb-6"
              style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}>
              {nh.respondSuccessTitle}
            </h1>
            <p className="text-base leading-relaxed mb-8"
              style={{ color: "hsl(215 20% 38%)", fontFamily: "var(--font-sans)" }}>
              {nh.respondSuccessBody}
            </p>
            <div className="p-5 mb-10 border-s-4 text-start"
              style={{ borderColor: "var(--ra-gold-500)", backgroundColor: "hsl(42 55% 96%)" }}>
              <p className="text-sm"
                style={{ color: "hsl(215 30% 30%)", fontFamily: "var(--font-sans)" }}>
                {lang === "he"
                  ? `תיק ${hearing?.caseId} — ${hearing?.caseTitle}`
                  : `Case ${hearing?.caseId} — ${hearing?.caseTitle}`}
              </p>
            </div>
            <Link href="/"
              className="inline-block px-8 py-4 text-xs tracking-[0.15em] uppercase font-semibold"
              style={{ backgroundColor: "var(--ra-navy-800)", color: "var(--ra-cream-50)", fontFamily: "var(--font-sans)" }}>
              {nh.backToHome}
            </Link>
          </div>
        </main>
        <RaFooter />
      </>
    );
  }

  if (!hearing) return null;

  const submittedDate = new Date(hearing.submittedAt).toLocaleDateString(
    lang === "he" ? "he-IL" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <>
      <RaHeader />

      {/* Page header */}
      <div
        className="py-16 border-b"
        style={{ backgroundColor: "var(--ra-navy-950)", borderColor: "hsl(215 45% 18%)" }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs tracking-[0.25em] uppercase mb-4"
            style={{ color: "var(--ra-gold-300)", fontFamily: "var(--font-sans)" }}>
            {lang === "he" ? "תיק מספר" : "Case No."} {hearing.caseId} &nbsp;·&nbsp;
            {lang === "he" ? "דיון" : "Hearing"} {hearing.hearingId}
          </p>
          <h1 className="text-3xl md:text-4xl font-light mb-4"
            style={{ color: "var(--ra-cream-50)", fontFamily: "var(--font-display)" }}>
            {nh.respondTitle}
          </h1>
          <p className="text-base leading-relaxed max-w-xl"
            style={{ color: "hsl(40 28% 70%)", fontFamily: "var(--font-sans)" }}>
            {nh.respondSubtitle}
          </p>
        </div>
      </div>

      <main className="flex-1 py-16" style={{ backgroundColor: "var(--ra-cream-50)" }}>
        <div className="max-w-3xl mx-auto px-6">

          {/* Notice */}
          <div className="p-6 mb-10 border-s-4"
            style={{ borderColor: "var(--ra-gold-500)", backgroundColor: "hsl(42 55% 96%)" }}>
            <p className="text-sm font-semibold mb-1"
              style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-sans)" }}>
              {lang === "he" ? "הזכות להישמע" : "Right to Be Heard"}
            </p>
            <p className="text-sm leading-relaxed"
              style={{ color: "hsl(215 20% 38%)", fontFamily: "var(--font-sans)" }}>
              {lang === "he"
                ? `${hearing.requesterName} הגיש/ה ראיות חדשות בתאריך ${submittedDate}. תגובתך תילקח בחשבון בפסיקה המחודשת.`
                : `${hearing.requesterName} submitted new evidence on ${submittedDate}. Your response will be considered in the revised decision.`}
            </p>
          </div>

          {/* Original finding */}
          {hearing.originalFinding && (
            <div className="mb-10">
              <p className="text-xs tracking-[0.25em] uppercase mb-3"
                style={{ color: "var(--ra-gold-700)", fontFamily: "var(--font-sans)" }}>
                {nh.respondOriginalFindingLabel}
              </p>
              <div className="p-6 border-s-4"
                style={{ borderColor: "hsl(215 45% 55%)", backgroundColor: "white" }}>
                <p className="text-base italic leading-relaxed"
                  style={{ color: "hsl(215 20% 28%)", fontFamily: "var(--font-display)" }}>
                  {hearing.originalFinding}
                </p>
              </div>
            </div>
          )}

          {/* New evidence block */}
          <div className="mb-10">
            <p className="text-xs tracking-[0.25em] uppercase mb-3"
              style={{ color: "var(--ra-gold-700)", fontFamily: "var(--font-sans)" }}>
              {nh.respondNewEvidenceLabel}
            </p>
            <div className="p-6 border"
              style={{ borderColor: "var(--ra-gold-200)", backgroundColor: "white" }}>
              <p className="text-xs tracking-[0.1em] uppercase mb-3"
                style={{ color: "hsl(215 20% 55%)", fontFamily: "var(--font-sans)" }}>
                {lang === "he" ? "הוגש על ידי" : "Submitted by"}: {hearing.requesterName}
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: "hsl(215 20% 28%)", fontFamily: "var(--font-sans)" }}>
                {hearing.newEvidence}
              </p>
              {hearing.newDocSummary && (
                <div className="mt-4 pt-4 border-t"
                  style={{ borderColor: "var(--ra-gold-100)" }}>
                  <p className="text-xs tracking-[0.1em] uppercase mb-2"
                    style={{ color: "hsl(215 20% 55%)", fontFamily: "var(--font-sans)" }}>
                    {lang === "he" ? "סיכום מסמכים שהוגשו" : "Submitted Document Summary"}
                  </p>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap"
                    style={{ color: "hsl(215 20% 40%)", fontFamily: "var(--font-sans)" }}>
                    {hearing.newDocSummary}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t mb-10"
            style={{ borderColor: "var(--ra-gold-100)" }} aria-hidden="true" />

          {/* Response form */}
          <div className="mb-6">
            <label
              className="block text-xs tracking-[0.15em] uppercase mb-2 font-medium"
              style={{ color: "hsl(215 30% 38%)", fontFamily: "var(--font-sans)" }}
            >
              {nh.respondYourResponse}
            </label>
            <textarea
              rows={10}
              value={counterEvidence}
              onChange={(e) => setCounterEvidence(e.target.value)}
              placeholder={nh.respondYourResponsePlaceholder}
              style={{ ...inputStyle, resize: "vertical", minHeight: "200px" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ra-gold-500)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--ra-gold-300)")}
            />
            {fieldError && (
              <p className="text-xs mt-1.5"
                style={{ color: "hsl(0 65% 48%)", fontFamily: "var(--font-sans)" }}>
                {fieldError}
              </p>
            )}
          </div>

          {/* Document upload */}
          <div className="mb-8">
            <label
              className="block text-xs tracking-[0.15em] uppercase mb-2 font-medium"
              style={{ color: "hsl(215 30% 38%)", fontFamily: "var(--font-sans)" }}
            >
              {nh.docsLabel}
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => {
                const selected = Array.from(e.target.files || []);
                setDocFiles((prev) => {
                  const existing = prev.map((f) => f.name);
                  return [...prev, ...selected.filter((f) => !existing.includes(f.name))];
                });
                e.target.value = "";
              }}
              style={{ ...inputStyle, padding: "0.5rem 1rem" }}
            />
            {docFiles.length > 0 && (
              <ul className="mt-2 space-y-1">
                {docFiles.map((f, i) => (
                  <li key={i}
                    className="flex items-center justify-between text-xs px-3 py-1.5"
                    style={{
                      backgroundColor: "hsl(42 55% 96%)",
                      border: "1px solid var(--ra-gold-100)",
                      fontFamily: "var(--font-sans)",
                      color: "hsl(215 20% 38%)",
                    }}
                  >
                    <span>{f.name}</span>
                    <button type="button"
                      onClick={() => setDocFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      style={{ color: "hsl(0 55% 50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="p-4 mb-6 border-s-4"
              style={{ borderColor: "hsl(0 55% 45%)", backgroundColor: "hsl(0 55% 97%)" }}>
              <p className="text-sm" style={{ color: "hsl(0 55% 35%)", fontFamily: "var(--font-sans)" }}>
                {submitError}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => submit(false)}
              disabled={isSubmitting}
              className="flex-1 py-5 text-sm tracking-[0.18em] uppercase font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isSubmitting ? "var(--ra-navy-700)" : "var(--ra-navy-800)",
                color: "var(--ra-cream-50)",
                fontFamily: "var(--font-sans)",
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--ra-navy-900)"; }}
              onMouseLeave={(e) => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--ra-navy-800)"; }}
            >
              {isSubmitting ? nh.respondSubmitting : nh.respondSubmit}
            </button>

            <button
              onClick={() => submit(true)}
              disabled={isSubmitting}
              className="px-6 py-5 text-xs tracking-[0.15em] uppercase border transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                borderColor: "var(--ra-gold-300)",
                color: "hsl(215 30% 38%)",
                fontFamily: "var(--font-sans)",
                backgroundColor: "transparent",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--ra-gold-100)"; }}
              onMouseLeave={(e) => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              {nh.respondSkip}
            </button>
          </div>

        </div>
      </main>

      <RaFooter />
    </>
  );
}
