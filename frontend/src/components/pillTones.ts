export function inferChipTone(label: string) {
  const normalized = label.toLowerCase();

  if (
    normalized.includes("typescript") ||
    normalized.includes("java") ||
    normalized.includes("python") ||
    normalized.includes("c#")
  ) {
    return "language";
  }

  if (
    normalized.includes("react") ||
    normalized.includes("next.js") ||
    normalized.includes("express") ||
    normalized.includes("django") ||
    normalized.includes("angular") ||
    normalized.includes("spring") ||
    normalized.includes("xamarin") ||
    normalized.includes("firebase") ||
    normalized.includes("netlify") ||
    normalized.includes("matter-js")
  ) {
    return "framework";
  }

  if (
    normalized.includes("cloud") ||
    normalized.includes("firestore") ||
    normalized.includes("local persistence") ||
    normalized.includes("ssr") ||
    normalized.includes("sockets") ||
    normalized.includes("electron") ||
    normalized.includes("packaging") ||
    normalized.includes("backend util")
  ) {
    return "infrastructure";
  }

  if (
    normalized.includes("design") ||
    normalized.includes("leadership") ||
    normalized.includes("communication") ||
    normalized.includes("onboarding") ||
    normalized.includes("execution") ||
    normalized.includes("ambiguity") ||
    normalized.includes("state") ||
    normalized.includes("interaction") ||
    normalized.includes("abstraction") ||
    normalized.includes("api")
  ) {
    return "practice";
  }

  return "domain";
}

const chipToneOrder = {
  language: 0,
  framework: 1,
  infrastructure: 2,
  practice: 3,
  domain: 4
} as const;

export function sortChipItems<T extends { label: string; tone: keyof typeof chipToneOrder }>(items: T[]) {
  return [...items].sort((left, right) => {
    const toneDelta = chipToneOrder[left.tone] - chipToneOrder[right.tone];
    if (toneDelta !== 0) {
      return toneDelta;
    }

    return left.label.localeCompare(right.label);
  });
}

export function sortChipLabels(labels: string[]) {
  return [...labels].sort((left, right) => {
    const leftTone = inferChipTone(left);
    const rightTone = inferChipTone(right);
    const toneDelta = chipToneOrder[leftTone] - chipToneOrder[rightTone];
    if (toneDelta !== 0) {
      return toneDelta;
    }

    return left.localeCompare(right);
  });
}

export function getLinkToneClass(label: string, href: string, primary = false) {
  const normalizedLabel = label.toLowerCase();
  const normalizedHref = href.toLowerCase();

  if (primary) {
    return "project-card__link--primary";
  }

  if (
    normalizedHref.includes("github.com") ||
    normalizedLabel.includes("github") ||
    normalizedLabel.includes("source")
  ) {
    return "pill-link--github";
  }

  if (normalizedHref.includes("linkedin.com") || normalizedLabel.includes("linkedin")) {
    return "pill-link--linkedin";
  }

  if (normalizedHref.startsWith("mailto:") || normalizedLabel.includes("email")) {
    return "pill-link--email";
  }

  if (normalizedLabel.includes("resume") || normalizedHref.endsWith(".pdf")) {
    return "pill-link--resume";
  }

  if (normalizedHref.includes("npmjs.com") || normalizedLabel.includes("npm")) {
    return "pill-link--npm";
  }

  if (normalizedLabel.includes("reference")) {
    return "pill-link--reference";
  }

  return "pill-link--neutral";
}
