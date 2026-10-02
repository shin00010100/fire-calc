import { useEffect, useMemo, useState } from "react";
import { navigate, ROUTES } from "../routes";
import { ageAfter } from "../shared/calc/fire";
import { stageReachMonths } from "../shared/calc/stages";
import Disclaimer from "../shared/Disclaimer";
import { age, comma, duration, manwon } from "../shared/format";
import type { FireInput } from "../shared/types";
import StageChart from "./StageChart";
import { useFlameState } from "./useFlameState";
import "./fire.css";

type Field = "assets" | "monthlyInvest" | "monthlyExpense" | "annualReturn";
type Draft = Record<Field, string>;

const MAN = 10_000;
const FIELDS: { key: Field; label: string; unit: string; decimal?: boolean; min: number; max: number; error: string }[] = [
  { key: "assets", label: "총 저축 금액", unit: "만원", min: 0, max: 10_000_000, error: "0원 이상 1,000억 원 이하로 입력해 주세요" },
  { key: "monthlyInvest", label: "매월 투자금", unit: "만원", min: 0, max: 10_000, error: "0원 이상 1억 원 이하로 입력해 주세요" },
  { key: "monthlyExpense", label: "은퇴 후 월 생활비", unit: "만원", min: 10, max: 10_000, error: "10만 원 이상 1억 원 이하로 입력해 주세요" },
  { key: "annualReturn", label: "예상 연수익률", unit: "%", decimal: true, min: 0, max: 20, error: "0% 이상 20% 이하로 입력해 주세요" },
];

/** A(기존값)를 입력창에 채울 문자열로 */
const toDraft = (a: FireInput): Draft => ({
  assets: String(Math.round(a.assets / MAN)),
  monthlyInvest: String(Math.round(a.monthlyInvest / MAN)),
  monthlyExpense: String(Math.round(a.monthlyExpense / MAN)),
  annualReturn: String(Math.round(a.annualReturn * 1000) / 10),
});

/** 화면 값 → 계산 값 */
const apply = (b: FireInput, key: Field, v: number): FireInput => (key === "annualReturn" ? { ...b, annualReturn: v / 100 } : { ...b, [key]: v * MAN });

export default function ExperimentScreen() {
  const { ready, input: a, saveInput } = useFlameState();
  useEffect(() => { if (ready && !a) navigate(ROUTES.input, { replace: true }); }, [ready, a]);
  if (!a) return null;
  // key: 기존값이 바뀌면(저축을 기록한 뒤 등) 입력창을 새 기존값으로 다시 채운다
  return <Experiment key={JSON.stringify(a)} a={a} onApply={saveInput} />;
}

