import { ageAfter } from "../shared/calc/fire";
import { BF_COL, STAGES } from "../shared/constants";
import { age } from "../shared/format";
import type { StageIndex } from "../shared/types";

type Reach = Record<StageIndex, number | null>;
const DOT_STAGES: StageIndex[] = [1, 2, 3, 4, 5, 6];
const A_COLOR = "#A8A29E", B_COLOR = "#EA580C";
const W = 340, X0 = 34, X1 = 318;

/** 단계별 불꽃이 켜지는 나이. b가 없으면 A 한 줄만 그린다 */
export default function StageTimeline({ a, b, ageYears }: { a: Reach; b: Reach | null; ageYears: number }) {
  const rows = b ? [{ key: "A", reach: a, color: A_COLOR }, { key: "B", reach: b, color: B_COLOR }] : [{ key: "A", reach: a, color: A_COLOR }];
  // x축: 현재 나이 ~ (그려지는 마지막 점 + 2년). 용광로+2년만으로는 불꽃놀이 점이 잘려서 모든 도달 단계를 포함한다.
  const reached = rows.flatMap((r) => DOT_STAGES.map((s) => r.reach[s]).filter((m): m is number => m !== null));
  const spanMonths = (reached.length ? Math.max(...reached) : 40 * 12) + 24;
  const x = (m: number) => X0 + (m / spanMonths) * (X1 - X0);
  const rowY = (i: number) => 34 + i * 42;
  const H = rowY(rows.length - 1) + 44;
  const startYear = ageYears;
  const ticks: number[] = [];
  for (let y = Math.ceil(startYear / 5) * 5; y <= startYear + spanMonths / 12; y += 5) ticks.push(y);

  const fullAge = (r: Reach) => (r[5] === null ? "100년 안에 닿지 않아요" : (() => { const v = ageAfter(ageYears, r[5]); return age(v.years, v.months); })());
  const label = b ? `단계별 불꽃이 켜지는 나이. A는 ${fullAge(a)}, B는 ${fullAge(b)}에 용광로 도달` : `단계별 불꽃이 켜지는 나이. 지금 계획은 ${fullAge(a)}에 용광로 도달`;
  const aFull = a[5], bFull = b?.[5] ?? null;

  return <figure className="fl-timeline">
    <figcaption>단계별 불꽃이 켜지는 나이</figcaption>
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      <defs><marker id="tl-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8Z" fill={B_COLOR} /></marker></defs>
      {ticks.map((t) => { const tx = x((t - startYear) * 12); return <g key={t}><line x1={tx} x2={tx} y1={14} y2={H - 22} className="tl-grid" /><text x={tx} y={H - 6} textAnchor="middle" className="tl-tick">{t}세</text></g>; })}
      {rows.map((r, i) => <g key={r.key}>
        <text x={4} y={rowY(i) + 4} className="tl-row" fill={r.color}>{r.key}</text>
        <line x1={X0} x2={X1} y1={rowY(i)} y2={rowY(i)} stroke={r.color} strokeWidth="2" strokeLinecap="round" opacity=".5" />
        {DOT_STAGES.map((s) => {
          const m = r.reach[s];
          if (m === null) return null;
          return <g key={s} className="tl-dot" style={{ transform: `translate(${x(m)}px, ${rowY(i)}px)` }}>
            <circle r={s === 5 ? 7.5 : 5.5} fill={BF_COL[s].m} stroke={r.color} strokeWidth="2" />
          </g>;
        })}
        {DOT_STAGES.some((s) => r.reach[s] === null) && <text x={X1} y={rowY(i) - 10} textAnchor="end" className="tl-over">100년+</text>}
      </g>)}
      {b && aFull !== null && bFull !== null && aFull !== bFull && <line className="tl-arrow" x1={x(aFull)} y1={rowY(0) + 8} x2={x(bFull)} y2={rowY(1) - 10} stroke={B_COLOR} strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#tl-arrow)" />}
    </svg>
    <div className="tl-legend">
      <span><i style={{ background: A_COLOR }} />A 지금 계획</span>
      {b && <span><i style={{ background: B_COLOR }} />B 새 배합</span>}
      {DOT_STAGES.map((s) => <span key={s} className="tl-stage"><i style={{ background: BF_COL[s].m }} />{STAGES[s].fire}</span>)}
    </div>
  </figure>;
}
