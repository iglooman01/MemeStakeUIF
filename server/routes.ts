import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateOTP, sendOTPEmail } from "./email-service";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Airdrop API routes
  
  // Initialize or get airdrop participant
  app.post("/api/airdrop/init", async (req, res) => {
    try {
      const { walletAddress, referralCode } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address required" });
      }

      // Check if participant exists (using normalized address)
      let participant = await storage.getAirdropParticipant(walletAddress);
      
      if (!participant) {
        // Generate unique referral code for new participant
        const newReferralCode = `MEMES${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        // Validate referrer if provided and award referral tokens
        let referredBy = null;
        if (referralCode) {
          const referrer = await storage.getAirdropParticipantByReferralCode(referralCode);
          if (referrer) {
            referredBy = referralCode;
            // Award 100 tokens to referrer for this referral
            await storage.updateAirdropParticipant(referrer.walletAddress, {
              referralTokens: (referrer.referralTokens || 0) + 100,
            });
          }
        }
        
        participant = await storage.createAirdropParticipant({
          walletAddress,
          referralCode: newReferralCode,
          referredBy,
          emailVerified: false,
          telegramGroupCompleted: false,
          telegramChannelCompleted: false,
          twitterCompleted: false,
          youtubeCompleted: false,
          airdropTokens: 0,
          referralTokens: 0,
        });
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

  // Send OTP
  app.post("/api/airdrop/send-otp", async (req, res) => {
    try {
      const { email, walletAddress } = req.body;
      
      if (!email || !walletAddress) {
        return res.status(400).json({ error: "Email and wallet address required" });
      }

      const participant = await storage.getAirdropParticipant(walletAddress);
      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await storage.createOtp({
        email,
        otp,
        expiresAt,
        verified: false,
      });

      await sendOTPEmail(email, otp);

      res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  // Verify OTP
  app.post("/api/airdrop/verify-otp", async (req, res) => {
    try {
      const { email, otp, walletAddress } = req.body;
      
      if (!email || !otp || !walletAddress) {
        return res.status(400).json({ error: "Email, OTP, and wallet address required" });
      }

      const participant = await storage.getAirdropParticipant(walletAddress);
      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }

      const otpRecord = await storage.getLatestOtp(email);
      
      if (!otpRecord) {
        return res.status(404).json({ error: "OTP not found" });
      }

      if (otpRecord.verified) {
        return res.status(400).json({ error: "OTP already used" });
      }

      if (new Date() > otpRecord.expiresAt) {
        return res.status(400).json({ error: "OTP expired" });
      }

      if (otpRecord.otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
      }

      await storage.markOtpVerified(otpRecord.id);
      const updated = await storage.updateAirdropParticipant(walletAddress, {
        email,
        emailVerified: true,
      });

      res.json({ success: true, participant: updated });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ error: "Failed to verify OTP" });
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

      // Calculate new airdrop tokens (250 per task)
      let newAirdropTokens = participant.airdropTokens;
      if (!participant[taskField]) {
        newAirdropTokens += 250;
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

  const httpServer = createServer(app);

  return httpServer;
}
