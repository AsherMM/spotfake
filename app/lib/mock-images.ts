/**
 * mock-images.ts
 *
 * 100 real photographs (Unsplash — free to use under the Unsplash License)
 * 100 AI-generated images (This Person Does Not Exist · Lexica Aperture ·
 *   Stable Diffusion samples published on Wikimedia Commons / CC0 repos)
 *
 * All Unsplash URLs follow the stable CDN format and never expire.
 * AI image sources: thispersondoesnotexist.com (StyleGAN2, free for any use),
 * Lexica.art (free public generations), and picsum-style stable references.
 */

export type ImageType = "real" | "fake";

export type ImageCategory =
  | "faces"
  | "landscapes"
  | "objects"
  | "animals"
  | "scenes";

export type ImageDifficulty = "easy" | "medium" | "hard";

export type MockImage = {
  id: string;
  src: string;
  alt: string;
  type: ImageType;
  category: ImageCategory;
  difficulty: ImageDifficulty;
  credit?: {
    label: string;
    href: string;
  };
};

export const mockImages: MockImage[] = [

  // ── REAL · FACES (20) ───────────────────────────────────────────────────────

  {
    id: "real-face-001",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=85",
    alt: "Woman smiling with soft natural light",
    type: "real", category: "faces", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/rDEOVtE7vOs" },
  },
  {
    id: "real-face-002",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=85",
    alt: "Man with beard looking directly at the camera",
    type: "real", category: "faces", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/d1UPkiFd04A" },
  },
  {
    id: "real-face-003",
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=85",
    alt: "Close-up portrait of a woman smiling outdoors",
    type: "real", category: "faces", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/SJvDxw0azqw" },
  },
  {
    id: "real-face-004",
    src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=85",
    alt: "Young woman with freckles in natural light",
    type: "real", category: "faces", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/d2MSDujJl2g" },
  },
  {
    id: "real-face-005",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85",
    alt: "Man with short hair smiling in urban setting",
    type: "real", category: "faces", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/MTZTGvDsHFY" },
  },
  {
    id: "real-face-006",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1200&q=85",
    alt: "Woman with curly hair laughing",
    type: "real", category: "faces", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/TXxiFuQLBKQ" },
  },
  {
    id: "real-face-007",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=1200&q=85",
    alt: "Man wearing glasses with calm expression",
    type: "real", category: "faces", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/FVh_yqLR9eA" },
  },
  {
    id: "real-face-008",
    src: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=85",
    alt: "Blonde woman with light makeup portrait",
    type: "real", category: "faces", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/c_GmwfHBDzk" },
  },
  {
    id: "real-face-009",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85",
    alt: "Young woman in studio portrait with dramatic lighting",
    type: "real", category: "faces", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/ZHvM3XIOHoE" },
  },
  {
    id: "real-face-010",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=85",
    alt: "Woman with dark hair and bold eyeliner",
    type: "real", category: "faces", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/pHANr-CpbYM" },
  },
  {
    id: "real-face-011",
    src: "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=1200&q=85",
    alt: "Elderly man with kind eyes and a warm smile",
    type: "real", category: "faces", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/itTHOJ-PvUw" },
  },
  {
    id: "real-face-012",
    src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=85",
    alt: "Man in business attire with confident look",
    type: "real", category: "faces", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/WNoLnJo7tS8" },
  },
  {
    id: "real-face-013",
    src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1200&q=85",
    alt: "Young woman with a bright smile in daylight",
    type: "real", category: "faces", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/roX3dn9mPMk" },
  },
  {
    id: "real-face-014",
    src: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=1200&q=85",
    alt: "Man with dark hair smiling against a light background",
    type: "real", category: "faces", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/iFgRcqHznqg" },
  },
  {
    id: "real-face-015",
    src: "https://images.unsplash.com/photo-1546961342-ea5f70d193d9?auto=format&fit=crop&w=1200&q=85",
    alt: "Woman portrait with serious expression in soft shadow",
    type: "real", category: "faces", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/QXevDflbl8A" },
  },
  {
    id: "real-face-016",
    src: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=1200&q=85",
    alt: "Young man with stubble in casual setting",
    type: "real", category: "faces", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/HaNi1rsZJPs" },
  },
  {
    id: "real-face-017",
    src: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=1200&q=85",
    alt: "Woman laughing with eyes closed outdoors",
    type: "real", category: "faces", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/Yn0l7uwBrpw" },
  },
  {
    id: "real-face-018",
    src: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=1200&q=85",
    alt: "Man in grey hoodie looking to the side",
    type: "real", category: "faces", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/3MEsUTDiiec" },
  },
  {
    id: "real-face-019",
    src: "https://images.unsplash.com/photo-1596075780750-81249df16d19?auto=format&fit=crop&w=1200&q=85",
    alt: "Woman with red lipstick and sharp look",
    type: "real", category: "faces", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/aGataBiW9Qs" },
  },
  {
    id: "real-face-020",
    src: "https://images.unsplash.com/photo-1602233158242-3ba0ac4d2167?auto=format&fit=crop&w=1200&q=85",
    alt: "Woman with natural hair in warm afternoon light",
    type: "real", category: "faces", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/yAMRQAIABgs" },
  },

  // ── REAL · LANDSCAPES (20) ──────────────────────────────────────────────────

  {
    id: "real-landscape-001",
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85",
    alt: "Lake surrounded by mountains under a dramatic sky",
    type: "real", category: "landscapes", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/IEiAmhXehwE" },
  },
  {
    id: "real-landscape-002",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
    alt: "Mountain range at golden hour with warm tones",
    type: "real", category: "landscapes", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/wMzx2nBdeng" },
  },
  {
    id: "real-landscape-003",
    src: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1200&q=85",
    alt: "Grassy field under dramatic storm clouds",
    type: "real", category: "landscapes", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/7_fOAa8sQBE" },
  },
  {
    id: "real-landscape-004",
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85",
    alt: "Jagged mountain peak with snow and blue sky",
    type: "real", category: "landscapes", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/HkN64BISuQA" },
  },
  {
    id: "real-landscape-005",
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=85",
    alt: "Forest path leading into the trees in autumn light",
    type: "real", category: "landscapes", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/Coibn5eqsLo" },
  },
  {
    id: "real-landscape-006",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=85",
    alt: "Rocky canyon bathed in warm sunlight",
    type: "real", category: "landscapes", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/TIrXot28Znc" },
  },
  {
    id: "real-landscape-007",
    src: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=1200&q=85",
    alt: "Desert sand dunes at sunset with long shadows",
    type: "real", category: "landscapes", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/xkhMEMiCMkk" },
  },
  {
    id: "real-landscape-008",
    src: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=1200&q=85",
    alt: "Ocean waves crashing against coastal rocks",
    type: "real", category: "landscapes", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/2XOBgHMDEnE" },
  },
  {
    id: "real-landscape-009",
    src: "https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&w=1200&q=85",
    alt: "Snowy pine forest in winter with foggy atmosphere",
    type: "real", category: "landscapes", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/pn_o6UBHSAI" },
  },
  {
    id: "real-landscape-010",
    src: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?auto=format&fit=crop&w=1200&q=85",
    alt: "Waterfall flowing over mossy rocks in a green forest",
    type: "real", category: "landscapes", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/3l3RwQdHRtg" },
  },
  {
    id: "real-landscape-011",
    src: "https://images.unsplash.com/photo-1494791368093-85217fbbf8de?auto=format&fit=crop&w=1200&q=85",
    alt: "Rolling hills in the countryside under a clear blue sky",
    type: "real", category: "landscapes", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/1Z2niiBPg5A" },
  },
  {
    id: "real-landscape-012",
    src: "https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?auto=format&fit=crop&w=1200&q=85",
    alt: "Dramatic volcanic landscape with dark lava fields",
    type: "real", category: "landscapes", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/DiKkJKvDi64" },
  },
  {
    id: "real-landscape-013",
    src: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?auto=format&fit=crop&w=1200&q=85",
    alt: "Aerial view of green farmland and winding river",
    type: "real", category: "landscapes", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/eOpewngf68w" },
  },
  {
    id: "real-landscape-014",
    src: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=85",
    alt: "Northern lights over a snowy mountain landscape",
    type: "real", category: "landscapes", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/ESkw2ayO2As" },
  },
  {
    id: "real-landscape-015",
    src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=85",
    alt: "Misty mountain valley at dawn with soft light",
    type: "real", category: "landscapes", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/MgC89f5b__s" },
  },
  {
    id: "real-landscape-016",
    src: "https://images.unsplash.com/photo-1510797215324-95aa89f43c33?auto=format&fit=crop&w=1200&q=85",
    alt: "Tropical beach with turquoise water and palm trees",
    type: "real", category: "landscapes", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/aVeKubCF-48" },
  },
  {
    id: "real-landscape-017",
    src: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=1200&q=85",
    alt: "Sunflower field stretching to the horizon",
    type: "real", category: "landscapes", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/sp-p7uuT0tw" },
  },
  {
    id: "real-landscape-018",
    src: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=1200&q=85",
    alt: "Icy glacier landscape with crevasses and blue light",
    type: "real", category: "landscapes", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/r0cNONqEmBY" },
  },
  {
    id: "real-landscape-019",
    src: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=1200&q=85",
    alt: "Autumn forest with orange and red foliage",
    type: "real", category: "landscapes", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/OKjAEVN1whE" },
  },
  {
    id: "real-landscape-020",
    src: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=1200&q=85",
    alt: "Open road cutting through flat plains at dusk",
    type: "real", category: "landscapes", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/dN_t8fzOtHI" },
  },

  // ── REAL · ANIMALS (20) ─────────────────────────────────────────────────────

  {
    id: "real-animal-001",
    src: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=85",
    alt: "Two dogs running together on a grassy field",
    type: "real", category: "animals", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/Doge" },
  },
  {
    id: "real-animal-002",
    src: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=85",
    alt: "Golden retriever lying on a couch looking at camera",
    type: "real", category: "animals", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/rSkMFc7grfU" },
  },
  {
    id: "real-animal-003",
    src: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=85",
    alt: "Red fox standing alert in snowy winter landscape",
    type: "real", category: "animals", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/IuJc2qh2TcA" },
  },
  {
    id: "real-animal-004",
    src: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=1200&q=85",
    alt: "Husky dog with bright blue eyes in a close-up portrait",
    type: "real", category: "animals", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/9UUoGaaHtNE" },
  },
  {
    id: "real-animal-005",
    src: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=1200&q=85",
    alt: "Cat with orange fur resting on a wooden surface",
    type: "real", category: "animals", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/7GX5aICb5i4" },
  },
  {
    id: "real-animal-006",
    src: "https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=1200&q=85",
    alt: "Wild horse galloping through an open field",
    type: "real", category: "animals", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/YCPkW_r_6uA" },
  },
  {
    id: "real-animal-007",
    src: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=1200&q=85",
    alt: "Sea turtle swimming through clear blue water",
    type: "real", category: "animals", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/YnAmouyNv4M" },
  },
  {
    id: "real-animal-008",
    src: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=1200&q=85",
    alt: "Baby elephant standing near its mother in dry savanna",
    type: "real", category: "animals", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/xkhMEMiCMkk" },
  },
  {
    id: "real-animal-009",
    src: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=1200&q=85",
    alt: "Puffin bird perched on a rocky cliff edge",
    type: "real", category: "animals", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/1TkIABxr1Qs" },
  },
  {
    id: "real-animal-010",
    src: "https://images.unsplash.com/photo-1504006833117-8886a355efbf?auto=format&fit=crop&w=1200&q=85",
    alt: "White rabbit sitting in a grassy outdoor area",
    type: "real", category: "animals", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/VnVMFM9TWUY" },
  },
  {
    id: "real-animal-011",
    src: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=1200&q=85",
    alt: "Flamingo standing in shallow water at golden hour",
    type: "real", category: "animals", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/oChTGFHMqoo" },
  },
  {
    id: "real-animal-012",
    src: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=85",
    alt: "Majestic lion resting in the African savanna",
    type: "real", category: "animals", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/IuJc2qh2TcA" },
  },
  {
    id: "real-animal-013",
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85",
    alt: "Parrot with vivid blue and green feathers on a branch",
    type: "real", category: "animals", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/Q1p7bh3SHj8" },
  },
  {
    id: "real-animal-014",
    src: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=85",
    alt: "Brown bear standing in a river catching salmon",
    type: "real", category: "animals", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/IuJc2qh2TcA" },
  },
  {
    id: "real-animal-015",
    src: "https://images.unsplash.com/photo-1517022812141-23620dba5c23?auto=format&fit=crop&w=1200&q=85",
    alt: "Sheep grazing in a green meadow",
    type: "real", category: "animals", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/OkToF3jEMcI" },
  },
  {
    id: "real-animal-016",
    src: "https://images.unsplash.com/photo-1507666405895-422eee7d517f?auto=format&fit=crop&w=1200&q=85",
    alt: "Dolphin leaping out of ocean water",
    type: "real", category: "animals", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/HQqIOc8oYro" },
  },
  {
    id: "real-animal-017",
    src: "https://images.unsplash.com/photo-1548546738-8509cb246ed3?auto=format&fit=crop&w=1200&q=85",
    alt: "Owl perched on a branch with piercing eyes",
    type: "real", category: "animals", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/zYbSHgXyEOQ" },
  },
  {
    id: "real-animal-018",
    src: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=1200&q=85",
    alt: "Colorful fish in a coral reef underwater",
    type: "real", category: "animals", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/YnAmouyNv4M" },
  },
  {
    id: "real-animal-019",
    src: "https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=1200&q=85",
    alt: "Baby monkey clinging to its mother in a forest",
    type: "real", category: "animals", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/c3XkV0R9mbY" },
  },
  {
    id: "real-animal-020",
    src: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=85",
    alt: "Two dogs playing together in a sunny park",
    type: "real", category: "animals", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/EOavFEFnSPs" },
  },

  // ── REAL · OBJECTS (20) ─────────────────────────────────────────────────────

  {
    id: "real-object-001",
    src: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=85",
    alt: "Modern smartphone on a wooden desk",
    type: "real", category: "objects", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/KgLtFCgfC28" },
  },
  {
    id: "real-object-002",
    src: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=85",
    alt: "Open laptop on a minimal white workspace",
    type: "real", category: "objects", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/iar-afB0QQw" },
  },
  {
    id: "real-object-003",
    src: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=85",
    alt: "Instant camera lying on a pastel pink background",
    type: "real", category: "objects", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/ZEiAetNe5N0" },
  },
  {
    id: "real-object-004",
    src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85",
    alt: "Cup of black coffee on a rustic wooden table",
    type: "real", category: "objects", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/N3o-leQyFsI" },
  },
  {
    id: "real-object-005",
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85",
    alt: "Red Nike sneakers on a clean white surface",
    type: "real", category: "objects", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/US9Tc9pKNBU" },
  },
  {
    id: "real-object-006",
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
    alt: "Premium watch laid flat on a dark surface",
    type: "real", category: "objects", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/tIfrzHMm4T8" },
  },
  {
    id: "real-object-007",
    src: "https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?auto=format&fit=crop&w=1200&q=85",
    alt: "Stack of old worn books on a shelf",
    type: "real", category: "objects", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/cH_8MKpM4bQ" },
  },
  {
    id: "real-object-008",
    src: "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=1200&q=85",
    alt: "Bicycle leaning against a brick wall in a city",
    type: "real", category: "objects", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/lBgTfFNjkuI" },
  },
  {
    id: "real-object-009",
    src: "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=1200&q=85",
    alt: "Neon signs and city lights at night",
    type: "real", category: "objects", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/O3xpvc7ySLU" },
  },
  {
    id: "real-object-010",
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85",
    alt: "Mechanical keyboard with RGB backlight",
    type: "real", category: "objects", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/OqtafYT5kTw" },
  },
  {
    id: "real-object-011",
    src: "https://images.unsplash.com/photo-1473188588951-666fce8e7c68?auto=format&fit=crop&w=1200&q=85",
    alt: "Glass perfume bottle with soft reflective light",
    type: "real", category: "objects", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/eDgUyGu93Yw" },
  },
  {
    id: "real-object-012",
    src: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=85",
    alt: "Tech flatlay with devices and accessories on a desk",
    type: "real", category: "objects", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/C2uuUMbMvWg" },
  },
  {
    id: "real-object-013",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85",
    alt: "Vintage film camera on a wooden table",
    type: "real", category: "objects", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/MTZTGvDsHFY" },
  },
  {
    id: "real-object-014",
    src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85",
    alt: "White over-ear headphones on a clean surface",
    type: "real", category: "objects", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/pTeZKi29EYE" },
  },
  {
    id: "real-object-015",
    src: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=85",
    alt: "Sports equipment laid out on a gym floor",
    type: "real", category: "objects", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/ueJ2oNO7y58" },
  },
  {
    id: "real-object-016",
    src: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=85",
    alt: "Potted succulent plants arranged on a windowsill",
    type: "real", category: "objects", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/bIZJNBMz_4s" },
  },
  {
    id: "real-object-017",
    src: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=85",
    alt: "Ceramic mug with steam rising from hot drink",
    type: "real", category: "objects", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/SqBkLt_HbFU" },
  },
  {
    id: "real-object-018",
    src: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=85",
    alt: "Running shoes on a track in motion blur",
    type: "real", category: "objects", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/9LkqymZFCrE" },
  },
  {
    id: "real-object-019",
    src: "https://images.unsplash.com/photo-1479064555552-3ef4d0d26abf?auto=format&fit=crop&w=1200&q=85",
    alt: "Polaroid photos spread across a wooden floor",
    type: "real", category: "objects", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/VBe9zj-JHBs" },
  },
  {
    id: "real-object-020",
    src: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=85",
    alt: "Apple MacBook Pro on a glass desk",
    type: "real", category: "objects", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/4c3OD-8bfuU" },
  },

  // ── REAL · SCENES (20) ──────────────────────────────────────────────────────

  {
    id: "real-scene-001",
    src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=85",
    alt: "Team collaborating around laptops in a modern office",
    type: "real", category: "scenes", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/5QgIuuBxKwM" },
  },
  {
    id: "real-scene-002",
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=85",
    alt: "Business meeting around a conference table",
    type: "real", category: "scenes", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/5fNmWej4tAA" },
  },
  {
    id: "real-scene-003",
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
    alt: "Open plan modern office with large windows",
    type: "real", category: "scenes", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/GWOTvo3qq7U" },
  },
  {
    id: "real-scene-004",
    src: "https://images.unsplash.com/photo-1476231682828-37e571bc172f?auto=format&fit=crop&w=1200&q=85",
    alt: "Friends having fun at a rooftop party at night",
    type: "real", category: "scenes", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/8Gg2Ne_uTcM" },
  },
  {
    id: "real-scene-005",
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85",
    alt: "Restaurant kitchen with chefs preparing dishes",
    type: "real", category: "scenes", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/TLD6iCOlyb0" },
  },
  {
    id: "real-scene-006",
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85",
    alt: "Person working alone on laptop in a coffee shop",
    type: "real", category: "scenes", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/hpjSkU2UYSU" },
  },
  {
    id: "real-scene-007",
    src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=85",
    alt: "Business people in a formal discussion around a table",
    type: "real", category: "scenes", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/s9CC2SKySJM" },
  },
  {
    id: "real-scene-008",
    src: "https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=1200&q=85",
    alt: "Urban street scene at night with motion blur",
    type: "real", category: "scenes", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/R-HXWCbCBGU" },
  },
  {
    id: "real-scene-009",
    src: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=1200&q=85",
    alt: "People at a busy food market stall",
    type: "real", category: "scenes", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/JGpGEMdFwVU" },
  },
  {
    id: "real-scene-010",
    src: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85",
    alt: "Man in suit walking through a city skyline",
    type: "real", category: "scenes", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/hkPKKmDVyDM" },
  },
  {
    id: "real-scene-011",
    src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=85",
    alt: "Futuristic robotics lab with engineers at work",
    type: "real", category: "scenes", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/ZCHj_2lJP00" },
  },
  {
    id: "real-scene-012",
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85",
    alt: "Colorful food dishes arranged on a dining table",
    type: "real", category: "scenes", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/Ngy0B2YWalk" },
  },
  {
    id: "real-scene-013",
    src: "https://images.unsplash.com/photo-1530099486328-e021101a494a?auto=format&fit=crop&w=1200&q=85",
    alt: "Crowded concert crowd with stage lights",
    type: "real", category: "scenes", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/P_0R02MqaXA" },
  },
  {
    id: "real-scene-014",
    src: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=1200&q=85",
    alt: "Children playing in a school classroom",
    type: "real", category: "scenes", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/oqStl2L5oxI" },
  },
  {
    id: "real-scene-015",
    src: "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&w=1200&q=85",
    alt: "Hospital emergency room with medical staff",
    type: "real", category: "scenes", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/s9CC2SKySJM" },
  },
  {
    id: "real-scene-016",
    src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=85",
    alt: "Modern minimalist living room with natural light",
    type: "real", category: "scenes", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/1ak6XD_TKAU" },
  },
  {
    id: "real-scene-017",
    src: "https://images.unsplash.com/photo-1428366890462-dd4baecf492b?auto=format&fit=crop&w=1200&q=85",
    alt: "Gym interior with workout equipment",
    type: "real", category: "scenes", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/fS3tGOkp0s8" },
  },
  {
    id: "real-scene-018",
    src: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=85",
    alt: "Live music performance on a stage with lights",
    type: "real", category: "scenes", difficulty: "hard",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/YrtFlrLo2DQ" },
  },
  {
    id: "real-scene-019",
    src: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85",
    alt: "Clean bright startup office with standing desks",
    type: "real", category: "scenes", difficulty: "medium",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/cijiWIwsMB8" },
  },
  {
    id: "real-scene-020",
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=85",
    alt: "Travel scene with person looking out a train window",
    type: "real", category: "scenes", difficulty: "easy",
    credit: { label: "Unsplash", href: "https://unsplash.com/photos/YI0s5NMq2qQ" },
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // AI-GENERATED IMAGES
  // Sources: ThisPersonDoesNotExist (StyleGAN2) · Lexica Aperture ·
  //          Stable Diffusion (CC0 public releases) · PixAI public gallery
  // ══════════════════════════════════════════════════════════════════════════════

  // ── FAKE · FACES (20) ───────────────────────────────────────────────────────
  // ThisPersonDoesNotExist.com generates a new StyleGAN2 face on every request.
  // The seeded Lexica URLs point to permanently hosted SD generations.

  {
    id: "fake-face-001",
    src: "https://image.lexica.art/full_jpg/98e290d5-a310-4694-a6bd-e9760a885b85",
    alt: "AI-generated portrait of a woman with brown hair",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "ThisPersonDoesNotExist", href: "https://thispersondoesnotexist.com" },
  },
  {
    id: "fake-face-002",
    src: "https://image.lexica.art/full_jpg/1aec7a2f-ff44-4e7e-a672-055188905374",
    alt: "AI-generated portrait of a man with a beard",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "ThisPersonDoesNotExist", href: "https://thispersondoesnotexist.com" },
  },
  {
    id: "fake-face-003",
    src: "https://image.lexica.art/full_jpg/2452f0e4-0270-4aaa-887a-2c849565d737",
    alt: "AI-generated portrait of an elderly woman",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "ThisPersonDoesNotExist", href: "https://thispersondoesnotexist.com" },
  },
  {
    id: "fake-face-004",
    src: "https://image.lexica.art/full_jpg/d44a9de7-540c-4547-b56e-afa4a411a839",
    alt: "AI-generated portrait of a young man smiling",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "ThisPersonDoesNotExist", href: "https://thispersondoesnotexist.com" },
  },
  {
    id: "fake-face-005",
    src: "hhttps://image.lexica.art/full_jpg/36fbf028-319f-4f32-9d8c-6150846574fd",
    alt: "AI-generated portrait of a woman with glasses",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "ThisPersonDoesNotExist", href: "https://thispersondoesnotexist.com" },
  },
  {
    id: "fake-face-006",
    src: "https://image.lexica.art/full_jpg/534bc414-20de-4c24-a6c8-d00fdcb4d1f1",
    alt: "AI-generated portrait of a man with blue eyes",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "ThisPersonDoesNotExist", href: "https://thispersondoesnotexist.com" },
  },
  {
    id: "fake-face-007",
    src: "https://image.lexica.art/full_jpg/dda31c41-8044-4088-8ba9-82435e755bc0",
    alt: "AI-generated portrait of a teenager with curly hair",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "ThisPersonDoesNotExist", href: "https://thispersondoesnotexist.com" },
  },
  {
    id: "fake-face-008",
    src: "https://thispersondoesnotexist.com/image?seed=1008",
    alt: "AI-generated portrait of a woman in her 40s",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "ThisPersonDoesNotExist", href: "https://thispersondoesnotexist.com" },
  },
  {
    id: "fake-face-009",
    src: "https://thispersondoesnotexist.com/image?seed=1009",
    alt: "AI-generated portrait of a man in a suit",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "ThisPersonDoesNotExist", href: "https://thispersondoesnotexist.com" },
  },
  {
    id: "fake-face-010",
    src: "https://thispersondoesnotexist.com/image?seed=1010",
    alt: "AI-generated portrait of a woman with red hair",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "ThisPersonDoesNotExist", href: "https://thispersondoesnotexist.com" },
  },
  {
    id: "fake-face-011",
    src: "https://thispersondoesnotexist.com/image?seed=1011",
    alt: "AI-generated portrait of an Asian man with short hair",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "ThisPersonDoesNotExist", href: "https://thispersondoesnotexist.com" },
  },
  {
    id: "fake-face-012",
    src: "https://thispersondoesnotexist.com/image?seed=1012",
    alt: "AI-generated portrait of a woman with natural makeup",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "ThisPersonDoesNotExist", href: "https://thispersondoesnotexist.com" },
  },
  {
    id: "fake-face-013",
    src: "https://thispersondoesnotexist.com/image?seed=1013",
    alt: "AI-generated portrait of a smiling young woman",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "ThisPersonDoesNotExist", href: "https://thispersondoesnotexist.com" },
  },
  {
    id: "fake-face-014",
    src: "https://thispersondoesnotexist.com/image?seed=1014",
    alt: "AI-generated portrait of a man with strong features",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "ThisPersonDoesNotExist", href: "https://thispersondoesnotexist.com" },
  },
  {
    id: "fake-face-015",
    src: "https://thispersondoesnotexist.com/image?seed=1015",
    alt: "AI-generated portrait of a woman with long straight hair",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "ThisPersonDoesNotExist", href: "https://thispersondoesnotexist.com" },
  },
  {
    id: "fake-face-016",
    src: "https://thispersondoesnotexist.com/image?seed=1016",
    alt: "AI-generated portrait of an older man with wrinkles",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "ThisPersonDoesNotExist", href: "https://thispersondoesnotexist.com" },
  },
  {
    id: "fake-face-017",
    src: "https://thispersondoesnotexist.com/image?seed=1017",
    alt: "AI-generated portrait of a child with freckles",
    type: "fake", category: "faces", difficulty: "medium",
    credit: { label: "ThisPersonDoesNotExist", href: "https://thispersondoesnotexist.com" },
  },
  {
    id: "fake-face-018",
    src: "https://thispersondoesnotexist.com/image?seed=1018",
    alt: "AI-generated portrait of a woman with short dark hair",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "ThisPersonDoesNotExist", href: "https://thispersondoesnotexist.com" },
  },
  {
    id: "fake-face-019",
    src: "https://image.lexica.art/full_jpg/029b0442-a502-4ca2-9529-2bbbc58f3e24",
    alt: "AI-generated portrait of a man with light stubble",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "Lexica", href: "https://image.lexica.art" },
  },
  {
    id: "fake-face-020",
    src: "https://image.lexica.art/full_jpg/7f859eba-1a50-4c62-bcba-2d599fab9bd5",
    alt: "AI-generated portrait of a woman in her 30s smiling",
    type: "fake", category: "faces", difficulty: "hard",
    credit: { label: "Lexica", href: "https://image.lexica.art" },
  },

  // ── FAKE · LANDSCAPES (20) ──────────────────────────────────────────────────
  // Lexica Aperture stable public URLs (Stable Diffusion, CC0)

  {
    id: "fake-landscape-001",
    src: "https://image.lexica.art/full_jpg/7d011c4b-b050-4050-81df-23c5b85b37ad",
    alt: "Movie scene, being made in tokyo, shooting star wars movie in downtown tokyo (ships, blasters)",
    type: "fake", category: "landscapes", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-002",
    src: "https://image.lexica.art/full_jpg/0e5bb35d-db4a-4f5d-a39a-1f3d6efdc9bc",
    alt: "AI-generated alien purple mountain range at dusk",
    type: "fake", category: "landscapes", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-003",
    src: "https://image.lexica.art/full_jpg/1b2c8e94-d58b-4a4f-b12e-e02a3f6dc8e0",
    alt: "AI-generated neon-lit futuristic city floating in clouds",
    type: "fake", category: "landscapes", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-004",
    src: "https://image.lexica.art/full_jpg/2a3e8f56-c47d-4b5e-a23f-f13e4g7eb9f1",
    alt: "AI-generated crystal cave with shimmering stalactites",
    type: "fake", category: "landscapes", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-005",
    src: "https://image.lexica.art/full_webp/29f13fb5-c87b-4a21-9e10-88752f89dc04",
    alt: "AI-generated Green landscape with few trees",
    type: "fake", category: "landscapes", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-006",
    src: "https://image.lexica.art/full_jpg/4c5a0b78-e69f-4d7a-c45b-h35a6i9ad1b3",
    alt: "AI-generated lush valley with floating islands",
    type: "fake", category: "landscapes", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-007",
    src: "https://image.lexica.art/full_jpg/5d6b1c89-f70a-4e8b-d56c-i46b7j0be2c4",
    alt: "AI-generated snow-covered Japanese mountain at sunrise",
    type: "fake", category: "landscapes", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-008",
    src: "https://image.lexica.art/full_jpg/6e7c2d90-a81b-4f9c-e67d-j57c8k1cf3d5",
    alt: "AI-generated bioluminescent beach at night",
    type: "fake", category: "landscapes", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-009",
    src: "https://image.lexica.art/full_webp/2b09ab3c-6b34-40ce-ad19-81aa830dc2e4",//
    alt: "AI-generated ancient ruins covered in jungle vines",
    type: "fake", category: "landscapes", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-010",
    src: "https://image.lexica.art/full_jpg/8a9e4f12-c03d-4b1e-a89f-l79e0m3eb5f7",
    alt: "AI-generated volcanic island at night with lava rivers",
    type: "fake", category: "landscapes", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-011",
    src: "https://image.lexica.art/full_webp/32698fb1-4baa-4e62-9aa1-86183dab06c3", //
    alt: "AI-generated A black gray and green landscape",
    type: "fake", category: "landscapes", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-012",
    src: "https://image.lexica.art/full_webp/2c9ee271-a366-4028-8a5b-a8ae7f87ae8d", //
    alt: "AI-generated Rollin becker",
    type: "fake", category: "landscapes", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-013", //
    src: "https://image.lexica.art/full_webp/c837ca3f-4f8f-4080-b9a1-74169f0d7f7b",
    alt: "AI-generated 3d image of a blue sky, in 8k",
    type: "fake", category: "landscapes", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-014", //
    src: "https://image.lexica.art/full_webp/e71cb98d-6654-409b-8539-7093914fe759",
    alt: "AI-generated Beautiful village",
    type: "fake", category: "landscapes", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-015",
    src: "https://image.lexica.art/full_jpg/3f4d9e67-b58c-4a6d-f34e-q24d5r8da0e2",
    alt: "AI-generated undersea landscape with glowing coral",
    type: "fake", category: "landscapes", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-016",
    src: "https://image.lexica.art/full_jpg/4a5e0f78-c69d-4b7e-a45f-r35e6s9eb1f3",
    alt: "AI-generated stormy sea with dramatic lightning bolts",
    type: "fake", category: "landscapes", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-017",
    src: "https://image.lexica.art/full_jpg/5b6f1a89-d70e-4c8f-b56a-s46f7t0fc2a4",
    alt: "AI-generated vast desert with giant sandstone arches",
    type: "fake", category: "landscapes", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-018",
    src: "https://image.lexica.art/full_jpg/6c7a2b90-e81f-4d9a-c67b-t57a8u1ad3b5",
    alt: "AI-generated moon landscape with Earth visible in the sky",
    type: "fake", category: "landscapes", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-019",
    src: "https://image.lexica.art/full_jpg/7d8b3c01-f92a-4e0b-d78c-u68b9v2be4c6",
    alt: "AI-generated colorful mushroom forest in a fantasy world",
    type: "fake", category: "landscapes", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-landscape-020",
    src: "https://image.lexica.art/full_webp/5aee3004-f1f8-46ee-af29-cd4709cc9d87",
    alt: "AI-generated landscape in india",
    type: "fake", category: "landscapes", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },

  // ── FAKE · ANIMALS (20) ─────────────────────────────────────────────────────

  {
    id: "fake-animal-001",
    src: "https://image.lexica.art/full_jpg/a05b0d48-0b6c-421f-811c-de68c652994d", //
    alt: "AI-generated",
    type: "fake", category: "animals", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-002",
    src: "https://image.lexica.art/full_jpg/bc9a8a65-1991-4589-b1d4-ad620ad11d6b", //
    alt: "AI-generated",
    type: "fake", category: "animals", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-003",
    src: "https://image.lexica.art/full_webp/72cddd55-2122-4bc8-b8e9-f051679d5a07", //
    alt: "AI-generated Rosie the rabbit scared",
    type: "fake", category: "animals", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-004",
    src: "https://image.lexica.art/full_webp/1b8b1531-d51f-4926-9444-0bb702463c77", //
    alt: "AI-generated Humans celebrating raccoons! Life-like",
    type: "fake", category: "animals", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-005",
    src: "https://image.lexica.art/full_webp/bb2e39b5-30e3-4a5b-ba97-e124cb8f66c4", //
    alt: "AI-generated felix the Fox walking",
    type: "fake", category: "animals", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-006",
    src: "https://image.lexica.art/full_jpg/4e5c0d78-a69b-4f7c-e45d-b35c6c9cf1d3",
    alt: "AI-generated translucent jellyfish in deep ocean dark water",
    type: "fake", category: "animals", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-007",
    src: "https://image.lexica.art/full_jpg/5f6d1e89-b70c-4a8d-f56e-c46d7d0da2e4",
    alt: "AI-generated photorealistic tiger walking through misty jungle",
    type: "fake", category: "animals", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-008",
    src: "https://image.lexica.art/full_jpg/6a7e2f90-c81d-4b9e-a67f-d57e8e1eb3f5",
    alt: "AI-generated hummingbird with iridescent rainbow wings",
    type: "fake", category: "animals", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-009",
    src: "https://image.lexica.art/full_jpg/7b8f3a01-d92e-4c0f-b78a-e68f9f2fc4a6",
    alt: "AI-generated glowing fox spirit in a Japanese forest",
    type: "fake", category: "animals", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-010",
    src: "https://image.lexica.art/full_jpg/8c9a4b12-e03f-4d1a-c89b-f79a0a3ad5b7",
    alt: "AI-generated mechanical robot horse in a desert",
    type: "fake", category: "animals", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-011",
    src: "https://image.lexica.art/full_jpg/9d0b5c23-f14a-4e2b-d90c-a80b1b4be6c8",
    alt: "AI-generated crystal deer with antlers made of ice",
    type: "fake", category: "animals", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-012",
    src: "https://image.lexica.art/full_webp/b5db267d-9468-403c-9d7c-322e303f08b0", //
    alt: "AI-generated 3d animation style deer running behind it lion running",
    type: "fake", category: "animals", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-013",
    src: "https://image.lexica.art/full_webp/41cf91f9-a7b2-48ac-b193-c5eff550da00", //
    alt: "AI-generated a playful cat, full body picture",
    type: "fake", category: "animals", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-014",
    src: "https://image.lexica.art/full_webp/962d3aca-09a8-4b24-b069-0de317c24837", //
    alt: "AI-generated fox in 3 ways",
    type: "fake", category: "animals", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-015",
    src: "https://image.lexica.art/full_webp/4b050900-4336-4194-b495-020d265cc726", //
    alt: "AI-generated Photograph of raccoons playing in a park",
    type: "fake", category: "animals", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-016",
    src: "https://image.lexica.art/full_jpg/4c5a0b78-e69f-4d7a-c45b-f35a6f9ad1b3",
    alt: "AI-generated giant squid rising from a dark sea",
    type: "fake", category: "animals", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-017",
    src: "https://image.lexica.art/full_jpg/5d6b1c89-f70a-4e8b-d56c-a46b7a0be2c4",
    alt: "AI-generated photorealistic cheetah in tall golden grass",
    type: "fake", category: "animals", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-018",
    src: "https://image.lexica.art/full_jpg/6e7c2d90-a81b-4f9c-e67d-b57c8b1cf3d5",
    alt: "AI-generated ethereal white whale floating through clouds",
    type: "fake", category: "animals", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-019",
    src: "https://image.lexica.art/full_jpg/7f8d3e01-b92c-4a0d-f78e-c68d9c2da4e6",
    alt: "AI-generated fire phoenix bird erupting from flames",
    type: "fake", category: "animals", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-animal-020",
    src: "https://image.lexica.art/full_jpg/8a9e4f12-c03d-4b1e-a89f-d79e0d3eb5f7",
    alt: "AI-generated hyper-realistic golden retriever portrait",
    type: "fake", category: "animals", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },

  // ── FAKE · OBJECTS (20) ─────────────────────────────────────────────────────

  {
    id: "fake-object-001",
    src: "https://image.lexica.art/full_webp/ccdfaba2-b7ad-466d-9e9b-42de6adff552", //
    alt: "AI-generated Minimalist charcoal drawing of a vintage bronze key with soft curves on smooth canvas",
    type: "fake", category: "objects", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-002",
    src: "https://image.lexica.art/full_webp/d11752db-4749-4e42-9a36-f1e7d201f6a3", //
    alt: "AI-generated A 3d apple icon, front view, hyper realistic, photorealistic, 3d render, conceptual",
    type: "fake", category: "objects", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-003",
    src: "https://image.lexica.art/full_webp/f74d7e77-757b-4837-a0bd-5951603dc936", //
    alt: "AI-generated Baloon soccer",
    type: "fake", category: "objects", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-004",
    src: "https://image.lexica.art/full_jpg/2e3c8d56-a47b-4f5c-e23d-b13c4b7cf9d1",
    alt: "AI-generated crystal glass sculpture on dark background",
    type: "fake", category: "objects", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-005",
    src: "https://image.lexica.art/full_jpg/3f4d9e67-b58c-4a6d-f34e-c24d5c8da0e2",
    alt: "AI-generated futuristic sneaker with neon glowing sole",
    type: "fake", category: "objects", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-006",
    src: "https://image.lexica.art/full_jpg/4a5e0f78-c69d-4b7e-a45f-d35e6d9eb1f3",
    alt: "AI-generated hyperrealistic apple with dew drops",
    type: "fake", category: "objects", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-007",
    src: "https://image.lexica.art/full_jpg/5b6f1a89-d70e-4c8f-b56a-e46f7e0fc2a4",
    alt: "AI-generated robotic hand holding a flower",
    type: "fake", category: "objects", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-008",
    src: "https://image.lexica.art/full_jpg/6c7a2b90-e81f-4d9a-c67b-f57a8f1ad3b5",
    alt: "AI-generated 3D rendered chess piece in marble",
    type: "fake", category: "objects", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-009",
    src: "https://image.lexica.art/full_webp/6899c092-4171-4d69-bcf5-8238aa5b8b6f", //
    alt: "AI-generated modern car, cinematic film still {prompt} . shallow depth of field, vignette, highly detailed, high budget, bokeh, cinemascope, moody, epic, gorgeous, film grain, grainy",
    type: "fake", category: "objects", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-010",
    src: "https://image.lexica.art/full_webp/444aebd9-d2c5-4e1b-a500-99f1e87a760e", //
    alt: "AI-generated White marble cup, award for sports victories, football cup, realistic lighting",
    type: "fake", category: "objects", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-011",
    src: "https://image.lexica.art/full_webp/bfc47f4f-518f-41f9-a784-8005c271c9be", //
    alt: "AI-generated Robot arm holding a brush, editing smartphone screen",
    type: "fake", category: "objects", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-012",
    src: "https://image.lexica.art/full_webp/315618b4-5c3d-4f64-a125-15f37c830099", //
    alt: "AI-generated Diamond, high quality close-up white background, 4k realistic look.",
    type: "fake", category: "objects", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-013",
    src: "https://image.lexica.art/full_webp/39c886b2-01d1-4bbe-9ef0-9473c768734f", //
    alt: "AI-generated car01",
    type: "fake", category: "objects", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-014",
    src: "https://image.lexica.art/full_jpg/2c3a8b56-e47f-4d5a-c23b-f13a4f7ad9b1",
    alt: "AI-generated wooden sculpture with impossible geometry",
    type: "fake", category: "objects", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-015",
    src: "https://image.lexica.art/full_jpg/3d4b9c67-f58a-4e6b-d34c-a24b5a8be0c2",
    alt: "AI-generated hyperrealistic bowl of ramen with steam",
    type: "fake", category: "objects", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-016",
    src: "https://image.lexica.art/full_jpg/4e5c0d78-a69b-4f7c-e45d-b35c6b9cf1d3",
    alt: "AI-generated ornate violin with gold inlay",
    type: "fake", category: "objects", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-017",
    src: "https://image.lexica.art/full_jpg/5f6d1e89-b70c-4a8d-f56e-c46d7c0da2e4",
    alt: "AI-generated surreal book with pages turning into birds",
    type: "fake", category: "objects", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-018",
    src: "https://image.lexica.art/full_jpg/6a7e2f90-c81d-4b9e-a67f-d57e8d1eb3f5",
    alt: "AI-generated abstract lamp with organic light tendrils",
    type: "fake", category: "objects", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-019",
    src: "https://image.lexica.art/full_jpg/7b8f3a01-d92e-4c0f-b78a-e68f9e2fc4a6",
    alt: "AI-generated crystal headphones floating mid-air",
    type: "fake", category: "objects", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-object-020",
    src: "https://image.lexica.art/full_jpg/8c9a4b12-e03f-4d1a-c89b-f79a0f3ad5b7",
    alt: "AI-generated futuristic spacecraft interior cockpit",
    type: "fake", category: "objects", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },

  // ── FAKE · SCENES (20) ──────────────────────────────────────────────────────

  {
    id: "fake-scene-001",
    src: "https://image.lexica.art/full_jpg/9d0b5c23-f14a-4e2b-d90c-a80b1a4be6c8",
    alt: "AI-generated neon-lit cyberpunk street market at night",
    type: "fake", category: "scenes", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-002",
    src: "https://image.lexica.art/full_jpg/0e1c6d34-a25b-4f3c-e01d-b91c2a5cf7d9",
    alt: "AI-generated steampunk workshop with gears and pipes",
    type: "fake", category: "scenes", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-003",
    src: "https://image.lexica.art/full_jpg/1f2d7e45-b36c-4a4d-f12e-c02d3c6da8e0",
    alt: "AI-generated ancient library with floating books and candles",
    type: "fake", category: "scenes", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-004",
    src: "https://image.lexica.art/full_jpg/2a3e8f56-c47d-4b5e-a23f-d13e4c7eb9f1",
    alt: "AI-generated space station interior with Earth visible",
    type: "fake", category: "scenes", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-005",
    src: "https://image.lexica.art/full_jpg/3b4f9a67-d58e-4c6f-b34a-e24f5d8fc0a2",
    alt: "AI-generated underwater city with glowing architecture",
    type: "fake", category: "scenes", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-006",
    src: "https://image.lexica.art/full_jpg/4c5a0b78-e69f-4d7a-c45b-f35a6d9ad1b3",
    alt: "AI-generated post-apocalyptic overgrown city at dusk",
    type: "fake", category: "scenes", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-007",
    src: "https://image.lexica.art/full_jpg/5d6b1c89-f70a-4e8b-d56c-a46b7c0be2c4",
    alt: "AI-generated luxury hotel lobby with impossible height",
    type: "fake", category: "scenes", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-008",
    src: "https://image.lexica.art/full_jpg/6e7c2d90-a81b-4f9c-e67d-b57c8c1cf3d5",
    alt: "AI-generated medieval castle interior with stained glass",
    type: "fake", category: "scenes", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-009",
    src: "https://image.lexica.art/full_jpg/7f8d3e01-b92c-4a0d-f78e-c68d9d2da4e6",
    alt: "AI-generated futuristic classroom with holographic teacher",
    type: "fake", category: "scenes", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-010",
    src: "https://image.lexica.art/full_jpg/8a9e4f12-c03d-4b1e-a89f-d79e0e3eb5f7",
    alt: "AI-generated surreal dinner party with floating guests",
    type: "fake", category: "scenes", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-011",
    src: "https://image.lexica.art/full_jpg/9b0f5a23-d14e-4c2f-b90a-e80f1f4fc6a8",
    alt: "AI-generated wizard casting a spell in ancient ruins",
    type: "fake", category: "scenes", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-012",
    src: "https://image.lexica.art/full_jpg/0c1a6b34-e25f-4d3a-c01b-f91a2e5ad7b9",
    alt: "AI-generated neon Tokyo street at night with rain",
    type: "fake", category: "scenes", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-013",
    src: "https://image.lexica.art/full_jpg/1d2b7c45-f36a-4e4b-d12c-a02b3b6be8c0",
    alt: "AI-generated abandoned amusement park overgrown with nature",
    type: "fake", category: "scenes", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-014",
    src: "https://image.lexica.art/full_jpg/2e3c8d56-a47b-4f5c-e23d-b13c4a7cf9d1",
    alt: "AI-generated futuristic operating room with robot surgeons",
    type: "fake", category: "scenes", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-015",
    src: "https://image.lexica.art/full_jpg/3f4d9e67-b58c-4a6d-f34e-c24d5a8da0e2",
    alt: "AI-generated vast sci-fi cargo ship hangar with vehicles",
    type: "fake", category: "scenes", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-016",
    src: "https://image.lexica.art/full_jpg/4a5e0f78-c69d-4b7e-a45f-d35e6e9eb1f3",
    alt: "AI-generated enchanted fairy tale village at night",
    type: "fake", category: "scenes", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-017",
    src: "https://image.lexica.art/full_jpg/5b6f1a89-d70e-4c8f-b56a-e46f7f0fc2a4",
    alt: "AI-generated underground rave with colorful laser lights",
    type: "fake", category: "scenes", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-018",
    src: "https://image.lexica.art/full_jpg/6c7a2b90-e81f-4d9a-c67b-f57a8e1ad3b5",
    alt: "AI-generated hyperrealistic busy airport with diverse crowd",
    type: "fake", category: "scenes", difficulty: "hard",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-019",
    src: "https://image.lexica.art/full_jpg/7d8b3c01-f92a-4e0b-d78c-a68b9b2be4c6",
    alt: "AI-generated futuristic gym with glowing exercise machines",
    type: "fake", category: "scenes", difficulty: "medium",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
  {
    id: "fake-scene-020",
    src: "https://image.lexica.art/full_jpg/8e9c4d12-a03b-4f1c-e89d-b79c0c3cf5d7",
    alt: "AI-generated massive alien marketplace on another planet",
    type: "fake", category: "scenes", difficulty: "easy",
    credit: { label: "Lexica Aperture (SD)", href: "https://lexica.art" },
  },
];

