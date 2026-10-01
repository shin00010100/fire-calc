export interface FireInput {
  age: number;              // 만 나이 (입력은 정수, 불꽃 화면에서는 경과 개월을 더한 소수)
  assets: number;           // 현재 투자 가능 자산 (원)
  monthlyInvest: number;    // 매월 투자금 (원)
  annualReturn: number;     // 연수익률 (0.07 = 7%)
  monthlyExpense: number;   // 은퇴 후 월 생활비, 현재 가치 (원)
  withdrawalRate: number;   // 안전 인출률 (0.04 = 4%)
}

export type StageIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
// 0 성냥(준비기) 1 불씨(Coast) 2 촛불(Semi) 3 모닥불(Barista) 4 벽난로(Lean) 5 용광로(Full) 6 불꽃놀이(Fat)

export interface StageResult {
  stage: StageIndex;                 // 현재(0개월 시점) 단계
  reachMonths: Record<StageIndex, number | null>; // 각 단계 최초 도달 개월(0=이미), 미도달 null. 0번은 항상 0
  nextStage: StageIndex | null;      // 6이면 null
  progressToNext: number;            // 0~1
  targetAssets: number;              // T
  coverage: number;                  // 충당률
}

export interface FireResult {
  targetAssets: number;
  monthsToFire: number | null;       // null = 1200개월 내 미도달
  fireAge: { years: number; months: number } | null;
  series: { month: number; assets: number }[]; // 그래프용 (월 단위, 최대 1200)
}

export interface FuelLog {
  ym: string;            // 'YYYY-MM'
  assets: number;        // 그 달 투자자산 총액
  recordedAt: string;    // ISO
}

export interface FlameState {
  version: 1;
  input: FireInput | null;
  logs: FuelLog[];       // ym 오름차순, 같은 ym 1개
  lastSeenStage: StageIndex;   // 축하 화면을 마지막으로 본 단계
  createdAt: string;     // 입력을 마지막으로 저장한 시각. 경과 개월(나이 증가) 기준점
}
