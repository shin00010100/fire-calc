import { useMemo, useState, type PointerEvent } from "react";
import { ageAfter, simulate, targetAssets } from "../shared/calc/fire";
import { requiredRatio } from "../shared/calc/stages";
import { STAGES } from "../shared/constants";
import { age, duration, manwon } from "../shared/format";
import type { FireInput, StageIndex } from "../shared/types";
import { ageTickStep, amountLabel, amountTicks, spreadLabels } from "./chartMath";
import FlameShape from "./FlameShape";
import { FlameDrop } from "./Ladder";

type Reach = Record<StageIndex, number | null>;
const ROWS: StageIndex[] = [1, 2, 3, 4, 5, 6];       // 불씨~불꽃놀이
const A_COLOR = "#2563eb", B_COLOR = "#ea580c";
const W = 320, H = 276, L = 46, R = 252, TOP = 14, BOT = 238;

/** 도달 개월 → "만 49세 4개월" */
function when(ageYears: number, months: number | null): string {
  if (months === null) return "100년 이후";
  if (months === 0) return "이미 달성";
  const v = ageAfter(ageYears, months);
  return age(v.years, v.months);
}

/** B가 A보다 빠르면 −, 늦으면 + */
function delta(a: number | null, b: number | null): string {
  if (a === null || b === null || a === b) return "";
  return b < a ? `−${duration(a - b)}` : `+${duration(b - a)}`;
}

/**
 * 단계별 불꽃이 켜지는 나이.
 * x축 나이, y축 금액. 기존값(A, 파랑)과 실험값(B, 주황)의 자산 곡선을 겹쳐 그리고,
 * 각 곡선이 단계 기준 금액에 닿는 지점에 단계 번호를 찍는다. b가 없으면 A만 그린다.
 */
