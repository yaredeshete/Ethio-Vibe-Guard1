import { Router } from "express";
import { db, usersTable, followsTable, notificationsTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, optionalAuth } from "../middlewares/auth";
import { sanitizeInput } from "../lib/audit";

const router = Router();

function formatPublicUser(user: typeof usersTable.$inferSelect, isFollowing = false, tracksCount = 0) {
  return {
    id: String(user.id),
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
    bio: user.bio,
    role: user.role,
    isVerified: user.isVerified,
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    tracksCount,
    isFollowing,
    createdAt: user.createdAt.toISOString(),
  };
}

// GET /api/users/:username
router.get("/users/:username", optionalAuth, async (req, res) => {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, req.params.username as string))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    let isFollowing = false;
    if (req.user) {
      const [follow] = await db
        .select({ id: followsTable.id })
        .from(followsTable)
        .where(
          and(
            eq(followsTable.followerId, req.user.id),
            eq(followsTable.followingId, user.id)
          )
        )
        .limit(1);
      isFollowing = !!follow;
    }

    res.json(formatPublicUser(user, isFollowing));
  } catch (err) {
    req.log.error({ err }, "Get user profile error");
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

const profileUpdateSchema = z.object({
  displayName: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

// PUT /api/users/profile
router.put("/users/profile", requireAuth, async (req, res) => {
  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }

  const updates: Record<string, string | undefined> = {};
  if (parsed.data.displayName !== undefined) updates.displayName = sanitizeInput(parsed.data.displayName);
  if (parsed.data.bio !== undefined) updates.bio = sanitizeInput(parsed.data.bio);
  if (parsed.data.avatar !== undefined) updates.avatar = parsed.data.avatar;

  try {
    const [updated] = await db
      .update(usersTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(usersTable.id, req.user!.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }

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
    req.log.error({ err }, "Update profile error");
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// POST /api/users/:id/follow
router.post("/users/:id/follow", requireAuth, async (req, res) => {
  const targetId = parseInt(req.params.id as string);
  if (isNaN(targetId) || targetId === req.user!.id) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    const [target] = await db
      .select({ id: usersTable.id, username: usersTable.username })
      .from(usersTable)
      .where(eq(usersTable.id, targetId))
      .limit(1);

    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const [existing] = await db
      .select({ id: followsTable.id })
      .from(followsTable)
      .where(
        and(
          eq(followsTable.followerId, req.user!.id),
          eq(followsTable.followingId, targetId)
        )
      )
      .limit(1);

    if (existing) {
      res.json({ message: "Already following" });
      return;
    }

    await db.insert(followsTable).values({
      followerId: req.user!.id,
      followingId: targetId,
    });

    await db
      .update(usersTable)
      .set({ followersCount: sql`${usersTable.followersCount} + 1` })
      .where(eq(usersTable.id, targetId));

    await db
      .update(usersTable)
      .set({ followingCount: sql`${usersTable.followingCount} + 1` })
      .where(eq(usersTable.id, req.user!.id));

    await db.insert(notificationsTable).values({
      userId: targetId,
      type: "follow",
      message: `${req.user!.username} started following you`,
      link: `/profile/${req.user!.username}`,
      isRead: false,
    });

    res.json({ message: "Followed successfully" });
  } catch (err) {
    req.log.error({ err }, "Follow user error");
    res.status(500).json({ error: "Failed to follow user" });
  }
});

// DELETE /api/users/:id/follow
router.delete("/users/:id/follow", requireAuth, async (req, res) => {
  const targetId = parseInt(req.params.id as string);
  if (isNaN(targetId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    const deleted = await db
      .delete(followsTable)
      .where(
        and(
          eq(followsTable.followerId, req.user!.id),
          eq(followsTable.followingId, targetId)
        )
      )
      .returning();

    if (deleted.length > 0) {
      await db
        .update(usersTable)
        .set({ followersCount: sql`GREATEST(${usersTable.followersCount} - 1, 0)` })
        .where(eq(usersTable.id, targetId));

      await db
        .update(usersTable)
        .set({ followingCount: sql`GREATEST(${usersTable.followingCount} - 1, 0)` })
        .where(eq(usersTable.id, req.user!.id));
    }

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    req.log.error({ err }, "Unfollow user error");
    res.status(500).json({ error: "Failed to unfollow user" });
  }
});

export default router;
