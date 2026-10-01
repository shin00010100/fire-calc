import { describe, expect, it } from "vitest";
import { age, duration, eok, hours, manwon, percent, won, ym } from "../format";

describe("format", () => {
  it("won", () => expect(won(9589.04)).toBe("9,589원"));
  it("manwon", () => {
    expect(manwon(157_420_000)).toBe("1억 5,742만 원");
    expect(manwon(50_000_000)).toBe("5,000만 원");
    expect(manwon(1_500_000)).toBe("150만 원");
    expect(manwon(100_000_000)).toBe("1억 원");
    expect(manwon(-2_390_000)).toBe("-239만 원");
  });
  it("eok", () => { expect(eok(900_000_000)).toBe("9억 원"); expect(eok(950_000_000)).toBe("9억 5,000만 원"); });
  it("age", () => { expect(age(49, 4)).toBe("만 49세 4개월"); expect(age(49, 0)).toBe("만 49세"); });
  it("duration", () => { expect(duration(232)).toBe("19년 4개월"); expect(duration(7)).toBe("7개월"); expect(duration(36)).toBe("3년"); });
  it("percent", () => { expect(percent(0.4228)).toBe("42%"); expect(percent(0.0556, 1)).toBe("5.6%"); expect(percent(1)).toBe("100%"); });
  it("ym", () => expect(ym(new Date(2046, 1, 1))).toBe("2046년 2월"));
  it("hours", () => { expect(hours(2.333)).toBe("2.3시간"); expect(hours(27.5)).toBe("1일 3시간"); });
});
