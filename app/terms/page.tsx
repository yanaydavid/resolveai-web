"use client";

import Link from "next/link";
import { RaHeader } from "@/components/ra-header";
import { RaFooter } from "@/components/ra-footer";
import { useLanguage } from "@/lib/lang-context";

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="mb-14 scroll-mt-8">
      <h2
        className="text-xl md:text-2xl font-light mb-4"
        style={{ color: "var(--ra-navy-900)", fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <span className="gold-rule-start block w-10 mb-6" aria-hidden="true" />
      {children}
    </div>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-[1.9] mb-4" style={{ color: "hsl(215 20% 28%)", fontFamily: "var(--font-sans)" }}>
      {children}
    </p>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold mb-3" style={{ color: "var(--ra-navy-800)", fontFamily: "var(--font-sans)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function AlertBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="p-6 mb-8 border-s-4"
      style={{ borderColor: "var(--ra-gold-500)", backgroundColor: "hsl(42 55% 95%)" }}
    >
      <p className="text-sm leading-relaxed font-medium" style={{ color: "hsl(215 30% 22%)", fontFamily: "var(--font-sans)" }}>
        {children}
      </p>
    </div>
  );
}

const TOC_HE = [
  { id: "s1", label: "1. הגדרות" },
  { id: "s2", label: "2. אופי השירות — הבהרה קריטית" },
  { id: "s3", label: "3. הסכמה לתנאים" },
  { id: "s4", label: "4. זכאות ותנאי שימוש מותר" },
  { id: "s5", label: "5. תהליך הבוררות" },
  { id: "s6", label: "6. אי-מחייבות ומעמד משפטי" },
  { id: "s7", label: "7. קניין רוחני" },
  { id: "s8", label: "8. הגנת פרטיות" },
  { id: "s9", label: "9. הגבלת אחריות" },
  { id: "s10", label: "10. שיפוי" },
  { id: "s11", label: "11. ביטול ומדיניות החזרים" },
  { id: "s12", label: "13. שינויים בתנאים" },
  { id: "s13", label: "13. דין חל וסמכות שיפוט" },
  { id: "s14", label: "14. פרידות ושלמות" },
  { id: "s15", label: "15. יצירת קשר" },
];

