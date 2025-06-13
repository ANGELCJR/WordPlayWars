import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import MemoryStore from "memorystore";

const scryptAsync = promisify(scrypt);
const MemStoreSession = MemoryStore(session);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "fallback-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: new MemStoreSession({
      checkPeriod: 86400000,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, {
            id: user.id,
            username: user.username,
            email: user.email || undefined,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
          });
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        done(null, {
          id: user.id,
          username: user.username,
          email: user.email || undefined,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
        });
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Registration attempt for username:", req.body.username);
      
      // Validate required fields
      if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      console.log("Checking for existing user...");
      
      let existingUser;
      try {
        existingUser = await storage.getUserByUsername(req.body.username);
      } catch (dbError) {
        console.error("Database error checking existing user:", dbError);
        return res.status(500).json({ message: "Database connection error" });
      }
      
      if (existingUser) {
        console.log("Username already exists:", req.body.username);
        return res.status(400).json({ message: "Username already exists" });
      }

      console.log("Creating new user...");
      const hashedPassword = await hashPassword(req.body.password);
      
      const userData = {
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email || null,
        firstName: req.body.firstName || null,
        lastName: req.body.lastName || null,
      };

      let user;
      try {
        user = await storage.createUser(userData);
        console.log("User created successfully:", user.id);
      } catch (dbError) {
        console.error("Database error creating user:", dbError);
        return res.status(500).json({ message: "Failed to create user in database" });
      }

      const sessionUser = {
        id: user.id,
        username: user.username,
        email: user.email || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      };

      req.login(sessionUser, (err) => {
        if (err) {
          console.error("Login after registration failed:", err);
          return next(err);
        }
        console.log("User logged in successfully after registration");
        res.status(201).json(sessionUser);
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ 
        message: "Registration failed",
        error: process.env.NODE_ENV === 'development' ? error?.message : undefined
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}