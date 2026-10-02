import { useState } from "react";

/** 현재 나이를 직접 고치는 바텀 시트 */
export default function AgeSheet({ current, onSave, onClose }: { current: number; onSave: (age: number) => Promise<void>; onClose: () => void }) {
  const [raw, setRaw] = useState(String(current));
  const [error, setError] = useState("");

  const save = async () => {
    const v = Number(raw);
    if (raw === "" || !Number.isInteger(v) || v < 18 || v > 80) { setError("나이는 18~80세 사이로 입력해 주세요"); return; }
    await onSave(v);
    onClose();
  };

  return <div className="fl-sheet-backdrop" onClick={onClose}>
    <div className="fl-sheet" role="dialog" aria-modal="true" aria-labelledby="age-edit" onClick={(e) => e.stopPropagation()}>
      <h2 id="age-edit">현재 나이 수정</h2>
      <p>지금 만 나이로 맞춰 주세요. 이 나이를 기준으로 앞으로의 나이가 계산돼요.</p>
      <div className={`fl-box ${error ? "error" : ""}`}>
        <input inputMode="numeric" autoFocus aria-label="현재 나이" value={raw} onChange={(e) => { setRaw(e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "")); setError(""); }} />
        <span>세</span>
      </div>
      {error && <p className="fl-error">{error}</p>}
      <div className="fl-sheet-actions">
        <button className="fl-btn ghost" onClick={onClose}>취소</button>
        <button className="fl-btn" onClick={save}>저장</button>
      </div>
    </div>
  </div>;
}
