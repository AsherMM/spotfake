/**
 * mock-images.ts
 *
 * Image pool for Spotfake: real vs AI-generated classification.
 *
 * ─ Real images (100)   · Unsplash stable CDN URLs, Unsplash License
 * ─ Fake images  (25)   · Local AI-generated images in /public/imgs/{category}/
 *
 * Structure: 5 categories × (20 real + 5 fake) = 125 total images.
 *
 * Fake image paths follow the convention:
 *   /imgs/{category}/{category}0{N}.png   (N = 1..5)
 */

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export type ImageType = "real" | "fake";

export type ImageCategory =
  | "faces"
  | "landscapes"
  | "objects"
  | "animals"
  | "scenes";

export type ImageCredit = {
  label: string;
  href: string;
};

export type MockImage = {
  id: string;
  src: string;
  alt: string;
  type: ImageType;
  category: ImageCategory;
  credit?: ImageCredit;
};

// ──────────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────────

export const imageCategories: ImageCategory[] = [
  "faces",
  "landscapes",
  "animals",
  "objects",
  "scenes",
];

const UNSPLASH_CREDIT = (href: string): ImageCredit => ({
  label: "Unsplash",
  href,
});

const LOCAL_AI_CREDIT: ImageCredit = {
  label: "AI-generated",
  href: "/imgs",
};

// ──────────────────────────────────────────────────────────────────────────────
// REAL IMAGES — 100 total (20 per category)
// Source: Unsplash CDN — stable URLs, Unsplash License
// ──────────────────────────────────────────────────────────────────────────────

const realFaces: MockImage[] = [
  {
    id: "real-faces-01",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=85",
    alt: "Woman smiling with soft natural light",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/rDEOVtE7vOs"),
  },
  {
    id: "real-faces-02",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=85",
    alt: "Man with beard looking directly at the camera",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/d1UPkiFd04A"),
  },
  {
    id: "real-faces-03",
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=85",
    alt: "Close-up portrait of a woman smiling outdoors",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/SJvDxw0azqw"),
  },
  {
    id: "real-faces-04",
    src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=85",
    alt: "Young woman with freckles in natural light",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/d2MSDujJl2g"),
  },
  {
    id: "real-faces-05",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85",
    alt: "Man with short hair smiling in urban setting",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/MTZTGvDsHFY"),
  },
  {
    id: "real-faces-06",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1200&q=85",
    alt: "Woman with curly hair laughing",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/TXxiFuQLBKQ"),
  },
  {
    id: "real-faces-07",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=1200&q=85",
    alt: "Man wearing glasses with calm expression",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/FVh_yqLR9eA"),
  },
  {
    id: "real-faces-08",
    src: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=85",
    alt: "Blonde woman with light makeup portrait",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/c_GmwfHBDzk"),
  },
  {
    id: "real-faces-09",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85",
    alt: "Young woman in studio portrait with dramatic lighting",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/ZHvM3XIOHoE"),
  },
  {
    id: "real-faces-10",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=85",
    alt: "Woman with dark hair and bold eyeliner",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/pHANr-CpbYM"),
  },
  {
    id: "real-faces-11",
    src: "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=1200&q=85",
    alt: "Elderly man with kind eyes and a warm smile",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/itTHOJ-PvUw"),
  },
  {
    id: "real-faces-12",
    src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=85",
    alt: "Man in business attire with confident look",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/WNoLnJo7tS8"),
  },
  {
    id: "real-faces-13",
    src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1200&q=85",
    alt: "Young woman with a bright smile in daylight",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/roX3dn9mPMk"),
  },
  {
    id: "real-faces-14",
    src: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=1200&q=85",
    alt: "Man with dark hair smiling against a light background",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/iFgRcqHznqg"),
  },
  {
    id: "real-faces-15",
    src: "https://images.unsplash.com/photo-1546961342-ea5f70d193d9?auto=format&fit=crop&w=1200&q=85",
    alt: "Woman portrait with serious expression in soft shadow",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/QXevDflbl8A"),
  },
  {
    id: "real-faces-16",
    src: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=1200&q=85",
    alt: "Young man with stubble in casual setting",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/HaNi1rsZJPs"),
  },
  {
    id: "real-faces-17",
    src: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=1200&q=85",
    alt: "Woman laughing with eyes closed outdoors",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/Yn0l7uwBrpw"),
  },
  {
    id: "real-faces-18",
    src: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=1200&q=85",
    alt: "Man in grey hoodie looking to the side",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/3MEsUTDiiec"),
  },
  {
    id: "real-faces-19",
    src: "https://images.unsplash.com/photo-1596075780750-81249df16d19?auto=format&fit=crop&w=1200&q=85",
    alt: "Woman with red lipstick and sharp look",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/aGataBiW9Qs"),
  },
  {
    id: "real-faces-20",
    src: "https://images.unsplash.com/photo-1602233158242-3ba0ac4d2167?auto=format&fit=crop&w=1200&q=85",
    alt: "Woman with natural hair in warm afternoon light",
    type: "real",
    category: "faces",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/yAMRQAIABgs"),
  },
];

