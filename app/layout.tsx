import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Libre_Baskerville,
  Frank_Ruhl_Libre,
} from "next/font/google";
import { LangProvider } from "@/lib/lang-context";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-baskerville",
  display: "swap",
});

const frankRuhlLibre = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-frank-ruhl",
  display: "swap",
});

const siteUrl = "https://resolveai.co.il";

export const metadata: Metadata = {
  title: {
    default: "ResolveAI — בוררות חכמה מבוססת בינה מלאכותית",
    template: "%s | ResolveAI",
  },
  description:
    "פסיקת בוררות מבוססת AI תוך דקות — ללא עורכי דין, ללא המתנה, ללא עלויות גבוהות. AI-powered dispute resolution for individuals and businesses.",
  keywords: [
    "בוררות", "יישוב מחלוקות", "AI", "בינה מלאכותית",
    "arbitration", "dispute resolution", "ODR",
    "online dispute resolution", "Israel", "ישראל",
    "ResolveAI", "פסיקה", "מחלוקת עסקית",
  ],
  authors: [{ name: "ResolveAI" }],
  creator: "ResolveAI",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    alternateLocale: "en_US",
    url: siteUrl,
    siteName: "ResolveAI",
    title: "ResolveAI — בוררות חכמה מבוססת בינה מלאכותית",
    description:
      "פסיקת בוררות מבוססת AI תוך דקות — ללא עורכי דין, ללא המתנה, ללא עלויות גבוהות.",
    images: [
      {
        url: "/logo3.png",
        width: 1200,
        height: 630,
        alt: "ResolveAI — Smart AI-Powered Arbitration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResolveAI — בוררות חכמה מבוססת בינה מלאכותית",
    description:
      "פסיקת בוררות מבוססת AI תוך דקות — ללא עורכי דין, ללא המתנה.",
    images: ["/logo3.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${cormorant.variable} ${libreBaskerville.variable} ${frankRuhlLibre.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
