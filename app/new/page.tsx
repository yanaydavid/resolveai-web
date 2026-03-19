"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RaHeader } from "@/components/ra-header";
import { RaFooter } from "@/components/ra-footer";
import { useLanguage } from "@/lib/lang-context";

const schema = z.object({
  caseTitle: z.string().min(5),
  partyOneName: z.string().min(2),
  partyOneEmail: z.string().email(),
  partyTwoName: z.string().min(2),
  partyTwoEmail: z.string().email(),
  partyTwoPhone: z.string().optional(),
  category: z.string().min(1),
  description: z.string().min(30),
});

type FormData = z.infer<typeof schema>;

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <label
      className="block text-xs tracking-[0.15em] uppercase mb-2 font-medium"
      style={{ color: "hsl(215 30% 38%)", fontFamily: "var(--font-sans)" }}
    >
      {label}
      {required && (
        <span style={{ color: "var(--ra-gold-700)" }} className="ms-1">
          *
        </span>
      )}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      className="text-xs mt-1.5"
      style={{ color: "hsl(0 65% 48%)", fontFamily: "var(--font-sans)" }}
    >
      {message}
    </p>
  );
}

function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-8">
      <p
        className="text-xs tracking-[0.25em] uppercase mb-2"
        style={{ color: "var(--ra-gold-500)", fontFamily: "var(--font-sans)" }}
      >
        {label}
      </p>
      <h2
        className="text-2xl md:text-3xl font-light"
        style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <span
        className="gold-rule-start block w-12 mt-4"
        aria-hidden="true"
      />
    </div>
  );
}

interface SuccessData {
  caseId: string;
  respondUrl: string;
  hasPhone: boolean;
}

