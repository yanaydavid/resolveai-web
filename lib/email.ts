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

  const { error } = await resend.emails.send({
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
  if (error) { console.error("sendClaimConfirmation error:", error); throw new Error(JSON.stringify(error)); }
}

export async function sendDefenseReceived(params: {
  to: string;
  defendantName: string;
  claimantName: string;
  caseId: string;
  caseTitle: string;
  lang: string;
}) {
  const key = getResendKey();
  if (!key || !params.to) return;
  const resend = new Resend(key);

  const isHe = params.lang === "he";

  const { error } = await resend.emails.send({
    from: "ResolveAI <no-reply@resolveai.co.il>",
    to: params.to,
    subject: isHe
      ? `כתב ההגנה שלך התקבל — תיק ${params.caseId} | ResolveAI`
      : `Your Defense Has Been Received — Case ${params.caseId} | ResolveAI`,
    html: isHe ? `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a2744;">
        <div style="background:#1a2744;padding:32px;text-align:center;">
          <h1 style="color:#c9a84c;margin:0;font-size:24px;">ResolveAI</h1>
          <p style="color:#a0907a;margin:8px 0 0;font-size:13px;">אישור קבלת כתב הגנה</p>
        </div>
        <div style="padding:32px;background:#fffdf7;">
          <h2 style="color:#1a2744;">שלום ${params.defendantName},</h2>
          <p style="font-size:15px;line-height:1.7;">
            קיבלנו את כתב ההגנה שלך ואת כל המסמכים שצירפת לתיק <strong>${params.caseId}</strong>.
          </p>
          <div style="background:#1a2744;padding:24px;margin:24px 0;border-radius:4px;">
            <p style="color:#c9a84c;margin:0 0 8px;font-size:14px;font-weight:bold;">מה קורה עכשיו?</p>
            <p style="color:#e8d9a0;margin:0;font-size:14px;line-height:1.7;">
              הבורר של ResolveAI עובר כעת על כתב התביעה של ${params.claimantName}, כתב ההגנה שלך והמסמכים שהוגשו.
              ברגע שתינתן הפסיקה — תקבל עדכון למייל זה עם הפסיקה המלאה.
            </p>
          </div>
          <div style="background:white;border:1px solid #e8d9a0;padding:20px;margin:24px 0;">
            <p style="margin:0 0 6px;font-size:13px;color:#888;">פרטי התיק</p>
            <p style="margin:0 0 4px;font-size:14px;"><strong>מספר תיק:</strong> ${params.caseId}</p>
            <p style="margin:0;font-size:14px;"><strong>נושא:</strong> ${params.caseTitle}</p>
          </div>
          <p style="font-size:12px;color:#888;text-align:center;">
            לפניות: <a href="mailto:support@resolveai.co.il" style="color:#c9a84c;">support@resolveai.co.il</a>
          </p>
        </div>
        <div style="background:#1a2744;padding:16px;text-align:center;">
          <p style="color:#a0907a;margin:0;font-size:12px;">ResolveAI © 2026 | resolveai.co.il</p>
        </div>
      </div>
    ` : `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a2744;">
        <div style="background:#1a2744;padding:32px;text-align:center;">
          <h1 style="color:#c9a84c;margin:0;font-size:24px;">ResolveAI</h1>
          <p style="color:#a0907a;margin:8px 0 0;font-size:13px;">Defense Received</p>
        </div>
        <div style="padding:32px;background:#fffdf7;">
          <h2>Dear ${params.defendantName},</h2>
          <p style="font-size:15px;line-height:1.7;">
            We have received your defense submission and all attached documents for case <strong>${params.caseId}</strong>.
          </p>
          <div style="background:#1a2744;padding:24px;margin:24px 0;border-radius:4px;">
            <p style="color:#c9a84c;margin:0 0 8px;font-weight:bold;">What happens next?</p>
            <p style="color:#e8d9a0;margin:0;font-size:14px;line-height:1.7;">
              Our AI arbitrator is now reviewing ${params.claimantName}'s claim, your defense, and all submitted documents.
              Once a ruling is issued, you will receive an email with the full verdict.
            </p>
          </div>
          <div style="background:white;border:1px solid #e8d9a0;padding:20px;margin:24px 0;">
            <p style="margin:0 0 4px;font-size:14px;"><strong>Case ID:</strong> ${params.caseId}</p>
            <p style="margin:0;font-size:14px;"><strong>Title:</strong> ${params.caseTitle}</p>
          </div>
        </div>
        <div style="background:#1a2744;padding:16px;text-align:center;">
          <p style="color:#a0907a;margin:0;font-size:12px;">ResolveAI © 2026 | resolveai.co.il</p>
        </div>
      </div>
    `,
  });
  if (error) { console.error("sendDefenseReceived error:", error); throw new Error(JSON.stringify(error)); }
}

export async function sendClaimNotificationToDefendant(params: {
  to: string;
  defendantName: string;
  claimantName: string;
  caseId: string;
  caseTitle: string;
  category: string;
  description: string;
  respondUrl: string;
  lang: string;
}) {
  const key = getResendKey();
  if (!key || !params.to) return;
  const resend = new Resend(key);

  const isHe = params.lang === "he";

  const { error } = await resend.emails.send({
    from: "ResolveAI <no-reply@resolveai.co.il>",
    to: params.to,
    subject: isHe
      ? `הגשת כתב תביעה נגדך — תיק ${params.caseId} | ResolveAI`
      : `Arbitration Claim Filed Against You — Case ${params.caseId} | ResolveAI`,
    html: isHe ? `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a2744;">
        <div style="background:#1a2744;padding:32px;text-align:center;">
          <h1 style="color:#c9a84c;margin:0;font-size:24px;">ResolveAI</h1>
          <p style="color:#a0907a;margin:8px 0 0;font-size:13px;">הודעה רשמית — כתב תביעה</p>
        </div>
        <div style="padding:32px;background:#fffdf7;">
          <h2 style="color:#1a2744;">שלום ${params.defendantName},</h2>
          <p style="font-size:15px;line-height:1.6;">
            <strong>${params.claimantName}</strong> הגיש/ה כנגדך בקשת בוררות דרך מערכת ResolveAI.
          </p>
          <div style="background:white;border:1px solid #e8d9a0;padding:24px;margin:24px 0;">
            <p style="margin:0 0 8px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">פרטי התיק</p>
            <p style="margin:4px 0;font-size:14px;"><strong>מספר תיק:</strong> ${params.caseId}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>נושא:</strong> ${params.caseTitle}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>קטגוריה:</strong> ${params.category}</p>
          </div>
          <div style="background:white;border:1px solid #e8d9a0;padding:24px;margin:24px 0;">
            <p style="margin:0 0 12px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">תיאור התביעה</p>
            <p style="margin:0;font-size:14px;color:#444;white-space:pre-wrap;line-height:1.6;">${params.description}</p>
          </div>
          <div style="background:#1a2744;padding:24px;margin:24px 0;text-align:center;">
            <p style="color:#c9a84c;margin:0 0 8px;font-size:14px;font-weight:bold;">יש לך 14 ימי עסקים להגיש את עמדתך</p>
            <p style="color:#a0907a;margin:0 0 20px;font-size:13px;">לחץ על הכפתור להלן להגשת כתב הגנה</p>
            <a href="${params.respondUrl}" style="background:#c9a84c;color:#1a2744;padding:14px 32px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;">הגש כתב הגנה</a>
          </div>
          <p style="font-size:12px;color:#888;text-align:center;">אם אינך מגיש עמדה תוך 14 ימי עסקים, תינתן פסיקה על סמך פניית התובע בלבד.</p>
        </div>
        <div style="background:#1a2744;padding:16px;text-align:center;">
          <p style="color:#a0907a;margin:0;font-size:12px;">ResolveAI © 2026 | resolveai.co.il | support@resolveai.co.il</p>
        </div>
      </div>
    ` : `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a2744;">
        <div style="background:#1a2744;padding:32px;text-align:center;">
          <h1 style="color:#c9a84c;margin:0;">ResolveAI</h1>
          <p style="color:#a0907a;margin:8px 0 0;font-size:13px;">Official Notice — Arbitration Claim</p>
        </div>
        <div style="padding:32px;background:#fffdf7;">
          <h2>Dear ${params.defendantName},</h2>
          <p><strong>${params.claimantName}</strong> has filed an arbitration claim against you via ResolveAI.</p>
          <div style="background:white;border:1px solid #e8d9a0;padding:24px;margin:24px 0;">
            <p style="color:#888;font-size:12px;text-transform:uppercase;">Case Details</p>
            <p style="font-size:14px;"><strong>Case ID:</strong> ${params.caseId}</p>
            <p style="font-size:14px;"><strong>Title:</strong> ${params.caseTitle}</p>
            <p style="font-size:14px;"><strong>Category:</strong> ${params.category}</p>
          </div>
          <div style="background:white;border:1px solid #e8d9a0;padding:24px;margin:24px 0;">
            <p style="color:#888;font-size:12px;text-transform:uppercase;">Claim Description</p>
            <p style="font-size:14px;color:#444;">${params.description}</p>
          </div>
          <div style="background:#1a2744;padding:24px;margin:24px 0;text-align:center;">
            <p style="color:#c9a84c;margin:0 0 20px;font-weight:bold;">You have 14 business days to submit your response</p>
            <a href="${params.respondUrl}" style="background:#c9a84c;color:#1a2744;padding:14px 32px;text-decoration:none;font-weight:bold;display:inline-block;">Submit Defense</a>
          </div>
        </div>
        <div style="background:#1a2744;padding:16px;text-align:center;">
          <p style="color:#a0907a;margin:0;font-size:12px;">ResolveAI © 2026 | resolveai.co.il</p>
        </div>
      </div>
    `,
  });
  if (error) { console.error("sendClaimNotificationToDefendant error:", error); throw new Error(JSON.stringify(error)); }
}

export async function sendVerdictToDefendant(params: {
  to: string;
  defendantName: string;
  claimantName: string;
  caseId: string;
  caseTitle: string;
  description: string;
  defendantResponse: string;
  summary: string;
  finding: string;
  rationale: string;
  nextSteps: string[];
  heardBothSides: boolean;
  lang: string;
}) {
  const key = getResendKey();
  if (!key || !params.to) return;
  const resend = new Resend(key);

  const isHe = params.lang === "he";
  const stepsHtml = params.nextSteps.map(s => `<li style="margin-bottom:8px;">${s}</li>`).join("");

  const { error: verdictDefErr } = await resend.emails.send({
    from: "ResolveAI <no-reply@resolveai.co.il>",
    to: params.to,
    subject: isHe
      ? `פסיקה בתיק ${params.caseId} — ResolveAI`
      : `Ruling for Case ${params.caseId} — ResolveAI`,
    html: isHe ? `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a2744;">
        <div style="background:#1a2744;padding:32px;text-align:center;">
          <h1 style="color:#c9a84c;margin:0;font-size:24px;">ResolveAI</h1>
          <p style="color:#a0907a;margin:8px 0 0;font-size:13px;">פסיקת בוררות</p>
        </div>
        <div style="padding:32px;background:#fffdf7;">
          <h2 style="color:#1a2744;">שלום ${params.defendantName},</h2>
          <p>להלן סיכום תיק הבוררות <strong>${params.caseId}</strong> שהוגש נגדך.</p>

          <div style="background:white;border:1px solid #e8d9a0;padding:24px;margin:24px 0;">
            <h3 style="margin:0 0 12px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">כתב התביעה של ${params.claimantName}</h3>
            <p style="margin:0;font-size:14px;color:#444;white-space:pre-wrap;">${params.description}</p>
          </div>

          <div style="background:white;border:1px solid #e8d9a0;padding:24px;margin:24px 0;">
            <h3 style="margin:0 0 12px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">כתב ההגנה שלך</h3>
            <p style="margin:0;font-size:14px;color:#444;white-space:pre-wrap;">${params.defendantResponse}</p>
          </div>

          <div style="background:#1a2744;color:white;padding:24px;margin:24px 0;border-radius:4px;">
            <h3 style="margin:0 0 12px;color:#c9a84c;">הכרעה</h3>
            <p style="margin:0;font-size:14px;">${params.finding}</p>
          </div>

          <div style="background:white;border:1px solid #e8d9a0;padding:24px;margin:24px 0;">
            <h3 style="margin:0 0 12px;">סיכום</h3>
            <p style="margin:0;font-size:14px;color:#444;">${params.summary}</p>
          </div>

          <div style="background:white;border:1px solid #e8d9a0;padding:24px;margin:24px 0;">
            <h3 style="margin:0 0 12px;">נימוק</h3>
            <p style="margin:0;font-size:14px;color:#444;">${params.rationale}</p>
          </div>

          <div style="background:white;border:1px solid #e8d9a0;padding:24px;margin:24px 0;">
            <h3 style="margin:0 0 12px;">צעדים הבאים</h3>
            <ul style="margin:0;padding-right:20px;font-size:14px;color:#444;">${stepsHtml}</ul>
          </div>
        </div>
        <div style="background:#1a2744;padding:16px;text-align:center;">
          <p style="color:#a0907a;margin:0;font-size:12px;">ResolveAI © 2026 | resolveai.co.il</p>
        </div>
      </div>
    ` : `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a2744;">
        <div style="background:#1a2744;padding:32px;text-align:center;">
          <h1 style="color:#c9a84c;margin:0;">ResolveAI</h1>
        </div>
        <div style="padding:32px;background:#fffdf7;">
          <h2>Dear ${params.defendantName},</h2>
          <p>Below is the summary of arbitration case <strong>${params.caseId}</strong> filed against you.</p>
          <div style="background:white;border:1px solid #e8d9a0;padding:24px;margin:24px 0;">
            <h3 style="color:#888;font-size:12px;text-transform:uppercase;">Claim by ${params.claimantName}</h3>
            <p style="font-size:14px;color:#444;">${params.description}</p>
          </div>
          <div style="background:white;border:1px solid #e8d9a0;padding:24px;margin:24px 0;">
            <h3 style="color:#888;font-size:12px;text-transform:uppercase;">Your Defense</h3>
            <p style="font-size:14px;color:#444;">${params.defendantResponse}</p>
          </div>
          <div style="background:#1a2744;color:white;padding:24px;margin:24px 0;">
            <h3 style="color:#c9a84c;">Finding</h3>
            <p style="font-size:14px;">${params.finding}</p>
          </div>
          <div style="background:white;border:1px solid #e8d9a0;padding:24px;margin:24px 0;">
            <h3>Rationale</h3>
            <p style="font-size:14px;color:#444;">${params.rationale}</p>
          </div>
        </div>
        <div style="background:#1a2744;padding:16px;text-align:center;">
          <p style="color:#a0907a;margin:0;font-size:12px;">ResolveAI © 2026 | resolveai.co.il</p>
        </div>
      </div>
    `,
  });
  if (verdictDefErr) { console.error("sendVerdictToDefendant error:", verdictDefErr); throw new Error(JSON.stringify(verdictDefErr)); }
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

  const { error: verdictClaimErr } = await resend.emails.send({
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
  if (verdictClaimErr) { console.error("sendVerdictToClaimant error:", verdictClaimErr); throw new Error(JSON.stringify(verdictClaimErr)); }
}
