export type SceneSection = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  position: [number, number, number];
  camera: [number, number, number];
  target: [number, number, number];
  accent: string;
};

export type NavLinkItem = {
  id: string;
  label: string;
  href: string;
  matchPrefix?: string;
};

export type ExperienceEntry = {
  slug: string;
  company: string;
  role: string;
  timeframe: string;
  location: string;
  logo?: string;
  logoAlt?: string;
  summary: string;
  highlights: string[];
  tags: {
    label: string;
    tone: "language" | "framework" | "infrastructure" | "domain" | "practice";
  }[];
};

export type ProjectEntry = {
  slug: string;
  title: string;
  description: string;
  impact: string;
  stack: string[];
  image?: string;
  icon?:
    | "domes"
    | "jordle"
    | "jolor"
    | "genetic"
    | "jaggerscript"
    | "materialize"
    | "tsxlight"
    | "rengine"
    | "typing-effect"
    | "idol";
  links: {
    label: string;
    href: string;
  }[];
};

export type SkillCluster = {
  title: string;
  summary: string;
  items: string[];
};

export type JaggerScriptExample = {
  id: string;
  title: string;
  description: string;
  source: string;
};

export type ProfileContent = {
  name: string;
  title: string;
  location: string;
  email: string;
  heroSummary: string;
  heroBullets: string[];
  metrics: {
    label: string;
    value: string;
  }[];
  links: {
    label: string;
    href: string;
  }[];
  sceneSections: SceneSection[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skillClusters: SkillCluster[];
  jaggerscriptIntro: {
    headline: string;
    summary: string;
    bullets: string[];
  };
};
