"use client";

import { useState } from "react";
import Link from "next/link";
import { RaHeader } from "@/components/ra-header";
import { RaFooter } from "@/components/ra-footer";
import { useLanguage } from "@/lib/lang-context";

export default function LandingPage() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <RaHeader />

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section
          className="relative min-h-[92vh] flex items-center"
          style={{ backgroundColor: "var(--ra-navy-950)" }}
        >
          {/* Subtle ruled background */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 72px, hsl(42 48% 72%) 72px, hsl(42 48% 72%) 73px)",
            }}
            aria-hidden="true"
          />

          <div className="relative max-w-5xl mx-auto px-6 py-28 text-center w-full">
            <div className="mb-8">
              <p
                className="text-4xl sm:text-5xl font-semibold tracking-wide mb-2"
                style={{
                  color: "var(--ra-gold-500)",
                  fontFamily: "var(--font-display)",
                }}
              >
                Resolve<span style={{ color: "var(--ra-gold-300)" }}>AI</span>
              </p>
              <p
                className="text-sm tracking-[0.2em]"
                style={{
                  color: "var(--ra-gold-300)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                בוררות חכמה מבוססת בינה מלאכותית
              </p>
            </div>

            <span
              className="gold-rule block w-20 mx-auto mb-10"
              aria-hidden="true"
            />

            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light leading-[1.08] mb-10"
              style={{
                color: "var(--ra-cream-50)",
                fontFamily: "var(--font-display)",
              }}
            >
              {t.hero.title}
            </h1>

            <p
              className="text-lg md:text-xl max-w-2xl mx-auto mb-14 leading-relaxed"
              style={{
                color: "hsl(40 28% 74%)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/new"
                className="inline-block px-10 py-4 text-xs tracking-[0.2em] uppercase font-semibold transition-colors"
                style={{
                  backgroundColor: "var(--ra-gold-500)",
                  color: "var(--ra-navy-950)",
                  fontFamily: "var(--font-sans)",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--ra-gold-700)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--ra-gold-500)")
                }
              >
                {t.hero.primaryCta}
              </Link>

              <a
                href="#how-it-works"
                className="inline-block px-10 py-4 text-xs tracking-[0.2em] uppercase border transition-all"
                style={{
                  borderColor: "hsl(42 48% 72% / 0.35)",
                  color: "var(--ra-gold-300)",
                  fontFamily: "var(--font-sans)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--ra-gold-300)";
                  el.style.backgroundColor = "hsl(42 48% 72% / 0.07)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "hsl(42 48% 72% / 0.35)";
                  el.style.backgroundColor = "transparent";
                }}
              >
                {t.hero.secondaryCta}
              </a>
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="py-28"
          style={{ backgroundColor: "var(--ra-cream-50)" }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
              <p
                className="text-xs tracking-[0.3em] uppercase mb-4"
                style={{
                  color: "var(--ra-gold-500)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {t.howItWorks.label}
              </p>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-light"
                style={{
                  color: "var(--ra-navy-900)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {t.howItWorks.title}
              </h2>
              <span
                className="gold-rule block w-16 mx-auto mt-6"
                aria-hidden="true"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-10">
              {t.howItWorks.steps.map((step, i) => (
                <div
                  key={step.number}
                  className="flex flex-col items-center md:items-start text-center md:text-start"
                >
                  <p
                    className="text-8xl lg:text-9xl font-light leading-none mb-3 select-none"
                    style={{
                      color: "var(--ra-gold-100)",
                      fontFamily: "var(--font-display)",
                    }}
                    aria-hidden="true"
                  >
                    {step.number}
                  </p>

                  <span
                    className="gold-rule-start block w-12 mb-6"
                    aria-hidden="true"
                  />

                  <h3
                    className="text-xl md:text-2xl font-semibold mb-4"
                    style={{
                      color: "var(--ra-navy-900)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-base leading-relaxed"
                    style={{
                      color: "hsl(215 20% 38%)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why ResolveAI ─────────────────────────────────────── */}
        <section
          className="py-28"
          style={{ backgroundColor: "var(--ra-navy-900)" }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
              <p
                className="text-xs tracking-[0.3em] uppercase mb-4"
                style={{
                  color: "var(--ra-gold-300)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {t.why.label}
              </p>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-light"
                style={{
                  color: "var(--ra-cream-50)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {t.why.title}
              </h2>
              <span
                className="gold-rule block w-16 mx-auto mt-6"
                aria-hidden="true"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px"
              style={{ backgroundColor: "hsl(215 45% 17%)" }}
            >
              {t.why.benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="p-8 lg:p-10"
                  style={{ backgroundColor: "hsl(215 45% 17%)" }}
                >
                  <div
                    className="w-8 h-px mb-6"
                    style={{ backgroundColor: "var(--ra-gold-500)" }}
                    aria-hidden="true"
                  />
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{
                      color: "var(--ra-gold-300)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {benefit.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: "hsl(40 20% 68%)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {benefit.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ───────────────────────────────────────────── */}
        <section
          id="pricing"
          className="py-28"
          style={{ backgroundColor: "var(--ra-cream-50)" }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
              <p
                className="text-xs tracking-[0.3em] uppercase mb-4"
                style={{
                  color: "var(--ra-gold-500)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {t.pricing.label}
              </p>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-light"
                style={{
                  color: "var(--ra-navy-900)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {t.pricing.title}
              </h2>
              <span
                className="gold-rule block w-16 mx-auto mt-6"
                aria-hidden="true"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px"
              style={{ backgroundColor: "var(--ra-gold-100)" }}
            >
              {t.pricing.tiers.map((tier) => (
                <div
                  key={tier.name}
                  className="p-10 flex flex-col"
                  style={{
                    backgroundColor: tier.highlighted
                      ? "var(--ra-navy-900)"
                      : "white",
                  }}
                >
                  {/* Badge */}
                  {"badge" in tier && tier.badge ? (
                    <p
                      className="text-xs tracking-[0.2em] uppercase mb-4"
                      style={{
                        color: "var(--ra-gold-500)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      ✦ {tier.badge}
                    </p>
                  ) : (
                    <div className="mb-8" />
                  )}

                  <h3
                    className="text-2xl font-light mb-2"
                    style={{
                      color: tier.highlighted
                        ? "var(--ra-cream-50)"
                        : "var(--ra-navy-900)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {tier.name}
                  </h3>

                  <div className="mb-8">
                    <span
                      className="text-5xl font-light"
                      style={{
                        color: tier.highlighted
                          ? "var(--ra-gold-300)"
                          : "var(--ra-navy-900)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {tier.price}
                    </span>
                    <span
                      className="text-sm ms-2"
                      style={{
                        color: tier.highlighted
                          ? "hsl(40 28% 60%)"
                          : "hsl(215 20% 48%)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {tier.unit}
                    </span>
                  </div>

                  <ul className="space-y-3 flex-1">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-3">
                        <span
                          style={{
                            color: "var(--ra-gold-500)",
                            fontSize: "0.7rem",
                            marginTop: "0.3rem",
                          }}
                        >
                          ✦
                        </span>
                        <span
                          className="text-sm leading-relaxed"
                          style={{
                            color: tier.highlighted
                              ? "hsl(40 28% 72%)"
                              : "hsl(215 20% 38%)",
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/new"
                    className="mt-10 block text-center py-3 text-xs tracking-[0.18em] uppercase font-semibold transition-colors"
                    style={{
                      backgroundColor: tier.highlighted
                        ? "var(--ra-gold-500)"
                        : "transparent",
                      color: tier.highlighted
                        ? "var(--ra-navy-950)"
                        : "var(--ra-navy-800)",
                      border: tier.highlighted
                        ? "none"
                        : "1px solid var(--ra-gold-300)",
                      fontFamily: "var(--font-sans)",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.backgroundColor = tier.highlighted
                        ? "var(--ra-gold-700)"
                        : "var(--ra-gold-100)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.backgroundColor = tier.highlighted
                        ? "var(--ra-gold-500)"
                        : "transparent";
                    }}
                  >
                    {t.hero.primaryCta}
                  </Link>
                </div>
              ))}
            </div>

            {/* Beta note */}
            <p
              className="text-center text-sm mt-10"
              style={{
                color: "hsl(215 20% 48%)",
                fontFamily: "var(--font-sans)",
              }}
            >
              🎉 {t.pricing.beta}
            </p>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────── */}
        <section
          id="faq"
          className="py-28"
          style={{ backgroundColor: "var(--ra-navy-950)" }}
        >
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-20">
              <p
                className="text-xs tracking-[0.3em] uppercase mb-4"
                style={{
                  color: "var(--ra-gold-300)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {t.faq.label}
              </p>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-light"
                style={{
                  color: "var(--ra-cream-50)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {t.faq.title}
              </h2>
              <span
                className="gold-rule block w-16 mx-auto mt-6"
                aria-hidden="true"
              />
            </div>

            <div className="divide-y" style={{ borderColor: "hsl(215 45% 22%)" }}>
              {t.faq.items.map((item, i) => (
                <div key={i} style={{ borderColor: "hsl(215 45% 22%)" }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-6 py-6 text-start"
                  >
                    <span
                      className="text-base font-light leading-snug"
                      style={{
                        color: "var(--ra-cream-50)",
                        fontFamily: "var(--font-display)",
                        fontSize: "1.125rem",
                      }}
                    >
                      {item.q}
                    </span>
                    <span
                      className="shrink-0 text-xl leading-none"
                      style={{ color: "var(--ra-gold-500)" }}
                      aria-hidden="true"
                    >
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === i && (
                    <p
                      className="pb-6 text-sm leading-relaxed"
                      style={{
                        color: "hsl(40 20% 65%)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {item.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ────────────────────────────────────────── */}
        <section
          className="py-28"
          style={{ backgroundColor: "var(--ra-navy-950)" }}
        >
          <div className="max-w-2xl mx-auto px-6 text-center">
            <span
              className="gold-rule block w-24 mx-auto mb-12"
              aria-hidden="true"
            />

            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-light italic mb-8"
              style={{
                color: "var(--ra-cream-50)",
                fontFamily: "var(--font-display)",
              }}
            >
              {t.cta.title}
            </h2>

            <p
              className="text-base md:text-lg mb-14 leading-relaxed"
              style={{
                color: "hsl(40 28% 72%)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {t.cta.subtitle}
            </p>

            <Link
              href="/new"
              className="inline-block px-14 py-5 text-xs tracking-[0.25em] uppercase font-semibold transition-colors"
              style={{
                backgroundColor: "var(--ra-gold-500)",
                color: "var(--ra-navy-950)",
                fontFamily: "var(--font-sans)",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor =
                  "var(--ra-gold-700)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor =
                  "var(--ra-gold-500)")
              }
            >
              {t.cta.button}
            </Link>
          </div>
        </section>
      </main>

      <RaFooter />
    </>
  );
}
