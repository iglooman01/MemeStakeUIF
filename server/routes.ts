import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendWelcomeEmail } from "./maileroo";
import { z } from "zod";

const puzzleStore = new Map<string, { num1: number; num2: number; answer: number; expiresAt: Date }>();

function generateMathPuzzle(): { num1: number; num2: number; answer: number } {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  return { num1, num2, answer: num1 + num2 };
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

      // Validate puzzle answer
      const storedPuzzle = puzzleStore.get(walletAddress.toLowerCase());
      
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

      // Check if email already exists for a different wallet
      const existingEmail = await storage.getAirdropParticipantByEmail(email);
      if (existingEmail && existingEmail.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(400).json({ error: "This email is already used." });
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
              console.log('💰 Awarding 10,000 tokens to referrer');
              await storage.updateAirdropParticipant(referrer.walletAddress, {
                referralTokens: (referrer.referralTokens || 0) + 10000,
              });
            }
          } else {
            // It's a referral code - look up the wallet address
            console.log('🔍 Looking up sponsor by referral code:', sponsorCode);
            const referrer = await storage.getAirdropParticipantByReferralCode(sponsorCode);
            if (referrer) {
              referredBy = referrer.walletAddress;
              console.log('✅ Found referrer wallet, setting referred_by to:', referredBy);
              // Award 10,000 tokens to referrer
              await storage.updateAirdropParticipant(referrer.walletAddress, {
                referralTokens: (referrer.referralTokens || 0) + 10000,
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

      // Send welcome email only to new users
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
