"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const STATUS_LABELS: Record<string, string> = {
  pending: "ממתין לתגובת הנתבע",
  responded: "תגובה התקבלה — בבחינה",
  verdict_issued: "פסיקה ניתנה",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  responded: "#3b82f6",
  verdict_issued: "#10b981",
};

const CATEGORY_HE: Record<string, string> = {
  business: "מסחרי ועסקי",
  property: 'נדל"ן ורכוש',
  financial: "פיננסי וכספי",
  employment: "עבודה ותעסוקה",
  contract: "הפרת חוזה",
  other: "אחר",
};

function StatusContent() {
  const params = useSearchParams();
  const [caseId, setCaseId] = useState(params.get("id") || "");
  const [email, setEmail] = useState(params.get("email") || "");
  const [data, setData] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.get("id") && params.get("email")) {
      search();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function search() {
    if (!caseId || !email) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/case-status?id=${encodeURIComponent(caseId)}&email=${encodeURIComponent(email)}`);
      if (res.status === 404) { setError("תיק לא נמצא"); setLoading(false); return; }
      if (res.status === 401) { setError("כתובת המייל אינה תואמת לתיק זה"); setLoading(false); return; }
      if (!res.ok) { setError("שגיאה בשרת"); setLoading(false); return; }
      const json = await res.json();
      setData(json);
    } catch {
      setError("שגיאה בחיבור לשרת");
    }
    setLoading(false);
  }

  return (
    <div dir="rtl" style={{ minHeight: "100vh", backgroundColor: "#fffdf7", fontFamily: "Arial, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "60px" }}>
      <div style={{ width: "100%", maxWidth: "560px", padding: "0 16px" }}>
        <h1 style={{ color: "#1a2744", fontSize: "24px", marginBottom: "4px" }}>מעקב תיק</h1>
        <p style={{ color: "#888", fontSize: "14px", marginBottom: "32px" }}>הזן את מספר התיק וכתובת המייל שלך לבדיקת סטטוס</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
          <input
            value={caseId}
            onChange={e => setCaseId(e.target.value)}
            placeholder="מספר תיק (לדוגמה: RA-85780923)"
            style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", direction: "ltr" }}
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="כתובת המייל שלך"
            style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", direction: "ltr" }}
          />
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

        <button
          onClick={search}
          disabled={loading}
          style={{ width: "100%", padding: "14px", backgroundColor: "#1a2744", color: "white", border: "none", borderRadius: "4px", fontSize: "15px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", marginBottom: "32px" }}
        >
          {loading ? "מחפש..." : "בדוק סטטוס"}
        </button>

        {data && (
          <div style={{ background: "white", border: "1px solid #e8d9a0", borderRadius: "8px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <span style={{ color: "#c9a84c", fontWeight: "bold", fontSize: "16px" }}>{data.caseId}</span>
              <span style={{ backgroundColor: STATUS_COLORS[data.status] + "22", color: STATUS_COLORS[data.status], padding: "6px 14px", borderRadius: "12px", fontSize: "13px", fontWeight: "bold" }}>
                {STATUS_LABELS[data.status] || data.status}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Row label="כותרת התיק" value={data.caseTitle} />
              <Row label="תובע" value={data.partyOneName} />
              <Row label="נתבע" value={data.partyTwoName} />
              <Row label="קטגוריה" value={CATEGORY_HE[data.category] || data.category} />
              <Row label="תאריך הגשה" value={new Date(data.submittedAt).toLocaleDateString("he-IL")} />
              {data.documentSummary && data.documentSummary !== "לא ניתן לנתח את המסמך" && (
                <Row label="סיכום מסמך" value={data.documentSummary} />
              )}
            </div>

            {data.status === "pending" && (
              <div style={{ marginTop: "20px", background: "#fff8e1", borderRight: "4px solid #f59e0b", padding: "14px", fontSize: "13px", color: "#92400e" }}>
                ממתינים לתגובת הנתבע. לאחר קבלת התגובה תינתן פסיקה ותישלח אליך במייל.
              </div>
            )}
            {data.status === "responded" && (
              <div style={{ marginTop: "20px", background: "#eff6ff", borderRight: "4px solid #3b82f6", padding: "14px", fontSize: "13px", color: "#1d4ed8" }}>
                תגובת הנתבע התקבלה. הפסיקה בהכנה ותישלח אליך בקרוב.
              </div>
            )}
            {data.status === "verdict_issued" && (
              <div style={{ marginTop: "20px", background: "#ecfdf5", borderRight: "4px solid #10b981", padding: "14px", fontSize: "13px", color: "#065f46" }}>
                הפסיקה ניתנה ונשלחה למייל שלך.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ color: "#888", fontSize: "11px", margin: "0 0 3px", textTransform: "uppercase" }}>{label}</p>
      <p style={{ color: "#1a2744", fontSize: "14px", margin: 0 }}>{value}</p>
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense>
      <StatusContent />
    </Suspense>
  );
}
