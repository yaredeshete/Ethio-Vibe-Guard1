import { Router } from "express";
import { db, usersTable, reportsTable, securityAlertsTable, auditLogsTable, tracksTable, discussionsTable } from "@workspace/db";
import { eq, sql, and, desc } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { createAuditLog } from "../lib/audit";

const router = Router();

// All admin routes require auth + admin role
router.use(requireAuth, requireAdmin);

// GET /api/admin/users
router.get("/admin/users", async (req, res) => {
  const search = req.query.search as string | undefined;
  const role = req.query.role as string | undefined;
  const page = req.query.page as string | undefined;
  const pageNum = Math.max(1, parseInt(page ?? "1") || 1);
  const limitNum = 20;
  const offset = (pageNum - 1) * limitNum;

  try {
    const conditions: ReturnType<typeof eq>[] = [];
    if (role) conditions.push(eq(usersTable.role, role) as any);
    if (search) conditions.push(
      sql`(${usersTable.username} ILIKE ${'%' + search + '%'} OR ${usersTable.email} ILIKE ${'%' + search + '%'})` as any
    );

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(usersTable)
      .where(whereClause);

    const users = await db
      .select()
      .from(usersTable)
      .where(whereClause)
      .orderBy(desc(usersTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    const total = countResult?.count ?? 0;

    res.json({
      users: users.map((u) => ({
        id: String(u.id),
        username: u.username,
        email: u.email,
        displayName: u.displayName,
        avatar: u.avatar,
        bio: u.bio,
        role: u.role,
        isVerified: u.isVerified,
        isBanned: u.isBanned,
        followersCount: u.followersCount,
        followingCount: u.followingCount,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error({ err }, "Admin list users error");
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

const adminUserUpdateSchema = z.object({
  role: z.enum(["user", "artist", "admin"]).optional(),
  isBanned: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

// PATCH /api/admin/users/:id
router.patch("/admin/users/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const parsed = adminUserUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid update data" });
    return;
  }

  try {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.role !== undefined) updates.role = parsed.data.role;
    if (parsed.data.isBanned !== undefined) updates.isBanned = parsed.data.isBanned;
    if (parsed.data.isVerified !== undefined) updates.isVerified = parsed.data.isVerified;

    const [updated] = await db
      .update(usersTable)
      .set(updates as any)
      .where(eq(usersTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await createAuditLog({
      action: "ADMIN_USER_UPDATE",
      userId: req.user!.id,
      ipAddress: req.ip ?? null,
      details: `Updated user ${id}: ${JSON.stringify(parsed.data)}`,
    });

    res.json({
      id: String(updated.id),
      username: updated.username,
      email: updated.email,
      displayName: updated.displayName,
      avatar: updated.avatar,
      bio: updated.bio,
      role: updated.role,
      isVerified: updated.isVerified,
      isBanned: updated.isBanned,
      followersCount: updated.followersCount,
      followingCount: updated.followingCount,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Admin update user error");
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE /api/admin/users/:id
router.delete("/admin/users/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    await db.delete(usersTable).where(eq(usersTable.id, id));

    await createAuditLog({
      action: "ADMIN_USER_DELETE",
      userId: req.user!.id,
      ipAddress: req.ip ?? null,
      details: `Deleted user ${id}`,
    });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    req.log.error({ err }, "Admin delete user error");
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// GET /api/admin/reports
router.get("/admin/reports", async (req, res) => {
  try {
    const reports = await db
      .select()
      .from(reportsTable)
      .orderBy(desc(reportsTable.createdAt))
      .limit(50);

    const formatted = await Promise.all(
      reports.map(async (r) => {
        const [reporter] = await db
          .select({ username: usersTable.username })
          .from(usersTable)
          .where(eq(usersTable.id, r.reporterId))
          .limit(1);

        return {
          id: String(r.id),
          targetType: r.targetType,
          targetId: String(r.targetId),
          reporterId: String(r.reporterId),
          reporterName: reporter?.username ?? "Unknown",
          reason: r.reason,
          details: r.details,
          status: r.status,
          resolvedBy: r.resolvedBy ? String(r.resolvedBy) : null,
          createdAt: r.createdAt.toISOString(),
        };
      })
    );

    res.json(formatted);
  } catch (err) {
    req.log.error({ err }, "Admin list reports error");
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

const reportResolutionSchema = z.object({
  action: z.enum(["resolve", "dismiss"]),
  notes: z.string().optional(),
});

// PATCH /api/admin/reports/:id
router.patch("/admin/reports/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid report ID" });
    return;
  }

  const parsed = reportResolutionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid action" });
    return;
  }

  try {
    const newStatus = parsed.data.action === "resolve" ? "resolved" : "dismissed";

    await db
      .update(reportsTable)
      .set({ status: newStatus, resolvedBy: req.user!.id })
      .where(eq(reportsTable.id, id));

    await createAuditLog({
      action: "ADMIN_REPORT_RESOLVED",
      userId: req.user!.id,
      ipAddress: req.ip ?? null,
      details: `Report ${id} ${newStatus}${parsed.data.notes ? `: ${parsed.data.notes}` : ""}`,
    });

    res.json({ message: `Report ${newStatus}` });
  } catch (err) {
    req.log.error({ err }, "Admin resolve report error");
    res.status(500).json({ error: "Failed to resolve report" });
  }
});

// GET /api/admin/security-alerts
router.get("/admin/security-alerts", async (req, res) => {
  try {
    const alerts = await db
      .select()
      .from(securityAlertsTable)
      .orderBy(desc(securityAlertsTable.createdAt))
      .limit(50);

    const formatted = await Promise.all(
      alerts.map(async (a) => {
        let username: string | null = null;
        if (a.userId) {
          const [user] = await db
            .select({ username: usersTable.username })
            .from(usersTable)
            .where(eq(usersTable.id, a.userId))
            .limit(1);
          username = user?.username ?? null;
        }

        return {
          id: String(a.id),
          type: a.type,
          severity: a.severity,
          message: a.message,
          ipAddress: a.ipAddress,
          userId: a.userId ? String(a.userId) : null,
          username,
          isResolved: a.isResolved,
          createdAt: a.createdAt.toISOString(),
        };
      })
    );

    res.json(formatted);
  } catch (err) {
    req.log.error({ err }, "Admin security alerts error");
    res.status(500).json({ error: "Failed to fetch security alerts" });
  }
});

// GET /api/admin/audit-logs
router.get("/admin/audit-logs", async (req, res) => {
  const page = req.query.page as string | undefined;
  const pageNum = Math.max(1, parseInt(page ?? "1") || 1);
  const limitNum = 30;
  const offset = (pageNum - 1) * limitNum;

  try {
    const [countResult] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(auditLogsTable);

    const logs = await db
      .select()
      .from(auditLogsTable)
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    const formatted = await Promise.all(
      logs.map(async (l) => {
        let username: string | null = null;
        if (l.userId) {
          const [user] = await db
            .select({ username: usersTable.username })
            .from(usersTable)
            .where(eq(usersTable.id, l.userId))
            .limit(1);
          username = user?.username ?? null;
        }

        return {
          id: String(l.id),
          action: l.action,
          userId: l.userId ? String(l.userId) : null,
          username,
          ipAddress: l.ipAddress,
          details: l.details,
          createdAt: l.createdAt.toISOString(),
        };
      })
    );

    const total = countResult?.count ?? 0;
    res.json({
      logs: formatted,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error({ err }, "Admin audit logs error");
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

// GET /api/admin/analytics
router.get("/admin/analytics", async (req, res) => {
  try {
    const [totalUsers] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(usersTable);
    const [totalArtists] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(usersTable)
      .where(eq(usersTable.role, "artist"));
    const [totalTracks] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(tracksTable);
    const [totalDiscussions] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(discussionsTable);
    const [pendingReports] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(reportsTable)
      .where(eq(reportsTable.status, "pending"));
    const [unresolvedAlerts] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(securityAlertsTable)
      .where(eq(securityAlertsTable.isResolved, false));

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [newUsersWeek] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(usersTable)
      .where(sql`${usersTable.createdAt} >= ${oneWeekAgo}`);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [activeToday] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(auditLogsTable)
      .where(
        and(
          eq(auditLogsTable.action, "USER_LOGIN"),
          sql`${auditLogsTable.createdAt} >= ${todayStart}`
        )
      );

    const allTracks = await db.select({ genre: tracksTable.genre }).from(tracksTable);
    const genreMap: Record<string, number> = {};
    for (const t of allTracks) {
      genreMap[t.genre] = (genreMap[t.genre] ?? 0) + 1;
    }
    const genreBreakdown = Object.entries(genreMap).map(([genre, count]) => ({ genre, count }));

    const topTracks = await db
      .select()
      .from(tracksTable)
      .orderBy(desc(tracksTable.likesCount))
      .limit(5);

    const formattedTop = await Promise.all(
      topTracks.map(async (t) => {
        const [artist] = await db
          .select({ username: usersTable.username, displayName: usersTable.displayName, avatar: usersTable.avatar })
          .from(usersTable)
          .where(eq(usersTable.id, t.artistId))
          .limit(1);

        return {
          id: String(t.id),
          title: t.title,
          artistId: String(t.artistId),
          artistName: artist?.displayName ?? artist?.username ?? "Unknown",
          artistAvatar: artist?.avatar ?? null,
          genre: t.genre,
          youtubeId: t.youtubeId,
          thumbnail: t.thumbnail ?? `https://img.youtube.com/vi/${t.youtubeId}/hqdefault.jpg`,
          description: t.description,
          likesCount: t.likesCount,
          commentsCount: t.commentsCount,
          isLiked: false,
          isTrending: t.isTrending,
          createdAt: t.createdAt.toISOString(),
        };
      })
    );

    res.json({
      totalUsers: totalUsers?.count ?? 0,
      totalArtists: totalArtists?.count ?? 0,
      totalTracks: totalTracks?.count ?? 0,
      totalDiscussions: totalDiscussions?.count ?? 0,
      newUsersThisWeek: newUsersWeek?.count ?? 0,
      activeUsersToday: activeToday?.count ?? 0,
      pendingReports: pendingReports?.count ?? 0,
      unresolvedAlerts: unresolvedAlerts?.count ?? 0,
      genreBreakdown,
      topTracks: formattedTop,
    });
  } catch (err) {
    req.log.error({ err }, "Admin analytics error");
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;
