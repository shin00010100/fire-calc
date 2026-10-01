import { useLayoutEffect, useRef, useState } from "react";
import { STAGES } from "../shared/constants";
import type { StageIndex } from "../shared/types";

/** i 버튼 아래(넘치면 위)에 뜨는 비모달 설명 카드 */
export default function StagePopover({ id, stage }: { id: string; stage: StageIndex }) {
  const ref = useRef<HTMLDivElement>(null);
  const [above, setAbove] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // 하단 탭(72px) 위로 넘치면 뒤집기
    setAbove(rect.bottom > window.innerHeight - 80 && rect.top - rect.height - 60 > 0);
  }, []);
  const m = STAGES[stage];
  return <div ref={ref} id={id} className={`fl-popover ${above ? "above" : ""}`} role="region" aria-label={`${m.fire} 단계 설명`}>
    <strong>{m.fire} · {m.fireStage}</strong>
    <p>{m.desc}</p>
    <dl>
      <div><dt>판정 기준</dt><dd>{m.criteria}</dd></div>
      <div><dt>일의 의미</dt><dd>{m.work}</dd></div>
    </dl>
  </div>;
}
