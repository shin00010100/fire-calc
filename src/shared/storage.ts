import { Storage as AitStorage } from "@apps-in-toss/web-framework";
import { currentFlameInput } from "./calc/current";
import { determineStage } from "./calc/stages";
import { ymKey } from "./format";
import type { FireInput, FlameState, StageIndex } from "./types";

const KEY = "freedom-flame:v1";

interface KV {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const withTimeout = <T,>(p: Promise<T>, ms = 1500) => Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))]);

// 앱인토스 SDK Storage (getItem/setItem/removeItem, 비동기 문자열) — @apps-in-toss/web-framework 3.2.0 타입으로 확인.
// 로컬 브라우저에서는 브리지가 없어 실패/무응답이므로 타임아웃 후 폴백한다.
const sdkKV: KV = {
  getItem: (k) => withTimeout(AitStorage.getItem(k)),
  setItem: (k, v) => withTimeout(AitStorage.setItem(k, v)),
  removeItem: (k) => withTimeout(AitStorage.removeItem(k)),
};

const localKV: KV = {
  getItem: async (k) => window.localStorage.getItem(k),
  setItem: async (k, v) => window.localStorage.setItem(k, v),
  removeItem: async (k) => window.localStorage.removeItem(k),
};

const memory = new Map<string, string>();
const memoryKV: KV = {
  getItem: async (k) => memory.get(k) ?? null,
  setItem: async (k, v) => { memory.set(k, v); },
  removeItem: async (k) => { memory.delete(k); },
};

let kv: KV | null = null;
/** true면 기기에 저장하지 못하고 메모리에만 있음 → 토스트 표시 */
export let persistFailed = false;

async function pickKV(): Promise<KV> {
  if (kv) return kv;
  for (const candidate of [sdkKV, localKV]) {
    try {
      await candidate.getItem(KEY);
      kv = candidate;
      return kv;
    } catch { /* 다음 어댑터 */ }
  }
  persistFailed = true;
  kv = memoryKV;
  return kv;
}

export const defaultState = (): FlameState => ({ version: 1, input: null, logs: [], lastSeenStage: 0, createdAt: new Date().toISOString() });

let cache: FlameState | null = null;

export async function loadState(): Promise<FlameState> {
  if (cache) return cache;
  try {
    const raw = await (await pickKV()).getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as FlameState) : null;
    cache = parsed?.version === 1 ? parsed : defaultState();
  } catch {
    cache = defaultState();
  }
  return cache;
}

// 쓰기 직렬화 큐
let queue: Promise<unknown> = Promise.resolve();
function write(next: FlameState): Promise<FlameState> {
  cache = next;
  const job = queue.then(async () => {
    try {
      await (await pickKV()).setItem(KEY, JSON.stringify(next));
    } catch {
      // 기기 저장 실패 → 이후 메모리 저장
      persistFailed = true;
      kv = memoryKV;
      await memoryKV.setItem(KEY, JSON.stringify(next));
    }
    return next;
  });
  queue = job.catch(() => undefined);
  return job;
}

const flameStage = (state: FlameState, now: Date) => {
  const input = currentFlameInput(state, ymKey(now));
  return input ? determineStage(input) : 0;
};

/**
 * 입력 저장. 나이 경과 기준점(createdAt)을 다시 잡고, 계산기로 바꾼 값으로는 축하하지 않도록
 * lastSeenStage를 새 입력의 단계로 맞춘다(축하는 장작 넣기·시간 경과로 오를 때만).
 */
export async function saveInput(input: FireInput): Promise<FlameState> {
  const state = await loadState();
  const next: FlameState = { ...state, input, createdAt: new Date().toISOString() };
  next.lastSeenStage = flameStage(next, new Date());
  return write(next);
}

export async function addFuelLog(ym: string, assets: number): Promise<{ prevStage: StageIndex; newStage: StageIndex; state: FlameState }> {
  const state = await loadState();
  const now = new Date();
  const prevStage = flameStage(state, now);
  const logs = [...state.logs.filter((l) => l.ym !== ym), { ym, assets, recordedAt: now.toISOString() }].sort((a, b) => a.ym.localeCompare(b.ym));
  const next = await write({ ...state, logs });
  return { prevStage, newStage: flameStage(next, now), state: next };
}

export async function setLastSeenStage(s: StageIndex): Promise<FlameState> {
  return write({ ...(await loadState()), lastSeenStage: s });
}

export async function resetAll(): Promise<FlameState> {
  try { await (await pickKV()).removeItem(KEY); } catch { /* 무시 */ }
  cache = defaultState();
  return cache;
}
