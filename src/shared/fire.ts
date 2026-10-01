import type { FireInput, FireResult } from "./types";

export function calculateFire(input: FireInput): FireResult {
  const targetAssets = input.withdrawalRate > 0 ? (input.monthlyExpenses * 12) / input.withdrawalRate : 0;
  const progress = targetAssets > 0 ? Math.min(input.currentAssets / targetAssets, 1) : 0;
  const monthlyReturn = Math.pow(1 + input.annualReturn, 1 / 12) - 1;
  const projectedAssets = [{ month: 0, age: input.currentAge, assets: input.currentAssets }];
  if (input.currentAssets >= targetAssets) return { targetAssets, monthsToFire: 0, fireAge: { years: input.currentAge, months: 0 }, fireDate: formatFireDate(0), progress, projectedAssets };
  let assets = input.currentAssets;
  let monthsToFire: number | null = null;
  for (let month = 1; month <= 1200; month += 1) {
    assets = assets * (1 + monthlyReturn) + input.monthlyInvestment;
    if (month % 12 === 0 || assets >= targetAssets) projectedAssets.push({ month, age: input.currentAge + month / 12, assets });
    if (assets >= targetAssets) { monthsToFire = month; break; }
  }
  return { targetAssets, monthsToFire, fireAge: monthsToFire === null ? null : { years: input.currentAge + Math.floor(monthsToFire / 12), months: monthsToFire % 12 }, fireDate: monthsToFire === null ? null : formatFireDate(monthsToFire), progress, projectedAssets };
}

function formatFireDate(months: number) { const date = new Date(); date.setMonth(date.getMonth() + months); return `${date.getFullYear()}년 ${date.getMonth() + 1}월`; }
