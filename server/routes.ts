import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertGameScoreSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user stats
      const stats = await storage.getUserStats(userId);
      
      res.json({
        ...user,
        stats: stats || {
          totalGames: 0,
          totalScore: 0,
          bestScore: 0,
          averageScore: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalWordsCorrect: 0,
          favoriteGameMode: null,
        }
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Game score routes
  app.post("/api/game/score", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const gameScoreData = {
        ...req.body,
        userId,
      };

      // Validate the game score data
      const validatedData = insertGameScoreSchema.parse(gameScoreData);
      
      const savedScore = await storage.saveGameScore(validatedData);
      res.json(savedScore);
    } catch (error) {
      console.error("Error saving game score:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid game score data",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to save game score" });
    }
  });

  app.get("/api/game/scores", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const scores = await storage.getUserGameScores(userId, limit);
      res.json(scores);
    } catch (error) {
      console.error("Error fetching game scores:", error);
      res.status(500).json({ message: "Failed to fetch game scores" });
    }
  });

  // Statistics routes
  app.get("/api/stats/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      
      if (!stats) {
        return res.json({
          totalGames: 0,
          totalScore: 0,
          bestScore: 0,
          averageScore: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalWordsCorrect: 0,
          favoriteGameMode: null,
        });
      }
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Leaderboard routes
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const gameMode = req.query.gameMode as string;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const leaderboard = await storage.getLeaderboard(gameMode, limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
