import type { FireInput, FlameState } from "../types";

/** ISO 시각 → 로컬 기준 'YYYY-MM' */
export const isoToYm = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };

/** 'YYYY-MM' 두 개의 개월 차이 */
export function monthsBetween(fromYm: string, toYm: string): number {
  const [fy, fm] = fromYm.split("-").map(Number);
  const [ty, tm] = toYm.split("-").map(Number);
  return Math.max(0, (ty - fy) * 12 + (tm - fm));
}

/** 입력 저장 이후 넣은 장작 합계 */
export const fuelTotal = (state: FlameState) => state.logs.reduce((sum, l) => sum + l.amount, 0);

/** 이번 달에 넣은 장작 합계와 횟수 */
export function fuelOfMonth(state: FlameState, ym: string) {
  const logs = state.logs.filter((l) => l.ym === ym);
  return { total: logs.reduce((sum, l) => sum + l.amount, 0), count: logs.length };
}

/**
 * 불꽃 화면용 입력: 자산 = 시작 금액 + 넣은 장작 합계,
 * 나이 = 입력 나이 + 입력 저장 이후 경과 개월 / 12
 */
export function currentFlameInput(state: FlameState, nowYm: string): FireInput | null {
  if (!state.input) return null;
  const elapsed = monthsBetween(isoToYm(state.createdAt), nowYm);
  return { ...state.input, assets: state.input.assets + fuelTotal(state), age: state.input.age + elapsed / 12 };
}
