import { useRef, useState } from "react";
import { navigate, ROUTES } from "../routes";
import { currentFlameInput } from "../shared/calc/current";
import { INVEST_STYLES, WITHDRAWAL_RATE } from "../shared/constants";
import { useFlameStore } from "../shared/FlameStateContext";
import { comma, manwon, ymKey } from "../shared/format";
import { useFireInput, WON_PER_MAN, type FieldKey, type MoneyKey } from "./useFireInput";
import "./calculator.css";

/** 투자성향 버튼 장식 이모지 */
const STYLE_EMOJI: Record<string, string> = { conservative: "🐢", balanced: "🐇", aggressive: "🚀" };

export default function InputScreen() {
  const { state, saveInput } = useFlameStore();
  // 이미 입력한 적이 있으면 "지금" 값(시작 금액 + 넣은 장작, 경과한 나이)으로 채운다
  const [saved] = useState(() => currentFlameInput(state, ymKey(new Date())));
  const { draft, errors, setNumber, setStyle, validate } = useFireInput(saved);
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

  const moneyField = (key: MoneyKey, emoji: string, label: string, extraHint?: string) => {
    const v = draft[key];
    // 1억 이상은 억 단위로 한 번 더 보여준다
    const big = v !== "" && Number(v) >= 10_000 ? manwon(Number(v) * WON_PER_MAN) : "";
    return <div className="calc-field" ref={bind(key)}>
      <label htmlFor={key}><span className="emo" aria-hidden="true">{emoji}</span>{label}</label>
      <div className={`calc-box ${errors[key] ? "error" : ""}`}>
        <input id={key} inputMode="numeric" value={v === "" ? "" : comma(Number(v))} onChange={(e) => setNumber(key, e.target.value)} aria-invalid={!!errors[key]} aria-describedby={`${key}-msg`} />
        <span>만원</span>
      </div>
      <p id={`${key}-msg`} className={errors[key] ? "calc-error" : "calc-hint"}>{errors[key] ?? [big, extraHint].filter(Boolean).join(" · ")}</p>
    </div>;
  };

  return <main className="calc-screen">
    <h1 className="calc-title">FIRE 조건을 알려주세요</h1>
    <p className="calc-lead">금액은 만 원 단위로 입력해 주세요.</p>
    <div className="calc-form">
      <div className="calc-field" ref={bind("age")}>
        <label htmlFor="age"><span className="emo" aria-hidden="true">🎂</span>현재 나이</label>
        <div className={`calc-box ${errors.age ? "error" : ""}`}>
          <input id="age" inputMode="numeric" value={draft.age} onChange={(e) => setNumber("age", e.target.value)} aria-invalid={!!errors.age} />
          <span>세</span>
        </div>
        {errors.age && <p className="calc-error">{errors.age}</p>}
      </div>
      {moneyField("assets", "💼", "현재 투자 가능 자산", "부동산 등 비금융자산 제외")}
      {moneyField("monthlyInvest", "🪙", "매월 투자금")}
      {moneyField("monthlyExpense", "🏠", "은퇴 후 예상 월 생활비 (현재 가치)")}

      <div className="calc-field" ref={bind("style")}>
        <span className="calc-label" id="style-label"><span className="emo" aria-hidden="true">🧭</span>투자성향</span>
        <div className="calc-styles" role="radiogroup" aria-labelledby="style-label">
          {INVEST_STYLES.map((s) => <button key={s.key} role="radio" aria-checked={draft.style === s.key} className={draft.style === s.key ? "selected" : ""} onClick={() => setStyle(s.key)}>
            <i className="emo" aria-hidden="true">{STYLE_EMOJI[s.key]}</i><strong>{s.label}</strong><span>연 {Math.round(s.rate * 100)}%</span>
          </button>)}
        </div>
        <p className="calc-hint">선택한 성향의 연 수익률로 자산이 불어난다고 가정해요.</p>
      </div>

      <div className="calc-field">
        <span className="calc-label"><span className="emo" aria-hidden="true">🛡️</span>안전 인출률</span>
        <div className="calc-box fixed"><strong>{Math.round(WITHDRAWAL_RATE * 100)}%</strong><span>고정</span></div>
        <p className="calc-hint">은퇴 후 매년 자산에서 꺼내 쓰는 비율이에요. 목표 자산 = 월 생활비 × 12 ÷ {Math.round(WITHDRAWAL_RATE * 100)}%</p>
      </div>
    </div>
    <div className="calc-bottom"><button className="calc-primary" onClick={submit}>FIRE 계산하기</button></div>
  </main>;
}
