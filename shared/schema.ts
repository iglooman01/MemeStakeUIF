import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Airdrop participants table
export const airdropParticipants = pgTable("airdrop_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull().unique(),
  email: text("email"),
  emailVerified: boolean("email_verified").notNull().default(false),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"), // referral code of the person who referred them
  telegramGroupCompleted: boolean("telegram_group_completed").notNull().default(false),
  telegramChannelCompleted: boolean("telegram_channel_completed").notNull().default(false),
  twitterCompleted: boolean("twitter_completed").notNull().default(false),
  youtubeCompleted: boolean("youtube_completed").notNull().default(false),
  airdropTokens: integer("airdrop_tokens").notNull().default(0),
  referralTokens: integer("referral_tokens").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAirdropParticipantSchema = createInsertSchema(airdropParticipants).omit({
  id: true,
  createdAt: true,
});

export type InsertAirdropParticipant = z.infer<typeof insertAirdropParticipantSchema>;
export type AirdropParticipant = typeof airdropParticipants.$inferSelect;

// OTP verification table
export const otpVerifications = pgTable("otp_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOtpVerificationSchema = createInsertSchema(otpVerifications).omit({
  id: true,
  createdAt: true,
});

export type InsertOtpVerification = z.infer<typeof insertOtpVerificationSchema>;
export type OtpVerification = typeof otpVerifications.$inferSelect;
