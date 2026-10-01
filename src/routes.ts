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
  if (opts.replace) window.history.replaceState(null, "", to);
  else window.history.pushState(null, "", to);
  window.dispatchEvent(new Event(NAV_EVENT));
  if (!to.includes("#")) window.scrollTo(0, 0);
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
