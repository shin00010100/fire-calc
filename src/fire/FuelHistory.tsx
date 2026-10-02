import { useState } from "react";
import { manwon } from "../shared/format";
import type { FuelLog } from "../shared/types";

/** ISO → "10월 15일" */
const dayLabel = (iso: string) => { const d = new Date(iso); return `${d.getMonth() + 1}월 ${d.getDate()}일`; };

interface MonthGroup { ym: string; month: number; total: number; logs: FuelLog[] }

/** 최신 달이 먼저, 각 달 안에서는 최신 기록이 먼저 오도록 묶는다 */
function groupByMonth(logs: FuelLog[]): MonthGroup[] {
  const map = new Map<string, FuelLog[]>();
  for (const l of logs) map.set(l.ym, [...(map.get(l.ym) ?? []), l]);
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([ym, group]) => ({
      ym,
      month: Number(ym.slice(5, 7)),
      total: group.reduce((sum, l) => sum + l.amount, 0),
      logs: [...group].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
    }));
}

/** 과거 저축 상세 내역. 접었다 펼 수 있는 월별 목록 */
export default function FuelHistory({ logs }: { logs: FuelLog[] }) {
  const [open, setOpen] = useState(false);
  const groups = groupByMonth(logs);

  return <section className="fl-card fl-history">
    <button className="fl-history-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="fuel-history-list">
      <span>과거 저축 상세 내역</span>
      <span className={`fl-chevron ${open ? "up" : ""}`} aria-hidden="true">⌄</span>
    </button>
    {open && (groups.length === 0
      ? <p className="fl-note">아직 저축 기록이 없어요</p>
      : <ul className="fl-history-list" id="fuel-history-list">
          {groups.map((g) => <li key={g.ym}>
            <div className="fl-history-month"><span>{g.month}월</span><strong>{manwon(g.total)}</strong></div>
            <ul className="fl-history-entries">
              {g.logs.map((l, i) => <li key={`${l.recordedAt}-${i}`}><span>{dayLabel(l.recordedAt)}</span><span>{manwon(l.amount)}</span></li>)}
            </ul>
          </li>)}
        </ul>)}
  </section>;
}
