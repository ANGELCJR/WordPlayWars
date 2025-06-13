import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Simple health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Protected route example
  app.get("/api/protected", requireAuth, (req: any, res) => {
    res.json({ message: "This is a protected route", user: req.user });
  });

  const httpServer = createServer(app);
  return httpServer;
}