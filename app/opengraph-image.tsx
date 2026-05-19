import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ResolveAI — בוררות וגישור מקוון מבוסס בינה מלאכותית";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          backgroundColor: "#0a0f1e",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Top gold line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: "#c9a84c",
          }}
        />

        {/* Bottom gold line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: "#c9a84c",
          }}
        />

        {/* Brand name */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 600,
            letterSpacing: "0.05em",
            color: "#c9a84c",
            marginBottom: 8,
            display: "flex",
          }}
        >
          ResolveAI
        </div>

        {/* Gold divider */}
        <div
          style={{
            width: 80,
            height: 2,
            backgroundColor: "#c9a84c",
            marginBottom: 28,
            opacity: 0.7,
          }}
        />

        {/* Hebrew tagline */}
        <div
          style={{
            fontSize: 32,
            color: "#e8dfc8",
            letterSpacing: "0.02em",
            marginBottom: 40,
            display: "flex",
          }}
        >
          בוררות וגישור מקוון מבוסס בינה מלאכותית
        </div>

        {/* Three pills */}
        <div style={{ display: "flex", gap: 24 }}>
          {["ללא עורכי דין", "תוך ימים", "מ-₪299 לתיק"].map((label) => (
            <div
              key={label}
              style={{
                border: "1px solid rgba(201,168,76,0.45)",
                padding: "10px 28px",
                color: "#c9a84c",
                fontSize: 22,
                letterSpacing: "0.04em",
                display: "flex",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            fontSize: 20,
            color: "rgba(232,223,200,0.4)",
            letterSpacing: "0.1em",
            display: "flex",
          }}
        >
          resolveai.co.il
        </div>
      </div>
    ),
    { ...size }
  );
}
