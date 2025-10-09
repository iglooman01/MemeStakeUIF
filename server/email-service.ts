// Email service for sending OTP codes
// In production, this would use SendGrid, AWS SES, or another email provider

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  // In development, we just log the OTP
  console.log(`📧 OTP for ${email}: ${otp}`);
  console.log(`This OTP will expire in 10 minutes`);
  
  // In production, you would send a real email here:
  // await emailProvider.send({
  //   to: email,
  //   subject: 'Your MEMES Airdrop Verification Code',
  //   html: `Your verification code is: <strong>${otp}</strong>`
  // });
  
  return true;
}
