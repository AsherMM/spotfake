import { useCallback, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { clamp } from "@/app/components/game-preview.utils";
import {
  MAX_DRAG_PX,
  MAX_ROTATION_DEG,
  SWIPE_TRIGGER_PX,
} from "@/app/components/game-preview.constants";
import type { Answer } from "@/app/components/game-preview.types";

type UseSwipeControlsParams = {
  onCommitSwipe: (answer: Answer) => void;
};

export function useSwipeControls({
  onCommitSwipe,
}: UseSwipeControlsParams) {
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const pointerIdRef = useRef<number | null>(null);
  const pointerElementRef = useRef<HTMLDivElement | null>(null);
  const pointerStartXRef = useRef(0);
  const pointerStartYRef = useRef(0);

  const resetPointerState = useCallback(() => {
    const el = pointerElementRef.current;
    const pointerId = pointerIdRef.current;

    try {
      if (el && pointerId !== null && el.hasPointerCapture(pointerId)) {
        el.releasePointerCapture(pointerId);
      }
    } catch {
      // no-op
    }

    pointerElementRef.current = null;
    pointerIdRef.current = null;
    setDragX(0);
    setDragY(0);
    setIsDragging(false);
  }, []);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 && e.pointerType !== "touch" && e.pointerType !== "pen") {
        return;
      }

      pointerIdRef.current = e.pointerId;
      pointerElementRef.current = e.currentTarget;
      pointerStartXRef.current = e.clientX;
      pointerStartYRef.current = e.clientY;
      setIsDragging(true);

      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // no-op
      }
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      if (pointerIdRef.current !== e.pointerId) return;

      const nextDragX = clamp(
        e.clientX - pointerStartXRef.current,
        -MAX_DRAG_PX,
        MAX_DRAG_PX
      );

      const nextDragY = clamp(
        (e.clientY - pointerStartYRef.current) * 0.18,
        -24,
        24
      );

      setDragX(nextDragX);
      setDragY(nextDragY);
    },
    [isDragging]
  );

  const handlePointerEnd = useCallback(
    (e?: ReactPointerEvent<HTMLDivElement>) => {
      if (e && pointerIdRef.current !== null) {
        try {
          if (e.currentTarget.hasPointerCapture(pointerIdRef.current)) {
            e.currentTarget.releasePointerCapture(pointerIdRef.current);
          }
        } catch {
          // no-op
        }
      }

      if (!isDragging) {
        resetPointerState();
        return;
      }

      if (dragX <= -SWIPE_TRIGGER_PX) {
        onCommitSwipe("real");
        return;
      }

      if (dragX >= SWIPE_TRIGGER_PX) {
        onCommitSwipe("fake");
        return;
      }

      resetPointerState();
    },
    [dragX, isDragging, onCommitSwipe, resetPointerState]
  );

  const rotation = useMemo(
    () =>
      clamp(
        (dragX / MAX_DRAG_PX) * MAX_ROTATION_DEG,
        -MAX_ROTATION_DEG,
        MAX_ROTATION_DEG
      ),
    [dragX]
  );

  return {
    dragX,
    dragY,
    isDragging,
    rotation,
    resetPointerState,
    handlePointerDown,
    handlePointerMove,
    handlePointerEnd,
    setDragX,
    setDragY,
    setIsDragging,
  };
}