const cron = require('node-cron');
const { Resend } = require('resend');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const resend = new Resend(process.env.RESEND_API_KEY);

const sendDailyReportEmail = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    console.log(`[CRON] Starting daily report email process for ${today}...`);

    // Fetch today's report
    const reportResult = await pool.query(
      'SELECT * FROM daily_reports WHERE date = $1',
      [today]
    );

    const report = reportResult.rows[0];

    let emailContent = `
      <div style="font-family: 'Open Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #000440; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #000440; padding: 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-family: 'Playfair Display', serif; font-size: 24px;">
            Sourceline Daily Report
          </h2>
          <p style="color: #FFB347; margin: 8px 0 0 0; font-size: 14px;">${today}</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 24px; background-color: #ffffff;">
    `;

    if (!report) {
      emailContent += `
        <div style="text-align: center; padding: 40px 20px; background-color: #f8f9ff; border-radius: 8px;">
          <p style="margin: 0; font-size: 16px; color: #666;">No worker report was submitted for today.</p>
        </div>`;
    } else if (report.is_public_holiday) {
      emailContent += `
        <div style="text-align: center; padding: 40px 20px; background-color: #fff4ed; border-left: 4px solid #FF6806; border-radius: 4px;">
          <h3 style="color: #FF6806; margin-top: 0;">Public Holiday</h3>
          <p style="margin: 0; color: #555;">Today was marked as a Public Holiday. No worker activities recorded.</p>
        </div>`;
    } else {
      // Fetch activities
      const activitiesResult = await pool.query(
        'SELECT * FROM worker_activities WHERE daily_report_id = $1',
        [report.id]
      );
      const activities = activitiesResult.rows;

      if (activities.length === 0) {
        emailContent += `<p style="text-align: center; color: #666;">No specific worker activities were recorded for today.</p>`;
      } else {
        emailContent += `
          <h3 style="border-bottom: 2px solid #FF6806; padding-bottom: 8px; color: #000440; font-family: 'Playfair Display', serif;">Worker Activities</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <thead>
              <tr>
                <th style="background-color: #f8f9ff; color: #000440; text-align: left; padding: 12px; border-bottom: 2px solid #e0e0e0; font-weight: 600;">Worker Name</th>
                <th style="background-color: #f8f9ff; color: #000440; text-align: left; padding: 12px; border-bottom: 2px solid #e0e0e0; font-weight: 600;">Activity Details</th>
              </tr>
            </thead>
            <tbody>
              ${activities.map((act, index) => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-weight: 500; vertical-align: top; width: 30%;">${act.worker_name}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #444; vertical-align: top;">${act.activity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    }

    // Footer
    emailContent += `
        </div>
        <div style="background-color: #f8f9ff; padding: 16px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; font-size: 12px; color: #888;">This is an automated email from the Sourceline Admin Portal.</p>
        </div>
      </div>
    `;

    const bossEmail = process.env.BOSS_EMAIL; // Boss's email Address from .env
    const senderEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'; // Use your verified domain email

    if (!bossEmail) {
      console.warn('[CRON] BOSS_EMAIL is not set in environment variables. Cannot send email.');
      return;
    }

    const { data, error } = await resend.emails.send({
      from: `Sourceline Admin <${senderEmail}>`,
      to: [bossEmail],
      subject: `Daily Worker Report - ${today}`,
      html: emailContent,
    });

    if (error) {
      console.error('[CRON] Error from Resend API:', error);
      return;
    }

    console.log(`[CRON] Daily report email sent successfully: ${data.id}`);

  } catch (error) {
    console.error('[CRON] Error sending daily report email:', error);
  }
};

// Schedule job to run at 5:10 PM (17:10) from Monday to Friday
// Format: minute hour dayOfMonth month dayOfWeek
const initCronJobs = () => {
  cron.schedule('10 17 * * 1-5', () => {
    sendDailyReportEmail();
  }, {
    timezone: "Africa/Lagos" // Nigeria timezone
  });
  console.log('Daily report cron job initialized. Scheduled for 17:10 (Mon-Fri).');
};

module.exports = { initCronJobs, sendDailyReportEmail };
