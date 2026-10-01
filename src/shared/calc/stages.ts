import { MAX_MONTHS, STAGE_INDICES, STAGE_THRESHOLDS as TH } from "../constants";
import type { FireInput, StageIndex, StageResult } from "../types";
import { monthlyRate, nextAssets, targetAssets } from "./fire";

/** 충당률 = A × 인출률 ÷ (월생활비 × 12) = A ÷ T */
export const coverage = (input: FireInput, assets = input.assets) => assets / targetAssets(input);

/** 더 넣지 않고 60세까지 굴렸을 때 자산. r ≤ 0이면 성장 없음(= A ≥ T 판정) */
function coastValue(assets: number, ageYears: number, input: FireInput) {
  const growth = input.annualReturn > 0 ? Math.pow(1 + input.annualReturn, Math.max(0, TH.coastAge - ageYears)) : 1;
  return assets * growth;
}

/** 단계 s의 "현재 값 ÷ 기준값" 비율. 1 이상이면 충족 */
function stageRatio(s: StageIndex, assets: number, ageYears: number, input: FireInput): number {
  const T = targetAssets(input);
  switch (s) {
    case 0: return 1;
    case 1: return coastValue(assets, ageYears, input) / T;
    case 2: return coverage(input, assets) / TH.semi;
    case 3: return coverage(input, assets) / TH.barista;
    case 4: return assets / (TH.lean * T);
    case 5: return assets / (TH.full * T);
    case 6: return assets / (TH.fat * T);
  }
}

export const satisfied = (s: StageIndex, assets: number, ageYears: number, input: FireInput) => stageRatio(s, assets, ageYears, input) >= 1;

/** 현재 단계 = 0개월 시점에 만족하는 가장 높은 단계 */
export function determineStage(input: FireInput): StageIndex {
  for (let s = 6; s >= 1; s -= 1) if (satisfied(s as StageIndex, input.assets, input.age, input)) return s as StageIndex;
  return 0;
}

/** 단계별 최초 도달 개월 (0 = 이미, null = 1200개월 내 미도달) */
export function stageReachMonths(input: FireInput): Record<StageIndex, number | null> {
  const reach: Record<StageIndex, number | null> = { 0: 0, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null };
  const rm = monthlyRate(input.annualReturn);
  let assets = input.assets;
  for (let t = 0; t <= MAX_MONTHS; t += 1) {
    if (t > 0) assets = nextAssets(assets, input, rm);
    let pending = false;
    for (const s of STAGE_INDICES) {
      if (reach[s] !== null) continue;
      if (satisfied(s, assets, input.age + t / 12, input)) reach[s] = t;
      else pending = true;
    }
    if (!pending) break;
  }
  return reach;
}

export function progressToNext(input: FireInput, stage = determineStage(input)): number {
  if (stage === 6) return 1;
  return Math.min(1, Math.max(0, stageRatio((stage + 1) as StageIndex, input.assets, input.age, input)));
}

/**
 * 단계 s에 닿는 데 필요한 자산이 목표 자산의 몇 배인지.
 * 불씨는 "지금 자산을 더 넣지 않고 60세까지 굴려 목표에 닿는" 조건이라 1 ÷ (60세까지의 성장 배수)다.
 */
export function requiredRatio(s: StageIndex, input: FireInput): number {
  switch (s) {
    case 0: return 0;
    case 1: return 1 / coastValue(1, input.age, input);
    case 2: return TH.semi;
    case 3: return TH.barista;
    case 4: return TH.lean;
    case 5: return TH.full;
    case 6: return TH.fat;
  }
}

/** 필요 비율 × 목표 자산을 만원 단위로 올림한 금액. 비율이 0이면 0 */
export const requiredAmount = (ratio: number, target: number) => (ratio > 0 ? Math.ceil((ratio * target) / 10_000 - 1e-6) * 10_000 : 0);

export function calculateStages(input: FireInput): StageResult {
  const stage = determineStage(input);
  return {
    stage,
    reachMonths: stageReachMonths(input),
    nextStage: stage === 6 ? null : ((stage + 1) as StageIndex),
    progressToNext: progressToNext(input, stage),
    targetAssets: targetAssets(input),
    coverage: coverage(input),
    requiredRatio: Object.fromEntries(STAGE_INDICES.map((s) => [s, requiredRatio(s, input)])) as Record<StageIndex, number>,
  };
}
