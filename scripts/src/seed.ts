import { db, usersTable, tracksTable, genresTable, discussionsTable, repliesTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const genres = [
  { name: "Tigrigna", color: "#8B1A1A" },
  { name: "Amharic", color: "#2D6A4F" },
  { name: "Habesha Kignit", color: "#E9C46A" },
  { name: "Tizita", color: "#9B2226" },
  { name: "Eskista", color: "#1B4332" },
  { name: "Modern Ethio-Pop", color: "#D4A017" },
  { name: "Eritrean Jazz", color: "#6D2B7E" },
  { name: "Gospel", color: "#3D405B" },
];

const artistsData = [
  {
    username: "teddy_afro",
    email: "teddy@habesha.com",
    displayName: "Teddy Afro",
    bio: "The voice of Ethiopia, bringing love and unity through music.",
    avatar: "https://i.pravatar.cc/150?img=52",
    role: "artist" as const,
    isVerified: true,
  },
  {
    username: "aster_aweke",
    email: "aster@habesha.com",
    displayName: "Aster Aweke",
    bio: "Ethiopia's golden voice, weaving stories through melody.",
    avatar: "https://i.pravatar.cc/150?img=47",
    role: "artist" as const,
    isVerified: true,
  },
  {
    username: "mulatu_astatke",
    email: "mulatu@habesha.com",
    displayName: "Mulatu Astatke",
    bio: "Pioneer of Ethio-jazz, blending African and Western sounds.",
    avatar: "https://i.pravatar.cc/150?img=58",
    role: "artist" as const,
    isVerified: true,
  },
  {
    username: "mahmoud_ahmed",
    email: "mahmoud@habesha.com",
    displayName: "Mahmoud Ahmed",
    bio: "Soul and groove legend of Ethiopian music.",
    avatar: "https://i.pravatar.cc/150?img=55",
    role: "artist" as const,
    isVerified: true,
  },
];

const tracksData = [
  {
    title: "Ethiopia (Tikdem)",
    genre: "Amharic",
    youtubeId: "Lx3P5Z2_vUQ",
    description: "An iconic ode to the motherland Ethiopia.",
    likesCount: 1250,
    commentsCount: 88,
    isTrending: true,
  },
  {
    title: "Habesha",
    genre: "Modern Ethio-Pop",
    youtubeId: "gHlXa-PGT6U",
    description: "Celebrating Habesha identity and culture.",
    likesCount: 970,
    commentsCount: 45,
    isTrending: true,
  },
  {
    title: "Kabu Kabu",
    genre: "Tigrigna",
    youtubeId: "y36bkmkFHiQ",
    description: "A beloved Tigrigna classic.",
    likesCount: 830,
    commentsCount: 62,
    isTrending: true,
  },
  {
    title: "Tizita",
    genre: "Tizita",
    youtubeId: "h59UEKJz6Vw",
    description: "The classical sound of Ethiopian nostalgia.",
    likesCount: 1100,
    commentsCount: 73,
    isTrending: true,
  },
  {
    title: "Fikir Eske Mekabir",
    genre: "Amharic",
    youtubeId: "Ps2ubrNZl50",
    description: "Love and longing in the Ethiopian tradition.",
    likesCount: 760,
    commentsCount: 34,
    isTrending: false,
  },
  {
    title: "Aynochi Lij",
    genre: "Habesha Kignit",
    youtubeId: "o1HdQe2WSGY",
    description: "Traditional Habesha rhythms and melodies.",
    likesCount: 540,
    commentsCount: 27,
    isTrending: false,
  },
  {
    title: "Yegna Lijoch",
    genre: "Modern Ethio-Pop",
    youtubeId: "ILJNKGiGg3c",
    description: "Modern Ethiopian pop for the next generation.",
    likesCount: 690,
    commentsCount: 51,
    isTrending: true,
  },
  {
    title: "Meskelo Fiyel",
    genre: "Gospel",
    youtubeId: "Zy5OxLEZMxU",
    description: "Spiritual journey through Ethiopian gospel.",
    likesCount: 480,
    commentsCount: 19,
    isTrending: false,
  },
  {
    title: "Dewel",
    genre: "Eritrean Jazz",
    youtubeId: "8oPxMVAcC5o",
    description: "Eritrean jazz fusion that transcends borders.",
    likesCount: 390,
    commentsCount: 22,
    isTrending: false,
  },
  {
    title: "Eskista Dance",
    genre: "Eskista",
    youtubeId: "M5b5u2QLSBA",
    description: "The traditional Eskista dance music.",
    likesCount: 720,
    commentsCount: 41,
    isTrending: true,
  },
];

const discussionsData = [
  {
    title: "How has Ethiopian music influenced global sounds?",
    content: "Ethiopian music, especially Ethio-jazz by Mulatu Astatke, has had a profound influence on global music. Jim Jarmusch even used his music in Broken Flowers. What do you think about the global reach of our music?",
    category: "Music Discussion",
  },
  {
    title: "Best Tigrigna artists of the decade?",
    content: "Looking to explore more Tigrigna music. Who are your top recommendations for Tigrigna artists born after 1990? I've been loving Wedi Tikabo but want to discover more.",
    category: "Recommendations",
  },
  {
    title: "Protecting Ethiopian music from copyright theft",
    content: "I've been noticing a lot of Ethiopian songs being used without permission on social media platforms. What can we do as a community to protect our artists' work? Let's discuss strategies.",
    category: "Community",
  },
  {
    title: "Scam alert: Fake \"music investment\" schemes targeting artists",
    content: "There have been reports of scammers targeting Ethiopian artists promising record deals and large advances. Always verify before signing anything. Stay safe community!",
    category: "Security Awareness",
    isPinned: true,
  },
];

async function seed() {
  console.log("🌱 Seeding database...");

  // Insert genres
  console.log("  Adding genres...");
  for (const genre of genres) {
    await db
      .insert(genresTable)
      .values(genre)
      .onConflictDoNothing();
  }

  // Create admin user
  console.log("  Creating admin user...");
  const adminHash = await bcrypt.hash("Admin@12345", 12);
  const [admin] = await db
    .insert(usersTable)
    .values({
      username: "admin",
      email: "admin@habesha.com",
      passwordHash: adminHash,
      displayName: "HabeshaShield Admin",
      role: "admin",
      isVerified: true,
    })
    .onConflictDoNothing()
    .returning();

  // Create artists
  console.log("  Creating artists...");
  const artistPassword = await bcrypt.hash("Artist@12345", 12);
  const artistIds: number[] = [];

  for (const artist of artistsData) {
    const [a] = await db
      .insert(usersTable)
      .values({ ...artist, passwordHash: artistPassword })
      .onConflictDoNothing()
      .returning();
    if (a) artistIds.push(a.id);
  }

  if (artistIds.length === 0) {
    console.log("  Artists already exist, skipping tracks...");
    console.log("✅ Seed complete (already seeded)");
    return;
  }

  // Create tracks — round-robin assign to artists
  console.log("  Creating tracks...");
  for (let i = 0; i < tracksData.length; i++) {
    const artistId = artistIds[i % artistIds.length]!;
    await db
      .insert(tracksTable)
      .values({ ...tracksData[i]!, artistId })
      .onConflictDoNothing();
  }

  // Create discussions (use admin or first artist)
  console.log("  Creating community discussions...");
  const authorId = admin?.id ?? artistIds[0]!;
  for (const disc of discussionsData) {
    const [d] = await db
      .insert(discussionsTable)
      .values({
        ...disc,
        authorId,
        isPinned: disc.isPinned ?? false,
        repliesCount: 0,
      })
      .onConflictDoNothing()
      .returning();

    if (d) {
      // Add a sample reply
      await db.insert(repliesTable).values({
        discussionId: d.id,
        authorId: artistIds[0]!,
        content: "Great topic! Thanks for bringing this to the community.",
      });
      await db
        .update(discussionsTable)
        .set({ repliesCount: 1 })
        .where(eq(discussionsTable.id, d.id));
    }
  }

  console.log("✅ Seed complete!");
  console.log("   Admin: admin@habesha.com / Admin@12345");
  console.log("   Artist example: teddy@habesha.com / Artist@12345");
}

seed().catch(console.error).finally(() => process.exit(0));