const realLandscapes: MockImage[] = [
  {
    id: "real-landscapes-01",
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85",
    alt: "Lake surrounded by mountains under a dramatic sky",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/IEiAmhXehwE"),
  },
  {
    id: "real-landscapes-02",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
    alt: "Mountain range at golden hour with warm tones",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/wMzx2nBdeng"),
  },
  {
    id: "real-landscapes-03",
    src: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1200&q=85",
    alt: "Grassy field under dramatic storm clouds",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/7_fOAa8sQBE"),
  },
  {
    id: "real-landscapes-04",
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85",
    alt: "Jagged mountain peak with snow and blue sky",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/HkN64BISuQA"),
  },
  {
    id: "real-landscapes-05",
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=85",
    alt: "Forest path leading into the trees in autumn light",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/Coibn5eqsLo"),
  },
  {
    id: "real-landscapes-06",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=85",
    alt: "Rocky canyon bathed in warm sunlight",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/TIrXot28Znc"),
  },
  {
    id: "real-landscapes-07",
    src: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=1200&q=85",
    alt: "Desert sand dunes at sunset with long shadows",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/xkhMEMiCMkk"),
  },
  {
    id: "real-landscapes-08",
    src: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=1200&q=85",
    alt: "Ocean waves crashing against coastal rocks",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/2XOBgHMDEnE"),
  },
  {
    id: "real-landscapes-09",
    src: "https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&w=1200&q=85",
    alt: "Snowy pine forest in winter with foggy atmosphere",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/pn_o6UBHSAI"),
  },
  {
    id: "real-landscapes-10",
    src: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?auto=format&fit=crop&w=1200&q=85",
    alt: "Waterfall flowing over mossy rocks in a green forest",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/3l3RwQdHRtg"),
  },
  {
    id: "real-landscapes-11",
    src: "https://images.unsplash.com/photo-1494791368093-85217fbbf8de?auto=format&fit=crop&w=1200&q=85",
    alt: "Rolling hills in the countryside under a clear blue sky",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/1Z2niiBPg5A"),
  },
  {
    id: "real-landscapes-12",
    src: "https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?auto=format&fit=crop&w=1200&q=85",
    alt: "Dramatic volcanic landscape with dark lava fields",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/DiKkJKvDi64"),
  },
  {
    id: "real-landscapes-13",
    src: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?auto=format&fit=crop&w=1200&q=85",
    alt: "Aerial view of green farmland and winding river",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/eOpewngf68w"),
  },
  {
    id: "real-landscapes-14",
    src: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=85",
    alt: "Northern lights over a snowy mountain landscape",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/ESkw2ayO2As"),
  },
  {
    id: "real-landscapes-15",
    src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=85",
    alt: "Misty mountain valley at dawn with soft light",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/MgC89f5b__s"),
  },
  {
    id: "real-landscapes-16",
    src: "https://images.unsplash.com/photo-1510797215324-95aa89f43c33?auto=format&fit=crop&w=1200&q=85",
    alt: "Tropical beach with turquoise water and palm trees",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/aVeKubCF-48"),
  },
  {
    id: "real-landscapes-17",
    src: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=1200&q=85",
    alt: "Sunflower field stretching to the horizon",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/sp-p7uuT0tw"),
  },
  {
    id: "real-landscapes-18",
    src: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=1200&q=85",
    alt: "Icy glacier landscape with crevasses and blue light",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/r0cNONqEmBY"),
  },
  {
    id: "real-landscapes-19",
    src: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=1200&q=85",
    alt: "Autumn forest with orange and red foliage",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/OKjAEVN1whE"),
  },
  {
    id: "real-landscapes-20",
    src: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=1200&q=85",
    alt: "Open road cutting through flat plains at dusk",
    type: "real",
    category: "landscapes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/dN_t8fzOtHI"),
  },
];

