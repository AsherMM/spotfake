import { useCallback, useMemo, useRef, useState } from "react";
import type {
  Answer,
  ImageCategory,
  MockImage,
} from "@/app/components/game-preview.types";
import {
  GLOBAL_RECENT_HISTORY_SIZE,
  PRELOAD_BUFFER_SIZE,
  RECENT_HISTORY_SIZE,
} from "@/app/components/game-preview.constants";
import {
  countRecentCategoryStreak,
  countRecentTypeStreak,
  hasImages,
  loadGlobalRecentHistory,
  preloadImage,
  saveGlobalRecentHistory,
  weightedPickIndex,
} from "@/app/components/game-preview.utils";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

type UseGameRandomizerParams = {
  images: MockImage[];
};

type RoundSeed = {
  currentIndex: number;
  nextIndex: number;
};

type PickNextIndexParams = {
  excludeIndex?: number;
  recentIndexes: number[];
  globalRecentIndexes?: number[];
  lastType?: Answer;
  lastCategory?: ImageCategory;
  random: () => number;
};

// ──────────────────────────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────────────────────────

export function useGameRandomizer({ images }: UseGameRandomizerParams) {
  const [globalRecentHistory, setGlobalRecentHistory] = useState<number[]>(() =>
    loadGlobalRecentHistory()
  );

  const recentIndexesRef = useRef<number[]>([]);
  const rng = useMemo(() => {
    return () => Math.random();
  }, []);

  const pickNextIndex = useCallback(
    (params: PickNextIndexParams): number => {
      const {
        excludeIndex = -1,
        recentIndexes,
        globalRecentIndexes = [],
        lastType,
        lastCategory,
        random,
      } = params;

      if (!hasImages(images)) return -1;
      if (images.length === 1) return 0;

      const recentSet = new Set(recentIndexes);
      const globalRecentSet = new Set(globalRecentIndexes);

      const candidates = images
        .map((img, index) => ({ img, index }))
        .filter(({ index }) => index !== excludeIndex);

      if (candidates.length === 0) return 0;

      const typeStreak = countRecentTypeStreak(images, recentIndexes, lastType);
      const categoryStreak = countRecentCategoryStreak(
        images,
        recentIndexes,
        lastCategory
      );

      const weighted = candidates.map(({ img, index }) => {
        let weight = 10;

        // Locally seen → penalize; unseen → bonus.
        if (!recentSet.has(index)) weight += 18;
        else weight -= 12;

        // Globally seen → mild penalty; unseen → small bonus.
        if (!globalRecentSet.has(index)) weight += 5;
        else weight -= 3;

        // Encourage alternating real/fake.
        if (lastType) {
          if (img.type !== lastType) weight += 6;
          else weight -= 3;
        }

        // Heavier push to break a type streak the longer it gets.
        if (typeStreak >= 2 && lastType) {
          if (img.type === lastType) weight -= 8;
          else weight += 8;
        }
        if (typeStreak >= 3 && lastType) {
          if (img.type === lastType) weight -= 12;
          else weight += 10;
        }

        // Encourage alternating categories.
        if (lastCategory) {
          if (img.category !== lastCategory) weight += 4;
          else weight -= 2;
        }

        if (categoryStreak >= 2 && lastCategory) {
          if (img.category === lastCategory) weight -= 6;
          else weight += 5;
        }
        if (categoryStreak >= 3 && lastCategory) {
          if (img.category === lastCategory) weight -= 10;
          else weight += 7;
        }

        // Age boost: the further back we saw this image, the more weight it gets.
        const localPos = recentIndexes.lastIndexOf(index);
        if (localPos !== -1) {
          const age = recentIndexes.length - localPos;
          weight += Math.max(0, age - 1);
        }

        const globalPos = globalRecentIndexes.lastIndexOf(index);
        if (globalPos !== -1) {
          const age = globalRecentIndexes.length - globalPos;
          weight += Math.max(0, Math.floor(age / 3));
        }

        return {
          index,
          weight: Math.max(1, weight),
        };
      });

      return weightedPickIndex(weighted, random);
    },
    [images]
  );

  const buildInitialRound = useCallback((): RoundSeed => {
    if (!hasImages(images)) {
      return { currentIndex: -1, nextIndex: -1 };
    }

    if (images.length === 1) {
      return { currentIndex: 0, nextIndex: 0 };
    }

    const first = pickNextIndex({
      excludeIndex: -1,
      recentIndexes: [],
      globalRecentIndexes: globalRecentHistory,
      lastType: undefined,
      lastCategory: undefined,
      random: rng,
    });

    const firstImage = images[first];

    const second = pickNextIndex({
      excludeIndex: first,
      recentIndexes: first >= 0 ? [first] : [],
      globalRecentIndexes: globalRecentHistory,
      lastType: firstImage?.type,
      lastCategory: firstImage?.category,
      random: rng,
    });

    return {
      currentIndex: first,
      nextIndex: second,
    };
  }, [globalRecentHistory, images, pickNextIndex, rng]);

  const buildNextRound = useCallback(
    (params: {
      currentIndex: number;
      nextScore?: number;
      avgReactionMs?: number;
    }) => {
      const { currentIndex } = params;

      const current = images[currentIndex];

      const recent = [...recentIndexesRef.current, currentIndex].slice(
        -RECENT_HISTORY_SIZE
      );

      recentIndexesRef.current = recent;

      const nextCurrent = pickNextIndex({
        excludeIndex: currentIndex,
        recentIndexes: recent,
        globalRecentIndexes: globalRecentHistory,
        lastType: current?.type,
        lastCategory: current?.category,
        random: rng,
      });

      const previewBase = [...recent, nextCurrent].slice(-RECENT_HISTORY_SIZE);
      const nextCurrentImage = images[nextCurrent];

      const nextNext = pickNextIndex({
        excludeIndex: nextCurrent,
        recentIndexes: previewBase,
        globalRecentIndexes: globalRecentHistory,
        lastType: nextCurrentImage?.type,
        lastCategory: nextCurrentImage?.category,
        random: rng,
      });

      return {
        nextCurrent,
        nextNext,
      };
    },
    [globalRecentHistory, images, pickNextIndex, rng]
  );

  const preloadLookahead = useCallback(
    (params: {
      currentIndex: number;
      baseScore?: number;
      avgReactionMs?: number;
    }) => {
      const { currentIndex } = params;

      const currentImage = images[currentIndex];
      if (!currentImage) return;

      let tempExclude = currentIndex;
      let tempRecent = [...recentIndexesRef.current, currentIndex].slice(
        -RECENT_HISTORY_SIZE
      );
      let tempLastType: Answer | undefined = currentImage.type;
      let tempLastCategory: ImageCategory | undefined = currentImage.category;

      for (let i = 0; i < PRELOAD_BUFFER_SIZE; i += 1) {
        const idx = pickNextIndex({
          excludeIndex: tempExclude,
          recentIndexes: tempRecent,
          globalRecentIndexes: globalRecentHistory,
          lastType: tempLastType,
          lastCategory: tempLastCategory,
          random: rng,
        });

        const img = images[idx];
        preloadImage(img?.src);

        if (idx >= 0) {
          tempRecent = [...tempRecent, idx].slice(-RECENT_HISTORY_SIZE);
          tempExclude = idx;
          tempLastType = img?.type;
          tempLastCategory = img?.category;
        }
      }
    },
    [globalRecentHistory, images, pickNextIndex, rng]
  );

  const pushGlobalRecent = useCallback((index: number) => {
    if (index < 0) return;

    setGlobalRecentHistory((prev) => {
      const next = [...prev, index].slice(-GLOBAL_RECENT_HISTORY_SIZE);
      saveGlobalRecentHistory(next);
      return next;
    });
  }, []);

  const resetRandomizer = useCallback(() => {
    recentIndexesRef.current = [];
  }, []);

  return {
    globalRecentHistory,
    buildInitialRound,
    buildNextRound,
    preloadLookahead,
    pushGlobalRecent,
    resetRandomizer,
  };
}