import { useEffect, useMemo } from "react";
import { navigate, ROUTES } from "../routes";
import { ageAfter, calculateFire, dateAfter } from "../shared/calc/fire";
import Disclaimer from "../shared/Disclaimer";
import { useFlameStore } from "../shared/FlameStateContext";
import { age, duration, eok, ym } from "../shared/format";
import { useCountUp } from "../shared/useCountUp";
import AssetChart from "./AssetChart";
import "./calculator.css";

/** 올라가는 동안 숫자 자리 폭을 고정해서, 한 자리/두 자리가 바뀌어도 뒤 글자가 앞뒤로 흔들리지 않게 한다 */
function AgeCount({ startAge, animMonths, targetMonths }: { startAge: number; animMonths: number; targetMonths: number }) {
  const v = ageAfter(startAge, animMonths), fin = ageAfter(startAge, targetMonths);
  const done = animMonths >= targetMonths;
  if (done && fin.months === 0) return <>{age(fin.years, 0)}</>;
  const yearDigits = Math.max(String(fin.years).length, String(Math.floor(startAge)).length);
  // 끝나면 개월 칸 폭이 실제 자릿수로 줄어든다 (한 번에 튀지 않게 transition)
  const monthWidth = done ? String(fin.months).length : 2;
  return <>만 <span className="cu-slot" style={{ width: `${yearDigits}ch` }}>{v.years}</span>세 <span className="cu-slot" style={{ width: `${monthWidth}ch` }}>{v.months}</span>개월</>;
}

export default function ResultScreen() {
  const { state } = useFlameStore();
  const input = state.input;
  useEffect(() => { if (!input) navigate(ROUTES.input, { replace: true }); }, [input]);
  const result = useMemo(() => (input ? calculateFire(input) : null), [input]);
  const animMonths = Math.round(useCountUp(result?.monthsToFire ?? 0));
  const animTarget = useCountUp(result?.targetAssets ?? 0);
  if (!input || !result) return null;

  const m = result.monthsToFire;
  const already = m === 0;

  return <main className="calc-screen">
    <h1 className="calc-title">FIRE 예상 결과</h1>

    <section className="calc-hero">
      <span className="calc-badge">예상 FIRE 나이</span>
      <strong className={`calc-result-age ${m === null ? "small" : ""}`}>{already ? "지금 바로" : m !== null ? <AgeCount startAge={input.age} animMonths={animMonths} targetMonths={m} /> : "100년 이후"}</strong>
      <p className="calc-result-sub">{already ? "이미 FIRE 목표 자산에 도달했어요" : m === null ? "현재 조건으로는 100년 안에 도달하기 어려워요. 월 투자금을 늘리거나 생활비를 조정해 보세요." : `현재 계획을 유지하면 ${ym(dateAfter(m))}에 도달해요`}</p>
      <dl className="calc-hero-stats">
        <div><dt>목표 FIRE 자산</dt><dd>{eok(Math.round(animTarget / 10_000) * 10_000)}</dd></div>
        <div><dt>남은 기간</dt><dd>{already ? "0개월" : m === null ? "100년+" : duration(animMonths)}</dd></div>
      </dl>
    </section>

    <AssetChart result={result} startAge={input.age} />

    <div className="calc-actions">
      <button className="calc-secondary" onClick={() => navigate(ROUTES.input)}>조건 바꿔서 다시 계산</button>
      <button className="calc-primary" onClick={() => navigate(ROUTES.flame)}>파이어 단계 진단하기</button>
    </div>
    <Disclaimer />
  </main>;
}
