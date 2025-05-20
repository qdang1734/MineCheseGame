import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp, foreignKey, varchar, json, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Forward declaration for circular references
const UsersTable = () => users;

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  rank: text("rank"),
  avatar: text("avatar"),
  balance: doublePrecision("balance").notNull().default(0),
  totalReward: doublePrecision("total_reward").notNull().default(0),
  lastRewardAt: timestamp("last_reward_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  // Telegram integration
  telegramId: bigint("telegram_id", { mode: 'number' }),
  authToken: text("auth_token"),
  // Wallet integration
  walletAddress: text("wallet_address"),
  // Login streak tracking
  lastLoginAt: timestamp("last_login_at").defaultNow(),
  loginStreak: integer("login_streak").notNull().default(0),
  totalLogins: integer("total_logins").notNull().default(0),
  // Referral system
  referralCode: text("referral_code").unique(),
  referredById: integer("referred_by_id").references(() => users.id),
  totalReferrals: integer("total_referrals").notNull().default(0),
});

// Defining user relations - we'll add referral relations after the referralRewards table is defined
export const usersRelations = relations(users, ({ many }) => ({
  eggs: many(eggs),
  collections: many(userCollections),
  tasks: many(userTasks),
}));

// Egg types table (Mini, Starter, Pro, Genesis)
export const eggTypes = pgTable("egg_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
  minEarnPerDay: doublePrecision("min_earn_per_day").notNull(),
  maxEarnPerDay: doublePrecision("max_earn_per_day").notNull(),
  description: text("description"),
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eggTypesRelations = relations(eggTypes, ({ many }) => ({
  possibleKitties: many(kitties),
}));

// Kitties table (possible outcomes from eggs)
export const kitties = pgTable("kitties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  rarity: text("rarity").notNull(), // Common, Rare, Epic, Legendary, Mythic
  earnPerDay: doublePrecision("earn_per_day").notNull(),
  dropRate: doublePrecision("drop_rate").notNull(), // Percentage (e.g., 40.0 for 40%)
  eggTypeId: integer("egg_type_id").references(() => eggTypes.id).notNull(),
  color: text("color"),
  spotColor: text("spot_color"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const kittiesRelations = relations(kitties, ({ one }) => ({
  eggType: one(eggTypes, {
    fields: [kitties.eggTypeId],
    references: [eggTypes.id],
  }),
}));

// User's eggs (the actual eggs owned by users)
export const eggs = pgTable("eggs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  eggTypeId: integer("egg_type_id").references(() => eggTypes.id).notNull(),
  isOpened: boolean("is_opened").default(false),
  kittyId: integer("kitty_id").references(() => kitties.id),
  purchasedAt: timestamp("purchased_at").defaultNow(),
  openedAt: timestamp("opened_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eggsRelations = relations(eggs, ({ one }) => ({
  user: one(users, {
    fields: [eggs.userId],
    references: [users.id],
  }),
  eggType: one(eggTypes, {
    fields: [eggs.eggTypeId],
    references: [eggTypes.id],
  }),
  kitty: one(kitties, {
    fields: [eggs.kittyId],
    references: [kitties.id],
  }),
}));

// Collections table
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  rewardAmount: doublePrecision("reward_amount").notNull(),
  rewardCurrency: text("reward_currency").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Collections junction table
export const userCollections = pgTable("user_collections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  collectionId: integer("collection_id").notNull().references(() => collections.id),
  count: integer("count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userCollectionsRelations = relations(userCollections, ({ one }) => ({
  user: one(users, {
    fields: [userCollections.userId],
    references: [users.id],
  }),
  collection: one(collections, {
    fields: [userCollections.collectionId],
    references: [collections.id],
  }),
}));

// User login history table - track login streak
export const loginHistory = pgTable("login_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  loginDate: timestamp("login_date").notNull().defaultNow(),
  dayNumber: integer("day_number").notNull(), // Which day in the streak (1-7)
  streakComplete: boolean("streak_complete").notNull().default(false),
  rewardAmount: doublePrecision("reward_amount").notNull().default(0),
  claimed: boolean("claimed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loginHistoryRelations = relations(loginHistory, ({ one }) => ({
  user: one(users, {
    fields: [loginHistory.userId],
    references: [users.id],
  }),
}));

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  platform: text("platform").notNull(), // twitter, telegram, etc.
  reward: integer("reward").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Tasks junction table
