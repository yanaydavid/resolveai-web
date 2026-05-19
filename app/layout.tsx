import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Libre_Baskerville,
  Rubik,
} from "next/font/google";
import Script from "next/script";
import { LangProvider } from "@/lib/lang-context";
import "./globals.css";

const GA_ID = "G-3JD6SDF6XY";

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

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-rubik",
  display: "swap",
});

const siteUrl = "https://resolveai.co.il";

export const metadata: Metadata = {
  title: {
    default: "ResolveAI — בוררות וגישור מקוון מבוסס בינה מלאכותית",
    template: "%s | ResolveAI",
  },
  description:
    "ResolveAI — פתרון סכסוכים מקוון מבוסס בינה מלאכותית. בוררות וגישור מקצועי ללא עורכי דין, תוך ימים ובמחיר החל מ-₪299. חלופה מהירה וזולה לבית המשפט לסכסוכים עסקיים ואישיים.",
  keywords: [
    "בורר",
    "בוררות",
    "בוררות עסקית",
    "בוררות מקוונת",
    "בוררות בינה מלאכותית",
    "גישור",
    "גישור עסקי",
    "גישור משפחתי",
    "גישור קהילתי",
    "גישור בין דורי",
    "גישור מקוון",
    "גישור גירושין",
    "גישור גירושין חינם",
    "חלוקת רכוש גירושין",
    "חלוקת רכוש בין בני זוג",
    "הסכם גירושין",
    "בוררות גירושין",
    "פתרון סכסוכים",
    "יישוב סכסוכים",
    "יישוב מחלוקות",
    "פתרון סכסוך ללא עורך דין",
    "חלופה לבית משפט",
    "תביעה ללא עורך דין",
    "סכסוך עסקי",
    "הפרת חוזה",
    "ODR",
    "online dispute resolution",
    "arbitration",
    "mediation",
    "AI arbitration",
    "ישראל",
    "ResolveAI",
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
    title: "ResolveAI — בוררות וגישור מקוון מבוסס בינה מלאכותית",
    description:
      "פתרון סכסוכים ללא עורכי דין, ללא המתנה. בוררות מקצועית מבוססת AI החל מ-₪299 — חלופה מהירה וזולה לבית המשפט.",
    images: [
      {
        url: "/logo3.png",
        width: 1200,
        height: 630,
        alt: "ResolveAI — בוררות וגישור מקוון מבוסס בינה מלאכותית",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResolveAI — בוררות וגישור מקוון מבוסס בינה מלאכותית",
    description:
      "פתרון סכסוכים ללא עורכי דין, ללא המתנה. בוררות מקצועית מ-₪299.",
    images: ["/logo3.png"],
  },
  verification: {
    google: "8o24Jppnkl8M1otLRRcAY3JaHlI5TxxYSrVEJG7_mxE",
  },
  manifest: "/manifest.json",
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

// ── Structured Data (JSON-LD) ─────────────────────────────────────────────────
const legalServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  name: "ResolveAI",
  description:
    "פלטפורמת בוררות וגישור מקוון מבוססת בינה מלאכותית לפתרון סכסוכים עסקיים ואישיים בישראל ללא עורכי דין",
  url: siteUrl,
  logo: `${siteUrl}/logo3.png`,
  image: `${siteUrl}/logo3.png`,
  areaServed: { "@type": "Country", name: "Israel" },
  availableLanguage: ["Hebrew", "English"],
  priceRange: "₪299–₪1,990",
  serviceType: ["Online Arbitration", "Online Dispute Resolution", "Mediation", "AI Arbitration"],
  address: { "@type": "PostalAddress", addressCountry: "IL" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "תכניות בוררות",
    itemListElement: [
      { "@type": "Offer", name: "בסיסי", price: "299", priceCurrency: "ILS" },
      { "@type": "Offer", name: "סטנדרט", price: "599", priceCurrency: "ILS" },
      { "@type": "Offer", name: "פרמיום", price: "1990", priceCurrency: "ILS" },
    ],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "מה ההבדל בין גישור לבוררות?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "גישור הוא תהליך שמגשר ניטרלי מסייע לצדדים להגיע להסכמה ביניהם — ללא הכרעה מחייבת. בוררות היא תהליך שבו בורר (או מערכת AI) שומע את שני הצדדים ומכריע בסכסוך. ResolveAI מספקת שירות בוררות מקוון מבוסס AI — מהיר, זול ואובייקטיבי.",
      },
    },
    {
      "@type": "Question",
      name: "כמה עולה בוררות ב-ResolveAI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "תמחור ResolveAI מתחיל מ-₪299 לתיק — לעומת 8,000–45,000 ₪ בבוררות מסורתית. מנות הסטנדרט עולה ₪599 ומנת הפרמיום ₪1,990. בגרסת הבטא הנוכחית כל התיקים מעובדים בחינם.",
      },
    },
    {
      "@type": "Question",
      name: "האם ניתן לפתור סכסוך ללא עורך דין?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "כן! ResolveAI מאפשרת פתרון סכסוכים מלא ללא עורכי דין. מגישים את עמדתכם ישירות למערכת, הצד השני מגיב, ובינה מלאכותית מנתחת ונותנת פסיקה מנומקת — ללא נציגות משפטית ובעלות של שבריר מהבוררות המסורתית.",
      },
    },
    {
      "@type": "Question",
      name: "האם פסיקת ResolveAI מחייבת מבחינה משפטית?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "פסיקות ResolveAI מוגשות כהמלצת בוררות מוסכמת. ניתן להגיש אותן כחלק מהסכם בוררות מוסכם בין הצדדים, אשר יהפוך אותן למחייבות. אנו ממליצים להתייעץ עם עורך דין לגבי אכיפה ספציפית.",
      },
    },
    {
      "@type": "Question",
      name: "כמה זמן לוקח הליך הבוררות?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "רוב הפסיקות מסתיימות תוך מספר דקות עד שעה — לעומת חודשים ארוכים בבוררות מסורתית או בבית משפט.",
      },
    },
    {
      "@type": "Question",
      name: "מה קורה אם הצד השני מסרב להשתתף?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "לאחר 14 ימי עסקים ללא תגובה, ניתן לבקש פסיקה חד-צדדית. ResolveAI ינתח את עמדת התובע ויוציא פסיקה מנומקת בהיעדר הנתבע.",
      },
    },
    {
      "@type": "Question",
      name: "באילו סוגי סכסוכים עסקיים ואישיים מטפל ResolveAI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ResolveAI מטפל בסכסוכים עסקיים ומסחריים, נדל\"ן ורכוש, הפרת חוזה, עבודה ותעסוקה, ומחלוקות פיננסיות — כל סכסוך שניתן לנתח על בסיס עובדות ועקרונות משפטיים.",
      },
    },
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ResolveAI",
  url: siteUrl,
  description: "פלטפורמת בוררות וגישור מקוון מבוססת AI לפתרון סכסוכים בישראל",
  inLanguage: "he-IL",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
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
      className={`${cormorant.variable} ${libreBaskerville.variable} ${rubik.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#0a0f1e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ResolveAI" />
        <link rel="apple-touch-icon" href="/logo.png" />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(legalServiceJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="antialiased">
        <LangProvider>{children}</LangProvider>
      </body>

      {/* Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_path: window.location.pathname });
          `,
        }}
      />
    </html>
  );
}
