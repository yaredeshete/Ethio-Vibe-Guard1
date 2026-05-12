import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";
import { optionalAuth } from "../middlewares/auth";

const router = Router();

function formatArtist(user: typeof usersTable.$inferSelect) {
  return {
    id: String(user.id),
    username: user.username,
    displayName: user.displayName ?? user.username,
    avatar: user.avatar,
    bio: user.bio,
    genre: user.genre ?? "Various",
    followersCount: user.followersCount,
    tracksCount: 0,
    isVerified: user.isVerified,
    isFeatured: user.isFeatured,
    createdAt: user.createdAt.toISOString(),
  };
}

// GET /api/artists
router.get("/artists", optionalAuth, async (req, res) => {
  const { genre, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(50, parseInt(limit) || 20);
  const offset = (pageNum - 1) * limitNum;

  try {
    const conditions = [eq(usersTable.role, "artist")];
    if (genre) conditions.push(eq(usersTable.genre, genre));
    if (search) conditions.push(
      sql`(${usersTable.username} ILIKE ${'%' + search + '%'} OR ${usersTable.displayName} ILIKE ${'%' + search + '%'})`
    );

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    const [countResult] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(usersTable)
      .where(whereClause);

    const artists = await db
      .select()
      .from(usersTable)
      .where(whereClause)
      .orderBy(sql`${usersTable.followersCount} DESC`)
      .limit(limitNum)
      .offset(offset);

    const total = countResult?.count ?? 0;
    res.json({
      artists: artists.map(formatArtist),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error({ err }, "List artists error");
    res.status(500).json({ error: "Failed to fetch artists" });
  }
});

// GET /api/artists/featured
router.get("/artists/featured", async (req, res) => {
  try {
    const artists = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.role, "artist"), eq(usersTable.isFeatured, true)))
      .orderBy(sql`${usersTable.followersCount} DESC`)
      .limit(8);

    res.json(artists.map(formatArtist));
  } catch (err) {
    req.log.error({ err }, "Featured artists error");
    res.status(500).json({ error: "Failed to fetch featured artists" });
  }
});

// GET /api/artists/:id
router.get("/artists/:id", optionalAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid artist ID" });
    return;
  }

  try {
    const [artist] = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, id), eq(usersTable.role, "artist")))
      .limit(1);

    if (!artist) {
      res.status(404).json({ error: "Artist not found" });
      return;
    }

    res.json(formatArtist(artist));
  } catch (err) {
    req.log.error({ err }, "Get artist error");
    res.status(500).json({ error: "Failed to fetch artist" });
  }
});

export default router;