export default function StageChart({ a, b, reachA, reachB }: { a: FireInput; b: FireInput | null; reachA: Reach; reachB: Reach | null }) {
  const T = targetAssets(a);
  const TB = b ? targetAssets(b) : T;
  const reached = ROWS.flatMap((s) => [reachA[s], reachB?.[s] ?? null]).filter((m): m is number => m !== null);
  // 가장 늦게 켜지는 단계 + 2년까지 (하나도 못 닿으면 30년)
  const n = Math.min(1200, Math.max(60, (reached.length ? Math.max(...reached) : 360) + 24));
  const sa = useMemo(() => simulate(a, n), [a, n]);
  const sb = useMemo(() => (b ? simulate(b, n) : null), [b, n]);
  const [hover, setHover] = useState<number | null>(null);

  const yMax = Math.max(1.5 * Math.max(T, TB) * 1.06, sa[0] * 1.05, (sb?.[0] ?? 0) * 1.05);
  const x = (m: number) => L + (m / n) * (R - L);
  const y = (v: number) => BOT - (Math.max(v, 0) / yMax) * (BOT - TOP);
  const curve = (s: number[]) => {
    const step = Math.max(1, Math.floor(n / 240));
    const ms: number[] = [];
    for (let m = 0; m <= n; m += step) ms.push(m);
    if (ms[ms.length - 1] !== n) ms.push(n);
    return ms.map((m, i) => `${i ? "L" : "M"}${x(m).toFixed(1)},${y(s[m]).toFixed(1)}`).join(" ");
  };

  // 단계 기준선: A 기준은 라벨 포함, B의 목표 자산이 다르면(생활비를 바꾼 경우) B 기준선도 옅게 따로 그린다
  const lines = ROWS.map((s) => ({ s, v: requiredRatio(s) * T }));
  const labelY = spreadLabels(lines.map((l) => y(l.v)), 12.5, TOP + 4, BOT - 2);
  const bLines = b && Math.abs(TB - T) > 1 ? ROWS.map((s) => ({ s, v: requiredRatio(s) * TB })) : [];

  const spanYears = n / 12;
  const step = ageTickStep(spanYears);
  const xTicks: number[] = [];
  for (let t = Math.ceil(a.age / step) * step; t <= a.age + spanYears + 1e-9; t += step) xTicks.push(t);
  const yTicks = amountTicks(yMax);

  const dots = (reach: Reach, series: number[], color: string) => ROWS
    .filter((s) => reach[s] !== null && reach[s]! <= n)
    .map((s) => ({ s, color, cx: x(reach[s]!), cy: Math.max(TOP + 7, y(series[reach[s]!])) }));
  const aDots = dots(reachA, sa, A_COLOR);
  const bDots = reachB && sb ? dots(reachB, sb, B_COLOR) : [];

  const onPointer = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const vx = ((e.clientX - rect.left) / rect.width) * W;
    setHover(Math.round(Math.min(1, Math.max(0, (vx - L) / (R - L))) * n));
  };

  const full = (r: Reach) => (r[5] === null ? "용광로에 100년 안에 닿지 않아요" : `용광로 ${when(a.age, r[5])}`);
  const label = `나이별 자산 곡선 비교 그래프. A 기존값 ${full(reachA)}${reachB ? `, B 실험값 ${full(reachB)}` : ""}`;
  const hoverAge = hover !== null ? ageAfter(a.age, hover) : null;

  return <figure className="sc">
    <figcaption>단계별 불꽃이 켜지는 나이</figcaption>
    <div className="sc-legend">
      <span><i className="line" style={{ background: A_COLOR }} />A 기존값</span>
      {b && <span><i className="line" style={{ background: B_COLOR }} />B 실험값</span>}
    </div>

    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} onPointerDown={onPointer} onPointerMove={(e) => (e.buttons || e.pointerType === "mouse") && onPointer(e)} onPointerLeave={() => setHover(null)}>
      <defs><clipPath id="sc-clip"><rect x={L} y={TOP - 4} width={R - L} height={BOT - TOP + 4} /></clipPath></defs>
      <text x={2} y={TOP - 3} className="sc-cap">금액</text>
      <text x={R + 4} y={H - 4} textAnchor="end" className="sc-cap">나이</text>

      {yTicks.map((v) => <g key={v}>
        <line x1={L} x2={R} y1={y(v)} y2={y(v)} className="sc-grid" />
        <text x={L - 6} y={y(v) + 3.5} textAnchor="end" className="sc-tick">{amountLabel(v)}</text>
      </g>)}
      {xTicks.map((t) => <text key={t} x={x((t - a.age) * 12)} y={BOT + 16} textAnchor="middle" className="sc-tick">{t}세</text>)}
      <line x1={L} x2={R} y1={BOT} y2={BOT} className="sc-axis" />

      {bLines.map((l) => <line key={`b${l.s}`} x1={L} x2={R} y1={y(l.v)} y2={y(l.v)} stroke={B_COLOR} className="sc-bline" />)}
      {lines.map((l, i) => <g key={l.s}>
        <line x1={L} x2={R} y1={y(l.v)} y2={y(l.v)} className="sc-line" />
        <g transform={`translate(${R + 6} ${labelY[i] - 5.5}) scale(.46)`}><FlameShape stage={l.s} /></g>
        <text x={R + 19} y={labelY[i] + 3.5} className="sc-stage">{STAGES[l.s].fire}</text>
      </g>)}

      <g clipPath="url(#sc-clip)">
        <path d={curve(sa)} fill="none" stroke={A_COLOR} className="sc-curve" />
        {sb && <path d={curve(sb)} fill="none" stroke={B_COLOR} className="sc-curve" />}
      </g>

      {[...aDots, ...bDots].map((d) => <g key={`${d.color}${d.s}`} transform={`translate(${d.cx.toFixed(1)} ${d.cy.toFixed(1)})`}>
        <g transform="translate(-8.5 -9.8) scale(.72)"><FlameShape stage={d.s} outline={d.color} /></g>
      </g>)}

      {hover !== null && <g>
        <line x1={x(hover)} x2={x(hover)} y1={TOP} y2={BOT} className="sc-cursor" />
        <circle cx={x(hover)} cy={y(sa[hover])} r="4" fill={A_COLOR} className="sc-hdot" />
        {sb && <circle cx={x(hover)} cy={y(sb[hover])} r="4" fill={B_COLOR} className="sc-hdot" />}
      </g>}
    </svg>

    <p className="sc-tip" aria-live="polite">
      {hover !== null && hoverAge ? <><b>{age(hoverAge.years, hoverAge.months)}</b> · A <b className="a">{manwon(sa[hover])}</b>{sb && <> · B <b className="b">{manwon(sb[hover])}</b></>}</> : "그래프를 누르면 나이별 예상 금액을 보여줘요"}
    </p>
    <p className="sc-note">곡선 위의 불꽃은 단계예요. 곡선이 해당 단계의 금액선에 닿는 지점이 그 불꽃이 켜지는 때예요. 왼쪽 끝은 지금(만 {Math.floor(a.age)}세)이에요.</p>

    <table className="sc-table">
      <caption>단계별 도달 나이 (정확한 값)</caption>
      <thead><tr><th scope="col">단계</th><th scope="col" className="a">A 기존값</th>{reachB && <th scope="col" className="b">B 실험값</th>}</tr></thead>
      <tbody>
        {ROWS.map((s) => <tr key={s}>
          <th scope="row"><FlameDrop stage={s} size={14} />{STAGES[s].fire}</th>
          <td>{when(a.age, reachA[s])}</td>
          {reachB && <td className="b">{when(a.age, reachB[s])}{delta(reachA[s], reachB[s]) && <small>{delta(reachA[s], reachB[s])}</small>}</td>}
        </tr>)}
      </tbody>
    </table>
  </figure>;
}
