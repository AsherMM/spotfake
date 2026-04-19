import { useCallback, useMemo, useRef, useState } from "react";
import type {
  Answer,
  Difficulty,
  ImageCategory,
  MockImage,
  RoundSeed,
} from "@/app/components/game-preview.types";
import {
  GLOBAL_RECENT_HISTORY_SIZE,
  PRELOAD_BUFFER_SIZE,
  RECENT_HISTORY_SIZE,
} from "@/app/components/game-preview.constants";
import {
  countRecentCategoryStreak,
  countRecentTypeStreak,
  getAdaptiveDifficulty,
  hasImages,
  loadGlobalRecentHistory,
  preloadImage,
  saveGlobalRecentHistory,
  weightedPickIndex,
} from "@/app/components/game-preview.utils";

type UseGameRandomizerParams = {
  images: MockImage[];
};

export function useGameRandomizer({ images }: UseGameRandomizerParams) {
  const [globalRecentHistory, setGlobalRecentHistory] = useState<number[]>(() =>
    loadGlobalRecentHistory()
  );

  const recentIndexesRef = useRef<number[]>([]);

  const rng = useMemo(() => {
    return () => Math.random();
  }, []);

  const pickNextIndex = useCallback(
    (params: {
      excludeIndex?: number;
      difficulty: Difficulty;
      recentIndexes: number[];
      globalRecentIndexes?: number[];
      lastType?: Answer;
      lastCategory?: ImageCategory;
      random: () => number;
    }): number => {
      const {
        excludeIndex = -1,
        difficulty: _difficulty,
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

        if (!recentSet.has(index)) weight += 18;
        else weight -= 12;

        if (!globalRecentSet.has(index)) weight += 5;
        else weight -= 3;

        if (lastType) {
          if (img.type !== lastType) weight += 6;
          else weight -= 3;
        }

        if (typeStreak >= 2 && lastType) {
          if (img.type === lastType) weight -= 8;
          else weight += 8;
        }

        if (typeStreak >= 3 && lastType) {
          if (img.type === lastType) weight -= 12;
          else weight += 10;
        }

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

        const recentWindow = recentIndexes
          .slice(-8)
          .map((i) => images[i]?.difficulty)
          .filter(Boolean);

        const sameDifficultyCount = recentWindow.filter(
          (d) => d === img.difficulty
        ).length;

        if (sameDifficultyCount <= 1) {
          weight += 3;
        } else if (sameDifficultyCount >= 4) {
          weight -= 4;
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
      difficulty: "easy",
      recentIndexes: [],
      globalRecentIndexes: globalRecentHistory,
      lastType: undefined,
      lastCategory: undefined,
      random: rng,
    });

    const firstImage = images[first];

    const second = pickNextIndex({
      excludeIndex: first,
      difficulty: "easy",
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
      nextScore: number;
      avgReactionMs: number;
    }) => {
      const { currentIndex, nextScore, avgReactionMs } = params;

      const current = images[currentIndex];

      const recent = [...recentIndexesRef.current, currentIndex].slice(
        -RECENT_HISTORY_SIZE
      );

      recentIndexesRef.current = recent;

      const targetDifficulty = getAdaptiveDifficulty(nextScore, avgReactionMs);

      const nextCurrent = pickNextIndex({
        excludeIndex: currentIndex,
        difficulty: targetDifficulty,
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
        difficulty: targetDifficulty,
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
      baseScore: number;
      avgReactionMs: number;
    }) => {
      const { currentIndex, baseScore, avgReactionMs } = params;

      const currentImage = images[currentIndex];
      if (!currentImage) return;

      let tempExclude = currentIndex;
      let tempRecent = [...recentIndexesRef.current, currentIndex].slice(
        -RECENT_HISTORY_SIZE
      );
      let tempLastType = currentImage.type;
      let tempLastCategory = currentImage.category;

      const targetDifficulty = getAdaptiveDifficulty(baseScore, avgReactionMs);

      for (let i = 0; i < PRELOAD_BUFFER_SIZE; i += 1) {
        const idx = pickNextIndex({
          excludeIndex: tempExclude,
          difficulty: targetDifficulty,
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