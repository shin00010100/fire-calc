import { useEffect, useState } from "react";
import { ageAfter } from "../shared/calc/fire";
import { BF_COL, STAGE_INDICES, STAGES } from "../shared/constants";
import { age, eok } from "../shared/format";
import type { StageIndex, StageResult } from "../shared/types";
import StagePopover from "./StagePopover";

export function FlameDrop({ stage, size = 16 }: { stage: StageIndex; size?: number }) {
  return <span className="fl-drop" style={{ width: size, height: size, background: `linear-gradient(135deg, ${BF_COL[stage].c}, ${BF_COL[stage].o})` }} aria-hidden="true" />;
}

export default function Ladder({ stages, ageYears }: { stages: StageResult; ageYears: number }) {
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
      const done = s < stages.stage;
      const future = s > stages.stage;
      const reachAge = reach !== null ? ageAfter(ageYears, reach) : null;
      const popId = `stage-pop-${s}`;
      // 올림해서 "이 비율 이상"이 정확하게 읽히도록 한다
      const ratio = stages.requiredRatio[s];
      const pct = `${Math.ceil(ratio * 100 - 1e-9)}%`;
      const need = ratio > 0 ? Math.ceil((ratio * stages.targetAssets) / 10_000 - 1e-6) * 10_000 : 0;
      return <li key={s} className={`${isCurrent ? "current" : ""} ${future ? "future" : ""}`}>
        <div className="fl-rung">
          <FlameDrop stage={s} size={isCurrent ? 20 : 16} />
          <div className="fl-rung-text">
            <strong>{m.fire}<i className="fl-pct" aria-label={`목표 자산의 ${pct}`}>{pct}</i></strong>
            <span>{m.fireStage}</span>
          </div>
          <em>{isCurrent ? "지금 여기" : done ? "달성 ✓" : reachAge ? age(reachAge.years, reachAge.months) : "100년+"}</em>
          <button className="fl-info" aria-label={`${m.fire} 단계 설명`} aria-expanded={open === s} aria-controls={open === s ? popId : undefined} onClick={() => setOpen(open === s ? null : s)}>i</button>
        </div>
        {open === s && <StagePopover id={popId} stage={s} required={need > 0 ? `${eok(need)} 이상 (목표 자산의 ${pct})` : undefined} />}
      </li>;
    })}
  </ol>;
}
