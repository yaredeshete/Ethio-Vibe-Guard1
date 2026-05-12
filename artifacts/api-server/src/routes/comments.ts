import { Router } from "express";
import { db, commentsTable, tracksTable, usersTable, notificationsTable } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth";
import { sanitizeInput } from "../lib/audit";

const router = Router();

// GET /api/tracks/:id/comments
router.get("/tracks/:id/comments", async (req, res) => {
  const trackId = parseInt(req.params.id as string);
  if (isNaN(trackId)) {
    res.status(400).json({ error: "Invalid track ID" });
    return;
  }

  try {
    const comments = await db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.trackId, trackId))
      .orderBy(desc(commentsTable.createdAt))
      .limit(50);

    const formatted = await Promise.all(
      comments.map(async (c) => {
        const [user] = await db
          .select({ username: usersTable.username, avatar: usersTable.avatar })
          .from(usersTable)
          .where(eq(usersTable.id, c.userId))
          .limit(1);

        return {
          id: String(c.id),
          trackId: String(c.trackId),
          userId: String(c.userId),
          username: user?.username ?? "Unknown",
          avatar: user?.avatar ?? null,
          text: c.text,
          createdAt: c.createdAt.toISOString(),
        };
      })
    );

    res.json(formatted);
  } catch (err) {
    req.log.error({ err }, "List comments error");
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

const commentSchema = z.object({
  text: z.string().min(1).max(500),
});

// POST /api/tracks/:id/comments
router.post("/tracks/:id/comments", requireAuth, async (req, res) => {
  const trackId = parseInt(req.params.id as string);
  if (isNaN(trackId)) {
    res.status(400).json({ error: "Invalid track ID" });
    return;
  }

  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Comment text required (max 500 chars)" });
    return;
  }

  try {
    const [track] = await db
      .select({ id: tracksTable.id, artistId: tracksTable.artistId })
      .from(tracksTable)
      .where(eq(tracksTable.id, trackId))
      .limit(1);

    if (!track) {
      res.status(404).json({ error: "Track not found" });
      return;
    }

    const [comment] = await db
      .insert(commentsTable)
      .values({
        trackId,
        userId: req.user!.id,
        text: sanitizeInput(parsed.data.text),
      })
      .returning();

    if (!comment) throw new Error("Failed to create comment");

    await db
      .update(tracksTable)
      .set({ commentsCount: sql`${tracksTable.commentsCount} + 1` })
      .where(eq(tracksTable.id, trackId));

    if (track.artistId !== req.user!.id) {
      await db.insert(notificationsTable).values({
        userId: track.artistId,
        type: "comment",
        message: `${req.user!.username} commented on your track`,
        link: `/tracks/${trackId}`,
        isRead: false,
      });
    }

    res.status(201).json({
      id: String(comment.id),
      trackId: String(comment.trackId),
      userId: String(comment.userId),
      username: req.user!.username,
      avatar: null,
      text: comment.text,
      createdAt: comment.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Create comment error");
    res.status(500).json({ error: "Failed to post comment" });
  }
});

// DELETE /api/comments/:id
router.delete("/comments/:id", requireAuth, async (req, res) => {
  const commentId = parseInt(req.params.id as string);
  if (isNaN(commentId)) {
    res.status(400).json({ error: "Invalid comment ID" });
    return;
  }

  try {
    const [comment] = await db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.id, commentId))
      .limit(1);

    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    if (comment.userId !== req.user!.id && req.user!.role !== "admin") {
      res.status(403).json({ error: "Not authorized to delete this comment" });
      return;
    }

    await db.delete(commentsTable).where(eq(commentsTable.id, commentId));

    await db
      .update(tracksTable)
      .set({ commentsCount: sql`GREATEST(${tracksTable.commentsCount} - 1, 0)` })
      .where(eq(tracksTable.id, comment.trackId));

    res.json({ message: "Comment deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete comment error");
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;
