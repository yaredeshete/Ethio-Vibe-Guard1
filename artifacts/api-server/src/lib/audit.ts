import { db, auditLogsTable, securityAlertsTable } from "@workspace/db";
import { logger } from "./logger";

interface AuditLogParams {
  action: string;
  userId?: number | null;
  ipAddress?: string | null;
  details?: string | null;
}

/**
 * Record an audit log entry for security/compliance tracking
 * Call this for all sensitive operations: login, register, admin actions, etc.
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await db.insert(auditLogsTable).values({
      action: params.action,
      userId: params.userId ?? null,
      ipAddress: params.ipAddress ?? null,
      details: params.details ?? null,
    });
  } catch (err) {
    logger.error({ err }, "Failed to write audit log");
  }
}

interface SecurityAlertParams {
  type: string;
  severity?: string;
  message: string;
  ipAddress?: string | null;
  userId?: number | null;
}

/**
 * Create a security alert for suspicious activity
 * Used for: failed logins, rate limit hits, XSS attempts, account lockouts
 */
export async function createSecurityAlert(params: SecurityAlertParams): Promise<void> {
  try {
    await db.insert(securityAlertsTable).values({
      type: params.type,
      severity: params.severity ?? "medium",
      message: params.message,
      ipAddress: params.ipAddress ?? null,
      userId: params.userId ?? null,
      isResolved: false,
    });
  } catch (err) {
    logger.error({ err }, "Failed to write security alert");
  }
}

/**
 * Sanitize text input to prevent XSS
 * Strips HTML tags and dangerous characters from user-provided text
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .trim();
}
