import { describe, expect, it } from "vitest";
import { migrateState } from "../migrate";

const input = { age: 30, assets: 50_000_000, monthlyInvest: 1_500_000, annualReturn: 0.06, monthlyExpense: 3_000_000, withdrawalRate: 0.035 };

describe("migrateState", () => {
  it("v2는 그대로 둔다", () => {
    const v2 = { version: 2 as const, input, logs: [{ ym: "2026-06", amount: 1, recordedAt: "2026-06-01T00:00:00.000Z" }], lastSeenStage: 1 as const, createdAt: "2026-01-01T00:00:00.000Z" };
    expect(migrateState(v2)).toBe(v2);
  });

  it("v1: 마지막 자산 기록이 시작 금액, 인출률 4% 고정, 수익률은 가까운 투자성향", () => {
    const v1 = {
      version: 1, input, lastSeenStage: 2, createdAt: "2026-01-01T00:00:00.000Z",
      logs: [
        { ym: "2025-12", assets: 1, recordedAt: "2025-12-01T00:00:00.000Z" }, // 입력 저장 이전 기록은 무시
        { ym: "2026-02", assets: 60_000_000, recordedAt: "2026-02-01T00:00:00.000Z" },
        { ym: "2026-03", assets: 70_000_000, recordedAt: "2026-03-01T00:00:00.000Z" },
      ],
    };
    const s = migrateState(v1);
    expect(s.version).toBe(2);
    expect(s.logs).toEqual([]);
    expect(s.input).toMatchObject({ assets: 70_000_000, withdrawalRate: 0.04, annualReturn: 0.05 });
    expect(s.lastSeenStage).toBe(2);
    expect(s.createdAt).toBe(v1.createdAt);
  });

  it("v1에 기록이 없으면 입력 자산을 유지", () => {
    const s = migrateState({ version: 1, input, logs: [], lastSeenStage: 0, createdAt: "2026-01-01T00:00:00.000Z" });
    expect(s.input?.assets).toBe(50_000_000);
  });

  it("알 수 없는 값은 빈 상태", () => {
    expect(migrateState(null).input).toBeNull();
    expect(migrateState({ version: 99 }).logs).toEqual([]);
  });
});
