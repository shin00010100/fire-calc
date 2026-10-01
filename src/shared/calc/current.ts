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

/**
 * 총 저축 금액을 직접 맞춘다. 장작 기록은 그대로 두고 시작 금액만 조정(총액 = 시작 금액 + 장작 합계).
 * 입력한 총액이 장작 합계보다 작으면 기록을 비우고 총액을 시작 금액으로 삼는다.
 */
export function withTotalAssets(state: FlameState, total: number): FlameState {
  if (!state.input) return state;
  const fuel = fuelTotal(state);
  return total >= fuel
    ? { ...state, input: { ...state.input, assets: total - fuel } }
    : { ...state, input: { ...state.input, assets: total }, logs: [] };
}
