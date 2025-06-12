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
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Game operations
  async saveGameScore(gameScore: InsertGameScore): Promise<GameScore> {
    const [savedScore] = await db
      .insert(gameScores)
      .values(gameScore)
      .returning();
    return savedScore;
  }

  async getUserGameScores(userId: number, limit = 50): Promise<GameScore[]> {
    const scores = await db
      .select()
      .from(gameScores)
      .where(eq(gameScores.userId, userId))
      .orderBy(desc(gameScores.createdAt))
      .limit(limit);
    return scores;
  }

  // Statistics operations
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId));
    return stats || undefined;
  }

  async updateUserStats(userId: number, gameScore: GameScore): Promise<UserStats> {
    const existingStats = await this.getUserStats(userId);
    
    if (existingStats) {
      // Update existing stats
      const newTotalGames = existingStats.totalGames + 1;
      const newTotalScore = existingStats.totalScore + gameScore.score;
      const newAverageScore = Math.round(newTotalScore / newTotalGames);
      const newBestScore = Math.max(existingStats.bestScore, gameScore.score);
      const newLongestStreak = Math.max(existingStats.longestStreak, gameScore.longestStreak);
      const newTotalWordsCorrect = existingStats.totalWordsCorrect + gameScore.wordsCorrect;
      
      const [updatedStats] = await db
        .update(userStats)
        .set({
          totalGames: newTotalGames,
          totalScore: newTotalScore,
          averageScore: newAverageScore,
          bestScore: newBestScore,
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
        currentStreak: gameScore.longestStreak,
        longestStreak: gameScore.longestStreak,
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
    const statsQuery = await db
      .select({
        user: users,
        stats: userStats,
      })
      .from(userStats)
      .innerJoin(users, eq(userStats.userId, users.id))
      .orderBy(desc(userStats.bestScore))
      .limit(limit);

    return statsQuery.map((row, index) => ({
      user: row.user,
      stats: row.stats,
      rank: index + 1,
    }));
  }
}

export const storage = new DatabaseStorage();