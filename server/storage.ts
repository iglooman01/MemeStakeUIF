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
  type InsertTransaction
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private airdropParticipants: Map<string, AirdropParticipant>;
  private otpVerifications: Map<string, OtpVerification>;
  private adminUsers: Map<string, AdminUser>;
  private newsUpdates: Map<string, NewsUpdate>;
  private emailSubscriptions: Map<string, EmailSubscription>;
  private transactions: Map<string, Transaction>;

  constructor() {
    this.users = new Map();
    this.airdropParticipants = new Map();
    this.otpVerifications = new Map();
    this.adminUsers = new Map();
    this.newsUpdates = new Map();
    this.emailSubscriptions = new Map();
    this.transactions = new Map();
    
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
}

// Database Storage - Uses PostgreSQL for persistent storage
import { db } from './db';
import { transactions as transactionsTable } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export class DbStorage extends MemStorage {
  // Override transaction methods to use PostgreSQL database
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const newTransaction = await db.insert(transactionsTable).values({
      walletAddress: transaction.walletAddress.toLowerCase(),
      transactionType: transaction.transactionType,
      amount: transaction.amount,
      tokenSymbol: transaction.tokenSymbol || 'MEMES',
      transactionHash: transaction.transactionHash,
      blockNumber: transaction.blockNumber,
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
}

export const storage = new DbStorage();
