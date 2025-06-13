import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import MemoryStore from "memorystore";

const scryptAsync = promisify(scrypt);
const MemStoreSession = MemoryStore(session);

// In-memory user storage for immediate functionality
const users: Array<{
  id: number;
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}> = [];

let nextUserId = 1;

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
    secret: process.env.SESSION_SECRET || "temp-secret-for-demo",
    resave: false,
    saveUninitialized: false,
    store: new MemStoreSession({
      checkPeriod: 86400000,
    }),
    cookie: {
      secure: false, // Set to false for immediate functionality
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("Authentication attempt for:", username);
        const user = users.find(u => u.username === username);
        if (!user) {
          console.log("User not found:", username);
          return done(null, false);
        }
        
        const passwordValid = await comparePasswords(password, user.password);
        if (!passwordValid) {
          console.log("Invalid password for:", username);
          return done(null, false);
        }
        
        console.log("Authentication successful for:", username);
        return done(null, user);
      } catch (error) {
        console.error("Authentication error:", error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    console.log("Serializing user:", user.id);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log("Deserializing user:", id);
      const user = users.find(u => u.id === id);
      done(null, user || false);
    } catch (error) {
      console.error("Deserialization error:", error);
      done(error);
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      console.log("Registration request:", req.body);
      
      if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const existingUser = users.find(u => u.username === req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      
      const newUser = {
        id: nextUserId++,
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
      };

      users.push(newUser);
      console.log("User created:", newUser.username, "Total users:", users.length);

      req.login(newUser, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "Login failed after registration" });
        }
        
        const responseUser = {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,