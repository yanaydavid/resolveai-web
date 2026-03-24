"use client";

import { useState } from "react";
import type { CaseSummary } from "@/lib/kv-store";

const STATUS_LABELS: Record<string, string> = {
  pending: "ממתין לנתבע",
  responded: "הוגשה תגובה",
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

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<CaseSummary | null>(null);

  async function login() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/cases?key=${encodeURIComponent(password)}`);
      if (res.status === 401) {
        setError("סיסמה שגויה");
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("שגיאה בשרת");
      const data = await res.json();
      setCases(data.cases || []);
      setAuthenticated(true);
    } catch {
      setError("שגיאה בחיבור לשרת");
    }
    setLoading(false);
  }

  if (!authenticated) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: "100vh",
          backgroundColor: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            background: "#1e293b",
            padding: "48px",
            borderRadius: "8px",
            width: "360px",
            border: "1px solid #334155",
          }}
        >
          <h1 style={{ color: "#c9a84c", margin: "0 0 8px", fontSize: "22px" }}>
            ResolveAI
          </h1>
          <p style={{ color: "#94a3b8", margin: "0 0 32px", fontSize: "13px" }}>
            דשבורד ניהול — גישה מוגבלת
          </p>
          <label style={{ color: "#94a3b8", fontSize: "12px", display: "block", marginBottom: "8px" }}>
            סיסמת כניסה
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="הזן סיסמה..."
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              color: "white",
              borderRadius: "4px",
              marginBottom: "16px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
          {error && (
            <p style={{ color: "#ef4444", fontSize: "13px", margin: "0 0 12px" }}>
              {error}
            </p>
          )}
          <button
            onClick={login}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#c9a84c",
              color: "#0f172a",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
            }}
          >
            {loading ? "מתחבר..." : "כניסה"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        fontFamily: "Arial, sans-serif",
        color: "white",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#1e293b",
          borderBottom: "1px solid #334155",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 style={{ color: "#c9a84c", margin: 0, fontSize: "20px" }}>ResolveAI</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "12px" }}>
            דשבורד ניהול
          </p>
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#c9a84c", margin: 0, fontSize: "22px", fontWeight: "bold" }}>
              {cases.length}
            </p>
            <p style={{ color: "#64748b", margin: "2px 0 0", fontSize: "11px" }}>סך הכל תיקים</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#f59e0b", margin: 0, fontSize: "22px", fontWeight: "bold" }}>
              {cases.filter((c) => c.status === "pending").length}
            </p>
            <p style={{ color: "#64748b", margin: "2px 0 0", fontSize: "11px" }}>ממתינים</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#10b981", margin: 0, fontSize: "22px", fontWeight: "bold" }}>
              {cases.filter((c) => c.status === "verdict_issued").length}
            </p>
            <p style={{ color: "#64748b", margin: "2px 0 0", fontSize: "11px" }}>הסתיימו</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "32px", display: "flex", gap: "24px" }}>
        {/* Cases list */}
        <div style={{ flex: 1 }}>
          <h2 style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            תיקים ({cases.length})
          </h2>
          {cases.length === 0 ? (
            <div
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "48px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              אין תיקים עדיין
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {cases
                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                .map((c) => (
                  <div
                    key={c.caseId}
                    onClick={() => setSelected(c)}
                    style={{
                      background: selected?.caseId === c.caseId ? "#1e3a5f" : "#1e293b",
                      border: `1px solid ${selected?.caseId === c.caseId ? "#3b82f6" : "#334155"}`,
                      borderRadius: "8px",
                      padding: "16px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ color: "#c9a84c", margin: "0 0 4px", fontSize: "13px", fontWeight: "bold" }}>
                          {c.caseId}
                        </p>
                        <p style={{ color: "white", margin: "0 0 4px", fontSize: "14px" }}>
                          {c.caseTitle}
                        </p>
                        <p style={{ color: "#94a3b8", margin: 0, fontSize: "12px" }}>
                          {c.partyOneName} נגד {c.partyTwoName}
                        </p>
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <span
                          style={{
                            backgroundColor: STATUS_COLORS[c.status] + "22",
                            color: STATUS_COLORS[c.status],
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "bold",
                            display: "block",
                            marginBottom: "8px",
                          }}
                        >
                          {STATUS_LABELS[c.status]}
                        </span>
                        <p style={{ color: "#475569", margin: 0, fontSize: "11px" }}>
                          {new Date(c.submittedAt).toLocaleDateString("he-IL")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Case detail */}
        {selected && (
          <div
            style={{
              width: "380px",
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              padding: "24px",
              alignSelf: "flex-start",
              position: "sticky",
              top: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ color: "#c9a84c", margin: 0, fontSize: "16px" }}>{selected.caseId}</h3>
              <button
                onClick={() => setSelected(null)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "18px" }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Field label="כותרת" value={selected.caseTitle} />
              <Field label="קטגוריה" value={CATEGORY_HE[selected.category] || selected.category} />
              <Field label="תובע" value={`${selected.partyOneName} (${selected.partyOneEmail})`} />
              <Field label="נתבע" value={`${selected.partyTwoName} (${selected.partyTwoEmail})`} />
              <Field label="תאריך הגשה" value={new Date(selected.submittedAt).toLocaleString("he-IL")} />
              <div>
                <p style={{ color: "#64748b", fontSize: "11px", margin: "0 0 4px", textTransform: "uppercase" }}>סטטוס</p>
                <span
                  style={{
                    backgroundColor: STATUS_COLORS[selected.status] + "22",
                    color: STATUS_COLORS[selected.status],
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {STATUS_LABELS[selected.status]}
                </span>
              </div>
              <div>
                <p style={{ color: "#64748b", fontSize: "11px", margin: "0 0 4px", textTransform: "uppercase" }}>שם בוצא במסמך</p>
                <p style={{ color: selected.nameFoundInDoc ? "#10b981" : "#ef4444", margin: 0, fontSize: "13px" }}>
                  {selected.nameFoundInDoc ? "כן — אומת" : "לא נמצא"}
                </p>
              </div>
              {selected.description && (
                <div>
                  <p style={{ color: "#64748b", fontSize: "11px", margin: "0 0 4px", textTransform: "uppercase" }}>תיאור התלונה</p>
                  <p style={{ color: "#94a3b8", margin: 0, fontSize: "12px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    {selected.description}
                  </p>
                </div>
              )}
              {selected.documentSummary && (
                <div>
                  <p style={{ color: "#64748b", fontSize: "11px", margin: "0 0 4px", textTransform: "uppercase" }}>סיכום מסמך</p>
                  <p style={{ color: "#94a3b8", margin: 0, fontSize: "12px", lineHeight: "1.6" }}>
                    {selected.documentSummary}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ color: "#64748b", fontSize: "11px", margin: "0 0 4px", textTransform: "uppercase" }}>{label}</p>
      <p style={{ color: "#e2e8f0", margin: 0, fontSize: "13px" }}>{value}</p>
    </div>
  );
}
