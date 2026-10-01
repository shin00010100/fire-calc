import { useMemo, useState } from "react";
import { currentFlameInput, fuelOfMonth } from "../shared/calc/current";
import { calculateStages } from "../shared/calc/stages";
import { useFlameStore } from "../shared/FlameStateContext";
import { ymKey } from "../shared/format";

/** 불꽃 화면 공통 상태: 현재 입력(시작 금액 + 장작, 경과 나이)·단계·이번 달 장작 */
export function useFlameState() {
  const store = useFlameStore();
  const [nowYm] = useState(() => ymKey(new Date()));
  const input = useMemo(() => currentFlameInput(store.state, nowYm), [store.state, nowYm]);
  const stages = useMemo(() => (input ? calculateStages(input) : null), [input]);
  const monthFuel = useMemo(() => fuelOfMonth(store.state, nowYm), [store.state, nowYm]);
  return { ...store, nowYm, input, stages, monthFuel };
}