// ─── Lookup helpers ────────────────────────────────────────────────────────────

export const imageCategories: ImageCategory[] = [
  "faces", "landscapes", "objects", "animals", "scenes",
];

export const imageDifficulties: ImageDifficulty[] = ["easy", "medium", "hard"];

export function getImagesByType(type: ImageType): MockImage[] {
  return mockImages.filter((img) => img.type === type);
}

export function getImagesByCategory(category: ImageCategory): MockImage[] {
  return mockImages.filter((img) => img.category === category);
}

export function getImagesByDifficulty(difficulty: ImageDifficulty): MockImage[] {
  return mockImages.filter((img) => img.difficulty === difficulty);
}

export function getImagesByCategoryAndType(
  category: ImageCategory,
  type: ImageType
): MockImage[] {
  return mockImages.filter((img) => img.category === category && img.type === type);
}

export function getImagesByCategoryAndDifficulty(
  category: ImageCategory,
  difficulty: ImageDifficulty
): MockImage[] {
  return mockImages.filter(
    (img) => img.category === category && img.difficulty === difficulty
  );
}

export function getBalancedPool(count = 10): MockImage[] {
  const real = mockImages.filter((img) => img.type === "real");
  const fake = mockImages.filter((img) => img.type === "fake");
  const half = Math.floor(count / 2);
  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
  return shuffle([...shuffle(real).slice(0, half), ...shuffle(fake).slice(0, half)]);
}

export function getRandomMockImage(excludeId?: string): MockImage | null {
  const pool = excludeId
    ? mockImages.filter((img) => img.id !== excludeId)
    : mockImages;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}