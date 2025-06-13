import {
  users,
  gameScores,
  userStats,
  type User,
  type InsertUser,
  type GameScore,
  type InsertGameScore,
  type UserStats,
  type InsertUserStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations for custom authentication
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game operations
  saveGameScore(gameScore: InsertGameScore): Promise<GameScore>;
  getUserGameScores(userId: number, limit?: number): Promise<GameScore[]>;
  
  // Statistics operations
  getUserStats(userId: number): Promise<UserStats | undefined>;
  updateUserStats(userId: number, gameScore: GameScore): Promise<UserStats>;
  getLeaderboard(gameMode?: string, limit?: number): Promise<Array<{
    user: User;
    stats: UserStats;
    rank: number;
  }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error("Database error in getUser:", error);
      throw new Error("Database connection failed");
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error("Database error in getUserByUsername:", error);
      throw new Error("Database connection failed");
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(userData)
        .returning();
      return user;
    } catch (error) {
      console.error("Database error in createUser:", error);
      throw new Error("Failed to create user");
    }
  }

  // Game operations
  async saveGameScore(gameScore: InsertGameScore): Promise<GameScore> {
    try {
      const [savedScore] = await db
        .insert(gameScores)
        .values(gameScore)
        .returning();
      
      // Update user stats
      await this.updateUserStats(gameScore.userId, savedScore);
      
      return savedScore;
    } catch (error) {
      console.error("Database error in saveGameScore:", error);
      throw new Error("Failed to save game score");
    }
  }

  async getUserGameScores(userId: number, limit = 50): Promise<GameScore[]> {
    try {
      const scores = await db
        .select()
        .from(gameScores)
        .where(eq(gameScores.userId, userId))
        .orderBy(desc(gameScores.createdAt))
        .limit(limit);
      
      return scores;
    } catch (error) {
      console.error("Database error in getUserGameScores:", error);
      throw new Error("Failed to fetch game scores");
    }
  }

  // Statistics operations
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    try {
      const [stats] = await db
        .select()
        .from(userStats)
        .where(eq(userStats.userId, userId));
      
      return stats || undefined;
    } catch (error) {
      console.error("Database error in getUserStats:", error);
      throw new Error("Failed to fetch user stats");
    }
  }

  async updateUserStats(userId: number, gameScore: GameScore): Promise<UserStats> {
    try {
      const existingStats = await this.getUserStats(userId);
      
      const newStats: InsertUserStats = {
        userId,
        totalGames: (existingStats?.totalGames || 0) + 1,
        totalScore: (existingStats?.totalScore || 0) + gameScore.score,
        bestScore: Math.max(existingStats?.bestScore || 0, gameScore.score),
        currentStreak: gameScore.score > 0 ? (existingStats?.currentStreak || 0) + 1 : 0,
        longestStreak: Math.max(
          existingStats?.longestStreak || 0,
          gameScore.score > 0 ? (existingStats?.currentStreak || 0) + 1 : 0
        ),
        totalWordsCorrect: (existingStats?.totalWordsCorrect || 0) + (gameScore.wordsCorrect || 0),
        favoriteGameMode: gameScore.gameMode,
      };

      if (existingStats) {
        const [updatedStats] = await db
          .update(userStats)
          .set(newStats)
          .where(eq(userStats.userId, userId))
          .returning();
        return updatedStats;
      } else {
        const [createdStats] = await db
          .insert(userStats)
          .values(newStats)
          .returning();
        return createdStats;
      }
    } catch (error) {
      console.error("Database error in updateUserStats:", error);
      throw new Error("Failed to update user stats");
    }
  }

  async getLeaderboard(gameMode?: string, limit = 50): Promise<Array<{
    user: User;
    stats: UserStats;
    rank: number;
  }>> {
    try {
      // This would need a more complex query with proper joins
      // For now, return empty array to prevent errors
      return [];
    } catch (error) {
      console.error("Database error in getLeaderboard:", error);
      throw new Error("Failed to fetch leaderboard");
    }
  }
}

export const storage = new DatabaseStorage();