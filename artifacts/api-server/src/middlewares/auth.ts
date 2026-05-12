import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { createAuditLog } from "../lib/audit";

// JWT secret — must be set in production
const JWT_SECRET = process.env.JWT_SECRET || "habesha-shield-dev-secret-change-in-production";

export interface AuthPayload {
  userId: number;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        role: string;
        isBanned: boolean;
      };
    }
  }
}

/**
 * Sign a JWT for a user session
 */
export function signToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verify and decode a JWT
 */
export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
}

/**
 * Middleware: require a valid JWT in Authorization header
 * Attaches req.user if valid
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    const [user] = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        role: usersTable.role,
        isBanned: usersTable.isBanned,
      })
      .from(usersTable)
      .where(eq(usersTable.id, payload.userId))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    // Security check: deny banned users
    if (user.isBanned) {
      res.status(403).json({ error: "Account suspended. Contact support." });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    logger.warn({ err }, "Invalid JWT token");
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Middleware: require admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    // Log unauthorized admin access attempt
    void createAuditLog({
      action: "UNAUTHORIZED_ADMIN_ACCESS",
      userId: req.user?.id ?? null,
      ipAddress: req.ip ?? null,
      details: `Attempted to access ${req.method} ${req.path}`,
    });
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

/**
 * Optional auth middleware — attaches user if token present, doesn't fail if missing
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    const [user] = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        role: usersTable.role,
        isBanned: usersTable.isBanned,
      })
      .from(usersTable)
      .where(eq(usersTable.id, payload.userId))
      .limit(1);

    if (user && !user.isBanned) {
      req.user = user;
    }
  } catch {
    // Ignore invalid tokens in optional auth
  }
  next();
}
