const MAILEROO_API_KEY = process.env.MAILEROO_API_KEY;
const MAILEROO_API_URL = "https://smtp.maileroo.com/api/v2/emails";

export async function sendWelcomeEmail(email: string): Promise<boolean> {
  if (!MAILEROO_API_KEY) {
    console.error("MAILEROO_API_KEY not configured");
    return false;
  }

  console.log(`📧 Sending welcome email to ${email}`);

  try {
    const response = await fetch(MAILEROO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": MAILEROO_API_KEY,
      },
      body: JSON.stringify({
        from: {
          address: "noreply@memestake.io",
          display_name: "MEMES STAKE",
        },
        to: {
          address: email,
        },
        subject: "Welcome to MEMES STAKE! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px;">
            <h1 style="color: #ffd700; text-align: center;">🎉 Welcome to MEMES STAKE!</h1>
            
            <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #00ff88; margin-top: 0;">You're In! 🚀</h2>
              <p style="font-size: 16px; color: #fff;">
                Congratulations! You've successfully joined the MEMES STAKE community. Get ready to stake, earn, and grow with us!
              </p>
            </div>

            <div style="background: rgba(0, 191, 255, 0.1); border: 1px solid #00bfff; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #00bfff; margin-top: 0;">About MEMES STAKE</h3>
              <p style="font-size: 14px; color: #ccc;">
                MEMES STAKE is the ultimate meme token staking platform on BNB Smart Chain. 
                We offer industry-leading 365% APY (1% daily returns), a generous airdrop program, 
                and a rewarding referral system. Join thousands of meme enthusiasts building wealth together!
              </p>
              <ul style="color: #ccc; font-size: 14px;">
                <li>💰 <strong style="color: #00ff88;">365% APY</strong> - Earn 1% daily on your staked $MEMES</li>
                <li>🎁 <strong style="color: #ffd700;">100,000 $MEMES Airdrop</strong> - Complete tasks to claim</li>
                <li>👥 <strong style="color: #00bfff;">Referral Rewards</strong> - Earn 10,000 $MEMES per referral</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://memestake.io/dashboard" style="background: linear-gradient(135deg, #ffd700, #ff8c00); color: #000; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                🚀 Go to Dashboard
              </a>
            </div>

            <div style="border-top: 1px solid #333; padding-top: 20px; margin-top: 20px;">
              <p style="text-align: center; font-size: 14px; color: #888;">
                Follow us for updates and announcements:
              </p>
              <p style="text-align: center; font-size: 14px;">
                <a href="https://t.me/maboroshistake" style="color: #00bfff; margin: 0 10px;">Telegram</a> |
                <a href="https://twitter.com/maboroshistake" style="color: #00bfff; margin: 0 10px;">Twitter</a> |
                <a href="https://youtube.com/@maboroshistake" style="color: #00bfff; margin: 0 10px;">YouTube</a>
              </p>
            </div>

            <p style="text-align: center; font-size: 12px; color: #666; margin-top: 20px;">
              © 2024 MEMES STAKE. All rights reserved.<br>
              <a href="https://memestake.io" style="color: #ffd700;">memestake.io</a>
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Maileroo API error:", errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
}
