"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RaHeader } from "@/components/ra-header";
import { RaFooter } from "@/components/ra-footer";
import { useLanguage } from "@/lib/lang-context";

// ── Israeli business day helpers ─────────────────────────────────────────────

// Key Israeli public holidays 2024–2027 (YYYY-MM-DD, Israel-time)
const IL_HOLIDAYS = new Set([
  // 2024
  "2024-10-02", "2024-10-03", // Rosh Hashana
  "2024-10-11", "2024-10-12", // Yom Kippur
  "2024-10-16", "2024-10-17", // Sukkot
  "2024-10-23", "2024-10-24", // Shemini Atzeret
  // 2025
  "2025-04-12", "2025-04-13", "2025-04-18", "2025-04-19", // Passover
  "2025-06-02",               // Shavuot
  "2025-09-22", "2025-09-23", // Rosh Hashana
  "2025-10-01", "2025-10-02", // Yom Kippur
  "2025-10-06", "2025-10-07", "2025-10-13", "2025-10-14", // Sukkot
  // 2026
  "2026-03-31", "2026-04-01", "2026-04-06", "2026-04-07", // Passover
  "2026-05-20",               // Shavuot
  "2026-09-11", "2026-09-12", // Rosh Hashana
  "2026-09-20", "2026-09-21", // Yom Kippur
  "2026-09-25", "2026-09-26", "2026-10-02", "2026-10-03", // Sukkot
]);

function isILBusinessDay(d: Date): boolean {
  const day = d.getDay(); // 0=Sun … 6=Sat
  if (day === 5 || day === 6) return false; // Fri / Sat
  const iso = d.toISOString().split("T")[0];
  return !IL_HOLIDAYS.has(iso);
}

/** Count Israeli business days that have *fully elapsed* since `from`. */
function businessDaysSince(from: Date): number {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let count = 0;
  const cur = new Date(start);
  while (cur < today) {
    cur.setDate(cur.getDate() + 1);
    if (isILBusinessDay(cur)) count++;
  }
  return count;
}

interface HearingData {
  hearingId: string;
  caseId: string;
  caseTitle: string;
  requesterName: string;
  otherPartyName: string;
  newEvidence: string;
  newDocSummary: string;
  originalFinding: string;
  status: "awaiting_response" | "response_received" | "verdict_issued";
  submittedAt: string;
}

