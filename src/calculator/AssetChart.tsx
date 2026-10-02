import { useState, type PointerEvent } from "react";
import { ageAfter } from "../shared/calc/fire";
import { age, eok, manwon } from "../shared/format";
import type { FireResult } from "../shared/types";

const W = 340, H = 210, L = 8, R = 332, TOP = 22, BOTTOM = 178;

export default function AssetChart({ result, startAge }: { result: FireResult; startAge: number }) {
  const { series, targetAssets: T, monthsToFire } = result;
  const lastMonth = series[series.length - 1].month;
  const maxY = Math.max(T, ...series.map((p) => p.assets)) * 1.08;
  const x = (m: number) => L + (lastMonth ? (m / lastMonth) * (R - L) : 0);
  const y = (v: number) => BOTTOM - (Math.max(0, v) / maxY) * (BOTTOM - TOP);
  const step = Math.max(1, Math.floor(series.length / 160));
  const pts = series.filter((_, i) => i % step === 0 || i === series.length - 1);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(p.month).toFixed(1)},${y(p.assets).toFixed(1)}`).join(" ");
  const [hover, setHover] = useState<number | null>(null);

  const onPointer = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const vx = ((e.clientX - rect.left) / rect.width) * W;
    setHover(Math.round(Math.min(1, Math.max(0, (vx - L) / (R - L))) * lastMonth));
  };

  const fire = monthsToFire !== null ? ageAfter(startAge, monthsToFire) : null;
  const end = ageAfter(startAge, lastMonth);
  const hp = hover !== null ? series[hover] : null;
  const hoverAge = hp ? ageAfter(startAge, hp.month) : null;
  const label = fire ? `자산 성장 그래프. 만 ${startAge}세 ${manwon(series[0].assets)}에서 ${age(fire.years, fire.months)}에 목표 ${eok(T)} 도달` : `자산 성장 그래프. 100년 안에 목표 ${eok(T)}에 도달하지 않아요`;

  return <section className="calc-chart">
    <h2><span className="emo" aria-hidden="true">📈</span>자산 성장 그래프</h2>
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} onPointerDown={onPointer} onPointerMove={(e) => (e.buttons || e.pointerType === "mouse") && onPointer(e)} onPointerLeave={() => setHover(null)}>
      {[0.25, 0.5, 0.75, 1].map((f) => <line key={f} x1={L} x2={R} y1={BOTTOM - f * (BOTTOM - TOP)} y2={BOTTOM - f * (BOTTOM - TOP)} className="grid" />)}
      <line x1={L} x2={R} y1={y(T)} y2={y(T)} className="target" />
      <text x={L + 2} y={y(T) - 6} className="target-label">목표 {eok(T).replace(" 원", "")}</text>
      <path d={`${line} L${R},${BOTTOM} L${L},${BOTTOM} Z`} className="area" />
      <path d={line} className="line" />
      {fire && monthsToFire !== null && <g>
        <circle cx={x(monthsToFire)} cy={y(T)} r="5.5" className="reach" />
        <text x={Math.max(x(monthsToFire) - 8, L + 70)} y={y(T) - 8} textAnchor="end" className="reach-label">만 {fire.years}세 FIRE</text>
      </g>}
      {hp && <g>
        <line x1={x(hp.month)} x2={x(hp.month)} y1={TOP} y2={BOTTOM} className="cursor" />
        <circle cx={x(hp.month)} cy={y(hp.assets)} r="4.5" className="cursor-dot" />
      </g>}
      <text x={L} y={H - 8} className="axis">만 {startAge}세</text>
      <text x={R} y={H - 8} textAnchor="end" className="axis">만 {end.years}세</text>
    </svg>
    <p className="calc-chart-tip" aria-live="polite">{hp ? <><b>{hoverAge && age(hoverAge.years, hoverAge.months)}</b> 예상 자산 <b>{manwon(hp.assets)}</b></> : "그래프를 누르면 나이별 예상 자산을 보여줘요"}</p>
  </section>;
}
