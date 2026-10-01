import { useEffect } from "react";
import { navigate, ROUTES } from "../routes";
import { STAGES } from "../shared/constants";
import Disclaimer from "../shared/Disclaimer";
import { eok, manwon, percent } from "../shared/format";
import BuildingFire from "./BuildingFire";
import FuelCard from "./FuelCard";
import Ladder from "./Ladder";
import { useFlameState } from "./useFlameState";
import "./fire.css";

export default function StageLadderScreen() {
  const { ready, state, input, stages, monthFuel } = useFlameState();

  useEffect(() => {
    if (!ready) return;
    if (!input) navigate(ROUTES.input, { replace: true });
    else if (stages && stages.stage > state.lastSeenStage) navigate(ROUTES.stageUp, { replace: true });
  }, [ready, input, stages, state.lastSeenStage]);

  if (!input || !stages) return null;
  const meta = STAGES[stages.stage];
  const next = stages.nextStage !== null ? STAGES[stages.nextStage] : null;
  const stats = [
    { label: "총 저축 금액", value: manwon(input.assets) },
    { label: "시작 금액", value: manwon(state.input?.assets ?? input.assets) },
    { label: "목표 금액", value: eok(stages.targetAssets) },
    { label: "현재 나이", value: `만 ${Math.floor(input.age)}세` },
  ];

  return <main className="fl-screen">
    <section className="fl-hero">
      <div className={`fl-hero-art s${stages.stage}`}><BuildingFire stage={stages.stage} /></div>
      <span className="fl-badge">{stages.stage}단계 · {meta.fire}</span>
      <h1>{meta.fireStage}</h1>
      <p className="fl-summary">{meta.summary}</p>
      <dl className="fl-stats">
        {stats.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}
      </dl>
      <div className="fl-progress">
        <div className="fl-progress-head"><span>{next ? `${next.fire}까지` : "모든 불꽃을 피웠어요"}</span><strong>{percent(stages.progressToNext)}</strong></div>
        <div className="fl-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(stages.progressToNext * 100)} aria-label={next ? `${next.fire}까지 진행률` : "진행률"}><div style={{ width: `${stages.progressToNext * 100}%` }} /></div>
      </div>
    </section>

    <FuelCard total={monthFuel.total} count={monthFuel.count} />

    <section className="fl-card">
      <h2>파이어 단계</h2>
      <p className="fl-sub">i를 누르면 단계의 정확한 의미를 볼 수 있어요</p>
      <Ladder stages={stages} ageYears={input.age} />
    </section>

    <section className="fl-card">
      <h2>불 키우기 실험</h2>
      <p className="fl-sub">투자금·수익률·생활비 같은 값을 바꿔 입력하고, 지금 계획(A)과 바꾼 값(B)의 시뮬레이션 결과를 비교해 보세요.</p>
      <button className="fl-btn" onClick={() => navigate(ROUTES.experiment)}>실험하러 가기</button>
    </section>
    <Disclaimer />
  </main>;
}
