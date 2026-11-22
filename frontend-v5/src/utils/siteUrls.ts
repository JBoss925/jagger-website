export function mainSiteHref(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const envBase = import.meta.env.VITE_PORTFOLIO_URL?.trim();
  if (envBase) {
    return `${envBase.replace(/\/+$/, "")}${normalized}`;
  }
  if (import.meta.env.DEV) {
    return `${window.location.protocol}//${window.location.hostname}:5173${normalized}`;
  }
  return `https://jaggerbrulato.com${normalized}`;
}

export function subdomainHref(envValue: string | undefined, fallback: string, path = "") {
  const base = (envValue?.trim() || fallback).replace(/\/+$/, "");
  if (!path || path === "/") return `${base}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function resolveSiteHref(href: string) {
  return href.startsWith("/") ? mainSiteHref(href) : href;
}
