import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT } from "../../constants";
import type { FireInput } from "../../types";
import { ageAfter, calculateFire, simulate, targetAssets } from "../fire";
import { calculateHeat } from "../heat";
import { calculateStages, determineStage, requiredAmount, requiredRatio, stageReachMonths } from "../stages";
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
    expect(s.progressToNext).toBeCloseTo(5 / 9, 6);   // 5,000만 ÷ 불씨 필요 9,000만
    expect(Math.floor(s.progressToNext * 100)).toBe(55);
  });

  it("단계 도달 개월", () => {
    expect(reachList(P)).toEqual([22, 94, 167, 186, 232, 290]);
    expect(ageAfter(30, 22)).toEqual({ years: 31, months: 10 });
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

describe("단계별 필요 비율 (모두 목표 자산 대비 고정 비율)", () => {
  it("불씨 10% · 촛불 30% · 모닥불 60% · 벽난로 70% · 용광로 100% · 불꽃놀이 150%", () => {
    const r = calculateStages(P).requiredRatio;
    expect([r[0], r[1], r[2], r[3], r[4], r[5], r[6]]).toEqual([0, 0.1, 0.3, 0.6, 0.7, 1, 1.5]);
  });
  it("나이·수익률·자산이 달라도 필요 비율은 같다", () => {
    for (const input of [P, { ...P, age: 55, annualReturn: 0.03 }, { ...P, assets: 1 }]) {
      expect(calculateStages(input).requiredRatio).toEqual(calculateStages(P).requiredRatio);
    }
  });
  it("단계 도달 시점은 투자성향·나이와 상관없이 항상 단계 순서대로 늘어난다", () => {
    for (const annualReturn of [0.03, 0.05, 0.07]) for (const age of [20, 30, 45, 59]) {
      const r = stageReachMonths({ ...P, annualReturn, age });
      const list = [r[1], r[2], r[3], r[4], r[5], r[6]];
      expect(list.every((m) => m !== null)).toBe(true);
      expect(list).toEqual([...list].sort((x, y) => x! - y!));
    }
  });
  it("필요 금액은 만원 단위로 올림, 비율 0이면 0", () => {
    expect(requiredAmount(0.1, 900_000_000)).toBe(90_000_000);
    expect(requiredAmount(0.3, 900_000_000)).toBe(270_000_000);
    expect(requiredAmount(0, 900_000_000)).toBe(0);
  });
  it("다음 단계가 오르면 목표 금액도 다음 단계 것으로 바뀐다", () => {
    const at = (assets: number) => { const s = calculateStages({ ...P, assets }); return s.nextStage === null ? null : requiredAmount(s.requiredRatio[s.nextStage], s.targetAssets); };
    expect(at(50_000_000)).toBe(90_000_000);      // 성냥 → 다음은 불씨(10%)
    expect(at(100_000_000)).toBe(270_000_000);    // 불씨 → 다음은 촛불(30%)
    expect(at(300_000_000)).toBe(540_000_000);    // 촛불 → 다음은 모닥불(60%)
    expect(at(1_400_000_000)).toBeNull();         // 불꽃놀이 → 다음 없음
  });
  it("필요 금액을 채우면 해당 단계가 충족되고, 모자라면 아니다", () => {
    for (const s of [1, 2, 3, 4, 5, 6] as const) {
      expect(determineStage({ ...P, assets: requiredRatio(s) * 900_000_000 + 1 })).toBeGreaterThanOrEqual(s);
      expect(determineStage({ ...P, assets: requiredRatio(s) * 900_000_000 - 1 })).toBeLessThan(s);
    }
  });
  it("달성 여부는 reachMonths === 0 으로 단계마다 판단 (아래 단계는 항상 먼저 달성)", () => {
    const s = calculateStages({ ...P, annualReturn: 0.03, assets: 300_000_000 });
    expect(s.stage).toBe(2);
    expect(s.reachMonths[1]).toBe(0);
    expect(s.reachMonths[2]).toBe(0);
    expect(s.reachMonths[3]).toBeGreaterThan(0);
  });
});

describe("B: 장작 +50만", () => {
  const B = { ...P, monthlyInvest: 2_000_000 };
  it("단계 도달 개월", () => expect(reachList(B)).toEqual([17, 78, 141, 158, 201, 256]));
  it("용광로 31개월 빠름", () => expect(stageReachMonths(P)[5]! - stageReachMonths(B)[5]!).toBe(31));
});

describe("회귀 케이스", () => {
  it("수익률 6%", () => { const r = stageReachMonths({ ...P, annualReturn: 0.06 }); expect([r[5], r[1]]).toEqual([251, 22]); });
  it("생활비 250만", () => { const r = stageReachMonths({ ...P, monthlyExpense: 2_500_000 }); expect([r[5], r[1]]).toEqual([208, 14]); });
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
  it("판정은 높은 단계부터 (충당률 0.65 → 모닥불)", () => {
    expect(determineStage({ ...P, assets: 0.65 * 900_000_000 })).toBe(3);
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
