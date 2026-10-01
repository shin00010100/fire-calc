import { useEffect, useState, type CSSProperties } from "react";
import { navigate, ROUTES } from "../routes";
import { calculateHeat } from "../shared/calc/heat";
import { calculateStages, progressToNext } from "../shared/calc/stages";
import { STAGES } from "../shared/constants";
import { comma, manwon, percent, won } from "../shared/format";
import type { StageIndex } from "../shared/types";
import { useFlameState } from "./useFlameState";
import "./fire.css";

interface Outcome {
  delta: number;
  target: StageIndex | null;      // 진행 바 대상 (이전 단계의 다음 단계)
  fromP: number; toP: number;
  heatFrom: number; heatTo: number;
  stagedUp: StageIndex | null;    // 축하로 갈 새 단계
}

export default function FuelScreen() {
  const { ready, input, thisMonthLog, nowYm, state, addFuelLog } = useFlameState();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  useEffect(() => { if (ready && !input) navigate(ROUTES.input, { replace: true }); }, [ready, input]);
  if (!input) return null;

  const prevAssets = input.assets;

  const submit = async (force = false) => {
    const assets = Number(raw);
    if (raw === "" || !(assets >= 0) || assets > 100_000_000_000) { setError("0원 이상 1,000억 원 이하로 입력해 주세요"); return; }
    if (thisMonthLog && !force) { setConfirming(true); return; }
    setConfirming(false);
    const before = calculateStages(input);
    const lastSeen = state.lastSeenStage;
    const { newStage } = await addFuelLog(nowYm, assets);
    const after = { ...input, assets };
    const target = before.nextStage;
    setOutcome({
      delta: assets - prevAssets,
      target,
      fromP: before.progressToNext,
      toP: target === null ? 1 : progressToNext(after, (target - 1) as StageIndex),
      heatFrom: calculateHeat(input).won,
      heatTo: calculateHeat(after).won,
      stagedUp: newStage > lastSeen ? newStage : null,
    });
  };

  return <main className="fl-screen fl-fuel">
    <header className="fl-header"><button className="fl-back" aria-label="뒤로" onClick={() => navigate(ROUTES.flame)}>‹</button></header>
    <h1 className="fl-title">이번 달 장작을 넣어요</h1>
    <p className="fl-lead">한 달에 한 번, 지금 투자자산 총액만 적으면 불이 다시 계산돼요.</p>

    {!outcome ? <>
      <label className="fl-field" htmlFor="fuel-assets">이번 달 투자자산</label>
      <div className={`fl-box ${error ? "error" : ""}`}>
        <input id="fuel-assets" inputMode="numeric" placeholder="0" value={raw === "" ? "" : comma(Number(raw))} onChange={(e) => { setRaw(e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "")); setError(""); }} />
        <span>원</span>
      </div>
      <p className={error ? "fl-error" : "fl-note"}>{error || [raw ? manwon(Number(raw)) : "", `지난달 ${manwon(prevAssets)}`].filter(Boolean).join(" · ")}</p>
      {thisMonthLog && <p className="fl-note">이번 달에 이미 {manwon(thisMonthLog.assets)}을 기록했어요</p>}
      <button className="fl-btn fl-bottom" onClick={() => submit()}>장작 넣기</button>
    </> : <section className="fl-card fl-outcome" aria-live="polite">
      <div className={`fl-log-drop ${outcome.delta < 0 ? "down" : ""}`} aria-hidden="true">🪵</div>
      <strong className={`fl-delta ${outcome.delta < 0 ? "down" : ""}`}>{outcome.delta < 0 ? `장작 -${manwon(-outcome.delta).replace(" 원", "")}` : `장작 +${manwon(outcome.delta).replace(" 원", "")}`}</strong>
      {outcome.delta < 0 && <p className="fl-note">시장이 쉬어가는 달이에요</p>}
      {outcome.target !== null && <div className="fl-progress light">
        <div className="fl-progress-head"><span>{STAGES[outcome.target].fire}까지</span><strong>{percent(outcome.toP)}</strong></div>
        <div className="fl-bar"><div className="grow" style={{ width: `${outcome.toP * 100}%`, "--from": `${outcome.fromP * 100}%` } as CSSProperties} /></div>
      </div>}
      <p className="fl-heat-change">오늘 불꽃이 낸 열 <b>{won(outcome.heatFrom)}</b> → <b>{won(outcome.heatTo)}</b></p>
      {outcome.stagedUp !== null
        ? <button className="fl-btn" onClick={() => navigate(ROUTES.stageUp, { replace: true })}>{STAGES[outcome.stagedUp].fire} 점화 보기</button>
        : <button className="fl-btn" onClick={() => navigate(ROUTES.flame, { replace: true })}>불꽃으로 돌아가기</button>}
    </section>}

    {confirming && <div className="fl-sheet-backdrop" onClick={() => setConfirming(false)}>
      <div className="fl-sheet" role="dialog" aria-modal="true" aria-labelledby="fuel-confirm" onClick={(e) => e.stopPropagation()}>
        <h2 id="fuel-confirm">이번 달 기록을 수정할까요?</h2>
        <p>{manwon(thisMonthLog?.assets ?? 0)} → {manwon(Number(raw))}</p>
        <div className="fl-sheet-actions">
          <button className="fl-btn ghost" onClick={() => setConfirming(false)}>취소</button>
          <button className="fl-btn" autoFocus onClick={() => submit(true)}>수정하기</button>
        </div>
      </div>
    </div>}
  </main>;
}
