import type { FireInput } from "../types";

export interface Heat {
  won: number;     // 오늘의 열 (원, 반올림 전)
  hours: number;   // 생활비 몇 시간어치인지
  calm: boolean;   // r ≤ 0 → "오늘은 바람이 잔잔해요"
}

/** 오늘의 열 = A × r ÷ 365, 자유 시간 = 열 ÷ (월생활비 × 12 ÷ 8760) */
export function calculateHeat(input: Pick<FireInput, "assets" | "annualReturn" | "monthlyExpense">): Heat {
  if (input.annualReturn <= 0 || input.assets <= 0) return { won: 0, hours: 0, calm: input.annualReturn <= 0 };
  const won = (input.assets * input.annualReturn) / 365;
  const hourlyCost = (input.monthlyExpense * 12) / 8760;
  return { won, hours: hourlyCost > 0 ? won / hourlyCost : 0, calm: false };
}
