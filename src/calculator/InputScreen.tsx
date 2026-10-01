import { useRef } from "react";
import { navigate, ROUTES } from "../routes";
import { useFlameStore } from "../shared/FlameStateContext";
import { comma, manwon } from "../shared/format";
import { RATE_PRESETS, useFireInput, type Draft, type FieldKey, type MoneyKey, type RateKey } from "./useFireInput";
import "./calculator.css";

export default function InputScreen() {
  const { state, saveInput } = useFlameStore();
  const { draft, errors, setMoney, setRate, validate } = useFireInput(state.input);
  const refs = useRef<Partial<Record<FieldKey, HTMLDivElement | null>>>({});
  const bind = (key: FieldKey) => (el: HTMLDivElement | null) => { refs.current[key] = el; };

  const submit = async () => {
    const { input, firstError } = validate();
    if (!input) {
      const el = firstError ? refs.current[firstError] : null;
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector("input")?.focus({ preventScroll: true });
      return;
    }
    await saveInput(input);
    navigate(ROUTES.result);
  };

  const moneyField = (key: MoneyKey, label: string, extraHint?: string) => {
    const v = draft[key];
    return <div className="calc-field" ref={bind(key)}>
      <label htmlFor={key}>{label}</label>
      <div className={`calc-box ${errors[key] ? "error" : ""}`}>
        <input id={key} inputMode="numeric" value={v === "" ? "" : comma(Number(v))} onChange={(e) => setMoney(key, e.target.value)} aria-invalid={!!errors[key]} aria-describedby={`${key}-msg`} />
        <span>원</span>
      </div>
      <p id={`${key}-msg`} className={errors[key] ? "calc-error" : "calc-hint"}>{errors[key] ?? [v === "" ? "" : manwon(Number(v)), extraHint].filter(Boolean).join(" · ")}</p>
    </div>;
  };

  const rateField = (key: RateKey, label: string, hint?: string) => {
    const r: Draft[RateKey] = draft[key];
    return <div className="calc-field" ref={bind(key)}>
      <span className="calc-label" id={`${key}-label`}>{label}</span>
      <div className="calc-chips" role="radiogroup" aria-labelledby={`${key}-label`}>
        {RATE_PRESETS[key].map((p) => <button key={p} role="radio" aria-checked={r.preset === p} className={r.preset === p ? "selected" : ""} onClick={() => setRate(key, { preset: p, custom: "" })}>{p}%</button>)}
        <button role="radio" aria-checked={r.preset === null} className={r.preset === null ? "selected" : ""} onClick={() => setRate(key, { preset: null, custom: r.custom })}>직접 입력</button>
      </div>
      {r.preset === null && <div className={`calc-box ${errors[key] ? "error" : ""}`}>
        <input inputMode="decimal" autoFocus value={r.custom} placeholder="예: 6.5" aria-label={`${label} 직접 입력`} onChange={(e) => setRate(key, { preset: null, custom: e.target.value.replace(/[^\d.-]/g, "") })} />
        <span>%</span>
      </div>}
      {(errors[key] || hint) && <p className={errors[key] ? "calc-error" : "calc-hint"}>{errors[key] ?? hint}</p>}
    </div>;
  };

  return <main className="calc-screen">
    <h1 className="calc-title">FIRE 조건을 알려주세요</h1>
    <div className="calc-form">
      <div className="calc-field" ref={bind("age")}>
        <label htmlFor="age">현재 나이</label>
        <div className={`calc-box ${errors.age ? "error" : ""}`}>
          <input id="age" inputMode="numeric" value={draft.age} onChange={(e) => setMoney("age", e.target.value)} aria-invalid={!!errors.age} />
          <span>세</span>
        </div>
        {errors.age && <p className="calc-error">{errors.age}</p>}
      </div>
      {moneyField("assets", "현재 투자 가능 자산", "부동산 등 비금융자산 제외")}
      {moneyField("monthlyInvest", "매월 투자금")}
      {moneyField("monthlyExpense", "은퇴 후 예상 월 생활비 (현재 가치)")}
      {rateField("annualReturn", "예상 연수익률", "물가상승을 뺀 실질 수익률로 생각해 주세요")}
      {rateField("withdrawalRate", "안전 인출률", "은퇴 후 매년 자산에서 꺼내 쓰는 비율이에요. 기본값 4%")}
    </div>
    <div className="calc-bottom"><button className="calc-primary" onClick={submit}>FIRE 계산하기</button></div>
  </main>;
}
