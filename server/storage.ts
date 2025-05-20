import { 
  users, type User, type InsertUser,
  eggTypes, type EggType, type InsertEggType,
  kitties, type Kitty, type InsertKitty,
  eggs, type Egg, type InsertEgg,
  collections, type Collection, type InsertCollection,
  tasks, type Task, type InsertTask,
  userCollections, type UserCollection, type InsertUserCollection,
  userTasks, type UserTask, type InsertUserTask,
  loginHistory, type LoginHistory, type InsertLoginHistory,
  referralRewards, type ReferralReward, type InsertReferralReward,
  withdrawalTransactions, type WithdrawalTransaction, type InsertWithdrawalTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByTelegramId(telegramId: number): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  generateReferralCode(userId: number): Promise<string>;
  
  // Referral operations
  addReferral(referrerId: number, referredId: number): Promise<void>;
  getReferredUsers(referrerId: number): Promise<User[]>;
  getReferralRewards(referrerId: number): Promise<ReferralReward[]>;
  recordReferralReward(referrerId: number, referredId: number, eggTypeId: number, eggPrice: number): Promise<ReferralReward>;

  // Egg Type operations
  getEggType(id: number): Promise<EggType | undefined>;
  getAllEggTypes(): Promise<EggType[]>;
  createEggType(eggType: InsertEggType): Promise<EggType>;

  // Kitty operations
  getKitty(id: number): Promise<Kitty | undefined>;
  getKittiesByEggType(eggTypeId: number): Promise<Kitty[]>;
  createKitty(kitty: InsertKitty): Promise<Kitty>;

  // Egg operations
  getEgg(id: number): Promise<Egg | undefined>;
  getUserEggs(userId: number): Promise<Egg[]>;
  createEgg(egg: InsertEgg): Promise<Egg>;
  openEgg(eggId: number, kittyId: number): Promise<Egg>;

  // Collection operations
  getCollection(id: number): Promise<Collection | undefined>;
  getAllCollections(): Promise<Collection[]>;
  getUserCollections(userId: number): Promise<UserCollection[]>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  addUserCollection(userCollection: InsertUserCollection): Promise<UserCollection>;

  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  getUserTasks(userId: number): Promise<UserTask[]>;
  createTask(task: InsertTask): Promise<Task>;
  addUserTask(userTask: InsertUserTask): Promise<UserTask>;
  completeUserTask(userId: number, taskId: number): Promise<UserTask>;
  
  // Login history operations
  recordLogin(userId: number): Promise<{ streak: number, isNewDay: boolean }>;
  getUserLoginHistory(userId: number): Promise<LoginHistory[]>;
  getUserCurrentStreak(userId: number): Promise<number>;
  getDailyRewardForStreak(streak: number): number;
  claimDailyReward(userId: number, loginHistoryId: number): Promise<{ success: boolean, amount: number }>;

  // Withdrawal operations
  createWithdrawalTransaction(transaction: InsertWithdrawalTransaction): Promise<WithdrawalTransaction>;
  getWithdrawalTransaction(id: number): Promise<WithdrawalTransaction | undefined>;
  getUserWithdrawalTransactions(userId: number): Promise<WithdrawalTransaction[]>;
  getPendingWithdrawalTransactions(): Promise<WithdrawalTransaction[]>;
  updateWithdrawalTransactionStatus(id: number, status: string, txHash?: string, message?: string): Promise<WithdrawalTransaction>;
  saveWalletAddress(userId: number, walletAddress: string): Promise<User>;
}

