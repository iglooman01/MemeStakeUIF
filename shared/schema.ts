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

// Admin users table
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

// News updates table
export const newsUpdates = pgTable("news_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertNewsUpdateSchema = createInsertSchema(newsUpdates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNewsUpdate = z.infer<typeof insertNewsUpdateSchema>;
export type NewsUpdate = typeof newsUpdates.$inferSelect;

// Email subscriptions table
export const emailSubscriptions = pgTable("email_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  walletAddress: text("wallet_address"),
  subscribed: boolean("subscribed").notNull().default(true),
  subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

export const insertEmailSubscriptionSchema = createInsertSchema(emailSubscriptions).omit({
  id: true,
  subscribedAt: true,
  unsubscribedAt: true,
});

export type InsertEmailSubscription = z.infer<typeof insertEmailSubscriptionSchema>;
export type EmailSubscription = typeof emailSubscriptions.$inferSelect;
