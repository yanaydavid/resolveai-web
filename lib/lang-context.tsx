"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type Lang = "he" | "en";

export const translations = {
  he: {
    nav: {
      newCase: "פתח תיק חדש",
      langToggle: "English",
      home: "ראשי",
    },
    hero: {
      eyebrow: "בוררות חכמה מבוססת בינה מלאכותית",
      title: "יישוב מחלוקות — מחדש.",
      subtitle:
        "פתרון סכסוכים עסקיים ואישיים — ללא עורכי דין, ללא בית משפט. בוררות מקוונת מבוססת בינה מלאכותית, תוך ימים ובמחיר של שבריר מהבוררות המסורתית.",
      primaryCta: "פתח תיק חדש",
      secondaryCta: "כיצד זה עובד",
    },
    howItWorks: {
      label: "התהליך",
      title: "שלושה שלבים לפסיקה",
      steps: [
        {
          number: "01",
          title: "הגשת המחלוקת",
          desc: "תארו את הסכסוך, הגישו את טיעוניכם ושני הצדדים מעלים את המסמכים הרלוונטיים לבחינה.",
        },
        {
          number: "02",
          title: "ניתוח מעמיק",
          desc: "מערכת הבינה המלאכותית בוחנת בעומק את כלל הראיות, הטיעונים והמסמכים שהוגשו.",
        },
        {
          number: "03",
          title: "פסיקה מנומקת",
          desc: "קבלו פסיקה מפורטת ומנומקת הכוללת ניתוח הטיעונים, ממצאים וצעדי המשך מומלצים.",
        },
      ],
    },
    why: {
      label: "למה ResolveAI",
      title: "יתרון ברור על פני בית המשפט",
      benefits: [
        {
          title: "מהיר",
          desc: "פסיקה תוך ימים בודדים במקום חודשים של המתנה לדיון",
        },
        {
          title: "חסכוני",
          desc: "עלות שבריר בהשוואה לייצוג משפטי מסורתי ושכר טרחת עורך דין",
        },
        {
          title: "הוגן ואובייקטיבי",
          desc: "ניתוח נטול דעות קדומות, מבוסס ראיות ועקרונות משפטיים בלבד",
        },
        {
          title: "חסוי לחלוטין",
          desc: "כל המסמכים מוצפנים ומאובטחים ברמה הגבוהה ביותר",
        },
      ],
    },
    cta: {
      title: "מוכנים להתחיל?",
      subtitle:
        "הגישו את המחלוקת שלכם עוד היום וקבלו פסיקה מקצועית ומנומקת.",
      button: "פתח תיק חדש",
    },
    footer: {
      tagline: "בוררות חכמה מבוססת בינה מלאכותית",
      rights: "כל הזכויות שמורות",
    },
    form: {
      pageTitle: "פתיחת תיק חדש",
      pageSubtitle:
        "מלאו את הפרטים הבאים בקפידה. ככל שתפרטו יותר, כך הניתוח יהיה מדויק ומקיף יותר.",
      fields: {
        caseTitle: "כותרת המחלוקת",
        caseTitlePlaceholder: "תארו בקצרה את מהות הסכסוך",
        party1: "פרטי הצד המגיש",
        party2: "פרטי הצד שכנגד",
        name: "שם מלא",
        email: "כתובת דואר אלקטרוני",
        phone: "מספר טלפון (לשליחת WhatsApp)",
        phonePlaceholder: "לדוגמה: 0501234567",
        phoneNote: "הנתבע יקבל הודעת WhatsApp על פתיחת התיק",
        category: "קטגוריה",
        categoryPlaceholder: "בחרו קטגוריה",
        description: "תיאור המחלוקת",
        descriptionPlaceholder:
          "פרטו את הנסיבות, הטיעונים והסעד המבוקש. כללו תאריכים רלוונטיים, סכומים כספיים, והמסמכים המצורפים.",
        documents: "מסמכים רלוונטיים",
        documentsNote:
          "חוזים, כתבי תביעה, התכתבויות, קבלות — כל מסמך שיכול לתמוך בעמדתכם",
        documentsButton: "בחרו קבצים",
        documentsSelected: "קבצים נבחרו",
        submit: "הגש לבחינת AI",
        submitting: "הבינה המלאכותית מנתחת את התיק...",
      },
      categories: [
        { value: "business", label: "מסחרי ועסקי" },
        { value: "property", label: "נדל\"ן ורכוש" },
        { value: "financial", label: "פיננסי וכספי" },
        { value: "employment", label: "עבודה ותעסוקה" },
        { value: "contract", label: "הפרת חוזה" },
        { value: "divorce", label: "גירושין — חלוקת רכוש" },
        { value: "other", label: "אחר" },
      ],
      errors: {
        required: "שדה חובה",
        invalidEmail: "כתובת דואר אלקטרוני לא תקינה",
        minLength: "יש להזין לפחות 30 תווים",
        apiError: "אירעה שגיאה בעיבוד הבקשה. אנא נסו שנית.",
      },
    },
    claim: {
      success: {
        title: "התיק נפתח בהצלחה",
        caseLabel: "מספר תיק",
        info: "הנתבע יקבל קישור ייחודי להגשת עמדתו. הפסיקה תינתן רק לאחר שמיעת שני הצדדים.",
        respondLinkLabel: "קישור להגשת עמדת הנתבע",
        copyBtn: "העתק קישור",
        copiedBtn: "הועתק ✓",
        copyNote: "שלח קישור זה לנתבע בנפרד אם לא מסרת מספר טלפון.",
        whatsappSent: "הודעת WhatsApp נשלחה לנתבע.",
        newCase: "פתח תיק נוסף",
        home: "חזרה לדף הבית",
      },
    },
    respond: {
      pageTitle: "הגשת עמדת הנתבע",
      pageSubtitle: "קראו את כתב התביעה שהוגש נגדכם, ולאחר מכן הגישו את עמדתכם.",
      claimSection: "כתב התביעה",
      claimant: "הצד המגיש",
      respondent: "הצד שכנגד (אתם)",
      category: "קטגוריה",
      claimDescription: "תיאור התביעה",
      responseSection: "עמדתכם",
      responseLabel: "תגובה לתביעה",
      responsePlaceholder: "פרטו את עמדתכם, הכחישו או אשרו את הטענות, והציגו את גרסתכם המלאה. כללו כל עובדה רלוונטית, ראיה, או טיעון שברצונכם להעלות.",
      submit: "הגש עמדה לפסיקה",
      submitting: "מנתח שני הצדדים...",
      errorRequired: "יש להזין את עמדתכם (לפחות 30 תווים)",
      errorInvalid: "קישור לא תקין. בקש קישור חדש מהתובע.",
      noticeTitle: "הזכות להישמע",
      noticeBody: "פסיקת ResolveAI תתבסס על עמדות שני הצדדים. לאחר הגשת תגובתכם, תינתן פסיקה מנומקת.",
    },
    pricing: {
      label: "תמחור",
      title: "פשוט ושקוף",
      beta: "בגרסת הבטא, כל התיקים מעובדים ללא עלות.",
      tiers: [
        {
          name: "בסיסי",
          price: "₪299",
          unit: "לתיק",
          features: ["ניתוח AI מלא", "פסיקה מנומקת", "גישה לעמוד הפסיקה"],
          highlighted: false,
        },
        {
          name: "סטנדרט",
          badge: "מומלץ",
          price: "₪599",
          unit: "לתיק",
          features: ["הכל בבסיסי", "ייצוא PDF", "עדיפות בעיבוד", "תמיכה"],
          highlighted: true,
        },
        {
          name: "פרמיום",
          price: "₪1,990",
          unit: "לתיק",
          features: ["הכל בסטנדרט", 'סקירת עו"ד', "חתימה דיגיטלית"],
          highlighted: false,
        },
      ],
    },
    faq: {
      label: "שאלות נפוצות",
      title: "כל מה שרצית לדעת",
      items: [
        {
          q: "האם פסיקת ResolveAI מחייבת מבחינה משפטית?",
          a: "פסיקות ResolveAI מוגשות כהמלצת בוררות מוסכמת. ניתן להגיש אותן כחלק מהסכם בוררות מוסכם בין הצדדים, אשר יהפוך אותן למחייבות. אנו ממליצים להתייעץ עם עורך דין לגבי אכיפה ספציפית.",
        },
        {
          q: "כמה זמן לוקחת הפסיקה?",
          a: "רוב הפסיקות מסתיימות תוך מספר דקות. בתיקים מורכבים עם הרבה מסמכים, התהליך עשוי לארוך עד שעה.",
        },
        {
          q: "האם המידע שלי מאובטח?",
          a: "כל הנתונים מוצפנים בתעבורה ובאחסון. אנו לא שומרים מידע אישי מעבר לנחוץ לצורך מתן השירות, ולא משתפים מידע עם גורמים חיצוניים.",
        },
        {
          q: "מה קורה אם הצד השני מסרב להשתתף?",
          a: 'ResolveAI יכול לנתח מחלוקות גם על בסיס עמדת צד אחד. הפסיקה תציין שניתנה בהיעדר תגובה מהצד השני. ניתן להשתמש בה כבסיס למשא ומתן או הגשה לגופים חיצוניים.',
        },
        {
          q: "באילו קטגוריות של מחלוקות ResolveAI יכול לטפל?",
          a: 'אנו מטפלים במחלוקות מסחריות ועסקיות, נדל"ן, חוזים, עבודה ותעסוקה, ומחלוקות פיננסיות. כל מחלוקת שניתן לנתח על בסיס עובדות ועקרונות משפטיים.',
        },
        {
          q: "כיצד שונה ResolveAI מבוררות מסורתית?",
          a: "בוררות מסורתית כרוכה בעורכי דין, לוחות זמנים ארוכים ועלויות גבוהות. ResolveAI מספקת ניתוח מיידי, ללא עלויות ייצוג, ועם תוצאה שקופה ומנומקת — תוך דקות.",
        },
        {
          q: "מה ההבדל בין גישור לבוררות?",
          a: "גישור הוא תהליך שבו מגשר ניטרלי מסייע לצדדים להגיע להסכמה — אך אינו מכריע. בוררות היא תהליך שבו בורר שומע את הצדדים ומכריע בסכסוך. ResolveAI מספקת בוררות מקוונת מבוססת AI — הכרעה מנומקת, מהירה וזולה.",
        },
        {
          q: "כמה עולה בוררות ב-ResolveAI לעומת בוררות מסורתית?",
          a: "בוררות מסורתית בישראל עולה בין 8,000 ל-45,000 ₪ לתיק — בלי לכלול עורכי דין. ב-ResolveAI מתחילים מ-₪299 לתיק. בגרסת הבטא הנוכחית כל התיקים מעובדים בחינם לחלוטין.",
        },
        {
          q: "האם ניתן לפתור סכסוך עסקי ללא עורך דין?",
          a: "כן — זו בדיוק המטרה של ResolveAI. מגישים את הסכסוך, הצד השני מגיב, ובינה מלאכותית מנתחת ונותנת פסיקה מקצועית. ללא עורך דין, ללא בית משפט, וב-99% פחות עלות.",
        },
        {
          q: "האם ResolveAI יכול לעזור בחלוקת רכוש בגירושין?",
          a: "כן. ResolveAI מציע בוררות לחלוקת רכוש בגירושין — דירה, חשבונות בנק, חובות, עסק משותף. הפסיקה מבוססת על חוק יחסי ממון ישראלי ואפשר לקחת אותה לבית משפט למשפחה לאישור ולהפיכה לפסק דין מחייב. שימו לב: גט, משמורת ומזונות ילדים אינם בסמכות ResolveAI.",
        },
      ],
    },
    verdict: {
      title: "פסיקת הבוררות",
      caseLabel: "תיק מספר",
      date: "תאריך הפסיקה",
      print: "הורד / הדפס פסיקה",
      sections: {
        summary: "תקציר המחלוקת",
        analysis: "ניתוח AI",
        finding: "פסיקה",
        rationale: "נימוקים",
        nextSteps: "צעדי המשך מומלצים",
      },
      newCase: "פתח תיק חדש",
      backHome: "חזרה לדף הבית",
      newHearingBtn: "⚖️ בקש דיון נוסף",
      noData: "לא נמצאו נתוני תיק.",
      noDataSub: "ייתכן שפג תוקף הסשן. אנא הגישו את המחלוקת מחדש.",
      noDataAction: "חזרה להגשת מחלוקת",
      generatedBy:
        "פסיקה זו הופקה על ידי מערכת הבינה המלאכותית של ResolveAI ואינה מהווה ייעוץ משפטי",
    },
    newHearing: {
      pageTitle: "דיון נוסף — הגשת ראיות חדשות",
      pageSubtitle: "הגישו ראיות חדשות שלא עמדו בפניכם בעת הדיון המקורי",
      betaNotice: "בגרסת הבטא — דיון נוסף מוגש ללא עלות",
      originalVerdictLabel: "פסיקה מקורית",
      caseIdLabel: "מספר תיק",
      caseIdPlaceholder: "לדוגמה: RA-12345678",
      roleLabel: "מי אתם בתיק זה?",
      roleClaimant: "צד א — התובע/ת",
      roleRespondent: "צד ב — הנתבע/ת",
      yourName: "שמכם המלא",
      yourNamePlaceholder: "שם מלא כפי שמופיע בתיק",
      yourEmail: "כתובת המייל שלכם",
      yourEmailPlaceholder: "לקבלת אישור ועדכונים",
      otherPartyPhone: "טלפון הצד שכנגד (לשליחת WhatsApp)",
      otherPartyPhonePlaceholder: "לדוגמה: 0501234567",
      otherPartyPhoneNote: "הצד שכנגד יקבל הודעת WhatsApp עם הראיות החדשות שהגשתם",
      newEvidenceLabel: "הראיות החדשות",
      newEvidencePlaceholder: "פרטו בהרחבה את הראיות החדשות שברצונכם להגיש — עובדות, מסמכים, עדויות שלא היו בפניכם בדיון המקורי...",
      newEvidenceNote: "ראיות שהיו ידועות לכם בדיון המקורי לא יתקבלו",
      docsLabel: "מסמכים תומכים (אופציונלי)",
      docsNote: "PDF, תמונות — מסמכים שמוכיחים את הראיות החדשות",
      termsNote: "בהגשה אתם מסכימים לתנאי השימוש, כולל סעיף 12 — דיון נוסף",
      submit: "הגש בקשת דיון נוסף",
      submitting: "שולח בקשה...",
      successTitle: "בקשת הדיון הנוסף נשלחה",
      successBody: "הצד שכנגד יקבל הודעה ויהיו לו 5 ימי עסקים להגיש תגובה. לאחר מכן תינתן פסיקה מחודשת ותישלח לשני הצדדים.",
      successHearingId: "מספר דיון",
      backToHome: "חזרה לדף הבית",
      errorRequired: "שדה חובה",
      errorMinLength: "יש להזין לפחות 50 תווים",
      errorSubmit: "אירעה שגיאה. אנא נסו שנית.",
      // Respond page (other party)
      respondTitle: "תגובה לדיון נוסף",
      respondSubtitle: "הצד שכנגד הגיש ראיות חדשות. להלן הראיות — הגישו את תגובתכם.",
      respondNewEvidenceLabel: "ראיות חדשות שהוגשו על ידי הצד שכנגד",
      respondOriginalFindingLabel: "פסיקה מקורית",
      respondYourResponse: "תגובתכם לראיות החדשות (אופציונלי)",
      respondYourResponsePlaceholder: "הגיבו לראיות החדשות שהוגשו. ניתן להוסיף הסברים, להכחיש עובדות, ולהגיש ראיות נגדיות...",
      respondSubmit: "הגש תגובה — ויוצאו פסיקה חדשה",
      respondSkip: "קבל את הדיון ללא תגובה",
      respondSubmitting: "מנתח ומכין פסיקה חדשה...",
      respondSuccessTitle: "תגובתך התקבלה",
      respondSuccessBody: "הפסיקה המחודשת נשלחה לשני הצדדים. ניתן לסגור את הדף.",
      respondAlreadyDone: "הדיון הנוסף כבר הסתיים",
      respondNotFound: "הדיון לא נמצא. ייתכן שהקישור שגוי.",
      respondLoading: "טוען פרטי הדיון...",
      // Status page
      statusPageTitle: "סטטוס דיון נוסף",
      statusLoading: "טוען סטטוס...",
      statusNotFound: "הדיון לא נמצא",
      statusAwaiting: "ממתין לתגובת הצד שכנגד",
      statusDaysLeft: "ימי עסקים נותרו",
      statusExpiredTitle: "תקופת ההמתנה חלפה",
      statusExpiredNote: "5 ימי עסקים חלפו ללא תגובה מהצד שכנגד. ניתן לבקש פסיקה חד-צדדית על בסיס הראיות החדשות שהגשתם.",
      statusOneSidedBtn: "בקש פסיקה חד-צדדית",
      statusOneSidedLoading: "מנתח ומוציא פסיקה מחודשת...",
      statusOneSidedSuccess: "הפסיקה המחודשת נשלחה לשני הצדדים בדוא\"ל.",
      statusResponseReceived: "תגובה התקבלה — הפסיקה בהכנה",
      statusVerdictIssued: "הפסיקה הוצאה ונשלחה לשני הצדדים",
      statusViewLink: "עקוב אחר סטטוס הדיון",
      statusSubmittedLabel: "הוגש",
      statusHearingIdLabel: "מספר דיון",
    },
  },

  en: {
    nav: {
      newCase: "Open a New Case",
      langToggle: "עברית",
      home: "Home",
    },
    hero: {
      eyebrow: "AI-Powered Smart Arbitration",
      title: "Dispute Resolution — Reimagined.",
      subtitle:
        "Resolve business and personal disputes — no lawyers, no courtroom. AI-powered online arbitration and mediation within days, at a fraction of traditional arbitration costs.",
      primaryCta: "Open a New Case",
      secondaryCta: "How It Works",
    },
    howItWorks: {
      label: "The Process",
      title: "Three Steps to a Decision",
      steps: [
        {
          number: "01",
          title: "Submit Your Dispute",
          desc: "Describe the conflict, present your arguments, and both parties upload their relevant supporting documents.",
        },
        {
          number: "02",
          title: "In-Depth Analysis",
          desc: "Our AI system conducts a thorough examination of all submitted evidence, arguments, and documentation.",
        },
        {
          number: "03",
          title: "Reasoned Decision",
          desc: "Receive a detailed, reasoned arbitration decision including analysis of arguments, findings, and recommended next steps.",
        },
      ],
    },
    why: {
      label: "Why ResolveAI",
      title: "A Clear Advantage Over the Courtroom",
      benefits: [
        {
          title: "Swift",
          desc: "Decisions within days, not months of waiting for a hearing date",
        },
        {
          title: "Cost-Effective",
          desc: "A fraction of the cost of traditional legal representation and attorney fees",
        },
        {
          title: "Fair & Impartial",
          desc: "Evidence-based analysis, free from human bias and predisposition",
        },
        {
          title: "Fully Confidential",
          desc: "All documents encrypted and secured to the highest standards",
        },
      ],
    },
    cta: {
      title: "Ready to Get Started?",
      subtitle:
        "Submit your dispute today and receive a professional, reasoned arbitration decision.",
      button: "Open a New Case",
    },
    footer: {
      tagline: "AI-Powered Smart Arbitration",
      rights: "All rights reserved",
    },
    form: {
      pageTitle: "Open a New Case",
      pageSubtitle:
        "Complete the details below carefully. The more detail you provide, the more precise and comprehensive the analysis will be.",
      fields: {
        caseTitle: "Case Title",
        caseTitlePlaceholder: "Briefly describe the nature of the dispute",
        party1: "Your Details",
        party2: "Opposing Party",
        name: "Full Name",
        email: "Email Address",
        phone: "Phone Number (for WhatsApp notification)",
        phonePlaceholder: "e.g. +972501234567",
        phoneNote: "The respondent will receive a WhatsApp notification",
        category: "Category",
        categoryPlaceholder: "Select a category",
        description: "Dispute Description",
        descriptionPlaceholder:
          "Detail the circumstances, arguments, and relief sought. Include relevant dates, monetary amounts, and references to attached documents.",
        documents: "Supporting Documents",
        documentsNote:
          "Contracts, pleadings, correspondence, receipts — any document that supports your position",
        documentsButton: "Choose Files",
        documentsSelected: "files selected",
        submit: "Submit for AI Review",
        submitting: "The AI is analyzing your case...",
      },
      categories: [
        { value: "business", label: "Commercial & Business" },
        { value: "property", label: "Real Estate & Property" },
        { value: "financial", label: "Financial & Monetary" },
        { value: "employment", label: "Employment & Labor" },
        { value: "contract", label: "Contract Breach" },
        { value: "divorce", label: "Divorce — Property Division" },
        { value: "other", label: "Other" },
      ],
      errors: {
        required: "This field is required",
        invalidEmail: "Please enter a valid email address",
        minLength: "Please enter at least 30 characters",
        apiError: "An error occurred while processing your request. Please try again.",
      },
    },
    claim: {
      success: {
        title: "Case Filed Successfully",
        caseLabel: "Case ID",
        info: "The respondent will receive a unique link to submit their position. A decision will be rendered only after hearing both parties.",
        respondLinkLabel: "Respondent's Response Link",
        copyBtn: "Copy Link",
        copiedBtn: "Copied ✓",
        copyNote: "Send this link to the respondent separately if you did not provide a phone number.",
        whatsappSent: "A WhatsApp message has been sent to the respondent.",
        newCase: "Open Another Case",
        home: "Back to Home",
      },
    },
    respond: {
      pageTitle: "Submit Your Response",
      pageSubtitle: "Read the claim filed against you, then submit your position.",
      claimSection: "The Claim",
      claimant: "Claimant",
      respondent: "Respondent (You)",
      category: "Category",
      claimDescription: "Claim Description",
      responseSection: "Your Position",
      responseLabel: "Response to the Claim",
      responsePlaceholder: "Detail your position, deny or confirm the allegations, and present your full account. Include any relevant facts, evidence, or arguments you wish to raise.",
      submit: "Submit Position for Decision",
      submitting: "Analyzing both sides...",
      errorRequired: "Please enter your position (at least 30 characters)",
      errorInvalid: "Invalid link. Please request a new link from the claimant.",
      noticeTitle: "Right to Be Heard",
      noticeBody: "The ResolveAI decision will be based on both parties' positions. After you submit your response, a reasoned decision will be rendered.",
    },
    pricing: {
      label: "Pricing",
      title: "Simple & Transparent",
      beta: "During our beta period, all cases are processed free of charge.",
      tiers: [
        {
          name: "Basic",
          price: "₪299",
          unit: "per case",
          features: ["Full AI analysis", "Reasoned decision", "Verdict page access"],
          highlighted: false,
        },
        {
          name: "Standard",
          badge: "Recommended",
          price: "₪599",
          unit: "per case",
          features: ["Everything in Basic", "PDF export", "Priority processing", "Support"],
          highlighted: true,
        },
        {
          name: "Premium",
          price: "₪1,990",
          unit: "per case",
          features: ["Everything in Standard", "Attorney review", "Digital signature"],
          highlighted: false,
        },
      ],
    },
    faq: {
      label: "FAQ",
      title: "Everything You Need to Know",
      items: [
        {
          q: "Is a ResolveAI decision legally binding?",
          a: "ResolveAI decisions are rendered as agreed arbitration recommendations. They can be submitted as part of a mutual arbitration agreement between parties, making them binding. We recommend consulting an attorney for specific enforcement.",
        },
        {
          q: "How long does a decision take?",
          a: "Most decisions are completed within minutes. For complex cases with many documents, the process may take up to an hour.",
        },
        {
          q: "Is my information secure?",
          a: "All data is encrypted in transit and at rest. We do not retain personal information beyond what is necessary to provide the service, and we do not share information with third parties.",
        },
        {
          q: "What if the other party refuses to participate?",
          a: "ResolveAI can analyze disputes based on one party's account. The decision will note it was rendered in the other party's absence. It can be used as a basis for negotiation or submission to external bodies.",
        },
        {
          q: "What types of disputes can ResolveAI handle?",
          a: "We handle commercial and business disputes, real estate, contracts, employment, and financial disputes — any dispute that can be analyzed based on facts and legal principles.",
        },
        {
          q: "How is ResolveAI different from traditional arbitration?",
          a: "Traditional arbitration involves lawyers, long timelines, and high costs. ResolveAI provides instant analysis, without representation costs, and with a transparent, reasoned outcome — within minutes.",
        },
        {
          q: "What is the difference between mediation and arbitration?",
          a: "Mediation is a process where a neutral mediator helps parties reach an agreement — but makes no binding decision. Arbitration involves a decision-maker who hears both sides and rules on the dispute. ResolveAI provides AI-powered online arbitration: fast, affordable, and objective.",
        },
        {
          q: "How much does ResolveAI cost compared to traditional arbitration?",
          a: "Traditional arbitration in Israel costs between ₪8,000–₪45,000 per case — excluding legal fees. ResolveAI starts at ₪299 per case. During the current beta phase, all cases are processed completely free of charge.",
        },
        {
          q: "Can I resolve a business dispute without a lawyer?",
          a: "Yes — that's exactly what ResolveAI is built for. Submit your dispute, the other party responds, and our AI analyzes and delivers a professional, reasoned decision. No lawyers, no courtroom, at a fraction of the cost.",
        },
        {
          q: "Can ResolveAI help with property division in divorce?",
          a: "Yes. ResolveAI handles divorce property division — shared home, bank accounts, debts, joint business. The decision is based on Israel's Property Relations Between Spouses Law and can be submitted to family court for enforcement as a binding judgment. Note: divorce (get), child custody, and child support are outside ResolveAI's scope.",
        },
      ],
    },
    verdict: {
      title: "Arbitration Decision",
      caseLabel: "Case No.",
      date: "Date of Decision",
      print: "Print / Download Decision",
      sections: {
        summary: "Dispute Summary",
        analysis: "AI Analysis",
        finding: "Finding",
        rationale: "Rationale",
        nextSteps: "Recommended Next Steps",
      },
      newCase: "Open a New Case",
      backHome: "Back to Home",
      newHearingBtn: "⚖️ Request New Hearing",
      noData: "No case data found.",
      noDataSub: "Your session may have expired. Please resubmit the dispute.",
      noDataAction: "Return to Dispute Submission",
      generatedBy:
        "This decision was generated by the ResolveAI artificial intelligence system and does not constitute legal advice",
    },
    newHearing: {
      pageTitle: "New Hearing — Submit New Evidence",
      pageSubtitle: "Submit new evidence that was not available at the time of the original hearing",
      betaNotice: "During beta — new hearings are submitted free of charge",
      originalVerdictLabel: "Original Finding",
      caseIdLabel: "Case ID",
      caseIdPlaceholder: "e.g. RA-12345678",
      roleLabel: "What is your role in this case?",
      roleClaimant: "Party A — Claimant",
      roleRespondent: "Party B — Respondent",
      yourName: "Your Full Name",
      yourNamePlaceholder: "Full name as it appears in the case",
      yourEmail: "Your Email Address",
      yourEmailPlaceholder: "For confirmation and updates",
      otherPartyPhone: "Other Party's Phone (for WhatsApp)",
      otherPartyPhonePlaceholder: "e.g. +972501234567",
      otherPartyPhoneNote: "The other party will receive a WhatsApp message with your new evidence",
      newEvidenceLabel: "New Evidence",
      newEvidencePlaceholder: "Describe in detail the new evidence you are submitting — facts, documents, testimonies that were not available at the original hearing...",
      newEvidenceNote: "Evidence that was known to you at the original hearing will not be accepted",
      docsLabel: "Supporting Documents (optional)",
      docsNote: "PDF, images — documents that prove your new evidence",
      termsNote: "By submitting you agree to the Terms of Service, including Section 12 — New Hearing",
      submit: "Submit New Hearing Request",
      submitting: "Submitting request...",
      successTitle: "New Hearing Request Submitted",
      successBody: "The other party will be notified and will have 5 business days to respond. A new decision will then be issued and sent to both parties.",
      successHearingId: "Hearing ID",
      backToHome: "Back to Home",
      errorRequired: "This field is required",
      errorMinLength: "Please enter at least 50 characters",
      errorSubmit: "An error occurred. Please try again.",
      // Respond page
      respondTitle: "Respond to New Hearing",
      respondSubtitle: "The other party has submitted new evidence. Review it and submit your response.",
      respondNewEvidenceLabel: "New Evidence Submitted by the Other Party",
      respondOriginalFindingLabel: "Original Finding",
      respondYourResponse: "Your Response to the New Evidence (optional)",
      respondYourResponsePlaceholder: "Respond to the new evidence submitted. You may explain, deny, or submit counter-evidence...",
      respondSubmit: "Submit Response — Generate New Decision",
      respondSkip: "Accept Hearing Without Response",
      respondSubmitting: "Analyzing and generating new decision...",
      respondSuccessTitle: "Your Response Was Received",
      respondSuccessBody: "The revised decision has been sent to both parties. You may close this page.",
      respondAlreadyDone: "This new hearing has already been concluded",
      respondNotFound: "Hearing not found. The link may be incorrect.",
      respondLoading: "Loading hearing details...",
      // Status page
      statusPageTitle: "New Hearing Status",
      statusLoading: "Loading status...",
      statusNotFound: "Hearing not found",
      statusAwaiting: "Awaiting the other party's response",
      statusDaysLeft: "business days remaining",
      statusExpiredTitle: "Waiting Period Has Expired",
      statusExpiredNote: "5 business days have passed with no response from the other party. You may now request a one-sided decision based solely on your new evidence.",
      statusOneSidedBtn: "Request One-Sided Decision",
      statusOneSidedLoading: "Analyzing and issuing revised decision...",
      statusOneSidedSuccess: "The revised decision has been emailed to both parties.",
      statusResponseReceived: "Response received — decision in progress",
      statusVerdictIssued: "Decision issued and sent to both parties",
      statusViewLink: "Track hearing status",
      statusSubmittedLabel: "Submitted",
      statusHearingIdLabel: "Hearing ID",
    },
  },
};

// Shape type — both languages conform to this
export type TranslationShape = typeof translations["he"];

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TranslationShape;
  dir: "rtl" | "ltr";
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("he");
  const dir = lang === "he" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return (
    <LangContext.Provider
      value={{ lang, setLang, t: translations[lang] as TranslationShape, dir }}
    >
      <div dir={dir} className="min-h-screen flex flex-col">
        {children}
      </div>
    </LangContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLanguage must be used within LangProvider");
  return ctx;
}
