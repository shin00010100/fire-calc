import { ThemeProvider } from "@toss/tds-mobile";
import { useEffect, type ReactNode } from "react";
import InputScreen from "./calculator/InputScreen";
import MainScreen from "./calculator/MainScreen";
import ResultScreen from "./calculator/ResultScreen";
import DevFlames from "./fire/DevFlames";
import ExperimentScreen from "./fire/ExperimentScreen";
import FuelScreen from "./fire/FuelScreen";
import StageLadderScreen from "./fire/StageLadderScreen";
import StageUpScreen from "./fire/StageUpScreen";
import { bindTossBack, navigate, ROUTES, useLocation } from "./routes";
import { FlameStateProvider, useFlameStore } from "./shared/FlameStateContext";

const FLAME_TABS: string[] = [ROUTES.flame, ROUTES.fuel, ROUTES.stageUp, ROUTES.experiment];

function TabBar({ path }: { path: string }) {
  const { state } = useFlameStore();
  const onFlame = FLAME_TABS.includes(path);
  // 계산기를 한 번도 쓰지 않아 저장된 입력이 없으면 불꽃 화면으로 갈 수 없다
  const noData = !state.input;
  return <nav className="tab-bar" aria-label="하단 탭">
    <button className={onFlame ? "active" : ""} aria-current={path === ROUTES.flame ? "page" : undefined} disabled={noData} aria-disabled={noData} title={noData ? "계산기로 먼저 FIRE 나이를 계산해 주세요" : undefined} onClick={() => navigate(ROUTES.flame)}><span aria-hidden="true">🔥</span>불꽃</button>
    <button className={onFlame ? "" : "active"} aria-current={path === ROUTES.result || path === ROUTES.input ? "page" : undefined} onClick={() => navigate(state.input ? ROUTES.result : ROUTES.input)}><span aria-hidden="true">🧮</span>계산기</button>
  </nav>;
}

function Router() {
  const { path } = useLocation();
  const { ready, persistFailed } = useFlameStore();
  useEffect(() => { document.documentElement.dataset.theme = "flame"; }, []);
  if (!ready) return null;

  let screen: ReactNode;
  switch (path) {
    case ROUTES.input: screen = <InputScreen />; break;
    case ROUTES.result: screen = <ResultScreen />; break;
    case ROUTES.flame: screen = <StageLadderScreen />; break;
    case ROUTES.fuel: screen = <FuelScreen />; break;
    case ROUTES.experiment: screen = <ExperimentScreen />; break;
    case ROUTES.stageUp: screen = <StageUpScreen />; break;
    case ROUTES.devFlames: screen = import.meta.env.DEV ? <DevFlames /> : <MainScreen />; break;
    default: screen = <MainScreen />;
  }

  return <>
    {persistFailed && <div className="toast" role="status">기기에 저장하지 못했어요. 앱을 닫으면 기록이 사라질 수 있어요.</div>}
    {screen}
    {path !== ROUTES.devFlames && <TabBar path={path} />}
  </>;
}

export default function App() {
  useEffect(() => bindTossBack(), []);
  return <ThemeProvider>
    <FlameStateProvider>
      <Router />
    </FlameStateProvider>
  </ThemeProvider>;
}
