import type { CSSProperties } from "react";
import type { StageIndex } from "../shared/types";
import FlameShape from "./FlameShape";

/** 진행률 바 끝에서 바를 따라다니는 작은 불꽃. pct/from은 0~1, from이 있으면 거기서부터 따라 올라간다 */
export default function BarFlame({ stage, pct, from }: { stage: StageIndex; pct: number; from?: number }) {
  const style = { left: `${Math.min(1, Math.max(0, pct)) * 100}%`, ...(from !== undefined && { "--from": `${Math.min(1, Math.max(0, from)) * 100}%` }) } as CSSProperties;
  return <svg className={`fl-bar-flame${from !== undefined ? " move" : ""}`} style={style} viewBox="0 0 24 28" aria-hidden="true"><FlameShape stage={stage} /></svg>;
}
