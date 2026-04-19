"use client";

import { useCallback, useEffect } from "react";

type UseSpotfakeProtectionParams = {
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
};

export function useSpotfakeProtection({
  onArrowLeft,
  onArrowRight,
  onEnter,
}: UseSpotfakeProtectionParams) {
  const handleProtectedContextMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleProtectedDragStart = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleProtectedCopy = useCallback((e: React.ClipboardEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleProtectedCut = useCallback((e: React.ClipboardEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleProtectedPaste = useCallback((e: React.ClipboardEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleProtectedMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (e.button === 2) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target;

      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.repeat) return;

      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        onArrowLeft?.();
        return;
      }

      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        onArrowRight?.();
        return;
      }

      if (e.key === "Enter") {
        onEnter?.();
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.closest("[data-spotfake-protected='true']")) {
        e.preventDefault();
      }
    };

    const onDragStart = (e: DragEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.closest("[data-spotfake-protected='true']")) {
        e.preventDefault();
      }
    };

    const onSelectStart = (e: Event) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.closest("[data-spotfake-protected='true']")) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("dragstart", onDragStart);
    document.addEventListener("selectstart", onSelectStart);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("selectstart", onSelectStart);
    };
  }, [onArrowLeft, onArrowRight, onEnter]);

  return {
    handleProtectedContextMenu,
    handleProtectedDragStart,
    handleProtectedCopy,
    handleProtectedCut,
    handleProtectedPaste,
    handleProtectedMouseDown,
  };
}