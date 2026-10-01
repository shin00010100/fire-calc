import type { FireInput, StageIndex } from "./types";

export const DEFAULT_INPUT: FireInput = {
  age: 30,
  assets: 50_000_000,
  monthlyInvest: 1_500_000,
  annualReturn: 0.07,
  monthlyExpense: 3_000_000,
  withdrawalRate: 0.04,
};

/** 시뮬레이션 상한 (100년) */
export const MAX_MONTHS = 1200;

export const STAGE_THRESHOLDS = { coastAge: 60, semi: 0.3, barista: 0.6, lean: 0.7, full: 1.0, fat: 1.5 } as const;

export const STAGE_INDICES: readonly StageIndex[] = [0, 1, 2, 3, 4, 5, 6];

export interface StageMeta {
  fire: string;       // 불 이름
  fireStage: string;  // FIRE 단계명
  scene: string;      // 장면 문구
  desc: string;       // i 팝오버 설명
  criteria: string;   // 판정 기준
  work: string;       // 일의 의미
}

export const STAGES: Record<StageIndex, StageMeta> = {
  0: { fire: "성냥", fireStage: "FIRE 준비기", scene: "불 켜진 회사, 손엔 성냥 한 개비", desc: "이제 막 불을 붙일 준비를 하는 단계예요. 매달 장작을 넣으면 불씨가 붙어요.", criteria: "시작", work: "일은 생계를 위한 필수" },
  1: { fire: "불씨", fireStage: "Coast FIRE", scene: "회사 정문에 불씨가 붙었어요", desc: "더 투자하지 않아도 60세에는 목표 자산에 도달하는 단계예요. 이제부터 버는 돈은 생활비만 충당하면 돼요.", criteria: "지금 자산이 60세에 목표에 닿아요", work: "생활비만 벌면 되는 일" },
  2: { fire: "촛불", fireStage: "Semi FIRE", scene: "1층 창문에 불이 번져요", desc: "자산 수익으로 생활비의 30%를 낼 수 있어요.", criteria: "충당률 30% 이상", work: "일을 줄일 수 있는 여유" },
  3: { fire: "모닥불", fireStage: "Barista FIRE", scene: "아래층이 타고 연기가 올라요", desc: "자산 수익으로 생활비의 60%를 낼 수 있어요. 파트타임으로도 생활할 수 있어요.", criteria: "충당률 60% 이상", work: "좋아하는 일을 가볍게" },
  4: { fire: "벽난로", fireStage: "Lean FIRE", scene: "건물 절반이 불길에 휩싸여요", desc: "목표 자산의 70%. 생활비를 조금 아끼면 일하지 않고 지낼 수 있어요.", criteria: "목표 자산의 70%", work: "아껴 쓰면 일은 선택" },
  5: { fire: "용광로", fireStage: "Full FIRE", scene: "회사 전체가 활활, 이제 출근은 선택", desc: "자산 수익만으로 원하는 생활비를 낼 수 있어요.", criteria: "목표 자산 100%", work: "출근은 완전히 선택" },
  6: { fire: "불꽃놀이", fireStage: "Fat FIRE", scene: "불타는 회사 위로 폭죽이 터져요", desc: "목표의 1.5배. 넉넉하게 쓰고도 자산이 유지돼요.", criteria: "목표 자산의 150%", work: "넉넉한 자유" },
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
