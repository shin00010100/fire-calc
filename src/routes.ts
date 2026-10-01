import { graniteEvent, Screen } from "@apps-in-toss/web-framework";
import { useSyncExternalStore } from "react";

export const ROUTES = {
  main: "/",
  input: "/input",
  result: "/result",
  flame: "/flame",
  fuel: "/fuel",
  stageUp: "/stage-up",
  devFlames: "/dev/flames",
} as const;

const NAV_EVENT = "app:navigate";

/** History API 기반 이동. replace면 뒤로가기에 남지 않음 */
export function navigate(to: string, opts: { replace?: boolean } = {}) {
  if (opts.replace) window.history.replaceState({ depth: depth() }, "", to);
  else window.history.pushState({ depth: depth() + 1 }, "", to);
  window.dispatchEvent(new Event(NAV_EVENT));
  if (!to.includes("#")) window.scrollTo(0, 0);
}

/** 앱 안에서 쌓인 화면 수 (첫 화면 = 0) */
const depth = (): number => (window.history.state as { depth?: number } | null)?.depth ?? 0;

/**
 * 토스 내비게이션 바 뒤로가기 연결 (검수 기준: 자체 뒤로가기 버튼 금지, 첫 화면에서 뒤로가면 앱 종료).
 * backEvent를 구독하면 기본 뒤로가기는 막히므로 직접 처리한다.
 * 반환값: 구독 해제 함수. 토스 앱 밖(로컬 브라우저)에서는 아무것도 하지 않는다.
 */
export function bindTossBack(): () => void {
  try {
    return graniteEvent.addEventListener("backEvent", {
      onEvent: () => {
        if (depth() > 0) window.history.back();
        else Screen.close().catch(() => undefined);
      },
      onError: () => undefined,
    });
  } catch {
    return () => undefined;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("popstate", cb);
  window.addEventListener(NAV_EVENT, cb);
  return () => { window.removeEventListener("popstate", cb); window.removeEventListener(NAV_EVENT, cb); };
}

const snapshot = () => window.location.pathname + window.location.search + window.location.hash;

export function useLocation() {
  const href = useSyncExternalStore(subscribe, snapshot);
  const url = new URL(href, window.location.origin);
  return { path: url.pathname, query: url.searchParams, hash: url.hash.slice(1) };
}
