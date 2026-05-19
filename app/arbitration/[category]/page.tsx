import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { RaHeader } from "@/components/ra-header";
import { RaFooter } from "@/components/ra-footer";
import { CategoryFaq } from "./CategoryFaq";
import { CATEGORY_PAGES, CATEGORY_LIST, CATEGORY_LABELS } from "@/lib/category-data";

const siteUrl = "https://resolveai.co.il";

// ── Static params ──────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return CATEGORY_LIST.map((c) => ({ category: c.slug }));
}

// ── Metadata ───────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const data = CATEGORY_PAGES[category];
  if (!data) return {};

  const canonicalUrl = `${siteUrl}/arbitration/${data.slug}`;

  return {
    title: data.metaTitle,
    description: data.metaDesc,
    keywords: data.keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      locale: "he_IL",
      url: canonicalUrl,
      siteName: "ResolveAI",
      title: data.metaTitle,
      description: data.metaDesc,
      images: [{ url: `${siteUrl}/logo3.png`, width: 1200, height: 630, alt: data.metaTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: data.metaTitle,
      description: data.metaDesc,
      images: [`${siteUrl}/logo3.png`],
    },
  };
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const data = CATEGORY_PAGES[category];
  if (!data) notFound();

  const relatedCategories = data.relatedSlugs
    .map((s) => CATEGORY_PAGES[s])
    .filter(Boolean);

  // ── JSON-LD ────────────────────────────────────────────────────
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: `ResolveAI — ${data.eyebrow}`,
    description: data.metaDesc,
    url: `${siteUrl}/arbitration/${data.slug}`,
    logo: `${siteUrl}/logo3.png`,
    areaServed: { "@type": "Country", name: "Israel" },
    availableLanguage: "Hebrew",
    priceRange: "₪299–₪1,990",
    serviceType: ["Online Arbitration", "Online Dispute Resolution"],
    address: { "@type": "PostalAddress", addressCountry: "IL" },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ראשי", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "בוררות מקוונת", item: `${siteUrl}/arbitration` },
      { "@type": "ListItem", position: 3, name: data.eyebrow, item: `${siteUrl}/arbitration/${data.slug}` },
    ],
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />

      <RaHeader />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section
        className="py-20 border-b"
        style={{ backgroundColor: "var(--ra-navy-950)", borderColor: "hsl(215 45% 18%)" }}
      >
        <div className="max-w-4xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="mb-6 text-xs tracking-[0.15em] uppercase"
            style={{ fontFamily: "var(--font-sans)", color: "hsl(40 28% 55%)" }}
            aria-label="breadcrumb">
            <Link href="/" style={{ color: "var(--ra-gold-300)" }}>ResolveAI</Link>
            <span className="mx-2 opacity-50">›</span>
            <span>בוררות מקוונת</span>
            <span className="mx-2 opacity-50">›</span>
            <span style={{ color: "var(--ra-gold-400)" }}>{data.eyebrow}</span>
          </nav>

          <p className="text-xs tracking-[0.3em] uppercase mb-5"
            style={{ color: "var(--ra-gold-400)", fontFamily: "var(--font-sans)" }}>
            {data.eyebrow}
          </p>

          <h1
            className="text-3xl md:text-5xl font-light leading-tight mb-6"
            style={{ color: "var(--ra-cream-50)", fontFamily: "var(--font-display)" }}
          >
            {data.title}
          </h1>

          <p
            className="text-base md:text-lg leading-relaxed max-w-2xl mb-10"
            style={{ color: "hsl(40 28% 70%)", fontFamily: "var(--font-sans)" }}
          >
            {data.intro}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/new?category=${data.heCategory}`}
              className="inline-block px-10 py-4 text-sm tracking-[0.2em] uppercase font-semibold"
              style={{
                backgroundColor: "var(--ra-gold-500)",
                color: "var(--ra-navy-950)",
                fontFamily: "var(--font-sans)",
              }}
            >
              פתח תיק עכשיו — החל מ-₪299
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-block px-8 py-4 text-xs tracking-[0.2em] uppercase border"
              style={{
                borderColor: "hsl(42 48% 72% / 0.4)",
                color: "var(--ra-gold-300)",
                fontFamily: "var(--font-sans)",
              }}
            >
              כיצד זה עובד
            </Link>
          </div>
        </div>
      </section>

      <main className="flex-1" style={{ backgroundColor: "var(--ra-cream-50)" }}>

        {/* ── Stats strip ───────────────────────────────────────── */}
        <section
          className="border-b py-10"
          style={{ backgroundColor: "hsl(42 35% 97%)", borderColor: "var(--ra-gold-100)" }}
        >
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {[
                { num: "₪299", label: "מחיר התחלתי לתיק" },
                { num: "3–7", label: "ימים עד פסיקה" },
                { num: "100%", label: "ללא עורך דין" },
                { num: "8K–45K ₪", label: "חסכון לעומת בוררות רגילה" },
              ].map(({ num, label }) => (
                <div key={label}>
                  <p
                    className="text-2xl md:text-3xl font-light mb-1"
                    style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}
                  >
                    {num}
                  </p>
                  <p
                    className="text-xs tracking-[0.1em] uppercase"
                    style={{ color: "hsl(215 20% 55%)", fontFamily: "var(--font-sans)" }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Use cases ─────────────────────────────────────────── */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-3"
              style={{ color: "var(--ra-gold-700)", fontFamily: "var(--font-sans)" }}
            >
              תחומי טיפול
            </p>
            <h2
              className="text-2xl md:text-3xl font-light mb-12"
              style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}
            >
              סוגי סכסוכים שאנחנו פותרים
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {data.benefits.map((b) => (
                <div
                  key={b.title}
                  className="p-6 border"
                  style={{
                    borderColor: "var(--ra-gold-200)",
                    backgroundColor: "white",
                    borderRight: "3px solid var(--ra-gold-400)",
                  }}
                >
                  <h3
                    className="text-base font-semibold mb-2"
                    style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}
                  >
                    {b.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "hsl(215 20% 38%)", fontFamily: "var(--font-sans)" }}
                  >
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────── */}
        <section
          className="py-20 border-t border-b"
          style={{ borderColor: "var(--ra-gold-100)", backgroundColor: "hsl(42 35% 97%)" }}
        >
          <div className="max-w-4xl mx-auto px-6">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-3"
              style={{ color: "var(--ra-gold-700)", fontFamily: "var(--font-sans)" }}
            >
              התהליך
            </p>
            <h2
              className="text-2xl md:text-3xl font-light mb-12"
              style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}
            >
              שלושה שלבים לפסיקה
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  num: "01",
                  title: "הגשת התביעה",
                  desc: `תארו את הסכסוך, הגישו מסמכים, ו-ResolveAI שולחת הודעה לצד השני.`,
                },
                {
                  num: "02",
                  title: "תגובת הצד השני",
                  desc: "לצד השני 14 ימי עסקים להגיש עמדתו. AI מנתח את שני הצדדים.",
                },
                {
                  num: "03",
                  title: "פסיקה מנומקת",
                  desc: "פסיקה מפורטת נשלחת לשני הצדדים — ממצאים, נימוקים, הסכום הפסוק.",
                },
              ].map((step) => (
                <div key={step.num} className="flex gap-5">
                  <p
                    className="text-3xl font-light shrink-0 leading-none"
                    style={{ color: "var(--ra-gold-300)", fontFamily: "var(--font-display)" }}
                  >
                    {step.num}
                  </p>
                  <div>
                    <h3
                      className="text-base font-semibold mb-2"
                      style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "hsl(215 20% 45%)", fontFamily: "var(--font-sans)" }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-3"
              style={{ color: "var(--ra-gold-700)", fontFamily: "var(--font-sans)" }}
            >
              שאלות נפוצות
            </p>
            <h2
              className="text-2xl md:text-3xl font-light mb-10"
              style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}
            >
              {data.eyebrow} — שאלות ותשובות
            </h2>
            <CategoryFaq items={data.faq} />
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section
          className="py-20 border-t"
          style={{ borderColor: "var(--ra-gold-100)", backgroundColor: "var(--ra-navy-950)" }}
        >
          <div className="max-w-3xl mx-auto px-6 text-center">
            <span className="gold-rule block w-16 mx-auto mb-10" aria-hidden="true" />
            <h2
              className="text-2xl md:text-3xl font-light mb-4"
              style={{ color: "var(--ra-cream-50)", fontFamily: "var(--font-display)" }}
            >
              מוכנים לפתור את הסכסוך?
            </h2>
            <p
              className="text-base leading-relaxed mb-10 max-w-xl mx-auto"
              style={{ color: "hsl(40 28% 68%)", fontFamily: "var(--font-sans)" }}
            >
              פתחו תיק עכשיו — ללא עורך דין, ללא בית משפט. פסיקה מנומקת תוך ימים.
            </p>
            <Link
              href={`/new?category=${data.heCategory}`}
              className="inline-block px-12 py-5 text-sm tracking-[0.2em] uppercase font-semibold"
              style={{
                backgroundColor: "var(--ra-gold-500)",
                color: "var(--ra-navy-950)",
                fontFamily: "var(--font-sans)",
              }}
            >
              פתח תיק {data.eyebrow} — החל מ-₪299
            </Link>
          </div>
        </section>

        {/* ── Related categories ────────────────────────────────── */}
        {relatedCategories.length > 0 && (
          <section
            className="py-16 border-t"
            style={{ borderColor: "var(--ra-gold-100)", backgroundColor: "hsl(42 35% 97%)" }}
          >
            <div className="max-w-4xl mx-auto px-6">
              <p
                className="text-xs tracking-[0.25em] uppercase mb-8"
                style={{ color: "hsl(215 20% 55%)", fontFamily: "var(--font-sans)" }}
              >
                תחומי בוררות נוספים
              </p>
              <div className="flex flex-wrap gap-3">
                {relatedCategories.map((rc) => (
                  <Link
                    key={rc.slug}
                    href={`/arbitration/${rc.slug}`}
                    className="px-5 py-3 border text-sm font-medium transition-colors"
                    style={{
                      borderColor: "var(--ra-gold-200)",
                      color: "var(--ra-navy-900)",
                      backgroundColor: "white",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {CATEGORY_LABELS[rc.slug]}
                  </Link>
                ))}
                {/* Link to all other categories */}
                {CATEGORY_LIST.filter(
                  (c) => c.slug !== data.slug && !data.relatedSlugs.includes(c.slug)
                ).map((c) => (
                  <Link
                    key={c.slug}
                    href={`/arbitration/${c.slug}`}
                    className="px-5 py-3 border text-sm transition-colors"
                    style={{
                      borderColor: "var(--ra-gold-100)",
                      color: "hsl(215 20% 55%)",
                      backgroundColor: "white",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {CATEGORY_LABELS[c.slug]}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      <RaFooter />
    </>
  );
}
