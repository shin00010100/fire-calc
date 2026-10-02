import type { CSSProperties } from "react";
import type { StageIndex } from "../shared/types";
import FlameShape from "./FlameShape";

const SPARKS = Array.from({ length: 8 }, (_, i) => {
  const a = (-90 + (i - 3.5) * 24) * (Math.PI / 180), r = 46 + (i % 2) * 14;
  return { dx: Math.cos(a) * r, dy: Math.sin(a) * r };
});

/** 저축하면 장작이 떨어져 불꽃이 화르륵 커지고 불똥이 튀는 연출 */
export default function FuelBurst({ stage }: { stage: StageIndex }) {
  return <div className="fl-burst" aria-hidden="true">
    <svg className="fl-burst-flame" viewBox="0 0 24 28"><FlameShape stage={stage} /></svg>
    <svg className="fl-burst-log" viewBox="0 0 60 22">
      <rect x="2" y="3" width="56" height="16" rx="8" fill="#92400e" />
      <rect x="2" y="3" width="56" height="7" rx="3.5" fill="#b45309" opacity=".6" />
      <ellipse cx="9" cy="11" rx="5" ry="6.5" fill="#fcd9a8" stroke="#78350f" strokeWidth="1.2" />
      <circle cx="9" cy="11" r="2" fill="none" stroke="#b45309" strokeWidth="1" />
    </svg>
    {SPARKS.map((s, i) => <i key={i} className="fl-burst-spark" style={{ "--dx": `${s.dx}px`, "--dy": `${s.dy}px`, animationDelay: `${0.5 + i * 0.03}s` } as CSSProperties} />)}
  </div>;
}
