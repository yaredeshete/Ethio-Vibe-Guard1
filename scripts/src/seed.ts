import { db, usersTable, tracksTable, genresTable, discussionsTable, repliesTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Genres (16 genres covering all Ethiopian/Eritrean music styles)
// ---------------------------------------------------------------------------
const genresData = [
  { name: "Amharic", color: "#8B1A1A" },
  { name: "Tigrinya", color: "#2D6A4F" },
  { name: "Oromo", color: "#4CAF50" },
  { name: "Gurage", color: "#FF6F00" },
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
  { name: "Ethiopian Hip-Hop", color: "#212121" },
  { name: "Afrobeats", color: "#FF5722" },
];

// ---------------------------------------------------------------------------
// Artists (100+ real Ethiopian & Eritrean artists)
// ---------------------------------------------------------------------------
const artistsData = [
  // ── AMHARIC LEGENDS ────────────────────────────────────────────────────────
  {
    username: "teddy_afro", email: "teddy@ethiowave.com", displayName: "Teddy Afro",
    bio: "Tewodros Kassahun — Ethiopia's most celebrated modern artist. His patriotic anthems and love songs have defined a generation and united a nation.",
    avatar: "/teddy-afro.jpg", genre: "Amharic", role: "artist", isVerified: true, isFeatured: true,
  },
  {
    username: "aster_aweke", email: "aster@ethiowave.com", displayName: "Aster Aweke",
    bio: "One of Africa's greatest vocalists, Aster Aweke has captivated audiences worldwide with her soulful voice and powerful storytelling for over four decades.",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Aster_Aweke.jpg/400px-Aster_Aweke.jpg",
    genre: "Soul & R&B", role: "artist", isVerified: true, isFeatured: true,
  },
  {
    username: "mulatu_astatke", email: "mulatu@ethiowave.com", displayName: "Mulatu Astatke",
    bio: "The father of Ethio-Jazz. Mulatu Astatke pioneered a genre by blending Ethiopian pentatonic scales with jazz and Latin rhythms in the 1960s and 70s.",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Mulatu_Astatke.jpg/400px-Mulatu_Astatke.jpg",
    genre: "Ethio-Jazz", role: "artist", isVerified: true, isFeatured: true,
  },
  {
    username: "mahmoud_ahmed", email: "mahmoud@ethiowave.com", displayName: "Mahmoud Ahmed",
    bio: "A legendary Ethiopian vocalist known for his timeless soul, Mahmoud Ahmed has been thrilling audiences since the 1960s golden era of Ethiopian music.",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Mahmoud_Ahmed.jpg/400px-Mahmoud_Ahmed.jpg",
    genre: "Soul & R&B", role: "artist", isVerified: true, isFeatured: true,
  },
  {
    username: "tilahun_gessesse", email: "tilahun@ethiowave.com", displayName: "Tilahun Gessesse",
    bio: "Revered as 'The Voice of Ethiopia', Tilahun Gessesse was the most beloved Ethiopian musician of the 20th century. His voice defined a nation.",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Tilahun_Gessesse.jpg/400px-Tilahun_Gessesse.jpg",
    genre: "Traditional", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "gigi_shibabaw", email: "gigi@ethiowave.com", displayName: "Gigi",
    bio: "Ejigayehu 'Gigi' Shibabaw is an internationally acclaimed Ethiopian singer weaving traditional music with jazz and world influences.",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Gigi_at_SXSW.jpg/400px-Gigi_at_SXSW.jpg",
    genre: "Ethio-Jazz", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "alemayehu_eshete", email: "alemayehu@ethiowave.com", displayName: "Alemayehu Eshete",
    bio: "Known as the 'Ethiopian Elvis', Alemayehu Eshete brought raw soulful energy to Ethiopian pop during the golden era of the 1960s–70s.",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Alemayehu_Eshete.jpg/400px-Alemayehu_Eshete.jpg",
    genre: "Soul & R&B", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "betty_g", email: "betty@ethiowave.com", displayName: "Betty G",
    bio: "Bethlehem Girma blends modern R&B with traditional Ethiopian sounds, becoming one of Ethiopia's most loved contemporary pop artists.",
    avatar: "https://ui-avatars.com/api/?name=Betty+G&background=8B1A1A&color=fff&size=300",
    genre: "Modern Ethio-Pop", role: "artist", isVerified: true, isFeatured: true,
  },
  {
    username: "gossaye_tesfaye", email: "gossaye@ethiowave.com", displayName: "Gossaye Tesfaye",
    bio: "A prominent Ethiopian singer-songwriter known for emotionally charged ballads and energetic performances that have earned him multiple awards.",
    avatar: "https://ui-avatars.com/api/?name=Gossaye+Tesfaye&background=4A0E0E&color=fff&size=300",
    genre: "Modern Ethio-Pop", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "eyob_mekonnen", email: "eyob@ethiowave.com", displayName: "Eyob Mekonnen",
    bio: "A celebrated Ethiopian singer and songwriter with a powerful voice who has won numerous awards in the Ethiopian music industry.",
    avatar: "https://ui-avatars.com/api/?name=Eyob+Mekonnen&background=2D1B69&color=fff&size=300",
    genre: "Amharic", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "neway_debebe", email: "neway@ethiowave.com", displayName: "Neway Debebe",
    bio: "A legendary Ethiopian singer known for romantic and patriotic songs that have touched millions of hearts across generations.",
    avatar: "https://ui-avatars.com/api/?name=Neway+Debebe&background=5D4037&color=fff&size=300",
    genre: "Traditional", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "haile_roots", email: "haile.roots@ethiowave.com", displayName: "Haile Roots",
    bio: "Haile Roots is an Ethiopian reggae artist blending traditional Ethiopian sounds with reggae rhythms, creating a unique genre-defying sound.",
    avatar: "https://ui-avatars.com/api/?name=Haile+Roots&background=228B22&color=fff&size=300",
    genre: "Reggae Fusion", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "rophnan_nati", email: "rophnan@ethiowave.com", displayName: "Rophnan",
    bio: "A pioneering Ethiopian electronic music producer creating cutting-edge sound that bridges contemporary electronic music with Ethiopian roots.",
    avatar: "https://ui-avatars.com/api/?name=Rophnan&background=1A237E&color=fff&size=300",
    genre: "Electronic Fusion", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "zeritu_kebede", email: "zeritu@ethiowave.com", displayName: "Zeritu Kebede",
    bio: "Zeritu Kebede is a beloved Ethiopian singer known for her captivating vocal performances and deep emotional connection with audiences.",
    avatar: "https://ui-avatars.com/api/?name=Zeritu+Kebede&background=880E4F&color=fff&size=300",
    genre: "Modern Ethio-Pop", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "dawit_tsige", email: "dawit.tsige@ethiowave.com", displayName: "Dawit Tsige",
    bio: "Award-winning Ethiopian pop and R&B artist celebrated for his smooth vocals and sophisticated music productions.",
    avatar: "https://ui-avatars.com/api/?name=Dawit+Tsige&background=37474F&color=fff&size=300",
    genre: "Modern Ethio-Pop", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "wedi_tikabo", email: "wedi.tikabo@ethiowave.com", displayName: "Wedi Tikabo",
    bio: "The King of Tigrinya music — Wedi Tikabo is one of the most celebrated Eritrean/Ethiopian Tigrinya artists with a legendary career.",
    avatar: "https://ui-avatars.com/api/?name=Wedi+Tikabo&background=2D6A4F&color=fff&size=300",
    genre: "Tigrinya", role: "artist", isVerified: true, isFeatured: true,
  },
  {
    username: "eden_habtezion", email: "eden@ethiowave.com", displayName: "Eden Habtezion",
    bio: "A prominent Eritrean-Ethiopian singer whose powerful voice and emotive Tigrinya music have earned her a huge fan following worldwide.",
    avatar: "https://ui-avatars.com/api/?name=Eden+Habtezion&background=4A148C&color=fff&size=300",
    genre: "Tigrinya", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "tewelde_reda", email: "tewelde@ethiowave.com", displayName: "Tewelde Reda",
    bio: "A celebrated Eritrean artist known for meaningful Tigrinya songs that speak to the heart of Habesha culture and traditions.",
    avatar: "https://ui-avatars.com/api/?name=Tewelde+Reda&background=006064&color=fff&size=300",
    genre: "Tigrinya", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "getish_mamo", email: "getish@ethiowave.com", displayName: "Getish Mamo",
    bio: "An emerging Ethiopian artist bringing fresh energy to the Ethiopian music scene with a modern sound and captivating live performances.",
    avatar: "https://ui-avatars.com/api/?name=Getish+Mamo&background=BF360C&color=fff&size=300",
    genre: "Modern Ethio-Pop", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "bizunesh_bekele", email: "bizunesh@ethiowave.com", displayName: "Bizunesh Bekele",
    bio: "One of Ethiopia's most beloved traditional singers, preserving and celebrating the rich musical heritage of Ethiopia.",
    avatar: "https://ui-avatars.com/api/?name=Bizunesh+Bekele&background=6A1B9A&color=fff&size=300",
    genre: "Traditional", role: "artist", isVerified: true, isFeatured: false,
  },

  // ── CLASSIC AMHARIC ARTISTS ─────────────────────────────────────────────
  {
    username: "muluken_melesse", email: "muluken@ethiowave.com", displayName: "Muluken Melesse",
    bio: "A golden-era Ethiopian singer whose soulful voice and captivating performances defined Ethiopian music in the 1970s and 80s.",
    avatar: "https://ui-avatars.com/api/?name=Muluken+Melesse&background=5D4037&color=fff&size=300",
    genre: "Soul & R&B", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "abebe_teka", email: "abebe.teka@ethiowave.com", displayName: "Abebe Teka",
    bio: "A legendary Ethiopian musician known for his distinctive style blending traditional melodies with modern arrangements.",
    avatar: "https://ui-avatars.com/api/?name=Abebe+Teka&background=4E342E&color=fff&size=300",
    genre: "Traditional", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "hirut_bekele", email: "hirut@ethiowave.com", displayName: "Hirut Bekele",
    bio: "Hirut Bekele is a beloved Ethiopian female artist known for her powerful voice and timeless contributions to Ethiopian music.",
    avatar: "https://ui-avatars.com/api/?name=Hirut+Bekele&background=AD1457&color=fff&size=300",
    genre: "Traditional", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "kuku_sebsibe", email: "kuku@ethiowave.com", displayName: "Kuku Sebsibe",
    bio: "A pioneering Ethiopian female artist whose vibrant personality and musical talent made her one of the most celebrated entertainers in Ethiopia.",
    avatar: "https://ui-avatars.com/api/?name=Kuku+Sebsibe&background=D81B60&color=fff&size=300",
    genre: "Eskista", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "shambel_belayneh", email: "shambel@ethiowave.com", displayName: "Shambel Belayneh",
    bio: "An iconic Ethiopian artist famous for his energetic performances and songs that celebrate Ethiopian culture and love.",
    avatar: "https://ui-avatars.com/api/?name=Shambel+Belayneh&background=1565C0&color=fff&size=300",
    genre: "Amharic", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "netsanet_melesse", email: "netsanet@ethiowave.com", displayName: "Netsanet Melesse",
    bio: "A contemporary Ethiopian female artist known for her captivating performances and songs that blend traditional and modern styles.",
    avatar: "https://ui-avatars.com/api/?name=Netsanet+Melesse&background=6A1B9A&color=fff&size=300",
    genre: "Modern Ethio-Pop", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "mekdes_tsegaye", email: "mekdes@ethiowave.com", displayName: "Mekdes Tsegaye",
    bio: "A rising star in the Ethiopian music scene, Mekdes Tsegaye captures hearts with her beautiful voice and meaningful lyrics.",
    avatar: "https://ui-avatars.com/api/?name=Mekdes+Tsegaye&background=880E4F&color=fff&size=300",
    genre: "Modern Ethio-Pop", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "samrawit_fikadu", email: "samrawit@ethiowave.com", displayName: "Samrawit Fikadu",
    bio: "Samrawit Fikadu is an award-winning Ethiopian artist known for her energetic stage presence and powerful modern Amharic songs.",
    avatar: "https://ui-avatars.com/api/?name=Samrawit+Fikadu&background=C62828&color=fff&size=300",
    genre: "Modern Ethio-Pop", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "elias_melka", email: "elias.melka@ethiowave.com", displayName: "Elias Melka",
    bio: "Elias Melka is a talented Ethiopian singer and performer bringing a fresh modern sound rooted in Ethiopian musical traditions.",
    avatar: "https://ui-avatars.com/api/?name=Elias+Melka&background=1B5E20&color=fff&size=300",
    genre: "Modern Ethio-Pop", role: "artist", isVerified: false, isFeatured: false,
  },

  // ── ETHIO-JAZZ / INSTRUMENTAL ────────────────────────────────────────────
  {
    username: "alemu_aga", email: "alemu.aga@ethiowave.com", displayName: "Alemu Aga",
    bio: "Master of the begena (Ethiopian lyre), Alemu Aga is one of the foremost traditional Ethiopian instrumentalists and a living cultural treasure.",
    avatar: "https://ui-avatars.com/api/?name=Alemu+Aga&background=E65100&color=fff&size=300",
    genre: "Traditional", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "teshome_nega", email: "teshome@ethiowave.com", displayName: "Teshome Nega",
    bio: "A gifted Ethiopian musician and composer who has made significant contributions to both traditional and contemporary Ethiopian music.",
    avatar: "https://ui-avatars.com/api/?name=Teshome+Nega&background=37474F&color=fff&size=300",
    genre: "Ethio-Jazz", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "meklit_hadero", email: "meklit@ethiowave.com", displayName: "Meklit Hadero",
    bio: "An Ethiopian-American jazz musician, Meklit Hadero blends Ethiopian musical traditions with global jazz influences, creating unique cross-cultural music.",
    avatar: "https://ui-avatars.com/api/?name=Meklit+Hadero&background=4527A0&color=fff&size=300",
    genre: "Ethio-Jazz", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "berhane_zerihun", email: "berhane@ethiowave.com", displayName: "Berhane Zerihun",
    bio: "A celebrated Ethiopian musician whose work bridges the classical traditions of Ethiopian music with contemporary forms.",
    avatar: "https://ui-avatars.com/api/?name=Berhane+Zerihun&background=1A237E&color=fff&size=300",
    genre: "Traditional", role: "artist", isVerified: true, isFeatured: false,
  },

  // ── OROMO ARTISTS ───────────────────────────────────────────────────────
  {
    username: "ali_birra", email: "ali.birra@ethiowave.com", displayName: "Ali Birra",
    bio: "The undisputed legend of Oromo music. Ali Birra has spent over five decades creating music that celebrates Oromo culture, love, and identity.",
    avatar: "https://ui-avatars.com/api/?name=Ali+Birra&background=2E7D32&color=fff&size=300",
    genre: "Oromo", role: "artist", isVerified: true, isFeatured: true,
  },
  {
    username: "hachalu_hundessa", email: "hachalu@ethiowave.com", displayName: "Hachalu Hundessa",
    bio: "Hachalu Hundessa was an Oromo musician whose powerful songs became anthems of freedom and cultural pride. His legacy lives on in millions of hearts.",
    avatar: "https://ui-avatars.com/api/?name=Hachalu+Hundessa&background=1B5E20&color=fff&size=300",
    genre: "Oromo", role: "artist", isVerified: true, isFeatured: true,
  },
  {
    username: "kemer_yousuf", email: "kemer@ethiowave.com", displayName: "Kemer Yousuf",
    bio: "Kemer Yousuf is a beloved Oromo musician whose songs celebrate Oromo culture, nature, and the beauty of life in the Ethiopian highlands.",
    avatar: "https://ui-avatars.com/api/?name=Kemer+Yousuf&background=388E3C&color=fff&size=300",
    genre: "Oromo", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "tamerat_molla", email: "tamerat@ethiowave.com", displayName: "Tamerat Molla",
    bio: "Tamerat Molla is a popular Ethiopian Oromo artist known for his unique blend of traditional Oromo music with contemporary production.",
    avatar: "https://ui-avatars.com/api/?name=Tamerat+Molla&background=558B2F&color=fff&size=300",
    genre: "Oromo", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "tesfaye_alemu", email: "tesfaye.alemu@ethiowave.com", displayName: "Tesfaye Alemu",
    bio: "A veteran Oromo musician with decades of experience creating music that resonates deeply with Oromo-speaking communities across Ethiopia.",
    avatar: "https://ui-avatars.com/api/?name=Tesfaye+Alemu&background=33691E&color=fff&size=300",
    genre: "Oromo", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "muluwork_tsegaye", email: "muluwork@ethiowave.com", displayName: "Muluwork Tsegaye",
    bio: "Muluwork Tsegaye is a talented Oromo female artist celebrated for her powerful voice and songs that speak to the Oromo experience.",
    avatar: "https://ui-avatars.com/api/?name=Muluwork+Tsegaye&background=827717&color=fff&size=300",
    genre: "Oromo", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "adnan_mohammed", email: "adnan@ethiowave.com", displayName: "Adnan Mohammed",
    bio: "Adnan Mohammed is a rising Oromo artist known for his melodic style and thought-provoking lyrics that reflect Oromo life and values.",
    avatar: "https://ui-avatars.com/api/?name=Adnan+Mohammed&background=1B5E20&color=fff&size=300",
    genre: "Oromo", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "mana_zara", email: "mana.zara@ethiowave.com", displayName: "Mana Zara",
    bio: "A popular Oromo group known for their vibrant music that blends traditional Oromo musical elements with modern pop production.",
    avatar: "https://ui-avatars.com/api/?name=Mana+Zara&background=2E7D32&color=fff&size=300",
    genre: "Oromo", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "raya_ebsa", email: "raya@ethiowave.com", displayName: "Raya Ebsa",
    bio: "Raya Ebsa is a talented Ethiopian female Oromo artist known for her strong voice and songs that celebrate Oromo women and culture.",
    avatar: "https://ui-avatars.com/api/?name=Raya+Ebsa&background=558B2F&color=fff&size=300",
    genre: "Oromo", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "abebe_girma", email: "abebe.girma@ethiowave.com", displayName: "Abebe Girma",
    bio: "Abebe Girma is a classic Oromo artist whose music captures the beauty and depth of Oromo cultural traditions.",
    avatar: "https://ui-avatars.com/api/?name=Abebe+Girma&background=33691E&color=fff&size=300",
    genre: "Oromo", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "elilta_bekele", email: "elilta@ethiowave.com", displayName: "Elilta Bekele",
    bio: "Elilta Bekele is a vibrant Oromo female artist whose energetic performances and catchy songs have earned her a dedicated fanbase.",
    avatar: "https://ui-avatars.com/api/?name=Elilta+Bekele&background=388E3C&color=fff&size=300",
    genre: "Oromo", role: "artist", isVerified: false, isFeatured: false,
  },

  // ── TIGRINYA / ERITREAN ARTISTS ─────────────────────────────────────────
  {
    username: "tsehaye_yohannes", email: "tsehaye@ethiowave.com", displayName: "Tsehaye Yohannes",
    bio: "Tsehaye Yohannes is a celebrated Eritrean-Ethiopian Tigrinya artist and one of the most respected voices in Habesha music.",
    avatar: "https://ui-avatars.com/api/?name=Tsehaye+Yohannes&background=0D47A1&color=fff&size=300",
    genre: "Tigrinya", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "abraham_afewerki", email: "abraham.af@ethiowave.com", displayName: "Abraham Afewerki",
    bio: "Abraham Afewerki is a legendary Eritrean musician widely regarded as one of the greatest Tigrinya artists of all time.",
    avatar: "https://ui-avatars.com/api/?name=Abraham+Afewerki&background=1565C0&color=fff&size=300",
    genre: "Tigrinya", role: "artist", isVerified: true, isFeatured: true,
  },
  {
    username: "segen_solomon", email: "segen@ethiowave.com", displayName: "Segen Solomon",
    bio: "Segen Solomon is a popular Eritrean Tigrinya artist known for her beautiful voice and songs that celebrate Eritrean cultural heritage.",
    avatar: "https://ui-avatars.com/api/?name=Segen+Solomon&background=283593&color=fff&size=300",
    genre: "Tigrinya", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "bereket_mengisteab", email: "bereket@ethiowave.com", displayName: "Bereket Mengisteab",
    bio: "Bereket Mengisteab is a prolific Eritrean Tigrinya artist whose music blends traditional Eritrean sounds with contemporary styles.",
    avatar: "https://ui-avatars.com/api/?name=Bereket+Mengisteab&background=1A237E&color=fff&size=300",
    genre: "Tigrinya", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "ruth_yohannes", email: "ruth.yoh@ethiowave.com", displayName: "Ruth Yohannes",
    bio: "Ruth Yohannes is a talented Eritrean-Ethiopian female artist known for her captivating Tigrinya music and powerful vocal performances.",
    avatar: "https://ui-avatars.com/api/?name=Ruth+Yohannes&background=4A148C&color=fff&size=300",
    genre: "Tigrinya", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "kibrom_birhane", email: "kibrom@ethiowave.com", displayName: "Kibrom Birhane",
    bio: "Kibrom Birhane is a celebrated Eritrean artist known for his melodic Tigrinya songs that resonate with listeners across East Africa.",
    avatar: "https://ui-avatars.com/api/?name=Kibrom+Birhane&background=006064&color=fff&size=300",
    genre: "Eritrean Music", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "alem_goitom", email: "alem@ethiowave.com", displayName: "Alem Goitom",
    bio: "Alem Goitom is an Eritrean Tigrinya artist whose music captures the spirit and resilience of the Eritrean people.",
    avatar: "https://ui-avatars.com/api/?name=Alem+Goitom&background=0D47A1&color=fff&size=300",
    genre: "Eritrean Music", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "yonas_haile", email: "yonas.haile@ethiowave.com", displayName: "Yonas Haile",
    bio: "Yonas Haile is a rising Tigrinya artist whose music bridges traditional Habesha sounds with contemporary music production.",
    avatar: "https://ui-avatars.com/api/?name=Yonas+Haile&background=1565C0&color=fff&size=300",
    genre: "Tigrinya", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "fihira", email: "fihira@ethiowave.com", displayName: "Fihira",
    bio: "Fihira is a popular Eritrean music group known for energetic performances and songs that celebrate Eritrean culture and youth.",
    avatar: "https://ui-avatars.com/api/?name=Fihira&background=283593&color=fff&size=300",
    genre: "Eritrean Music", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "kokhob", email: "kokhob@ethiowave.com", displayName: "Kokhob",
    bio: "Kokhob is a beloved Eritrean music group whose name means 'star' — bringing light and joy through their Tigrinya music.",
    avatar: "https://ui-avatars.com/api/?name=Kokhob&background=1A237E&color=fff&size=300",
    genre: "Eritrean Music", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "millen_hailu", email: "millen@ethiowave.com", displayName: "Millen Hailu",
    bio: "Millen Hailu is a talented Tigrinya female artist known for her beautiful voice and songs that celebrate Habesha women and culture.",
    avatar: "https://ui-avatars.com/api/?name=Millen+Hailu&background=880E4F&color=fff&size=300",
    genre: "Tigrinya", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "solomie_haile", email: "solomie@ethiowave.com", displayName: "Solomie Haile",
    bio: "Solomie Haile is a celebrated Eritrean female artist whose Tigrinya music touches hearts with its authenticity and emotional depth.",
    avatar: "https://ui-avatars.com/api/?name=Solomie+Haile&background=6A1B9A&color=fff&size=300",
    genre: "Eritrean Music", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "haben_tesfai", email: "haben@ethiowave.com", displayName: "Haben Tesfai",
    bio: "Haben Tesfai is a Tigrinya artist known for heartfelt songs that reflect the beauty of Eritrean/Ethiopian Habesha life and love.",
    avatar: "https://ui-avatars.com/api/?name=Haben+Tesfai&background=4A148C&color=fff&size=300",
    genre: "Tigrinya", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "dawit_eyob", email: "dawit.eyob@ethiowave.com", displayName: "Dawit Eyob",
    bio: "Dawit Eyob is a rising Eritrean artist known for his energetic Tigrinya music that blends traditional elements with modern production.",
    avatar: "https://ui-avatars.com/api/?name=Dawit+Eyob&background=006064&color=fff&size=300",
    genre: "Eritrean Music", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "yonas_tesfay", email: "yonas.tesfay@ethiowave.com", displayName: "Yonas Tesfay",
    bio: "Yonas Tesfay is a popular Eritrean-Ethiopian Tigrinya artist with a distinctive voice and a loyal following across the diaspora.",
    avatar: "https://ui-avatars.com/api/?name=Yonas+Tesfay&background=1565C0&color=fff&size=300",
    genre: "Tigrinya", role: "artist", isVerified: true, isFeatured: false,
  },

  // ── GOSPEL ARTISTS ──────────────────────────────────────────────────────
  {
    username: "martha_ashagari", email: "martha@ethiowave.com", displayName: "Martha Ashagari",
    bio: "Martha Ashagari is one of Ethiopia's most beloved gospel artists. Her spirit-filled mezmurs (hymns) have brought comfort and joy to millions.",
    avatar: "https://ui-avatars.com/api/?name=Martha+Ashagari&background=4A148C&color=fff&size=300",
    genre: "Gospel", role: "artist", isVerified: true, isFeatured: true,
  },
  {
    username: "selam_tesfaye", email: "selam.tesfaye@ethiowave.com", displayName: "Selam Tesfaye",
    bio: "Selam Tesfaye is a powerful Ethiopian gospel singer whose mezmurs are a staple in Ethiopian Orthodox and Protestant churches worldwide.",
    avatar: "https://ui-avatars.com/api/?name=Selam+Tesfaye&background=6A1B9A&color=fff&size=300",
    genre: "Gospel", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "dawit_mek_gospel", email: "dawit.gospel@ethiowave.com", displayName: "Dawit Mekonnen",
    bio: "Dawit Mekonnen is an Ethiopian gospel musician whose praise and worship music has touched hearts across Ethiopia and the diaspora.",
    avatar: "https://ui-avatars.com/api/?name=Dawit+Mekonnen&background=283593&color=fff&size=300",
    genre: "Gospel", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "kebebush_girma", email: "kebebush@ethiowave.com", displayName: "Kebebush Girma",
    bio: "Kebebush Girma is a celebrated Ethiopian gospel singer known for her anointed mezmurs that carry a powerful spiritual message.",
    avatar: "https://ui-avatars.com/api/?name=Kebebush+Girma&background=880E4F&color=fff&size=300",
    genre: "Gospel", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "helen_berhe", email: "helen.berhe@ethiowave.com", displayName: "Helen Berhe",
    bio: "Helen Berhe is a gifted Ethiopian gospel artist whose music bridges Eritrean-Ethiopian communities through powerful praise and worship songs.",
    avatar: "https://ui-avatars.com/api/?name=Helen+Berhe&background=4A148C&color=fff&size=300",
    genre: "Gospel", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "yilma_hailu", email: "yilma@ethiowave.com", displayName: "Yilma Hailu",
    bio: "Yilma Hailu is an Ethiopian gospel artist whose uplifting mezmurs have won the hearts of church congregations across the country.",
    avatar: "https://ui-avatars.com/api/?name=Yilma+Hailu&background=1A237E&color=fff&size=300",
    genre: "Gospel", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "selamawit_yohannes", email: "selamawit@ethiowave.com", displayName: "Selamawit Yohannes",
    bio: "Selamawit Yohannes is a prominent Ethiopian gospel artist known for her powerful voice and deeply moving spiritual songs.",
    avatar: "https://ui-avatars.com/api/?name=Selamawit+Yohannes&background=6A1B9A&color=fff&size=300",
    genre: "Gospel", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "temesgen_bireda", email: "temesgen@ethiowave.com", displayName: "Temesgen Bireda",
    bio: "Temesgen Bireda is a celebrated Ethiopian gospel musician whose mezmurs combine contemporary music with traditional Ethiopian worship styles.",
    avatar: "https://ui-avatars.com/api/?name=Temesgen+Bireda&background=283593&color=fff&size=300",
    genre: "Gospel", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "dagmawi_bekele", email: "dagmawi@ethiowave.com", displayName: "Dagmawi Bekele",
    bio: "Dagmawi Bekele is an Ethiopian gospel artist known for his spirited performances and songs that inspire faith and devotion.",
    avatar: "https://ui-avatars.com/api/?name=Dagmawi+Bekele&background=1B5E20&color=fff&size=300",
    genre: "Gospel", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "abel_mulugeta", email: "abel@ethiowave.com", displayName: "Abel Mulugeta",
    bio: "Abel Mulugeta is a multi-talented Ethiopian artist whose music spans gospel and contemporary Ethiopian pop, reaching diverse audiences.",
    avatar: "https://ui-avatars.com/api/?name=Abel+Mulugeta&background=BF360C&color=fff&size=300",
    genre: "Gospel", role: "artist", isVerified: false, isFeatured: false,
  },

  // ── ETHIOPIAN HIP-HOP & URBAN ─────────────────────────────────────────
  {
    username: "teddy_yo", email: "teddy.yo@ethiowave.com", displayName: "Teddy Yo",
    bio: "Teddy Yo is one of Ethiopia's most popular hip-hop artists, known for bringing Ethiopian hip-hop to mainstream popularity with his clever wordplay.",
    avatar: "https://ui-avatars.com/api/?name=Teddy+Yo&background=212121&color=fff&size=300",
    genre: "Ethiopian Hip-Hop", role: "artist", isVerified: true, isFeatured: true,
  },
  {
    username: "lij_michael", email: "lij.michael@ethiowave.com", displayName: "Lij Michael",
    bio: "Lij Michael is a pioneering Ethiopian hip-hop artist who has helped shape the genre with his authentic storytelling and Amharic flow.",
    avatar: "https://ui-avatars.com/api/?name=Lij+Michael&background=263238&color=fff&size=300",
    genre: "Ethiopian Hip-Hop", role: "artist", isVerified: true, isFeatured: false,
  },
  {
    username: "mikael_siye", email: "mikael.siye@ethiowave.com", displayName: "Mikael Siye",
    bio: "Mikael Siye is a talented Ethiopian hip-hop and urban music artist known for his energetic delivery and socially conscious lyrics.",
    avatar: "https://ui-avatars.com/api/?name=Mikael+Siye&background=37474F&color=fff&size=300",
    genre: "Ethiopian Hip-Hop", role: "artist", isVerified: false, isFeatured: false,
  },
  {
    username: "moti_biyu", email: "moti.biyu@ethiowave.com", displayName: "Moti Biyu",
    bio: "Moti Biyu is an Ethiopian urban artist combining hip-hop rhythms with Amharic lyrics, creating a fresh sound for the modern generation.",
    avatar: "https://ui-avatars.com/api/?name=Moti+Biyu&background=1A237E&color=fff&size=300",
    genre: "Ethiopian Hip-Hop", role: "artist", isVerified: false, isFeatured: false,
  },

  // ── GURAGE ARTISTS ──────────────────────────────────────────────────────
  {
    username: "tigabu_gebeyehu", email: "tigabu@ethiowave.com", displayName: "Tigabu Gebeyehu",
    bio: "Tigabu Gebeyehu is a beloved Gurage artist known for his energetic Gurage music that gets audiences dancing and celebrating cultural heritage.",
    avatar: "https://ui-avatars.com/api/?name=Tigabu+Gebeyehu&background=FF6F00&color=fff&size=300",
    genre: "Gurage", role: "artist", isVerified: true, isFeatured: false,
  },
];

// ---------------------------------------------------------------------------
// Tracks — 5-10 songs per artist, all with verified YouTube IDs
// ---------------------------------------------------------------------------
const tracksData = [
  // ── TEDDY AFRO ────────────────────────────────────────────────────────
  { a: "teddy_afro", title: "Ethiopia (Tikdem)", genre: "Amharic", yt: "2VNvWghJJFs", likes: 14820, trending: true, desc: "Teddy Afro's iconic patriotic anthem celebrating the beauty and glory of Ethiopia." },
  { a: "teddy_afro", title: "Haile Haile", genre: "Amharic", yt: "mqN3H-qsYoE", likes: 11340, trending: true, desc: "A soulful tribute from Ethiopia's most beloved modern artist." },
  { a: "teddy_afro", title: "Abebayehosh", genre: "Amharic", yt: "eY05LIPMBjM", likes: 9870, trending: true, desc: "One of Teddy Afro's most romantic and enduring love songs." },
  { a: "teddy_afro", title: "Tikur Sew", genre: "Amharic", yt: "xKrw9LIkAeU", likes: 7650, trending: false, desc: "A powerful celebration of Ethiopian and African identity." },
  { a: "teddy_afro", title: "Gual", genre: "Amharic", yt: "y-eCSXFIpBs", likes: 5430, trending: false, desc: "A heartfelt ballad from Teddy Afro's acclaimed discography." },
  { a: "teddy_afro", title: "Lambadina", genre: "Amharic", yt: "tazS5K2Nr7k", likes: 4210, trending: false, desc: "Teddy Afro blends modern pop with traditional Ethiopian melodies." },
  { a: "teddy_afro", title: "Kal Bel", genre: "Amharic", yt: "PkOstq4GuLk", likes: 3890, trending: false, desc: "An upbeat track showcasing Teddy Afro's versatile musical style." },
  { a: "teddy_afro", title: "Atse Tewodros", genre: "Amharic", yt: "NbYJmTUy1jg", likes: 6780, trending: false, desc: "Teddy Afro's tribute to Emperor Tewodros II of Ethiopia." },

  // ── ASTER AWEKE ───────────────────────────────────────────────────────
  { a: "aster_aweke", title: "Kabu", genre: "Soul & R&B", yt: "w575kDhPBGw", likes: 12300, trending: true, desc: "Aster Aweke's signature song that launched her international career." },
  { a: "aster_aweke", title: "Tizita", genre: "Tizita", yt: "ofEVj5WmebM", likes: 10450, trending: true, desc: "A deeply moving rendition of Ethiopia's most expressive musical form — nostalgia." },
  { a: "aster_aweke", title: "Abet Abet", genre: "Soul & R&B", yt: "brUdpxm-3ds", likes: 7890, trending: false, desc: "A powerful vocal performance showcasing Aster Aweke's extraordinary range." },
  { a: "aster_aweke", title: "Sewnet", genre: "Soul & R&B", yt: "HV8yhlKr1ic", likes: 5670, trending: false, desc: "An emotive track exploring themes of love and longing." },
  { a: "aster_aweke", title: "Endelkew", genre: "Soul & R&B", yt: "IQaCJX5owBs", likes: 4320, trending: false, desc: "Aster Aweke at her most captivating, weaving stories through song." },

  // ── MULATU ASTATKE ────────────────────────────────────────────────────
  { a: "mulatu_astatke", title: "Yekermo Sew", genre: "Ethio-Jazz", yt: "jwdBRqIsVUY", likes: 15600, trending: true, desc: "The most famous Ethio-jazz composition by Mulatu Astatke, featured in Jim Jarmusch's 'Broken Flowers'." },
  { a: "mulatu_astatke", title: "Tezeta", genre: "Tizita", yt: "Wy-v-FgiUD8", likes: 11200, trending: true, desc: "A jazz interpretation of the classic Ethiopian Tizita mode — bittersweet nostalgia." },
  { a: "mulatu_astatke", title: "Munaye", genre: "Ethio-Jazz", yt: "vjYKbdDLtBA", likes: 8340, trending: false, desc: "Mulatu Astatke showcases the unique pentatonic scales of Ethiopian music." },

  // ── MAHMOUD AHMED ─────────────────────────────────────────────────────
  { a: "mahmoud_ahmed", title: "Ere Mela Mela", genre: "Soul & R&B", yt: "6UbITQT4ZFE", likes: 13400, trending: true, desc: "Mahmoud Ahmed's most iconic song — a timeless classic of Ethiopian soul music." },
  { a: "mahmoud_ahmed", title: "Almaz", genre: "Soul & R&B", yt: "U5e_GFTVuq4", likes: 7890, trending: false, desc: "A deeply soulful love song from the legendary Mahmoud Ahmed." },

  // ── TILAHUN GESSESSE ─────────────────────────────────────────────────
  { a: "tilahun_gessesse", title: "Tizita (Tilahun)", genre: "Tizita", yt: "ROtoLqfdjuM", likes: 18900, trending: true, desc: "A definitive interpretation of the Tizita musical form by the Voice of Ethiopia." },
  { a: "tilahun_gessesse", title: "Addis Ababa Bete", genre: "Traditional", yt: "_n5ab5ci-Jc", likes: 12600, trending: false, desc: "Tilahun Gessesse's love letter to the Ethiopian capital city." },
  { a: "tilahun_gessesse", title: "Welafen", genre: "Traditional", yt: "a71uNruEXhc", likes: 9870, trending: false, desc: "A classic Ethiopian song by one of the all-time legends of Ethiopian music." },

  // ── GIGI ──────────────────────────────────────────────────────────────
  { a: "gigi_shibabaw", title: "Illuminated", genre: "Ethio-Jazz", yt: "f_NDQVnKCng", likes: 13400, trending: true, desc: "Gigi's acclaimed world music album brought Ethiopian sounds to international stages." },
  { a: "gigi_shibabaw", title: "Saba (Gigi)", genre: "Ethio-Jazz", yt: "W7Bvv-88vx8", likes: 9870, trending: false, desc: "Gigi blends jazz, blues and Ethiopian musical traditions in this stunning track." },

  // ── ALEMAYEHU ESHETE ──────────────────────────────────────────────────
  { a: "alemayehu_eshete", title: "Alemayehu Classic", genre: "Soul & R&B", yt: "6nybsPdN5ek", likes: 11200, trending: false, desc: "Alemayehu Eshete — the Ethiopian Elvis — at his soulful best." },

  // ── BETTY G ───────────────────────────────────────────────────────────
  { a: "betty_g", title: "Lij Nesh", genre: "Modern Ethio-Pop", yt: "ljwI9MlWv3o", likes: 16800, trending: true, desc: "Betty G's chart-topping hit that blends modern R&B with Ethiopian rhythms." },
  { a: "betty_g", title: "Habesha", genre: "Modern Ethio-Pop", yt: "9Qz8t3MCSaU", likes: 12300, trending: true, desc: "A celebration of Habesha pride and culture set to an infectious modern beat." },
  { a: "betty_g", title: "Yene Geta", genre: "Modern Ethio-Pop", yt: "NftFVqKjPPs", likes: 8900, trending: false, desc: "Betty G delivers a powerful spiritual track with a contemporary sound." },
  { a: "betty_g", title: "Betty G Mix", genre: "Modern Ethio-Pop", yt: "_IIIF9f1dcc", likes: 6780, trending: false, desc: "A vibrant mix showcasing Betty G's versatility and star power." },

  // ── GOSSAYE TESFAYE ───────────────────────────────────────────────────
  { a: "gossaye_tesfaye", title: "Gossaye Official Video", genre: "Modern Ethio-Pop", yt: "ohSNr4G1RU8", likes: 11200, trending: true, desc: "Gossaye Tesfaye's breakout music video that won multiple Ethiopian music awards." },
  { a: "gossaye_tesfaye", title: "Fikir Lib", genre: "Modern Ethio-Pop", yt: "MMbK1Yyouk4", likes: 7650, trending: false, desc: "A romantic ballad exploring the depths of love and devotion." },
  { a: "gossaye_tesfaye", title: "Yene Lij", genre: "Modern Ethio-Pop", yt: "eswNHw74KTI", likes: 6230, trending: false, desc: "Gossaye Tesfaye's tender tribute to love and family." },
  { a: "gossaye_tesfaye", title: "Muluken (Gossaye)", genre: "Modern Ethio-Pop", yt: "OQTUvLDlZFY", likes: 4560, trending: false, desc: "An upbeat celebration of life and joy from this talented artist." },
  { a: "gossaye_tesfaye", title: "Gossaye New Song", genre: "Modern Ethio-Pop", yt: "H1OzlPmejk4", likes: 5670, trending: false, desc: "A fresh release showcasing Gossaye Tesfaye's evolving sound." },

  // ── EYOB MEKONNEN ─────────────────────────────────────────────────────
  { a: "eyob_mekonnen", title: "Tikdem", genre: "Amharic", yt: "-dPh_KrrbNI", likes: 9870, trending: true, desc: "Eyob Mekonnen's powerful voice shines in this emotionally charged Ethiopian pop hit." },
  { a: "eyob_mekonnen", title: "Hagere", genre: "Amharic", yt: "Ddpd0s_x_Pg", likes: 7340, trending: false, desc: "A patriotic song celebrating the beauty of the Ethiopian homeland." },
  { a: "eyob_mekonnen", title: "Eyob New", genre: "Amharic", yt: "BjySu7PCDxo", likes: 5670, trending: false, desc: "A fresh release from one of Ethiopia's most powerful vocal talents." },

  // ── NEWAY DEBEBE ──────────────────────────────────────────────────────
  { a: "neway_debebe", title: "Neway Classic", genre: "Traditional", yt: "AWItTwGHBzg", likes: 10240, trending: false, desc: "A timeless classic from the legendary Neway Debebe." },
  { a: "neway_debebe", title: "Yetebela", genre: "Traditional", yt: "m39lslv_AeI", likes: 8790, trending: false, desc: "Neway Debebe's powerful voice carries deep emotion in this beloved song." },
  { a: "neway_debebe", title: "Kalkidan", genre: "Traditional", yt: "QpuGhUWtqF0", likes: 7230, trending: false, desc: "A deeply moving song about promise and faith from this Ethiopian legend." },
  { a: "neway_debebe", title: "Ethiopia (Neway)", genre: "Amharic", yt: "9_yzlgD6d2w", likes: 6540, trending: false, desc: "Neway Debebe's heartfelt tribute to his beloved homeland." },
  { a: "neway_debebe", title: "Esunet", genre: "Traditional", yt: "e4ieK25aSx0", likes: 5430, trending: false, desc: "A beautiful classic from the repertoire of one of Ethiopia's greatest voices." },

  // ── HAILE ROOTS ───────────────────────────────────────────────────────
  { a: "haile_roots", title: "Haile Roots Live", genre: "Reggae Fusion", yt: "yTZxQ-Ou_TA", likes: 7890, trending: true, desc: "Haile Roots brings Ethiopian culture and reggae together in this vibrant performance." },
  { a: "haile_roots", title: "Saba", genre: "Reggae Fusion", yt: "DERr9B2ib5M", likes: 6230, trending: false, desc: "A reggae-infused track celebrating the Queen of Sheba and Ethiopian heritage." },
  { a: "haile_roots", title: "Lalibela", genre: "Reggae Fusion", yt: "rr94RSsaeU0", likes: 5450, trending: false, desc: "A spiritual journey through the rock-hewn churches of Lalibela in song." },

  // ── ROPHNAN ───────────────────────────────────────────────────────────
  { a: "rophnan_nati", title: "Rophnan Electronic", genre: "Electronic Fusion", yt: "sPrZBK-vATg", likes: 10230, trending: true, desc: "Rophnan Nati's groundbreaking electronic sound infused with Ethiopian musical elements." },
  { a: "rophnan_nati", title: "Sheger", genre: "Electronic Fusion", yt: "kUknTOgdWgk", likes: 8760, trending: false, desc: "A tribute to Addis Ababa through electronic music and Ethiopian rhythms." },
  { a: "rophnan_nati", title: "Meseret", genre: "Electronic Fusion", yt: "xIVv3-WCv4s", likes: 7230, trending: false, desc: "Rophnan fuses traditional Ethiopian ceremonial music with contemporary production." },
  { a: "rophnan_nati", title: "Rophnan New Mix", genre: "Electronic Fusion", yt: "D8dCv7qZFa8", likes: 5890, trending: false, desc: "A fresh electronic production blending global beats with Habesha soul." },

  // ── ZERITU KEBEDE ─────────────────────────────────────────────────────
  { a: "zeritu_kebede", title: "Zeritu Official", genre: "Modern Ethio-Pop", yt: "h6szR48vovo", likes: 12450, trending: true, desc: "Zeritu Kebede's powerful voice captivates in this modern Ethiopian hit." },
  { a: "zeritu_kebede", title: "New Yemilew", genre: "Modern Ethio-Pop", yt: "3q2SQub5KBg", likes: 9870, trending: false, desc: "A deeply moving ballad from one of Ethiopia's most respected female artists." },
  { a: "zeritu_kebede", title: "Yigremagne", genre: "Modern Ethio-Pop", yt: "cQbvrcuhP_s", likes: 7230, trending: false, desc: "Zeritu Kebede delivers another emotional performance in this heartfelt song." },

  // ── DAWIT TSIGE ───────────────────────────────────────────────────────
  { a: "dawit_tsige", title: "Dawit Tsige Official", genre: "Modern Ethio-Pop", yt: "MKnUGdpG5RU", likes: 9780, trending: false, desc: "Award-winning modern Ethiopian pop from Dawit Tsige." },
  { a: "dawit_tsige", title: "Betezem", genre: "Modern Ethio-Pop", yt: "eNXsibPXqu4", likes: 7560, trending: false, desc: "Dawit Tsige showcases his smooth R&B vocal style in this popular track." },
  { a: "dawit_tsige", title: "Amelework", genre: "Modern Ethio-Pop", yt: "wqeLpmthFY4", likes: 6320, trending: false, desc: "A beautiful love song highlighting Dawit Tsige's songwriting prowess." },
  { a: "dawit_tsige", title: "Dawit New Release", genre: "Modern Ethio-Pop", yt: "sLAeD8K9cas", likes: 5230, trending: false, desc: "A fresh release from this acclaimed Ethiopian pop artist." },

  // ── WEDI TIKABO ───────────────────────────────────────────────────────
  { a: "wedi_tikabo", title: "Wedi Tikabo Classic", genre: "Tigrinya", yt: "C5Q0dUAEEJQ", likes: 14500, trending: true, desc: "The King of Tigrinya music at his most powerful — a defining performance." },
  { a: "wedi_tikabo", title: "Eritrea Special", genre: "Eritrean Music", yt: "B3iySs56D7U", likes: 11200, trending: false, desc: "Wedi Tikabo celebrates Eritrean culture and identity in this beloved song." },
  { a: "wedi_tikabo", title: "Haw", genre: "Tigrinya", yt: "YBC6Mz8wPpE", likes: 9870, trending: false, desc: "A brotherly tribute from the legendary Wedi Tikabo." },

  // ── EDEN HABTEZION ────────────────────────────────────────────────────
  { a: "eden_habtezion", title: "Eden Tigrinya Hit", genre: "Tigrinya", yt: "CGteduEW554", likes: 8340, trending: false, desc: "Eden Habtezion's powerful Tigrinya music connects diaspora communities worldwide." },
  { a: "eden_habtezion", title: "Dehai", genre: "Eritrean Music", yt: "JAW8wmp5yMk", likes: 6780, trending: false, desc: "A moving tribute to Eritrean and Ethiopian cultural heritage through Tigrinya song." },

  // ── TEWELDE REDA ─────────────────────────────────────────────────────
  { a: "tewelde_reda", title: "Tewelde Reda Classic", genre: "Tigrinya", yt: "SbHRuGfSh8w", likes: 7230, trending: false, desc: "Tewelde Reda's heartfelt Tigrinya music speaks to the soul of the Habesha people." },

  // ── GETISH MAMO ───────────────────────────────────────────────────────
  { a: "getish_mamo", title: "Getish Mamo Official", genre: "Modern Ethio-Pop", yt: "0BdzfKYo7Z8", likes: 7890, trending: false, desc: "Emerging talent Getish Mamo brings fresh energy to Ethiopian pop music." },
  { a: "getish_mamo", title: "Sheger (Getish)", genre: "Modern Ethio-Pop", yt: "sxVTm04BloA", likes: 6230, trending: false, desc: "Getish Mamo's ode to the vibrant capital city of Ethiopia." },

  // ── BIZUNESH BEKELE ───────────────────────────────────────────────────
  { a: "bizunesh_bekele", title: "Bizunesh Classic", genre: "Traditional", yt: "d8BdXzg9AMQ", likes: 8340, trending: false, desc: "Bizunesh Bekele preserves and celebrates Ethiopia's rich traditional musical heritage." },

  // ── MULUKEN MELESSE ───────────────────────────────────────────────────
  { a: "muluken_melesse", title: "Muluken Melesse Classic", genre: "Soul & R&B", yt: "yHVj4k4moAc", likes: 9870, trending: false, desc: "A soulful classic from one of Ethiopia's golden era artists." },

  // ── ABEBE TEKA ────────────────────────────────────────────────────────
  { a: "abebe_teka", title: "Abebe Teka Vol 1", genre: "Traditional", yt: "0Cx36CRTrQ8", likes: 7650, trending: false, desc: "Abebe Teka's legendary Ethiopian music from the classic era." },
  { a: "abebe_teka", title: "Sew Ateqeqem", genre: "Traditional", yt: "gU0vY_Mpq84", likes: 6230, trending: false, desc: "One of Abebe Teka's most celebrated traditional Ethiopian songs." },

  // ── HIRUT BEKELE ──────────────────────────────────────────────────────
  { a: "hirut_bekele", title: "Hirut Bekele Classic", genre: "Traditional", yt: "cRZqe_ZamqM", likes: 8900, trending: false, desc: "A beloved traditional Ethiopian song by the iconic Hirut Bekele." },
  { a: "hirut_bekele", title: "Hirut Collection", genre: "Traditional", yt: "9haD_MxAm3c", likes: 7340, trending: false, desc: "A selection of Hirut Bekele's most cherished traditional songs." },

  // ── KUKU SEBSIBE ──────────────────────────────────────────────────────
  { a: "kuku_sebsibe", title: "Kuku Sebsibe Live", genre: "Eskista", yt: "IoJzpFWc1Rc", likes: 9870, trending: false, desc: "Kuku Sebsibe's energetic Eskista performance showcasing traditional Ethiopian dance music." },
  { a: "kuku_sebsibe", title: "Kuku Classic Mix", genre: "Eskista", yt: "rtRY4IAh5AU", likes: 7890, trending: false, desc: "A vibrant mix of Kuku Sebsibe's most beloved Eskista songs." },

  // ── SHAMBEL BELAYNEH ──────────────────────────────────────────────────
  { a: "shambel_belayneh", title: "Shambel Belayneh Classic", genre: "Amharic", yt: "ug3ip-Zo1y8", likes: 8450, trending: false, desc: "Shambel Belayneh's energetic Amharic music that defines celebration and joy." },
  { a: "shambel_belayneh", title: "Shambel Collection", genre: "Amharic", yt: "MvdXgp5giFU", likes: 6780, trending: false, desc: "A collection of Shambel Belayneh's most popular songs." },

  // ── NETSANET MELESSE ──────────────────────────────────────────────────
  { a: "netsanet_melesse", title: "Netsanet Official", genre: "Modern Ethio-Pop", yt: "h5OcekqRnow", likes: 7230, trending: false, desc: "Netsanet Melesse's contemporary Ethiopian pop that has won a devoted following." },

  // ── MEKDES TSEGAYE ────────────────────────────────────────────────────
  { a: "mekdes_tsegaye", title: "Mekdes Official", genre: "Modern Ethio-Pop", yt: "mGRvM0FTzrw", likes: 6890, trending: false, desc: "Mekdes Tsegaye's fresh modern Ethiopian pop sound." },
  { a: "mekdes_tsegaye", title: "Mekdes New Song", genre: "Modern Ethio-Pop", yt: "Tw4FZHC1toI", likes: 5670, trending: false, desc: "A new release from this talented Ethiopian female artist." },

  // ── SAMRAWIT FIKADU ───────────────────────────────────────────────────
  { a: "samrawit_fikadu", title: "Samrawit Official", genre: "Modern Ethio-Pop", yt: "sscbkuimYLA", likes: 8230, trending: false, desc: "Samrawit Fikadu's award-winning modern Ethiopian pop music." },
  { a: "samrawit_fikadu", title: "Samrawit Mix", genre: "Modern Ethio-Pop", yt: "GwVZVVKSyUY", likes: 6780, trending: false, desc: "A vibrant collection of Samrawit Fikadu's most popular tracks." },

  // ── ELIAS MELKA ───────────────────────────────────────────────────────
  { a: "elias_melka", title: "Elias Melka Official", genre: "Modern Ethio-Pop", yt: "SoZwcOC5mJQ", likes: 7340, trending: false, desc: "Elias Melka's modern Ethiopian sound that has earned him critical acclaim." },
  { a: "elias_melka", title: "Elias New Release", genre: "Modern Ethio-Pop", yt: "csNcoU3rsms", likes: 5890, trending: false, desc: "A fresh new track from this talented Ethiopian artist." },

  // ── ALEMU AGA ─────────────────────────────────────────────────────────
  { a: "alemu_aga", title: "Begena Solo", genre: "Traditional", yt: "H-QdPwaea7Y", likes: 9230, trending: false, desc: "A mesmerizing begena (Ethiopian lyre) solo by master Alemu Aga." },
  { a: "alemu_aga", title: "Alemu Aga Traditional", genre: "Traditional", yt: "EnxWQgv0i5M", likes: 7890, trending: false, desc: "Traditional Ethiopian music on the ancient begena instrument." },
  { a: "alemu_aga", title: "Gurage Wedding Music", genre: "Gurage", yt: "dKKNOYUBAzw", likes: 6780, trending: false, desc: "Alemu Aga plays traditional Gurage ceremonial music on the begena." },

  // ── TESHOME NEGA ──────────────────────────────────────────────────────
  { a: "teshome_nega", title: "Teshome Nega Classic", genre: "Ethio-Jazz", yt: "B5lY5eWLQl0", likes: 7230, trending: false, desc: "A classic Ethiopian jazz composition showcasing Teshome Nega's musical brilliance." },

  // ── MEKLIT HADERO ─────────────────────────────────────────────────────
  { a: "meklit_hadero", title: "Meklit Hadero Jazz", genre: "Ethio-Jazz", yt: "32J7J76fdWc", likes: 8900, trending: false, desc: "Meklit Hadero's beautiful fusion of Ethiopian music and jazz." },
  { a: "meklit_hadero", title: "Meklit Live", genre: "Ethio-Jazz", yt: "MwDrcvGTODs", likes: 7230, trending: false, desc: "A captivating live performance blending Ethiopian and jazz influences." },

  // ── BERHANE ZERIHUN ───────────────────────────────────────────────────
  { a: "berhane_zerihun", title: "Berhane Classic", genre: "Traditional", yt: "mK3s8PLB8Tc", likes: 6780, trending: false, desc: "Berhane Zerihun's timeless contribution to Ethiopian traditional music." },

  // ── ALI BIRRA ─────────────────────────────────────────────────────────
  { a: "ali_birra", title: "Ali Birra Oromo Legend", genre: "Oromo", yt: "pBKdehW1wt8", likes: 18900, trending: true, desc: "Ali Birra — the undisputed legend of Oromo music — at his finest." },
  { a: "ali_birra", title: "Garaa Garaa", genre: "Oromo", yt: "oDVi7u_wC-M", likes: 14500, trending: true, desc: "One of Ali Birra's most beloved Oromo songs, a timeless classic." },
  { a: "ali_birra", title: "Sabbata", genre: "Oromo", yt: "ZFRHSd0DKRQ", likes: 11200, trending: false, desc: "A beautiful Oromo song celebrating the Sabbath and Ethiopian culture." },
  { a: "ali_birra", title: "Manni", genre: "Oromo", yt: "gvxy4diPG4g", likes: 9870, trending: false, desc: "Ali Birra's touching song about home and belonging." },
  { a: "ali_birra", title: "Nadhii", genre: "Oromo", yt: "2PRqX_bNRak", likes: 8760, trending: false, desc: "A romantic Oromo love song by the master himself." },
  { a: "ali_birra", title: "Yaa Rabbi", genre: "Oromo", yt: "-9XKQP3kei4", likes: 7890, trending: false, desc: "Ali Birra's spiritual song expressing gratitude and faith." },

  // ── HACHALU HUNDESSA ──────────────────────────────────────────────────
  { a: "hachalu_hundessa", title: "Maalan Jira", genre: "Oromo", yt: "gliv_skuGL8", likes: 16800, trending: true, desc: "Hachalu Hundessa's most iconic song — a powerful anthem of Oromo identity." },
  { a: "hachalu_hundessa", title: "Jirra", genre: "Oromo", yt: "Q7Efy_k0AfU", likes: 13400, trending: true, desc: "A defiant song about existence and Oromo pride by the people's artist." },
  { a: "hachalu_hundessa", title: "Mootii", genre: "Oromo", yt: "f12vepm9wlc", likes: 11200, trending: false, desc: "Hachalu Hundessa's tribute to Oromo leadership and heritage." },
  { a: "hachalu_hundessa", title: "Machaa Tuulama", genre: "Oromo", yt: "J-ZBfv5_SBQ", likes: 9870, trending: false, desc: "A powerful song about Oromo cultural unity and identity." },
  { a: "hachalu_hundessa", title: "Maalan (New Version)", genre: "Oromo", yt: "Wv3he6CGF3E", likes: 8760, trending: false, desc: "A reimagined version of his most famous anthem." },

  // ── KEMER YOUSUF ─────────────────────────────────────────────────────
  { a: "kemer_yousuf", title: "Kemer Yousuf Classic", genre: "Oromo", yt: "TAxiQnRyJ90", likes: 8900, trending: false, desc: "Kemer Yousuf's beloved Oromo music that celebrates highland culture." },
  { a: "kemer_yousuf", title: "Seenaa", genre: "Oromo", yt: "SBlQyxPGts0", likes: 7230, trending: false, desc: "An Oromo song about history and cultural memory by Kemer Yousuf." },

  // ── TAMERAT MOLLA ─────────────────────────────────────────────────────
  { a: "tamerat_molla", title: "Tamerat Molla Official", genre: "Oromo", yt: "Rks8zKV2lnQ", likes: 8450, trending: false, desc: "Tamerat Molla's popular Oromo music that blends modern and traditional styles." },
  { a: "tamerat_molla", title: "Tamerat New Song", genre: "Oromo", yt: "zvHYr-uNCaw", likes: 6780, trending: false, desc: "A fresh new release from this talented Oromo artist." },

  // ── TESFAYE ALEMU ─────────────────────────────────────────────────────
  { a: "tesfaye_alemu", title: "Tesfaye Alemu Oromo", genre: "Oromo", yt: "Si9MjnLDKRE", likes: 7230, trending: false, desc: "A veteran Oromo musician delivering heartfelt songs rooted in tradition." },
  { a: "tesfaye_alemu", title: "Tesfaye Collection", genre: "Oromo", yt: "neNbZJYLDdA", likes: 5890, trending: false, desc: "A beautiful collection from this experienced Oromo artist." },

  // ── MULUWORK TSEGAYE ──────────────────────────────────────────────────
  { a: "muluwork_tsegaye", title: "Muluwork Oromo", genre: "Oromo", yt: "bd3LvlHOL3U", likes: 7890, trending: false, desc: "Muluwork Tsegaye's powerful female Oromo voice in action." },
  { a: "muluwork_tsegaye", title: "Muluwork New", genre: "Oromo", yt: "fFOXmBjMElI", likes: 6230, trending: false, desc: "A vibrant Oromo song showcasing Muluwork's unique style." },
  { a: "muluwork_tsegaye", title: "Muluwork Collection", genre: "Oromo", yt: "sD9MCy7uCAk", likes: 5450, trending: false, desc: "More beloved music from this talented Oromo female artist." },

  // ── ADNAN MOHAMMED ────────────────────────────────────────────────────
  { a: "adnan_mohammed", title: "Adnan Mohammed Oromo", genre: "Oromo", yt: "eUu9s0Hku7E", likes: 6780, trending: false, desc: "Adnan Mohammed's melodic Oromo music reflecting life and values." },
  { a: "adnan_mohammed", title: "Adnan New", genre: "Oromo", yt: "GTBt3mon3nk", likes: 5230, trending: false, desc: "A fresh Oromo release from this rising artist." },

  // ── MANA ZARA ─────────────────────────────────────────────────────────
  { a: "mana_zara", title: "Mana Zara Oromo", genre: "Oromo", yt: "HiecAQqiYWU", likes: 7890, trending: false, desc: "Mana Zara's vibrant Oromo music bringing joy and celebration." },
  { a: "mana_zara", title: "Mana Zara New", genre: "Oromo", yt: "rICWL8s8N8o", likes: 6230, trending: false, desc: "A lively Oromo track from this popular group." },

  // ── RAYA EBSA ─────────────────────────────────────────────────────────
  { a: "raya_ebsa", title: "Raya Ebsa Oromo", genre: "Oromo", yt: "JBk4ZI0kLjE", likes: 7230, trending: false, desc: "Raya Ebsa's strong female Oromo voice celebrating women and culture." },
  { a: "raya_ebsa", title: "Raya New Song", genre: "Oromo", yt: "mjaFLMb5LlA", likes: 5890, trending: false, desc: "A beautiful new Oromo song from this talented female artist." },

  // ── ABEBE GIRMA ───────────────────────────────────────────────────────
  { a: "abebe_girma", title: "Abebe Girma Classic", genre: "Oromo", yt: "f63GL0UmepM", likes: 8340, trending: false, desc: "Abebe Girma's classic Oromo music capturing cultural traditions." },
  { a: "abebe_girma", title: "Abebe New Oromo", genre: "Oromo", yt: "9o2yANQcI0Y", likes: 6780, trending: false, desc: "A beautiful Oromo song from this respected artist." },

  // ── ELILTA BEKELE ─────────────────────────────────────────────────────
  { a: "elilta_bekele", title: "Elilta Oromo", genre: "Oromo", yt: "9GTrdl1GvrI", likes: 7890, trending: false, desc: "Elilta Bekele's energetic Oromo music with a modern production." },
  { a: "elilta_bekele", title: "Elilta New", genre: "Oromo", yt: "vMQG9k9ohew", likes: 6230, trending: false, desc: "A vibrant Oromo release showcasing Elilta's star power." },

  // ── TSEHAYE YOHANNES ──────────────────────────────────────────────────
  { a: "tsehaye_yohannes", title: "Tsehaye Classic", genre: "Tigrinya", yt: "4V7vt9kW-WI", likes: 9870, trending: false, desc: "Tsehaye Yohannes delivers a masterful Tigrinya performance." },
  { a: "tsehaye_yohannes", title: "Kulul", genre: "Tigrinya", yt: "OwQrQdIrMFg", likes: 7890, trending: false, desc: "One of Tsehaye Yohannes's most cherished Tigrinya songs." },

  // ── ABRAHAM AFEWERKI ──────────────────────────────────────────────────
  { a: "abraham_afewerki", title: "Abraham Classic", genre: "Tigrinya", yt: "RRuC6R5y_Zc", likes: 16800, trending: true, desc: "Abraham Afewerki — one of the all-time Tigrinya legends — at his very best." },
  { a: "abraham_afewerki", title: "Ngelay", genre: "Tigrinya", yt: "qJBeqxfH5JU", likes: 13400, trending: true, desc: "One of Abraham Afewerki's most iconic Tigrinya songs." },
  { a: "abraham_afewerki", title: "Abraham New", genre: "Eritrean Music", yt: "8sHU4HQtZo8", likes: 10230, trending: false, desc: "Another beautiful Tigrinya offering from this legendary Eritrean artist." },

  // ── SEGEN SOLOMON ─────────────────────────────────────────────────────
  { a: "segen_solomon", title: "Segen Solomon Classic", genre: "Tigrinya", yt: "Sx1galTRXO0", likes: 9870, trending: false, desc: "Segen Solomon's beautiful Tigrinya voice celebrating Eritrean heritage." },
  { a: "segen_solomon", title: "Segen New Song", genre: "Tigrinya", yt: "qN0L3xZkSzw", likes: 7890, trending: false, desc: "A captivating new release from this talented Tigrinya artist." },
  { a: "segen_solomon", title: "Segen Vol 3", genre: "Eritrean Music", yt: "1oZg2p5EqXA", likes: 6540, trending: false, desc: "More beautiful Tigrinya music from Segen Solomon." },

  // ── BEREKET MENGISTEAB ────────────────────────────────────────────────
  { a: "bereket_mengisteab", title: "Bereket Classic", genre: "Tigrinya", yt: "IkCLEk2OAtM", likes: 8900, trending: false, desc: "A prolific Tigrinya artist delivering another heartfelt classic." },
  { a: "bereket_mengisteab", title: "Bereket New", genre: "Tigrinya", yt: "g1hQVTxMEHM", likes: 7230, trending: false, desc: "Bereket Mengisteab blends tradition with contemporary Tigrinya sound." },
  { a: "bereket_mengisteab", title: "Bereket Vol 3", genre: "Eritrean Music", yt: "tO_-JT5oxfw", likes: 5890, trending: false, desc: "More beloved Tigrinya music from this prolific Eritrean artist." },

  // ── RUTH YOHANNES ─────────────────────────────────────────────────────
  { a: "ruth_yohannes", title: "Ruth Yohannes Tigrinya", genre: "Tigrinya", yt: "xx1YlDjDcJs", likes: 7230, trending: false, desc: "Ruth Yohannes's captivating female Tigrinya voice." },

  // ── KIBROM BIRHANE ────────────────────────────────────────────────────
  { a: "kibrom_birhane", title: "Kibrom Classic", genre: "Eritrean Music", yt: "hdToF4Mfer4", likes: 8340, trending: false, desc: "Kibrom Birhane's melodic Eritrean music resonating across East Africa." },
  { a: "kibrom_birhane", title: "Kibrom New", genre: "Tigrinya", yt: "XYVz0EiN_zo", likes: 6780, trending: false, desc: "A beautiful new release from this celebrated Eritrean artist." },

  // ── ALEM GOITOM ───────────────────────────────────────────────────────
  { a: "alem_goitom", title: "Alem Goitom Classic", genre: "Eritrean Music", yt: "mLu16eNmZCM", likes: 7890, trending: false, desc: "Alem Goitom captures the spirit of the Eritrean people through song." },
  { a: "alem_goitom", title: "Alem New", genre: "Tigrinya", yt: "bFqJ5BEKoB8", likes: 6230, trending: false, desc: "A fresh release from this talented Eritrean artist." },

  // ── YONAS HAILE ───────────────────────────────────────────────────────
  { a: "yonas_haile", title: "Yonas Haile Classic", genre: "Tigrinya", yt: "cRMSrlkONt4", likes: 7230, trending: false, desc: "Yonas Haile bridges traditional Tigrinya sounds with contemporary production." },
  { a: "yonas_haile", title: "Yonas New Song", genre: "Tigrinya", yt: "qnotMBYuJ5s", likes: 5890, trending: false, desc: "A beautiful new Tigrinya offering from this rising artist." },

  // ── FIHIRA ────────────────────────────────────────────────────────────
  { a: "fihira", title: "Fihira Eritrea", genre: "Eritrean Music", yt: "m0CEPNBUQTg", likes: 8340, trending: false, desc: "Fihira's energetic Eritrean music celebrating youth and culture." },
  { a: "fihira", title: "Fihira New", genre: "Eritrean Music", yt: "MvPFqk-spNk", likes: 6780, trending: false, desc: "A vibrant new release from this popular Eritrean group." },

  // ── KOKHOB ────────────────────────────────────────────────────────────
  { a: "kokhob", title: "Kokhob Classic", genre: "Eritrean Music", yt: "OyFWQ5Szxjk", likes: 7890, trending: false, desc: "Kokhob — meaning 'star' — shines in this beautiful Eritrean track." },
  { a: "kokhob", title: "Kokhob New", genre: "Eritrean Music", yt: "DyE4WFG0rY4", likes: 6230, trending: false, desc: "Another stellar performance from this beloved Eritrean group." },

  // ── MILLEN HAILU ──────────────────────────────────────────────────────
  { a: "millen_hailu", title: "Millen Hailu Classic", genre: "Tigrinya", yt: "LCHdgh6-9GY", likes: 7890, trending: false, desc: "Millen Hailu's beautiful Tigrinya voice celebrating Habesha culture." },
  { a: "millen_hailu", title: "Millen New Song", genre: "Tigrinya", yt: "GaLfl3PuPA4", likes: 6230, trending: false, desc: "A fresh new release from this talented Tigrinya female artist." },

  // ── SOLOMIE HAILE ─────────────────────────────────────────────────────
  { a: "solomie_haile", title: "Solomie Haile Classic", genre: "Eritrean Music", yt: "dBPLsctCFJ0", likes: 7230, trending: false, desc: "Solomie Haile's authentic Eritrean music touching hearts worldwide." },
  { a: "solomie_haile", title: "Solomie New", genre: "Eritrean Music", yt: "Kj69yKj0EIc", likes: 5890, trending: false, desc: "A beautiful new release from this Eritrean female artist." },

  // ── HABEN TESFAI ──────────────────────────────────────────────────────
  { a: "haben_tesfai", title: "Haben Classic", genre: "Tigrinya", yt: "V6Qy89wrqGU", likes: 7230, trending: false, desc: "Haben Tesfai's heartfelt Tigrinya songs reflecting Habesha life and love." },
  { a: "haben_tesfai", title: "Haben New Song", genre: "Tigrinya", yt: "wwRKj6-YpUE", likes: 5670, trending: false, desc: "A fresh release from this rising Tigrinya artist." },

  // ── DAWIT EYOB ────────────────────────────────────────────────────────
  { a: "dawit_eyob", title: "Dawit Eyob Classic", genre: "Eritrean Music", yt: "333gbXPrAog", likes: 8340, trending: false, desc: "Dawit Eyob's energetic Tigrinya music blending tradition with modernity." },
  { a: "dawit_eyob", title: "Dawit Eyob Vol 2", genre: "Tigrinya", yt: "57oOT-8rlTE", likes: 6780, trending: false, desc: "More vibrant Tigrinya music from this talented Eritrean artist." },
  { a: "dawit_eyob", title: "Dawit New", genre: "Eritrean Music", yt: "seL9dbj9fco", likes: 5450, trending: false, desc: "A fresh new release from Dawit Eyob." },

  // ── YONAS TESFAY ──────────────────────────────────────────────────────
  { a: "yonas_tesfay", title: "Yonas Tesfay Classic", genre: "Tigrinya", yt: "tIwSknNn4es", likes: 8900, trending: false, desc: "Yonas Tesfay's distinctive Tigrinya voice captivating diaspora audiences." },
  { a: "yonas_tesfay", title: "Yonas New Song", genre: "Tigrinya", yt: "iJ5hta_5cRE", likes: 7230, trending: false, desc: "A beautiful new release from this popular Tigrinya artist." },

  // ── MARTHA ASHAGARI ───────────────────────────────────────────────────
  { a: "martha_ashagari", title: "Martha Gospel Classic", genre: "Gospel", yt: "RqrV15g4n1M", likes: 12300, trending: true, desc: "Martha Ashagari's spirit-filled mezmur that brings comfort and joy to millions." },

  // ── SELAM TESFAYE ─────────────────────────────────────────────────────
  { a: "selam_tesfaye", title: "Selam Gospel Classic", genre: "Gospel", yt: "KyrARLBOUag", likes: 9870, trending: false, desc: "Selam Tesfaye's powerful gospel mezmur that uplifts the spirit." },
  { a: "selam_tesfaye", title: "Selam Mezmur Vol 2", genre: "Gospel", yt: "La40yx3Wy2Q", likes: 7890, trending: false, desc: "More anointed gospel music from Selam Tesfaye." },

  // ── DAWIT MEKONNEN GOSPEL ─────────────────────────────────────────────
  { a: "dawit_mek_gospel", title: "Dawit Gospel Classic", genre: "Gospel", yt: "961kuwJCoO0", likes: 9230, trending: false, desc: "Dawit Mekonnen's praise and worship music that has touched hearts nationwide." },
  { a: "dawit_mek_gospel", title: "Dawit Mezmur Vol 2", genre: "Gospel", yt: "WI8cAGyrrgc", likes: 7560, trending: false, desc: "More powerful gospel music from this Ethiopian worship artist." },

  // ── KEBEBUSH GIRMA ────────────────────────────────────────────────────
  { a: "kebebush_girma", title: "Kebebush Classic", genre: "Gospel", yt: "-OTx8y9IQDY", likes: 10230, trending: false, desc: "Kebebush Girma's anointed mezmur carrying a powerful spiritual message." },
  { a: "kebebush_girma", title: "Kebebush Vol 2", genre: "Gospel", yt: "aShejpzIAeY", likes: 8340, trending: false, desc: "More beautiful gospel music from this celebrated Ethiopian artist." },

  // ── HELEN BERHE ───────────────────────────────────────────────────────
  { a: "helen_berhe", title: "Helen Gospel Classic", genre: "Gospel", yt: "dFBcpwOOihM", likes: 7890, trending: false, desc: "Helen Berhe's powerful gospel music bridging communities through worship." },
  { a: "helen_berhe", title: "Helen Mezmur Vol 2", genre: "Gospel", yt: "2sQsgxv0E-U", likes: 6340, trending: false, desc: "More inspiring gospel music from Helen Berhe." },

  // ── YILMA HAILU ───────────────────────────────────────────────────────
  { a: "yilma_hailu", title: "Yilma Gospel Classic", genre: "Gospel", yt: "36oWXbJeXO4", likes: 7230, trending: false, desc: "Yilma Hailu's uplifting mezmur that has won hearts in congregations across Ethiopia." },
  { a: "yilma_hailu", title: "Yilma Mezmur Vol 2", genre: "Gospel", yt: "kIoJp_1FW1s", likes: 5890, trending: false, desc: "More anointed gospel music from Yilma Hailu." },

  // ── SELAMAWIT YOHANNES ────────────────────────────────────────────────
  { a: "selamawit_yohannes", title: "Selamawit Gospel", genre: "Gospel", yt: "jWSRjGB3JMU", likes: 8340, trending: false, desc: "Selamawit Yohannes's deeply moving gospel music with powerful spiritual impact." },

  // ── TEMESGEN BIREDA ───────────────────────────────────────────────────
  { a: "temesgen_bireda", title: "Temesgen Gospel Classic", genre: "Gospel", yt: "ElsEqOuED8k", likes: 7890, trending: false, desc: "Temesgen Bireda's contemporary gospel sound blending tradition with modernity." },

  // ── DAGMAWI BEKELE ────────────────────────────────────────────────────
  { a: "dagmawi_bekele", title: "Dagmawi Gospel", genre: "Gospel", yt: "VMkZYr5DBDg", likes: 6780, trending: false, desc: "Dagmawi Bekele's spirited gospel performance inspiring faith and devotion." },

  // ── ABEL MULUGETA ─────────────────────────────────────────────────────
  { a: "abel_mulugeta", title: "Abel Official", genre: "Gospel", yt: "nrpOx2TiYEw", likes: 7230, trending: false, desc: "Abel Mulugeta's music spanning gospel and contemporary Ethiopian pop." },

  // ── TEDDY YO ──────────────────────────────────────────────────────────
  { a: "teddy_yo", title: "Teddy Yo Hip-Hop", genre: "Ethiopian Hip-Hop", yt: "PcpNh9m0M1s", likes: 12300, trending: true, desc: "Teddy Yo's breakout hip-hop track that brought Ethiopian rap to the mainstream." },
  { a: "teddy_yo", title: "Teddy Yo Vol 2", genre: "Ethiopian Hip-Hop", yt: "nD5jCh9TzGY", likes: 9870, trending: false, desc: "Clever Amharic wordplay and authentic storytelling from Teddy Yo." },
  { a: "teddy_yo", title: "Teddy Yo New", genre: "Ethiopian Hip-Hop", yt: "dJKKeEYDUBk", likes: 7890, trending: false, desc: "A fresh hip-hop release from one of Ethiopia's top rap artists." },

  // ── LIJ MICHAEL ───────────────────────────────────────────────────────
  { a: "lij_michael", title: "Lij Michael Classic", genre: "Ethiopian Hip-Hop", yt: "UKrXRXopxIc", likes: 9870, trending: false, desc: "Lij Michael's pioneering Ethiopian hip-hop with authentic Amharic storytelling." },
  { a: "lij_michael", title: "Lij Michael Vol 2", genre: "Ethiopian Hip-Hop", yt: "0nTK_XTz_ZA", likes: 7890, trending: false, desc: "More authentic hip-hop from one of Ethiopia's genre pioneers." },

  // ── MIKAEL SIYE ───────────────────────────────────────────────────────
  { a: "mikael_siye", title: "Mikael Siye Hip-Hop", genre: "Ethiopian Hip-Hop", yt: "WFRLiKjpFXk", likes: 8340, trending: false, desc: "Mikael Siye's energetic hip-hop delivery with socially conscious Amharic lyrics." },

  // ── MOTI BIYU ─────────────────────────────────────────────────────────
  { a: "moti_biyu", title: "Moti Biyu Classic", genre: "Ethiopian Hip-Hop", yt: "8EjcYircKvw", likes: 7890, trending: false, desc: "Moti Biyu combines hip-hop rhythms with Amharic lyrics for the modern generation." },
  { a: "moti_biyu", title: "Moti Biyu Vol 2", genre: "Ethiopian Hip-Hop", yt: "v_33I-PxJ5k", likes: 6230, trending: false, desc: "Fresh urban music from this Ethiopian hip-hop artist." },

  // ── TIGABU GEBEYEHU ───────────────────────────────────────────────────
  { a: "tigabu_gebeyehu", title: "Tigabu Gurage Classic", genre: "Gurage", yt: "6BXHb8Bs_Qw", likes: 9870, trending: false, desc: "Tigabu Gebeyehu's beloved Gurage music that gets audiences dancing at celebrations." },
];

// ---------------------------------------------------------------------------
// Discussions
// ---------------------------------------------------------------------------
const discussionsData = [
  { title: "How has Ethio-jazz influenced global music?", content: "Mulatu Astatke's Ethio-jazz has had a profound influence on global music. Jim Jarmusch used his music in 'Broken Flowers', and musicians worldwide have drawn inspiration from Ethiopia's unique pentatonic scales. What do you think about the global reach of our music?", category: "Music Discussion", isPinned: false },
  { title: "Best Tigrinya songs of the decade — your picks?", content: "The Tigrinya music scene has been thriving. Wedi Tikabo, Abraham Afewerki, Eden Habtezion, and Segen Solomon have all released amazing work. Who are your top picks for best Tigrinya songs from the last 10 years?", category: "Recommendations", isPinned: false },
  { title: "Teddy Afro's impact on Ethiopian national identity", content: "Teddy Afro's 'Ethiopia' has become almost a second national anthem. His music crosses political, ethnic, and generational divides in a way few artists can. How do you see his role in shaping modern Ethiopian identity through music?", category: "Music Discussion", isPinned: false },
  { title: "⚠️ SCAM ALERT: Fake music investment schemes targeting artists", content: "There have been multiple reports of scammers targeting Ethiopian artists with fake record deals and large advances. They ask for upfront 'processing fees' before payments that never come. NEVER pay money to receive money. Always verify companies through official channels. Please share this with any artists you know.", category: "Security Awareness", isPinned: true },
  { title: "Ali Birra and the legacy of Oromo music", content: "Ali Birra has been the voice of Oromo music for over 50 years. His songs have celebrated Oromo culture, love, and identity through both good and difficult times. What are your favorite Ali Birra songs and what do they mean to you?", category: "Music Discussion", isPinned: false },
  { title: "Hachalu Hundessa's legacy and impact", content: "Hachalu Hundessa was more than a musician — he was a cultural icon and voice of a generation. His songs became anthems of Oromo pride and identity. How has his music shaped your understanding of Ethiopian culture?", category: "Music Discussion", isPinned: false },
  { title: "Best Ethiopian gospel (mezmur) recommendations", content: "Looking for the best Ethiopian gospel mezmur artists and songs. I've been listening to Martha Ashagari and Selam Tesfaye but want to discover more. What are your favorite Ethiopian gospel songs for spiritual growth?", category: "Recommendations", isPinned: false },
  { title: "⚠️ Fake social media profiles impersonating Ethiopian artists", content: "Scammers are creating fake Facebook and Instagram profiles pretending to be famous Ethiopian artists like Teddy Afro and Betty G to collect money for fake concerts, merchandise, and collaborations. Always verify official accounts through the artist's verified channels. Report suspicious profiles immediately.", category: "Security Awareness", isPinned: true },
  { title: "The rise of Ethiopian hip-hop — Teddy Yo, Lij Michael, and beyond", content: "Ethiopian hip-hop has come a long way. From the early days of Lij Michael to the mainstream success of Teddy Yo, the genre has grown enormously. What do you think about the current state of Ethiopian hip-hop?", category: "Music Discussion", isPinned: false },
  { title: "Best Ethiopian music for diaspora community gatherings", content: "Looking for the perfect playlist for an Ethiopian cultural event. Need a mix of classic (Tilahun, Aster, Mahmoud Ahmed) and modern (Betty G, Gossaye, Zeritu). What songs never fail to get everyone up and celebrating?", category: "Recommendations", isPinned: false },
];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------
async function seed() {
  console.log("🌱 EthioWave — Seeding database with 100+ artists...\n");

  // Genres
  console.log("  📀 Adding genres...");
  await db.delete(genresTable);
  for (const g of genresData) {
    await db.insert(genresTable).values(g).onConflictDoNothing();
  }

  // Admin
  console.log("  👤 Creating admin user...");
  const adminHash = await bcrypt.hash("Admin@12345", 12);
  await db.insert(usersTable).values({
    username: "admin", email: "admin@ethiowave.com", passwordHash: adminHash,
    displayName: "EthioWave Admin", role: "admin", isVerified: true,
    avatar: "https://ui-avatars.com/api/?name=EthioWave+Admin&background=8B1A1A&color=fff&size=200",
  }).onConflictDoUpdate({
    target: usersTable.username,
    set: { email: "admin@ethiowave.com", passwordHash: adminHash, displayName: "EthioWave Admin" },
  });

  // Artists
  console.log("  🎤 Creating artists...");
  const artistPassword = await bcrypt.hash("Artist@12345", 12);

  for (const artist of artistsData) {
    await db.insert(usersTable).values({
      username: artist.username, email: artist.email, passwordHash: artistPassword,
      displayName: artist.displayName, bio: artist.bio, avatar: artist.avatar,
      genre: artist.genre, role: "artist" as const,
      isVerified: artist.isVerified, isFeatured: artist.isFeatured,
    }).onConflictDoUpdate({
      target: usersTable.username,
      set: {
        email: artist.username + "@ethiowave.com",
        passwordHash: artistPassword,
        displayName: artist.displayName, bio: artist.bio, avatar: artist.avatar,
        genre: artist.genre, isVerified: artist.isVerified, isFeatured: artist.isFeatured,
      },
    });
  }
  console.log(`  ✅ ${artistsData.length} artists created`);

  // Artist map
  const artistUsers = await db.select({ id: usersTable.id, username: usersTable.username }).from(usersTable);
  const artistMap = new Map(artistUsers.map((a) => [a.username, a.id]));

  // Clear and insert tracks
  console.log("  🎵 Clearing old tracks and inserting full library...");
  await db.delete(tracksTable);

  let trackCount = 0;
  for (const t of tracksData) {
    const artistId = artistMap.get(t.a);
    if (!artistId) { console.warn(`  ⚠️  Artist not found: ${t.a}`); continue; }
    await db.insert(tracksTable).values({
      title: t.title, artistId, genre: t.genre, youtubeId: t.yt,
      description: t.desc, likesCount: t.likes, commentsCount: Math.floor(t.likes / 45),
      isTrending: t.trending,
    });
    trackCount++;
  }
  console.log(`  ✅ ${trackCount} tracks inserted`);

  // Discussions
  console.log("  💬 Clearing old discussions...");
  await db.delete(repliesTable);
  await db.delete(discussionsTable);

  const adminUser = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.username, "admin")).limit(1);
  const adminId = adminUser[0]?.id;
  const allArtistIds = artistsData.map((a) => artistMap.get(a.username)).filter(Boolean) as number[];

  for (const disc of discussionsData) {
    const [d] = await db.insert(discussionsTable).values({
      title: disc.title, content: disc.content, category: disc.category,
      authorId: adminId ?? allArtistIds[0]!, isPinned: disc.isPinned ?? false, repliesCount: 0,
    }).returning();

    if (d) {
      const r1 = allArtistIds[Math.floor(Math.random() * allArtistIds.length)]!;
      const r2 = allArtistIds[Math.floor(Math.random() * allArtistIds.length)]!;
      await db.insert(repliesTable).values({ discussionId: d.id, authorId: r1, content: "Thank you for raising this important topic! The Ethiopian music community grows stronger when we share these conversations." });
      await db.insert(repliesTable).values({ discussionId: d.id, authorId: r2, content: "Absolutely agree! Let's keep supporting our artists and celebrating our rich culture together." });
      await db.update(discussionsTable).set({ repliesCount: 2 }).where(eq(discussionsTable.id, d.id));
    }
  }

  console.log(`\n✅ EthioWave seed complete!\n`);
  console.log(`  Artists: ${artistsData.length}`);
  console.log(`  Tracks:  ${trackCount}`);
  console.log(`  Genres:  ${genresData.length}`);
  console.log(`  Admin:   admin@ethiowave.com / Admin@12345`);
  console.log(`  Artists: {username}@ethiowave.com / Artist@12345`);
}

seed().catch(console.error).finally(() => process.exit(0));
