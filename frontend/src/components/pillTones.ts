export function inferChipTone(label: string) {
  const normalized = label.toLowerCase();
  const languageLabels = new Set([
    "c",
    "c#",
    "dart",
    "go",
    "golang",
    "java",
    "javascript",
    "jaggerscript",
    "kotlin",
    "objective-c",
    "ojaml",
    "python",
    "swift",
    "typescript"
  ]);

  if (languageLabels.has(normalized)) {
    return "language";
  }

  if (
    normalized.includes("type declarations") ||
    normalized.includes("type inference") ||
    normalized.includes("type systems")
  ) {
    return "practice";
  }

  if (
    normalized.includes("react") ||
    normalized.includes("three.js") ||
    normalized.includes("@react-three") ||
    normalized.includes("next.js") ||
    normalized.includes("express") ||
    normalized.includes("django") ||
    normalized.includes("angular") ||
    normalized.includes("spring") ||
    normalized.includes("xamarin") ||
    normalized.includes("flutter") ||
    normalized.includes("svelte") ||
    normalized.includes("vue") ||
    normalized.includes("matter.js") ||
    normalized.includes("matter-js") ||
    normalized.includes("monaco") ||
    normalized.includes("wabt") ||
    normalized.includes("katex") ||
    normalized.includes("node.js") ||
    normalized === "node" ||
    normalized.includes("nestjs")
  ) {
    return "framework";
  }

  if (
    normalized.includes("aws") ||
    normalized.includes("amazon") ||
    normalized.includes("bazel") ||
    normalized.includes("bitbucket") ||
    normalized.includes("bullmq") ||
    normalized.includes("cloud") ||
    normalized.includes("databricks") ||
    normalized.includes("docker") ||
    normalized.includes("dynamodb") ||
    normalized.includes("electron") ||
    normalized.includes("firebase") ||
    normalized.includes("firestore") ||
    normalized.includes("gcp") ||
    normalized.includes("gcr") ||
    normalized.includes("grafana") ||
    normalized.includes("helm") ||
    normalized.includes("kafka") ||
    normalized.includes("kubernetes") ||
    normalized.includes("lambda") ||
    normalized.includes("packaging") ||
    normalized.includes("postgresql") ||
    normalized.includes("pub/sub") ||
    normalized.includes("rabbitmq") ||
    normalized.includes("rds") ||
    normalized.includes("route 53") ||
    normalized.includes("sqs") ||
    normalized.includes("spanner") ||
    normalized.includes("ssr") ||
    normalized.includes("sockets") ||
    normalized.includes("swagger") ||
    normalized.includes("terraform")
  ) {
    return "infrastructure";
  }

  if (
    normalized.includes("3d scenes") ||
    normalized.includes("api") ||
    normalized.includes("architecture") ||
    normalized.includes("async") ||
    normalized.includes("automation") ||
    normalized.includes("backend util") ||
    normalized.includes("benchmark") ||
    normalized.includes("ci/cd") ||
    normalized.includes("cli") ||
    normalized.includes("compiler") ||
    normalized.includes("design") ||
    normalized.includes("diagnostic") ||
    normalized.includes("etl") ||
    normalized.includes("full-stack") ||
    normalized.includes("local persistence") ||
    normalized.includes("communication") ||
    normalized.includes("leadership") ||
    normalized.includes("onboarding") ||
    normalized.includes("execution") ||
    normalized.includes("ambiguity") ||
    normalized.includes("state") ||
    normalized.includes("interaction") ||
    normalized.includes("abstraction") ||
    normalized.includes("testing") ||
    normalized.includes("vitest") ||
    normalized.includes("playwright") ||
    normalized.includes("responsive")
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
    return chipToneOrder[left.tone] - chipToneOrder[right.tone];
  });
}

export function sortChipLabels(labels: string[]) {
  return [...labels].sort((left, right) => {
    const leftTone = inferChipTone(left);
    const rightTone = inferChipTone(right);
    return chipToneOrder[leftTone] - chipToneOrder[rightTone];
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
