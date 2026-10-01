import { useEffect, useMemo } from "react";
import { navigate, ROUTES } from "../routes";
import { calculateFire, dateAfter } from "../shared/calc/fire";
import Disclaimer from "../shared/Disclaimer";
import { useFlameStore } from "../shared/FlameStateContext";
import { age, duration, eok, ym } from "../shared/format";
import AssetChart from "./AssetChart";
import "./calculator.css";

const BOOST = 500_000;

export default function ResultScreen() {
  const { state } = useFlameStore();
  const input = state.input;
  useEffect(() => { if (!input) navigate(ROUTES.input, { replace: true }); }, [input]);
  const result = useMemo(() => (input ? calculateFire(input) : null), [input]);
  const boosted = useMemo(() => (input ? calculateFire({ ...input, monthlyInvest: input.monthlyInvest + BOOST }) : null), [input]);
  if (!input || !result || !boosted) return null;

  const m = result.monthsToFire;
  const already = m === 0;
  const saved = m !== null && boosted.monthsToFire !== null ? m - boosted.monthsToFire : null;

  return <main className="calc-screen">
    <h1 className="calc-title">FIRE 예상 결과</h1>

    <section className="calc-result-hero">
      <span>예상 FIRE 나이</span>
      <strong>{already ? "지금 바로" : result.fireAge ? age(result.fireAge.years, result.fireAge.months) : "100년 이후"}</strong>
      <p>{already ? "이미 FIRE 목표 자산에 도달했어요" : m === null ? "현재 조건으로는 100년 안에 도달하기 어려워요. 월 투자금을 늘리거나 생활비를 조정해 보세요." : `현재 계획을 유지하면 ${ym(dateAfter(m))}에 도달해요`}</p>
    </section>

    <div className="calc-cards">
      <article><span>목표 FIRE 자산</span><strong>{eok(result.targetAssets)}</strong></article>
      <article><span>남은 기간</span><strong>{already ? "0개월" : m === null ? "100년+" : duration(m)}</strong></article>
    </div>

    <AssetChart result={result} startAge={input.age} />

    {!already && <button className="calc-scenario" onClick={() => navigate(`${ROUTES.experiment}?inv=${input.monthlyInvest + BOOST}`)}>
      <span>월 투자금을 늘리면?</span>
      <strong>{saved && saved > 0 ? `월 50만 원 더 투자하면 약 ${duration(saved)} 빨라져요` : boosted.monthsToFire !== null && m === null ? `월 50만 원 더 투자하면 ${age(boosted.fireAge!.years, boosted.fireAge!.months)}에 도달해요` : "월 50만 원 더 투자하면 어떻게 될지 실험해 봐요"}</strong>
      <b aria-hidden="true">›</b>
    </button>}

    <div className="calc-actions">
      <button className="calc-primary" onClick={() => navigate(ROUTES.flame)}>불꽃 키우러 가기</button>
      <button className="calc-secondary" onClick={() => navigate(ROUTES.input)}>조건 바꿔서 다시 계산</button>
    </div>
    <Disclaimer />
  </main>;
}
