import { flushSync } from "react-dom";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as storage from "./storage";
import type { FireInput, FlameState, StageIndex } from "./types";

interface FlameStateValue {
  state: FlameState;
  ready: boolean;
  persistFailed: boolean;
  saveInput: (input: FireInput) => Promise<void>;
  addFuelLog: (ym: string, amount: number) => Promise<{ prevStage: StageIndex; newStage: StageIndex }>;
  setLastSeenStage: (s: StageIndex) => Promise<void>;
  setTotalAssets: (total: number) => Promise<void>;
}

const Ctx = createContext<FlameStateValue | null>(null);

export function FlameStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FlameState>(storage.defaultState);
  const [ready, setReady] = useState(false);
  const [persistFailed, setPersistFailed] = useState(false);
  // 저장 직후 navigate()가 이어지므로 새 상태를 즉시 커밋한다.
  // (안 그러면 다음 화면이 이전 상태(input=null)로 먼저 렌더돼 /input으로 되돌아감)
  const sync = useCallback((next: FlameState) => { flushSync(() => { setState(next); setPersistFailed(storage.persistFailed); }); }, []);

  useEffect(() => { storage.loadState().then((s) => { setState(s); setPersistFailed(storage.persistFailed); setReady(true); }); }, []);

  const value = useMemo<FlameStateValue>(() => ({
    state, ready, persistFailed,
    saveInput: async (input) => sync(await storage.saveInput(input)),
    addFuelLog: async (ym, amount) => { const r = await storage.addFuelLog(ym, amount); sync(r.state); return { prevStage: r.prevStage, newStage: r.newStage }; },
    setLastSeenStage: async (s) => sync(await storage.setLastSeenStage(s)),
    setTotalAssets: async (total) => sync(await storage.setTotalAssets(total)),
  }), [state, ready, persistFailed, sync]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react/only-export-components
export function useFlameStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("FlameStateProvider가 필요해요");
  return v;
}
