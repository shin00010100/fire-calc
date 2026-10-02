import { STAGE_INDICES, STAGES } from "../shared/constants";
import BuildingFire from "./BuildingFire";
import Mascot from "../shared/Mascot";
import "./fire.css";

/** 개발 전용: stage 0~6을 와이어프레임 보드와 비교 */
export default function DevFlames() {
  return <main className="fl-dev">
    <h1>단계가 오를수록 회사가 불탄다</h1>
    <div className="fl-dev-row">
      {STAGE_INDICES.map((s) => <figure key={s}>
        <BuildingFire stage={s} size={150} />
        <figcaption><span>{s}단계</span><strong>{STAGES[s].fire}</strong><small>{STAGES[s].fireStage}</small><em>{STAGES[s].summary}</em></figcaption>
      </figure>)}
    </div>
    <h1>마스코트 파이</h1>
    <div className="fl-dev-row">
      {(["happy", "cheer", "sleepy"] as const).map((m) => <figure key={m}><Mascot size={150} mood={m} /><figcaption><strong>{m}</strong></figcaption></figure>)}
    </div>
  </main>;
}
