import { navigate, ROUTES } from "../routes";
import { useFlameStore } from "../shared/FlameStateContext";
import "./calculator.css";

export default function MainScreen() {
  const { state } = useFlameStore();
  return <main className="calc-screen calc-main">
    <div className="calc-main-hero">
      <div className="calc-logo" aria-hidden="true">🔥</div>
      <h1>자유의 불꽃</h1>
      <p>내 FIRE 나이를 계산하고 불꽃을 키워요</p>
    </div>
    <div className="calc-actions">
      <button className="calc-primary" onClick={() => navigate(ROUTES.input)}>내 FIRE 나이 계산하기</button>
      {state.input && <>
        <button className="calc-secondary" onClick={() => navigate(ROUTES.result)}>지난 결과 보기</button>
        <button className="calc-secondary" onClick={() => navigate(ROUTES.flame)}>불꽃 보러 가기</button>
      </>}
    </div>
  </main>;
}
