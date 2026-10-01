import { useMemo, useState } from "react";
import { ageAfter } from "../shared/calc/fire";
import { stageReachMonths } from "../shared/calc/stages";
import { age, duration } from "../shared/format";
import type { FireInput } from "../shared/types";
import { CHIPS, NONE, type ChipKey } from "./experimentChips";
import StageTimeline from "./StageTimeline";

export default function FireExperiment({ a, initial }: { a: FireInput; initial: Record<ChipKey, number> }) {
  const [chips, setChips] = useState(initial);
  const changed = chips.wood !== 0 || chips.wind !== 0 || chips.room !== 0;
  const b = useMemo<FireInput>(() => ({
    ...a,
    monthlyInvest: Math.max(0, a.monthlyInvest + chips.wood),
    annualReturn: a.annualReturn + chips.wind,
    monthlyExpense: Math.max(100_000, a.monthlyExpense + chips.room),
  }), [a, chips]);
  const reachA = useMemo(() => stageReachMonths(a), [a]);
  const reachB = useMemo(() => (changed ? stageReachMonths(b) : null), [b, changed]);

  const fullText = (m: number | null) => { if (m === null) return "100년 이후"; const v = ageAfter(a.age, m); return age(v.years, v.months); };
  const verdict = () => {
    const am = reachA[5], bm = reachB?.[5] ?? null;
    if (am === null && bm === null) return "두 배합 모두 100년 안에 용광로에 닿기 어려워요";
    if (bm === null) return "B로는 100년 안에 용광로에 닿기 어려워요";
    if (am === null) return `B로 바꾸면 ${fullText(bm)}에 용광로에 도착해요`;
    if (bm < am) return `B로 바꾸면 ${duration(am - bm)} 빨리 용광로에 도착해요`;
    if (bm > am) return `B로 바꾸면 ${duration(bm - am)} 늦어져요`;
    return "용광로 도착 시점은 같아요";
  };

  return <section className="fl-card fl-experiment" id="experiment">
    <h2>불 키우기 실험</h2>
    <p className="fl-sub">장작·바람·방 크기를 바꾸면 불이 얼마나 빨리 크는지 봐요</p>

    {(Object.keys(CHIPS) as ChipKey[]).map((key) => {
      const g = CHIPS[key];
      return <div key={key} className="fl-chip-group" role="radiogroup" aria-label={`${g.title}(${g.meaning})`}>
        <span className="fl-chip-title"><span aria-hidden="true">{g.icon}</span> {g.title} <small>{g.meaning}</small></span>
        <div className="fl-chips">{g.options.map((o) => <button key={o.label} role="radio" aria-checked={chips[key] === o.value} className={chips[key] === o.value ? "selected" : ""} onClick={() => setChips((c) => ({ ...c, [key]: o.value }))}>{o.label}</button>)}</div>
      </div>;
    })}

    <StageTimeline a={reachA} b={reachB} ageYears={a.age} />

    <div className={`fl-ab ${changed ? "" : "single"}`}>
      <article className="a"><span>A 지금 계획 · 용광로</span><strong>{fullText(reachA[5])}</strong></article>
      {changed && reachB && <article className="b"><span>B 새 배합 · 용광로</span><strong>{fullText(reachB[5])}</strong></article>}
    </div>

    {changed ? <>
      <div className="fl-verdict" aria-live="polite">{verdict()}</div>
      <button className="fl-btn ghost" onClick={() => setChips(NONE)}>다시 그대로</button>
    </> : <div className="fl-hint-box">칩을 바꾸면 새 배합(B)과 비교해 드려요</div>}
  </section>;
}