export default function NewCasePage() {
  const { t, lang } = useLanguage();
  const f = t.form;
  const s = t.claim.success;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const selectedCategory = watch("category");

  const inputStyle = {
    backgroundColor: "hsl(0 0% 100%)",
    border: "1px solid var(--ra-gold-300)",
    color: "var(--ra-navy-900)",
    fontFamily: "var(--font-sans)",
    fontSize: "0.9rem",
    padding: "0.75rem 1rem",
    width: "100%",
    outline: "none",
    transition: "border-color 0.15s",
  };

  const inputFocusStyle = {
    borderColor: "var(--ra-gold-500)",
  };

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const res = await fetch("/api/submit-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, lang }),
      });

      if (!res.ok) throw new Error("API error");

      const result = await res.json();
      setSuccessData({
        caseId: result.caseId,
        respondUrl: result.respondUrl,
        hasPhone: !!data.partyTwoPhone,
      });
    } catch {
      setApiError(f.errors.apiError);
      setIsSubmitting(false);
    }
  }

  async function copyLink() {
    if (!successData) return;
    try {
      await navigator.clipboard.writeText(successData.respondUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // fallback: select text
    }
  }

  // ── Success state ─────────────────────────────────────
  if (successData) {
    return (
      <>
        <RaHeader />
        <main className="flex-1" style={{ backgroundColor: "var(--ra-cream-50)" }}>
          <div className="max-w-2xl mx-auto px-6 py-24 text-center">
            <span className="gold-rule block w-20 mx-auto mb-12" aria-hidden="true" />

            {/* Check icon */}
            <div
              className="w-16 h-16 mx-auto mb-8 flex items-center justify-center border-2"
              style={{ borderColor: "var(--ra-gold-500)" }}
            >
              <span style={{ color: "var(--ra-gold-500)", fontSize: "2rem" }}>✓</span>
            </div>

            <h1
              className="text-3xl md:text-4xl font-light mb-4"
              style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}
            >
              {s.title}
            </h1>

            <p
              className="text-xs tracking-[0.2em] uppercase mb-2"
              style={{ color: "var(--ra-gold-500)", fontFamily: "var(--font-sans)" }}
            >
              {s.caseLabel}
            </p>
            <p
              className="text-2xl font-light mb-8"
              style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}
            >
              {successData.caseId}
            </p>

            <p
              className="text-sm leading-relaxed mb-12 max-w-lg mx-auto"
              style={{ color: "hsl(215 20% 40%)", fontFamily: "var(--font-sans)" }}
            >
              {s.info}
            </p>

            {/* WhatsApp sent notice */}
            {successData.hasPhone && (
              <div
                className="p-4 mb-8 text-sm border-s-4"
                style={{
                  borderColor: "var(--ra-gold-500)",
                  backgroundColor: "hsl(42 55% 96%)",
                  textAlign: "start",
                }}
              >
                <p style={{ color: "hsl(215 20% 30%)", fontFamily: "var(--font-sans)" }}>
                  📱 {s.whatsappSent}
                </p>
              </div>
            )}

            {/* Copy link box */}
            <div
              className="p-6 mb-4 border text-start"
              style={{ borderColor: "var(--ra-gold-200, var(--ra-gold-300))", backgroundColor: "white" }}
            >
              <p
                className="text-xs tracking-[0.15em] uppercase mb-3"
                style={{ color: "hsl(215 20% 48%)", fontFamily: "var(--font-sans)" }}
              >
                {s.respondLinkLabel}
              </p>
              <div className="flex gap-3 items-center">
                <p
                  className="text-xs flex-1 break-all"
                  style={{ color: "hsl(215 20% 38%)", fontFamily: "var(--font-sans)" }}
                >
                  {successData.respondUrl}
                </p>
                <button
                  onClick={copyLink}
                  className="shrink-0 px-4 py-2 text-xs tracking-[0.12em] uppercase font-semibold transition-colors"
                  style={{
                    backgroundColor: copied ? "var(--ra-gold-700)" : "var(--ra-gold-500)",
                    color: "var(--ra-navy-950)",
                    fontFamily: "var(--font-sans)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {copied ? s.copiedBtn : s.copyBtn}
                </button>
              </div>
            </div>
            <p
              className="text-xs mb-12"
              style={{ color: "hsl(215 15% 55%)", fontFamily: "var(--font-sans)" }}
            >
              {s.copyNote}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/new"
                className="inline-block px-10 py-4 text-xs tracking-[0.2em] uppercase font-semibold transition-colors"
                style={{
                  backgroundColor: "var(--ra-navy-800)",
                  color: "var(--ra-cream-50)",
                  fontFamily: "var(--font-sans)",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--ra-navy-900)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--ra-navy-800)")
                }
              >
                {s.newCase}
              </Link>
              <Link
                href="/"
                className="inline-block px-10 py-4 text-xs tracking-[0.2em] uppercase border transition-all"
                style={{
                  borderColor: "var(--ra-gold-300)",
                  color: "hsl(215 30% 38%)",
                  fontFamily: "var(--font-sans)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = "var(--ra-gold-100)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = "transparent";
                }}
              >
                {s.home}
              </Link>
            </div>
          </div>
        </main>
        <RaFooter />
      </>
    );
  }

  return (
    <>
      <RaHeader />

      <main className="flex-1">
        {/* Page Header */}
        <div
          className="py-16 border-b"
          style={{
            backgroundColor: "var(--ra-navy-900)",
            borderColor: "hsl(215 45% 18%)",
          }}
        >
          <div className="max-w-3xl mx-auto px-6">
            <Link
              href="/"
              className="text-xs tracking-widest uppercase mb-8 inline-flex items-center gap-2 transition-colors"
              style={{
                color: "var(--ra-gold-300)",
                fontFamily: "var(--font-sans)",
              }}
            >
              <span aria-hidden="true" className="ltr:mr-1 rtl:ml-1">
                {lang === "he" ? "→" : "←"}
              </span>
              {t.nav.home}
            </Link>

            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-light mt-6 mb-4"
              style={{
                color: "var(--ra-cream-50)",
                fontFamily: "var(--font-display)",
              }}
            >
              {f.pageTitle}
            </h1>

            <p
              className="text-base leading-relaxed"
              style={{
                color: "hsl(40 28% 70%)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {f.pageSubtitle}
            </p>
          </div>
        </div>

        {/* Form */}
        <div
          className="py-16"
          style={{ backgroundColor: "var(--ra-cream-50)" }}
        >
          <div className="max-w-3xl mx-auto px-6">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Case Title */}
              <div className="mb-12">
                <FieldLabel label={f.fields.caseTitle} required />
                <input
                  {...register("caseTitle")}
                  placeholder={f.fields.caseTitlePlaceholder}
                  style={inputStyle}
                  onFocus={(e) =>
                    Object.assign(e.currentTarget.style, inputFocusStyle)
                  }
                  onBlur={(e) =>
                    Object.assign(e.currentTarget.style, {
                      borderColor: "var(--ra-gold-300)",
                    })
                  }
                />
                <FieldError
                  message={errors.caseTitle && f.errors.required}
                />
              </div>

              {/* Divider */}
              <div
                className="border-t mb-12"
                style={{ borderColor: "var(--ra-gold-100)" }}
                aria-hidden="true"
              />

              {/* Party 1 */}
              <div className="mb-12">
                <SectionHeading label="01" title={f.fields.party1} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <FieldLabel label={f.fields.name} required />
                    <input
                      {...register("partyOneName")}
                      placeholder={f.fields.name}
                      style={inputStyle}
                      onFocus={(e) =>
                        Object.assign(e.currentTarget.style, inputFocusStyle)
                      }
                      onBlur={(e) =>
                        Object.assign(e.currentTarget.style, {
                          borderColor: "var(--ra-gold-300)",
                        })
                      }
                    />
                    <FieldError
                      message={errors.partyOneName && f.errors.required}
                    />
                  </div>
                  <div>
                    <FieldLabel label={f.fields.email} required />
                    <input
                      {...register("partyOneEmail")}
                      type="email"
                      placeholder={f.fields.email}
                      style={inputStyle}
                      onFocus={(e) =>
                        Object.assign(e.currentTarget.style, inputFocusStyle)
                      }
                      onBlur={(e) =>
                        Object.assign(e.currentTarget.style, {
                          borderColor: "var(--ra-gold-300)",
                        })
                      }
                    />
                    <FieldError
                      message={
                        errors.partyOneEmail && f.errors.invalidEmail
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Party 2 */}
              <div className="mb-12">
                <SectionHeading label="02" title={f.fields.party2} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <FieldLabel label={f.fields.name} required />
                    <input
                      {...register("partyTwoName")}
                      placeholder={f.fields.name}
                      style={inputStyle}
                      onFocus={(e) =>
                        Object.assign(e.currentTarget.style, inputFocusStyle)
                      }
                      onBlur={(e) =>
                        Object.assign(e.currentTarget.style, {
                          borderColor: "var(--ra-gold-300)",
                        })
                      }
                    />
                    <FieldError
                      message={errors.partyTwoName && f.errors.required}
                    />
                  </div>
                  <div>
                    <FieldLabel label={f.fields.email} required />
                    <input
                      {...register("partyTwoEmail")}
                      type="email"
                      placeholder={f.fields.email}
                      style={inputStyle}
                      onFocus={(e) =>
                        Object.assign(e.currentTarget.style, inputFocusStyle)
                      }
                      onBlur={(e) =>
                        Object.assign(e.currentTarget.style, {
                          borderColor: "var(--ra-gold-300)",
                        })
                      }
                    />
                    <FieldError
                      message={
                        errors.partyTwoEmail && f.errors.invalidEmail
                      }
                    />
                  </div>
                </div>
                {/* WhatsApp phone field */}
                <div>
                  <FieldLabel label={f.fields.phone} />
                  <input
                    {...register("partyTwoPhone")}
                    type="tel"
                    placeholder={f.fields.phonePlaceholder}
                    style={inputStyle}
                    onFocus={(e) =>
                      Object.assign(e.currentTarget.style, inputFocusStyle)
                    }
                    onBlur={(e) =>
                      Object.assign(e.currentTarget.style, {
                        borderColor: "var(--ra-gold-300)",
                      })
                    }
                  />
                  <p
                    className="text-xs mt-1.5 flex items-center gap-1"
                    style={{ color: "hsl(215 15% 55%)", fontFamily: "var(--font-sans)" }}
                  >
                    <span>📱</span>
                    {f.fields.phoneNote}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div
                className="border-t mb-12"
                style={{ borderColor: "var(--ra-gold-100)" }}
                aria-hidden="true"
              />

              {/* Category */}
              <div className="mb-8">
                <FieldLabel label={f.fields.category} required />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {f.categories.map((cat) => {
                    const isSelected = selectedCategory === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setValue("category", cat.value)}
                        className="px-4 py-3 text-sm text-start border transition-colors"
                        style={{
                          borderColor: isSelected
                            ? "var(--ra-gold-500)"
                            : "var(--ra-gold-300)",
                          backgroundColor: isSelected
                            ? "var(--ra-gold-100)"
                            : "white",
                          color: isSelected
                            ? "var(--ra-navy-900)"
                            : "hsl(215 30% 40%)",
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
                <FieldError
                  message={errors.category && f.errors.required}
                />
              </div>

              {/* Divider */}
              <div
                className="border-t mb-12"
                style={{ borderColor: "var(--ra-gold-100)" }}
                aria-hidden="true"
              />

              {/* Description */}
              <div className="mb-12">
                <FieldLabel label={f.fields.description} required />
                <textarea
                  {...register("description")}
                  rows={8}
                  placeholder={f.fields.descriptionPlaceholder}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: "180px",
                  }}
                  onFocus={(e) =>
                    Object.assign(e.currentTarget.style, inputFocusStyle)
                  }
                  onBlur={(e) =>
                    Object.assign(e.currentTarget.style, {
                      borderColor: "var(--ra-gold-300)",
                    })
                  }
                />
                <FieldError
                  message={errors.description && f.errors.minLength}
                />
              </div>

              {/* Documents (UI only) */}
              <div className="mb-14">
                <FieldLabel label={f.fields.documents} />
                <div
                  className="border border-dashed p-8 text-center cursor-pointer transition-colors"
                  style={{
                    borderColor: "var(--ra-gold-300)",
                    backgroundColor: "white",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--ra-gold-100)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      "white")
                  }
                >
                  <p
                    className="text-sm mb-2"
                    style={{
                      color: "hsl(215 30% 45%)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {selectedFiles && selectedFiles.length > 0
                      ? `${selectedFiles.length} ${f.fields.documentsSelected}`
                      : f.fields.documentsButton}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: "hsl(215 15% 58%)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {f.fields.documentsNote}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => setSelectedFiles(e.target.files)}
                  />
                </div>
              </div>

              {/* API Error */}
              {apiError && (
                <div
                  className="p-4 mb-8 text-sm border"
                  style={{
                    borderColor: "hsl(0 65% 48% / 0.3)",
                    backgroundColor: "hsl(0 65% 48% / 0.05)",
                    color: "hsl(0 65% 40%)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {apiError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 text-sm tracking-[0.2em] uppercase font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isSubmitting
                    ? "var(--ra-navy-700)"
                    : "var(--ra-navy-800)",
                  color: "var(--ra-cream-50)",
                  fontFamily: "var(--font-sans)",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting)
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--ra-navy-900)";
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting)
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--ra-navy-800)";
                }}
              >
                {isSubmitting ? f.fields.submitting : f.fields.submit}
              </button>
            </form>
          </div>
        </div>
      </main>

      <RaFooter />
    </>
  );
}
