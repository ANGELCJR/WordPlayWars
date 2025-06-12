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
import { eq, desc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations for custom authentication
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game operations
  saveGameScore(gameScore: InsertGameScore): Promise<GameScore>;
  getUserGameScores(userId: string, limit?: number): Promise<GameScore[]>;
  
  // Statistics operations
  getUserStats(userId: string): Promise<UserStats | undefined>;
  updateUserStats(userId: string, gameScore: GameScore): Promise<UserStats>;
  getLeaderboard(gameMode?: string, limit?: number): Promise<Array<{
    user: User;
    stats: UserStats;
    rank: number;
  }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Game operations
  async saveGameScore(gameScore: InsertGameScore): Promise<GameScore> {
    const [savedScore] = await db
      .insert(gameScores)
      .values(gameScore)
      .returning();
    
    // Update user stats after saving score
    await this.updateUserStats(gameScore.userId, savedScore);
    
    return savedScore;
  }

  async getUserGameScores(userId: string, limit = 50): Promise<GameScore[]> {
    return await db
      .select()
      .from(gameScores)
      .where(eq(gameScores.userId, userId))
      .orderBy(desc(gameScores.createdAt))
      .limit(limit);
  }

  // Statistics operations
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId));
    return stats;
  }

  async updateUserStats(userId: string, gameScore: GameScore): Promise<UserStats> {
    const existingStats = await this.getUserStats(userId);
    
    if (existingStats) {
      // Update existing stats
      const newTotalGames = existingStats.totalGames + 1;
      const newTotalScore = existingStats.totalScore + gameScore.score;
      const newAverageScore = Math.round(newTotalScore / newTotalGames);
      const newBestScore = Math.max(existingStats.bestScore, gameScore.score);
      const newTotalWordsCorrect = existingStats.totalWordsCorrect + gameScore.wordsCorrect;
      
      // Update streak logic
      let newCurrentStreak = existingStats.currentStreak;
      let newLongestStreak = existingStats.longestStreak;
      
      if (gameScore.wordsCorrect > 0) {
        newCurrentStreak += 1;
        newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
      } else {
        newCurrentStreak = 0;
      }

      const [updatedStats] = await db
        .update(userStats)
        .set({
          totalGames: newTotalGames,
          totalScore: newTotalScore,
          averageScore: newAverageScore,
          bestScore: newBestScore,
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          totalWordsCorrect: newTotalWordsCorrect,
          favoriteGameMode: gameScore.gameMode,
          updatedAt: new Date(),
        })
        .where(eq(userStats.userId, userId))
        .returning();
      
      return updatedStats;
    } else {
      // Create new stats
      const newStats: InsertUserStats = {
        userId,
        totalGames: 1,
        totalScore: gameScore.score,
        averageScore: gameScore.score,
        bestScore: gameScore.score,
        currentStreak: gameScore.wordsCorrect > 0 ? 1 : 0,
        longestStreak: gameScore.wordsCorrect > 0 ? 1 : 0,
        totalWordsCorrect: gameScore.wordsCorrect,
        favoriteGameMode: gameScore.gameMode,
      };

      const [createdStats] = await db
        .insert(userStats)
        .values(newStats)
        .returning();
      
      return createdStats;
    }
  }

  async getLeaderboard(gameMode?: string, limit = 50): Promise<Array<{
    user: User;
    stats: UserStats;
    rank: number;
  }>> {
    const query = db
      .select({
        user: users,
        stats: userStats,
      })
      .from(userStats)
      .innerJoin(users, eq(userStats.userId, users.id))
      .orderBy(desc(userStats.bestScore))
      .limit(limit);

    const results = await query;
    
    return results.map((result, index) => ({
      user: result.user,
      stats: result.stats,
      rank: index + 1,
    }));
  }
}

export const storage = new DatabaseStorage();
