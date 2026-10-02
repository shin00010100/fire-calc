import { useEffect, useState, type CSSProperties } from "react";
import { navigate, ROUTES } from "../routes";
import { calculateStages, progressToNext } from "../shared/calc/stages";
import { STAGES } from "../shared/constants";
import { comma, manwon, percent } from "../shared/format";
import type { StageIndex } from "../shared/types";
import { useFlameState } from "./useFlameState";
import "./fire.css";

interface Outcome {
  amount: number;
  target: StageIndex | null;      // 진행 바 대상 (넣기 전 단계의 다음 단계)
  fromP: number; toP: number;
  stagedUp: StageIndex | null;    // 축하로 갈 새 단계
}

export default function FuelScreen() {
  const { ready, input, nowYm, state, monthFuel, addFuelLog } = useFlameState();
  const [raw, setRaw] = useState("");   // 만원 단위
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  useEffect(() => { if (ready && !input) navigate(ROUTES.input, { replace: true }); }, [ready, input]);
  if (!input) return null;

  const submit = async () => {
    const man = Number(raw);
    if (raw === "" || !(man >= 1) || man > 10_000_000) { setError("1만 원 이상 1,000억 원 이하로 입력해 주세요"); return; }
    const amount = man * 10_000;
    const before = calculateStages(input);
    const lastSeen = state.lastSeenStage;
    const { newStage } = await addFuelLog(nowYm, amount);
    const target = before.nextStage;
    setOutcome({
      amount,
      target,
      fromP: before.progressToNext,
      toP: target === null ? 1 : progressToNext({ ...input, assets: input.assets + amount }, (target - 1) as StageIndex),
      stagedUp: newStage > lastSeen ? newStage : null,
    });
  };

  const again = () => { setOutcome(null); setRaw(""); setError(""); };

  return <main className="fl-screen fl-fuel">
    <h1 className="fl-title"><span className="emo" aria-hidden="true">💰</span>저축을 기록해요</h1>
    <p className="fl-lead">저축할 때마다 총 저축 금액이 늘어나고 불꽃이 다시 계산돼요. 여러 번 기록할 수 있어요.</p>

    {!outcome ? <>
      <label className="fl-field" htmlFor="fuel-amount">저축할 금액</label>
      <div className={`fl-box ${error ? "error" : ""}`}>
        <input id="fuel-amount" inputMode="numeric" placeholder="0" value={raw === "" ? "" : comma(Number(raw))} onChange={(e) => { setRaw(e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "")); setError(""); }} />
        <span>만원</span>
      </div>
      <p className={error ? "fl-error" : "fl-note"}>{error || [raw ? manwon(Number(raw) * 10_000) : "", `이번 달 누적 ${manwon(monthFuel.total)}`].filter(Boolean).join(" · ")}</p>
      <button className="fl-btn fl-bottom" onClick={submit}>저축하기</button>
    </> : <section className="fl-card fl-outcome" aria-live="polite">
      <div className="fl-log-drop" aria-hidden="true">💰</div>
      <strong className="fl-delta">저축 +{manwon(outcome.amount)}</strong>
      {outcome.target !== null && <div className="fl-progress light">
        <div className="fl-progress-head"><span>{STAGES[outcome.target].fire}까지</span><strong>{percent(outcome.toP)}</strong></div>
        <div className="fl-bar"><div className="grow" style={{ width: `${outcome.toP * 100}%`, "--from": `${outcome.fromP * 100}%` } as CSSProperties} /></div>
      </div>}
      <p className="fl-month-total">이번 달 저축 누적 <b>{manwon(monthFuel.total)}</b> ({monthFuel.count}번)</p>
      {outcome.stagedUp !== null
        ? <button className="fl-btn" onClick={() => navigate(ROUTES.stageUp, { replace: true })}>{STAGES[outcome.stagedUp].fire} 점화 보기</button>
        : <button className="fl-btn" onClick={() => navigate(ROUTES.flame, { replace: true })}>불꽃으로 돌아가기</button>}
      <button className="fl-btn ghost" onClick={again}>저축 더 하기</button>
    </section>}
  </main>;
}
