import { useState } from "react";
import { DEFAULT_INPUT, INVEST_STYLES, nearestStyle, WITHDRAWAL_RATE } from "../shared/constants";
import type { FireInput } from "../shared/types";

export type MoneyKey = "assets" | "monthlyInvest" | "monthlyExpense";
export type FieldKey = "age" | MoneyKey | "style";
export type StyleKey = (typeof INVEST_STYLES)[number]["key"];

/** 금액은 모두 만원 단위 문자열 */
export interface Draft { age: string; assets: string; monthlyInvest: string; monthlyExpense: string; style: StyleKey }

export const WON_PER_MAN = 10_000;
const toMan = (won: number) => String(Math.round(won / WON_PER_MAN));

const toDraft = (i: FireInput): Draft => ({
  age: String(Math.floor(i.age)), assets: toMan(i.assets), monthlyInvest: toMan(i.monthlyInvest), monthlyExpense: toMan(i.monthlyExpense),
  style: nearestStyle(i.annualReturn).key,
});

const num = (s: string) => (s === "" ? NaN : Number(s));

const RULES: { key: FieldKey; check: (d: Draft) => string | null }[] = [
  { key: "age", check: (d) => { const v = num(d.age); return Number.isInteger(v) && v >= 18 && v <= 80 ? null : "나이는 18~80세 사이로 입력해 주세요"; } },
  { key: "assets", check: (d) => { const v = num(d.assets); return v >= 0 && v <= 10_000_000 ? null : "0원 이상 1,000억 원 이하로 입력해 주세요"; } },
  { key: "monthlyInvest", check: (d) => { const v = num(d.monthlyInvest); return v >= 0 && v <= 10_000 ? null : "0원 이상 1억 원 이하로 입력해 주세요"; } },
  { key: "monthlyExpense", check: (d) => { const v = num(d.monthlyExpense); return v >= 10 && v <= 10_000 ? null : "10만 원 이상 1억 원 이하로 입력해 주세요"; } },
];

export function useFireInput(saved: FireInput | null) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(saved ?? DEFAULT_INPUT));
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

  const setNumber = (key: "age" | MoneyKey, raw: string) => {
    const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    setDraft((d) => ({ ...d, [key]: digits }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const setStyle = (style: StyleKey) => setDraft((d) => ({ ...d, style }));

  /** 검증 통과 시 FireInput(원 단위), 실패 시 null + 첫 오류 키 */
  const validate = (): { input: FireInput | null; firstError: FieldKey | null } => {
    const found: Partial<Record<FieldKey, string>> = {};
    for (const r of RULES) { const msg = r.check(draft); if (msg) found[r.key] = msg; }
    setErrors(found);
    const firstError = RULES.find((r) => found[r.key])?.key ?? null;
    if (firstError) return { input: null, firstError };
    return {
      firstError: null,
      input: {
        age: Number(draft.age),
        assets: Number(draft.assets) * WON_PER_MAN,
        monthlyInvest: Number(draft.monthlyInvest) * WON_PER_MAN,
        monthlyExpense: Number(draft.monthlyExpense) * WON_PER_MAN,
        annualReturn: INVEST_STYLES.find((s) => s.key === draft.style)!.rate,
        withdrawalRate: WITHDRAWAL_RATE,
      },
    };
  };

  return { draft, errors, setNumber, setStyle, validate };
}
