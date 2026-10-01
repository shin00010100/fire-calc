import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BF_COL, STAGES } from "../shared/constants";
import type { StageIndex } from "../shared/types";
import "./buildingFire.css";

interface BuildingFireProps {
  stage: StageIndex;
  size?: number;        // 가로(px). 세로 = size × 320/220
  animated?: boolean;
  label?: string;
}

const BURN_ROWS = [0, 0, 1, 2, 4, 6, 6];
const GLOW_D = [40, 70, 110, 150, 200, 260, 280];
const GLOW_CY = [12, 12, 40, 55, 80];
const BURSTS: [number, number, number][] = [[34, 250, -0.7], [188, 262, -0.3], [112, 290, -1.0], [60, 300, -0.1], [168, 305, -1.3]];
const SPARK_COLORS = ["#FDE047", "#F472B6", "#60A5FA", "#A3E635", "#FB923C"];

type Vars = CSSProperties & Record<`--${string}`, string>;

/** 물방울 불길. (x, y) = 불길 아래 중심, 220×320 기준 bottom 좌표 */
function Flame({ x, y, size, color, dur }: { x: number; y: number; size: number; color: string; dur: number }) {
  return <span className="bf-flame" style={{ left: x - size / 2, bottom: y, width: size, height: size, background: color, animationDuration: `${dur}s` }} />;
}

function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

export default function BuildingFire({ stage, size = 220, animated = true, label }: BuildingFireProps) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const col = BF_COL[stage];
  const meta = STAGES[stage];
  const burn = BURN_ROWS[stage];
  const scale = size / 220;
  const live = animated && inView;

  const windows = [];
  for (let r = 0; r < 6; r += 1) for (let c = 0; c < 3; c += 1) {
    const burning = r < burn;
    const off = stage >= 4 || (stage >= 2 && (r + c) % 2 === 1);
    const style: CSSProperties = burning
      ? { background: `linear-gradient(180deg, ${col.c}, ${col.o})`, boxShadow: `0 0 8px ${col.m}`, animationDuration: `${0.8 + ((r * 3 + c) % 5) * 0.1}s` }
      : { background: off ? "#292524" : "#FDE68A" };
    windows.push(<span key={`w${r}${c}`} className={`bf-win ${burning ? "burning" : ""}`} style={{ left: 70 + c * 28, bottom: 34 + r * 22, ...style }} />);
  }

  const flames = [];
  if (stage >= 1) flames.push(<Flame key="door" x={110} y={6} size={stage === 1 ? 14 : 20} color={col.m} dur={1} />);
  for (let r = 0; r < Math.min(burn, 4); r += 1) for (let c = 0; c < 3; c += 1) {
    if (stage < 5 && (r + c) % 2 === 1) continue;
    flames.push(<Flame key={`f${r}${c}`} x={79 + c * 28} y={44 + r * 22} size={stage >= 4 ? 22 : 16} color={(r + c) % 2 ? col.o : col.m} dur={0.8 + ((r + c) % 3) * 0.2} />);
  }
  if (stage === 4) flames.push(<Flame key="s1" x={64} y={100} size={34} color={col.o} dur={1.2} />, <Flame key="s2" x={156} y={112} size={30} color={col.m} dur={1} />);
  if (stage >= 5) flames.push(
    <Flame key="r1" x={110} y={150} size={86} color={col.o} dur={1.3} />,
    <Flame key="r2" x={84} y={156} size={54} color={col.m} dur={1.1} />,
    <Flame key="r3" x={138} y={154} size={58} color={col.m} dur={1.2} />,
    <Flame key="r4" x={110} y={152} size={46} color={col.c} dur={0.9} />,
  );

  const glowD = GLOW_D[stage];
  const glowBottom = stage >= 5 ? 40 : GLOW_CY[stage] - glowD / 2;

  return <div ref={ref} className={`bf-root ${live ? "" : "bf-static"}`} style={{ width: size, height: (size * 320) / 220 }} role="img" aria-label={label ?? `${stage}단계 ${meta.fire}: ${meta.scene}`}>
    <div className="bf-stage" style={{ transform: `scale(${scale})` }} aria-hidden="true">
      <span className="bf-glow" style={{ left: 110 - glowD / 2, bottom: glowBottom, width: glowD, height: glowD, background: `radial-gradient(circle, ${col.m} 0%, transparent 65%)` }} />
      {stage >= 3 && [0, 1, 2].map((k) => <span key={`sm${k}`} className="bf-smoke" style={{ left: 90 + k * 18, bottom: stage >= 5 ? 200 : 170, animationDuration: `${2.4 + 0.4 * k}s`, animationDelay: `${0.7 * k}s` }} />)}
      <div className="bf-building" />
      <div className="bf-sign">(주)회사</div>
      {windows}
      <span className="bf-door" />
      {stage === 0 && <>
        <span className="bf-match" />
        <Flame x={18} y={31} size={12} color="#F97316" dur={1} />
      </>}
      {flames}
      {stage >= 2 && stage <= 5 && Array.from({ length: stage }, (_, q) => <span key={`sp${q}`} className="bf-ember" style={{ left: 80 + ((q * 23) % 60), bottom: 60 + q * 18, animationDelay: `${q * 0.3}s`, "--dx": `${q % 2 ? 8 : -8}px`, "--dy": "-50px" } as Vars} />)}
      {stage === 6 && BURSTS.map(([bx, by, delay], b) => Array.from({ length: 12 }, (_, i) => {
        const rad = i % 2 ? 52 : 40, a = (i / 12) * Math.PI * 2, c = SPARK_COLORS[(i + b) % SPARK_COLORS.length];
        return <span key={`b${b}-${i}`} className="bf-spark" style={{ left: bx - 3.5, bottom: by - 3.5, background: c, boxShadow: `0 0 6px ${c}`, animationDelay: `${delay}s`, "--dx": `${(Math.cos(a) * rad).toFixed(1)}px`, "--dy": `${(Math.sin(a) * rad).toFixed(1)}px` } as Vars} />;
      }))}
    </div>
  </div>;
}
