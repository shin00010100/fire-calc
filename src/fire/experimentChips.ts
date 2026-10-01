import type { FireInput } from "../shared/types";

export type ChipKey = "wood" | "wind" | "room";
export const CHIPS: Record<ChipKey, { icon: string; title: string; meaning: string; options: { value: number; label: string }[] }> = {
  wood: { icon: "🪵", title: "장작", meaning: "월 투자금", options: [{ value: -500_000, label: "-50만" }, { value: 0, label: "그대로" }, { value: 500_000, label: "+50만" }, { value: 1_000_000, label: "+100만" }] },
  wind: { icon: "🌬", title: "바람", meaning: "연수익률", options: [{ value: -0.01, label: "-1%p" }, { value: 0, label: "그대로" }, { value: 0.01, label: "+1%p" }] },
  room: { icon: "🏠", title: "데울 방 크기", meaning: "월 생활비", options: [{ value: -500_000, label: "-50만" }, { value: 0, label: "그대로" }, { value: 500_000, label: "+50만" }] },
};
export const NONE: Record<ChipKey, number> = { wood: 0, wind: 0, room: 0 };

/** 결과 화면에서 넘어온 ?inv=(B 월 투자금)을 장작 칩으로 변환 */
export function presetFromQuery(query: URLSearchParams, a: FireInput): Record<ChipKey, number> {
  const inv = Number(query.get("inv"));
  if (query.get("compare") !== "1" || !Number.isFinite(inv)) return NONE;
  const diff = inv - a.monthlyInvest;
  return CHIPS.wood.options.some((o) => o.value === diff) ? { ...NONE, wood: diff } : NONE;
}
