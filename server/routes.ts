import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendWelcomeEmail, sendOtpEmail } from "./maileroo";
import { z } from "zod";
import crypto from "crypto";

const puzzleStore = new Map<string, { num1: number; num2: number; answer: number; expiresAt: Date }>();
const otpStore = new Map<string, { otp: string; hashedOtp: string; expiresAt: Date; walletAddress: string }>();

// Email normalization to detect Gmail +alias abuse
function normalizeEmail(email: string): string {
  email = email.toLowerCase().trim();
  const [local, domain] = email.split("@");
  
  // Handle Gmail and Google aliases
  if (domain === "gmail.com" || domain === "googlemail.com") {
    // Remove dots and everything after + sign
    const normalizedLocal = local.split("+")[0].replace(/\./g, "");
    return `${normalizedLocal}@gmail.com`;
  }
  
  // For other domains, just remove the +alias part
  return `${local.split("+")[0]}@${domain}`;
}

function generateMathPuzzle(): { num1: number; num2: number; answer: number } {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  return { num1, num2, answer: num1 + num2 };
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Airdrop API routes
  
  // Get current verification mode (0 = OTP, 1 = Puzzle)
  app.get("/api/airdrop/verification-mode", async (req, res) => {
    try {
      const mode = await storage.getVerificationMode();
      const masterWallet = await storage.getMasterWallet();
      res.json({ mode, masterWallet });
    } catch (error) {
      console.error('Get verification mode error:', error);
      res.status(500).json({ error: "Failed to get verification mode" });
    }
  });

  // Set verification mode (master wallet only)
  app.post("/api/airdrop/verification-mode", async (req, res) => {
    try {
      const { mode, walletAddress } = req.body;
      
      if (mode === undefined || !walletAddress) {
        return res.status(400).json({ error: "Mode and wallet address required" });
      }

      if (mode !== 0 && mode !== 1) {
        return res.status(400).json({ error: "Mode must be 0 (OTP) or 1 (Puzzle)" });
      }

      const success = await storage.setVerificationMode(mode, walletAddress);
      
      if (!success) {
        return res.status(403).json({ error: "Only master wallet can change verification mode" });
      }

      res.json({ success: true, mode });
    } catch (error) {
      console.error('Set verification mode error:', error);
      res.status(500).json({ error: "Failed to set verification mode" });
    }
  });

  // Send OTP for email verification
  app.post("/api/airdrop/send-otp", async (req, res) => {
    try {
      const { email, walletAddress, sponsorCode } = req.body;
      
      if (!email || !walletAddress) {
        return res.status(400).json({ error: "Email and wallet address required" });
      }

      // Normalize email to prevent +alias abuse
      const normalizedEmail = normalizeEmail(email);
      
      // Check if email already exists for a different wallet (using normalized email)
      const existingEmail = await storage.getAirdropParticipantByEmail(normalizedEmail);
      if (existingEmail && existingEmail.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(409).json({ error: "You are already registered with us." });
      }

      // Check wallet uniqueness
      const existingWallet = await storage.getAirdropParticipant(walletAddress);
      if (existingWallet && existingWallet.emailVerified) {
        return res.status(409).json({ error: "This wallet is already registered." });
      }

      // Rate limiting: max 3 OTPs per hour
      const resendCount = await storage.getOtpResendCount(normalizedEmail);
      if (resendCount >= 3) {
        return res.status(429).json({ error: "Too many OTP requests. Please wait an hour before trying again." });
      }

      // Generate OTP
      const otp = generateOtp();
      const hashedOtp = hashOtp(otp);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store OTP
      otpStore.set(normalizedEmail, {
        otp,
        hashedOtp,
        expiresAt,
        walletAddress: walletAddress.toLowerCase()
      });

      // Increment resend count
      await storage.incrementOtpResendCount(normalizedEmail);

      // Send OTP email
      const sent = await sendOtpEmail(email, otp);
      
      if (!sent) {
        return res.status(500).json({ error: "Failed to send OTP email" });
      }

      console.log(`📧 OTP sent to ${normalizedEmail} (original: ${email})`);

      res.json({ 
        success: true, 
        message: "OTP sent. Please check your inbox or spam folder.",
        normalizedEmail // For debugging, remove in production
      });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  // Resend OTP
  app.post("/api/airdrop/resend-otp", async (req, res) => {
    try {
      const { email, walletAddress } = req.body;
      
      if (!email || !walletAddress) {
        return res.status(400).json({ error: "Email and wallet address required" });
      }

      const normalizedEmail = normalizeEmail(email);

      // Rate limiting: max 3 OTPs per hour
      const resendCount = await storage.getOtpResendCount(normalizedEmail);
      if (resendCount >= 3) {
        return res.status(429).json({ error: "Too many OTP requests. Please wait an hour before trying again." });
      }

      // Generate new OTP
      const otp = generateOtp();
      const hashedOtp = hashOtp(otp);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Store OTP
      otpStore.set(normalizedEmail, {
        otp,
        hashedOtp,
        expiresAt,
        walletAddress: walletAddress.toLowerCase()
      });

      await storage.incrementOtpResendCount(normalizedEmail);

      const sent = await sendOtpEmail(email, otp);
      
      if (!sent) {
        return res.status(500).json({ error: "Failed to send OTP email" });
      }

      res.json({ 
        success: true, 
        message: "OTP resent. Please check your spam/junk folder if you don't see it."
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ error: "Failed to resend OTP" });
    }
  });

  // Verify OTP and register user
  app.post("/api/airdrop/verify-otp", async (req, res) => {
    try {
      const { email, otp, walletAddress, sponsorCode } = req.body;
      
      if (!email || !otp || !walletAddress) {
        return res.status(400).json({ error: "Email, OTP, and wallet address required" });
      }

      const normalizedEmail = normalizeEmail(email);
      const storedOtp = otpStore.get(normalizedEmail);

      if (!storedOtp) {
        return res.status(400).json({ error: "OTP expired or not found. Please request a new one." });
      }

      if (new Date() > storedOtp.expiresAt) {
        otpStore.delete(normalizedEmail);
        return res.status(400).json({ error: "OTP expired. Please request a new one." });
      }

      // Verify wallet matches
      if (storedOtp.walletAddress !== walletAddress.toLowerCase()) {
        return res.status(400).json({ error: "Wallet address mismatch." });
      }

      // Verify OTP (compare hashed)
      if (hashOtp(otp) !== storedOtp.hashedOtp) {
        return res.status(400).json({ error: "Invalid OTP. Please try again." });
      }

      // OTP verified, remove from store
      otpStore.delete(normalizedEmail);
      await storage.resetOtpResendCount(normalizedEmail);

      // Check if participant exists
      let participant = await storage.getAirdropParticipant(walletAddress);
      const isNewUser = !participant;

      if (!participant) {
        // Create new participant
        const newReferralCode = `MEMES${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        let referredBy = null;
        if (sponsorCode) {
          if (sponsorCode.startsWith('0x')) {
            referredBy = sponsorCode.toLowerCase();
            const referrer = await storage.getAirdropParticipant(sponsorCode);
            if (referrer) {
              await storage.updateAirdropParticipant(referrer.walletAddress, {
                referralTokens: (referrer.referralTokens || 0) + 100000,
              });
            }
          } else {
            const referrer = await storage.getAirdropParticipantByReferralCode(sponsorCode);
            if (referrer) {
              referredBy = referrer.walletAddress;
              await storage.updateAirdropParticipant(referrer.walletAddress, {
                referralTokens: (referrer.referralTokens || 0) + 100000,
              });
            }
          }
        }
        
        participant = await storage.createAirdropParticipant({
          walletAddress,
          email: normalizedEmail,
          referralCode: newReferralCode,
          referredBy,
          emailVerified: true,
          telegramGroupCompleted: false,
          telegramChannelCompleted: false,
          twitterCompleted: false,
          youtubeCompleted: false,
          airdropTokens: 0,
          referralTokens: 0,
        });
      } else {
        participant = await storage.updateAirdropParticipant(walletAddress, {
          email: normalizedEmail,
          emailVerified: true,
        });
      }

      // Send welcome email
      if (isNewUser) {
        sendWelcomeEmail(email).catch(err => {
          console.error('Failed to send welcome email:', err);
        });
      }

      res.json({ success: true, participant });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  });

  // Initialize or get airdrop participant (only checks if exists, doesn't create)
  app.post("/api/airdrop/init", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address required" });
      }

      // Check if participant exists (using normalized address)
      const participant = await storage.getAirdropParticipant(walletAddress);
      
      if (!participant) {
        // Return null if participant doesn't exist yet (will be created after email verification)
        return res.json({ participant: null });
      }
      
      const referralCount = await storage.getReferralCount(participant.referralCode);
      
      res.json({
        participant,
        referralCount,
        referralLink: `${req.protocol}://${req.get('host')}/dashboard?ref=${participant.referralCode}`
      });
    } catch (error) {
      console.error('Airdrop init error:', error);
      res.status(500).json({ error: "Failed to initialize airdrop" });
    }
  });

  // Generate math puzzle for email verification
  app.post("/api/airdrop/get-puzzle", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address required" });
      }

      const puzzle = generateMathPuzzle();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      puzzleStore.set(walletAddress.toLowerCase(), {
        num1: puzzle.num1,
        num2: puzzle.num2,
        answer: puzzle.answer,
        expiresAt
      });

      res.json({ 
        success: true, 
        puzzle: { num1: puzzle.num1, num2: puzzle.num2 }
      });
    } catch (error) {
      console.error('Get puzzle error:', error);
      res.status(500).json({ error: "Failed to generate puzzle" });
    }
  });

  // Verify puzzle and register email
  app.post("/api/airdrop/verify-puzzle", async (req, res) => {
    try {
      const { email, puzzleAnswer, walletAddress, sponsorCode } = req.body;
      
      if (!email || puzzleAnswer === undefined || !walletAddress) {
        return res.status(400).json({ error: "Email, puzzle answer, and wallet address required" });
      }

      // Normalize email to prevent +alias abuse
      const normalizedEmail = normalizeEmail(email);

      // Validate puzzle answer
      const storedPuzzle = puzzleStore.get(walletAddress.toLowerCase());
      console.log("storedPuzzle : ", storedPuzzle);
      if (!storedPuzzle) {
        return res.status(400).json({ error: "Puzzle expired. Please refresh and try again." });
      }

      if (new Date() > storedPuzzle.expiresAt) {
        puzzleStore.delete(walletAddress.toLowerCase());
        return res.status(400).json({ error: "Puzzle expired. Please refresh and try again." });
      }

      if (parseInt(puzzleAnswer) !== storedPuzzle.answer) {
        return res.status(400).json({ error: "Incorrect answer. Please try again." });
      }

      // Puzzle verified, remove from store
      puzzleStore.delete(walletAddress.toLowerCase());

      // Check if email already exists for a different wallet (using normalized email)
      const existingEmail = await storage.getAirdropParticipantByEmail(normalizedEmail);
      if (existingEmail && existingEmail.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(409).json({ error: "You are already registered with us." });
      }

      // Check if this is a new user (for welcome email)
      const existingParticipant = await storage.getAirdropParticipant(walletAddress);
      const isNewUser = !existingParticipant;

      // Check if participant already exists
      let participant = existingParticipant;
      
      if (!participant) {
        // Create new participant after puzzle verification
        const newReferralCode = `MEMES${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        // Set referred_by from sponsor address/code
        let referredBy = null;
        if (sponsorCode) {
          console.log('🎯 Received sponsor code:', sponsorCode);
          
          // If it's a wallet address, use it directly as referred_by
          if (sponsorCode.startsWith('0x')) {
            referredBy = sponsorCode.toLowerCase();
            console.log('✅ Setting referred_by to sponsor wallet address:', referredBy);
            
            // Try to award tokens to referrer if they exist in database
            const referrer = await storage.getAirdropParticipant(sponsorCode);
            if (referrer) {
              console.log('💰 Awarding 1,00,000 tokens to referrer');
              await storage.updateAirdropParticipant(referrer.walletAddress, {
                referralTokens: (referrer.referralTokens || 0) + 100000,
              });
            }
          } else {
            // It's a referral code - look up the wallet address
            console.log('🔍 Looking up sponsor by referral code:', sponsorCode);
            const referrer = await storage.getAirdropParticipantByReferralCode(sponsorCode);
            if (referrer) {
              referredBy = referrer.walletAddress;
              console.log('✅ Found referrer wallet, setting referred_by to:', referredBy);
              // Award 1,00,000 tokens to referrer
              await storage.updateAirdropParticipant(referrer.walletAddress, {
                referralTokens: (referrer.referralTokens || 0) + 100000,
              });
            } else {
              console.log('❌ Referral code not found:', sponsorCode);
            }
          }
        }
        
        participant = await storage.createAirdropParticipant({
          walletAddress,
          email: normalizedEmail,
          referralCode: newReferralCode,
          referredBy,
          emailVerified: true,
          telegramGroupCompleted: false,
          telegramChannelCompleted: false,
          twitterCompleted: false,
          youtubeCompleted: false,
          airdropTokens: 0,
          referralTokens: 0,
        });
      } else {
        // Update existing participant
        participant = await storage.updateAirdropParticipant(walletAddress, {
          email: normalizedEmail,
          emailVerified: true,
        });
      }

      // Send welcome email only to new users (use original email for delivery)
      if (isNewUser) {
        sendWelcomeEmail(email).catch(err => {
          console.error('Failed to send welcome email:', err);
        });
      }

      res.json({ success: true, participant });
    } catch (error) {
      console.error('Verify puzzle error:', error);
      res.status(500).json({ error: "Failed to verify email" });
    }
  });

  // Skip email verification
  app.post("/api/airdrop/skip-verification", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address required" });
      }

      const participant = await storage.getAirdropParticipant(walletAddress);
      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }

      const updated = await storage.updateAirdropParticipant(walletAddress, {
        emailVerified: true,
      });

      res.json({ success: true, participant: updated });
    } catch (error) {
      console.error('Skip verification error:', error);
      res.status(500).json({ error: "Failed to skip verification" });
    }
  });

  // Complete social task
  app.post("/api/airdrop/complete-task", async (req, res) => {
    try {
      const { walletAddress, taskId } = req.body;
      
      if (!walletAddress || !taskId) {
        return res.status(400).json({ error: "Wallet address and task ID required" });
      }

      const participant = await storage.getAirdropParticipant(walletAddress);
      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }

      if (!participant.emailVerified) {
        return res.status(400).json({ error: "Email verification required" });
      }

      const taskMap: Record<string, keyof typeof participant> = {
        telegram_group: 'telegramGroupCompleted',
        telegram_channel: 'telegramChannelCompleted',
        twitter: 'twitterCompleted',
        youtube: 'youtubeCompleted',
      };

      const taskField = taskMap[taskId];
      if (!taskField) {
        return res.status(400).json({ error: "Invalid task ID" });
      }

      // Calculate new airdrop tokens (25,000 per task = 100,000 total for 4 tasks)
      let newAirdropTokens = participant.airdropTokens;
      if (!participant[taskField]) {
        newAirdropTokens += 25000;
      }

      const updated = await storage.updateAirdropParticipant(walletAddress, {
        [taskField]: true,
        airdropTokens: newAirdropTokens,
      });

      res.json({ success: true, participant: updated });
    } catch (error) {
      console.error('Complete task error:', error);
      res.status(500).json({ error: "Failed to complete task" });
    }
  });

  // Get airdrop status
  app.get("/api/airdrop/status/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      const participant = await storage.getAirdropParticipant(walletAddress);
      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }

      const referralCount = await storage.getReferralCount(participant.referralCode);
      
      // Calculate referral tokens (based on referral count and levels)
      // Simplified: 100 tokens per direct referral
      const referralTokens = referralCount * 100;
      
      await storage.updateAirdropParticipant(walletAddress, {
        referralTokens,
      });

      res.json({
        participant: { ...participant, referralTokens },
        referralCount,
        referralLink: `${req.protocol}://${req.get('host')}/dashboard?ref=${participant.referralCode}`
      });
    } catch (error) {
      console.error('Get status error:', error);
      res.status(500).json({ error: "Failed to get status" });
    }
  });

  // Get participant stats (for homepage)
  app.get("/api/airdrop/stats", async (req, res) => {
    try {
      const stats = await storage.getParticipantStats();
      res.json(stats);
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  // ========== MASTER WALLET ANALYTICS ROUTES ==========
  const MASTER_WALLET = "0xb79f08d7b6903db05afca56aee75a2c7cdc78e56";

  // Verify master wallet middleware
  const verifyMasterWallet = (walletAddress: string): boolean => {
    return walletAddress?.toLowerCase() === MASTER_WALLET.toLowerCase();
  };

  // Track page views (called from frontend)
  app.post("/api/analytics/track-pageview", async (req, res) => {
    try {
      const { path, walletAddress } = req.body;
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'unknown';
      const userAgent = req.headers['user-agent'];
      
      // Get country from IP using geoip-lite
      let country = 'Unknown';
      try {
        const geoip = await import('geoip-lite');
        const geo = geoip.default.lookup(ip);
        if (geo) {
          country = geo.country || 'Unknown';
        }
      } catch (e) {
        console.error('GeoIP lookup failed:', e);
      }
      
      await storage.trackPageView({
        ipAddress: ip,
        userAgent,
        country,
        path: path || '/',
        walletAddress,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Track page view error:', error);
      res.status(500).json({ error: "Failed to track page view" });
    }
  });

  // Get user analytics (master wallet only)
  app.get("/api/admin/analytics/users", async (req, res) => {
    try {
      const { wallet } = req.query;
      
      if (!wallet || !verifyMasterWallet(wallet as string)) {
        return res.status(403).json({ error: "Access denied. Master wallet required." });
      }

      const analytics = await storage.getUserAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Get user analytics error:', error);
      res.status(500).json({ error: "Failed to get user analytics" });
    }
  });

  // Get traffic analytics (master wallet only)
  app.get("/api/admin/analytics/traffic", async (req, res) => {
    try {
      const { wallet } = req.query;
      
      if (!wallet || !verifyMasterWallet(wallet as string)) {
        return res.status(403).json({ error: "Access denied. Master wallet required." });
      }

      const analytics = await storage.getTrafficAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Get traffic analytics error:', error);
      res.status(500).json({ error: "Failed to get traffic analytics" });
    }
  });

  // Get country analytics (master wallet only)
  app.get("/api/admin/analytics/countries", async (req, res) => {
    try {
      const { wallet, days } = req.query;
      
      if (!wallet || !verifyMasterWallet(wallet as string)) {
        return res.status(403).json({ error: "Access denied. Master wallet required." });
      }

      const daysNum = parseInt(days as string) || 30;
      const analytics = await storage.getCountryAnalytics(daysNum);
      res.json(analytics);
    } catch (error) {
      console.error('Get country analytics error:', error);
      res.status(500).json({ error: "Failed to get country analytics" });
    }
  });

  // Export all user data to Excel (master wallet only)
  app.get("/api/admin/export/users", async (req, res) => {
    try {
      const { wallet } = req.query;
      
      if (!wallet || !verifyMasterWallet(wallet as string)) {
        return res.status(403).json({ error: "Access denied. Master wallet required." });
      }

      const XLSX = await import('xlsx');
      const participants = await storage.getAllParticipantsForExport();
      
      // Transform data for Excel
      const excelData = participants.map(p => ({
        'Email ID': p.email || '',
        'Normalized Email': p.normalizedEmail || '',
        'Wallet Address': p.walletAddress,
        'Verification Status': p.emailVerified ? 'Verified' : 'Unverified',
        'Country': p.country || 'Unknown',
        'Registration Date': p.createdAt ? new Date(p.createdAt).toISOString() : '',
        'Verification Date': p.verifiedAt ? new Date(p.verifiedAt).toISOString() : '',
        'Token Holder': (p.airdropTokens || 0) > 0 || (p.referralTokens || 0) > 0 ? 'Yes' : 'No',
        'Airdrop Tokens': p.airdropTokens || 0,
        'Referral Tokens': p.referralTokens || 0,
        'Referred By': p.referredBy || '',
        'Referral Code': p.referralCode || '',
        'Exported': p.exported ? 'Yes' : 'No',
      }));

      // Create workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', 'attachment; filename=memestake_users_export.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error('Export users error:', error);
      res.status(500).json({ error: "Failed to export users" });
    }
  });

  // Export all emails only (master wallet only)
  app.get("/api/admin/export/emails", async (req, res) => {
    try {
      const { wallet } = req.query;
      
      if (!wallet || !verifyMasterWallet(wallet as string)) {
        return res.status(403).json({ error: "Access denied. Master wallet required." });
      }

      const XLSX = await import('xlsx');
      const participants = await storage.getAllParticipantsForExport();
      
      // Transform data for Excel (emails only)
      const excelData = participants
        .filter(p => p.email)
        .map(p => ({
          'Email': p.email || '',
          'Wallet Address': p.walletAddress,
          'Verified': p.emailVerified ? 'Yes' : 'No',
        }));

      // Create workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Emails');

      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', 'attachment; filename=memestake_emails_export.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error('Export emails error:', error);
      res.status(500).json({ error: "Failed to export emails" });
    }
  });

  // ========== END ANALYTICS ROUTES ==========

  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const admin = await storage.getAdminByUsername(username);
      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({ success: true, admin: { id: admin.id, username: admin.username } });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // News routes
  app.get("/api/news", async (req, res) => {
    try {
      const news = await storage.getPublishedNews();
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.get("/api/admin/news", async (req, res) => {
    try {
      const news = await storage.getAllNews();
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.post("/api/admin/news", async (req, res) => {
    try {
      const newsData = req.body;
      const news = await storage.createNews(newsData);
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to create news" });
    }
  });

  app.put("/api/admin/news/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const news = await storage.updateNews(id, updates);
      if (!news) {
        return res.status(404).json({ error: "News not found" });
      }
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to update news" });
    }
  });

  app.delete("/api/admin/news/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNews(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete news" });
    }
  });

  // ========== NEWS TICKER ROUTES (Dashboard scrolling news) ==========
  
  // Public: Get active news ticker message
  app.get("/api/news-ticker", async (req, res) => {
    try {
      const ticker = await storage.getActiveNewsTicker();
      if (ticker) {
        res.json({ message: ticker.message });
      } else {
        // Default message if no active ticker
        res.json({ message: "🎉 Congratulations! We are live. Complete your task and claim your reward." });
      }
    } catch (error) {
      console.error('Get news ticker error:', error);
      res.json({ message: "🎉 Congratulations! We are live. Complete your task and claim your reward." });
    }
  });

  // Master wallet: Get all news tickers
  app.get("/api/admin/news-ticker", async (req, res) => {
    try {
      const { wallet } = req.query;
      
      if (!wallet || !verifyMasterWallet(wallet as string)) {
        return res.status(403).json({ error: "Access denied. Master wallet required." });
      }

      const tickers = await storage.getAllNewsTickers();
      res.json(tickers);
    } catch (error) {
      console.error('Get all news tickers error:', error);
      res.status(500).json({ error: "Failed to get news tickers" });
    }
  });

  // Master wallet: Create news ticker
  app.post("/api/admin/news-ticker", async (req, res) => {
    try {
      const { wallet, message, isActive } = req.body;
      
      if (!wallet || !verifyMasterWallet(wallet)) {
        return res.status(403).json({ error: "Access denied. Master wallet required." });
      }

      const ticker = await storage.createNewsTicker({ 
        message, 
        isActive: isActive !== undefined ? isActive : true 
      });
      res.json(ticker);
    } catch (error) {
      console.error('Create news ticker error:', error);
      res.status(500).json({ error: "Failed to create news ticker" });
    }
  });

  // Master wallet: Update news ticker
  app.put("/api/admin/news-ticker/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { wallet, message, isActive } = req.body;
      
      if (!wallet || !verifyMasterWallet(wallet)) {
        return res.status(403).json({ error: "Access denied. Master wallet required." });
      }

      const updates: any = {};
      if (message !== undefined) updates.message = message;
      if (isActive !== undefined) updates.isActive = isActive;

      const ticker = await storage.updateNewsTicker(id, updates);
      if (!ticker) {
        return res.status(404).json({ error: "News ticker not found" });
      }
      res.json(ticker);
    } catch (error) {
      console.error('Update news ticker error:', error);
      res.status(500).json({ error: "Failed to update news ticker" });
    }
  });

  // Master wallet: Delete news ticker
  app.delete("/api/admin/news-ticker/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { wallet } = req.body;
      
      if (!wallet || !verifyMasterWallet(wallet)) {
        return res.status(403).json({ error: "Access denied. Master wallet required." });
      }

      await storage.deleteNewsTicker(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete news ticker error:', error);
      res.status(500).json({ error: "Failed to delete news ticker" });
    }
  });

  // ========== END NEWS TICKER ROUTES ==========

  // Email subscription routes
  app.post("/api/subscribe", async (req, res) => {
    try {
      const { email, walletAddress } = req.body;
      
      const existing = await storage.getSubscriptionByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already subscribed" });
      }

      const subscription = await storage.createSubscription({ email, walletAddress });
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  app.post("/api/unsubscribe", async (req, res) => {
    try {
      const { email } = req.body;
      await storage.unsubscribe(email);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to unsubscribe" });
    }
  });

  app.get("/api/admin/subscriptions", async (req, res) => {
    try {
      const subscriptions = await storage.getAllSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  });

  // Transaction routes
  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = req.body;
      
      // Validate required fields
      if (!transactionData.walletAddress || !transactionData.transactionType || 
          !transactionData.amount || !transactionData.transactionHash) {
        return res.status(400).json({ error: "Missing required transaction fields" });
      }
      
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error('Create transaction error:', error);
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  app.get("/api/transactions/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const transactions = await storage.getTransactionsByWallet(walletAddress);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:walletAddress/type/:type", async (req, res) => {
    try {
      const { walletAddress, type } = req.params;
      const transactions = await storage.getTransactionsByType(walletAddress, type);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions by type" });
    }
  });

  app.put("/api/transactions/:hash/status", async (req, res) => {
    try {
      const { hash } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const transaction = await storage.updateTransactionStatus(hash, status);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to update transaction status" });
    }
  });

  // Crypto news endpoint - fetches latest meme coin news
  app.get("/api/crypto-news", async (req, res) => {
    try {
      // Fetch news from CryptoCompare (free API)
      const response = await fetch(
        'https://min-api.cryptocompare.com/data/v2/news/?categories=Meme,Altcoin,Trading&excludeCategories=Sponsored&lang=EN'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data = await response.json();
      
      // Get top 5 news articles
      const news = data.Data?.slice(0, 5).map((article: any) => ({
        id: article.id,
        title: article.title,
        body: article.body?.substring(0, 200) + '...',
        imageUrl: article.imageurl,
        url: article.url,
        source: article.source,
        publishedAt: new Date(article.published_on * 1000).toISOString(),
        categories: article.categories
      })) || [];
      
      res.json({ news, fetchedAt: new Date().toISOString() });
    } catch (error) {
      console.error('Crypto news fetch error:', error);
      // Return fallback news if API fails
      res.json({
        news: [
          {
            id: 1,
            title: "Meme Coins Continue to Dominate Crypto Markets",
            body: "The meme coin sector has seen unprecedented growth as community-driven tokens gain mainstream adoption...",
            imageUrl: "https://images.cryptocompare.com/news/default/cryptocompare.png",
            url: "https://www.cryptocompare.com",
            source: "CryptoNews",
            publishedAt: new Date().toISOString(),
            categories: "Meme|Trading"
          },
          {
            id: 2,
            title: "DeFi Staking Rewards: What You Need to Know",
            body: "Understanding staking rewards and how to maximize your returns in the decentralized finance ecosystem...",
            imageUrl: "https://images.cryptocompare.com/news/default/cryptocompare.png",
            url: "https://www.cryptocompare.com",
            source: "DeFi Weekly",
            publishedAt: new Date().toISOString(),
            categories: "DeFi|Staking"
          },
          {
            id: 3,
            title: "BNB Chain Ecosystem Growth Accelerates",
            body: "Binance Smart Chain continues to attract developers and projects with low fees and fast transactions...",
            imageUrl: "https://images.cryptocompare.com/news/default/cryptocompare.png",
            url: "https://www.cryptocompare.com",
            source: "Blockchain Daily",
            publishedAt: new Date().toISOString(),
            categories: "Altcoin|Trading"
          },
          {
            id: 4,
            title: "Community Tokens: The Future of Crypto",
            body: "How community-driven projects are reshaping the cryptocurrency landscape with innovative tokenomics...",
            imageUrl: "https://images.cryptocompare.com/news/default/cryptocompare.png",
            url: "https://www.cryptocompare.com",
            source: "Crypto Insights",
            publishedAt: new Date().toISOString(),
            categories: "Meme|Community"
          },
          {
            id: 5,
            title: "Airdrop Strategies for Maximum Returns",
            body: "Expert tips on participating in crypto airdrops and maximizing your token rewards safely...",
            imageUrl: "https://images.cryptocompare.com/news/default/cryptocompare.png",
            url: "https://www.cryptocompare.com",
            source: "Token Tribune",
            publishedAt: new Date().toISOString(),
            categories: "Airdrop|Trading"
          }
        ],
        fetchedAt: new Date().toISOString(),
        fallback: true
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
