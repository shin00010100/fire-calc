import { ageAfter } from "../shared/calc/fire";
import { BF_COL, STAGES } from "../shared/constants";
import { age, duration } from "../shared/format";
import type { StageIndex } from "../shared/types";

type Reach = Record<StageIndex, number | null>;
const ROW_STAGES: StageIndex[] = [1, 2, 3, 4, 5, 6];

/** 도달 개월 → "만 49세 4개월" */
function when(ageYears: number, months: number | null): string {
  if (months === null) return "100년 이후";
  if (months === 0) return "이미 달성";
  const v = ageAfter(ageYears, months);
  return age(v.years, v.months);
}

/** B가 A보다 빠르면 −, 늦으면 + 로 차이를 보여준다 */
function delta(a: number | null, b: number | null): string {
  if (a === null || b === null || a === b) return "";
  return b < a ? ` (−${duration(a - b)})` : ` (+${duration(b - a)})`;
}

/**
 * 단계별 불꽃이 켜지는 나이.
 * 단계마다 한 줄: 이름과 나이를 글자로 직접 쓰고, 아래 눈금(현재 나이 → 가장 늦은 도달 시점) 위에
 * 월 단위로 정확한 위치에 점을 찍는다. b가 없으면 A만 보여준다.
 */
export default function StageTimeline({ a, b, ageYears }: { a: Reach; b: Reach | null; ageYears: number }) {
  const reached = ROW_STAGES.flatMap((s) => [a[s], b?.[s] ?? null]).filter((m): m is number => m !== null);
  const spanMonths = Math.max(12, ...reached);
  const spanYears = spanMonths / 12;
  const step = spanYears <= 10 ? 2 : spanYears <= 30 ? 5 : 10;
  const ticks: number[] = [];
  for (let t = Math.ceil(ageYears / step) * step; t <= ageYears + spanYears + 1e-9; t += step) ticks.push(t);
  const pct = (months: number) => `${(months / spanMonths) * 100}%`;
  const tickPct = (t: number) => pct((t - ageYears) * 12);

  return <figure className="fl-timeline">
    <figcaption>단계별 불꽃이 켜지는 나이</figcaption>
    <div className="tl-legend">
      <span><i className="a" />A 기존값</span>
      {b && <span><i className="b" />B 실험값</span>}
    </div>
    <div className="tl-axis" aria-hidden="true">
      <div className="tl-inner">{ticks.map((t) => <span key={t} style={{ left: tickPct(t) }}>{t}세</span>)}</div>
    </div>
    <ol className="tl-rows">
      {ROW_STAGES.map((s) => {
        const am = a[s], bm = b?.[s] ?? null;
        const lo = am !== null && bm !== null ? Math.min(am, bm) : null;
        return <li key={s} className="tl-row">
          <div className="tl-head">
            <strong><i style={{ background: `linear-gradient(135deg, ${BF_COL[s].c}, ${BF_COL[s].o})` }} aria-hidden="true" />{STAGES[s].fire}<small>{STAGES[s].fireStage}</small></strong>
            <div className="tl-ages">
              <span className="a">A {when(ageYears, am)}</span>
              {b && <span className="b">B {when(ageYears, bm)}{delta(am, bm)}</span>}
            </div>
          </div>
          <div className="tl-track" aria-hidden="true">
            <div className="tl-inner">
              {ticks.map((t) => <i key={t} className="tl-grid" style={{ left: tickPct(t) }} />)}
              {lo !== null && am !== bm && <i className="tl-link" style={{ left: pct(lo), width: pct(Math.abs(am! - bm!)) }} />}
              {am !== null && <b className="tl-dot a" style={{ left: pct(am) }} />}
              {bm !== null && <b className="tl-dot b" style={{ left: pct(bm) }} />}
            </div>
          </div>
        </li>;
      })}
    </ol>
    <p className="tl-note">왼쪽 끝은 지금(만 {Math.floor(ageYears)}세)이에요. 점의 위치는 개월 단위로 계산한 값이에요.</p>
  </figure>;
}
