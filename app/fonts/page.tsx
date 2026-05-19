import { Frank_Ruhl_Libre, Heebo, Rubik } from "next/font/google";

const frankRuhl = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700"],
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700"],
});

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700"],
});

const sampleHe = "בוררות חכמה מבוססת בינה מלאכותית";
const sampleEn = "ResolveAI — Smart Arbitration";
const sampleNumbers = "₪299 לתיק | ₪599 | ₪1,990";
const sampleMixed = "תיק מספר RA-20260329 | 14 ימי עסקים";

const fonts = [
  {
    name: "1. Frank Ruhl Libre",
    desc: "קלאסי, אלגנטי, סריפי — מרגיש משפטי ורציני",
    style: frankRuhl.style,
  },
  {
    name: "2. Heebo",
    desc: "מודרני, נקי, ללא סריפים — קריא מאוד, פופולרי לאפליקציות",
    style: heebo.style,
  },
  {
    name: "3. Rubik",
    desc: "מעוגל, ידידותי, מודרני — מאוזן בין רשמי לנגיש",
    style: rubik.style,
  },
];

export default function FontsPage() {
  return (
    <div dir="rtl" style={{ background: "#0f1729", minHeight: "100vh", padding: "40px 24px" }}>
      <h1 style={{ color: "#c9a84c", textAlign: "center", fontSize: 28, marginBottom: 8, fontFamily: "sans-serif" }}>
        השוואת פונטים — ResolveAI
      </h1>
      <p style={{ color: "#a0907a", textAlign: "center", marginBottom: 48, fontFamily: "sans-serif", fontSize: 14 }}>
        בחר את הפונט המועדף עליך
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 800, margin: "0 auto" }}>
        {fonts.map((font) => (
          <div
            key={font.name}
            style={{
              background: "#1a2744",
              border: "1px solid #c9a84c44",
              borderRadius: 12,
              padding: "32px 36px",
            }}
          >
            <div style={{ marginBottom: 20, fontFamily: "sans-serif" }}>
              <span style={{ color: "#c9a84c", fontWeight: "bold", fontSize: 18 }}>{font.name}</span>
              <span style={{ color: "#a0907a", fontSize: 13, marginRight: 12 }}>{font.desc}</span>
            </div>

            <div style={{ ...font.style, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ color: "white", fontSize: 28, fontWeight: 700 }}>{sampleHe}</div>
              <div style={{ color: "#c9a84c", fontSize: 22, fontWeight: 400 }}>{sampleEn}</div>
              <div style={{ color: "white", fontSize: 20, fontWeight: 400 }}>{sampleNumbers}</div>
              <div style={{ color: "#a0907a", fontSize: 16, fontWeight: 300 }}>{sampleMixed}</div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <div style={{ background: "#c9a84c", color: "#1a2744", padding: "10px 24px", borderRadius: 4, fontWeight: 700, fontSize: 15 }}>
                  פתח תיק חדש
                </div>
                <div style={{ border: "1px solid #c9a84c", color: "#c9a84c", padding: "10px 24px", borderRadius: 4, fontSize: 15 }}>
                  ENGLISH
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ color: "#666", textAlign: "center", marginTop: 48, fontSize: 13, fontFamily: "sans-serif" }}>
        אחרי הבחירה — שלח לי את המספר (1, 2 או 3)
      </p>
    </div>
  );
}
