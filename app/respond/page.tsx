"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RaHeader } from "@/components/ra-header";
import { RaFooter } from "@/components/ra-footer";
import { useLanguage } from "@/lib/lang-context";

/** Add N business days (Mon–Fri) to a date, skipping Israeli public holidays */
const ISRAELI_HOLIDAYS_2025_2026 = [
  "2025-04-13", "2025-04-14", "2025-04-20", "2025-04-21",
  "2025-05-01", "2025-06-01", "2025-06-02",
  "2025-09-22", "2025-09-23", "2025-09-29", "2025-09-30",
  "2025-10-01", "2025-10-02", "2025-10-07", "2025-10-14",
  "2026-04-01", "2026-04-02", "2026-04-08", "2026-04-09",
  "2026-05-21", "2026-05-22",
  "2026-09-11", "2026-09-12", "2026-09-18", "2026-09-19",
  "2026-09-20", "2026-09-21", "2026-09-27", "2026-10-03",
];

function addBusinessDays(start: Date, days: number): Date {
  const result = new Date(start);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay(); // 0=Sun,6=Sat
    const iso = result.toISOString().slice(0, 10);
    // Skip Friday (5), Saturday (6), and Israeli holidays
    if (dayOfWeek !== 5 && dayOfWeek !== 6 && !ISRAELI_HOLIDAYS_2025_2026.includes(iso)) {
      added++;
    }
  }
  return result;
}

