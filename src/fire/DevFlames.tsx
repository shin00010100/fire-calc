import { STAGE_INDICES, STAGES } from "../shared/constants";
import BuildingFire from "./BuildingFire";
import "./fire.css";

/** 개발 전용: stage 0~6을 와이어프레임 보드와 비교 */
export default function DevFlames() {
  return <main className="fl-dev">
    <h1>단계가 오를수록 회사가 불탄다</h1>
    <div className="fl-dev-row">
      {STAGE_INDICES.map((s) => <figure key={s}>
        <BuildingFire stage={s} size={150} />
        <figcaption><span>{s}단계</span><strong>{STAGES[s].fire}</strong><small>{STAGES[s].fireStage}</small><em>{STAGES[s].scene}</em></figcaption>
      </figure>)}
    </div>
  </main>;
}
