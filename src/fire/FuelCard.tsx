import { navigate, ROUTES } from "../routes";
import { manwon } from "../shared/format";
import Mascot from "../shared/Mascot";
import { useCountUp } from "../shared/useCountUp";

/** {month}월에 저축한 금액. 월이 바뀌면 0부터 다시 시작하고, 저축은 한 달에 여러 번 기록할 수 있어요 */
export default function FuelCard({ month, total, count }: { month: number; total: number; count: number }) {
  const shown = useCountUp(total);
  return <section className="fl-card fl-fuel-card">
    <div className="fl-fuel-pai"><Mascot size={56} mood={count > 0 ? "happy" : "sleepy"} /></div>
    <span className="fl-label"><span className="emo" aria-hidden="true">💰</span>{month}월에 저축한 금액</span>
    <strong className="fl-big">{manwon(shown)}</strong>
    <p className="fl-big-sub">{count > 0 ? `${month}월 ${count}번 저축했어요` : `${month}월에 저축한 내역이 아직 없어요. 파이가 졸려해요`}</p>
    <button className="fl-btn" onClick={() => navigate(ROUTES.fuel)}>저축하기</button>
  </section>;
}
