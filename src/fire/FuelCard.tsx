import { navigate, ROUTES } from "../routes";
import { manwon } from "../shared/format";

/** 이번 달에 넣은 장작 누적. 장작은 한 달에 여러 번 넣을 수 있어요 */
export default function FuelCard({ total, count }: { total: number; count: number }) {
  return <section className="fl-card fl-fuel-card">
    <span className="fl-label">이번 달 장작 누적 금액</span>
    <strong className="fl-big">{manwon(total)}</strong>
    <p className="fl-big-sub">{count > 0 ? `이번 달 ${count}번 넣었어요` : "이번 달에 넣은 장작이 아직 없어요"}</p>
    <button className="fl-btn" onClick={() => navigate(ROUTES.fuel)}>장작 넣기</button>
  </section>;
}
