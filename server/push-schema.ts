import { drizzle } from "drizzle-orm/neon-serverless";
import postgres from "postgres";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "../shared/schema";
import { sql } from "drizzle-orm";
import ws from 'ws';

// Cấu hình ws cho neonConfig
neonConfig.webSocketConstructor = ws;

async function main() {
  console.log("🚀 Starting database schema update...");

  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Sử dụng Neon Serverless thay vì postgres-js
    const pool = new Pool({ connectionString });
    const db = drizzle(pool, { schema });

    console.log("🔄 Pushing schema changes to database...");
    
    // Tạo tất cả các bảng từ schema
    await createTables(pool);

    console.log("✅ Schema update completed successfully!");
  } catch (error) {
    console.error("❌ Error updating schema:", error);
    process.exit(1);
  }

  process.exit(0);
}

async function createTables(pool: Pool) {
  try {
    console.log("📊 Creating tables if they don't exist...");

    // Tạo bảng users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        balance NUMERIC DEFAULT 0,
        eggsOpened INTEGER DEFAULT 0,
        telegram_id BIGINT,
        auth_token TEXT,
        avatar TEXT,
        rank TEXT DEFAULT 'Beginner'
      );
    `);
    console.log("✅ Created users table");

    // Tạo bảng egg_types
    await pool.query(`
      CREATE TABLE IF NOT EXISTS egg_types (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC NOT NULL,
        image_url TEXT,
        rarity TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Created egg_types table");

    // Tạo bảng kitties
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kitties (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        rarity TEXT NOT NULL,
        image_url TEXT,
        egg_type_id INTEGER REFERENCES egg_types(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Created kitties table");

    // Tạo bảng eggs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS eggs (
        id SERIAL PRIMARY KEY,
        egg_type_id INTEGER REFERENCES egg_types(id),
        user_id INTEGER REFERENCES users(id),
        opened BOOLEAN DEFAULT FALSE,
        kitty_id INTEGER REFERENCES kitties(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        opened_at TIMESTAMP
      );
    `);
    console.log("✅ Created eggs table");

    // Tạo bảng collections
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collections (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        reward_amount NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Created collections table");

    // Tạo bảng user_collections
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_collections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        collection_id INTEGER REFERENCES collections(id),
        count INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Created user_collections table");

    // Tạo bảng tasks
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        reward_amount NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Created tasks table");

    // Tạo bảng user_tasks
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        task_id INTEGER REFERENCES tasks(id),
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Created user_tasks table");

    console.log("📊 All tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error;
  }
}

main();