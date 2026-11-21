export function mainSiteHref(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (import.meta.env.DEV) {
    return `${window.location.protocol}//${window.location.hostname}:5173${normalized}`;
  }
  return `https://jaggerbrulato.com${normalized}`;
}

export function resolveSiteHref(href: string) {
  return href.startsWith("/") ? mainSiteHref(href) : href;
}
