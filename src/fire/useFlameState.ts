import { useMemo, useState } from "react";
import { currentFlameInput, latestLog } from "../shared/calc/current";
import { calculateHeat } from "../shared/calc/heat";
import { calculateStages } from "../shared/calc/stages";
import { useFlameStore } from "../shared/FlameStateContext";
import { ymKey } from "../shared/format";

/** 불꽃 화면(4~7) 공통 상태: §6.7 기준 현재 입력·단계·오늘의 열 */
export function useFlameState() {
  const store = useFlameStore();
  const [nowYm] = useState(() => ymKey(new Date()));
  const input = useMemo(() => currentFlameInput(store.state, nowYm), [store.state, nowYm]);
  const stages = useMemo(() => (input ? calculateStages(input) : null), [input]);
  const heat = useMemo(() => (input ? calculateHeat(input) : null), [input]);
  const lastLog = latestLog(store.state);
  const thisMonthLog = lastLog?.ym === nowYm ? lastLog : null;
  return { ...store, nowYm, input, stages, heat, thisMonthLog };
}
