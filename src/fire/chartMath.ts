const STEPS = [5e7, 1e8, 2e8, 5e8, 1e9, 2e9, 5e9, 1e10, 2e10, 5e10, 1e11];

/** y축 눈금: 눈금이 5개 이하가 되는 가장 작은 간격 */
export function amountTicks(yMax: number): number[] {
  const step = STEPS.find((s) => yMax / s <= 5) ?? STEPS[STEPS.length - 1];
  const out: number[] = [];
  for (let v = 0; v <= yMax; v += step) out.push(v);
  return out;
}

/** 0 / 5,000만 / 1억 / 1.5억 */
export function amountLabel(v: number): string {
  if (v === 0) return "0";
  if (v >= 1e8) return `${Number((v / 1e8).toFixed(1))}억`;
  return `${new Intl.NumberFormat("ko-KR").format(Math.round(v / 1e4))}만`;
}

/** x축 눈금(나이) 간격: 기간이 길수록 성기게 */
export const ageTickStep = (spanYears: number) => (spanYears <= 10 ? 2 : spanYears <= 30 ? 5 : 10);

/**
 * 오른쪽 라벨이 서로 겹치지 않게 세로 위치를 벌린다.
 * 위에서부터 gap 이상 떨어지도록 밀고, 아래가 넘치면 다시 위로 당긴다. 입력 순서를 유지해 돌려준다.
 */
export function spreadLabels(ys: number[], gap: number, lo: number, hi: number): number[] {
  const order = ys.map((_, i) => i).sort((p, q) => ys[p] - ys[q]);
  const out = [...ys];
  let prev = lo - gap;
  for (const i of order) { out[i] = Math.max(out[i], prev + gap); prev = out[i]; }
  let next = hi + gap;
  for (const i of [...order].reverse()) { out[i] = Math.min(out[i], next - gap); next = out[i]; }
  return out;
}