const realAnimals: MockImage[] = [
  {
    id: "real-animals-01",
    src: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=85",
    alt: "Two dogs running together on a grassy field",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/Doge"),
  },
  {
    id: "real-animals-02",
    src: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=85",
    alt: "Golden retriever lying on a couch looking at camera",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/rSkMFc7grfU"),
  },
  {
    id: "real-animals-03",
    src: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=85",
    alt: "Red fox standing alert in snowy winter landscape",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/IuJc2qh2TcA"),
  },
  {
    id: "real-animals-04",
    src: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=1200&q=85",
    alt: "Husky dog with bright blue eyes in a close-up portrait",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/9UUoGaaHtNE"),
  },
  {
    id: "real-animals-05",
    src: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=1200&q=85",
    alt: "Cat with orange fur resting on a wooden surface",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/7GX5aICb5i4"),
  },
  {
    id: "real-animals-06",
    src: "https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=1200&q=85",
    alt: "Wild horse galloping through an open field",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/YCPkW_r_6uA"),
  },
  {
    id: "real-animals-07",
    src: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=1200&q=85",
    alt: "Sea turtle swimming through clear blue water",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/YnAmouyNv4M"),
  },
  {
    id: "real-animals-08",
    src: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=1200&q=85",
    alt: "Baby elephant standing near its mother in dry savanna",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/xkhMEMiCMkk"),
  },
  {
    id: "real-animals-09",
    src: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=1200&q=85",
    alt: "Puffin bird perched on a rocky cliff edge",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/1TkIABxr1Qs"),
  },
  {
    id: "real-animals-10",
    src: "https://images.unsplash.com/photo-1504006833117-8886a355efbf?auto=format&fit=crop&w=1200&q=85",
    alt: "White rabbit sitting in a grassy outdoor area",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/VnVMFM9TWUY"),
  },
  {
    id: "real-animals-11",
    src: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=1200&q=85",
    alt: "Flamingo standing in shallow water at golden hour",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/oChTGFHMqoo"),
  },
  {
    id: "real-animals-12",
    src: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=85",
    alt: "Majestic lion resting in the African savanna",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/IuJc2qh2TcA"),
  },
  {
    id: "real-animals-13",
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85",
    alt: "Parrot with vivid blue and green feathers on a branch",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/Q1p7bh3SHj8"),
  },
  {
    id: "real-animals-14",
    src: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=85",
    alt: "Brown bear standing in a river catching salmon",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/IuJc2qh2TcA"),
  },
  {
    id: "real-animals-15",
    src: "https://images.unsplash.com/photo-1517022812141-23620dba5c23?auto=format&fit=crop&w=1200&q=85",
    alt: "Sheep grazing in a green meadow",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/OkToF3jEMcI"),
  },
  {
    id: "real-animals-16",
    src: "https://images.unsplash.com/photo-1507666405895-422eee7d517f?auto=format&fit=crop&w=1200&q=85",
    alt: "Dolphin leaping out of ocean water",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/HQqIOc8oYro"),
  },
  {
    id: "real-animals-17",
    src: "https://images.unsplash.com/photo-1548546738-8509cb246ed3?auto=format&fit=crop&w=1200&q=85",
    alt: "Owl perched on a branch with piercing eyes",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/zYbSHgXyEOQ"),
  },
  {
    id: "real-animals-18",
    src: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=1200&q=85",
    alt: "Colorful fish in a coral reef underwater",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/YnAmouyNv4M"),
  },
  {
    id: "real-animals-19",
    src: "https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=1200&q=85",
    alt: "Baby monkey clinging to its mother in a forest",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/c3XkV0R9mbY"),
  },
  {
    id: "real-animals-20",
    src: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=85",
    alt: "Two dogs playing together in a sunny park",
    type: "real",
    category: "animals",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/EOavFEFnSPs"),
  },
];

