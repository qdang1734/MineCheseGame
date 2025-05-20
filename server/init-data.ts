import { db } from "./db";
import { users, eggTypes, kitties, eggs, collections, loginHistory } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Khởi tạo dữ liệu cho ứng dụng
export async function initializeSampleData() {
  try {
    console.log("Initializing sample data for application...");
    
    // Tạo người dùng mặc định
    const defaultUser = {
      username: "player1",
      password: "password123",
      rank: "Beginner",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=player1",
      balance: 10,
      totalReward: 0
    };
    
    // Kiểm tra xem người dùng đã tồn tại chưa
    const existingUsers = await db.select().from(users).where(eq(users.username, defaultUser.username));
    let userId: number;
    
    if (existingUsers.length === 0) {
      const insertedUsers = await db.insert(users).values(defaultUser).returning();
      userId = insertedUsers[0].id;
      console.log("Created default user with ID:", userId);
    } else {
      userId = existingUsers[0].id;
      console.log("Default user already exists with ID:", userId);
    }
    
    // Tạo các loại trứng (egg types)
    const eggTypesData = [
      {
        name: "Mini Egg",
        price: 0.5,
        minEarnPerDay: 0.01,
        maxEarnPerDay: 0.05,
        description: "A small egg with common kitties",
        color: "#A5D6A7"
      },
      {
        name: "Starter Egg",
        price: 1.0,
        minEarnPerDay: 0.02,
        maxEarnPerDay: 0.1,
        description: "A medium egg with uncommon kitties",
        color: "#90CAF9"
      },
      {
        name: "Pro Egg",
        price: 2.5,
        minEarnPerDay: 0.05,
        maxEarnPerDay: 0.2,
        description: "A premium egg with rare kitties",
        color: "#CE93D8"
      },
      {
        name: "Genesis Egg",
        price: 5.0,
        minEarnPerDay: 0.1,
        maxEarnPerDay: 0.5,
        description: "A legendary egg with mythic kitties",
        color: "#FFD54F"
      }
    ];
    
    // Lưu trữ ID loại trứng theo tên
    const eggTypeIds: Record<string, number> = {};
    
    // Chèn loại trứng vào database
    for (const eggType of eggTypesData) {
      const existing = await db.select().from(eggTypes).where(eq(eggTypes.name, eggType.name));
      
      if (existing.length === 0) {
        const inserted = await db.insert(eggTypes).values(eggType).returning();
        eggTypeIds[eggType.name] = inserted[0].id;
        console.log(`Created egg type: ${eggType.name} with ID ${inserted[0].id}`);
      } else {
        eggTypeIds[eggType.name] = existing[0].id;
        console.log(`Egg type ${eggType.name} already exists with ID ${existing[0].id}`);
      }
    }
    
    // Tạo mèo (kitties) cho từng loại trứng
    const kittiesData = [
      // Mini Egg kitties
      {
        name: "Fluffy",
        rarity: "Common",
        earnPerDay: 0.01,
        dropRate: 50,
        eggTypeId: eggTypeIds["Mini Egg"],
        color: "#FFB74D",
        spotColor: "#8D6E63",
        imageUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Fluffy"
      },
      {
        name: "Whiskers",
        rarity: "Common",
        earnPerDay: 0.015,
        dropRate: 30,
        eggTypeId: eggTypeIds["Mini Egg"],
        color: "#BDBDBD",
        spotColor: "#757575",
        imageUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Whiskers"
      },
      // Starter Egg kitties
      {
        name: "Patches",
        rarity: "Common",
        earnPerDay: 0.02,
        dropRate: 40,
        eggTypeId: eggTypeIds["Starter Egg"],
        color: "#FFF9C4",
        spotColor: "#FFB74D",
        imageUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Patches"
      },
      {
        name: "Mittens",
        rarity: "Uncommon",
        earnPerDay: 0.035,
        dropRate: 30,
        eggTypeId: eggTypeIds["Starter Egg"],
        color: "#212121",
        spotColor: "#F5F5F5",
        imageUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Mittens"
      },
      // Pro Egg kitties
      {
        name: "Spots",
        rarity: "Uncommon",
        earnPerDay: 0.06,
        dropRate: 35,
        eggTypeId: eggTypeIds["Pro Egg"],
        color: "#FFECB3",
        spotColor: "#8D6E63",
        imageUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Spots"
      },
      {
        name: "Stripes",
        rarity: "Rare",
        earnPerDay: 0.09,
        dropRate: 30,
        eggTypeId: eggTypeIds["Pro Egg"],
        color: "#CE93D8",
        spotColor: "#7B1FA2",
        imageUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Stripes"
      },
      // Genesis Egg kitties
      {
        name: "Royal",
        rarity: "Rare",
        earnPerDay: 0.12,
        dropRate: 30,
        eggTypeId: eggTypeIds["Genesis Egg"],
        color: "#9575CD",
        spotColor: "#5E35B1",
        imageUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Royal"
      },
      {
        name: "Crystal",
        rarity: "Epic",
        earnPerDay: 0.18,
        dropRate: 30,
        eggTypeId: eggTypeIds["Genesis Egg"],
        color: "#80DEEA",
        spotColor: "#00ACC1",
        imageUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Crystal"
      }
    ];
    
    // Chèn mèo vào database
    for (const kitty of kittiesData) {
      const existing = await db.select().from(kitties).where(
        and(
          eq(kitties.name, kitty.name),
          eq(kitties.eggTypeId, kitty.eggTypeId)
        )
      );
      
      if (existing.length === 0) {
        const inserted = await db.insert(kitties).values(kitty).returning();
        console.log(`Created kitty: ${kitty.name} with ID ${inserted[0].id}`);
      } else {
        console.log(`Kitty ${kitty.name} already exists with ID ${existing[0].id}`);
      }
    }
    
    // Thêm trứng cho người chơi
    const playerEggs = [
      { userId, eggTypeId: eggTypeIds["Mini Egg"], isOpened: false },
      { userId, eggTypeId: eggTypeIds["Starter Egg"], isOpened: false },
      { userId, eggTypeId: eggTypeIds["Pro Egg"], isOpened: false },
      { userId, eggTypeId: eggTypeIds["Genesis Egg"], isOpened: false }
    ];
    
    for (const egg of playerEggs) {
      await db.insert(eggs).values(egg);
      console.log(`Added egg type ${egg.eggTypeId} to user ${userId}`);
    }
    
    // Tạo collections cho tất cả mèo
    const allKitties = await db.select().from(kitties);
    for (const kitty of allKitties) {
      const existing = await db.select().from(collections).where(eq(collections.name, kitty.name));
      
      if (existing.length === 0) {
        await db.insert(collections).values({
          name: kitty.name,
          icon: "🐱",
          color: kitty.color,
          rewardAmount: kitty.earnPerDay,
          rewardCurrency: "TON"
        });
        console.log(`Created collection for kitty: ${kitty.name}`);
      }
    }
    
    // Thêm lịch sử đăng nhập cho người dùng
    const loginHistoryRecord = {
      userId: userId,
      loginDate: new Date(),
      dayNumber: 1,
      streakComplete: false,
      rewardAmount: 0.01,
      claimed: false
    };
    
    await db.insert(loginHistory).values(loginHistoryRecord);
    console.log(`Created login history record for user ${userId}`);
    
    return {
      success: true,
      message: "Sample data initialized successfully",
      userId: userId
    };
  } catch (error: any) {
    console.error("Error initializing data:", error);
    return {
      success: false,
      message: "Failed to initialize data",
      error: error.message
    };
  }
}