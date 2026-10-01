import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT } from "../../constants";
import type { FireInput } from "../../types";
import { ageAfter, calculateFire, simulate, targetAssets } from "../fire";
import { calculateHeat } from "../heat";
import { calculateStages, determineStage, requiredRatio, stageReachMonths } from "../stages";
import { currentFlameInput, fuelOfMonth, fuelTotal, monthsBetween, withTotalAssets } from "../current";

const P: FireInput = { age: 30, assets: 50_000_000, monthlyInvest: 1_500_000, annualReturn: 0.07, monthlyExpense: 3_000_000, withdrawalRate: 0.04 };
const reachList = (input: FireInput) => { const r = stageReachMonths(input); return [r[1], r[2], r[3], r[4], r[5], r[6]]; };

describe("30세 페르소나 (§6.8)", () => {
  it("기본값은 페르소나에서 투자성향만 평균형(5%)", () => expect(DEFAULT_INPUT).toEqual({ ...P, annualReturn: 0.05 }));

  it("목표 자산 9억", () => expect(targetAssets(P)).toBe(900_000_000));

  it("FIRE까지 232개월 → 만 49세 4개월", () => {
    const r = calculateFire(P);
    expect(r.monthsToFire).toBe(232);
    expect(r.fireAge).toEqual({ years: 49, months: 4 });
    expect(r.series[0]).toEqual({ month: 0, assets: 50_000_000 });
    expect(r.series.at(-1)?.month).toBe(232 + 24);
  });

  it("현재 단계·충당률·불씨 진행률", () => {
    const s = calculateStages(P);
    expect(s.stage).toBe(0);
    expect(s.nextStage).toBe(1);
    expect(s.coverage).toBeCloseTo(0.0556, 4);
    expect(s.progressToNext).toBeCloseTo(0.4228, 3);
    expect(Math.floor(s.progressToNext * 100)).toBe(42);
  });

  it("단계 도달 개월", () => {
    expect(reachList(P)).toEqual([53, 94, 167, 186, 232, 290]);
    expect(ageAfter(30, 53)).toEqual({ years: 34, months: 5 });
    expect(ageAfter(30, 290)).toEqual({ years: 54, months: 2 });
  });

  it("A_52 / A_53", () => {
    const a = simulate(P, 53);
    expect(Math.round(a[52])).toBe(157_418_157);
    expect(Math.round(a[53])).toBe(159_808_222);
  });

  it("오늘의 열", () => {
    const h = calculateHeat(P);
    expect(Math.round(h.won)).toBe(9_589);
    expect(h.hours).toBeCloseTo(2.33, 2);
    const a = simulate(P, 53);
    expect(Math.round(calculateHeat({ ...P, assets: a[52] }).won)).toBe(30_190);
    expect(Math.round(calculateHeat({ ...P, assets: a[53] }).won)).toBe(30_648);
  });
});

describe("단계별 필요 비율", () => {
  it("고정 비율 단계", () => {
    const r = calculateStages(P).requiredRatio;
    expect([r[0], r[2], r[3], r[4], r[5], r[6]]).toEqual([0, 0.3, 0.6, 0.7, 1, 1.5]);
  });
  it("불씨는 60세까지의 성장 배수의 역수 (30세, 7% → 약 13%)", () => {
    expect(requiredRatio(1, P)).toBeCloseTo(1 / Math.pow(1.07, 30), 10);
    expect(Math.ceil(requiredRatio(1, P) * 100)).toBe(14);
    expect(Math.ceil(requiredRatio(1, { ...P, annualReturn: 0.05 }) * 100)).toBe(24);
  });
  it("60세 이상이거나 수익률 0이면 100%", () => {
    expect(requiredRatio(1, { ...P, age: 60 })).toBe(1);
    expect(requiredRatio(1, { ...P, annualReturn: 0 })).toBe(1);
  });
  it("필요 비율을 채우면 해당 단계가 충족된다", () => {
    for (const s of [1, 2, 3, 4, 5, 6] as const) {
      expect(determineStage({ ...P, assets: requiredRatio(s, P) * 900_000_000 + 1 })).toBeGreaterThanOrEqual(s);
    }
  });
});