const realObjects: MockImage[] = [
  {
    id: "real-objects-01",
    src: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=85",
    alt: "Modern smartphone on a wooden desk",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/KgLtFCgfC28"),
  },
  {
    id: "real-objects-02",
    src: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=85",
    alt: "Open laptop on a minimal white workspace",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/iar-afB0QQw"),
  },
  {
    id: "real-objects-03",
    src: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=85",
    alt: "Instant camera lying on a pastel pink background",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/ZEiAetNe5N0"),
  },
  {
    id: "real-objects-04",
    src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85",
    alt: "Cup of black coffee on a rustic wooden table",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/N3o-leQyFsI"),
  },
  {
    id: "real-objects-05",
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85",
    alt: "Red Nike sneakers on a clean white surface",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/US9Tc9pKNBU"),
  },
  {
    id: "real-objects-06",
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
    alt: "Premium watch laid flat on a dark surface",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/tIfrzHMm4T8"),
  },
  {
    id: "real-objects-07",
    src: "https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?auto=format&fit=crop&w=1200&q=85",
    alt: "Stack of old worn books on a shelf",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/cH_8MKpM4bQ"),
  },
  {
    id: "real-objects-08",
    src: "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=1200&q=85",
    alt: "Bicycle leaning against a brick wall in a city",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/lBgTfFNjkuI"),
  },
  {
    id: "real-objects-09",
    src: "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=1200&q=85",
    alt: "Neon signs and city lights at night",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/O3xpvc7ySLU"),
  },
  {
    id: "real-objects-10",
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85",
    alt: "Mechanical keyboard with RGB backlight",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/OqtafYT5kTw"),
  },
  {
    id: "real-objects-11",
    src: "https://images.unsplash.com/photo-1473188588951-666fce8e7c68?auto=format&fit=crop&w=1200&q=85",
    alt: "Glass perfume bottle with soft reflective light",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/eDgUyGu93Yw"),
  },
  {
    id: "real-objects-12",
    src: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=85",
    alt: "Tech flatlay with devices and accessories on a desk",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/C2uuUMbMvWg"),
  },
  {
    id: "real-objects-13",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85",
    alt: "Vintage film camera on a wooden table",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/MTZTGvDsHFY"),
  },
  {
    id: "real-objects-14",
    src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85",
    alt: "White over-ear headphones on a clean surface",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/pTeZKi29EYE"),
  },
  {
    id: "real-objects-15",
    src: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=85",
    alt: "Sports equipment laid out on a gym floor",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/ueJ2oNO7y58"),
  },
  {
    id: "real-objects-16",
    src: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=85",
    alt: "Potted succulent plants arranged on a windowsill",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/bIZJNBMz_4s"),
  },
  {
    id: "real-objects-17",
    src: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=85",
    alt: "Ceramic mug with steam rising from hot drink",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/SqBkLt_HbFU"),
  },
  {
    id: "real-objects-18",
    src: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=85",
    alt: "Running shoes on a track in motion blur",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/9LkqymZFCrE"),
  },
  {
    id: "real-objects-19",
    src: "https://images.unsplash.com/photo-1479064555552-3ef4d0d26abf?auto=format&fit=crop&w=1200&q=85",
    alt: "Polaroid photos spread across a wooden floor",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/VBe9zj-JHBs"),
  },
  {
    id: "real-objects-20",
    src: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=85",
    alt: "Apple MacBook Pro on a glass desk",
    type: "real",
    category: "objects",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/4c3OD-8bfuU"),
  },
];

