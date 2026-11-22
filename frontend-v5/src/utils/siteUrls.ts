export function isLocalHost() {
  return (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  );
}

export function mainSiteHref(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const envBase = import.meta.env.VITE_PORTFOLIO_URL?.trim();
  if (envBase) {
    return `${envBase.replace(/\/+$/, "")}${normalized}`;
  }
  if (import.meta.env.DEV || isLocalHost()) {
    return `${window.location.protocol}//${window.location.hostname}:5173${normalized}`;
  }
  return `https://jaggerbrulato.com${normalized}`;
}

export function subdomainHref(
  envValue: string | undefined,
  localPort: number,
  fallback: string,
  path = "",
) {
  const configured = envValue?.trim();
  const base = (
    configured
      ? configured
      : import.meta.env.DEV || isLocalHost()
        ? `${window.location.protocol}//${window.location.hostname}:${localPort}`
        : fallback
  ).replace(/\/+$/, "");
  if (!path || path === "/") return `${base}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function resolveSiteHref(href: string) {
  return href.startsWith("/") ? mainSiteHref(href) : href;
}
