import { describe, expect, it } from "vitest";
import { ageTickStep, amountLabel, amountTicks, spreadLabels } from "../chartMath";

describe("amountTicks / amountLabel", () => {
  it("눈금은 5개 이하, 0부터 시작", () => {
    const t = amountTicks(1.43e9);
    expect(t).toEqual([0, 5e8, 1e9]);
    expect(amountTicks(2.2e8).length).toBeLessThanOrEqual(6);
    expect(amountTicks(2.2e8)[0]).toBe(0);
  });
  it("라벨", () => {
    expect([0, 5e7, 1e8, 1.5e8, 9e8, 1.35e9].map(amountLabel)).toEqual(["0", "5,000만", "1억", "1.5억", "9억", "13.5억"]);
  });
});

describe("ageTickStep", () => {
  it("기간이 길수록 성기게", () => expect([6, 20, 40].map(ageTickStep)).toEqual([2, 5, 10]));
});

describe("spreadLabels", () => {
  it("겹치는 라벨을 gap만큼 벌리고 입력 순서를 유지", () => {
    expect(spreadLabels([100, 105, 110], 12, 0, 300)).toEqual([100, 112, 124]);
    expect(spreadLabels([110, 100], 12, 0, 300)).toEqual([112, 100]);
  });
  it("이미 충분히 떨어져 있으면 그대로", () => expect(spreadLabels([20, 60, 120], 12, 0, 300)).toEqual([20, 60, 120]));
  it("아래로 넘치면 위로 당긴다", () => {
    const out = spreadLabels([290, 292, 295], 12, 0, 300);
    expect(Math.max(...out)).toBeLessThanOrEqual(300);
    expect(out[1] - out[0]).toBeGreaterThanOrEqual(12);
    expect(out[2] - out[1]).toBeGreaterThanOrEqual(12);
  });
});
