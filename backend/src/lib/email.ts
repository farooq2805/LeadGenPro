import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendLeadNotification(
  to: string,
  userName: string,
  leadCount: number,
  queryId: string
) {
  const from = process.env.FROM_EMAIL || 'noreply@prospectpro.com';

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #6366f1, #a855f7); padding: 32px; text-align: center; border-radius: 16px 16px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">ProspectPro</h1>
      </div>
      <div style="background: #1a1a2e; padding: 32px; border-radius: 0 0 16px 16px;">
        <h2 style="color: white; margin: 0 0 8px;">Your leads are ready! 🎉</h2>
        <p style="color: #94a3b8; margin: 0 0 24px;">Hey ${userName}, we've generated ${leadCount} leads based on your criteria.</p>
        <div style="background: linear-gradient(135deg, #6366f1, #a855f7); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: bold; color: white;">${leadCount}</span>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">New Leads Generated</p>
        </div>
        <a href="http://localhost:5173/results/${queryId}"
           style="display: block; text-align: center; background: #6366f1; color: white; text-decoration: none; padding: 14px; border-radius: 10px; font-weight: 600;">
          View & Download Leads
        </a>
        <p style="color: #64748b; font-size: 12px; margin-top: 24px; text-align: center;">
          ProspectPro — AI-Powered Lead Generation
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"ProspectPro" <${from}>`,
    to,
    subject: `Your ${leadCount} leads are ready!`,
    html,
  });
}
