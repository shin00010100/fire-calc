import { useEffect, useState } from "react";
import { ageAfter } from "../shared/calc/fire";
import { requiredAmount } from "../shared/calc/stages";
import { BF_COL, STAGE_INDICES, STAGES } from "../shared/constants";
import { age, eok, percent } from "../shared/format";
import type { StageIndex, StageResult } from "../shared/types";
import StagePopover from "./StagePopover";

export function FlameDrop({ stage, size = 16, current = false }: { stage: StageIndex; size?: number; current?: boolean }) {
  const col = BF_COL[stage];
  return <span className={`fl-drop${current ? " is-current" : ""}`} style={{ width: size, height: size * 1.15 }} aria-hidden="true">
    <svg viewBox="0 0 24 28" width="100%" height="100%">
      <path className="fl-drop-body" fill={col.o} d="M12 2C13 7 21 10 21 17C21 22.5 17 26 12 26C7 26 3 22.5 3 17C3 12 6.5 10.5 8 6.5C9 8 9.5 9 10.5 9.5C11.5 7.5 12 5 12 2Z" />
      <path className="fl-drop-core" fill={col.c} d="M12 13C14.2 15.3 17 17 17 20.5C17 23.3 14.8 25 12 25C9.2 25 7 23.3 7 20.5C7 17 9.8 15.3 12 13Z" />
      <g className="fl-drop-face">
        <circle cx="9.6" cy="19.4" r="1.25" fill="#3b1d0e" />
        <circle cx="14.4" cy="19.4" r="1.25" fill="#3b1d0e" />
        <circle cx="8.3" cy="21.8" r="1.2" fill="#ff7a90" opacity=".55" />
        <circle cx="15.7" cy="21.8" r="1.2" fill="#ff7a90" opacity=".55" />
        <path d="M10.7 21.6Q12 23 13.3 21.6" fill="none" stroke="#3b1d0e" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
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