function Experiment({ a, onApply }: { a: FireInput; onApply: (input: FireInput) => Promise<void> }) {
  const base = useMemo(() => toDraft(a), [a]);
  const [draft, setDraft] = useState<Draft>(base);
  const [confirming, setConfirming] = useState(false);

  const { b, errors } = useMemo(() => {
    let next = a;
    const errs: Partial<Record<Field, string>> = {};
    for (const f of FIELDS) {
      if (draft[f.key] === base[f.key]) continue; // 안 바꾼 값은 기존값 그대로(반올림 오차 방지)
      const v = draft[f.key] === "" ? NaN : Number(draft[f.key]);
      if (v >= f.min && v <= f.max) next = apply(next, f.key, v);
      else errs[f.key] = f.error;
    }
    return { b: next, errors: errs };
  }, [a, base, draft]);

  const changedFields = FIELDS.filter((f) => draft[f.key] !== base[f.key]);
  const hasError = Object.keys(errors).length > 0;
  const compare = changedFields.length > 0 && !hasError;

  const reachA = useMemo(() => stageReachMonths(a), [a]);
  const reachB = useMemo(() => (compare ? stageReachMonths(b) : null), [b, compare]);

  const set = (key: Field, raw: string, decimal?: boolean) => {
    const clean = decimal ? raw.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1").replace(/^0+(?=\d)/, "") : raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    setDraft((d) => ({ ...d, [key]: clean }));
  };

  // 실험값(B)을 내 계획으로 저장. 나이는 정수로 맞추고, 지금 총 저축 금액이 새 시작 금액이 된다
  const applyExperiment = async () => {
    await onApply({ ...b, age: Math.floor(a.age) });
    navigate(ROUTES.flame);
  };

  const full = (m: number | null) => { if (m === null) return "100년 이후"; if (m === 0) return "이미 달성"; const v = ageAfter(a.age, m); return age(v.years, v.months); };
  const verdict = () => {
    const am = reachA[5], bm = reachB?.[5] ?? null;
    if (am === null && bm === null) return "두 값 모두 100년 안에 용광로에 닿기 어려워요";
    if (bm === null) return "B(실험값)로는 100년 안에 용광로에 닿기 어려워요";
    if (am === null) return `B(실험값)로 바꾸면 ${full(bm)}에 용광로에 도착해요`;
    if (bm < am) return `B(실험값)로 바꾸면 ${duration(am - bm)} 빨리 용광로에 도착해요`;
    if (bm > am) return `B(실험값)로 바꾸면 ${duration(bm - am)} 늦게 용광로에 도착해요`;
    return "용광로 도착 시점은 같아요";
  };

  return <main className="fl-screen fl-exp">
    <h1 className="fl-title"><span className="emo" aria-hidden="true">🧪</span>불 키우기 실험</h1>
    <p className="fl-lead">값을 바꿔 입력하면, 지금 계획(A 기존값)과 바꾼 값(B 실험값)의 시뮬레이션 결과를 비교해 드려요.</p>

    <section className="fl-card">
      <div className="fl-exp-cols head" aria-hidden="true"><b className="a">A 기존값</b><b className="b">B 실험값</b></div>
      {FIELDS.map((f) => <div key={f.key} className="fl-exp-row">
        <label htmlFor={`exp-${f.key}`}>{f.label}</label>
        <div className="fl-exp-cols">
          <div className="fl-exp-a" aria-label={`A 기존값 ${comma(Number(base[f.key]))}${f.unit}`}>{comma(Number(base[f.key]))}<small>{f.unit}</small></div>
          <div className={`fl-exp-box ${errors[f.key] ? "error" : ""} ${draft[f.key] !== base[f.key] ? "changed" : ""}`}>
            <input id={`exp-${f.key}`} inputMode={f.decimal ? "decimal" : "numeric"} value={draft[f.key] === "" || f.decimal ? draft[f.key] : comma(Number(draft[f.key]))} onChange={(e) => set(f.key, e.target.value, f.decimal)} aria-invalid={!!errors[f.key]} aria-label={`B 실험값 ${f.label}`} />
            <span>{f.unit}</span>
          </div>
        </div>
        {errors[f.key] && <p className="fl-error">{errors[f.key]}</p>}
      </div>)}
      <p className="fl-note">안전 인출률은 4%로 고정이에요. 기존값은 지금 내 계획이에요.</p>
      <button className="fl-btn ghost" disabled={changedFields.length === 0} onClick={() => setDraft(base)}>기존값으로 되돌리기</button>
    </section>

    {compare && reachB ? <>
      <div className="fl-verdict" aria-live="polite">{verdict()}</div>
      <div className="fl-ab">
        <article className="a"><span>A 기존값 · 용광로</span><strong>{full(reachA[5])}</strong></article>
        <article className="b"><span>B 실험값 · 용광로</span><strong>{full(reachB[5])}</strong></article>
      </div>
      <button className="fl-btn" onClick={() => setConfirming(true)}>실험값(B)을 내 계획으로 적용</button>
    </> : <div className="fl-hint-box">{hasError ? "입력값을 확인해 주세요" : "값을 바꿔 입력하면 B(실험값)와 비교해 드려요"}</div>}

    <section className="fl-card">
      <StageChart a={a} b={compare ? b : null} reachA={reachA} reachB={reachB} />
    </section>
    <Disclaimer />

    {confirming && <div className="fl-sheet-backdrop" onClick={() => setConfirming(false)}>
      <div className="fl-sheet" role="dialog" aria-modal="true" aria-labelledby="exp-confirm" onClick={(e) => e.stopPropagation()}>
        <h2 id="exp-confirm">실험값을 내 계획으로 적용할까요?</h2>
        <ul className="fl-sheet-list">
          {changedFields.map((f) => <li key={f.key}>{f.label} <b>{comma(Number(base[f.key]))}{f.unit}</b> → <b>{comma(Number(draft[f.key]))}{f.unit}</b></li>)}
        </ul>
        <p>지금 총 저축 금액 {manwon(b.assets)}이 새 시작 금액이 되고, 지금까지의 저축 기록은 초기화돼요.</p>
        <div className="fl-sheet-actions">
          <button className="fl-btn ghost" onClick={() => setConfirming(false)}>취소</button>
          <button className="fl-btn" autoFocus onClick={applyExperiment}>적용하기</button>
        </div>
      </div>
    </div>}
  </main>;
}
