import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

export async function sendWinnerEmail(email: string, firstName?: string) {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'Studio One Café <onboarding@resend.dev>',
    to: [email],
    subject: 'Studio One Café — Weekly Giveaway Winner!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h1 style="color: #d4af37;">Congratulations ${firstName || 'Winner'}!</h1>
        <p>You have been selected as this week's lucky winner of the Studio One Café Giveaway.</p>
        <p>To redeem your prize, please show this email to our staff during your next visit.</p>
        <p style="margin-top: 30px; font-weight: bold;">See you soon!</p>
        <p>— The Studio One Café Team</p>
      </div>
    `,
  });

  if (error) {
    console.error('Failed to send winner email:', error);
    throw error;
  }

  return data;
}

export async function sendGMReminder() {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'Studio One Café <onboarding@resend.dev>',
    to: [process.env.GM_EMAIL || ''],
    subject: 'Reminder: Pick this week’s giveaway winner',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Time to pick a winner!</h2>
        <p>It's Monday morning. Please log in to the admin panel to select this week's giveaway winner and send their notification.</p>
        <a href="${process.env.APP_BASE_URL}/admin" style="display: inline-block; padding: 10px 20px; background-color: #d4af37; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Admin Panel</a>
      </div>
    `,
  });

  if (error) {
    console.error('Failed to send GM reminder email:', error);
    throw error;
  }

  return data;
}
