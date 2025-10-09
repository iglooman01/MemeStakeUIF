import { 
  type User, 
  type InsertUser, 
  type AirdropParticipant, 
  type InsertAirdropParticipant,
  type OtpVerification,
  type InsertOtpVerification
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
  createAirdropParticipant(participant: InsertAirdropParticipant): Promise<AirdropParticipant>;
  updateAirdropParticipant(walletAddress: string, updates: Partial<AirdropParticipant>): Promise<AirdropParticipant | undefined>;
  getReferralCount(referralCode: string): Promise<number>;
  
  // OTP methods
  createOtp(otp: InsertOtpVerification): Promise<OtpVerification>;
  getLatestOtp(email: string): Promise<OtpVerification | undefined>;
  markOtpVerified(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private airdropParticipants: Map<string, AirdropParticipant>;
  private otpVerifications: Map<string, OtpVerification>;

  constructor() {
    this.users = new Map();
    this.airdropParticipants = new Map();
    this.otpVerifications = new Map();
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
}

export const storage = new MemStorage();
