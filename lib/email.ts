import { Resend } from "resend";

function getResendKey(): string {
  return process.env.RESEND_API_KEY || "";
}

export async function sendClaimConfirmation(params: {
  to: string;
  claimantName: string;
  defendantName: string;
  caseId: string;
  caseTitle: string;
  category: string;
  description: string;
  submittedAt: string;
  lang: string;
  trackingUrl?: string;
}) {
  const key = getResendKey();
  if (!key) return;
  const resend = new Resend(key);

  const isHe = params.lang === "he";

  await resend.emails.send({
    from: "ResolveAI <no-reply@resolveai.co.il>",
    to: params.to,
    subject: isHe
      ? `אישור פתיחת תיק ${params.caseId} — ResolveAI`
      : `Case ${params.caseId} Confirmation — ResolveAI`,
    html: isHe ? `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a2744;">
        <div style="background: #1a2744; padding: 32px; text-align: center;">
          <h1 style="color: #c9a84c; margin: 0; font-size: 24px;">ResolveAI</h1>
          <p style="color: #a0907a; margin: 8px 0 0; font-size: 13px;">בוררות חכמה מבוססת בינה מלאכותית</p>
        </div>
        <div style="padding: 32px; background: #fffdf7;">
          <h2 style="color: #1a2744;">שלום ${params.claimantName},</h2>
          <p>כתב התביעה שלך התקבל בהצלחה במערכת ResolveAI.</p>
          <div style="background: white; border: 1px solid #e8d9a0; padding: 24px; margin: 24px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px;"><strong>מספר תיק:</strong> ${params.caseId}</p>
            <p style="margin: 0 0 8px;"><strong>כותרת:</strong> ${params.caseTitle}</p>
            <p style="margin: 0 0 8px;"><strong>נתבע:</strong> ${params.defendantName}</p>
            <p style="margin: 0 0 8px;"><strong>קטגוריה:</strong> ${params.category}</p>
            <p style="margin: 0 0 8px;"><strong>תאריך הגשה:</strong> ${new Date(params.submittedAt).toLocaleDateString("he-IL")}</p>
          </div>
          <div style="background: #f5f0e8; border-right: 4px solid #c9a84c; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>תיאור התביעה:</strong></p>
            <p style="margin: 8px 0 0; font-size: 14px; color: #444;">${params.description}</p>
          </div>
          <p style="color: #666; font-size: 13px;">הנתבע קיבל הודעה עם קישור להגשת עמדתו. כאשר תינתן הפסיקה — תקבל אותה למייל זה.</p>
          ${params.trackingUrl ? `<div style="text-align: center; margin: 24px 0;"><a href="${params.trackingUrl}" style="background: #1a2744; color: #c9a84c; padding: 14px 32px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 15px;">עקוב אחרי התיק שלך</a></div>` : ""}
        </div>
        <div style="background: #1a2744; padding: 16px; text-align: center;">
          <p style="color: #a0907a; margin: 0; font-size: 12px;">ResolveAI © 2026 | resolveai.co.il</p>
        </div>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a2744;">
        <div style="background: #1a2744; padding: 32px; text-align: center;">
          <h1 style="color: #c9a84c; margin: 0; font-size: 24px;">ResolveAI</h1>
        </div>
        <div style="padding: 32px; background: #fffdf7;">
          <h2>Dear ${params.claimantName},</h2>
          <p>Your claim has been successfully submitted to ResolveAI.</p>
          <div style="background: white; border: 1px solid #e8d9a0; padding: 24px; margin: 24px 0;">
            <p style="margin: 0 0 8px;"><strong>Case ID:</strong> ${params.caseId}</p>
            <p style="margin: 0 0 8px;"><strong>Title:</strong> ${params.caseTitle}</p>
            <p style="margin: 0 0 8px;"><strong>Defendant:</strong> ${params.defendantName}</p>
            <p style="margin: 0 0 8px;"><strong>Category:</strong> ${params.category}</p>
            <p style="margin: 0;"><strong>Submitted:</strong> ${new Date(params.submittedAt).toLocaleDateString("en-US")}</p>
          </div>
          <p style="color: #666; font-size: 13px;">The defendant has been notified. You will receive the ruling by email once both sides have been heard.</p>
        </div>
        <div style="background: #1a2744; padding: 16px; text-align: center;">
          <p style="color: #a0907a; margin: 0; font-size: 12px;">ResolveAI © 2026 | resolveai.co.il</p>
        </div>
      </div>
    `,
  });
}

