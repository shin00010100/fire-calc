import { useState } from "react";
import { navigate, ROUTES } from "../routes";
import type { Heat } from "../shared/calc/heat";
import { hours, won } from "../shared/format";

export default function HeatCard({ heat, fuelledThisMonth }: { heat: Heat; fuelledThisMonth: boolean }) {
  const [nextMonth] = useState(() => { const now = new Date(); return now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2; });
  return <section className="fl-card fl-heat">
    <span className="fl-label">오늘 불꽃이 낸 열</span>
    {heat.calm ? <strong className="fl-heat-value">오늘은 바람이 잔잔해요 <small>0원</small></strong> : <>
      <strong className="fl-heat-value">{won(heat.won)}</strong>
      <p className="fl-heat-sub">생활비 <b>{hours(heat.hours)}</b>어치의 자유</p>
    </>}
    <button className="fl-btn" disabled={fuelledThisMonth} onClick={() => navigate(ROUTES.fuel)}>{fuelledThisMonth ? "이번 달 장작 완료 ✓" : "이번 달 장작 넣기"}</button>
    {fuelledThisMonth && <p className="fl-note">다음 장작은 {nextMonth}월 1일부터 넣을 수 있어요</p>}
  </section>;
}
