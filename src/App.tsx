import { ThemeProvider } from "@toss/tds-mobile";
import { useEffect, type ReactNode } from "react";
import InputScreen from "./calculator/InputScreen";
import MainScreen from "./calculator/MainScreen";
import ResultScreen from "./calculator/ResultScreen";
import DevFlames from "./fire/DevFlames";
import FuelScreen from "./fire/FuelScreen";
import StageLadderScreen from "./fire/StageLadderScreen";
import StageUpScreen from "./fire/StageUpScreen";
import { navigate, ROUTES, useLocation } from "./routes";
import { FlameStateProvider, useFlameStore } from "./shared/FlameStateContext";

const FLAME_TABS: string[] = [ROUTES.flame, ROUTES.fuel, ROUTES.stageUp];

function TabBar({ path }: { path: string }) {
  const { state } = useFlameStore();
  return <nav className="tab-bar" aria-label="하단 탭">
    <button className={path !== ROUTES.result ? "active" : ""} aria-current={path === ROUTES.flame ? "page" : undefined} onClick={() => navigate(ROUTES.flame)}><span aria-hidden="true">🔥</span>불꽃</button>
    <button onClick={() => navigate(state.input ? ROUTES.result : ROUTES.input)}><span aria-hidden="true">🧮</span>계산기</button>
  </nav>;
}

function Router() {
  const { path } = useLocation();
  const { ready, persistFailed } = useFlameStore();
  useEffect(() => { document.documentElement.dataset.theme = FLAME_TABS.includes(path) ? "flame" : "calc"; }, [path]);
  if (!ready) return null;

  let screen: ReactNode;
  switch (path) {
    case ROUTES.input: screen = <InputScreen />; break;
    case ROUTES.result: screen = <ResultScreen />; break;
    case ROUTES.flame: screen = <StageLadderScreen />; break;
    case ROUTES.fuel: screen = <FuelScreen />; break;
    case ROUTES.stageUp: screen = <StageUpScreen />; break;
    case ROUTES.devFlames: screen = import.meta.env.DEV ? <DevFlames /> : <MainScreen />; break;
    default: screen = <MainScreen />;
  }

  return <>
    {persistFailed && <div className="toast" role="status">기기에 저장하지 못했어요. 앱을 닫으면 기록이 사라질 수 있어요.</div>}
    {screen}
    {FLAME_TABS.includes(path) && <TabBar path={path} />}
  </>;
}

export default function App() {
  return <ThemeProvider>
    <FlameStateProvider>
      <Router />
    </FlameStateProvider>
  </ThemeProvider>;
}
