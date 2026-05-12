import { Router } from "express";
import { db, trackLikesTable, followsTable, notificationsTable, tracksTable, usersTable, auditLogsTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// GET /api/dashboard/summary
router.get("/dashboard/summary", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Count liked tracks
    const [likesCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(trackLikesTable)
      .where(eq(trackLikesTable.userId, userId));

    // Count following
    const [followingCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(followsTable)
      .where(eq(followsTable.followerId, userId));

    // Count unread notifications
    const [notifCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(notificationsTable)
      .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)));

    // Recent audit activity for this user (non-sensitive)
    const recentLogs = await db
      .select()
      .from(auditLogsTable)
      .where(eq(auditLogsTable.userId, userId))
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(5);

    const recentActivity = recentLogs.map((l) => ({
      id: String(l.id),
      type: l.action,
      message: l.action.replace(/_/g, " ").toLowerCase(),
      link: null,
      createdAt: l.createdAt.toISOString(),
    }));

    // Recommended tracks (trending tracks)
    const trendingTracks = await db
      .select()
      .from(tracksTable)
      .where(eq(tracksTable.isTrending, true))
      .orderBy(desc(tracksTable.likesCount))
      .limit(6);

    const recommendedTracks = await Promise.all(
      trendingTracks.map(async (track) => {
        const [artist] = await db
          .select({ username: usersTable.username, displayName: usersTable.displayName, avatar: usersTable.avatar })
          .from(usersTable)
          .where(eq(usersTable.id, track.artistId))
          .limit(1);

        const [like] = await db
          .select({ id: trackLikesTable.id })
          .from(trackLikesTable)
          .where(and(eq(trackLikesTable.trackId, track.id), eq(trackLikesTable.userId, userId)))
          .limit(1);

        return {
          id: String(track.id),
          title: track.title,
          artistId: String(track.artistId),
          artistName: artist?.displayName ?? artist?.username ?? "Unknown",
          artistAvatar: artist?.avatar ?? null,
          genre: track.genre,
          youtubeId: track.youtubeId,
          thumbnail: track.thumbnail ?? `https://img.youtube.com/vi/${track.youtubeId}/hqdefault.jpg`,
          description: track.description,
          likesCount: track.likesCount,
          commentsCount: track.commentsCount,
          isLiked: !!like,
          isTrending: track.isTrending,
          createdAt: track.createdAt.toISOString(),
        };
      })
    );

    res.json({
      likedTracksCount: likesCount?.count ?? 0,
      followingCount: followingCount?.count ?? 0,
      notificationsCount: notifCount?.count ?? 0,
      recentActivity,
      recommendedTracks,
    });
  } catch (err) {
    req.log.error({ err }, "Dashboard summary error");
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

export default router;
