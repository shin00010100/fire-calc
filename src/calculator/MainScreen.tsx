import { navigate, ROUTES } from "../routes";
import { useFlameStore } from "../shared/FlameStateContext";
import "./calculator.css";

export default function MainScreen() {
  const { state } = useFlameStore();
  return <main className="calc-screen calc-main">
    <div className="calc-hero">
      <div className="calc-logo" aria-hidden="true">🔥</div>
      <h1>자유의 불꽃</h1>
      <p className="calc-tagline">내 FIRE 나이를 계산하고 불꽃을 키워요</p>
      <p className="calc-purpose">경제적 자유(FIRE)에 필요한 목표 자산과 도달 나이를 계산하고, 장작을 넣듯 꾸준히 투자하며 단계별 진행 상황을 확인하는 서비스예요.</p>
    </div>
    <div className="calc-actions">
      {/* 처음이면 조건 입력, 이미 입력했다면 불꽃 화면으로 */}
      <button className="calc-primary" onClick={() => navigate(state.input ? ROUTES.flame : ROUTES.input)}>시작하기</button>
    </div>
  </main>;
}
