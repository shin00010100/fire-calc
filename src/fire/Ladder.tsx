import { useEffect, useState } from "react";
import { ageAfter } from "../shared/calc/fire";
import { requiredAmount } from "../shared/calc/stages";
import { STAGE_INDICES, STAGES } from "../shared/constants";
import { age, eok, percent } from "../shared/format";
import type { StageIndex, StageResult } from "../shared/types";
import FlameShape from "./FlameShape";
import StagePopover from "./StagePopover";

export function FlameDrop({ stage, size = 16, current = false }: { stage: StageIndex; size?: number; current?: boolean }) {
  return <span className={`fl-drop${current ? " is-current" : ""}`} style={{ width: size, height: size * 1.15 }} aria-hidden="true">
    <svg viewBox="0 0 24 28" width="100%" height="100%"><FlameShape stage={stage} /></svg>
  </span>;
}

export default function Ladder({ stages, ageYears, assets }: { stages: StageResult; ageYears: number; assets: number }) {
  const [open, setOpen] = useState<StageIndex | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest(".fl-popover") || t.closest(".fl-info")) return;
      setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return <ol className="fl-ladder">
    {[...STAGE_INDICES].reverse().map((s) => {
      const m = STAGES[s];
      const reach = stages.reachMonths[s];
      const isCurrent = s === stages.stage;
      // 달성 여부는 "현재 단계보다 아래인가"가 아니라 그 단계 자신의 조건으로 판단한다.
      // 불씨처럼 나이·수익률에 따라 필요 금액이 달라지는 단계는 더 높은 단계보다 늦게 달성될 수 있다.
      const achieved = reach === 0;
      const done = achieved && !isCurrent;
      const future = !achieved;
      const reachAge = reach !== null ? ageAfter(ageYears, reach) : null;
      const popId = `stage-pop-${s}`;
      // 올림해서 "이 비율 이상"이 정확하게 읽히도록 한다
      const ratio = stages.requiredRatio[s];
      const pct = `${Math.ceil(ratio * 100 - 1e-9)}%`;
      const need = requiredAmount(ratio, stages.targetAssets);
      // 달성률: 지금 내 자산 ÷ 그 단계에 필요한 금액 (이미 달성한 단계는 100%)
      const progress = achieved || need === 0 ? 1 : Math.min(1, assets / need);
      return <li key={s} className={`${isCurrent ? "current" : ""} ${future ? "future" : ""}`}>
        <div className="fl-rung">
          <FlameDrop stage={s} size={isCurrent ? 26 : 22} current={isCurrent} />
          <div className="fl-rung-text">
            <strong>{m.fire}{ratio > 0 && <i className="fl-pct" aria-label={`목표 자산의 ${pct}`}>{pct}</i>}</strong>
            <span>{m.fireStage}</span>
          </div>
          <div className="fl-rung-right">
            <em>{isCurrent ? "지금 여기" : done ? "달성 ✓" : reachAge ? age(reachAge.years, reachAge.months) : "100년+"}</em>
            <small>달성률 {percent(progress)}</small>
          </div>
          <button className="fl-info" aria-label={`${m.fire} 단계 설명`} aria-expanded={open === s} aria-controls={open === s ? popId : undefined} onClick={() => setOpen(open === s ? null : s)}>i</button>
        </div>
        {progress < 1 && <div className="fl-rung-bar" aria-hidden="true"><div style={{ width: `${progress * 100}%` }} /></div>}
        {open === s && <StagePopover id={popId} stage={s} required={need > 0 ? `${eok(need)} 이상 (목표 자산의 ${pct})` : undefined} />}
      </li>;
    })}
  </ol>;
}
