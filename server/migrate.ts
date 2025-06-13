import { db, pool } from "./db";
import { sql } from "drizzle-orm";

export async function runMigrations() {
  let retries = 3;
  
  while (retries > 0) {
    try {
      console.log("Running database migrations...");
      
      // Test connection first
      await db.execute(sql`SELECT 1`);
      console.log("Database connection established");
      
      // Create tables if they don't exist
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE,
          password VARCHAR(255) NOT NULL,
          "firstName" VARCHAR(255),
          "lastName" VARCHAR(255),
          "createdAt" TIMESTAMP DEFAULT NOW()
        );
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS sessions (
          sid VARCHAR PRIMARY KEY,
          sess JSONB NOT NULL,
          expire TIMESTAMP NOT NULL
        );
      `);

      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS game_scores (
          id SERIAL PRIMARY KEY,
          "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
          "gameMode" VARCHAR(50) NOT NULL,
          score INTEGER NOT NULL,
          "timeElapsed" INTEGER,
          "wordsCorrect" INTEGER DEFAULT 0,
          accuracy DECIMAL(5,2),
          "gameData" JSONB,
          "createdAt" TIMESTAMP DEFAULT NOW()
        );
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS user_stats (
          id SERIAL PRIMARY KEY,
          "userId" INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          "totalGames" INTEGER DEFAULT 0,
          "totalScore" INTEGER DEFAULT 0,
          "bestScore" INTEGER DEFAULT 0,
          "currentStreak" INTEGER DEFAULT 0,
          "longestStreak" INTEGER DEFAULT 0,
          "totalWordsCorrect" INTEGER DEFAULT 0,
          "favoriteGameMode" VARCHAR(50),
          "updatedAt" TIMESTAMP DEFAULT NOW()
        );
      `);

      console.log("Database migrations completed successfully");
      return;
      
    } catch (error: any) {
      retries--;
      console.error(`Migration attempt failed (${3 - retries}/3):`, error?.message || error);
      
      if (retries === 0) {
        console.error("All migration attempts failed. Starting server without migrations.");
        console.warn("Database tables may not exist. Some features may not work properly.");
        return;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}