export default function TermsPage() {
  const { lang } = useLanguage();

  if (lang !== "he") {
    return <TermsPageEn />;
  }

  return (
    <>
      <RaHeader />

      <main className="flex-1">
        {/* Page Header */}
        <div
          className="py-16 border-b"
          style={{ backgroundColor: "var(--ra-navy-900)", borderColor: "hsl(215 45% 18%)" }}
        >
          <div className="max-w-4xl mx-auto px-6">
            <Link
              href="/"
              className="text-xs tracking-widest uppercase mb-8 inline-flex items-center gap-2"
              style={{ color: "var(--ra-gold-300)", fontFamily: "var(--font-sans)" }}
            >
              <span>→</span> ראשי
            </Link>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-light mt-6 mb-3"
              style={{ color: "var(--ra-cream-50)", fontFamily: "var(--font-display)" }}
            >
              תקנון ותנאי שימוש
            </h1>
            <p className="text-sm" style={{ color: "hsl(40 28% 60%)", fontFamily: "var(--font-sans)" }}>
              גרסה 1.0 | עדכון אחרון: מרץ 2026 | ResolveAI
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="py-16" style={{ backgroundColor: "var(--ra-cream-50)" }}>
          <div className="max-w-4xl mx-auto px-6">

            {/* TOC */}
            <div
              className="p-6 mb-14 border"
              style={{ borderColor: "var(--ra-gold-100)", backgroundColor: "white" }}
            >
              <p className="text-xs tracking-[0.2em] uppercase mb-4 font-semibold" style={{ color: "var(--ra-gold-700)", fontFamily: "var(--font-sans)" }}>
                תוכן עניינים
              </p>
              <ul className="space-y-1.5">
                {TOC_HE.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-sm underline"
                      style={{ color: "hsl(215 30% 40%)", fontFamily: "var(--font-sans)" }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <AlertBox>
              ⚠️ הודעה חשובה: פלטפורמת ResolveAI מספקת שירות טכנולוגי לניהול מחלוקות ואינה משרד עורכי דין. הניתוחים וההמלצות המופקים על ידי מערכת הבינה המלאכותית אינם מהווים ייעוץ משפטי, חוות דעת משפטית, או פסק בוררות מחייב על פי חוק הבוררות, תשכ"ח-1968, אלא אם כן הצדדים ערכו הסכם בוררות בכתב עומד בדרישות החוק. מומלץ להתייעץ עם עורך דין לגבי הסכסוך הספציפי שלך.
            </AlertBox>

            {/* ── Section 1 ── */}
            <Section id="s1" title="1. הגדרות">
              <Para>בתקנון זה, המונחים הבאים יפורשו כדלקמן:</Para>
              <ul className="space-y-2 mb-4" style={{ fontFamily: "var(--font-sans)" }}>
                {[
                  ['"ResolveAI" / "הפלטפורמה" / "החברה"', 'שירות ResolveAI, המופעל על ידי בעלי הפלטפורמה, המספק כלי טכנולוגי לניהול מחלוקות באמצעות בינה מלאכותית.'],
                  ['"משתמש" / "אתה"', 'כל אדם טבעי או תאגיד הגולש באתר, נרשם לשירות, או משתמש בו בכל דרך שהיא.'],
                  ['"תובע"', 'הצד המגיש את הבקשה לבוררות דרך הפלטפורמה.'],
                  ['"נתבע"', 'הצד שכנגדו מוגשת הבקשה לבוררות.'],
                  ['"תוצר AI"', 'כל ניתוח, המלצה, פסיקה מוצעת, או פלט אחר המופק על ידי מערכת הבינה המלאכותית של הפלטפורמה.'],
                  ['"הסכם בוררות"', 'הסכם נפרד בכתב, החתום על ידי הצדדים, הממנה את ResolveAI או מנגנון אחר כבורר מחייב בהתאם לחוק הבוררות, תשכ"ח-1968.'],
                  ['"ימי עסקים"', 'ימים ראשון עד חמישי, למעט שבת, ערב שבת, חגי ישראל, ימי זיכרון מוכרים, ואירועי כוח עליון.'],
                ].map(([term, def]) => (
                  <li key={term as string} className="text-sm leading-relaxed flex gap-2" style={{ color: "hsl(215 20% 28%)" }}>
                    <span className="font-semibold shrink-0" style={{ color: "var(--ra-navy-800)" }}>{term}:</span>
                    <span>{def}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* ── Section 2 ── */}
            <Section id="s2" title="2. אופי השירות — הבהרה קריטית">
              <SubSection title="2.1 שירות טכנולוגי — לא שירות משפטי">
                <Para>
                  ResolveAI הינה פלטפורמה טכנולוגית המאפשרת לצדדים במחלוקת להציג את עמדותיהם ולקבל ניתוח מבוסס-בינה מלאכותית. הפלטפורמה <strong>אינה</strong> משרד עורכי דין, אינה מעסיקה עורכי דין בקשר לשירות, ואינה רשאית לייצג לקוחות בפני בתי משפט.
                </Para>
                <Para>
                  השימוש בפלטפורמה <strong>אינו מקים יחסי עורך דין-לקוח</strong> בין ResolveAI לבין המשתמש.
                </Para>
              </SubSection>

              <SubSection title="2.2 מגבלות הבינה המלאכותית">
                <Para>
                  מערכות בינה מלאכותית עלולות לייצר תוצרים שגויים, חלקיים, מוטים, מיושנים, או בלתי-רלוונטיים לנסיבות הספציפיות של המשתמש. תופעה המכונה "הזיה" (hallucination) עלולה לגרום למערכת לציין עובדות, פסיקות, או עקרונות משפטיים שאינם קיימים. ResolveAI <strong>אינה מתחייבת</strong> לדיוק, שלמות, או נכונות של כל תוצר AI.
                </Para>
                <Para>
                  תוצרי AI אינם מחליפים ייעוץ של עורך דין מורשה. לפני נקיטת כל צעד משפטי, יש להתייעץ עם עורך דין.
                </Para>
              </SubSection>

              <SubSection title="2.3 דעת לשכת עורכי הדין (AT/60/24, מאי 2024)">
                <Para>
                  בהתאם לגילוי הדעת של ועדת האתיקה של לשכת עורכי הדין (AT/60/24), תוצרי בינה מלאכותית בתחום המשפטי דורשים בדיקה עצמאית ואינם ניתנים להסתמכות ללא אימות. ResolveAI מפנה את המשתמשים לגילוי דעת זה כחלק מגילוי מלא.
                </Para>
              </SubSection>
            </Section>

            {/* ── Section 3 ── */}
            <Section id="s3" title="3. הסכמה לתנאים">
              <Para>
                השימוש בפלטפורמה מהווה הסכמה מלאה ובלתי-מסויגת לתנאים אלו. אם אינך מסכים לתנאים אלו, <strong>אל תשתמש בפלטפורמה</strong>.
              </Para>
              <Para>
                תנאים אלו יחד עם <Link href="/privacy" className="underline" style={{ color: "var(--ra-gold-700)" }}>מדיניות הפרטיות</Link> מהווים את ההסכם המלא בין ResolveAI לבין המשתמש. בהיעדר הסכם בכתב נפרד וחתום, אין תוקף לכל הסכמה בעל-פה או כתיבה חיצונית לתנאים אלו.
              </Para>
              <Para>
                ResolveAI שומרת את הסיסמא (audit log) של גרסת התנאים שהוצגה לכל משתמש ותאריך קבלתם, כנדרש בהתאם לפסיקת בתי המשפט בישראל בעניין תנאי שימוש מקוונים.
              </Para>
            </Section>

            {/* ── Section 4 ── */}
            <Section id="s4" title="4. זכאות ותנאי שימוש מותר">
              <SubSection title="4.1 זכאות">
                <Para>
                  השירות מיועד לאנשים בני 18 שנים ומעלה, ולתאגידים הפועלים כדין. שימוש בפלטפורמה על-ידי קטינים אסור.
                </Para>
              </SubSection>

              <SubSection title="4.2 שימוש מותר">
                <Para>
                  המשתמש מתחייב: (א) לספק מידע אמיתי, מדויק, ושלם; (ב) לא להגיש תביעות שקריות, מוטרדות, או בחוסר-תום-לב; (ג) לא לנסות לחדור למערכות הפלטפורמה; (ד) לא לעשות שימוש אוטומטי בפלטפורמה ללא אישור מראש ובכתב; (ה) לא להפיץ תוצרי AI כייעוץ משפטי מוסמך.
                </Para>
              </SubSection>

              <SubSection title="4.3 עסקים">
                <Para>
                  אם המשתמש פועל בשם תאגיד, הוא מצהיר כי הוא מוסמך לחייב את התאגיד בתנאים אלו.
                </Para>
              </SubSection>
            </Section>

            {/* ── Section 5 ── */}
            <Section id="s5" title="5. תהליך הבוררות בפלטפורמה">
              <SubSection title="5.1 הגשת תביעה">
                <Para>
                  תובע המגיש תביעה דרך הפלטפורמה מסכים כי: (א) הוא מוסמך להגיש את התביעה; (ב) המידע שמסר הוא אמיתי לטובת ידיעתו; (ג) הגשת תביעה כוזבת עשויה לחשוף אותו לתביעה אזרחית.
                </Para>
              </SubSection>

              <SubSection title="5.2 זכות הנתבע להישמע">
                <Para>
                  ResolveAI מחויבת לעיקרון שמיעת שני הצדדים. לנתבע ניתנת תקופה של <strong>14 ימי עסקים</strong> מרגע שנשלח לו הקישור להגשת עמדתו. פסיקה שתינתן בתקופה זו תציין שהנתבע לא הגיש עמדה. חלפו 14 ימי העסקים ללא תגובה — התובע רשאי לבקש פסיקה בהיעדר עמדת הנתבע.
                </Para>
              </SubSection>

              <SubSection title="5.3 תוצר AI — אינו פסק בוררות מחייב">
                <Para>
                  <strong>תוצר AI שמפיקה הפלטפורמה אינו פסק בוררות מחייב לפי חוק הבוררות, תשכ"ח-1968.</strong> על מנת להפוך את תוצאות הפלטפורמה למחייבות כמו פסק בוררות, על הצדדים לערוך הסכם בוררות נפרד בכתב, חתום על ידי שני הצדדים, המציין את ResolveAI כגורם המוסמך לבורר, ועומד בכל דרישות חוק הבוררות.
                </Para>
              </SubSection>

              <SubSection title="5.4 הגשת מסמכים">
                <Para>
                  ResolveAI אינה מאמתת את אמיתות המסמכים שמוגשים לפלטפורמה. האחריות לאמיתות ולדיוק המידע המוגש היא של המגיש בלבד. הגשת מסמכים מזויפים עשויה לעלות לכדי עבירה פלילית.
                </Para>
              </SubSection>
            </Section>

            {/* ── Section 6 ── */}
            <Section id="s6" title="6. אי-מחייבות ומעמד משפטי של תוצרי הפלטפורמה">
              <AlertBox>
                תוצרי הפלטפורמה מיועדים לסייע לצדדים להבין את מחלוקתם ואינם מחליפים הליך משפטי רשמי. ResolveAI פועלת כמאפשרת טכנולוגית בלבד ואינה צד למחלוקת.
              </AlertBox>

              <SubSection title="6.1 לא ייעוץ משפטי">
                <Para>
                  כל מידע, ניתוח, הסבר, המלצה, או פסיקה מוצעת המופיעים בפלטפורמה <strong>אינם מהווים ייעוץ משפטי</strong> כמשמעותו בחוק לשכת עורכי הדין, תשכ"א-1961. ResolveAI אינה מורשית לעסוק בייצוג משפטי.
                </Para>
              </SubSection>

              <SubSection title="6.2 ללא ערובה לתוצאה">
                <Para>
                  ResolveAI אינה מתחייבת כי השימוש בפלטפורמה יוביל לפתרון המחלוקת, לתוצאה שתרצה בה, או לתוצאה כלשהי. תוצרי הפלטפורמה משקפים את ניתוח מערכת ה-AI ואינם מייצגים את עמדת ResolveAI.
                </Para>
              </SubSection>

              <SubSection title="6.3 שירות לחיזוק משא ומתן">
                <Para>
                  ניתן להשתמש בתוצרי הפלטפורמה כבסיס לדיון, משא ומתן, גישור, או הליך משפטי. עם זאת, אין לציגם בפני בית משפט כחוות-דעת מומחה ללא קבלת הסכמת הצד שכנגד ואישור בית המשפט.
                </Para>
              </SubSection>
            </Section>

            {/* ── Section 7 ── */}
            <Section id="s7" title="7. קניין רוחני">
              <SubSection title="7.1 זכויות הפלטפורמה">
                <Para>
                  כל זכויות הקניין הרוחני בפלטפורמה, כולל עיצוב האתר, קוד המקור, לוגואים, שמות מסחריים, מאגרי נתונים, ואלגוריתמים — שייכים ל-ResolveAI. אין להעתיק, לשכפל, לפרסם מחדש, או לעשות שימוש מסחרי כלשהו בתכנים אלה ללא אישור מראש ובכתב.
                </Para>
              </SubSection>

              <SubSection title="7.2 תוכן משתמש">
                <Para>
                  תוכן שהמשתמש מגיש לפלטפורמה (תיאורי מחלוקות, מסמכים, מידע) נותר בבעלותו. בהגשת תוכן זה, המשתמש מעניק ל-ResolveAI רישיון מוגבל, לא-בלעדי, לעיבוד התוכן לצורך מתן השירות ולשיפור המודל הטכנולוגי, בכפוף למדיניות הפרטיות.
                </Para>
              </SubSection>

              <SubSection title="7.3 תוצרי AI">
                <Para>
                  תוצרי ה-AI שמייצרת הפלטפורמה עבור המשתמש הספציפי שייכים לו. אין ResolveAI רשאית לפרסם תוצרים פרטניים ללא הסכמת הצדדים. ResolveAI רשאית להשתמש בנתונים מצטברים ואנונימיים לצרכי מחקר ושיפור.
                </Para>
              </SubSection>
            </Section>

            {/* ── Section 8 ── */}
            <Section id="s8" title="8. הגנת פרטיות">
              <Para>
                עיבוד נתונים אישיים של המשתמשים כפוף ל<Link href="/privacy" className="underline" style={{ color: "var(--ra-gold-700)" }}>מדיניות הפרטיות</Link> המהווה חלק בלתי-נפרד מתנאים אלו. מדיניות הפרטיות עומדת בדרישות חוק הגנת הפרטיות, תשמ"א-1981, ותיקון מספר 13 לחוק (2024), כמו גם בדרישות תקנות GDPR ככל שהדבר רלוונטי.
              </Para>
              <Para>
                ResolveAI משתמשת ב-Anthropic Claude API לעיבוד הבינה המלאכותית. תוכן המחלוקות מועבר לשרתי Anthropic לצורך עיבוד בלבד, בכפוף להסכמי עיבוד נתונים מתאימים. בהגשת תיק, המשתמש מסכים להעברה זו.
              </Para>
            </Section>

            {/* ── Section 9 ── */}
            <Section id="s9" title="9. הגבלת אחריות">
              <AlertBox>
                בהתאם לחוק חוזים אחידים, תשמ"ג-1982, הגבלות האחריות שלהלן עומדות בדרישות הדין הישראלי ואינן חלות על נזק שנגרם ברשלנות חמורה, הפרת חובה חוקית, הונאה, או מקרים שאין לשלול את האחריות בגינם על פי חוק.
              </AlertBox>

              <SubSection title="9.1 הגבלת נזקים עקיפים">
                <Para>
                  במידה המרבית המותרת על פי הדין הישראלי, ResolveAI לא תהיה אחראית לנזקים עקיפים, מקריים, תוצאתיים, מיוחדים, עונשיים, או לאובדן רווחים, אובדן נתונים, אובדן מוניטין, או הפסקת עסקים, גם אם הוזהרה מפני אפשרות נזקים אלה.
                </Para>
              </SubSection>

              <SubSection title="9.2 תקרת אחריות">
                <Para>
                  האחריות הכוללת של ResolveAI לכל תביעה הנובעת מהשימוש בפלטפורמה לא תעלה על הגבוה מבין: (א) הסכום ששולם על ידי המשתמש לפלטפורמה ב-12 החודשים שקדמו לאירוע; או (ב) 500 ₪.
                </Para>
              </SubSection>

              <SubSection title={'9.3 שירות "כפי שהוא"'}>
                <Para>
                  הפלטפורמה ניתנת "כמות שהיא" (AS IS) ו"כמות שהיא זמינה" (AS AVAILABLE). ResolveAI אינה מתחייבת לזמינות רציפה, ללא הפרעות, או נטולת שגיאות.
                </Para>
              </SubSection>

              <SubSection title="9.4 שירותי צד שלישי">
                <Para>
                  ResolveAI אינה אחראית לתקלות, פגמים, אי-דיוקים, או שינויים בהתנהגות של מודלי AI צד-שלישי (Anthropic) או שירות WhatsApp (Twilio) המשולבים בפלטפורמה.
                </Para>
              </SubSection>
            </Section>

            {/* ── Section 10 ── */}
            <Section id="s10" title="10. שיפוי">
              <Para>
                המשתמש מתחייב לשפות ולהגן על ResolveAI, נושאי משרה בה, עובדיה, ונציגיה מכל תביעה, נזק, הפסד, עלות, ושכר טרחת עורך דין סביר הנובעים מ: (א) שימוש בפלטפורמה בניגוד לתנאים אלו; (ב) הפרת זכויות צד שלישי; (ג) הגשת מידע שקרי או מטעה; (ד) כל מחלוקת בין המשתמש לבין צד אחר.
              </Para>
            </Section>

            {/* ── Section 11 ── */}
            <Section id="s11" title="11. ביטול ומדיניות החזרים">
              <SubSection title="11.1 זכות ביטול לפי חוק הגנת הצרכן">
                <Para>
                  בהתאם לחוק הגנת הצרכן, תשמ"א-1981, ותקנות הגנת הצרכן (ביטול עסקה), תשע"א-2010, הרוכש זכאי לבטל עסקה בתוך <strong>14 ימים</strong> מיום עריכת העסקה. בגין ביטול לא יחויב המשתמש בסכום העולה על 5% מהמחיר הכולל, או 100 ₪ — הנמוך מביניהם.
                </Para>
              </SubSection>

              <SubSection title="11.2 סייגים לזכות ביטול">
                <Para>
                  לא ניתן לבטל עסקה לגבי שירות שהחל בביצועו בהסכמת המשתמש לפני תום תקופת ה-14 ימים, ובתנאי שהמשתמש אישר כי ידוע לו שלא יוכל לבטל לאחר ביצוע השירות.
                </Para>
              </SubSection>
            </Section>

            {/* ── Section 12 ── */}
            <Section id="s12" title="12. שינויים בתנאים">
              <Para>
                ResolveAI שומרת לעצמה את הזכות לשנות תנאים אלו בכל עת. שינויים מהותיים יפורסמו באתר ויישלח הודעה למשתמשים רשומים לפחות 30 ימים מראש. המשך השימוש בפלטפורמה לאחר כניסת השינויים לתוקף מהווה הסכמה לתנאים המעודכנים. אם אינך מסכים לשינויים, עליך להפסיק את השימוש בפלטפורמה.
              </Para>
            </Section>

            {/* ── Section 13 ── */}
            <Section id="s13" title="13. דין חל וסמכות שיפוט">
              <SubSection title="13.1 דין חל">
                <Para>
                  תנאים אלו, פרשנותם, ויישובם כפופים לדיני מדינת ישראל בלבד, ללא תחולת כללי ברירת הדין.
                </Para>
              </SubSection>

              <SubSection title="13.2 סמכות שיפוט">
                <Para>
                  לבתי המשפט המוסמכים במחוז תל-אביב-יפו תהיה סמכות שיפוט ייחודית ובלעדית לדון בכל מחלוקת הנובעת מתנאים אלו או מהשימוש בפלטפורמה. בהתאם לפסיקת בית המשפט העליון (עניין Agoda, מאי 2024 ועניין Facebook), אין תנאים אלו שוללים זכויות סטטוטוריות של צרכן ישראלי.
                </Para>
              </SubSection>

              <SubSection title="13.3 משתמשים באיחוד האירופי">
                <Para>
                  משתמשים המתגוררים במדינות האיחוד האירופי זכאים, בנוסף, לזכויות לפי תקנות GDPR ולפנות לבתי המשפט המוסמכים במדינת מגוריהם.
                </Para>
              </SubSection>
            </Section>

            {/* ── Section 14 ── */}
            <Section id="s14" title="14. פרידות, שלמות, וויתור">
              <Para>
                אם ייקבע שסעיף כלשהו בתנאים אלו אינו תקף, בטל, או בלתי-ניתן לאכיפה, יפורש אותו סעיף בצורה המרבית האפשרית תוך שמירת כוונת הצדדים, ויתר הסעיפים יישארו בתוקף מלא.
              </Para>
              <Para>
                אי-אכיפה של זכות כלשהי על ידי ResolveAI אינה מהווה ויתור על אותה זכות.
              </Para>
            </Section>

            {/* ── Section 15 ── */}
            <Section id="s15" title="15. יצירת קשר">
              <Para>
                לשאלות, בקשות ביטול, פניות בנוגע לפרטיות, או כל פנייה אחרת הקשורה לתנאים אלו, ניתן לפנות אלינו דרך האתר. ResolveAI תשיב לפניות בתוך 3 ימי עסקים.
              </Para>
            </Section>

            <div className="pt-8 border-t flex gap-6" style={{ borderColor: "var(--ra-gold-100)" }}>
              <Link href="/privacy" className="text-sm underline" style={{ color: "var(--ra-gold-700)", fontFamily: "var(--font-sans)" }}>
                מדיניות הפרטיות →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <RaFooter />
    </>
  );
}

// ── English version ────────────────────────────────────────────────
function TermsPageEn() {
  return (
    <>
      <RaHeader />
      <main className="flex-1">
        <div className="py-16 border-b" style={{ backgroundColor: "var(--ra-navy-900)", borderColor: "hsl(215 45% 18%)" }}>
          <div className="max-w-4xl mx-auto px-6">
            <Link href="/" className="text-xs tracking-widest uppercase mb-8 inline-flex items-center gap-2" style={{ color: "var(--ra-gold-300)", fontFamily: "var(--font-sans)" }}>
              <span>←</span> Home
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mt-6 mb-3" style={{ color: "var(--ra-cream-50)", fontFamily: "var(--font-display)" }}>
              Terms of Service
            </h1>
            <p className="text-sm" style={{ color: "hsl(40 28% 60%)", fontFamily: "var(--font-sans)" }}>
              Version 1.0 | Last updated: March 2026 | ResolveAI
            </p>
          </div>
        </div>
        <div className="py-16" style={{ backgroundColor: "var(--ra-cream-50)" }}>
          <div className="max-w-4xl mx-auto px-6">
            <AlertBox>
              ⚠️ Important Notice: ResolveAI is a technology platform, not a law firm. AI-generated analysis and recommendations do not constitute legal advice, legal opinions, or binding arbitral awards under the Arbitration Law 5728-1968, unless the parties have separately executed a compliant written arbitration agreement. You should consult a licensed attorney regarding your specific dispute.
            </AlertBox>

            <Section title="1. The Service — Critical Clarification">
              <Para>ResolveAI provides a technology platform that uses artificial intelligence to assist parties in disputes. The platform does not employ attorneys in connection with the service, does not represent any party, and does not create an attorney-client relationship.</Para>
              <Para>AI systems may produce incorrect, incomplete, biased, or outdated outputs — a phenomenon known as "hallucination." ResolveAI makes no warranty as to the accuracy, completeness, or legal validity of any AI-generated output.</Para>
            </Section>

            <Section title="2. The Arbitration Process">
              <Para>Respondents are given <strong>14 business days</strong> from receipt of the case link to submit their position. Decisions rendered without the respondent's input will clearly indicate this. After 14 business days without a response, the claimant may request a decision in the respondent's absence.</Para>
              <Para><strong>AI outputs are not binding arbitral awards</strong> unless the parties have executed a separate written arbitration agreement complying with Israeli Arbitration Law 5728-1968.</Para>
            </Section>

            <Section title="3. Limitation of Liability">
              <Para>To the fullest extent permitted by Israeli law, ResolveAI's total aggregate liability shall not exceed the greater of: (a) fees paid by you in the preceding 12 months, or (b) NIS 500. ResolveAI shall not be liable for indirect, consequential, or punitive damages.</Para>
            </Section>

            <Section title="4. Governing Law & Jurisdiction">
              <Para>These Terms are governed by Israeli law. The competent courts of Tel Aviv, Israel have exclusive jurisdiction. EU users retain rights under applicable consumer protection legislation and may bring claims in their local courts.</Para>
            </Section>

            <Section title="5. Cancellation Rights">
              <Para>Under Israeli Consumer Protection Law 5741-1981, you have a 14-day cancellation right from the date of the transaction. Cancellation fees shall not exceed 5% of the price or NIS 100, whichever is lower.</Para>
            </Section>

            <div className="pt-8 border-t" style={{ borderColor: "var(--ra-gold-100)" }}>
              <Link href="/privacy" className="text-sm underline" style={{ color: "var(--ra-gold-700)", fontFamily: "var(--font-sans)" }}>
                Privacy Policy →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <RaFooter />
    </>
  );
}
