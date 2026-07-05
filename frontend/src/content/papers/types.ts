export type PaperCategory = "Audio DSP" | "Compression" | "Engine Architecture" | "Language Tooling" | "Max for Live" | "Research Notes" | "Simulation" | "Systems";
export type PaperGraph = {
    kind: "signal-flow";
    title: string;
    description: string;
} | {
    kind: "servo-response";
    title: string;
    description: string;
} | {
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
export type PaperSectionBlock = {
    kind: "paragraph";
    text: string;
} | {
    kind: "bullets";
    items: string[];
} | {
    kind: "example";
    label: string;
    code: string;
    language?: string;
    caption: string;
} | {
    kind: "diagram";
    label: string;
    body: string;
    caption: string;
} | {
    kind: "image";
    label: string;
    image: string;
    alt: string;
    caption: string;
} | {
    kind: "equation";
    label: string;
    tex: string;
    caption: string;
} | {
    kind: "graph";
    graph: PaperGraph;
} | {
    kind: "audio-samples";
};
export type PaperSection = {
    id: string;
    eyebrow?: string;
    title: string;
    blocks: PaperSectionBlock[];
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
    previewCaption?: string;
    actionLinks?: PaperActionLink[];
    sections: PaperSection[];
    audioSamples: PaperAudioSample[];
};
