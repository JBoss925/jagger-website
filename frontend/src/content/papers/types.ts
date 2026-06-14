export type PaperCategory = "Audio DSP" | "Max for Live" | "Research Notes";

export type PaperGraph =
  | {
      kind: "signal-flow";
      title: string;
      description: string;
    }
  | {
      kind: "servo-response";
      title: string;
      description: string;
    }
  | {
      kind: "harmonic-profile";
      title: string;
      description: string;
    };

export type PaperAudioSample = {
  label: string;
  source: string;
  drySrc: string;
  wetSrc: string;
  durationSeconds?: number;
};

export type PaperActionLink = {
  label: string;
  href: string;
  description?: string;
};

export type PaperSection = {
  id: string;
  kind?: "standard" | "audio-samples";
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  equations?: {
    label: string;
    tex: string;
    caption: string;
  }[];
  bullets?: string[];
  graph?: PaperGraph;
};

export type PaperDocument = {
  slug: string;
  title: string;
  subtitle: string;
  authors: string[];
  date: string;
  abstract: string;
  description: string;
  categories: PaperCategory[];
  tags: string[];
  repoUrl: string;
  previewImage?: string;
  previewAlt: string;
  actionLinks?: PaperActionLink[];
  sections: PaperSection[];
  audioSamples: PaperAudioSample[];
};