// Database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  // User operations

  // Phương thức lưu địa chỉ ví của người dùng
  async saveWalletAddress(userId: number, walletAddress: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ walletAddress })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }
  
  // Phương thức tạo giao dịch rút tiền mới
  async createWithdrawalTransaction(transaction: InsertWithdrawalTransaction): Promise<WithdrawalTransaction> {
    const [newTransaction] = await db
      .insert(withdrawalTransactions)
      .values(transaction)
      .returning();
    
    return newTransaction;
  }
  
  // Phương thức lấy thông tin giao dịch rút tiền theo ID
  async getWithdrawalTransaction(id: number): Promise<WithdrawalTransaction | undefined> {
    const [transaction] = await db
      .select()
      .from(withdrawalTransactions)
      .where(eq(withdrawalTransactions.id, id));
    
    return transaction || undefined;
  }
  
  // Phương thức lấy danh sách giao dịch rút tiền của người dùng
  async getUserWithdrawalTransactions(userId: number): Promise<WithdrawalTransaction[]> {
    const transactions = await db
      .select()
      .from(withdrawalTransactions)
      .where(eq(withdrawalTransactions.userId, userId))
      .orderBy(withdrawalTransactions.createdAt);
    
    return transactions;
  }
  
  // Phương thức lấy danh sách giao dịch rút tiền đang chờ xử lý
  async getPendingWithdrawalTransactions(): Promise<WithdrawalTransaction[]> {
    const transactions = await db
      .select()
      .from(withdrawalTransactions)
      .where(eq(withdrawalTransactions.status, "pending"))
      .orderBy(withdrawalTransactions.createdAt);
    
    return transactions;
  }
  
  // Phương thức cập nhật trạng thái giao dịch rút tiền
  async updateWithdrawalTransactionStatus(
    id: number, 
    status: string, 
    txHash?: string, 
    message?: string
  ): Promise<WithdrawalTransaction> {
    const updates: Record<string, any> = { 
      status, 
      processedAt: new Date() 
    };
    
    if (txHash) {
      updates.txHash = txHash;
    }
    
    if (message) {
      updates.message = message;
    }
    
    const [updatedTransaction] = await db
      .update(withdrawalTransactions)
      .set(updates)
      .where(eq(withdrawalTransactions.id, id))
      .returning();
    
    return updatedTransaction;
  }
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByTelegramId(telegramId: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Egg Type operations
  async getEggType(id: number): Promise<EggType | undefined> {
    const [eggType] = await db.select().from(eggTypes).where(eq(eggTypes.id, id));
    return eggType || undefined;
  }

  async getAllEggTypes(): Promise<EggType[]> {
    return db.select().from(eggTypes);
  }

  async createEggType(eggType: InsertEggType): Promise<EggType> {
    const [newEggType] = await db
      .insert(eggTypes)
      .values(eggType)
      .returning();
    return newEggType;
  }

  // Kitty operations
  async getKitty(id: number): Promise<Kitty | undefined> {
    const [kitty] = await db.select().from(kitties).where(eq(kitties.id, id));
    return kitty || undefined;
  }

  async getKittiesByEggType(eggTypeId: number): Promise<Kitty[]> {
    return db.select().from(kitties).where(eq(kitties.eggTypeId, eggTypeId));
  }

  async createKitty(kitty: InsertKitty): Promise<Kitty> {
    const [newKitty] = await db
      .insert(kitties)
      .values(kitty)
      .returning();
    return newKitty;
  }

  // Egg operations
  async getEgg(id: number): Promise<Egg | undefined> {
    const [egg] = await db.select().from(eggs).where(eq(eggs.id, id));
    return egg || undefined;
  }

  async getUserEggs(userId: number): Promise<Egg[]> {
    return db.select().from(eggs).where(eq(eggs.userId, userId));
  }

  async createEgg(egg: InsertEgg): Promise<Egg> {
    const [newEgg] = await db
      .insert(eggs)
      .values(egg)
      .returning();
    return newEgg;
  }

  async openEgg(eggId: number, kittyId: number): Promise<Egg> {
    const now = new Date();
    const [updatedEgg] = await db
      .update(eggs)
      .set({ 
        isOpened: true, 
        kittyId: kittyId,
        openedAt: now 
      })
      .where(eq(eggs.id, eggId))
      .returning();
    return updatedEgg;
  }

  // Collection operations
  async getCollection(id: number): Promise<Collection | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.id, id));
    return collection || undefined;
  }

  async getAllCollections(): Promise<Collection[]> {
    return db.select().from(collections);
  }

  async getCollectionByKittyId(kittyId: number): Promise<Collection | undefined> {
    const [collection] = await db
      .select()
      .from(collections)
      .where(eq(collections.name, (await this.getKitty(kittyId))?.name || ''));
    return collection;
  }

  async getUserCollections(userId: number): Promise<UserCollection[]> {
    return db.select().from(userCollections).where(eq(userCollections.userId, userId));
  }

  async createCollection(collection: InsertCollection): Promise<Collection> {
    const [newCollection] = await db
      .insert(collections)
      .values(collection)
      .returning();
    return newCollection;
  }

  async addUserCollection(userCollection: InsertUserCollection): Promise<UserCollection> {
    const [newUserCollection] = await db
      .insert(userCollections)
      .values(userCollection)
      .returning();
    return newUserCollection;
  }

  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getAllTasks(): Promise<Task[]> {
    return db.select().from(tasks);
  }

  async getUserTasks(userId: number): Promise<UserTask[]> {
    return db.select().from(userTasks).where(eq(userTasks.userId, userId));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values(task)
      .returning();
    return newTask;
  }

  async addUserTask(userTask: InsertUserTask): Promise<UserTask> {
    const [newUserTask] = await db
      .insert(userTasks)
      .values(userTask)
      .returning();
    return newUserTask;
  }

  async completeUserTask(userId: number, taskId: number): Promise<UserTask> {
    const now = new Date();
    const [userTask] = await db
      .update(userTasks)
      .set({ completed: true, completedAt: now })
      .where(and(eq(userTasks.userId, userId), eq(userTasks.taskId, taskId)))
      .returning();
    return userTask;
  }

  // Login history operations
  async recordLogin(userId: number): Promise<{ streak: number, isNewDay: boolean }> {
    // Get user
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date();
    const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
    let loginStreak = user.loginStreak || 0;
    let isNewDay = false;

    // If there's no last login or it was on a different day
    if (!lastLogin || !this.isSameDay(lastLogin, now)) {
      isNewDay = true;
      
      // Check if this is a consecutive day login
      if (lastLogin && this.isConsecutiveDay(lastLogin, now)) {
        // Increase streak (max 7 days)
        loginStreak = Math.min(loginStreak + 1, 7);
      } else if (lastLogin && !this.isConsecutiveDay(lastLogin, now)) {
        // Streak broken
        loginStreak = 1;
      } else {
        // First login ever
        loginStreak = 1;
      }

      // Update user login streak in users table
      await db
        .update(users)
        .set({ 
          lastLoginAt: now,
          loginStreak,
          totalLogins: (user.totalLogins || 0) + 1
        })
        .where(eq(users.id, userId));

      // Record this login in login history
      const rewardAmount = this.getDailyRewardForStreak(loginStreak);
      const streakComplete = loginStreak >= 7;
      
      await db.insert(loginHistory).values({
        userId,
        loginDate: now,
        dayNumber: loginStreak,
        streakComplete,
        rewardAmount,
        claimed: false
      });
    }

    return { streak: loginStreak, isNewDay };
  }

  async getUserLoginHistory(userId: number): Promise<LoginHistory[]> {
    // Get user's login history sorted by date (newest first)
    return db
      .select()
      .from(loginHistory)
      .where(eq(loginHistory.userId, userId))
      .orderBy(sql`${loginHistory.loginDate} DESC`);
  }

  async getUserCurrentStreak(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    return user?.loginStreak || 0;
  }

  getDailyRewardForStreak(streak: number): number {
    // Daily rewards increase with each day of the streak
    // These values can be adjusted as needed
    const rewards = {
      1: 0.5,   // Day 1: 0.5 TON
      2: 0.8,   // Day 2: 0.8 TON
      3: 1.2,   // Day 3: 1.2 TON
      4: 1.5,   // Day 4: 1.5 TON
      5: 2.0,   // Day 5: 2.0 TON
      6: 2.5,   // Day 6: 2.5 TON
      7: 5.0    // Day 7: 5.0 TON (big reward!)
    };
    
    return rewards[streak as keyof typeof rewards] || 0.5;
  }

  async claimDailyReward(userId: number, loginHistoryId: number): Promise<{ success: boolean, amount: number }> {
    // Get the login history record
    const [loginRecord] = await db
      .select()
      .from(loginHistory)
      .where(and(
        eq(loginHistory.id, loginHistoryId),
        eq(loginHistory.userId, userId)
      ));

    if (!loginRecord || loginRecord.claimed) {
      return { success: false, amount: 0 };
    }

    // Update the login history as claimed
    await db
      .update(loginHistory)
      .set({ claimed: true })
      .where(eq(loginHistory.id, loginHistoryId));

    // Update user balance
    const user = await this.getUser(userId);
    if (!user) {
      return { success: false, amount: 0 };
    }

    const newBalance = (user.balance || 0) + loginRecord.rewardAmount;
    
    await db
      .update(users)
      .set({ 
        balance: newBalance,
        totalReward: (user.totalReward || 0) + loginRecord.rewardAmount
      })
      .where(eq(users.id, userId));

    return { success: true, amount: loginRecord.rewardAmount };
  }

  // Helper methods for date comparisons
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  private isConsecutiveDay(previous: Date, current: Date): boolean {
    // Create copies to avoid modifying the original dates
    const prevDate = new Date(previous);
    const currDate = new Date(current);
    
    // Reset time to midnight for both dates
    prevDate.setHours(0, 0, 0, 0);
    currDate.setHours(0, 0, 0, 0);
    
    // Get the time difference in milliseconds
    const diffTime = currDate.getTime() - prevDate.getTime();
    
    // Convert to days
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    // Check if it's the next day (between 1 and 2 days)
    return diffDays >= 1 && diffDays < 2;
  }

  // Referral system implementation
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.referralCode, referralCode));
    return user || undefined;
  }

  async generateReferralCode(userId: number): Promise<string> {
    // Generate a unique referral code if user doesn't have one yet
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    if (user.referralCode) {
      return user.referralCode;
    }
    
    // Generate a random code based on username and random string
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const referralCode = `${user.username.substring(0, 4).toUpperCase()}-${randomStr}`;
    
    // Save the referral code
    await db.update(users)
      .set({ referralCode })
      .where(eq(users.id, userId))
      .returning();
      
    return referralCode;
  }
  
  async addReferral(referrerId: number, referredId: number): Promise<void> {
    // Update the referred user's referredById
    await db.update(users)
      .set({ referredById: referrerId })
      .where(eq(users.id, referredId));
      
    // Increment the referrer's total referrals count
    const referrer = await this.getUser(referrerId);
    if (referrer) {
      await db.update(users)
        .set({ totalReferrals: (referrer.totalReferrals || 0) + 1 })
        .where(eq(users.id, referrerId));
    }
  }
  
  async getReferredUsers(referrerId: number): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(eq(users.referredById, referrerId));
  }
  
  async getReferralRewards(referrerId: number): Promise<ReferralReward[]> {
    return db
      .select()
      .from(referralRewards)
      .where(eq(referralRewards.referrerId, referrerId))
      .orderBy(sql`${referralRewards.createdAt} DESC`);
  }
  
  async recordReferralReward(referrerId: number, referredId: number, eggTypeId: number, eggPrice: number): Promise<ReferralReward> {
    // Calculate reward amount (10% of the egg price)
    const rewardAmount = eggPrice * 0.1;
    
    // Add the reward to referral_rewards table
    const [insertedReward] = await db.insert(referralRewards)
      .values({
        referrerId,
        referredId,
        eggTypeId,
        eggPrice,
        rewardAmount
      })
      .returning();
      
    // Update the referrer's balance
    const referrer = await this.getUser(referrerId);
    if (referrer) {
      const newBalance = (referrer.balance || 0) + rewardAmount;
      await db.update(users)
        .set({ balance: newBalance })
        .where(eq(users.id, referrerId));
    }
    
    return insertedReward;
  }
}

// Export an instance of the storage implementation
export const storage = new DatabaseStorage();
