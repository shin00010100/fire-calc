const nf = new Intl.NumberFormat("ko-KR");

/** 천 단위 콤마 (입력 필드용) */
export const comma = (n: number) => nf.format(n);

/** 9,589원 */
export const won = (n: number) => `${nf.format(Math.round(n))}원`;

/** 1억 5,742만 원 / 5,000만 원 / 150만 원 (만 원 미만 버림) */
export function manwon(n: number): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const eokPart = Math.floor(abs / 100_000_000);
  const manPart = Math.floor((abs % 100_000_000) / 10_000);
  if (!eokPart && !manPart) return "0원";
  const parts = [eokPart ? `${nf.format(eokPart)}억` : "", manPart ? `${nf.format(manPart)}만` : ""].filter(Boolean);
  return `${sign}${parts.join(" ")} 원`;
}

/** 9억 원 (억 단위 정수일 때), 아니면 manwon */
export const eok = (n: number) => (n > 0 && n % 100_000_000 === 0 ? `${nf.format(n / 100_000_000)}억 원` : manwon(n));

/** 만 49세 4개월 / 만 49세 */
export const age = (years: number, months: number) => (months ? `만 ${years}세 ${months}개월` : `만 ${years}세`);

/** 19년 4개월 / 7개월 / 3년 */
export function duration(m: number): string {
  const y = Math.floor(m / 12), r = m % 12;
  if (!y && !r) return "0개월";
  return [y ? `${y}년` : "", r ? `${r}개월` : ""].filter(Boolean).join(" ");
}

/** 42% (기본 floor) / 5.6% (digits=1, 반올림) */
export const percent = (p: number, digits = 0) => (digits ? `${(p * 100).toFixed(digits)}%` : `${Math.floor(p * 100 + 1e-9)}%`);

/** 2046년 2월 */
export const ym = (date: Date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`;

/** 저장용 'YYYY-MM' */
export const ymKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

/** 2.3시간 / 1일 3시간 */
export function hours(h: number): string {
  if (h >= 24) return `${Math.floor(h / 24)}일 ${Math.floor(h % 24)}시간`;
  return `${(Math.round(h * 10) / 10).toFixed(1)}시간`;
}
