import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendOTPEmail } from "./maileroo";
import { z } from "zod";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Airdrop API routes
  
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

  // Send OTP (no participant needed yet)
  app.post("/api/airdrop/send-otp", async (req, res) => {
    try {
      const { email, walletAddress, sponsorCode } = req.body;
      
      if (!email || !walletAddress) {
        return res.status(400).json({ error: "Email and wallet address required" });
      }

      // Check if email already exists for a different wallet
      const existingEmail = await storage.getAirdropParticipantByEmail(email);
      if (existingEmail && existingEmail.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(400).json({ error: "This email is already registered with another wallet" });
      }

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP with wallet and sponsor info for later use
      await storage.createOtp({
        email,
        otp,
        expiresAt,
        verified: false,
      });

      const emailSent = await sendOTPEmail(email, otp);
      if (!emailSent) {
        return res.status(500).json({ error: "Failed to send email. Please try again." });
      }

      res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  // Verify OTP and create participant record
  app.post("/api/airdrop/verify-otp", async (req, res) => {
    try {
      const { email, otp, walletAddress, sponsorCode } = req.body;
      
      if (!email || !otp || !walletAddress) {
        return res.status(400).json({ error: "Email, OTP, and wallet address required" });
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

      // Mark OTP as verified
      await storage.markOtpVerified(otpRecord.id);

      // Check if participant already exists
      let participant = await storage.getAirdropParticipant(walletAddress);
      
      if (!participant) {
        // Create new participant after email verification
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
              console.log('💰 Awarding 100 tokens to referrer');
              await storage.updateAirdropParticipant(referrer.walletAddress, {
                referralTokens: (referrer.referralTokens || 0) + 100,
              });
            }
          } else {
            // It's a referral code - look up the wallet address
            console.log('🔍 Looking up sponsor by referral code:', sponsorCode);
            const referrer = await storage.getAirdropParticipantByReferralCode(sponsorCode);
            if (referrer) {
              referredBy = referrer.walletAddress;
              console.log('✅ Found referrer wallet, setting referred_by to:', referredBy);
              // Award 100 tokens to referrer
              await storage.updateAirdropParticipant(referrer.walletAddress, {
                referralTokens: (referrer.referralTokens || 0) + 100,
              });
            } else {
              console.log('❌ Referral code not found:', sponsorCode);
            }
          }
        }
        
        participant = await storage.createAirdropParticipant({
          walletAddress,
          email,
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
          email,
          emailVerified: true,
        });
      }

      res.json({ success: true, participant });
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

  const httpServer = createServer(app);

  return httpServer;
}
