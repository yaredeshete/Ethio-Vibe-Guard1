import { db, usersTable, tracksTable, genresTable, discussionsTable, repliesTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Genres
// ---------------------------------------------------------------------------
const genres = [
  { name: "Amharic", color: "#8B1A1A" },
  { name: "Tigrigna", color: "#2D6A4F" },
  { name: "Ethio-Jazz", color: "#E9C46A" },
  { name: "Tizita", color: "#9B2226" },
  { name: "Eskista", color: "#1B4332" },
  { name: "Modern Ethio-Pop", color: "#D4A017" },
  { name: "Eritrean Music", color: "#6D2B7E" },
  { name: "Gospel", color: "#3D405B" },
  { name: "Reggae Fusion", color: "#228B22" },
  { name: "Electronic Fusion", color: "#1A237E" },
  { name: "Traditional", color: "#795548" },
  { name: "Soul & R&B", color: "#880E4F" },
];

// ---------------------------------------------------------------------------
// Artists  (accurate Wikipedia photos where available)
// ---------------------------------------------------------------------------
const artistsData = [
  {
    username: "teddy_afro",
    email: "teddy@ethiowave.com",
    displayName: "Teddy Afro",
    bio: "Tewodros Kassahun, known as Teddy Afro, is Ethiopia's most celebrated modern artist. His patriotic anthems and love songs have defined a generation.",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Teddy_Afro.jpg/400px-Teddy_Afro.jpg",
    genre: "Amharic",
    isVerified: true,
    isFeatured: true,
  },
  {
    username: "aster_aweke",
    email: "aster@ethiowave.com",
    displayName: "Aster Aweke",
    bio: "One of Africa's greatest vocalists, Aster Aweke has captivated audiences worldwide with her soulful voice and powerful storytelling.",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Aster_Aweke.jpg/400px-Aster_Aweke.jpg",
    genre: "Soul & R&B",
    isVerified: true,
    isFeatured: true,
  },
  {
    username: "mulatu_astatke",
    email: "mulatu@ethiowave.com",
    displayName: "Mulatu Astatke",
    bio: "The father of Ethio-Jazz, Mulatu Astatke pioneered a genre by blending Ethiopian scales with jazz, jazz and Latin music in the 1960s–70s.",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Mulatu_Astatke.jpg/400px-Mulatu_Astatke.jpg",
    genre: "Ethio-Jazz",
    isVerified: true,
    isFeatured: true,
  },
  {
    username: "mahmoud_ahmed",
    email: "mahmoud@ethiowave.com",
    displayName: "Mahmoud Ahmed",
    bio: "A legendary Ethiopian vocalist known for his soulful voice, Mahmoud Ahmed has been performing since the 1960s and remains an icon.",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Mahmoud_Ahmed.jpg/400px-Mahmoud_Ahmed.jpg",
    genre: "Soul & R&B",
    isVerified: true,
    isFeatured: true,
  },
  {
    username: "tilahun_gessesse",
    email: "tilahun@ethiowave.com",
    displayName: "Tilahun Gessesse",
    bio: "Revered as 'The Voice of Ethiopia', Tilahun Gessesse was one of the most beloved Ethiopian musicians of the 20th century.",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Tilahun_Gessesse.jpg/400px-Tilahun_Gessesse.jpg",
    genre: "Traditional",
    isVerified: true,
    isFeatured: false,
  },
  {
    username: "gigi_shibabaw",
    email: "gigi@ethiowave.com",
    displayName: "Gigi",
    bio: "Ejigayehu 'Gigi' Shibabaw is an internationally acclaimed Ethiopian singer, weaving Ethiopian traditional music with world and jazz influences.",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Gigi_at_SXSW.jpg/400px-Gigi_at_SXSW.jpg",
    genre: "Ethio-Jazz",
    isVerified: true,
    isFeatured: false,
  },
  {
    username: "alemayehu_eshete",
    email: "alemayehu@ethiowave.com",
    displayName: "Alemayehu Eshete",
    bio: "Known as the 'Ethiopian Elvis', Alemayehu Eshete brought a raw, soulful energy to Ethiopian pop music during the golden era of the 1960s-70s.",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Alemayehu_Eshete.jpg/400px-Alemayehu_Eshete.jpg",
    genre: "Soul & R&B",
    isVerified: true,
    isFeatured: false,
  },
  {
    username: "betty_g",
    email: "betty@ethiowave.com",
    displayName: "Betty G",
    bio: "Bethlehem Girma, known as Betty G, is one of Ethiopia's leading contemporary pop artists, blending modern R&B with traditional Ethiopian sounds.",
    avatar: "https://i.pravatar.cc/400?img=25",
    genre: "Modern Ethio-Pop",
    isVerified: true,
    isFeatured: true,
  },
  {
    username: "gossaye_tesfaye",
    email: "gossaye@ethiowave.com",
    displayName: "Gossaye Tesfaye",
    bio: "Gossaye Tesfaye is a prominent Ethiopian singer-songwriter known for his emotionally charged ballads and energetic performances.",
    avatar: "https://i.pravatar.cc/400?img=12",
    genre: "Modern Ethio-Pop",
    isVerified: true,
    isFeatured: false,
  },
  {
    username: "eyob_mekonnen",
    email: "eyob@ethiowave.com",
    displayName: "Eyob Mekonnen",
    bio: "Eyob Mekonnen is a celebrated Ethiopian singer and songwriter with a powerful voice who has won numerous awards in the Ethiopian music industry.",
    avatar: "https://i.pravatar.cc/400?img=33",
    genre: "Amharic",
    isVerified: true,
    isFeatured: false,
  },
  {
    username: "neway_debebe",
    email: "neway@ethiowave.com",
    displayName: "Neway Debebe",
    bio: "Neway Debebe is a legendary Ethiopian singer known for his romantic and patriotic songs that have touched millions of hearts.",
    avatar: "https://i.pravatar.cc/400?img=65",
    genre: "Traditional",
    isVerified: true,
    isFeatured: false,
  },
  {
    username: "haile_roots",
    email: "haile.roots@ethiowave.com",
    displayName: "Haile Roots",
    bio: "Haile Roots is an Ethiopian reggae artist who blends traditional Ethiopian sounds with reggae rhythms, creating a unique genre-defying sound.",
    avatar: "https://i.pravatar.cc/400?img=56",
    genre: "Reggae Fusion",
    isVerified: true,
    isFeatured: false,
  },
  {
    username: "rophnan_nati",
    email: "rophnan@ethiowave.com",
    displayName: "Rophnan",
    bio: "Rophnan Nati is a pioneering Ethiopian electronic music producer who creates cutting-edge sound that bridges contemporary electronic music with Ethiopian roots.",
    avatar: "https://i.pravatar.cc/400?img=38",
    genre: "Electronic Fusion",
    isVerified: true,
    isFeatured: false,
  },
  {
    username: "zeritu_kebede",
    email: "zeritu@ethiowave.com",
    displayName: "Zeritu Kebede",
    bio: "Zeritu Kebede is a beloved Ethiopian singer known for her captivating vocal performances and deep connection with audiences.",
    avatar: "https://i.pravatar.cc/400?img=47",
    genre: "Modern Ethio-Pop",
    isVerified: true,
    isFeatured: false,
  },
  {
    username: "dawit_tsige",
    email: "dawit.tsige@ethiowave.com",
    displayName: "Dawit Tsige",
    bio: "Dawit Tsige is an award-winning Ethiopian pop and R&B artist celebrated for his smooth vocals and sophisticated music productions.",
    avatar: "https://i.pravatar.cc/400?img=22",
    genre: "Modern Ethio-Pop",
    isVerified: true,
    isFeatured: false,
  },
  {
    username: "wedi_tikabo",
    email: "wedi.tikabo@ethiowave.com",
    displayName: "Wedi Tikabo",
    bio: "Wedi Tikabo is a legendary Eritrean singer and one of the most celebrated Tigrigna music artists, known for his soulful voice and energetic performances.",
    avatar: "https://i.pravatar.cc/400?img=71",
    genre: "Tigrigna",
    isVerified: true,
    isFeatured: false,
  },
  {
    username: "eden_habtezion",
    email: "eden@ethiowave.com",
    displayName: "Eden Habtezion",
    bio: "Eden Habtezion is a prominent Eritrean-Ethiopian singer whose powerful voice and emotive Tigrigna music have earned her a huge fan following.",
    avatar: "https://i.pravatar.cc/400?img=44",
    genre: "Tigrigna",
    isVerified: true,
    isFeatured: false,
  },
  {
    username: "tewelde_reda",
    email: "tewelde@ethiowave.com",
    displayName: "Tewelde Reda",
    bio: "Tewelde Reda is a celebrated Eritrean artist known for his meaningful Tigrigna songs that speak to the heart of Habesha culture.",
    avatar: "https://i.pravatar.cc/400?img=61",
    genre: "Tigrigna",
    isVerified: false,
    isFeatured: false,
  },
  {
    username: "getish_mamo",
    email: "getish@ethiowave.com",
    displayName: "Getish Mamo",
    bio: "Getish Mamo is an emerging Ethiopian artist who brings fresh energy to the Ethiopian music scene with his modern sound and captivating performances.",
    avatar: "https://i.pravatar.cc/400?img=30",
    genre: "Modern Ethio-Pop",
    isVerified: false,
    isFeatured: false,
  },
  {
    username: "bizunesh_bekele",
    email: "bizunesh@ethiowave.com",
    displayName: "Bizunesh Bekele",
    bio: "Bizunesh Bekele is one of Ethiopia's most beloved traditional singers, preserving and celebrating the rich musical heritage of Ethiopia.",
    avatar: "https://i.pravatar.cc/400?img=48",
    genre: "Traditional",
    isVerified: true,
    isFeatured: false,
  },
];

// ---------------------------------------------------------------------------
// Tracks  (50+ songs with verified YouTube IDs)
// ---------------------------------------------------------------------------
const tracksData = [
  // Teddy Afro
  { artistUsername: "teddy_afro", title: "Ethiopia (Tikdem)", genre: "Amharic", youtubeId: "2VNvWghJJFs", description: "Teddy Afro's iconic patriotic anthem celebrating the beauty of Ethiopia.", likesCount: 14820, commentsCount: 342, isTrending: true },
  { artistUsername: "teddy_afro", title: "Haile Haile", genre: "Amharic", youtubeId: "mqN3H-qsYoE", description: "A soulful tribute song by Ethiopia's most beloved modern artist.", likesCount: 11340, commentsCount: 287, isTrending: true },
  { artistUsername: "teddy_afro", title: "Abebayehosh", genre: "Amharic", youtubeId: "eY05LIPMBjM", description: "One of Teddy Afro's most romantic and enduring love songs.", likesCount: 9870, commentsCount: 201, isTrending: true },
  { artistUsername: "teddy_afro", title: "Tikur Sew", genre: "Amharic", youtubeId: "xKrw9LIkAeU", description: "A celebration of Ethiopian identity and African heritage.", likesCount: 7650, commentsCount: 165, isTrending: false },
  { artistUsername: "teddy_afro", title: "Gual", genre: "Amharic", youtubeId: "y-eCSXFIpBs", description: "A heartfelt ballad from Teddy Afro's acclaimed discography.", likesCount: 5430, commentsCount: 98, isTrending: false },
  { artistUsername: "teddy_afro", title: "Lambadina", genre: "Amharic", youtubeId: "tazS5K2Nr7k", description: "Teddy Afro blends modern pop with traditional Ethiopian melodies.", likesCount: 4210, commentsCount: 73, isTrending: false },
  { artistUsername: "teddy_afro", title: "Kal Bel", genre: "Amharic", youtubeId: "PkOstq4GuLk", description: "An upbeat track showcasing Teddy Afro's versatile musical style.", likesCount: 3890, commentsCount: 61, isTrending: false },

  // Aster Aweke
  { artistUsername: "aster_aweke", title: "Kabu", genre: "Soul & R&B", youtubeId: "w575kDhPBGw", description: "Aster Aweke's signature song that launched her international career.", likesCount: 12300, commentsCount: 278, isTrending: true },
  { artistUsername: "aster_aweke", title: "Tizita", genre: "Tizita", youtubeId: "ofEVj5WmebM", description: "A deeply moving rendition of Ethiopia's most expressive musical form — nostalgia and longing.", likesCount: 10450, commentsCount: 234, isTrending: true },
  { artistUsername: "aster_aweke", title: "Abet Abet", genre: "Soul & R&B", youtubeId: "brUdpxm-3ds", description: "A powerful vocal performance showing Aster Aweke's extraordinary range.", likesCount: 7890, commentsCount: 145, isTrending: false },
  { artistUsername: "aster_aweke", title: "Sewnet", genre: "Soul & R&B", youtubeId: "HV8yhlKr1ic", description: "An emotive track exploring themes of love and longing.", likesCount: 5670, commentsCount: 112, isTrending: false },
  { artistUsername: "aster_aweke", title: "Endelkew", genre: "Soul & R&B", youtubeId: "IQaCJX5owBs", description: "Aster Aweke at her most captivating, weaving stories through song.", likesCount: 4320, commentsCount: 87, isTrending: false },

  // Mulatu Astatke
  { artistUsername: "mulatu_astatke", title: "Yekermo Sew", genre: "Ethio-Jazz", youtubeId: "jwdBRqIsVUY", description: "The most famous Ethio-jazz composition by Mulatu Astatke, featured in Jim Jarmusch's 'Broken Flowers'.", likesCount: 15600, commentsCount: 389, isTrending: true },
  { artistUsername: "mulatu_astatke", title: "Tezeta", genre: "Tizita", youtubeId: "Wy-v-FgiUD8", description: "A jazz interpretation of the classic Ethiopian Tizita mode — bittersweet nostalgia.", likesCount: 11200, commentsCount: 267, isTrending: true },
  { artistUsername: "mulatu_astatke", title: "Munaye", genre: "Ethio-Jazz", youtubeId: "vjYKbdDLtBA", description: "Mulatu Astatke showcases the unique pentatonic scales of Ethiopian music in this jazz masterpiece.", likesCount: 8340, commentsCount: 178, isTrending: false },

  // Mahmoud Ahmed
  { artistUsername: "mahmoud_ahmed", title: "Ere Mela Mela", genre: "Soul & R&B", youtubeId: "6UbITQT4ZFE", description: "Mahmoud Ahmed's most iconic song — a timeless classic of Ethiopian soul music.", likesCount: 13400, commentsCount: 312, isTrending: true },
  { artistUsername: "mahmoud_ahmed", title: "Almaz", genre: "Soul & R&B", youtubeId: "U5e_GFTVuq4", description: "A deeply soulful love song from the legendary Mahmoud Ahmed.", likesCount: 7890, commentsCount: 156, isTrending: false },

  // Betty G
  { artistUsername: "betty_g", title: "Lij Nesh", genre: "Modern Ethio-Pop", youtubeId: "ljwI9MlWv3o", description: "Betty G's chart-topping hit that blends modern R&B with Ethiopian rhythms.", likesCount: 16800, commentsCount: 423, isTrending: true },
  { artistUsername: "betty_g", title: "Habesha", genre: "Modern Ethio-Pop", youtubeId: "9Qz8t3MCSaU", description: "A celebration of Habesha pride and culture set to an infectious modern beat.", likesCount: 12300, commentsCount: 298, isTrending: true },
  { artistUsername: "betty_g", title: "Yene Geta", genre: "Modern Ethio-Pop", youtubeId: "NftFVqKjPPs", description: "Betty G delivers a powerful spiritual track with a contemporary sound.", likesCount: 8900, commentsCount: 187, isTrending: false },

  // Gossaye Tesfaye
  { artistUsername: "gossaye_tesfaye", title: "Gossaye - Official Video", genre: "Modern Ethio-Pop", youtubeId: "ohSNr4G1RU8", description: "Gossaye Tesfaye's breakout music video that won multiple Ethiopian music awards.", likesCount: 11200, commentsCount: 234, isTrending: true },
  { artistUsername: "gossaye_tesfaye", title: "Fikir Lib", genre: "Modern Ethio-Pop", youtubeId: "MMbK1Yyouk4", description: "A romantic ballad exploring the depths of love and devotion.", likesCount: 7650, commentsCount: 143, isTrending: false },
  { artistUsername: "gossaye_tesfaye", title: "Yene Lij", genre: "Modern Ethio-Pop", youtubeId: "eswNHw74KTI", description: "Gossaye Tesfaye's tender tribute to love and family.", likesCount: 6230, commentsCount: 118, isTrending: false },
  { artistUsername: "gossaye_tesfaye", title: "Muluken", genre: "Modern Ethio-Pop", youtubeId: "OQTUvLDlZFY", description: "An upbeat celebration of life and joy by this talented artist.", likesCount: 4560, commentsCount: 89, isTrending: false },

  // Eyob Mekonnen
  { artistUsername: "eyob_mekonnen", title: "Tikdem", genre: "Amharic", youtubeId: "-dPh_KrrbNI", description: "Eyob Mekonnen's powerful voice shines in this emotionally charged Ethiopian pop hit.", likesCount: 9870, commentsCount: 198, isTrending: true },
  { artistUsername: "eyob_mekonnen", title: "Hagere", genre: "Amharic", youtubeId: "Ddpd0s_x_Pg", description: "A patriotic song celebrating the beauty of the Ethiopian homeland.", likesCount: 7340, commentsCount: 152, isTrending: false },

  // Tilahun Gessesse
  { artistUsername: "tilahun_gessesse", title: "Tizita (Tilahun)", genre: "Tizita", youtubeId: "ROtoLqfdjuM", description: "A definitive interpretation of the Tizita musical form by the Voice of Ethiopia.", likesCount: 18900, commentsCount: 456, isTrending: true },
  { artistUsername: "tilahun_gessesse", title: "Addis Ababa Bete", genre: "Traditional", youtubeId: "_n5ab5ci-Jc", description: "Tilahun Gessesse's love letter to the Ethiopian capital city.", likesCount: 12600, commentsCount: 289, isTrending: false },
  { artistUsername: "tilahun_gessesse", title: "Welafen", genre: "Traditional", youtubeId: "a71uNruEXhc", description: "A classic Ethiopian song by one of the all-time legends of Ethiopian music.", likesCount: 9870, commentsCount: 212, isTrending: false },

  // Neway Debebe
  { artistUsername: "neway_debebe", title: "Neway - Classic", genre: "Traditional", youtubeId: "AWItTwGHBzg", description: "A timeless classic from the legendary Neway Debebe.", likesCount: 10240, commentsCount: 223, isTrending: false },
  { artistUsername: "neway_debebe", title: "Yetebela", genre: "Traditional", youtubeId: "m39lslv_AeI", description: "Neway Debebe's powerful voice carries deep emotion in this beloved song.", likesCount: 8790, commentsCount: 187, isTrending: false },
  { artistUsername: "neway_debebe", title: "Kalkidan", genre: "Traditional", youtubeId: "QpuGhUWtqF0", description: "A deeply moving song about promise and faith from this Ethiopian legend.", likesCount: 7230, commentsCount: 154, isTrending: false },
  { artistUsername: "neway_debebe", title: "Ethiopia (Neway)", genre: "Amharic", youtubeId: "9_yzlgD6d2w", description: "Neway Debebe's heartfelt tribute to his beloved homeland.", likesCount: 6540, commentsCount: 132, isTrending: false },

  // Haile Roots
  { artistUsername: "haile_roots", title: "Haile Roots Live", genre: "Reggae Fusion", youtubeId: "yTZxQ-Ou_TA", description: "Haile Roots brings Ethiopian culture and reggae together in this vibrant performance.", likesCount: 7890, commentsCount: 167, isTrending: true },
  { artistUsername: "haile_roots", title: "Saba", genre: "Reggae Fusion", youtubeId: "DERr9B2ib5M", description: "A reggae-infused track celebrating the Queen of Sheba and Ethiopian heritage.", likesCount: 6230, commentsCount: 134, isTrending: false },
  { artistUsername: "haile_roots", title: "Lalibela", genre: "Reggae Fusion", youtubeId: "rr94RSsaeU0", description: "A spiritual journey through the rock-hewn churches of Lalibela in song.", likesCount: 5450, commentsCount: 112, isTrending: false },

  // Gigi
  { artistUsername: "gigi_shibabaw", title: "Illuminated", genre: "Ethio-Jazz", youtubeId: "f_NDQVnKCng", description: "Gigi's acclaimed world music album brought Ethiopian sounds to international stages.", likesCount: 13400, commentsCount: 298, isTrending: true },
  { artistUsername: "gigi_shibabaw", title: "Saba (Gigi)", genre: "Ethio-Jazz", youtubeId: "W7Bvv-88vx8", description: "Gigi blends jazz, blues and Ethiopian musical traditions in this stunning track.", likesCount: 9870, commentsCount: 212, isTrending: false },

  // Rophnan
  { artistUsername: "rophnan_nati", title: "Rophnan - Electronic", genre: "Electronic Fusion", youtubeId: "sPrZBK-vATg", description: "Rophnan Nati's groundbreaking electronic sound infused with Ethiopian musical elements.", likesCount: 10230, commentsCount: 234, isTrending: true },
  { artistUsername: "rophnan_nati", title: "Sheger", genre: "Electronic Fusion", youtubeId: "kUknTOgdWgk", description: "A tribute to the city of Addis Ababa through electronic music and Ethiopian rhythms.", likesCount: 8760, commentsCount: 189, isTrending: false },
  { artistUsername: "rophnan_nati", title: "Meseret", genre: "Electronic Fusion", youtubeId: "xIVv3-WCv4s", description: "Rophnan fuses traditional Ethiopian ceremonial music with contemporary production.", likesCount: 7230, commentsCount: 156, isTrending: false },

  // Alemayehu Eshete
  { artistUsername: "alemayehu_eshete", title: "Alemayehu Classic", genre: "Soul & R&B", youtubeId: "6nybsPdN5ek", description: "Alemayehu Eshete — the Ethiopian Elvis — at his soulful best.", likesCount: 11200, commentsCount: 245, isTrending: false },

  // Bizunesh Bekele
  { artistUsername: "bizunesh_bekele", title: "Bizunesh Classic", genre: "Traditional", youtubeId: "d8BdXzg9AMQ", description: "Bizunesh Bekele preserves and celebrates Ethiopia's rich traditional musical heritage.", likesCount: 8340, commentsCount: 178, isTrending: false },

  // Dawit Tsige
  { artistUsername: "dawit_tsige", title: "Dawit Tsige - Official", genre: "Modern Ethio-Pop", youtubeId: "MKnUGdpG5RU", description: "Award-winning modern Ethiopian pop from Dawit Tsige.", likesCount: 9780, commentsCount: 201, isTrending: false },
  { artistUsername: "dawit_tsige", title: "Betezem", genre: "Modern Ethio-Pop", youtubeId: "eNXsibPXqu4", description: "Dawit Tsige showcases his smooth R&B vocal style in this popular track.", likesCount: 7560, commentsCount: 163, isTrending: false },
  { artistUsername: "dawit_tsige", title: "Amelework", genre: "Modern Ethio-Pop", youtubeId: "wqeLpmthFY4", description: "A beautiful love song highlighting Dawit Tsige's songwriting prowess.", likesCount: 6320, commentsCount: 134, isTrending: false },

  // Zeritu Kebede
  { artistUsername: "zeritu_kebede", title: "Zeritu - Official", genre: "Modern Ethio-Pop", youtubeId: "h6szR48vovo", description: "Zeritu Kebede's powerful voice captivates in this modern Ethiopian hit.", likesCount: 12450, commentsCount: 267, isTrending: true },
  { artistUsername: "zeritu_kebede", title: "New Yemilew", genre: "Modern Ethio-Pop", youtubeId: "3q2SQub5KBg", description: "A deeply moving ballad from one of Ethiopia's most respected female artists.", likesCount: 9870, commentsCount: 212, isTrending: false },
  { artistUsername: "zeritu_kebede", title: "Yigremagne", genre: "Modern Ethio-Pop", youtubeId: "cQbvrcuhP_s", description: "Zeritu Kebede delivers another emotional performance in this heartfelt song.", likesCount: 7230, commentsCount: 154, isTrending: false },

  // Eden Habtezion
  { artistUsername: "eden_habtezion", title: "Eden Tigrigna Hit", genre: "Tigrigna", youtubeId: "CGteduEW554", description: "Eden Habtezion's powerful Tigrigna music connects diaspora communities around the world.", likesCount: 8340, commentsCount: 178, isTrending: false },
  { artistUsername: "eden_habtezion", title: "Dehai", genre: "Tigrigna", youtubeId: "JAW8wmp5yMk", description: "A moving tribute to Eritrean and Ethiopian cultural heritage through Tigrigna song.", likesCount: 6780, commentsCount: 145, isTrending: false },

  // Wedi Tikabo
  { artistUsername: "wedi_tikabo", title: "Wedi Tikabo Classic", genre: "Tigrigna", youtubeId: "C5Q0dUAEEJQ", description: "The King of Tigrigna music at his most powerful — a defining performance.", likesCount: 14500, commentsCount: 334, isTrending: true },
  { artistUsername: "wedi_tikabo", title: "Eritrea Special", genre: "Eritrean Music", youtubeId: "B3iySs56D7U", description: "Wedi Tikabo celebrates Eritrean culture and identity in this beloved song.", likesCount: 11200, commentsCount: 256, isTrending: false },
  { artistUsername: "wedi_tikabo", title: "Haw", genre: "Tigrigna", youtubeId: "YBC6Mz8wPpE", description: "A brotherly tribute from the legendary Wedi Tikabo.", likesCount: 9870, commentsCount: 212, isTrending: false },

  // Getish Mamo
  { artistUsername: "getish_mamo", title: "Getish Mamo - Official", genre: "Modern Ethio-Pop", youtubeId: "0BdzfKYo7Z8", description: "Emerging talent Getish Mamo brings fresh energy to Ethiopian pop music.", likesCount: 7890, commentsCount: 167, isTrending: false },
  { artistUsername: "getish_mamo", title: "Sheger (Getish)", genre: "Modern Ethio-Pop", youtubeId: "sxVTm04BloA", description: "Getish Mamo's ode to the vibrant capital city of Ethiopia.", likesCount: 6230, commentsCount: 134, isTrending: false },

  // Tewelde Reda
  { artistUsername: "tewelde_reda", title: "Tewelde Reda - Tigrigna", genre: "Tigrigna", youtubeId: "SbHRuGfSh8w", description: "Tewelde Reda's heartfelt Tigrigna music speaks to the cultural soul of the Habesha people.", likesCount: 7230, commentsCount: 156, isTrending: false },
];

// ---------------------------------------------------------------------------
// Discussions
// ---------------------------------------------------------------------------
const discussionsData = [
  {
    title: "How has Ethio-jazz influenced global music?",
    content: "Mulatu Astatke's Ethio-jazz has had a profound influence on global music. Jim Jarmusch used his music in 'Broken Flowers', and musicians worldwide have drawn inspiration from Ethiopia's unique pentatonic scales. What do you think about the global reach of our music?",
    category: "Music Discussion",
    isPinned: false,
  },
  {
    title: "Best Tigrigna songs of the decade — your picks?",
    content: "The Tigrigna music scene has been thriving. Wedi Tikabo, Eden Habtezion, and Tewelde Reda have all released amazing work. Who are your top picks for best Tigrigna songs from the last 10 years? I'd love to discover more artists.",
    category: "Recommendations",
    isPinned: false,
  },
  {
    title: "Teddy Afro's impact on Ethiopian national identity",
    content: "Teddy Afro's 'Ethiopia' has become almost a second national anthem. His music crosses political, ethnic, and generational divides in a way few artists can. How do you see his role in shaping modern Ethiopian identity through music?",
    category: "Music Discussion",
    isPinned: false,
  },
  {
    title: "⚠️ SCAM ALERT: Fake music investment schemes targeting artists",
    content: "There have been multiple reports of scammers targeting Ethiopian artists with fake record deals and large advances. They ask for upfront \"processing fees\" before payments that never come. NEVER pay money to receive money. Always verify companies through official channels. Please share this with any artists you know.",
    category: "Security Awareness",
    isPinned: true,
  },
  {
    title: "Betty G and the new generation of Ethiopian pop",
    content: "Betty G has completely transformed what Ethiopian pop can sound like. Her production quality, visual style, and fusion of modern R&B with traditional elements is inspiring a whole new generation. What are your favorite Betty G tracks and why?",
    category: "Music Discussion",
    isPinned: false,
  },
  {
    title: "Protecting Ethiopian artists from copyright theft online",
    content: "I've noticed many Ethiopian songs being uploaded without permission on social media platforms and YouTube. Many artists lose significant income this way. What can we do as a community to support proper attribution and protect artists' intellectual property?",
    category: "Community",
    isPinned: false,
  },
  {
    title: "Best Ethiopian music for diaspora community gatherings",
    content: "Looking for the perfect playlist for an Ethiopian cultural event. Need a mix of classic (Tilahun, Aster, Mahmoud Ahmed) and modern (Betty G, Gossaye, Zeritu). What songs never fail to get everyone up and celebrating?",
    category: "Recommendations",
    isPinned: false,
  },
  {
    title: "⚠️ Fake social media profiles impersonating Ethiopian artists",
    content: "Scammers are creating fake Facebook and Instagram profiles pretending to be famous Ethiopian artists like Teddy Afro and Betty G to collect money for fake concerts, merchandise, and collaborations. Always verify official accounts through the artist's verified channels. Report suspicious profiles immediately.",
    category: "Security Awareness",
    isPinned: true,
  },
];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------
async function seed() {
  console.log("🌱 EthioWave — Seeding database...\n");

  // Insert/update genres
  console.log("  📀 Adding genres...");
  for (const genre of genres) {
    await db.insert(genresTable).values(genre).onConflictDoNothing();
  }

  // Create admin user
  console.log("  👤 Creating admin user...");
  const adminHash = await bcrypt.hash("Admin@12345", 12);
  await db
    .insert(usersTable)
    .values({
      username: "admin",
      email: "admin@ethiowave.com",
      passwordHash: adminHash,
      displayName: "EthioWave Admin",
      role: "admin",
      isVerified: true,
      avatar: "https://ui-avatars.com/api/?name=EthioWave+Admin&background=8B1A1A&color=fff&size=200",
    })
    .onConflictDoNothing();

  // Create artists
  console.log("  🎤 Creating artists...");
  const artistPassword = await bcrypt.hash("Artist@12345", 12);

  for (const artist of artistsData) {
    await db
      .insert(usersTable)
      .values({
        username: artist.username,
        email: artist.email,
        passwordHash: artistPassword,
        displayName: artist.displayName,
        bio: artist.bio,
        avatar: artist.avatar,
        genre: artist.genre,
        role: "artist",
        isVerified: artist.isVerified,
        isFeatured: artist.isFeatured,
      })
      .onConflictDoUpdate({
        target: usersTable.username,
        set: {
          displayName: artist.displayName,
          bio: artist.bio,
          avatar: artist.avatar,
          genre: artist.genre,
          isVerified: artist.isVerified,
          isFeatured: artist.isFeatured,
        },
      });
  }

  // Get all artist IDs
  const artistUsers = await db
    .select({ id: usersTable.id, username: usersTable.username })
    .from(usersTable)
    .where(eq(usersTable.role, "artist"));

  const artistMap = new Map(artistUsers.map((a) => [a.username, a.id]));

  // Clear old tracks and insert new ones
  console.log("  🎵 Clearing old tracks and inserting new library...");
  await db.delete(tracksTable);

  let trackCount = 0;
  for (const track of tracksData) {
    const artistId = artistMap.get(track.artistUsername);
    if (!artistId) {
      console.warn(`  ⚠️  Artist not found: ${track.artistUsername}`);
      continue;
    }
    await db.insert(tracksTable).values({
      title: track.title,
      artistId,
      genre: track.genre,
      youtubeId: track.youtubeId,
      description: track.description,
      likesCount: track.likesCount,
      commentsCount: track.commentsCount,
      isTrending: track.isTrending,
    });
    trackCount++;
  }
  console.log(`  ✅ Inserted ${trackCount} tracks`);

  // Clear old discussions and insert new ones
  console.log("  💬 Clearing old discussions and inserting new ones...");
  await db.delete(repliesTable);
  await db.delete(discussionsTable);

  const adminUser = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, "admin"))
    .limit(1);
  const adminId = adminUser[0]?.id;

  const allArtistIds = [...artistMap.values()];

  for (const disc of discussionsData) {
    const authorId = adminId ?? allArtistIds[0]!;
    const [d] = await db
      .insert(discussionsTable)
      .values({
        title: disc.title,
        content: disc.content,
        category: disc.category,
        authorId,
        isPinned: disc.isPinned ?? false,
        repliesCount: 0,
      })
      .returning();

    if (d) {
      // Add sample replies from different artists
      const replier1 = allArtistIds[Math.floor(Math.random() * allArtistIds.length)]!;
      const replier2 = allArtistIds[Math.floor(Math.random() * allArtistIds.length)]!;

      await db.insert(repliesTable).values({
        discussionId: d.id,
        authorId: replier1,
        content: "Thank you for raising this important topic! The Ethiopian music community grows stronger when we share these conversations.",
      });

      await db.insert(repliesTable).values({
        discussionId: d.id,
        authorId: replier2,
        content: "Absolutely agree! Let's keep supporting our artists and celebrating our culture.",
      });

      await db.update(discussionsTable).set({ repliesCount: 2 }).where(eq(discussionsTable.id, d.id));
    }
  }

  console.log(`\n✅ Seed complete! EthioWave is ready.\n`);
  console.log("  Admin: admin@ethiowave.com / Admin@12345");
  console.log("  Artists: teddy_afro@ethiowave.com, aster_aweke@ethiowave.com ... / Artist@12345");
  console.log(`  Total tracks: ${trackCount}`);
  console.log(`  Total artists: ${artistsData.length}`);
}

seed().catch(console.error).finally(() => process.exit(0));
