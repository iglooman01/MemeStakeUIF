import { 
  type User, 
  type InsertUser, 
  type AirdropParticipant, 
  type InsertAirdropParticipant,
  type OtpVerification,
  type InsertOtpVerification,
  type AdminUser,
  type InsertAdminUser,
  type NewsUpdate,
  type InsertNewsUpdate,
  type EmailSubscription,
  type InsertEmailSubscription,
  type Transaction,
  type InsertTransaction,
  type NewsTicker,
  type InsertNewsTicker
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Airdrop participant methods
  getAirdropParticipant(walletAddress: string): Promise<AirdropParticipant | undefined>;
  getAirdropParticipantByReferralCode(code: string): Promise<AirdropParticipant | undefined>;
  getAirdropParticipantByEmail(email: string): Promise<AirdropParticipant | undefined>;
  createAirdropParticipant(participant: InsertAirdropParticipant): Promise<AirdropParticipant>;
  updateAirdropParticipant(walletAddress: string, updates: Partial<AirdropParticipant>): Promise<AirdropParticipant | undefined>;
  getReferralCount(referralCode: string): Promise<number>;
  
  // OTP methods
  createOtp(otp: InsertOtpVerification): Promise<OtpVerification>;
  getLatestOtp(email: string): Promise<OtpVerification | undefined>;
  markOtpVerified(id: string): Promise<void>;
  
  // Admin methods
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  createAdmin(admin: InsertAdminUser): Promise<AdminUser>;
  
  // News methods
  getAllNews(): Promise<NewsUpdate[]>;
  getPublishedNews(): Promise<NewsUpdate[]>;
  getNewsById(id: string): Promise<NewsUpdate | undefined>;
  createNews(news: InsertNewsUpdate): Promise<NewsUpdate>;
  updateNews(id: string, updates: Partial<NewsUpdate>): Promise<NewsUpdate | undefined>;
  deleteNews(id: string): Promise<void>;
  
  // Email subscription methods
  getAllSubscriptions(): Promise<EmailSubscription[]>;
  getSubscriptionByEmail(email: string): Promise<EmailSubscription | undefined>;
  createSubscription(subscription: InsertEmailSubscription): Promise<EmailSubscription>;
  unsubscribe(email: string): Promise<void>;
  
  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByWallet(walletAddress: string): Promise<Transaction[]>;
  getTransactionByHash(hash: string): Promise<Transaction | undefined>;
  updateTransactionStatus(hash: string, status: string): Promise<Transaction | undefined>;
  getTransactionsByType(walletAddress: string, type: string): Promise<Transaction[]>;
  
  // Verification settings methods
  getVerificationMode(): Promise<number>;
  setVerificationMode(mode: number, masterWallet: string): Promise<boolean>;
  getMasterWallet(): Promise<string>;
  
  // OTP rate limiting
  getOtpResendCount(email: string): Promise<number>;
  incrementOtpResendCount(email: string): Promise<void>;
  resetOtpResendCount(email: string): Promise<void>;
  
  // Analytics methods (admin dashboard)
  getUserAnalytics(): Promise<{
    totalUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    tokenHolders: number;
  }>;
  getTrafficAnalytics(): Promise<{
    totalPageViews: number;
    uniqueUsersLast24h: number;
  }>;
  getCountryAnalytics(days: number): Promise<{ country: string; count: number }[]>;
  getAllParticipantsForExport(): Promise<AirdropParticipant[]>;
  
  // Page view tracking
  trackPageView(data: { ipAddress: string; userAgent?: string; country?: string; path: string; walletAddress?: string }): Promise<void>;
  
  // News ticker methods
  getActiveNewsTicker(): Promise<NewsTicker | undefined>;
  getAllNewsTickers(): Promise<NewsTicker[]>;
  createNewsTicker(ticker: InsertNewsTicker): Promise<NewsTicker>;
  updateNewsTicker(id: string, updates: Partial<NewsTicker>): Promise<NewsTicker | undefined>;
  deleteNewsTicker(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private airdropParticipants: Map<string, AirdropParticipant>;
  private otpVerifications: Map<string, OtpVerification>;
  private adminUsers: Map<string, AdminUser>;
  private newsUpdates: Map<string, NewsUpdate>;
  private emailSubscriptions: Map<string, EmailSubscription>;
  private transactions: Map<string, Transaction>;
  private verificationMode: number = 1; // Default: Puzzle mode
  private masterWallet: string = "0xb79f08d7b6903db05afca56aee75a2c7cdc78e56";
  private otpResendCounts: Map<string, { count: number; resetAt: Date }>;

  constructor() {
    this.users = new Map();
    this.airdropParticipants = new Map();
    this.otpVerifications = new Map();
    this.adminUsers = new Map();
    this.newsUpdates = new Map();
    this.emailSubscriptions = new Map();
    this.transactions = new Map();
    this.otpResendCounts = new Map();
    
    // Create default admin user
    const defaultAdmin: AdminUser = {
      id: randomUUID(),
      username: "kbody",
      password: "kbody@007",
      createdAt: new Date(),
    };
    this.adminUsers.set(defaultAdmin.username, defaultAdmin);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Airdrop participant methods
  async getAirdropParticipant(walletAddress: string): Promise<AirdropParticipant | undefined> {
    return this.airdropParticipants.get(walletAddress.toLowerCase());
  }

  async getAirdropParticipantByReferralCode(code: string): Promise<AirdropParticipant | undefined> {
    return Array.from(this.airdropParticipants.values()).find(
      (p) => p.referralCode === code
    );
  }

  async getAirdropParticipantByEmail(email: string): Promise<AirdropParticipant | undefined> {
    return Array.from(this.airdropParticipants.values()).find(
      (p) => p.email?.toLowerCase() === email.toLowerCase()
    );
  }

  async createAirdropParticipant(participant: InsertAirdropParticipant): Promise<AirdropParticipant> {
    const id = randomUUID();
    const now = new Date();
    const newParticipant: AirdropParticipant = {
      id,
      walletAddress: participant.walletAddress.toLowerCase(),
      email: participant.email || null,
      emailVerified: participant.emailVerified ?? false,
      referralCode: participant.referralCode,
      referredBy: participant.referredBy || null,
      telegramGroupCompleted: participant.telegramGroupCompleted ?? false,
      telegramChannelCompleted: participant.telegramChannelCompleted ?? false,
      twitterCompleted: participant.twitterCompleted ?? false,
      youtubeCompleted: participant.youtubeCompleted ?? false,
      airdropTokens: participant.airdropTokens ?? 0,
      referralTokens: participant.referralTokens ?? 0,
      exported: participant.exported ?? false,
      createdAt: now,
    };
    this.airdropParticipants.set(newParticipant.walletAddress, newParticipant);
    return newParticipant;
  }

  async updateAirdropParticipant(
    walletAddress: string, 
    updates: Partial<AirdropParticipant>
  ): Promise<AirdropParticipant | undefined> {
    const participant = await this.getAirdropParticipant(walletAddress);
    if (!participant) return undefined;
    
    const updated = { ...participant, ...updates };
    this.airdropParticipants.set(walletAddress.toLowerCase(), updated);
    return updated;
  }

  async getReferralCount(referralCode: string): Promise<number> {
    return Array.from(this.airdropParticipants.values()).filter(
      (p) => p.referredBy === referralCode
    ).length;
  }

  async getParticipantStats(): Promise<{ totalParticipants: number; verifiedParticipants: number }> {
    const allParticipants = Array.from(this.airdropParticipants.values());
    return {
      totalParticipants: allParticipants.length,
      verifiedParticipants: allParticipants.filter(p => p.emailVerified).length
    };
  }

  // OTP methods
  async createOtp(otp: InsertOtpVerification): Promise<OtpVerification> {
    const id = randomUUID();
    const now = new Date();
    const newOtp: OtpVerification = {
      id,
      email: otp.email,
      otp: otp.otp,
      expiresAt: otp.expiresAt,
      verified: otp.verified ?? false,
      createdAt: now,
    };
    this.otpVerifications.set(id, newOtp);
    return newOtp;
  }

  async getLatestOtp(email: string): Promise<OtpVerification | undefined> {
    const otps = Array.from(this.otpVerifications.values())
      .filter((o) => o.email === email)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return otps[0];
  }

  async markOtpVerified(id: string): Promise<void> {
    const otp = this.otpVerifications.get(id);
    if (otp) {
      this.otpVerifications.set(id, { ...otp, verified: true });
    }
  }

  // Admin methods
  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    return this.adminUsers.get(username);
  }

  async createAdmin(admin: InsertAdminUser): Promise<AdminUser> {
    const id = randomUUID();
    const now = new Date();
    const newAdmin: AdminUser = {
      id,
      username: admin.username,
      password: admin.password,
      createdAt: now,
    };
    this.adminUsers.set(admin.username, newAdmin);
    return newAdmin;
  }

  // News methods
  async getAllNews(): Promise<NewsUpdate[]> {
    return Array.from(this.newsUpdates.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getPublishedNews(): Promise<NewsUpdate[]> {
    return Array.from(this.newsUpdates.values())
      .filter((n) => n.published)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getNewsById(id: string): Promise<NewsUpdate | undefined> {
    return this.newsUpdates.get(id);
  }

  async createNews(news: InsertNewsUpdate): Promise<NewsUpdate> {
    const id = randomUUID();
    const now = new Date();
    const newNews: NewsUpdate = {
      id,
      title: news.title,
      content: news.content,
      published: news.published ?? false,
      createdAt: now,
      updatedAt: now,
    };
    this.newsUpdates.set(id, newNews);
    return newNews;
  }

  async updateNews(id: string, updates: Partial<NewsUpdate>): Promise<NewsUpdate | undefined> {
    const news = this.newsUpdates.get(id);
    if (!news) return undefined;
    
    const updated: NewsUpdate = {
      ...news,
      ...updates,
      updatedAt: new Date(),
    };
    this.newsUpdates.set(id, updated);
    return updated;
  }

  async deleteNews(id: string): Promise<void> {
    this.newsUpdates.delete(id);
  }

  // Email subscription methods
  async getAllSubscriptions(): Promise<EmailSubscription[]> {
    return Array.from(this.emailSubscriptions.values()).sort(
      (a, b) => b.subscribedAt.getTime() - a.subscribedAt.getTime()
    );
  }

  async getSubscriptionByEmail(email: string): Promise<EmailSubscription | undefined> {
    return this.emailSubscriptions.get(email.toLowerCase());
  }

  async createSubscription(subscription: InsertEmailSubscription): Promise<EmailSubscription> {
    const id = randomUUID();
    const now = new Date();
    const newSubscription: EmailSubscription = {
      id,
      email: subscription.email.toLowerCase(),
      walletAddress: subscription.walletAddress || null,
      subscribed: subscription.subscribed ?? true,
      subscribedAt: now,
      unsubscribedAt: null,
    };
    this.emailSubscriptions.set(newSubscription.email, newSubscription);
    return newSubscription;
  }

  async unsubscribe(email: string): Promise<void> {
    const subscription = this.emailSubscriptions.get(email.toLowerCase());
    if (subscription) {
      const updated: EmailSubscription = {
        ...subscription,
        subscribed: false,
        unsubscribedAt: new Date(),
      };
      this.emailSubscriptions.set(email.toLowerCase(), updated);
    }
  }

  // Transaction methods
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const now = new Date();
    const newTransaction: Transaction = {
      id,
      walletAddress: transaction.walletAddress.toLowerCase(),
      transactionType: transaction.transactionType,
      amount: transaction.amount,
      tokenSymbol: transaction.tokenSymbol || "MEMES",
      transactionHash: transaction.transactionHash,
      blockNumber: transaction.blockNumber || null,
      penalty: transaction.penalty || null,
      status: transaction.status || "pending",
      createdAt: now,
    };
    this.transactions.set(transaction.transactionHash, newTransaction);
    return newTransaction;
  }

  async getTransactionsByWallet(walletAddress: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((tx) => tx.walletAddress === walletAddress.toLowerCase())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getTransactionByHash(hash: string): Promise<Transaction | undefined> {
    return this.transactions.get(hash);
  }

  async updateTransactionStatus(hash: string, status: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(hash);
    if (!transaction) return undefined;
    
    const updated: Transaction = {
      ...transaction,
      status,
    };
    this.transactions.set(hash, updated);
    return updated;
  }

  async getTransactionsByType(walletAddress: string, type: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((tx) => 
        tx.walletAddress === walletAddress.toLowerCase() && 
        tx.transactionType === type
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Verification settings methods
  async getVerificationMode(): Promise<number> {
    return this.verificationMode;
  }

  async setVerificationMode(mode: number, masterWallet: string): Promise<boolean> {
    if (masterWallet.toLowerCase() !== this.masterWallet.toLowerCase()) {
      return false;
    }
    this.verificationMode = mode;
    return true;
  }

  async getMasterWallet(): Promise<string> {
    return this.masterWallet;
  }

  // OTP rate limiting
  async getOtpResendCount(email: string): Promise<number> {
    const normalizedEmail = email.toLowerCase();
    const entry = this.otpResendCounts.get(normalizedEmail);
    if (!entry) return 0;
    
    // Reset count if hour has passed
    if (new Date() > entry.resetAt) {
      this.otpResendCounts.delete(normalizedEmail);
      return 0;
    }
    return entry.count;
  }

  async incrementOtpResendCount(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase();
    const entry = this.otpResendCounts.get(normalizedEmail);
    
    if (!entry || new Date() > entry.resetAt) {
      this.otpResendCounts.set(normalizedEmail, {
        count: 1,
        resetAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      });
    } else {
      entry.count++;
    }
  }

  async resetOtpResendCount(email: string): Promise<void> {
    this.otpResendCounts.delete(email.toLowerCase());
  }

  // Analytics methods (stub implementation for MemStorage)
  async getUserAnalytics(): Promise<{
    totalUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    tokenHolders: number;
  }> {
    const allParticipants = Array.from(this.airdropParticipants.values());
    const verifiedUsers = allParticipants.filter(p => p.emailVerified).length;
    return {
      totalUsers: allParticipants.length,
      verifiedUsers,
      unverifiedUsers: allParticipants.length - verifiedUsers,
      tokenHolders: allParticipants.filter(p => p.airdropTokens > 0 || p.referralTokens > 0).length,
    };
  }

  async getTrafficAnalytics(): Promise<{
    totalPageViews: number;
    uniqueUsersLast24h: number;
  }> {
    return { totalPageViews: 0, uniqueUsersLast24h: 0 };
  }

  async getCountryAnalytics(days: number): Promise<{ country: string; count: number }[]> {
    return [];
  }

  async getAllParticipantsForExport(): Promise<AirdropParticipant[]> {
    return Array.from(this.airdropParticipants.values());
  }

  async trackPageView(data: { ipAddress: string; userAgent?: string; country?: string; path: string; walletAddress?: string }): Promise<void> {
    // No-op for MemStorage
  }

  // News ticker stub methods (MemStorage)
  async getActiveNewsTicker(): Promise<NewsTicker | undefined> {
    return undefined;
  }

  async getAllNewsTickers(): Promise<NewsTicker[]> {
    return [];
  }

  async createNewsTicker(ticker: InsertNewsTicker): Promise<NewsTicker> {
    const id = randomUUID();
    return { ...ticker, id, createdAt: new Date(), updatedAt: new Date(), isActive: ticker.isActive ?? true };
  }

  async updateNewsTicker(id: string, updates: Partial<NewsTicker>): Promise<NewsTicker | undefined> {
    return undefined;
  }

  async deleteNewsTicker(id: string): Promise<void> {
    // No-op for MemStorage
  }
}

// Database Storage - Uses PostgreSQL for persistent storage
import { db } from './db';
import { 
  transactions as transactionsTable,
  airdropParticipants as airdropParticipantsTable,
  otpVerifications as otpVerificationsTable,
  verificationSettings as verificationSettingsTable,
  pageViews as pageViewsTable,
  newsTicker as newsTickerTable,
  type VerificationSettings
} from '@shared/schema';
import { eq, and, desc, gte, sql, count } from 'drizzle-orm';

export class DbStorage extends MemStorage {
  // Override airdrop participant methods to use PostgreSQL database
  
  async getAirdropParticipant(walletAddress: string): Promise<AirdropParticipant | undefined> {
    console.log('🔍 Looking for participant:', walletAddress.toLowerCase());
    const results = await db.select()
      .from(airdropParticipantsTable)
      .where(eq(airdropParticipantsTable.walletAddress, walletAddress.toLowerCase()))
      .limit(1);
    
    console.log('📊 Found participant:', results[0] ? 'YES' : 'NO');
    return results[0];
  }

  async getAirdropParticipantByReferralCode(code: string): Promise<AirdropParticipant | undefined> {
    const results = await db.select()
      .from(airdropParticipantsTable)
      .where(eq(airdropParticipantsTable.referralCode, code))
      .limit(1);
    
    return results[0];
  }

  async getAirdropParticipantByEmail(email: string): Promise<AirdropParticipant | undefined> {
    const results = await db.select()
      .from(airdropParticipantsTable)
      .where(eq(airdropParticipantsTable.email, email.toLowerCase()))
      .limit(1);
    
    return results[0];
  }

  async createAirdropParticipant(participant: InsertAirdropParticipant): Promise<AirdropParticipant> {
    try {
      console.log('💾 Creating airdrop participant in database:', JSON.stringify(participant));
      const newParticipant = await db.insert(airdropParticipantsTable).values({
        ...participant,
        walletAddress: participant.walletAddress.toLowerCase(),
        email: participant.email?.toLowerCase(),
      }).returning();
      
      console.log('✅ Participant created successfully:', JSON.stringify(newParticipant[0]));
      
      // Verify the record was actually saved
      const verify = await db.select().from(airdropParticipantsTable).where(eq(airdropParticipantsTable.id, newParticipant[0].id));
      console.log('🔍 Verification query result:', verify.length > 0 ? 'FOUND' : 'NOT FOUND');
      
      return newParticipant[0];
    } catch (error) {
      console.error('❌ Error creating participant:', error);
      throw error;
    }
  }

  async updateAirdropParticipant(walletAddress: string, updates: Partial<AirdropParticipant>): Promise<AirdropParticipant | undefined> {
    const results = await db.update(airdropParticipantsTable)
      .set(updates)
      .where(eq(airdropParticipantsTable.walletAddress, walletAddress.toLowerCase()))
      .returning();
    
    return results[0];
  }

  async getReferralCount(referralCode: string): Promise<number> {
    const results = await db.select()
      .from(airdropParticipantsTable)
      .where(eq(airdropParticipantsTable.referredBy, referralCode));
    
    return results.length;
  }

  // Override OTP methods to use PostgreSQL database
  
  async createOtp(otp: InsertOtpVerification): Promise<OtpVerification> {
    const newOtp = await db.insert(otpVerificationsTable).values(otp).returning();
    
    return newOtp[0];
  }

  async getLatestOtp(email: string): Promise<OtpVerification | undefined> {
    const results = await db.select()
      .from(otpVerificationsTable)
      .where(eq(otpVerificationsTable.email, email))
      .orderBy(desc(otpVerificationsTable.createdAt))
      .limit(1);
    
    return results[0];
  }

  async markOtpVerified(id: string): Promise<void> {
    await db.update(otpVerificationsTable)
      .set({ verified: true })
      .where(eq(otpVerificationsTable.id, id));
  }
  
  // Override transaction methods to use PostgreSQL database
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const newTransaction = await db.insert(transactionsTable).values({
      walletAddress: transaction.walletAddress.toLowerCase(),
      transactionType: transaction.transactionType,
      amount: transaction.amount,
      tokenSymbol: transaction.tokenSymbol || 'MEMES',
      transactionHash: transaction.transactionHash,
      blockNumber: transaction.blockNumber,
      penalty: transaction.penalty || null,
      status: transaction.status || 'pending',
    }).returning();
    
    return newTransaction[0];
  }

  async getTransactionsByWallet(walletAddress: string): Promise<Transaction[]> {
    const results = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.walletAddress, walletAddress.toLowerCase()))
      .orderBy(desc(transactionsTable.createdAt));
    
    return results;
  }

  async getTransactionByHash(hash: string): Promise<Transaction | undefined> {
    const results = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.transactionHash, hash))
      .limit(1);
    
    return results[0];
  }

  async updateTransactionStatus(hash: string, status: string): Promise<Transaction | undefined> {
    const results = await db.update(transactionsTable)
      .set({ status })
      .where(eq(transactionsTable.transactionHash, hash))
      .returning();
    
    return results[0];
  }

  async getTransactionsByType(walletAddress: string, type: string): Promise<Transaction[]> {
    const results = await db.select()
      .from(transactionsTable)
      .where(and(
        eq(transactionsTable.walletAddress, walletAddress.toLowerCase()),
        eq(transactionsTable.transactionType, type)
      ))
      .orderBy(desc(transactionsTable.createdAt));
    
    return results;
  }

  // Override verification settings to use database
  async getVerificationMode(): Promise<number> {
    try {
      const results = await db.select()
        .from(verificationSettingsTable)
        .limit(1);
      
      if (results.length === 0) {
        // Create default settings
        await db.insert(verificationSettingsTable).values({
          mode: 1, // Default: Puzzle mode
          masterWallet: "0xb79f08d7b6903db05afca56aee75a2c7cdc78e56"
        });
        return 1;
      }
      return results[0].mode;
    } catch (error) {
      console.error('Error getting verification mode:', error);
      return 1; // Default to puzzle mode
    }
  }

  async setVerificationMode(mode: number, masterWallet: string): Promise<boolean> {
    try {
      const settings = await db.select()
        .from(verificationSettingsTable)
        .limit(1);
      
      const storedMasterWallet = settings.length > 0 
        ? settings[0].masterWallet 
        : "0xb79f08d7b6903db05afca56aee75a2c7cdc78e56";
      
      if (masterWallet.toLowerCase() !== storedMasterWallet.toLowerCase()) {
        return false;
      }
      
      if (settings.length === 0) {
        await db.insert(verificationSettingsTable).values({
          mode,
          masterWallet: storedMasterWallet
        });
      } else {
        await db.update(verificationSettingsTable)
          .set({ mode, updatedAt: new Date() })
          .where(eq(verificationSettingsTable.id, settings[0].id));
      }
      return true;
    } catch (error) {
      console.error('Error setting verification mode:', error);
      return false;
    }
  }

  async getMasterWallet(): Promise<string> {
    try {
      const results = await db.select()
        .from(verificationSettingsTable)
        .limit(1);
      
      return results.length > 0 
        ? results[0].masterWallet 
        : "0xb79f08d7b6903db05afca56aee75a2c7cdc78e56";
    } catch (error) {
      console.error('Error getting master wallet:', error);
      return "0xb79f08d7b6903db05afca56aee75a2c7cdc78e56";
    }
  }

  // Override analytics methods to use database
  async getUserAnalytics(): Promise<{
    totalUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    tokenHolders: number;
  }> {
    try {
      const allParticipants = await db.select().from(airdropParticipantsTable);
      const verifiedUsers = allParticipants.filter(p => p.emailVerified).length;
      const tokenHolders = allParticipants.filter(p => (p.airdropTokens || 0) > 0 || (p.referralTokens || 0) > 0).length;
      
      return {
        totalUsers: allParticipants.length,
        verifiedUsers,
        unverifiedUsers: allParticipants.length - verifiedUsers,
        tokenHolders,
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return { totalUsers: 0, verifiedUsers: 0, unverifiedUsers: 0, tokenHolders: 0 };
    }
  }

  async getTrafficAnalytics(): Promise<{
    totalPageViews: number;
    uniqueUsersLast24h: number;
  }> {
    try {
      const allPageViews = await db.select().from(pageViewsTable);
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const recentViews = allPageViews.filter(pv => pv.createdAt >= last24h);
      const uniqueIps = new Set(recentViews.map(pv => pv.ipAddress));
      
      return {
        totalPageViews: allPageViews.length,
        uniqueUsersLast24h: uniqueIps.size,
      };
    } catch (error) {
      console.error('Error getting traffic analytics:', error);
      return { totalPageViews: 0, uniqueUsersLast24h: 0 };
    }
  }

  async getCountryAnalytics(days: number): Promise<{ country: string; count: number }[]> {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const participants = await db.select()
        .from(airdropParticipantsTable)
        .where(gte(airdropParticipantsTable.createdAt, cutoffDate));
      
      const countryMap = new Map<string, number>();
      for (const p of participants) {
        const country = p.country || 'Unknown';
        countryMap.set(country, (countryMap.get(country) || 0) + 1);
      }
      
      return Array.from(countryMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error getting country analytics:', error);
      return [];
    }
  }

  async getAllParticipantsForExport(): Promise<AirdropParticipant[]> {
    try {
      return await db.select()
        .from(airdropParticipantsTable)
        .orderBy(desc(airdropParticipantsTable.createdAt));
    } catch (error) {
      console.error('Error getting participants for export:', error);
      return [];
    }
  }

  async trackPageView(data: { ipAddress: string; userAgent?: string; country?: string; path: string; walletAddress?: string }): Promise<void> {
    try {
      await db.insert(pageViewsTable).values({
        ipAddress: data.ipAddress,
        userAgent: data.userAgent || null,
        country: data.country || null,
        path: data.path,
        walletAddress: data.walletAddress || null,
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // News ticker methods
  async getActiveNewsTicker(): Promise<NewsTicker | undefined> {
    try {
      const results = await db.select()
        .from(newsTickerTable)
        .where(eq(newsTickerTable.isActive, true))
        .orderBy(desc(newsTickerTable.updatedAt))
        .limit(1);
      return results[0];
    } catch (error) {
      console.error('Error getting active news ticker:', error);
      return undefined;
    }
  }

  async getAllNewsTickers(): Promise<NewsTicker[]> {
    try {
      return await db.select()
        .from(newsTickerTable)
        .orderBy(desc(newsTickerTable.updatedAt));
    } catch (error) {
      console.error('Error getting all news tickers:', error);
      return [];
    }
  }

  async createNewsTicker(ticker: InsertNewsTicker): Promise<NewsTicker> {
    const results = await db.insert(newsTickerTable).values(ticker).returning();
    return results[0];
  }

  async updateNewsTicker(id: string, updates: Partial<NewsTicker>): Promise<NewsTicker | undefined> {
    try {
      const results = await db.update(newsTickerTable)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(newsTickerTable.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating news ticker:', error);
      return undefined;
    }
  }

  async deleteNewsTicker(id: string): Promise<void> {
    try {
      await db.delete(newsTickerTable).where(eq(newsTickerTable.id, id));
    } catch (error) {
      console.error('Error deleting news ticker:', error);
    }
  }
}

export const storage = new DbStorage();