export default function HearingStatusPage() {
  const { t, lang } = useLanguage();
  const nh = t.newHearing;
  const { hearingId } = useParams<{ hearingId: string }>();

  const [hearing, setHearing] = useState<HearingData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const [requesting, setRequesting] = useState(false);
  const [oneSidedDone, setOneSidedDone] = useState(false);
  const [oneSidedError, setOneSidedError] = useState("");

  useEffect(() => {
    if (!hearingId) return;
    fetch(`/api/new-hearing/status?id=${hearingId}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setLoadError(err.error || nh.statusNotFound);
        } else {
          setHearing(await res.json());
        }
      })
      .catch(() => setLoadError(nh.statusNotFound))
      .finally(() => setLoading(false));
  }, [hearingId, nh.statusNotFound]);

  async function requestOneSided() {
    if (!hearing) return;
    setRequesting(true);
    setOneSidedError("");
    try {
      const res = await fetch("/api/new-hearing/one-sided", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hearingId: hearing.hearingId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "API error");
      }
      setOneSidedDone(true);
      setHearing((prev) => prev ? { ...prev, status: "verdict_issued" } : prev);
    } catch (err: unknown) {
      setOneSidedError(
        err instanceof Error ? err.message : (lang === "he" ? "אירעה שגיאה. נסו שנית." : "An error occurred. Try again.")
      );
    } finally {
      setRequesting(false);
    }
  }

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <RaHeader />
        <main className="flex-1 flex items-center justify-center min-h-[60vh]"
          style={{ backgroundColor: "var(--ra-cream-50)" }}>
          <p style={{ color: "hsl(215 20% 45%)", fontFamily: "var(--font-sans)" }}>
            {nh.statusLoading}
          </p>
        </main>
        <RaFooter />
      </>
    );
  }

  // ── Not found ──────────────────────────────────────────────────
  if (loadError || !hearing) {
    return (
      <>
        <RaHeader />
        <main className="flex-1 flex items-center justify-center min-h-[60vh] py-20"
          style={{ backgroundColor: "var(--ra-cream-50)" }}>
          <div className="max-w-md mx-auto px-6 text-center">
            <span className="gold-rule block w-16 mx-auto mb-10" aria-hidden="true" />
            <h1 className="text-2xl font-light mb-6"
              style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}>
              {loadError || nh.statusNotFound}
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

  const elapsedDays  = businessDaysSince(new Date(hearing.submittedAt));
  const remaining    = Math.max(0, 5 - elapsedDays);
  const canRequest   = elapsedDays >= 5 && hearing.status === "awaiting_response";

  const submittedDate = new Date(hearing.submittedAt).toLocaleDateString(
    lang === "he" ? "he-IL" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  // Status badge helpers
  type StatusKey = "awaiting_response" | "response_received" | "verdict_issued";
  const statusLabel: Record<StatusKey, string> = {
    awaiting_response: nh.statusAwaiting,
    response_received: nh.statusResponseReceived,
    verdict_issued:    nh.statusVerdictIssued,
  };
  const statusColor: Record<StatusKey, string> = {
    awaiting_response: "hsl(38 90% 45%)",
    response_received: "hsl(200 65% 40%)",
    verdict_issued:    "hsl(140 55% 35%)",
  };
  const statusBg: Record<StatusKey, string> = {
    awaiting_response: "hsl(38 100% 96%)",
    response_received: "hsl(200 60% 96%)",
    verdict_issued:    "hsl(140 50% 96%)",
  };

  return (
    <>
      <RaHeader />

      {/* Page header */}
      <div className="py-16 border-b"
        style={{ backgroundColor: "var(--ra-navy-950)", borderColor: "hsl(215 45% 18%)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs tracking-[0.25em] uppercase mb-4"
            style={{ color: "var(--ra-gold-300)", fontFamily: "var(--font-sans)" }}>
            {lang === "he" ? "תיק מספר" : "Case No."} {hearing.caseId}
            &nbsp;·&nbsp;
            {lang === "he" ? "דיון" : "Hearing"} {hearing.hearingId}
          </p>
          <h1 className="text-3xl md:text-4xl font-light mb-4"
            style={{ color: "var(--ra-cream-50)", fontFamily: "var(--font-display)" }}>
            {nh.statusPageTitle}
          </h1>
          <p className="text-base leading-relaxed max-w-xl"
            style={{ color: "hsl(40 28% 70%)", fontFamily: "var(--font-sans)" }}>
            {hearing.caseTitle}
          </p>
        </div>
      </div>

      <main className="flex-1 py-16" style={{ backgroundColor: "var(--ra-cream-50)" }}>
        <div className="max-w-3xl mx-auto px-6">

          {/* Status card */}
          <div className="p-6 mb-10 border"
            style={{ borderColor: "var(--ra-gold-200)", backgroundColor: "white" }}>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs tracking-[0.15em] uppercase mb-1"
                  style={{ color: "hsl(215 20% 55%)", fontFamily: "var(--font-sans)" }}>
                  {nh.statusHearingIdLabel}
                </p>
                <p className="text-lg font-semibold"
                  style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-sans)" }}>
                  {hearing.hearingId}
                </p>
              </div>
              <div
                className="px-4 py-2 text-xs font-semibold tracking-[0.1em] uppercase"
                style={{
                  backgroundColor: statusBg[hearing.status as StatusKey],
                  color: statusColor[hearing.status as StatusKey],
                  fontFamily: "var(--font-sans)",
                }}
              >
                {statusLabel[hearing.status as StatusKey]}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"
              style={{ fontFamily: "var(--font-sans)" }}>
              <div>
                <p className="text-xs tracking-[0.1em] uppercase mb-1"
                  style={{ color: "hsl(215 20% 55%)" }}>
                  {nh.statusSubmittedLabel}
                </p>
                <p style={{ color: "hsl(215 20% 30%)" }}>{submittedDate}</p>
              </div>
              <div>
                <p className="text-xs tracking-[0.1em] uppercase mb-1"
                  style={{ color: "hsl(215 20% 55%)" }}>
                  {lang === "he" ? "מוגש על ידי" : "Submitted by"}
                </p>
                <p style={{ color: "hsl(215 20% 30%)" }}>{hearing.requesterName}</p>
              </div>
            </div>
          </div>

          {/* Countdown / status detail */}
          {hearing.status === "awaiting_response" && !oneSidedDone && (
            <div className="mb-10">
              {canRequest ? (
                /* ── Expired — show one-sided button ──────────────── */
                <div className="p-6 border-s-4"
                  style={{ borderColor: "var(--ra-gold-500)", backgroundColor: "hsl(42 55% 96%)" }}>
                  <p className="text-base font-semibold mb-2"
                    style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}>
                    {nh.statusExpiredTitle}
                  </p>
                  <p className="text-sm leading-relaxed mb-6"
                    style={{ color: "hsl(215 20% 38%)", fontFamily: "var(--font-sans)" }}>
                    {nh.statusExpiredNote}
                  </p>
                  {oneSidedError && (
                    <p className="text-sm mb-4"
                      style={{ color: "hsl(0 60% 40%)", fontFamily: "var(--font-sans)" }}>
                      {oneSidedError}
                    </p>
                  )}
                  <button
                    onClick={requestOneSided}
                    disabled={requesting}
                    className="px-8 py-4 text-sm tracking-[0.18em] uppercase font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: requesting ? "var(--ra-navy-700)" : "var(--ra-navy-800)",
                      color: "var(--ra-cream-50)",
                      fontFamily: "var(--font-sans)",
                      border: "none",
                      cursor: requesting ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => { if (!requesting) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--ra-navy-900)"; }}
                    onMouseLeave={(e) => { if (!requesting) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--ra-navy-800)"; }}
                  >
                    {requesting ? nh.statusOneSidedLoading : nh.statusOneSidedBtn}
                  </button>
                </div>
              ) : (
                /* ── Still waiting — countdown ────────────────────── */
                <div className="p-6 border"
                  style={{ borderColor: "var(--ra-gold-100)", backgroundColor: "white" }}>
                  <p className="text-xs tracking-[0.15em] uppercase mb-4"
                    style={{ color: "hsl(215 20% 55%)", fontFamily: "var(--font-sans)" }}>
                    {lang === "he"
                      ? `${otherPartyName(hearing, lang)} ${nh.statusAwaiting.toLowerCase()}`
                      : `${nh.statusAwaiting} from ${otherPartyName(hearing, lang)}`}
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-light"
                      style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}>
                      {remaining}
                    </span>
                    <span className="text-sm"
                      style={{ color: "hsl(215 20% 45%)", fontFamily: "var(--font-sans)" }}>
                      {nh.statusDaysLeft}
                    </span>
                  </div>
                  <div className="mt-4 w-full rounded-full overflow-hidden"
                    style={{ height: "6px", backgroundColor: "hsl(215 20% 92%)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (elapsedDays / 5) * 100)}%`,
                        backgroundColor: "var(--ra-gold-500)",
                      }}
                    />
                  </div>
                  <p className="text-xs mt-3"
                    style={{ color: "hsl(215 20% 55%)", fontFamily: "var(--font-sans)" }}>
                    {lang === "he"
                      ? `עברו ${elapsedDays} מתוך 5 ימי עסקים`
                      : `${elapsedDays} of 5 business days elapsed`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* One-sided success banner */}
          {oneSidedDone && (
            <div className="p-6 mb-10 border-s-4"
              style={{ borderColor: "hsl(140 50% 40%)", backgroundColor: "hsl(140 50% 96%)" }}>
              <p className="text-base font-semibold"
                style={{ color: "hsl(140 50% 28%)", fontFamily: "var(--font-display)" }}>
                ✓ {nh.statusOneSidedSuccess}
              </p>
            </div>
          )}

          {/* Response received / verdict issued info */}
          {(hearing.status === "response_received" || hearing.status === "verdict_issued") && (
            <div className="p-6 mb-10 border-s-4"
              style={{
                borderColor: hearing.status === "verdict_issued" ? "hsl(140 50% 40%)" : "hsl(200 65% 45%)",
                backgroundColor: hearing.status === "verdict_issued" ? "hsl(140 50% 96%)" : "hsl(200 60% 96%)",
              }}>
              <p className="text-base font-semibold"
                style={{
                  color: hearing.status === "verdict_issued" ? "hsl(140 50% 28%)" : "hsl(200 65% 28%)",
                  fontFamily: "var(--font-display)",
                }}>
                {hearing.status === "verdict_issued"
                  ? `✓ ${nh.statusVerdictIssued}`
                  : `⏳ ${nh.statusResponseReceived}`}
              </p>
            </div>
          )}

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

          {/* New evidence summary */}
          <div className="mb-10">
            <p className="text-xs tracking-[0.25em] uppercase mb-3"
              style={{ color: "var(--ra-gold-700)", fontFamily: "var(--font-sans)" }}>
              {nh.respondNewEvidenceLabel}
            </p>
            <div className="p-6 border"
              style={{ borderColor: "var(--ra-gold-200)", backgroundColor: "white" }}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: "hsl(215 20% 28%)", fontFamily: "var(--font-sans)" }}>
                {hearing.newEvidence}
              </p>
            </div>
          </div>

          {/* Back home */}
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

function otherPartyName(h: HearingData, lang: string): string {
  if (lang === "he") return h.otherPartyName || "הצד שכנגד";
  return h.otherPartyName || "the other party";
}
