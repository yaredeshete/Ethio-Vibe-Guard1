import { Router } from "express";
import { db, tracksTable, usersTable, trackLikesTable, commentsTable, genresTable, notificationsTable, reportsTable } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, optionalAuth } from "../middlewares/auth";
import { sanitizeInput, createAuditLog } from "../lib/audit";

const router = Router();

async function formatTrack(track: typeof tracksTable.$inferSelect, currentUserId?: number) {
  const [artist] = await db
    .select({ username: usersTable.username, displayName: usersTable.displayName, avatar: usersTable.avatar })
    .from(usersTable)
    .where(eq(usersTable.id, track.artistId))
    .limit(1);

  let isLiked = false;
  if (currentUserId) {
    const [like] = await db
      .select({ id: trackLikesTable.id })
      .from(trackLikesTable)
      .where(and(eq(trackLikesTable.trackId, track.id), eq(trackLikesTable.userId, currentUserId)))
      .limit(1);
    isLiked = !!like;
  }

  return {
    id: String(track.id),
    title: track.title,
    artistId: String(track.artistId),
    artistName: artist?.displayName ?? artist?.username ?? "Unknown Artist",
    artistAvatar: artist?.avatar ?? null,
    genre: track.genre,
    youtubeId: track.youtubeId,
    thumbnail: track.thumbnail ?? `https://img.youtube.com/vi/${track.youtubeId}/hqdefault.jpg`,
    description: track.description,
    likesCount: track.likesCount,
    commentsCount: track.commentsCount,
    isLiked,
    isTrending: track.isTrending,
    createdAt: track.createdAt.toISOString(),
  };
}

// GET /api/tracks/genres — must come before /tracks/:id
router.get("/tracks/genres", async (req, res) => {
  try {
    const genres = await db.select().from(genresTable).orderBy(genresTable.name);
    const genreWithCounts = await Promise.all(
      genres.map(async (g) => {
        const [count] = await db
          .select({ count: sql<number>`cast(count(*) as int)` })
          .from(tracksTable)
          .where(eq(tracksTable.genre, g.name));
        return {
          id: String(g.id),
          name: g.name,
          tracksCount: count?.count ?? 0,
          color: g.color,
        };
      })
    );
    res.json(genreWithCounts);
  } catch (err) {
    req.log.error({ err }, "List genres error");
    res.status(500).json({ error: "Failed to fetch genres" });
  }
});

// GET /api/tracks/liked — must come before /tracks/:id
router.get("/tracks/liked", requireAuth, async (req, res) => {
  try {
    const likedIds = await db
      .select({ trackId: trackLikesTable.trackId })
      .from(trackLikesTable)
      .where(eq(trackLikesTable.userId, req.user!.id))
      .orderBy(desc(trackLikesTable.createdAt));

    const tracks = await Promise.all(
      likedIds.map(async ({ trackId }) => {
        const [track] = await db.select().from(tracksTable).where(eq(tracksTable.id, trackId)).limit(1);
        if (!track) return null;
        return formatTrack(track, req.user!.id);
      })
    );

    res.json(tracks.filter(Boolean));
  } catch (err) {
    req.log.error({ err }, "Get liked tracks error");
    res.status(500).json({ error: "Failed to fetch liked tracks" });
  }
});

// GET /api/tracks/trending — must come before /tracks/:id
router.get("/tracks/trending", optionalAuth, async (req, res) => {
  try {
    const tracks = await db
      .select()
      .from(tracksTable)
      .where(eq(tracksTable.isTrending, true))
      .orderBy(desc(tracksTable.likesCount))
      .limit(10);

    const formatted = await Promise.all(tracks.map(t => formatTrack(t, req.user?.id)));
    res.json(formatted);
  } catch (err) {
    req.log.error({ err }, "Trending tracks error");
    res.status(500).json({ error: "Failed to fetch trending tracks" });
  }
});