const realScenes: MockImage[] = [
  {
    id: "real-scenes-01",
    src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=85",
    alt: "Team collaborating around laptops in a modern office",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/5QgIuuBxKwM"),
  },
  {
    id: "real-scenes-02",
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=85",
    alt: "Business meeting around a conference table",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/5fNmWej4tAA"),
  },
  {
    id: "real-scenes-03",
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
    alt: "Open plan modern office with large windows",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/GWOTvo3qq7U"),
  },
  {
    id: "real-scenes-04",
    src: "https://images.unsplash.com/photo-1476231682828-37e571bc172f?auto=format&fit=crop&w=1200&q=85",
    alt: "Friends having fun at a rooftop party at night",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/8Gg2Ne_uTcM"),
  },
  {
    id: "real-scenes-05",
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85",
    alt: "Restaurant kitchen with chefs preparing dishes",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/TLD6iCOlyb0"),
  },
  {
    id: "real-scenes-06",
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85",
    alt: "Person working alone on laptop in a coffee shop",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/hpjSkU2UYSU"),
  },
  {
    id: "real-scenes-07",
    src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=85",
    alt: "Business people in a formal discussion around a table",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/s9CC2SKySJM"),
  },
  {
    id: "real-scenes-08",
    src: "https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=1200&q=85",
    alt: "Urban street scene at night with motion blur",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/R-HXWCbCBGU"),
  },
  {
    id: "real-scenes-09",
    src: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=1200&q=85",
    alt: "People at a busy food market stall",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/JGpGEMdFwVU"),
  },
  {
    id: "real-scenes-10",
    src: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85",
    alt: "Man in suit walking through a city skyline",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/hkPKKmDVyDM"),
  },
  {
    id: "real-scenes-11",
    src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=85",
    alt: "Futuristic robotics lab with engineers at work",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/ZCHj_2lJP00"),
  },
  {
    id: "real-scenes-12",
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85",
    alt: "Colorful food dishes arranged on a dining table",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/Ngy0B2YWalk"),
  },
  {
    id: "real-scenes-13",
    src: "https://images.unsplash.com/photo-1530099486328-e021101a494a?auto=format&fit=crop&w=1200&q=85",
    alt: "Crowded concert crowd with stage lights",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/P_0R02MqaXA"),
  },
  {
    id: "real-scenes-14",
    src: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=1200&q=85",
    alt: "Children playing in a school classroom",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/oqStl2L5oxI"),
  },
  {
    id: "real-scenes-15",
    src: "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&w=1200&q=85",
    alt: "Hospital emergency room with medical staff",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/s9CC2SKySJM"),
  },
  {
    id: "real-scenes-16",
    src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=85",
    alt: "Modern minimalist living room with natural light",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/1ak6XD_TKAU"),
  },
  {
    id: "real-scenes-17",
    src: "https://images.unsplash.com/photo-1428366890462-dd4baecf492b?auto=format&fit=crop&w=1200&q=85",
    alt: "Gym interior with workout equipment",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/fS3tGOkp0s8"),
  },
  {
    id: "real-scenes-18",
    src: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=85",
    alt: "Live music performance on a stage with lights",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/YrtFlrLo2DQ"),
  },
  {
    id: "real-scenes-19",
    src: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85",
    alt: "Clean bright startup office with standing desks",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/cijiWIwsMB8"),
  },
  {
    id: "real-scenes-20",
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=85",
    alt: "Travel scene with person looking out a train window",
    type: "real",
    category: "scenes",
    credit: UNSPLASH_CREDIT("https://unsplash.com/photos/YI0s5NMq2qQ"),
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// FAKE IMAGES — 25 total (5 per category)
// Source: Local AI-generated images in /public/imgs/{category}/
// File naming convention: {category}0{N}.png (N = 1..5)
// ──────────────────────────────────────────────────────────────────────────────

const CATEGORY_FILENAME_STEM: Record<ImageCategory, string> = {
  faces: "face",
  landscapes: "landscape",
  animals: "animal",
  objects: "object",
  scenes: "scene",
};

function buildFakeImages(category: ImageCategory): MockImage[] {
  const stem = CATEGORY_FILENAME_STEM[category];

  return Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    const index = String(n).padStart(2, "0");
    return {
      id: `fake-${category}-${index}`,
      src: `/imgs/${category}/${stem}${index}.png`,
      alt: `AI-generated ${stem} image ${n}`,
      type: "fake" as const,
      category,
      credit: LOCAL_AI_CREDIT,
    };
  });
}

const fakeFaces = buildFakeImages("faces");
const fakeLandscapes = buildFakeImages("landscapes");
const fakeAnimals = buildFakeImages("animals");
const fakeObjects = buildFakeImages("objects");
const fakeScenes = buildFakeImages("scenes");

// ──────────────────────────────────────────────────────────────────────────────
// Public pool — assembled from all groups
// ──────────────────────────────────────────────────────────────────────────────

export const mockImages: MockImage[] = [
  // Real — grouped by category
  ...realFaces,
  ...realLandscapes,
  ...realAnimals,
  ...realObjects,
  ...realScenes,
  // Fake — grouped by category
  ...fakeFaces,
  ...fakeLandscapes,
  ...fakeAnimals,
  ...fakeObjects,
  ...fakeScenes,
];

// ──────────────────────────────────────────────────────────────────────────────
// Lookup helpers
// ──────────────────────────────────────────────────────────────────────────────

export function getImagesByType(type: ImageType): MockImage[] {
  return mockImages.filter((img) => img.type === type);
}

export function getImagesByCategory(category: ImageCategory): MockImage[] {
  return mockImages.filter((img) => img.category === category);
}

export function getImagesByCategoryAndType(
  category: ImageCategory,
  type: ImageType
): MockImage[] {
  return mockImages.filter(
    (img) => img.category === category && img.type === type
  );
}

export function getBalancedPool(count = 10): MockImage[] {
  const real = getImagesByType("real");
  const fake = getImagesByType("fake");

  const fakeCount = Math.floor(count / 2);
  const realCount = count - fakeCount;

  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  return shuffle([
    ...shuffle(real).slice(0, realCount),
    ...shuffle(fake).slice(0, fakeCount),
  ]);
}

export function getRandomMockImage(excludeId?: string): MockImage | null {
  const pool = excludeId
    ? mockImages.filter((img) => img.id !== excludeId)
    : mockImages;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}