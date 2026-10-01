import { nearestStyle, WITHDRAWAL_RATE } from "./constants";
import type { FireInput, FlameState, StageIndex } from "./types";

export const emptyState = (): FlameState => ({ version: 2, input: null, logs: [], lastSeenStage: 0, createdAt: new Date().toISOString() });

interface LegacyV1 {
  version: 1;
  input: FireInput | null;
  logs: { ym: string; assets: number; recordedAt: string }[];
  lastSeenStage: StageIndex;
  createdAt: string;
}

/**
 * 저장된 값을 현재 버전(2)으로 올린다.
 * v1은 장작을 "그 달 자산 총액"으로 기록했으므로, 마지막 기록을 새 시작 금액으로 삼고 기록은 비운다.
 * 인출률은 4%로 고정, 수익률은 가장 가까운 투자성향 값으로 맞춘다.
 */
export function migrateState(raw: unknown): FlameState {
  const s = raw as { version?: number } | null;
  if (s?.version === 2) return raw as FlameState;
  if (s?.version !== 1) return emptyState();
  const legacy = raw as LegacyV1;
  const last = legacy.logs.filter((l) => l.recordedAt >= legacy.createdAt).at(-1);
  const input = legacy.input
    ? { ...legacy.input, assets: last?.assets ?? legacy.input.assets, withdrawalRate: WITHDRAWAL_RATE, annualReturn: nearestStyle(legacy.input.annualReturn).rate }
    : null;
  return { version: 2, input, logs: [], lastSeenStage: legacy.lastSeenStage, createdAt: legacy.createdAt };
}
