import { useEffect, useMemo } from "react";
import { navigate, ROUTES, useLocation } from "../routes";
import { STAGES } from "../shared/constants";
import Disclaimer from "../shared/Disclaimer";
import { percent } from "../shared/format";
import BuildingFire from "./BuildingFire";
import { presetFromQuery } from "./experimentChips";
import FireExperiment from "./FireExperiment";
import HeatCard from "./HeatCard";
import Ladder from "./Ladder";
import { useFlameState } from "./useFlameState";
import "./fire.css";

export default function StageLadderScreen() {
  const { ready, state, input, stages, heat, thisMonthLog } = useFlameState();
  const { query, hash } = useLocation();
  const initialChips = useMemo(() => (state.input ? presetFromQuery(query, state.input) : null), [query, state.input]);

  useEffect(() => {
    if (!ready) return;
    if (!input) navigate(ROUTES.input, { replace: true });
    else if (stages && stages.stage > state.lastSeenStage) navigate(ROUTES.stageUp, { replace: true });
  }, [ready, input, stages, state.lastSeenStage]);

  useEffect(() => {
    if (hash === "experiment") requestAnimationFrame(() => document.getElementById("experiment")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [hash]);

  if (!input || !stages || !heat || !initialChips) return null;
  const meta = STAGES[stages.stage];
  const next = stages.nextStage !== null ? STAGES[stages.nextStage] : null;

  return <main className="fl-screen">
    <section className="fl-hero">
      <div className={`fl-hero-art s${stages.stage}`}><BuildingFire stage={stages.stage} /></div>
      <span className="fl-badge">{stages.stage}단계 · {meta.fire}</span>
      <h1>{meta.fireStage}</h1>
      <p className="fl-scene">{meta.scene}</p>
      <div className="fl-progress">
        <div className="fl-progress-head"><span>{next ? `${next.fire}까지` : "모든 불꽃을 피웠어요"}</span><strong>{percent(stages.progressToNext)}</strong></div>
        <div className="fl-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(stages.progressToNext * 100)} aria-label={next ? `${next.fire}까지 진행률` : "진행률"}><div style={{ width: `${stages.progressToNext * 100}%` }} /></div>
      </div>
    </section>

    <HeatCard heat={heat} fuelledThisMonth={!!thisMonthLog} />

    <section className="fl-card">
      <h2>불꽃 사다리</h2>
      <p className="fl-sub">i를 누르면 단계 설명을 볼 수 있어요</p>
      <Ladder stages={stages} ageYears={input.age} />
    </section>

    <FireExperiment key={query.toString()} a={input} initial={initialChips} />
    <Disclaimer />
  </main>;
}
