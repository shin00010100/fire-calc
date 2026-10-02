import { BF_COL } from "../shared/constants";
import type { StageIndex } from "../shared/types";

/** 얼굴 달린 불꽃 모양(viewBox 0 0 24 28). HTML <svg>와 차트 <g> 안에서 같이 쓴다. outline이 있으면 윤곽선을 그린다. */
export default function FlameShape({ stage, outline }: { stage: StageIndex; outline?: string }) {
  const col = BF_COL[stage];
  return <>
    <path className="fl-drop-body" fill={col.o} stroke={outline} strokeWidth={outline ? 2.2 : undefined} strokeLinejoin="round" d="M12 2C13 7 21 10 21 17C21 22.5 17 26 12 26C7 26 3 22.5 3 17C3 12 6.5 10.5 8 6.5C9 8 9.5 9 10.5 9.5C11.5 7.5 12 5 12 2Z" />
    <path className="fl-drop-core" fill={col.c} d="M12 13C14.2 15.3 17 17 17 20.5C17 23.3 14.8 25 12 25C9.2 25 7 23.3 7 20.5C7 17 9.8 15.3 12 13Z" />
    <g className="fl-drop-face">
      <circle cx="9.6" cy="19.4" r="1.25" fill="#3b1d0e" />
      <circle cx="14.4" cy="19.4" r="1.25" fill="#3b1d0e" />
      <circle cx="8.3" cy="21.8" r="1.2" fill="#ff7a90" opacity=".55" />
      <circle cx="15.7" cy="21.8" r="1.2" fill="#ff7a90" opacity=".55" />
      <path d="M10.7 21.6Q12 23 13.3 21.6" fill="none" stroke="#3b1d0e" strokeWidth="1" strokeLinecap="round" />
    </g>
  </>;
}
