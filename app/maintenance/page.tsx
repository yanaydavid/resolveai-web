import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ResolveAI — המערכת בשדרוג",
  description: "אנחנו משתפרים עבורכם. ResolveAI תשוב לפעילות בקרוב.",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at center, hsl(215 50% 14%) 0%, hsl(215 52% 8%) 100%)",
        padding: "2rem",
        fontFamily:
          "'Frank Ruhl Libre', 'David Libre', 'Times New Roman', serif",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 560 }}>
        <Image
          src="/logo.png"
          alt="ResolveAI"
          width={140}
          height={140}
          priority
          style={{ margin: "0 auto 32px", display: "block" }}
        />

        <div
          aria-hidden="true"
          style={{
            width: 60,
            height: 1,
            background:
              "linear-gradient(to right, transparent, hsl(42 50% 53%), transparent)",
            margin: "0 auto 28px",
          }}
        />

        <h1
          style={{
            fontFamily:
              "'Cormorant Garamond', 'Frank Ruhl Libre', Georgia, serif",
            color: "hsl(40 35% 97%)",
            fontWeight: 300,
            fontSize: "clamp(2rem, 5vw, 3rem)",
            margin: "0 0 16px",
            letterSpacing: "0.02em",
          }}
        >
          המערכת בשדרוג
        </h1>

        <p
          style={{
            color: "hsl(40 28% 70%)",
            fontSize: "1.05rem",
            lineHeight: 1.75,
            margin: "0 0 32px",
          }}
        >
          אנחנו משתפרים עבורכם. ResolveAI תשוב לפעילות בקרוב — תודה על
          הסבלנות.
        </p>

        <p
          style={{
            color: "hsl(215 20% 55%)",
            fontSize: "0.95rem",
            margin: 0,
          }}
        >
          לפניות:{" "}
          <a
            href="mailto:resolveai13@gmail.com"
            style={{
              color: "hsl(42 50% 65%)",
              textDecoration: "none",
              borderBottom: "1px solid hsl(42 50% 53% / 0.4)",
              paddingBottom: 2,
            }}
          >
            resolveai13@gmail.com
          </a>
        </p>
      </div>
    </main>
  );
}
