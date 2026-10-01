import { useEffect, useState } from "react";
import { navigate, ROUTES } from "../routes";
import { ageAfter } from "../shared/calc/fire";
import { requiredAmount } from "../shared/calc/stages";
import { STAGES } from "../shared/constants";
import Disclaimer from "../shared/Disclaimer";
import { age, eok, manwon } from "../shared/format";
import BuildingFire from "./BuildingFire";
import FuelCard from "./FuelCard";
import Ladder from "./Ladder";
import TotalAssetsSheet from "./TotalAssetsSheet";
import { useFlameState } from "./useFlameState";
import "./fire.css";

export default function StageLadderScreen() {
  const { ready, state, input, stages, monthFuel, setTotalAssets } = useFlameState();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!input) navigate(ROUTES.input, { replace: true });
    else if (stages && stages.stage > state.lastSeenStage) navigate(ROUTES.stageUp, { replace: true });
  }, [ready, input, stages, state.lastSeenStage]);

  if (!input || !stages) return null;
  const meta = STAGES[stages.stage];
  const next = stages.nextStage !== null ? STAGES[stages.nextStage] : null;
  // 다음 단계 목표 금액: 현재 단계에서 바로 계산하므로 단계가 오르면 자동으로 다음 단계 금액으로 바뀐다
  const nextRatio = stages.nextStage !== null ? stages.requiredRatio[stages.nextStage] : 0;
  const nextNeed = requiredAmount(nextRatio, stages.targetAssets);
  // FIRE 달성 = 용광로(Full FIRE)에 닿는 시점
  const fireMonths = stages.reachMonths[5];
  const fireAge = fireMonths === null ? "100년 이후" : fireMonths === 0 ? "이미 달성" : (() => { const v = ageAfter(input.age, fireMonths); return age(v.years, v.months); })();

  return <main className="fl-screen">
    <section className="fl-hero">
      <div className={`fl-hero-art s${stages.stage}`}><BuildingFire stage={stages.stage} /></div>
      <span className="fl-badge">{stages.stage}단계 · {meta.fire}</span>
      <h1>{meta.fireStage}</h1>
      <p className="fl-summary">{meta.summary}</p>
      <dl className="fl-stats">
        <div><dt>현재 나이</dt><dd>만 {Math.floor(input.age)}세</dd></div>
        <div><dt>FIRE 달성 나이</dt><dd>{fireAge}</dd></div>
        <div><dt>총 저축 금액<button className="fl-edit" onClick={() => setEditing(true)} aria-label="총 저축 금액 수정">수정</button></dt><dd>{manwon(input.assets)}</dd></div>
        <div><dt>다음 단계 목표 금액</dt><dd>{next ? eok(nextNeed) : "모든 단계 달성"}{next && <small>{next.fire} · {Math.ceil(nextRatio * 100 - 1e-9)}%</small>}</dd></div>
      </dl>
    </section>

    <FuelCard total={monthFuel.total} count={monthFuel.count} />

    <section className="fl-card">
      <h2>파이어 단계</h2>
      <p className="fl-sub">i를 누르면 단계의 정확한 의미를 볼 수 있어요</p>
      <p className="fl-sub tight">이름 옆 %는 그 단계에 필요한 목표 자산 비율이고, 달성률은 지금 내 자산이 그 단계 금액의 몇 %인지예요.</p>
      <Ladder stages={stages} ageYears={input.age} assets={input.assets} />
    </section>

    <section className="fl-card">
      <h2>불 키우기 실험</h2>
      <p className="fl-sub">투자금·수익률·생활비 같은 값을 바꿔 입력하고, 지금 계획(A)과 바꾼 값(B)의 시뮬레이션 결과를 비교해 보세요.</p>
      <button className="fl-btn" onClick={() => navigate(ROUTES.experiment)}>실험하러 가기</button>
    </section>
    <Disclaimer />

    {editing && <TotalAssetsSheet current={input.assets} onSave={setTotalAssets} onClose={() => setEditing(false)} />}
  </main>;
}
