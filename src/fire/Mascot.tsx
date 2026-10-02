import "./fire.css";

export type MascotMood = "happy" | "cheer" | "sleepy";

/** 불꽃 마스코트 '파이'. mood로 표정과 움직임이 달라지고, animate=false면 가만히 있는다. */
export default function Mascot({ size = 120, mood = "happy", animate = true }: { size?: number; mood?: MascotMood; animate?: boolean }) {
  const eyeY = 98;
  return <svg className={`mascot ${mood}${animate ? " animate" : ""}`} viewBox="0 0 120 140" width={size} height={size * (140 / 120)} role="img" aria-label="불꽃 마스코트 파이">
    <ellipse className="mascot-shadow" cx="60" cy="136" rx="30" ry="4" fill="#1c1917" opacity=".12" />
    <g className="mascot-body">
      <path className="mascot-outer" fill="#d4521a" d="M62 6C66 26 74 34 86 48C98 62 104 78 104 94C104 120 86 134 60 134C34 134 16 120 16 94C16 76 24 62 36 50C38 58 42 62 46 62C46 44 52 22 62 6Z" />
      <path fill="#f28c45" d="M60 56C80 70 92 84 92 100C92 118 78 126 60 126C42 126 28 118 28 100C28 84 40 70 60 56Z" />
      <path d="M44 84C48 76 54 70 60 66" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity=".3" />
      <g className="mascot-face">
        {mood === "sleepy"
          ? <>
            <path d={`M41 ${eyeY}Q46 ${eyeY + 5} 51 ${eyeY}`} fill="none" stroke="#3b1d0e" strokeWidth="3" strokeLinecap="round" />
            <path d={`M69 ${eyeY}Q74 ${eyeY + 5} 79 ${eyeY}`} fill="none" stroke="#3b1d0e" strokeWidth="3" strokeLinecap="round" />
          </>
          : <g className="mascot-eyes">
            <circle cx="46" cy={eyeY} r="4.8" fill="#3b1d0e" />
            <circle cx="74" cy={eyeY} r="4.8" fill="#3b1d0e" />
            <circle cx="47.6" cy={eyeY - 1.8} r="1.4" fill="#fff" />
            <circle cx="75.6" cy={eyeY - 1.8} r="1.4" fill="#fff" />
          </g>}
        <ellipse cx="35" cy="108" rx="7" ry="4.5" fill="#ff6b81" opacity=".6" />
        <ellipse cx="85" cy="108" rx="7" ry="4.5" fill="#ff6b81" opacity=".6" />
        {mood === "cheer"
          ? <path d="M52 105Q60 120 68 105Z" fill="#7c2d12" stroke="#7c2d12" strokeWidth="2" strokeLinejoin="round" />
          : <path d="M53 106Q60 113 67 106" fill="none" stroke="#3b1d0e" strokeWidth="3" strokeLinecap="round" />}
      </g>
    </g>
  </svg>;
}