export const userTasks = pgTable("user_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userTasksRelations = relations(userTasks, ({ one }) => ({
  user: one(users, {
    fields: [userTasks.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [userTasks.taskId],
    references: [tasks.id],
  }),
}));

// Referral rewards table
export const referralRewards = pgTable("referral_rewards", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => users.id),
  referredId: integer("referred_id").notNull().references(() => users.id),
  eggTypeId: integer("egg_type_id").references(() => eggTypes.id),
  eggPrice: doublePrecision("egg_price").notNull(),
  rewardAmount: doublePrecision("reward_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const referralRewardsRelations = relations(referralRewards, ({ one }) => ({
  referrer: one(users, {
    fields: [referralRewards.referrerId],
    references: [users.id],
  }),
  referred: one(users, {
    fields: [referralRewards.referredId],
    references: [users.id],
  }),
  eggType: one(eggTypes, {
    fields: [referralRewards.eggTypeId],
    references: [eggTypes.id],
  }),
}));

// Type definitions and schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  rank: true,
  avatar: true,
  telegramId: true,
  authToken: true,
  walletAddress: true,
});

export const insertEggTypeSchema = createInsertSchema(eggTypes).pick({
  name: true,
  price: true,
  minEarnPerDay: true,
  maxEarnPerDay: true,
  description: true,
  color: true,
});

export const insertKittySchema = createInsertSchema(kitties).pick({
  name: true,
  rarity: true,
  earnPerDay: true,
  dropRate: true,
  eggTypeId: true,
  color: true,
  spotColor: true,
  imageUrl: true,
});

export const insertEggSchema = createInsertSchema(eggs).pick({
  userId: true,
  eggTypeId: true,
  isOpened: true,
  kittyId: true,
});

export const insertCollectionSchema = createInsertSchema(collections).pick({
  name: true,
  icon: true,
  color: true,
  rewardAmount: true,
  rewardCurrency: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  platform: true,
  reward: true,
});

export const insertUserCollectionSchema = createInsertSchema(userCollections).pick({
  userId: true,
  collectionId: true,
  count: true,
});

export const insertUserTaskSchema = createInsertSchema(userTasks).pick({
  userId: true,
  taskId: true,
  completed: true,
});

export const insertLoginHistorySchema = createInsertSchema(loginHistory).pick({
  userId: true,
  loginDate: true,
  dayNumber: true,
  streakComplete: true,
  rewardAmount: true,
  claimed: true,
});

export const insertReferralRewardSchema = createInsertSchema(referralRewards).pick({
  referrerId: true,
  referredId: true,
  eggTypeId: true,
  eggPrice: true,
  rewardAmount: true,
});

// Exported types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLoginHistory = z.infer<typeof insertLoginHistorySchema>;
export type LoginHistory = typeof loginHistory.$inferSelect;

export type InsertEggType = z.infer<typeof insertEggTypeSchema>;
export type EggType = typeof eggTypes.$inferSelect;

export type InsertKitty = z.infer<typeof insertKittySchema>;
export type Kitty = typeof kitties.$inferSelect;

export type InsertEgg = z.infer<typeof insertEggSchema>;
export type Egg = typeof eggs.$inferSelect;

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertUserCollection = z.infer<typeof insertUserCollectionSchema>;
export type UserCollection = typeof userCollections.$inferSelect;

export type InsertUserTask = z.infer<typeof insertUserTaskSchema>;
export type UserTask = typeof userTasks.$inferSelect;

// Bảng giao dịch rút tiền
export const withdrawalTransactions = pgTable("withdrawal_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  toAddress: text("to_address").notNull(),
  txHash: text("tx_hash"),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const withdrawalTransactionsRelations = relations(withdrawalTransactions, ({ one }) => ({
  user: one(users, {
    fields: [withdrawalTransactions.userId],
    references: [users.id],
  }),
}));

export const insertWithdrawalTransactionSchema = createInsertSchema(withdrawalTransactions).pick({
  userId: true,
  amount: true,
  toAddress: true,
  txHash: true,
  status: true,
  message: true,
});

export type InsertReferralReward = z.infer<typeof insertReferralRewardSchema>;
export type ReferralReward = typeof referralRewards.$inferSelect;

export type InsertWithdrawalTransaction = z.infer<typeof insertWithdrawalTransactionSchema>;
export type WithdrawalTransaction = typeof withdrawalTransactions.$inferSelect;
