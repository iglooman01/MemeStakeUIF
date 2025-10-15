const MAILEROO_API_KEY = process.env.MAILEROO_API_KEY;
const MAILEROO_API_URL = 'https://smtp.maileroo.com/send';

export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  if (!MAILEROO_API_KEY) {
    console.error('MAILEROO_API_KEY not configured');
    return false;
  }

  try {
    const response = await fetch(MAILEROO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': MAILEROO_API_KEY,
      },
      body: JSON.stringify({
        from: {
          email: 'noreply@memestake.com',
          name: 'MEMES STAKE'
        },
        to: [{ email }],
        subject: 'Verify your email for Memes Airdrop',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px;">
            <h1 style="color: #ffd700; text-align: center;">MEMES STAKE</h1>
            <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #00ff88; margin-top: 0;">Verification Code</h2>
              <p style="font-size: 16px; color: #fff;">Your verification code is:</p>
              <div style="background: #000; border: 2px solid #00ff88; border-radius: 8px; padding: 15px; margin: 15px 0; text-align: center;">
                <span style="font-size: 32px; font-weight: bold; color: #00ff88; letter-spacing: 8px;">${otp}</span>
              </div>
              <p style="font-size: 14px; color: #ccc;">This code will expire in 10 minutes.</p>
              <p style="font-size: 14px; color: #ccc;">If you didn't request this code, please ignore this email.</p>
            </div>
            <p style="text-align: center; font-size: 12px; color: #888; margin-top: 20px;">
              © 2024 MEMES STAKE. All rights reserved.
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Maileroo API error:', errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}
