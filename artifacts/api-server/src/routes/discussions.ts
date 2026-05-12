import { Router } from "express";
import { db, discussionsTable, repliesTable, usersTable, notificationsTable } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth";
import { sanitizeInput } from "../lib/audit";

const router = Router();

async function formatDiscussion(d: typeof discussionsTable.$inferSelect) {
  const [author] = await db
    .select({ username: usersTable.username, avatar: usersTable.avatar })
    .from(usersTable)
    .where(eq(usersTable.id, d.authorId))
    .limit(1);

  return {
    id: String(d.id),
    title: d.title,
    content: d.content,
    category: d.category,
    authorId: String(d.authorId),
    authorName: author?.username ?? "Unknown",
    authorAvatar: author?.avatar ?? null,
    repliesCount: d.repliesCount,
    isPinned: d.isPinned,
    createdAt: d.createdAt.toISOString(),
  };
}

// GET /api/discussions
router.get("/discussions", async (req, res) => {
  const category = req.query.category as string | undefined;
  const page = req.query.page as string | undefined;
  const pageNum = Math.max(1, parseInt(page ?? "1") || 1);
  const limitNum = 20;
  const offset = (pageNum - 1) * limitNum;

  try {
    const whereClause = category ? eq(discussionsTable.category, category) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(discussionsTable)
      .where(whereClause);

    const discussions = await db
      .select()
      .from(discussionsTable)
      .where(whereClause)
      .orderBy(desc(discussionsTable.isPinned), desc(discussionsTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    const formatted = await Promise.all(discussions.map(formatDiscussion));
    const total = countResult?.count ?? 0;

    res.json({
      discussions: formatted,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error({ err }, "List discussions error");
    res.status(500).json({ error: "Failed to fetch discussions" });
  }
});

const discussionSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10).max(5000),
  category: z.string().min(1),
});

// POST /api/discussions
router.post("/discussions", requireAuth, async (req, res) => {
  const parsed = discussionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }

  try {
    const [discussion] = await db
      .insert(discussionsTable)
      .values({
        title: sanitizeInput(parsed.data.title),
        content: sanitizeInput(parsed.data.content),
        category: sanitizeInput(parsed.data.category),
        authorId: req.user!.id,
      })
      .returning();

    if (!discussion) throw new Error("Failed to create discussion");

    res.status(201).json(await formatDiscussion(discussion));
  } catch (err) {
    req.log.error({ err }, "Create discussion error");
    res.status(500).json({ error: "Failed to create discussion" });
  }
});

// GET /api/discussions/:id
router.get("/discussions/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid discussion ID" });
    return;
  }

  try {
    const [discussion] = await db
      .select()
      .from(discussionsTable)
      .where(eq(discussionsTable.id, id))
      .limit(1);

    if (!discussion) {
      res.status(404).json({ error: "Discussion not found" });
      return;
    }

    const replies = await db
      .select()
      .from(repliesTable)
      .where(eq(repliesTable.discussionId, id))
      .orderBy(repliesTable.createdAt)
      .limit(100);

    const formattedReplies = await Promise.all(
      replies.map(async (r) => {
        const [author] = await db
          .select({ username: usersTable.username, avatar: usersTable.avatar })
          .from(usersTable)
          .where(eq(usersTable.id, r.authorId))
          .limit(1);

        return {
          id: String(r.id),
          discussionId: String(r.discussionId),
          authorId: String(r.authorId),
          authorName: author?.username ?? "Unknown",
          authorAvatar: author?.avatar ?? null,
          content: r.content,
          createdAt: r.createdAt.toISOString(),
        };
      })
    );

    const base = await formatDiscussion(discussion);
    res.json({ ...base, replies: formattedReplies });
  } catch (err) {
    req.log.error({ err }, "Get discussion error");
    res.status(500).json({ error: "Failed to fetch discussion" });
  }
});

const replySchema = z.object({
  content: z.string().min(1).max(2000),
});

// POST /api/discussions/:id/replies
router.post("/discussions/:id/replies", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid discussion ID" });
    return;
  }

  const parsed = replySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Reply content is required" });
    return;
  }

  try {
    const [discussion] = await db
      .select()
      .from(discussionsTable)
      .where(eq(discussionsTable.id, id))
      .limit(1);

    if (!discussion) {
      res.status(404).json({ error: "Discussion not found" });
      return;
    }

    const [reply] = await db
      .insert(repliesTable)
      .values({
        discussionId: id,
        authorId: req.user!.id,
        content: sanitizeInput(parsed.data.content),
      })
      .returning();

    if (!reply) throw new Error("Failed to create reply");

    await db
      .update(discussionsTable)
      .set({ repliesCount: sql`${discussionsTable.repliesCount} + 1` })
      .where(eq(discussionsTable.id, id));

    if (discussion.authorId !== req.user!.id) {
      await db.insert(notificationsTable).values({
        userId: discussion.authorId,
        type: "reply",
        message: `${req.user!.username} replied to your discussion`,
        link: `/community/${id}`,
        isRead: false,
      });
    }

    res.status(201).json({
      id: String(reply.id),
      discussionId: String(reply.discussionId),
      authorId: String(reply.authorId),
      authorName: req.user!.username,
      authorAvatar: null,
      content: reply.content,
      createdAt: reply.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Create reply error");
    res.status(500).json({ error: "Failed to post reply" });
  }
});

export default router;
