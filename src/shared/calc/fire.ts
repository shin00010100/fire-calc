import { MAX_MONTHS } from "../constants";
import type { FireInput, FireResult } from "../types";

/** T = 월생활비 × 12 ÷ 인출률 */
export function targetAssets(input: FireInput): number {
  if (!(input.withdrawalRate > 0) || !(input.monthlyExpense > 0)) throw new Error("withdrawalRate와 monthlyExpense는 0보다 커야 해요");
  return (input.monthlyExpense * 12) / input.withdrawalRate;
}

/** 연수익률 → 월수익률 (월 복리) */
export const monthlyRate = (annualReturn: number) => Math.pow(1 + annualReturn, 1 / 12) - 1;

/** A_{t+1} = A_t × (1 + r_m) + 월투자금 */
export const nextAssets = (assets: number, input: FireInput, rm = monthlyRate(input.annualReturn)) => assets * (1 + rm) + input.monthlyInvest;

/** 월말 적립 시뮬레이션. [A_0, A_1, …, A_months] */
export function simulate(input: FireInput, months: number): number[] {
  const rm = monthlyRate(input.annualReturn);
  const out = [input.assets];
  for (let t = 1; t <= months; t += 1) out.push(nextAssets(out[t - 1], input, rm));
  return out;
}

/** 나이(소수 가능) + m개월 → 만 나이 {years, months} */
export function ageAfter(ageYears: number, m: number) {
  const total = Math.floor(ageYears * 12 + 1e-6) + m;
  return { years: Math.floor(total / 12), months: total % 12 };
}

/** 오늘 + m개월 */
export function dateAfter(m: number, from = new Date()) {
  return new Date(from.getFullYear(), from.getMonth() + m, 1);
}

export function calculateFire(input: FireInput): FireResult {
  const T = targetAssets(input);
  const rm = monthlyRate(input.annualReturn);
  const series = [{ month: 0, assets: input.assets }];
  let monthsToFire: number | null = input.assets >= T ? 0 : null;
  let assets = input.assets;
  for (let t = 1; t <= MAX_MONTHS; t += 1) {
    // 그래프는 FIRE 시점 + 2년까지
    if (monthsToFire !== null && t > monthsToFire + 24) break;
    assets = nextAssets(assets, input, rm);
    series.push({ month: t, assets });
    if (monthsToFire === null && assets >= T) monthsToFire = t;
  }
  return { targetAssets: T, monthsToFire, fireAge: monthsToFire === null ? null : ageAfter(input.age, monthsToFire), series };
}
