import type { FireInput, FlameState } from "../types";

/** ISO 시각 → 로컬 기준 'YYYY-MM' */
export const isoToYm = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };

/** 'YYYY-MM' 두 개의 개월 차이 */
export function monthsBetween(fromYm: string, toYm: string): number {
  const [fy, fm] = fromYm.split("-").map(Number);
  const [ty, tm] = toYm.split("-").map(Number);
  return Math.max(0, (ty - fy) * 12 + (tm - fm));
}

/** 입력 저장 이후의 최신 장작 기록 */
export function latestLog(state: FlameState) {
  const logs = state.logs.filter((l) => l.recordedAt >= state.createdAt);
  return logs.length ? logs[logs.length - 1] : null;
}

/**
 * §6.7 불꽃 화면용 입력: 자산 = 최신 장작 기록(없으면 입력 자산),
 * 나이 = 입력 나이 + 입력 저장 이후 경과 개월 / 12
 */
export function currentFlameInput(state: FlameState, nowYm: string): FireInput | null {
  if (!state.input) return null;
  const log = latestLog(state);
  const elapsed = monthsBetween(isoToYm(state.createdAt), nowYm);
  return { ...state.input, assets: log?.assets ?? state.input.assets, age: state.input.age + elapsed / 12 };
}
