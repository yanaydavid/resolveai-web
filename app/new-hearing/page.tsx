"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { RaHeader } from "@/components/ra-header";
import { RaFooter } from "@/components/ra-footer";
import { useLanguage } from "@/lib/lang-context";

interface VerdictSnapshot {
  caseId: string;
  caseTitle: string;
  partyOneName: string;
  partyTwoName: string;
  finding: string;
  summary: string;
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

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-xs mt-1.5" style={{ color: "hsl(0 65% 48%)", fontFamily: "var(--font-sans)" }}>
      {msg}
    </p>
  );
}

function NewHearingContent() {
  const { t, lang } = useLanguage();
  const nh = t.newHearing;
  const searchParams = useSearchParams();

  const [snapshot, setSnapshot] = useState<VerdictSnapshot | null>(null);
  const [caseId, setCaseId] = useState("");
  const [role, setRole] = useState<"claimant" | "respondent" | "">("");
  const [yourName, setYourName] = useState("");
  const [yourEmail, setYourEmail] = useState("");
  const [otherPartyPhone, setOtherPartyPhone] = useState("");
  const [newEvidence, setNewEvidence] = useState("");
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hearingId, setHearingId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Pre-fill from sessionStorage verdict
    try {
      const raw = sessionStorage.getItem("ra-verdict");
      if (raw) {
        const data = JSON.parse(raw) as VerdictSnapshot;
        setSnapshot(data);
        setCaseId(data.caseId);
      }
    } catch { /* ignore */ }

    // URL param overrides sessionStorage caseId
    const urlId = searchParams.get("caseId");
    if (urlId) setCaseId(urlId);
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!caseId.trim()) newErrors.caseId = nh.errorRequired;
    if (!role) newErrors.role = nh.errorRequired;
    if (!yourName.trim()) newErrors.yourName = nh.errorRequired;
    if (!yourEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(yourEmail))
      newErrors.yourEmail = nh.errorRequired;
    if (newEvidence.trim().length < 50) newErrors.newEvidence = nh.errorMinLength;
    if (!agreed) newErrors.agreed = nh.errorRequired;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("caseId", caseId.trim());
      fd.append("requestedBy", role);
      fd.append("requesterName", yourName.trim());
      fd.append("requesterEmail", yourEmail.trim());
      fd.append("otherPartyPhone", otherPartyPhone.trim());
      fd.append("newEvidence", newEvidence.trim());
      if (snapshot) {
        fd.append("originalFinding", snapshot.finding || "");
        fd.append("originalSummary", snapshot.summary || "");
        fd.append("caseTitle", snapshot.caseTitle || "");
        fd.append("partyOneName", snapshot.partyOneName || "");
        fd.append("partyTwoName", snapshot.partyTwoName || "");
      }
      docFiles.forEach((f) => fd.append("documents", f));

      const res = await fetch("/api/new-hearing/submit", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setHearingId(data.hearingId);
      setSubmitted(true);
    } catch {
      setErrors({ submit: nh.errorSubmit });
      setIsSubmitting(false);
    }
  }

  // ── Success state ─────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <RaHeader />
        <main
          className="flex-1 flex items-center justify-center min-h-[70vh] py-20"
          style={{ backgroundColor: "var(--ra-cream-50)" }}
        >
          <div className="max-w-lg mx-auto px-6 text-center">
            <span className="gold-rule block w-16 mx-auto mb-10" aria-hidden="true" />
            <h1
              className="text-2xl md:text-3xl font-light mb-6"
              style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}
            >
              {nh.successTitle}
            </h1>
            <p
              className="text-base leading-relaxed mb-8"
              style={{ color: "hsl(215 20% 38%)", fontFamily: "var(--font-sans)" }}
            >
              {nh.successBody}
            </p>
            <div
              className="p-5 mb-6 border-s-4 text-start"
              style={{ borderColor: "var(--ra-gold-500)", backgroundColor: "hsl(42 55% 96%)" }}
            >
              <p className="text-xs tracking-[0.15em] uppercase mb-1"
                style={{ color: "hsl(215 20% 48%)", fontFamily: "var(--font-sans)" }}>
                {nh.successHearingId}
              </p>
              <p className="text-base font-semibold"
                style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-sans)" }}>
                {hearingId}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link
                href={`/new-hearing/status/${hearingId}`}
                className="inline-block px-8 py-4 text-xs tracking-[0.15em] uppercase font-semibold border"
                style={{
                  borderColor: "var(--ra-gold-400)",
                  color: "var(--ra-navy-900)",
                  fontFamily: "var(--font-sans)",
                  backgroundColor: "transparent",
                }}
              >
                {nh.statusViewLink}
              </Link>
              <Link
                href="/"
                className="inline-block px-8 py-4 text-xs tracking-[0.15em] uppercase font-semibold"
                style={{
                  backgroundColor: "var(--ra-navy-800)",
                  color: "var(--ra-cream-50)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {nh.backToHome}
              </Link>
            </div>
          </div>
        </main>
        <RaFooter />
      </>
    );
  }

  // ── Determine party names for role options ─────────────────────
  const partyOneName = snapshot?.partyOneName || (lang === "he" ? "צד א (תובע/ת)" : "Party A (Claimant)");
  const partyTwoName = snapshot?.partyTwoName || (lang === "he" ? "צד ב (נתבע/ת)" : "Party B (Respondent)");

  return (
    <>
      <RaHeader />

      {/* Page header */}
      <div
        className="py-16 border-b"
        style={{ backgroundColor: "var(--ra-navy-950)", borderColor: "hsl(215 45% 18%)" }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <p
            className="text-xs tracking-[0.25em] uppercase mb-4"
            style={{ color: "var(--ra-gold-300)", fontFamily: "var(--font-sans)" }}
          >
            {caseId
              ? `${lang === "he" ? "תיק מספר" : "Case No."} ${caseId}`
              : (lang === "he" ? "דיון נוסף" : "New Hearing")}
          </p>
          <h1
            className="text-3xl md:text-4xl font-light mb-4"
            style={{ color: "var(--ra-cream-50)", fontFamily: "var(--font-display)" }}
          >
            {nh.pageTitle}
          </h1>
          <p
            className="text-base leading-relaxed max-w-xl"
            style={{ color: "hsl(40 28% 70%)", fontFamily: "var(--font-sans)" }}
          >
            {nh.pageSubtitle}
          </p>
        </div>
      </div>

      <main className="flex-1 py-16" style={{ backgroundColor: "var(--ra-cream-50)" }}>
        <div className="max-w-3xl mx-auto px-6">

          {/* Beta notice */}
          <div
            className="p-5 mb-10 border-s-4"
            style={{ borderColor: "var(--ra-gold-500)", backgroundColor: "hsl(42 55% 96%)" }}
          >
            <p className="text-sm font-semibold"
              style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-sans)" }}>
              ✨ {nh.betaNotice}
            </p>
          </div>

          {/* Original finding (if available) */}
          {snapshot?.finding && (
            <div className="mb-10">
              <p
                className="text-xs tracking-[0.25em] uppercase mb-3"
                style={{ color: "var(--ra-gold-700)", fontFamily: "var(--font-sans)" }}
              >
                {nh.originalVerdictLabel}
              </p>
              <div
                className="p-6 border-s-4"
                style={{ borderColor: "hsl(215 45% 55%)", backgroundColor: "white", borderLeft: lang === "he" ? undefined : "4px solid hsl(215 45% 55%)" }}
              >
                <p
                  className="text-base italic leading-relaxed"
                  style={{ color: "hsl(215 20% 28%)", fontFamily: "var(--font-display)" }}
                >
                  {snapshot.finding}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} noValidate>

            {/* Case ID */}
            <div className="mb-6">
              <label
                className="block text-xs tracking-[0.15em] uppercase mb-2 font-medium"
                style={{ color: "hsl(215 30% 38%)", fontFamily: "var(--font-sans)" }}
              >
                {nh.caseIdLabel}
                <span style={{ color: "var(--ra-gold-700)" }} className="ms-1">*</span>
              </label>
              <input
                type="text"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                placeholder={nh.caseIdPlaceholder}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ra-gold-500)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--ra-gold-300)")}
              />
              <FieldError msg={errors.caseId} />
            </div>

            {/* Role */}
            <div className="mb-8">
              <p
                className="text-xs tracking-[0.15em] uppercase mb-3 font-medium"
                style={{ color: "hsl(215 30% 38%)", fontFamily: "var(--font-sans)" }}
              >
                {nh.roleLabel}
                <span style={{ color: "var(--ra-gold-700)" }} className="ms-1">*</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {(["claimant", "respondent"] as const).map((r) => {
                  const label = r === "claimant" ? partyOneName : partyTwoName;
                  const sublabel = r === "claimant"
                    ? (lang === "he" ? "צד א — תובע/ת" : "Party A — Claimant")
                    : (lang === "he" ? "צד ב — נתבע/ת" : "Party B — Respondent");
                  const isSelected = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className="flex-1 p-4 border text-start transition-all"
                      style={{
                        borderColor: isSelected ? "var(--ra-gold-500)" : "var(--ra-gold-200)",
                        backgroundColor: isSelected ? "hsl(42 55% 96%)" : "white",
                        fontFamily: "var(--font-sans)",
                        cursor: "pointer",
                      }}
                    >
                      <p className="text-xs tracking-[0.1em] uppercase mb-1"
                        style={{ color: isSelected ? "var(--ra-gold-700)" : "hsl(215 20% 55%)" }}>
                        {sublabel}
                      </p>
                      <p className="text-sm font-semibold"
                        style={{ color: "var(--ra-navy-900)" }}>
                        {label}
                      </p>
                    </button>
                  );
                })}
              </div>
              <FieldError msg={errors.role} />
            </div>

            {/* Your details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label
                  className="block text-xs tracking-[0.15em] uppercase mb-2 font-medium"
                  style={{ color: "hsl(215 30% 38%)", fontFamily: "var(--font-sans)" }}
                >
                  {nh.yourName}
                  <span style={{ color: "var(--ra-gold-700)" }} className="ms-1">*</span>
                </label>
                <input
                  type="text"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  placeholder={nh.yourNamePlaceholder}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ra-gold-500)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--ra-gold-300)")}
                />
                <FieldError msg={errors.yourName} />
              </div>
              <div>
                <label
                  className="block text-xs tracking-[0.15em] uppercase mb-2 font-medium"
                  style={{ color: "hsl(215 30% 38%)", fontFamily: "var(--font-sans)" }}
                >
                  {nh.yourEmail}
                  <span style={{ color: "var(--ra-gold-700)" }} className="ms-1">*</span>
                </label>
                <input
                  type="email"
                  value={yourEmail}
                  onChange={(e) => setYourEmail(e.target.value)}
                  placeholder={nh.yourEmailPlaceholder}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ra-gold-500)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--ra-gold-300)")}
                />
                <FieldError msg={errors.yourEmail} />
              </div>
            </div>

            {/* Other party phone */}
            <div className="mb-8">
              <label
                className="block text-xs tracking-[0.15em] uppercase mb-2 font-medium"
                style={{ color: "hsl(215 30% 38%)", fontFamily: "var(--font-sans)" }}
              >
                {nh.otherPartyPhone}
              </label>
              <input
                type="tel"
                value={otherPartyPhone}
                onChange={(e) => setOtherPartyPhone(e.target.value)}
                placeholder={nh.otherPartyPhonePlaceholder}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ra-gold-500)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--ra-gold-300)")}
              />
              <p className="text-xs mt-1.5"
                style={{ color: "hsl(215 20% 55%)", fontFamily: "var(--font-sans)" }}>
                {nh.otherPartyPhoneNote}
              </p>
            </div>

            <div
              className="border-t mb-8"
              style={{ borderColor: "var(--ra-gold-100)" }}
              aria-hidden="true"
            />

            {/* New Evidence */}
            <div className="mb-6">
              <label
                className="block text-xs tracking-[0.15em] uppercase mb-2 font-medium"
                style={{ color: "hsl(215 30% 38%)", fontFamily: "var(--font-sans)" }}
              >
                {nh.newEvidenceLabel}
                <span style={{ color: "var(--ra-gold-700)" }} className="ms-1">*</span>
              </label>
              <textarea
                rows={10}
                value={newEvidence}
                onChange={(e) => setNewEvidence(e.target.value)}
                placeholder={nh.newEvidencePlaceholder}
                style={{ ...inputStyle, resize: "vertical", minHeight: "200px" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ra-gold-500)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--ra-gold-300)")}
              />
              <p className="text-xs mt-1.5"
                style={{ color: "hsl(215 20% 55%)", fontFamily: "var(--font-sans)" }}>
                {nh.newEvidenceNote}
              </p>
              <FieldError msg={errors.newEvidence} />
            </div>

            {/* Document upload */}
            <div className="mb-8">
              <label
                className="block text-xs tracking-[0.15em] uppercase mb-2 font-medium"
                style={{ color: "hsl(215 30% 38%)", fontFamily: "var(--font-sans)" }}
              >
                {nh.docsLabel}
              </label>
              <p className="text-xs mb-2"
                style={{ color: "hsl(215 20% 55%)", fontFamily: "var(--font-sans)" }}>
                {nh.docsNote}
              </p>
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
                      <button
                        type="button"
                        onClick={() => setDocFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        style={{ color: "hsl(0 55% 50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Terms agreement */}
            <div className="mb-8">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 shrink-0"
                  style={{ accentColor: "var(--ra-gold-500)", width: "16px", height: "16px" }}
                />
                <span className="text-sm leading-relaxed"
                  style={{ color: "hsl(215 20% 38%)", fontFamily: "var(--font-sans)" }}>
                  {nh.termsNote}{" "}
                  <Link href="/terms#s11b"
                    className="underline"
                    style={{ color: "var(--ra-gold-700)" }}
                    target="_blank">
                    ({lang === "he" ? "לתנאי השימוש" : "Terms of Service"})
                  </Link>
                </span>
              </label>
              <FieldError msg={errors.agreed} />
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div
                className="p-4 mb-6 border-s-4"
                style={{ borderColor: "hsl(0 55% 45%)", backgroundColor: "hsl(0 55% 97%)" }}
              >
                <p className="text-sm"
                  style={{ color: "hsl(0 55% 35%)", fontFamily: "var(--font-sans)" }}>
                  {errors.submit}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 text-sm tracking-[0.2em] uppercase font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isSubmitting ? "var(--ra-navy-700)" : "var(--ra-navy-800)",
                color: "var(--ra-cream-50)",
                fontFamily: "var(--font-sans)",
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--ra-navy-900)";
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--ra-navy-800)";
              }}
            >
              {isSubmitting ? nh.submitting : nh.submit}
            </button>
          </form>
        </div>
      </main>

      <RaFooter />
    </>
  );
}

export default function NewHearingPage() {
  return (
    <Suspense fallback={null}>
      <NewHearingContent />
    </Suspense>
  );
}
