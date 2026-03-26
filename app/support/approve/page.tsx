"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RaHeader } from "@/components/ra-header";
import { RaFooter } from "@/components/ra-footer";

interface Ticket {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  body: string;
  draft: string;
  status: string;
  createdAt: string;
}

function ApproveContent() {
  const searchParams = useSearchParams();
  const id    = searchParams.get("id")    || "";
  const token = searchParams.get("token") || "";

  const [ticket, setTicket]     = useState<Ticket | null>(null);
  const [draft,  setDraft]      = useState("");
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [done, setDone]         = useState<"sent" | "rejected" | null>(null);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (!id || !token) { setLoading(false); return; }
    fetch(`/api/support-ticket?id=${id}&token=${token}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setTicket(data);
          setDraft(data.draft);
          if (data.status !== "pending") setDone(data.status as "sent" | "rejected");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, token]);

  async function handleApprove() {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/support-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, token, finalDraft: draft }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "already_handled") { setDone("sent"); return; }
        throw new Error(data.error || "שגיאה");
      }
      setDone("sent");
    } catch (e: unknown) {
      setError((e as Error).message || "אירעה שגיאה, נסה שנית");
      setSending(false);
    }
  }

  async function handleReject() {
    setRejecting(true);
    try {
      await fetch("/api/support-approve", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, token }),
      });
      setDone("rejected");
    } catch {
      setRejecting(false);
    }
  }

  const boxStyle: React.CSSProperties = {
    backgroundColor: "white",
    border: "1px solid var(--ra-gold-100, #e8d9a0)",
    padding: "24px",
    marginBottom: "24px",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    color: "hsl(215 20% 48%)",
    fontFamily: "var(--font-sans)",
    marginBottom: "8px",
    display: "block",
  };

  if (loading) {
    return (
      <>
        <RaHeader />
        <main className="flex-1 flex items-center justify-center min-h-[60vh]"
          style={{ backgroundColor: "var(--ra-cream-50)" }}>
          <p style={{ color: "hsl(215 20% 48%)", fontFamily: "var(--font-sans)" }}>טוען...</p>
        </main>
        <RaFooter />
      </>
    );
  }

  if (!ticket) {
    return (
      <>
        <RaHeader />
        <main className="flex-1 flex items-center justify-center min-h-[60vh]"
          style={{ backgroundColor: "var(--ra-cream-50)" }}>
          <div className="text-center max-w-md mx-auto px-6">
            <h1 className="text-2xl font-light mb-4"
              style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}>
              הפנייה לא נמצאה
            </h1>
            <p style={{ color: "hsl(215 20% 48%)", fontFamily: "var(--font-sans)" }}>
              ייתכן שהקישור פג תוקף או שגוי.
            </p>
          </div>
        </main>
        <RaFooter />
      </>
    );
  }

  if (done === "sent") {
    return (
      <>
        <RaHeader />
        <main className="flex-1 flex items-center justify-center min-h-[60vh]"
          style={{ backgroundColor: "var(--ra-cream-50)" }}>
          <div className="text-center max-w-md mx-auto px-6">
            <span className="gold-rule block w-16 mx-auto mb-8" />
            <h1 className="text-2xl font-light mb-4"
              style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}>
              התגובה נשלחה
            </h1>
            <p style={{ color: "hsl(215 20% 48%)", fontFamily: "var(--font-sans)" }}>
              מייל התגובה נשלח ל-{ticket.fromName} ({ticket.from}).
            </p>
          </div>
        </main>
        <RaFooter />
      </>
    );
  }

  if (done === "rejected") {
    return (
      <>
        <RaHeader />
        <main className="flex-1 flex items-center justify-center min-h-[60vh]"
          style={{ backgroundColor: "var(--ra-cream-50)" }}>
          <div className="text-center max-w-md mx-auto px-6">
            <h1 className="text-2xl font-light mb-4"
              style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}>
              הפנייה נדחתה
            </h1>
            <p style={{ color: "hsl(215 20% 48%)", fontFamily: "var(--font-sans)" }}>
              הפנייה סומנה כנדחתה ולא נשלחה תגובה.
            </p>
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

        <div className="py-12 border-b" style={{ backgroundColor: "var(--ra-navy-900)", borderColor: "hsl(215 45% 18%)" }}>
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-xs tracking-[0.25em] uppercase mb-2"
              style={{ color: "var(--ra-gold-300)", fontFamily: "var(--font-sans)" }}>
              מערכת תמיכה
            </p>
            <h1 className="text-3xl font-light"
              style={{ color: "var(--ra-cream-50)", fontFamily: "var(--font-display)" }}>
              אישור תגובה לפנייה
            </h1>
          </div>
        </div>

        <div className="py-12">
          <div className="max-w-3xl mx-auto px-6">

            {/* Original email */}
            <div style={boxStyle}>
              <span style={labelStyle}>פנייה מקורית מהלקוח</span>
              <p style={{ fontSize: "13px", color: "hsl(215 20% 48%)", fontFamily: "var(--font-sans)", margin: "0 0 4px" }}>
                <strong>שולח:</strong> {ticket.fromName} &lt;{ticket.from}&gt;
              </p>
              <p style={{ fontSize: "13px", color: "hsl(215 20% 48%)", fontFamily: "var(--font-sans)", margin: "0 0 16px" }}>
                <strong>נושא:</strong> {ticket.subject}
              </p>
              <div style={{ borderTop: "1px solid #f0e8d0", paddingTop: "16px" }}>
                <p style={{ fontSize: "14px", color: "#333", whiteSpace: "pre-wrap", lineHeight: 1.7, margin: 0, fontFamily: "var(--font-sans)" }}>
                  {ticket.body}
                </p>
              </div>
            </div>

            {/* Editable draft */}
            <div style={{ marginBottom: "28px" }}>
              <span style={labelStyle}>תגובה מוצעת — ניתן לערוך לפני שליחה</span>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={12}
                style={{
                  width: "100%",
                  padding: "16px",
                  border: "1px solid var(--ra-gold-300, #d4b87a)",
                  fontSize: "14px",
                  lineHeight: "1.7",
                  color: "#1a2744",
                  fontFamily: "var(--font-sans)",
                  resize: "vertical",
                  backgroundColor: "white",
                  outline: "none",
                }}
              />
            </div>

            {error && (
              <p style={{ color: "hsl(0 65% 48%)", fontSize: "13px", marginBottom: "16px", fontFamily: "var(--font-sans)" }}>
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleApprove}
                disabled={sending || !draft.trim()}
                style={{
                  flex: 1,
                  padding: "16px",
                  backgroundColor: sending ? "hsl(215 45% 35%)" : "var(--ra-navy-800)",
                  color: "var(--ra-cream-50)",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "bold",
                  letterSpacing: "0.1em",
                  cursor: sending ? "not-allowed" : "pointer",
                  opacity: sending ? 0.7 : 1,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {sending ? "שולח..." : "אשר ושלח ללקוח"}
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting}
                style={{
                  padding: "16px 24px",
                  backgroundColor: "transparent",
                  color: "hsl(0 55% 45%)",
                  border: "1px solid hsl(0 55% 75%)",
                  fontSize: "14px",
                  cursor: rejecting ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {rejecting ? "..." : "דחה"}
              </button>
            </div>

          </div>
        </div>
      </main>
      <RaFooter />
    </>
  );
}

export default function SupportApprovePage() {
  return (
    <Suspense fallback={null}>
      <ApproveContent />
    </Suspense>
  );
}
