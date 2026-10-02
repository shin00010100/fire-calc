import { navigate, ROUTES } from "../routes";
import { manwon } from "../shared/format";

/** 이번 달 저축 누적. 저축은 한 달에 여러 번 기록할 수 있어요 */
export default function FuelCard({ total, count }: { total: number; count: number }) {
  return <section className="fl-card fl-fuel-card">
    <span className="fl-label"><span className="emo" aria-hidden="true">💰</span>이번 달 저축 누적 금액</span>
    <strong className="fl-big">{manwon(total)}</strong>
    <p className="fl-big-sub">{count > 0 ? `이번 달 ${count}번 저축했어요` : "이번 달에 저축한 내역이 아직 없어요"}</p>
    <button className="fl-btn" onClick={() => navigate(ROUTES.fuel)}>저축하기</button>
  </section>;
}
