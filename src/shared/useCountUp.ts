import { useEffect, useRef, useState } from "react";

const reduced = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * 값이 처음 나타날 때 0에서, 값이 바뀔 때는 이전 값에서 target까지 부드럽게 올라간다.
 * 모션 줄이기 설정이면 바로 target을 돌려준다.
 */
export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(() => (reduced() ? target : 0));
  const shown = useRef(value);

  useEffect(() => {
    if (reduced() || shown.current === target) { shown.current = target; setValue(target); return; }
    const from = shown.current, start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const next = from + (target - from) * (1 - Math.pow(1 - t, 3));
      shown.current = next;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