describe("B: 장작 +50만", () => {
  const B = { ...P, monthlyInvest: 2_000_000 };
  it("단계 도달 개월", () => expect(reachList(B)).toEqual([39, 78, 141, 158, 201, 256]));
  it("용광로 31개월 빠름", () => expect(stageReachMonths(P)[5]! - stageReachMonths(B)[5]!).toBe(31));
});

describe("회귀 케이스", () => {
  it("수익률 6%", () => { const r = stageReachMonths({ ...P, annualReturn: 0.06 }); expect([r[5], r[1]]).toEqual([251, 88]); });
  it("생활비 250만", () => { const r = stageReachMonths({ ...P, monthlyExpense: 2_500_000 }); expect([r[5], r[1]]).toEqual([208, 36]); });
});

describe("예외", () => {
  it("assets ≥ T → 0개월, 5단계 이상", () => {
    const input = { ...P, assets: 900_000_000 };
    expect(calculateFire(input).monthsToFire).toBe(0);
    expect(determineStage(input)).toBeGreaterThanOrEqual(5);
  });
  it("투자 0 · 수익률 0 → 미도달, 무한 루프 없음", () => {
    const input = { ...P, monthlyInvest: 0, annualReturn: 0 };
    expect(calculateFire(input).monthsToFire).toBeNull();
    expect(stageReachMonths(input)[5]).toBeNull();
    expect(calculateHeat(input)).toEqual({ won: 0, hours: 0, calm: true });
  });
  it("인출률 0 / 생활비 0 → throw", () => {
    expect(() => calculateFire({ ...P, withdrawalRate: 0 })).toThrow();
    expect(() => calculateFire({ ...P, monthlyExpense: 0 })).toThrow();
  });
  it("판정은 높은 단계부터 (Coast 미충족이어도 모닥불)", () => {
    // 59세: 60세까지 1년뿐이라 Coast는 어렵지만 충당률 0.65
    expect(determineStage({ ...P, age: 59, assets: 0.65 * 900_000_000 })).toBe(3);
  });
});

describe("불꽃 화면 입력 (장작 여러 번)", () => {
  const state = {
    version: 2 as const, input: P, lastSeenStage: 0 as const, createdAt: "2026-01-15T00:00:00.000Z",
    logs: [
      { ym: "2026-06", amount: 5_000_000, recordedAt: "2026-06-10T00:00:00.000Z" },
      { ym: "2026-06", amount: 2_000_000, recordedAt: "2026-06-20T00:00:00.000Z" },
      { ym: "2026-05", amount: 1_000_000, recordedAt: "2026-05-02T00:00:00.000Z" },
    ],
  };
  it("경과 개월만큼 나이 증가, 시작 금액에 장작 합계를 더한다", () => {
    expect(monthsBetween("2026-01", "2027-03")).toBe(14);
    const cur = currentFlameInput(state, "2026-07")!;
    expect(cur.assets).toBe(50_000_000 + 8_000_000);
    expect(cur.age).toBeCloseTo(30.5, 5);
  });
  it("이번 달 장작 누적과 횟수", () => {
    expect(fuelTotal(state)).toBe(8_000_000);
    expect(fuelOfMonth(state, "2026-06")).toEqual({ total: 7_000_000, count: 2 });
    expect(fuelOfMonth(state, "2026-07")).toEqual({ total: 0, count: 0 });
  });
  it("입력이 없으면 null", () => expect(currentFlameInput({ ...state, input: null }, "2026-07")).toBeNull());
  it("총 저축 금액 수정: 장작 기록은 두고 시작 금액만 조정", () => {
    const next = withTotalAssets(state, 70_000_000);
    expect(next.logs).toHaveLength(3);
    expect(next.input?.assets).toBe(62_000_000);
    expect(currentFlameInput(next, "2026-07")?.assets).toBe(70_000_000);
  });
  it("총액이 장작 합계보다 작으면 기록을 비우고 총액을 시작 금액으로", () => {
    const next = withTotalAssets(state, 5_000_000);
    expect(next.logs).toEqual([]);
    expect(currentFlameInput(next, "2026-07")?.assets).toBe(5_000_000);
  });
});