export async function sendVerdictToClaimant(params: {
  to: string;
  claimantName: string;
  caseId: string;
  caseTitle: string;
  partyOneName: string;
  partyTwoName: string;
  summary: string;
  finding: string;
  rationale: string;
  nextSteps: string[];
  heardBothSides: boolean;
  lang: string;
}) {
  const key = getResendKey();
  if (!key) return;
  const resend = new Resend(key);

  const isHe = params.lang === "he";
  const stepsHtml = params.nextSteps.map(s => `<li style="margin-bottom: 8px;">${s}</li>`).join("");

  await resend.emails.send({
    from: "ResolveAI <no-reply@resolveai.co.il>",
    to: params.to,
    subject: isHe
      ? `פסיקה בתיק ${params.caseId} — ResolveAI`
      : `Ruling for Case ${params.caseId} — ResolveAI`,
    html: isHe ? `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a2744;">
        <div style="background: #1a2744; padding: 32px; text-align: center;">
          <h1 style="color: #c9a84c; margin: 0; font-size: 24px;">ResolveAI</h1>
          <p style="color: #a0907a; margin: 8px 0 0; font-size: 13px;">פסיקת בוררות</p>
        </div>
        <div style="padding: 32px; background: #fffdf7;">
          <h2 style="color: #1a2744;">שלום ${params.claimantName},</h2>
          <p>פסיקת הבוררות בתיק <strong>${params.caseId}</strong> מוכנה.</p>
          ${!params.heardBothSides ? `<div style="background: #fff8e1; border-right: 4px solid #f59e0b; padding: 12px; margin: 16px 0; font-size: 13px;">הפסיקה ניתנה בהיעדר עמדת הנתבע.</div>` : ""}
          <div style="background: white; border: 1px solid #e8d9a0; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px; color: #c9a84c;">סיכום</h3>
            <p style="margin: 0; font-size: 14px;">${params.summary}</p>
          </div>
          <div style="background: #1a2744; color: white; padding: 24px; margin: 24px 0; border-radius: 4px;">
            <h3 style="margin: 0 0 12px; color: #c9a84c;">הכרעה</h3>
            <p style="margin: 0; font-size: 14px;">${params.finding}</p>
          </div>
          <div style="background: white; border: 1px solid #e8d9a0; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px;">נימוק</h3>
            <p style="margin: 0; font-size: 14px; color: #444;">${params.rationale}</p>
          </div>
          <div style="background: white; border: 1px solid #e8d9a0; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px;">צעדים הבאים</h3>
            <ul style="margin: 0; padding-right: 20px; font-size: 14px; color: #444;">${stepsHtml}</ul>
          </div>
        </div>
        <div style="background: #1a2744; padding: 16px; text-align: center;">
          <p style="color: #a0907a; margin: 0; font-size: 12px;">ResolveAI © 2026 | resolveai.co.il</p>
        </div>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a2744;">
        <div style="background: #1a2744; padding: 32px; text-align: center;">
          <h1 style="color: #c9a84c; margin: 0;">ResolveAI</h1>
        </div>
        <div style="padding: 32px; background: #fffdf7;">
          <h2>Dear ${params.claimantName},</h2>
          <p>The ruling for case <strong>${params.caseId}</strong> is ready.</p>
          <div style="background: white; border: 1px solid #e8d9a0; padding: 24px; margin: 24px 0;">
            <h3 style="color: #c9a84c;">Summary</h3>
            <p style="font-size: 14px;">${params.summary}</p>
          </div>
          <div style="background: #1a2744; color: white; padding: 24px; margin: 24px 0;">
            <h3 style="color: #c9a84c;">Finding</h3>
            <p style="font-size: 14px;">${params.finding}</p>
          </div>
          <div style="background: white; border: 1px solid #e8d9a0; padding: 24px; margin: 24px 0;">
            <h3>Rationale</h3>
            <p style="font-size: 14px; color: #444;">${params.rationale}</p>
          </div>
        </div>
        <div style="background: #1a2744; padding: 16px; text-align: center;">
          <p style="color: #a0907a; margin: 0; font-size: 12px;">ResolveAI © 2026 | resolveai.co.il</p>
        </div>
      </div>
    `,
  });
}
