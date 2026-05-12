import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { signToken, requireAuth } from "../middlewares/auth";
import { createAuditLog, createSecurityAlert, sanitizeInput } from "../lib/audit";

const router = Router();

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscores"),
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().max(50).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: String(user.id),
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    avatar: user.avatar,
    bio: user.bio,
    role: user.role,
    isVerified: user.isVerified,
    isBanned: user.isBanned,
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    createdAt: user.createdAt.toISOString(),
  };
}

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }

  const { username, email, password, displayName } = parsed.data;
  const cleanUsername = sanitizeInput(username);
  const cleanDisplayName = displayName ? sanitizeInput(displayName) : cleanUsername;
  const ip = req.ip ?? "unknown";

  try {
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (existing) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const [existingUsername] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, cleanUsername))
      .limit(1);

    if (existingUsername) {
      res.status(400).json({ error: "Username already taken" });
      return;
    }

    // Hash password with bcrypt (cost factor 12 for strong security)
    const passwordHash = await bcrypt.hash(password, 12);

    const [user] = await db
      .insert(usersTable)
      .values({
        username: cleanUsername,
        email: email.toLowerCase(),
        passwordHash,
        displayName: cleanDisplayName,
        role: "user",
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      })
      .returning();

    if (!user) throw new Error("Failed to create user");

    const token = signToken(user.id, user.role);

    await createAuditLog({
      action: "USER_REGISTERED",
      userId: user.id,
      ipAddress: ip,
      details: `New user registered: ${user.username}`,
    });

    req.log.info({ userId: user.id }, "New user registered");
    res.status(201).json({ token, user: formatUser(user) });
  } catch (err) {
    req.log.error({ err }, "Registration error");
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid email or password format" });
    return;
  }

  const { email, password } = parsed.data;
  const ip = req.ip ?? "unknown";

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      await createSecurityAlert({
        type: "failed_login",
        severity: "low",
        message: `Failed login for non-existent email`,
        ipAddress: ip,
      });
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      await createSecurityAlert({
        type: "account_locked",
        severity: "medium",
        message: `Login attempt on locked account: ${user.username}`,
        ipAddress: ip,
        userId: user.id,
      });
      res.status(423).json({ error: `Account locked. Try again in ${minutesLeft} minutes.` });
      return;
    }

    if (user.isBanned) {
      res.status(403).json({ error: "Account suspended. Contact support." });
      return;
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      const newAttempts = (user.loginAttempts ?? 0) + 1;
      const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS;

      await db
        .update(usersTable)
        .set({
          loginAttempts: newAttempts,
          lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
        })
        .where(eq(usersTable.id, user.id));

      if (shouldLock) {
        await createSecurityAlert({
          type: "account_locked",
          severity: "high",
          message: `Account locked after ${MAX_LOGIN_ATTEMPTS} failed attempts: ${user.username}`,
          ipAddress: ip,
          userId: user.id,
        });
      } else {
        await createSecurityAlert({
          type: "failed_login",
          severity: "low",
          message: `Failed login for ${user.username} (attempt ${newAttempts}/${MAX_LOGIN_ATTEMPTS})`,
          ipAddress: ip,
          userId: user.id,
        });
      }

      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Reset attempts on successful login
    await db
      .update(usersTable)
      .set({
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      })
      .where(eq(usersTable.id, user.id));

    const token = signToken(user.id, user.role);

    await createAuditLog({
      action: "USER_LOGIN",
      userId: user.id,
      ipAddress: ip,
      details: `Login from ${ip}`,
    });

    req.log.info({ userId: user.id }, "User logged in");
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/me
router.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user!.id))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(formatUser(user));
  } catch (err) {
    req.log.error({ err }, "Get me error");
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// POST /api/auth/logout
router.post("/auth/logout", requireAuth, async (req, res) => {
  await createAuditLog({
    action: "USER_LOGOUT",
    userId: req.user!.id,
    ipAddress: req.ip ?? null,
  });
  res.json({ message: "Logged out successfully" });
});

export default router;
