import { useEffect, useState, type CSSProperties } from "react";
import { navigate, ROUTES } from "../routes";
import { ageAfter } from "../shared/calc/fire";
import { STAGES } from "../shared/constants";
import { age, duration } from "../shared/format";
import BuildingFire from "./BuildingFire";
import { useFlameState } from "./useFlameState";
import "./fire.css";

const COLORS = ["#FDE047", "#F472B6", "#60A5FA", "#A3E635", "#FB923C"];

function Fireworks() {
  return <div className="su-fireworks" aria-hidden="true">
    {[[20, 25], [75, 18], [50, 40], [30, 55], [80, 50]].map(([cx, cy], b) => Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2, r = 70 + (i % 2) * 20, c = COLORS[(i + b) % COLORS.length];
      return <span key={`${b}-${i}`} style={{ left: `${cx}%`, top: `${cy}%`, background: c, boxShadow: `0 0 8px ${c}`, animationDelay: `${b * 0.25}s`, "--dx": `${Math.cos(a) * r}px`, "--dy": `${Math.sin(a) * r}px` } as CSSProperties} />;
    }))}
  </div>;
}

export default function StageUpScreen() {
  const { ready, input, stages, setLastSeenStage, state } = useFlameState();
  const [fireworks, setFireworks] = useState(true);
  const stage = stages?.stage;

  useEffect(() => { if (ready && !input) navigate(ROUTES.input, { replace: true }); }, [ready, input]);
  // 진입 시 축하 본 단계로 기록 (중복 축하 방지)
  useEffect(() => { if (stage !== undefined && stage !== state.lastSeenStage) setLastSeenStage(stage); }, [stage, state.lastSeenStage, setLastSeenStage]);
  useEffect(() => { const t = setTimeout(() => setFireworks(false), 2000); return () => clearTimeout(t); }, []);

  if (!input || !stages) return null;
  const meta = STAGES[stages.stage];
  const next = stages.nextStage;
  const nextMonths = next !== null ? stages.reachMonths[next] : null;
  const nextAge = nextMonths !== null ? ageAfter(input.age, nextMonths) : null;

  return <main className="fl-screen su-screen">
    {stages.stage === 6 && fireworks && <Fireworks />}
    <div className="su-body">
      <div className="su-art"><BuildingFire stage={stages.stage} size={240} /></div>
      <h1>{meta.fire} 점화! {meta.fireStage} 달성</h1>
      <p className="fl-summary">{meta.summary}</p>
      <div className="su-next">
        {next !== null
          ? <>다음은 <b>{STAGES[next].fire}</b> · {nextMonths === null ? "100년 이후" : `${duration(nextMonths)} · 예상 ${age(nextAge!.years, nextAge!.months)}`}</>
          : "모든 불꽃을 피웠어요. 넉넉한 자유를 누려요"}
      </div>
    </div>
    <button className="fl-btn" onClick={() => navigate(ROUTES.flame, { replace: true })}>파이어 단계에서 확인하기</button>
  </main>;
}
