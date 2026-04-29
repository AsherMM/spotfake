"use client";

import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 900, enabled = true) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);
  const currentValueRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    if (target === prev.current) return;
    if (typeof document !== "undefined" && document.hidden) {
      // Skip animation if tab is hidden — just snap to target.
      prev.current = target;
      currentValueRef.current = target;
      setValue(target);
      return;
    }

    const from = prev.current;
    const startedAt = performance.now();
    let rafId = 0;

    function tick(now: number) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + (target - from) * eased);

      currentValueRef.current = next;
      setValue(next);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        prev.current = target;
      }
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      // Save the visible value so the next animation starts from here,
      // not from the interrupted target.
      prev.current = currentValueRef.current;
    };
  }, [target, duration, enabled]);

  return value;
}