function formatDate(date: Date, lang: string): string {
  return date.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

interface CaseData {
  caseId: string;
  caseTitle: string;
  partyOneName: string;
  partyOneEmail: string;
  partyTwoName: string;
  partyTwoEmail: string;
  partyTwoPhone: string;
  category: string;
  description: string;
  lang: string;
  submittedAt: string;
}

const CATEGORY_LABELS: Record<string, { he: string; en: string }> = {
  business:   { he: "מסחרי ועסקי",    en: "Commercial & Business" },
  property:   { he: 'נדל"ן ורכוש',    en: "Real Estate & Property" },
  financial:  { he: "פיננסי וכספי",   en: "Financial" },
  employment: { he: "עבודה ותעסוקה",  en: "Employment" },
  contract:   { he: "הפרת חוזה",      en: "Contract Breach" },
  other:      { he: "אחר",            en: "Other" },
};

function getCategoryLabel(value: string, lang: string): string {
  const entry = CATEGORY_LABELS[value];
  if (!entry) return value;
  return lang === "he" ? entry.he : entry.en;
}

function RespondContent() {
  const { t, lang } = useLanguage();
  const r = t.respond;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [parseError, setParseError] = useState(false);
  const [response, setResponse] = useState("");
  const [defendantEmail, setDefendantEmail] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [requestingOneSided, setRequestingOneSided] = useState(false);

  const inputStyle = {
    backgroundColor: "hsl(0 0% 100%)",
    border: "1px solid var(--ra-gold-300)",
    color: "var(--ra-navy-900)",
    fontFamily: "var(--font-sans)",
    fontSize: "0.9rem",
    padding: "0.75rem 1rem",
    width: "100%",
    outline: "none",
  };

  useEffect(() => {
    const token = searchParams.get("c");
    if (!token) { setParseError(true); return; }
    try {
      // Decode base64url → binary → UTF-8 (handles Hebrew correctly in browser)
      const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "==".slice((base64.length % 4) || 2);
      const binary = atob(padded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const decoded = new TextDecoder("utf-8").decode(bytes);
      const data = JSON.parse(decoded) as CaseData;
      setCaseData(data);
      const dl = addBusinessDays(new Date(data.submittedAt), 14);
      setDeadline(dl);
      setIsExpired(new Date() > dl);
    } catch {
      setParseError(true);
    }
  }, [searchParams]);

  async function requestOneSidedVerdict() {
    if (!caseData) return;
    setRequestingOneSided(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: caseData.caseId,
          caseTitle: caseData.caseTitle,
          partyOneName: caseData.partyOneName,
          partyOneEmail: caseData.partyOneEmail,
          partyTwoName: caseData.partyTwoName,
          partyTwoEmail: caseData.partyTwoEmail,
          category: caseData.category,
          description: caseData.description,
          // no defendantResponse → heardBothSides = false
          lang: caseData.lang || lang,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const verdict = await res.json();
      sessionStorage.setItem("ra-verdict", JSON.stringify(verdict));
      router.push("/verdict");
    } catch {
      setFieldError(lang === "he" ? "אירעה שגיאה. אנא נסו שנית." : "An error occurred. Please try again.");
      setRequestingOneSided(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!caseData) return;

    if (response.trim().length < 30) {
      setFieldError(r.errorRequired);
      return;
    }
    setFieldError("");
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("caseId", caseData.caseId);
      fd.append("caseTitle", caseData.caseTitle);
      fd.append("partyOneName", caseData.partyOneName);
      fd.append("partyOneEmail", caseData.partyOneEmail);
      fd.append("partyTwoName", caseData.partyTwoName);
      fd.append("partyTwoEmail", defendantEmail || caseData.partyTwoEmail || "");
      fd.append("category", caseData.category);
      fd.append("description", caseData.description);
      fd.append("defendantResponse", response);
      fd.append("lang", caseData.lang || lang);
      if (docFile) fd.append("document", docFile);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("API error");

      const verdict = await res.json();
      sessionStorage.setItem("ra-verdict", JSON.stringify(verdict));
      router.push("/verdict");
    } catch {
      setFieldError("אירעה שגיאה. אנא נסו שנית.");
      setIsSubmitting(false);
    }
  }

  if (parseError) {
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
              className="text-2xl font-light mb-4"
              style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}
            >
              {r.errorInvalid}
            </h1>
          </div>
        </main>
        <RaFooter />
      </>
    );
  }

  if (!caseData) {
    return (
      <>
        <RaHeader />
        <main
          className="flex-1 flex items-center justify-center min-h-[60vh]"
          style={{ backgroundColor: "var(--ra-cream-50)" }}
        >
          <p style={{ color: "hsl(215 20% 45%)", fontFamily: "var(--font-sans)" }}>...</p>
        </main>
        <RaFooter />
      </>
    );
  }

  return (
    <>
      <RaHeader />

      <main className="flex-1">
        {/* Page Header */}
        <div
          className="py-16 border-b"
          style={{
            backgroundColor: "var(--ra-navy-900)",
            borderColor: "hsl(215 45% 18%)",
          }}
        >
          <div className="max-w-3xl mx-auto px-6">
            <div className="mb-4">
              <p
                className="text-xs tracking-[0.25em] uppercase"
                style={{ color: "var(--ra-gold-300)", fontFamily: "var(--font-sans)" }}
              >
                {lang === "he" ? "תיק מספר" : "Case No."} {caseData.caseId}
              </p>
            </div>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-light mt-3 mb-4"
              style={{ color: "var(--ra-cream-50)", fontFamily: "var(--font-display)" }}
            >
              {r.pageTitle}
            </h1>
            <p
              className="text-base leading-relaxed max-w-xl"
              style={{ color: "hsl(40 28% 70%)", fontFamily: "var(--font-sans)" }}
            >
              {r.pageSubtitle}
            </p>
          </div>
        </div>

        <div className="py-16" style={{ backgroundColor: "var(--ra-cream-50)" }}>
          <div className="max-w-3xl mx-auto px-6">

            {/* Notice banner — active or expired */}
            {isExpired ? (
              <div
                className="p-6 mb-12 border-s-4"
                style={{
                  borderColor: "hsl(0 55% 45%)",
                  backgroundColor: "hsl(0 55% 97%)",
                }}
              >
                <p
                  className="text-sm font-semibold mb-2"
                  style={{ color: "hsl(0 55% 35%)", fontFamily: "var(--font-sans)" }}
                >
                  {lang === "he"
                    ? "המועד האחרון להגשת עמדת הנתבע חלף"
                    : "The deadline for the respondent's submission has passed"}
                </p>
                <p
                  className="text-sm leading-relaxed mb-5"
                  style={{ color: "hsl(215 20% 38%)", fontFamily: "var(--font-sans)" }}
                >
                  {lang === "he"
                    ? `14 ימי העסקים שניתנו לנתבע להגשת עמדתו חלפו. ניתן לבקש פסיקה בהיעדר עמדת הנתבע, או לאפשר לנתבע להגיש עמדה מאוחרת.`
                    : `The 14 business days granted for the respondent's submission have passed. You may request a decision in the respondent's absence, or allow a late submission.`}
                </p>
                <button
                  onClick={requestOneSidedVerdict}
                  disabled={requestingOneSided}
                  className="px-6 py-3 text-xs tracking-[0.18em] uppercase font-semibold transition-colors disabled:opacity-60"
                  style={{
                    backgroundColor: requestingOneSided ? "hsl(215 45% 35%)" : "var(--ra-navy-800)",
                    color: "var(--ra-cream-50)",
                    fontFamily: "var(--font-sans)",
                    border: "none",
                    cursor: requestingOneSided ? "not-allowed" : "pointer",
                  }}
                >
                  {requestingOneSided
                    ? (lang === "he" ? "מנתח..." : "Analyzing...")
                    : (lang === "he" ? "בקש פסיקה בהיעדר נתבע" : "Request Decision Without Respondent")}
                </button>
              </div>
            ) : (
              <div
                className="p-6 mb-8 border-s-4"
                style={{
                  borderColor: "var(--ra-gold-500)",
                  backgroundColor: "hsl(42 55% 96%)",
                }}
              >
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-sans)" }}
                >
                  {r.noticeTitle}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "hsl(215 20% 38%)", fontFamily: "var(--font-sans)" }}
                >
                  {r.noticeBody}
                </p>
                {deadline && (
                  <p
                    className="text-xs mt-3"
                    style={{ color: "hsl(215 20% 48%)", fontFamily: "var(--font-sans)" }}
                  >
                    {lang === "he"
                      ? `מועד אחרון להגשה: ${formatDate(deadline, lang)}`
                      : `Submission deadline: ${formatDate(deadline, lang)}`}
                  </p>
                )}
              </div>
            )}

            {/* Claim details */}
            <div className="mb-12">
              <p
                className="text-xs tracking-[0.25em] uppercase mb-6"
                style={{ color: "var(--ra-gold-500)", fontFamily: "var(--font-sans)" }}
              >
                {r.claimSection}
              </p>

              <div
                className="p-8 border mb-6"
                style={{
                  borderColor: "var(--ra-gold-100)",
                  backgroundColor: "white",
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p
                      className="text-xs tracking-[0.15em] uppercase mb-1"
                      style={{ color: "hsl(215 20% 48%)", fontFamily: "var(--font-sans)" }}
                    >
                      {r.claimant}
                    </p>
                    <p
                      className="text-base"
                      style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-sans)" }}
                    >
                      {caseData.partyOneName}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs tracking-[0.15em] uppercase mb-1"
                      style={{ color: "hsl(215 20% 48%)", fontFamily: "var(--font-sans)" }}
                    >
                      {r.respondent}
                    </p>
                    <p
                      className="text-base"
                      style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-sans)" }}
                    >
                      {caseData.partyTwoName}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p
                    className="text-xs tracking-[0.15em] uppercase mb-1"
                    style={{ color: "hsl(215 20% 48%)", fontFamily: "var(--font-sans)" }}
                  >
                    {r.category}
                  </p>
                  <p
                    className="text-base"
                    style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-sans)" }}
                  >
                    {getCategoryLabel(caseData.category, lang)}
                  </p>
                </div>

                <div
                  className="border-t pt-6"
                  style={{ borderColor: "var(--ra-gold-100)" }}
                >
                  <p
                    className="text-xs tracking-[0.15em] uppercase mb-3"
                    style={{ color: "hsl(215 20% 48%)", fontFamily: "var(--font-sans)" }}
                  >
                    {r.claimDescription}
                  </p>
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: "hsl(215 20% 28%)", fontFamily: "var(--font-sans)" }}
                  >
                    {caseData.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              className="border-t mb-12"
              style={{ borderColor: "var(--ra-gold-100)" }}
              aria-hidden="true"
            />

            {/* Defendant response form */}
            <form onSubmit={onSubmit} noValidate>
              <div className="mb-6">
                <p
                  className="text-xs tracking-[0.25em] uppercase mb-6"
                  style={{ color: "var(--ra-gold-500)", fontFamily: "var(--font-sans)" }}
                >
                  {r.responseSection}
                </p>
                <label
                  className="block text-xs tracking-[0.15em] uppercase mb-2 font-medium"
                  style={{ color: "hsl(215 30% 38%)", fontFamily: "var(--font-sans)" }}
                >
                  {lang === "he" ? "כתובת המייל שלך (לקבלת הפסיקה)" : "Your email (to receive the ruling)"}
                  <span style={{ color: "var(--ra-gold-700)" }} className="ms-1">*</span>
                </label>
                <input
                  type="email"
                  value={defendantEmail}
                  onChange={e => setDefendantEmail(e.target.value)}
                  placeholder={lang === "he" ? "your@email.com" : "your@email.com"}
                  style={{ ...inputStyle, marginBottom: "24px" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--ra-gold-500)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "var(--ra-gold-300)")}
                />
                {/* Document upload */}
                <div className="mb-6">
                  <p
                    className="text-xs font-bold mb-2"
                    style={{ color: "hsl(0 65% 45%)", fontFamily: "var(--font-sans)" }}
                  >
                    {lang === "he"
                      ? "העלאת מסמכים תשפר משמעותית את הפסיקה — ללא מסמכים, הבורר יפסוק על בסיס הטענות בלבד."
                      : "Uploading documents will significantly improve the ruling — without documents, the arbitrator will decide based on claims alone."}
                  </p>
                  <label
                    className="block text-xs tracking-[0.15em] uppercase mb-2 font-medium"
                    style={{ color: "hsl(215 30% 38%)", fontFamily: "var(--font-sans)" }}
                  >
                    {lang === "he" ? "מסמכים רלוונטיים (PDF, JPG, PNG)" : "Relevant Documents (PDF, JPG, PNG)"}
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setDocFile(e.target.files?.[0] || null)}
                    style={{ ...inputStyle, padding: "0.5rem 1rem" }}
                  />
                  {docFile && (
                    <p className="text-xs mt-1" style={{ color: "hsl(215 20% 48%)", fontFamily: "var(--font-sans)" }}>
                      {docFile.name}
                    </p>
                  )}
                </div>

                <label
                  className="block text-xs tracking-[0.15em] uppercase mb-2 font-medium"
                  style={{ color: "hsl(215 30% 38%)", fontFamily: "var(--font-sans)" }}
                >
                  {r.responseLabel}
                  <span style={{ color: "var(--ra-gold-700)" }} className="ms-1">*</span>
                </label>
                <textarea
                  rows={10}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder={r.responsePlaceholder}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: "220px",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--ra-gold-500)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--ra-gold-300)")
                  }
                />
                {fieldError && (
                  <p
                    className="text-xs mt-1.5"
                    style={{ color: "hsl(0 65% 48%)", fontFamily: "var(--font-sans)" }}
                  >
                    {fieldError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-8 py-5 text-sm tracking-[0.2em] uppercase font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isSubmitting
                    ? "var(--ra-navy-700)"
                    : "var(--ra-navy-800)",
                  color: "var(--ra-cream-50)",
                  fontFamily: "var(--font-sans)",
                  border: "none",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting)
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--ra-navy-900)";
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting)
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--ra-navy-800)";
                }}
              >
                {isSubmitting ? r.submitting : r.submit}
              </button>
            </form>

          </div>
        </div>
      </main>

      <RaFooter />
    </>
  );
}

export default function RespondPage() {
  return (
    <Suspense fallback={null}>
      <RespondContent />
    </Suspense>
  );
}
