import { useState } from "react";
import { DEFAULT_INPUT } from "../shared/constants";
import type { FireInput } from "../shared/types";

export type MoneyKey = "assets" | "monthlyInvest" | "monthlyExpense";
export type RateKey = "annualReturn" | "withdrawalRate";
export type FieldKey = "age" | MoneyKey | RateKey;

export const RATE_PRESETS: Record<RateKey, number[]> = { annualReturn: [4, 5, 7], withdrawalRate: [3, 3.5, 4] };

interface RateDraft { preset: number | null; custom: string }
export interface Draft { age: string; assets: string; monthlyInvest: string; monthlyExpense: string; annualReturn: RateDraft; withdrawalRate: RateDraft }

const toRateDraft = (key: RateKey, v: number): RateDraft => {
  const pct = Math.round(v * 1000) / 10;
  return RATE_PRESETS[key].includes(pct) ? { preset: pct, custom: "" } : { preset: null, custom: String(pct) };
};

const toDraft = (i: FireInput): Draft => ({
  age: String(i.age), assets: String(i.assets), monthlyInvest: String(i.monthlyInvest), monthlyExpense: String(i.monthlyExpense),
  annualReturn: toRateDraft("annualReturn", i.annualReturn), withdrawalRate: toRateDraft("withdrawalRate", i.withdrawalRate),
});

const ratePct = (r: RateDraft) => (r.preset !== null ? r.preset : r.custom.trim() === "" ? NaN : Number(r.custom));
const money = (s: string) => (s === "" ? NaN : Number(s));

const RULES: { key: FieldKey; check: (d: Draft) => string | null }[] = [
  { key: "age", check: (d) => { const v = money(d.age); return Number.isInteger(v) && v >= 18 && v <= 80 ? null : "나이는 18~80세 사이로 입력해 주세요"; } },
  { key: "assets", check: (d) => { const v = money(d.assets); return v >= 0 && v <= 100_000_000_000 ? null : "0원 이상 1,000억 원 이하로 입력해 주세요"; } },
  { key: "monthlyInvest", check: (d) => { const v = money(d.monthlyInvest); return v >= 0 && v <= 100_000_000 ? null : "0원 이상 1억 원 이하로 입력해 주세요"; } },
  { key: "monthlyExpense", check: (d) => { const v = money(d.monthlyExpense); return v >= 100_000 && v <= 100_000_000 ? null : "10만 원 이상 1억 원 이하로 입력해 주세요"; } },
  { key: "annualReturn", check: (d) => { const v = ratePct(d.annualReturn); return v >= -5 && v <= 20 ? null : "-5% ~ 20% 사이로 입력해 주세요"; } },
  { key: "withdrawalRate", check: (d) => { const v = ratePct(d.withdrawalRate); return v >= 1 && v <= 10 ? null : "1% ~ 10% 사이로 입력해 주세요"; } },
];

export function useFireInput(saved: FireInput | null) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(saved ?? DEFAULT_INPUT));
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

  const setMoney = (key: "age" | MoneyKey, raw: string) => {
    const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    setDraft((d) => ({ ...d, [key]: digits }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const setRate = (key: RateKey, next: RateDraft) => {
    setDraft((d) => ({ ...d, [key]: next }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  /** 검증 통과 시 FireInput, 실패 시 null + 첫 오류 키 */
  const validate = (): { input: FireInput | null; firstError: FieldKey | null } => {
    const found: Partial<Record<FieldKey, string>> = {};
    for (const r of RULES) { const msg = r.check(draft); if (msg) found[r.key] = msg; }
    setErrors(found);
    const firstError = RULES.find((r) => found[r.key])?.key ?? null;
    if (firstError) return { input: null, firstError };
    return {
      firstError: null,
      input: {
        age: Number(draft.age), assets: Number(draft.assets), monthlyInvest: Number(draft.monthlyInvest), monthlyExpense: Number(draft.monthlyExpense),
        annualReturn: ratePct(draft.annualReturn) / 100, withdrawalRate: ratePct(draft.withdrawalRate) / 100,
      },
    };
  };

  return { draft, errors, setMoney, setRate, validate };
}
