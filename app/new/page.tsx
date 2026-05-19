"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RaHeader } from "@/components/ra-header";
import { RaFooter } from "@/components/ra-footer";
import { useLanguage } from "@/lib/lang-context";
import { PLANS } from "@/lib/payment";

const schema = z.object({
  caseTitle: z.string().min(5),
  partyOneName: z.string().min(2),
  partyOneEmail: z.string().email(),
  partyOnePhone: z.string().optional(),
  partyTwoName: z.string().min(2),
  partyTwoEmail: z.string().email().optional().or(z.literal("")),
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
  caseTitle: string;
  respondUrl: string;
  shortUrl: string;
  hasPhone: boolean;
  partyOneName: string;
  partyTwoName: string;
  partyTwoPhone: string;
}

function toWaPhone(phone: string): string {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("0")) p = "972" + p.slice(1);
  return p;
}

function NewCaseContent() {
  const { t, lang } = useLanguage();
  const f = t.form;
  const s = t.claim.success;
  const searchParams = useSearchParams();
  const paymentToken = searchParams.get("token") || "";
  const planId = searchParams.get("plan") || "";
  const plan = PLANS.find((p) => p.id === planId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [copied, setCopied] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [ageError, setAgeError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customCategoryRef = useRef<HTMLInputElement>(null);

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
    setDocumentError(null);
    setAgeError(false);

    if (!ageConfirmed) {
      setAgeError(true);
      return;
    }

    if (!selectedFiles || selectedFiles.length === 0) {
      setDocumentError(
        lang === "he"
          ? "יש להעלות לפחות מסמך אחד לתמיכה בתביעה"
          : "Please upload at least one supporting document"
      );
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const fd = new FormData();
      fd.append("caseTitle", data.caseTitle);
      fd.append("partyOneName", data.partyOneName);
      fd.append("partyOneEmail", data.partyOneEmail);
      if (data.partyOnePhone) fd.append("partyOnePhone", data.partyOnePhone);
      fd.append("partyTwoName", data.partyTwoName);
      if (data.partyTwoEmail) fd.append("partyTwoEmail", data.partyTwoEmail);
      if (data.partyTwoPhone) fd.append("partyTwoPhone", data.partyTwoPhone);
      fd.append("category", data.category === "other" && customCategory.trim()
        ? customCategory.trim()
        : data.category);
      fd.append("description", data.description);
      fd.append("lang", lang);
      fd.append("document", selectedFiles[0]);
      if (paymentToken) fd.append("paymentToken", paymentToken);
      if (planId) fd.append("planId", planId);

      const res = await fetch("/api/submit-claim", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData?.error || f.errors.apiError;
        setApiError(errMsg);
        setIsSubmitting(false);
        return;
      }

      const result = await res.json();
      setSuccessData({
        caseId: result.caseId,
        caseTitle: data.caseTitle,
        respondUrl: result.respondUrl,
        shortUrl: result.shortUrl || result.respondUrl,
        hasPhone: !!data.partyTwoPhone,
        partyOneName: data.partyOneName,
        partyTwoName: data.partyTwoName,
        partyTwoPhone: data.partyTwoPhone || "",
      });
    } catch {
      setApiError(f.errors.apiError);
      setIsSubmitting(false);
    }
  }

  async function copyLink() {
    if (!successData) return;
    try {
      await navigator.clipboard.writeText(successData.shortUrl);
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

            {/* WhatsApp CTA — send from your own phone */}
            {successData.hasPhone ? (
              <div className="mb-10">
                <p
                  className="text-sm mb-4 leading-relaxed"
                  style={{ color: "hsl(215 20% 40%)", fontFamily: "var(--font-sans)" }}
                >
                  {lang === "he"
                    ? `עכשיו שלחו לנתבע הודעת WhatsApp מהנייד שלכם — ההודעה כבר כתובה:`
                    : `Now send the respondent a WhatsApp message from your phone — the message is ready:`}
                </p>
                <a
                  href={`https://wa.me/${toWaPhone(successData.partyTwoPhone)}?text=${encodeURIComponent(
                    lang === "he"
                      ? `שלום ${successData.partyTwoName},\n\n${successData.partyOneName} הגיש/ה נגדך בקשה לבוררות ב-ResolveAI.\n\nפרטי התיק:\n• מספר תיק: ${successData.caseId}\n• כותרת: ${successData.caseTitle}\n\nיש לך 14 ימי עסקים להגיש את עמדתך דרך הקישור הבא:\n${successData.shortUrl}\n\nResolveAI — בוררות חכמה מבוססת בינה מלאכותית`
                      : `Hello ${successData.partyTwoName},\n\n${successData.partyOneName} has filed an arbitration request against you on ResolveAI.\n\nCase Details:\n• Case ID: ${successData.caseId}\n• Title: ${successData.caseTitle}\n\nYou have 14 business days to submit your position via the link below:\n${successData.shortUrl}\n\nResolveAI — Smart AI-Powered Arbitration`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-5 text-base font-semibold transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: "#25D366",
                    color: "white",
                    fontFamily: "var(--font-sans)",
                    textDecoration: "none",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {lang === "he"
                    ? `שלח הודעה ל${successData.partyTwoName} ב-WhatsApp`
                    : `Send WhatsApp to ${successData.partyTwoName}`}
                </a>
                <p
                  className="text-xs mt-2 text-center"
                  style={{ color: "hsl(215 15% 55%)", fontFamily: "var(--font-sans)" }}
                >
                  {lang === "he"
                    ? "הנתבע מכיר את המספר שלך — ההודעה תגיע ממך ישירות"
                    : "The respondent knows your number — the message comes directly from you"}
                </p>
              </div>
            ) : (
              <div className="mb-10 p-5 border-s-4"
                style={{ borderColor: "var(--ra-gold-300)", backgroundColor: "hsl(42 55% 96%)" }}>
                <p className="text-sm" style={{ color: "hsl(215 20% 35%)", fontFamily: "var(--font-sans)" }}>
                  {lang === "he"
                    ? "שלחו את הקישור לנתבע בכל ערוץ שתרצו (מייל, WhatsApp, SMS)."
                    : "Send the link to the respondent via any channel (email, WhatsApp, SMS)."}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => { window.location.href = "/new"; }}
                className="inline-block px-10 py-4 text-xs tracking-[0.2em] uppercase font-semibold transition-colors"
                style={{
                  backgroundColor: "var(--ra-navy-800)",
                  color: "var(--ra-cream-50)",
                  fontFamily: "var(--font-sans)",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--ra-navy-900)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--ra-navy-800)")
                }
              >
                {s.newCase}
              </button>
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

            {/* Plan badge */}
            {plan && (
              <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 border text-xs tracking-[0.12em] uppercase"
                style={{
                  borderColor: "var(--ra-gold-500)",
                  color: "var(--ra-gold-300)",
                  fontFamily: "var(--font-sans)",
                  backgroundColor: "hsl(42 48% 10%)",
                }}>
                ✓ {lang === "he" ? `תוכנית ${plan.nameHe}` : `${plan.nameEn} Plan`}
                {plan.price === 0 || paymentToken
                  ? (lang === "he" ? " — בטא חינמי" : " — Beta Free")
                  : ` — ₪${plan.price}`}
              </div>
            )}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
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
                {/* Claimant phone */}
                <div>
                  <FieldLabel label={lang === "he" ? "מספר טלפון שלכם (WhatsApp)" : "Your Phone Number (WhatsApp)"} />
                  <input
                    {...register("partyOnePhone")}
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
                    className="text-xs mt-1.5"
                    style={{ color: "hsl(215 15% 55%)", fontFamily: "var(--font-sans)" }}
                  >
                    {lang === "he"
                      ? "לעדכונים בWhatsApp כשהנתבע מגיב"
                      : "For WhatsApp updates when the respondent replies"}
                  </p>
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
                    <FieldLabel label={f.fields.email} />
                    <input
                      {...register("partyTwoEmail")}
                      type="email"
                      placeholder={lang === "he" ? "אופציונלי" : "Optional"}
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
                        onClick={() => {
                          setValue("category", cat.value);
                          if (cat.value === "other") {
                            setTimeout(() => customCategoryRef.current?.focus(), 50);
                          }
                        }}
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

                {/* Custom category input — shown only when "אחר" is selected */}
                {selectedCategory === "other" && (
                  <div className="mt-3">
                    <input
                      ref={customCategoryRef}
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder={lang === "he" ? "פרטו את סוג המחלוקת..." : "Describe the dispute type..."}
                      style={{
                        ...inputStyle,
                        borderColor: "var(--ra-gold-500)",
                        backgroundColor: "var(--ra-gold-100)",
                      }}
                      onFocus={(e) =>
                        Object.assign(e.currentTarget.style, { borderColor: "var(--ra-navy-800)" })
                      }
                      onBlur={(e) =>
                        Object.assign(e.currentTarget.style, { borderColor: "var(--ra-gold-500)" })
                      }
                    />
                  </div>
                )}

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

              {/* Documents (required) */}
              <div className="mb-14">
                <FieldLabel label={f.fields.documents} required />
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
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      setSelectedFiles(e.target.files);
                      setDocumentError(null);
                    }}
                  />
                </div>
                {documentError && (
                  <p className="text-xs mt-1.5" style={{ color: "hsl(0 65% 48%)", fontFamily: "var(--font-sans)" }}>
                    {documentError}
                  </p>
                )}
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

              {/* Age + Terms confirmation */}
              <label className="flex items-start gap-3 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={e => { setAgeConfirmed(e.target.checked); setAgeError(false); }}
                  className="mt-1 shrink-0 w-4 h-4 accent-[var(--ra-navy-800)]"
                />
                <span className="text-sm leading-relaxed" style={{ color: "hsl(215 20% 35%)", fontFamily: "var(--font-sans)" }}>
                  {lang === "he"
                    ? <>אני מאשר/ת שאני בן/בת 18 ומעלה, וכי קראתי ומסכים/ה ל<a href="/terms" target="_blank" className="underline" style={{ color: "var(--ra-gold-700)" }}>תקנון ותנאי השימוש</a>.</>
                    : <>I confirm that I am 18 years of age or older and that I have read and agree to the <a href="/terms" target="_blank" className="underline" style={{ color: "var(--ra-gold-700)" }}>Terms of Service</a>.</>
                  }
                </span>
              </label>
              {ageError && (
                <p className="text-sm mb-4" style={{ color: "hsl(0 65% 45%)", fontFamily: "var(--font-sans)" }}>
                  {lang === "he" ? "יש לאשר את התנאים לפני הגשת התיק." : "You must confirm the terms before submitting."}
                </p>
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
                {isSubmitting ? (lang === "he" ? "מנתח מסמכים..." : "Analyzing documents...") : f.fields.submit}
              </button>
            </form>
          </div>
        </div>
      </main>

      <RaFooter />
    </>
  );
}

export default function NewCasePage() {
  return (
    <Suspense fallback={null}>
      <NewCaseContent />
    </Suspense>
  );
}
