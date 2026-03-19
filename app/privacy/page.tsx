"use client";

import Link from "next/link";
import { RaHeader } from "@/components/ra-header";
import { RaFooter } from "@/components/ra-footer";
import { useLanguage } from "@/lib/lang-context";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <h2
        className="text-xl md:text-2xl font-light mb-4"
        style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <span className="gold-rule-start block w-10 mb-5" aria-hidden="true" />
      {children}
    </div>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-sm leading-relaxed mb-4"
      style={{ color: "hsl(215 20% 35%)", fontFamily: "var(--font-sans)" }}
    >
      {children}
    </p>
  );
}

export default function PrivacyPage() {
  const { lang } = useLanguage();
  const isHe = lang === "he";

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
              style={{ color: "var(--ra-gold-300)", fontFamily: "var(--font-sans)" }}
            >
              <span aria-hidden="true">{isHe ? "→" : "←"}</span>
              {isHe ? "ראשי" : "Home"}
            </Link>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-light mt-6 mb-4"
              style={{ color: "var(--ra-cream-50)", fontFamily: "var(--font-display)" }}
            >
              {isHe ? "מדיניות הפרטיות" : "Privacy Policy"}
            </h1>
            <p
              className="text-sm"
              style={{ color: "hsl(40 28% 60%)", fontFamily: "var(--font-sans)" }}
            >
              {isHe ? "עדכון אחרון: מרץ 2026" : "Last updated: March 2026"}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="py-16" style={{ backgroundColor: "var(--ra-cream-50)" }}>
          <div className="max-w-3xl mx-auto px-6">

            {isHe ? (
              <>
                <Section title="1. מידע שאנו אוספים">
                  <Para>
                    בעת שימוש בשירות ResolveAI, אנו אוספים מידע שתמסרו ישירות, כולל: שמות הצדדים, כתובות דואר אלקטרוני, מספרי טלפון (אם ניתנו), ותיאור המחלוקת. מידע זה משמש אך ורק לצורך עיבוד התיק ומתן השירות.
                  </Para>
                </Section>

                <Section title="2. כיצד אנו משתמשים במידע">
                  <Para>המידע שנאסף משמש ל:</Para>
                  <Para>• עיבוד הבקשה ויצירת הפסיקה באמצעות מערכת הבינה המלאכותית.</Para>
                  <Para>• שליחת הודעת WhatsApp לצד הנתבע (אם ניתן מספר טלפון).</Para>
                  <Para>• שיפור השירות על בסיס נתונים מצטברים ואנונימיים.</Para>
                  <Para>אנו לא משתמשים במידע לצרכי שיווק ולא מוכרים מידע לגורמים שלישיים.</Para>
                </Section>

                <Section title="3. שמירת מידע">
                  <Para>
                    נתוני הפסיקה נשמרים בסשן הדפדפן בלבד (sessionStorage) ואינם נשמרים בשרתינו לטווח ארוך. פרטי הטופס מועברים לעיבוד ונמחקים לאחר יצירת הפסיקה.
                  </Para>
                </Section>

                <Section title="4. אבטחת מידע">
                  <Para>
                    כל התקשורת עם שרתינו מוצפנת באמצעות HTTPS/TLS. אנו נוקטים באמצעי אבטחה תואמים תקינה להגנה על המידע. עם זאת, אין אבטחה מושלמת — אנו ממליצים שלא למסור מידע רגיש מיותר.
                  </Para>
                </Section>

                <Section title="5. שירותי צד שלישי">
                  <Para>
                    אנו משתמשים ב-Anthropic Claude API לצורך עיבוד הבינה המלאכותית, ובשירות Twilio לשליחת הודעות WhatsApp. שירותים אלו כפופים למדיניות הפרטיות שלהם. תוכן המחלוקת מועבר ל-API של Anthropic לצורך עיבוד בלבד.
                  </Para>
                </Section>

                <Section title="6. זכויות המשתמש">
                  <Para>
                    בהתאם לחוק הגנת הפרטיות הישראלי ו-GDPR, יש לכם זכות לגשת למידע שנאסף עליכם, לתקנו, או לבקש מחיקתו. לבקשות בנושא, פנו אלינו ישירות.
                  </Para>
                </Section>

                <Section title="7. עוגיות (Cookies)">
                  <Para>
                    האתר משתמש ב-sessionStorage לאחסון נתוני הפסיקה בדפדפן בלבד. אנו לא משתמשים בעוגיות מעקב או שיווקיות.
                  </Para>
                </Section>

                <Section title="8. יצירת קשר">
                  <Para>
                    לשאלות בנוגע למדיניות הפרטיות, ניתן לפנות אלינו דרך האתר.
                  </Para>
                </Section>
              </>
            ) : (
              <>
                <Section title="1. Information We Collect">
                  <Para>
                    When using the ResolveAI service, we collect information you provide directly, including: party names, email addresses, phone numbers (if provided), and dispute descriptions. This information is used solely to process your case and provide the service.
                  </Para>
                </Section>

                <Section title="2. How We Use Your Information">
                  <Para>Collected information is used to:</Para>
                  <Para>• Process your request and generate a decision using our AI system.</Para>
                  <Para>• Send a WhatsApp notification to the respondent (if a phone number is provided).</Para>
                  <Para>• Improve the service based on aggregated, anonymized data.</Para>
                  <Para>We do not use your information for marketing and do not sell data to third parties.</Para>
                </Section>

                <Section title="3. Data Retention">
                  <Para>
                    Decision data is stored only in the browser session (sessionStorage) and is not retained on our servers long-term. Form details are processed and deleted after the decision is generated.
                  </Para>
                </Section>

                <Section title="4. Data Security">
                  <Para>
                    All communication with our servers is encrypted via HTTPS/TLS. We employ industry-standard security measures. However, no security is perfect — we recommend not submitting unnecessary sensitive information.
                  </Para>
                </Section>

                <Section title="5. Third-Party Services">
                  <Para>
                    We use Anthropic Claude API for AI processing and Twilio for WhatsApp notifications. These services are subject to their own privacy policies. Dispute content is transmitted to Anthropic's API for processing purposes only.
                  </Para>
                </Section>

                <Section title="6. Your Rights">
                  <Para>
                    Under Israeli privacy law and GDPR, you have the right to access, correct, or request deletion of information collected about you. For such requests, please contact us directly.
                  </Para>
                </Section>

                <Section title="7. Cookies">
                  <Para>
                    The site uses sessionStorage to store decision data in the browser only. We do not use tracking or marketing cookies.
                  </Para>
                </Section>

                <Section title="8. Contact">
                  <Para>
                    For questions regarding this Privacy Policy, please contact us through our website.
                  </Para>
                </Section>
              </>
            )}

            <div className="pt-8 border-t" style={{ borderColor: "var(--ra-gold-100)" }}>
              <Link
                href="/terms"
                className="text-sm underline transition-colors"
                style={{ color: "var(--ra-gold-700)", fontFamily: "var(--font-sans)" }}
              >
                {isHe ? "תנאי שימוש" : "Terms of Service"} →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <RaFooter />
    </>
  );
}
