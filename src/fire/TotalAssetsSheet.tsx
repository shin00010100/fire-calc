import { useState } from "react";
import { comma, manwon } from "../shared/format";

/** 총 저축 금액을 직접 고치는 바텀 시트 (만원 단위) */
export default function TotalAssetsSheet({ current, onSave, onClose }: { current: number; onSave: (total: number) => Promise<void>; onClose: () => void }) {
  const [raw, setRaw] = useState(String(Math.round(current / 10_000)));
  const [error, setError] = useState("");

  const save = async () => {
    const man = Number(raw);
    if (raw === "" || !(man >= 0 && man <= 10_000_000)) { setError("0원 이상 1,000억 원 이하로 입력해 주세요"); return; }
    await onSave(man * 10_000);
    onClose();
  };

  return <div className="fl-sheet-backdrop" onClick={onClose}>
    <div className="fl-sheet" role="dialog" aria-modal="true" aria-labelledby="assets-edit" onClick={(e) => e.stopPropagation()}>
      <h2 id="assets-edit">총 저축 금액 수정</h2>
      <p>지금 모아 둔 투자 자산의 총액으로 맞춰 주세요. 저축 기록은 그대로 두고 총액만 바뀌어요.</p>
      <div className={`fl-box ${error ? "error" : ""}`}>
        <input inputMode="numeric" autoFocus aria-label="총 저축 금액" value={raw === "" ? "" : comma(Number(raw))} onChange={(e) => { setRaw(e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "")); setError(""); }} />
        <span>만원</span>
      </div>
      <p className={error ? "fl-error" : "fl-note"}>{error || (raw ? manwon(Number(raw) * 10_000) : "")}</p>
      <div className="fl-sheet-actions">
        <button className="fl-btn ghost" onClick={onClose}>취소</button>
        <button className="fl-btn" onClick={save}>저장</button>
      </div>
    </div>
  </div>;
}
