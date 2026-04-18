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
  {
    id: "real-face-001",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
    alt: "Portrait of a smiling woman with soft natural lighting",
    type: "real",
    category: "faces",
    difficulty: "easy",
    credit: {
      label: "Unsplash",
      href: "https://unsplash.com",
    },
  },
  {
    id: "real-face-002",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80",
    alt: "Portrait of a man with a beard looking at the camera",
    type: "real",
    category: "faces",
    difficulty: "easy",
    credit: {
      label: "Unsplash",
      href: "https://unsplash.com",
    },
  },
  {
    id: "real-face-003",
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
    alt: "Close-up portrait of a smiling woman outdoors",
    type: "real",
    category: "faces",
    difficulty: "medium",
    credit: {
      label: "Unsplash",
      href: "https://unsplash.com",
    },
  },

  {
    id: "real-landscape-001",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    alt: "Mountain landscape during sunset with warm orange tones",
    type: "real",
    category: "landscapes",
    difficulty: "easy",
    credit: {
      label: "Unsplash",
      href: "https://unsplash.com",
    },
  },
  {
    id: "real-landscape-002",
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    alt: "Lake surrounded by mountains under a cloudy sky",
    type: "real",
    category: "landscapes",
    difficulty: "medium",
    credit: {
      label: "Unsplash",
      href: "https://unsplash.com",
    },
  },
  {
    id: "real-landscape-003",
    src: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1200&q=80",
    alt: "Field of grass with dramatic sky in the background",
    type: "real",
    category: "landscapes",
    difficulty: "hard",
    credit: {
      label: "Unsplash",
      href: "https://unsplash.com",
    },
  },

  {
    id: "real-object-001",
    src: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
    alt: "Smartphone placed on a wooden desk",
    type: "real",
    category: "objects",
    difficulty: "easy",
    credit: {
      label: "Unsplash",
      href: "https://unsplash.com",
    },
  },
  {
    id: "real-object-002",
    src: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80",
    alt: "Headphones photographed on a dark background",
    type: "real",
    category: "objects",
    difficulty: "medium",
    credit: {
      label: "Unsplash",
      href: "https://unsplash.com",
    },
  },
  {
    id: "real-object-003",
    src: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80",
    alt: "Laptop and notebook on a clean workspace",
    type: "real",
    category: "objects",
    difficulty: "medium",
    credit: {
      label: "Unsplash",
      href: "https://unsplash.com",
    },
  },

  {
    id: "real-animal-001",
    src: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80",
    alt: "Dog looking directly into the camera",
    type: "real",
    category: "animals",
    difficulty: "easy",
    credit: {
      label: "Unsplash",
      href: "https://unsplash.com",
    },
  },
  {
    id: "real-animal-002",
    src: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80",
    alt: "Cat resting on a soft blanket",
    type: "real",
    category: "animals",
    difficulty: "easy",
    credit: {
      label: "Unsplash",
      href: "https://unsplash.com",
    },
  },
  {
    id: "real-animal-003",
    src: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80",
    alt: "Fox standing in snow in a winter landscape",
    type: "real",
    category: "animals",
    difficulty: "hard",
    credit: {
      label: "Unsplash",
      href: "https://unsplash.com",
    },
  },

  {
    id: "real-scene-001",
    src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    alt: "Team working together in a modern office",
    type: "real",
    category: "scenes",
    difficulty: "easy",
    credit: {
      label: "Unsplash",
      href: "https://unsplash.com",
    },
  },
  {
    id: "real-scene-002",
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    alt: "People gathered around a table during a meeting",
    type: "real",
    category: "scenes",
    difficulty: "medium",
    credit: {
      label: "Unsplash",
      href: "https://unsplash.com",
    },
  },
  {
    id: "real-scene-003",
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    alt: "Modern office interior with desks and large windows",
    type: "real",
    category: "scenes",
    difficulty: "hard",
    credit: {
      label: "Unsplash",
      href: "https://unsplash.com",
    },
  },

  {
    id: "fake-face-001",
    src: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=1200&q=80",
    alt: "Highly polished portrait used as AI-generated placeholder",
    type: "fake",
    category: "faces",
    difficulty: "easy",
    credit: {
      label: "Placeholder source",
      href: "https://unsplash.com",
    },
  },
  {
    id: "fake-face-002",
    src: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=80",
    alt: "Studio-style face used as AI-generated placeholder",
    type: "fake",
    category: "faces",
    difficulty: "medium",
    credit: {
      label: "Placeholder source",
      href: "https://unsplash.com",
    },
  },
  {
    id: "fake-face-003",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80",
    alt: "Near-perfect portrait used as AI-generated placeholder",
    type: "fake",
    category: "faces",
    difficulty: "hard",
    credit: {
      label: "Placeholder source",
      href: "https://unsplash.com",
    },
  },

  {
    id: "fake-landscape-001",
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    alt: "Dreamlike mountain scenery used as AI-generated placeholder",
    type: "fake",
    category: "landscapes",
    difficulty: "easy",
    credit: {
      label: "Placeholder source",
      href: "https://unsplash.com",
    },
  },
  {
    id: "fake-landscape-002",
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
    alt: "Forest path used as AI-generated placeholder",
    type: "fake",
    category: "landscapes",
    difficulty: "medium",
    credit: {
      label: "Placeholder source",
      href: "https://unsplash.com",
    },
  },
  {
    id: "fake-landscape-003",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    alt: "Sunlit canyon scene used as AI-generated placeholder",
    type: "fake",
    category: "landscapes",
    difficulty: "hard",
    credit: {
      label: "Placeholder source",
      href: "https://unsplash.com",
    },
  },

  {
    id: "fake-object-001",
    src: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80",
    alt: "Tech product scene used as AI-generated placeholder",
    type: "fake",
    category: "objects",
    difficulty: "easy",
    credit: {
      label: "Placeholder source",
      href: "https://unsplash.com",
    },
  },
  {
    id: "fake-object-002",
    src: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    alt: "Laptop setup used as AI-generated placeholder",
    type: "fake",
    category: "objects",
    difficulty: "medium",
    credit: {
      label: "Placeholder source",
      href: "https://unsplash.com",
    },
  },
  {
    id: "fake-object-003",
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    alt: "Keyboard desk setup used as AI-generated placeholder",
    type: "fake",
    category: "objects",
    difficulty: "hard",
    credit: {
      label: "Placeholder source",
      href: "https://unsplash.com",
    },
  },

  {
    id: "fake-animal-001",
    src: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80",
    alt: "Dog portrait used as AI-generated placeholder",
    type: "fake",
    category: "animals",
    difficulty: "easy",
    credit: {
      label: "Placeholder source",
      href: "https://unsplash.com",
    },
  },
  {
    id: "fake-animal-002",
    src: "https://images.unsplash.com/photo-1472491235688-bdc81a63246e?auto=format&fit=crop&w=1200&q=80",
    alt: "Deer in nature used as AI-generated placeholder",
    type: "fake",
    category: "animals",
    difficulty: "medium",
    credit: {
      label: "Placeholder source",
      href: "https://unsplash.com",
    },
  },
  {
    id: "fake-animal-003",
    src: "https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=1200&q=80",
    alt: "Close-up animal image used as AI-generated placeholder",
    type: "fake",
    category: "animals",
    difficulty: "hard",
    credit: {
      label: "Placeholder source",
      href: "https://unsplash.com",
    },
  },

  {
    id: "fake-scene-001",
    src: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
    alt: "Clean office environment used as AI-generated placeholder",
    type: "fake",
    category: "scenes",
    difficulty: "easy",
    credit: {
      label: "Placeholder source",
      href: "https://unsplash.com",
    },
  },
  {
    id: "fake-scene-002",
    src: "https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=1200&q=80",
    alt: "Workspace scene used as AI-generated placeholder",
    type: "fake",
    category: "scenes",
    difficulty: "medium",
    credit: {
      label: "Placeholder source",
      href: "https://unsplash.com",
    },
  },
  {
    id: "fake-scene-003",
    src: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80",
    alt: "Minimal office setup used as AI-generated placeholder",
    type: "fake",
    category: "scenes",
    difficulty: "hard",
    credit: {
      label: "Placeholder source",
      href: "https://unsplash.com",
    },
  },
];

export const imageCategories: ImageCategory[] = [
  "faces",
  "landscapes",
  "objects",
  "animals",
  "scenes",
];

export const imageDifficulties: ImageDifficulty[] = [
  "easy",
  "medium",
  "hard",
];

export function getImagesByType(type: ImageType) {
  return mockImages.filter((image) => image.type === type);
}

export function getImagesByCategory(category: ImageCategory) {
  return mockImages.filter((image) => image.category === category);
}

export function getImagesByDifficulty(difficulty: ImageDifficulty) {
  return mockImages.filter((image) => image.difficulty === difficulty);
}

export function getImagesByCategoryAndDifficulty(
  category: ImageCategory,
  difficulty: ImageDifficulty
) {
  return mockImages.filter(
    (image) =>
      image.category === category && image.difficulty === difficulty
  );
}

export function getRandomMockImage(excludeId?: string) {
  const pool = excludeId
    ? mockImages.filter((image) => image.id !== excludeId)
    : mockImages;

  if (pool.length === 0) return null;

  return pool[Math.floor(Math.random() * pool.length)];
}