// GET /api/tracks
router.get("/tracks", optionalAuth, async (req, res) => {
  const { genre, search, artistId, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(50, parseInt(limit) || 20);
  const offset = (pageNum - 1) * limitNum;

  try {
    const conditions: ReturnType<typeof eq>[] = [];
    if (genre) conditions.push(eq(tracksTable.genre, genre) as any);
    if (artistId) conditions.push(eq(tracksTable.artistId, parseInt(artistId)) as any);
    if (search) conditions.push(sql`${tracksTable.title} ILIKE ${'%' + search + '%'}` as any);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(tracksTable)
      .where(whereClause);

    const tracks = await db
      .select()
      .from(tracksTable)
      .where(whereClause)
      .orderBy(desc(tracksTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    const formatted = await Promise.all(tracks.map(t => formatTrack(t, req.user?.id)));
    const total = countResult?.count ?? 0;

    res.json({
      tracks: formatted,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error({ err }, "List tracks error");
    res.status(500).json({ error: "Failed to fetch tracks" });
  }
});

// GET /api/tracks/:id
router.get("/tracks/:id", optionalAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid track ID" });
    return;
  }

  try {
    const [track] = await db.select().from(tracksTable).where(eq(tracksTable.id, id)).limit(1);
    if (!track) {
      res.status(404).json({ error: "Track not found" });
      return;
    }

    res.json(await formatTrack(track, req.user?.id));
  } catch (err) {
    req.log.error({ err }, "Get track error");
    res.status(500).json({ error: "Failed to fetch track" });
  }
});

// POST /api/tracks/:id/like
router.post("/tracks/:id/like", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid track ID" });
    return;
  }

  try {
    const [existing] = await db
      .select({ id: trackLikesTable.id })
      .from(trackLikesTable)
      .where(and(eq(trackLikesTable.trackId, id), eq(trackLikesTable.userId, req.user!.id)))
      .limit(1);

    if (!existing) {
      await db.insert(trackLikesTable).values({ trackId: id, userId: req.user!.id });
      await db
        .update(tracksTable)
        .set({ likesCount: sql`${tracksTable.likesCount} + 1` })
        .where(eq(tracksTable.id, id));

      const [track] = await db.select().from(tracksTable).where(eq(tracksTable.id, id)).limit(1);
      if (track && track.artistId !== req.user!.id) {
        await db.insert(notificationsTable).values({
          userId: track.artistId,
          type: "like",
          message: `${req.user!.username} liked your track`,
          link: `/tracks/${id}`,
          isRead: false,
        });
      }
    }

    res.json({ message: "Liked" });
  } catch (err) {
    req.log.error({ err }, "Like track error");
    res.status(500).json({ error: "Failed to like track" });
  }
});

// DELETE /api/tracks/:id/like
router.delete("/tracks/:id/like", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid track ID" });
    return;
  }

  try {
    const deleted = await db
      .delete(trackLikesTable)
      .where(and(eq(trackLikesTable.trackId, id), eq(trackLikesTable.userId, req.user!.id)))
      .returning();

    if (deleted.length > 0) {
      await db
        .update(tracksTable)
        .set({ likesCount: sql`GREATEST(${tracksTable.likesCount} - 1, 0)` })
        .where(eq(tracksTable.id, id));
    }

    res.json({ message: "Unliked" });
  } catch (err) {
    req.log.error({ err }, "Unlike track error");
    res.status(500).json({ error: "Failed to unlike track" });
  }
});

const reportSchema = z.object({
  reason: z.string().min(1),
  details: z.string().optional(),
});

// POST /api/tracks/:id/report
router.post("/tracks/:id/report", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid track ID" });
    return;
  }

  const parsed = reportSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Reason is required" });
    return;
  }

  try {
    await db.insert(reportsTable).values({
      targetType: "track",
      targetId: id,
      reporterId: req.user!.id,
      reason: sanitizeInput(parsed.data.reason),
      details: parsed.data.details ? sanitizeInput(parsed.data.details) : null,
      status: "pending",
    });

    await createAuditLog({
      action: "TRACK_REPORTED",
      userId: req.user!.id,
      ipAddress: req.ip ?? null,
      details: `Track ${id} reported: ${parsed.data.reason}`,
    });

    res.json({ message: "Report submitted. Our moderation team will review it." });
  } catch (err) {
    req.log.error({ err }, "Report track error");
    res.status(500).json({ error: "Failed to submit report" });
  }
});

export default router;
