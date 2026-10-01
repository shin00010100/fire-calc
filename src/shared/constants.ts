import type { FireInput, StageIndex } from "./types";

/** 안전 인출률은 4%로 고정 */
export const WITHDRAWAL_RATE = 0.04;

/** 투자성향 → 예상 연수익률 */
export const INVEST_STYLES = [
  { key: "conservative", label: "보수형", rate: 0.03 },
  { key: "balanced", label: "평균형", rate: 0.05 },
  { key: "aggressive", label: "공격형", rate: 0.07 },
] as const;

/** 저장된 수익률과 가장 가까운 투자성향 */
export const nearestStyle = (rate: number) => INVEST_STYLES.reduce((best, s) => (Math.abs(s.rate - rate) < Math.abs(best.rate - rate) ? s : best));

export const DEFAULT_INPUT: FireInput = {
  age: 30,
  assets: 50_000_000,
  monthlyInvest: 1_500_000,
  annualReturn: 0.05,
  monthlyExpense: 3_000_000,
  withdrawalRate: WITHDRAWAL_RATE,
};

/** 시뮬레이션 상한 (100년) */
export const MAX_MONTHS = 1200;

/** 단계별 필요 자산 ÷ 목표 자산. 모든 단계가 같은 방식(고정 비율)으로 판정된다 */
export const STAGE_THRESHOLDS = { coast: 0.1, semi: 0.3, barista: 0.6, lean: 0.7, full: 1.0, fat: 1.5 } as const;

export const STAGE_INDICES: readonly StageIndex[] = [0, 1, 2, 3, 4, 5, 6];

export interface StageMeta {
  fire: string;       // 불 이름
  fireStage: string;  // FIRE 단계명
  summary: string;    // 한 줄 설명 (히어로·축하 화면)
  criteria: string;   // 판정 기준
  meaning: string;    // 현 단계의 자세한 의미 (i 팝오버)
}

export const STAGES: Record<StageIndex, StageMeta> = {
  0: { fire: "성냥", fireStage: "FIRE 준비기", summary: "아직 FIRE 준비 단계예요. 자산을 모으며 불씨를 만들어요.", criteria: "시작 단계", meaning: "아직 어떤 FIRE 조건도 채우지 못한 출발 단계예요. 지금은 자산을 모으는 시기이고, 다음 목표는 목표 자산의 10%를 모아 첫 불씨를 붙이는 거예요." },
  1: { fire: "불씨", fireStage: "Coast FIRE", summary: "자산 수익으로 생활비의 10%를 감당해요.", criteria: "목표 자산의 10% 이상 (생활비 충당률 10%)", meaning: "모아 둔 자산에서 매년 4%를 꺼내 쓰면 은퇴 후 월 생활비의 10%를 충당할 수 있는 단계예요. 아직 일해서 벌어야 하는 돈이 대부분이지만, 자산이 스스로 수익을 내기 시작한 첫 불씨예요." },
  2: { fire: "촛불", fireStage: "Semi FIRE", summary: "자산 수익으로 생활비의 30%를 감당해요.", criteria: "목표 자산의 30% 이상 (생활비 충당률 30%)", meaning: "모아 둔 자산에서 매년 4%를 꺼내 쓰면 은퇴 후 월 생활비의 30%를 충당할 수 있는 단계예요. 나머지 70%만 일해서 벌면 되므로 근무 시간을 줄일 여지가 생겨요." },
  3: { fire: "모닥불", fireStage: "Barista FIRE", summary: "자산 수익으로 생활비의 60%를 감당해요.", criteria: "목표 자산의 60% 이상 (생활비 충당률 60%)", meaning: "자산에서 매년 4%를 꺼내 쓰면 생활비의 60%를 충당할 수 있는 단계예요. 나머지 40%는 파트타임처럼 가벼운 일로 벌어도 생활이 유지돼요." },
  4: { fire: "벽난로", fireStage: "Lean FIRE", summary: "자산 수익으로 생활비의 70%를 감당해요.", criteria: "목표 자산의 70% 이상 (생활비 충당률 70%)", meaning: "자산에서 매년 4%를 꺼내 쓰면 생활비의 70%를 충당할 수 있는 단계예요. 생활비를 지금 계획의 70% 수준으로 줄이면 일하지 않고도 생활할 수 있어요." },
  5: { fire: "용광로", fireStage: "Full FIRE", summary: "자산 수익만으로 생활비를 100% 감당해요.", criteria: "목표 자산의 100% 이상", meaning: "목표 자산에 도달한 단계예요. 자산에서 매년 4%를 꺼내 쓰면 계획한 월 생활비를 전부 충당할 수 있어서, 일하지 않아도 생활할 수 있어요." },
  6: { fire: "불꽃놀이", fireStage: "Fat FIRE", summary: "자산 수익으로 생활비의 150%까지 감당해요.", criteria: "목표 자산의 150% 이상", meaning: "목표 자산의 1.5배에 도달한 단계예요. 자산에서 매년 4%를 꺼내 쓰면 계획한 생활비의 1.5배까지 쓸 수 있어서, 여유롭게 생활하면서도 자산이 유지돼요." },
};

/** 단계별 불 색 (외곽 o / 중간 m / 심 c) */
export const BF_COL: Record<StageIndex, { o: string; m: string; c: string }> = {
  0: { o: "#7C2D12", m: "#9A3412", c: "#C2410C" },
  1: { o: "#991B1B", m: "#DC2626", c: "#F97316" },
  2: { o: "#EA580C", m: "#F97316", c: "#FDE68A" },
  3: { o: "#EA580C", m: "#FB923C", c: "#FEF08A" },
  4: { o: "#F97316", m: "#FBBF24", c: "#FEF9C3" },
  5: { o: "#F59E0B", m: "#FDE047", c: "#E0F2FE" },
  6: { o: "#F59E0B", m: "#FDE047", c: "#BFDBFE" },
};

export const DISCLAIMER = "본 계산 결과는 사용자가 입력한 예상 수익률과 지출 등을 기반으로 한 단순 시뮬레이션이며 실제 투자수익이나 은퇴 가능 시점을 보장하지 않습니다. 투자 및 재무 의사결정은 개인의 상황을 고려해 판단해야 합니다.";
