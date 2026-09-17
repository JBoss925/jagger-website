import { modeInfo, type DocPage } from "../../content/docs";
import type { PaperSectionBlock } from "../../content/papers/types";

export function blockSearchText(block: PaperSectionBlock): string {
  switch (block.kind) {
    case "paragraph":
      return block.text;
    case "bullets":
      return block.items.join(" ");
    case "example":
      return `${block.label}. ${block.code} ${block.caption}`;
    case "diagram":
      return `${block.label}. ${block.body} ${block.caption}`;
    case "image":
      return `${block.label}. ${block.alt} ${block.caption}`;
    case "equation":
      return `${block.label}. ${block.tex} ${block.caption}`;
    case "graph":
      return `${block.graph.title}. ${block.graph.description}`;
    case "flow":
      return `${block.label}. ${block.stages.join(" → ")} ${block.caption}`;
    case "doc-link":
      return block.label;
    case "audio-samples":
      return "";
  }
}
const clean = (text: string) => text.replace(/\s+/g, " ").trim();

export function searchExcerpt(text: string, query: string): string {
  const content = clean(text);
  const term = clean(query).toLowerCase();
  const index = term ? content.toLowerCase().indexOf(term) : -1;
  const matchStart = Math.max(0, index);
  let start = Math.max(0, matchStart - 70);
  if (start > 0) {
    const boundary = content.indexOf(" ", start);
    if (boundary !== -1 && boundary < matchStart) start = boundary + 1;
  }
  let end = Math.min(
    content.length,
    Math.max(matchStart + term.length + 100, start + 190),
  );
  if (end < content.length) {
    const boundary = content.lastIndexOf(" ", end);
    if (boundary > matchStart + term.length) end = boundary;
  }
  return `${start > 0 ? "…" : ""}${content.slice(start, end)}${end < content.length ? "…" : ""}`;
}

export function findDocMatch(
  page: DocPage,
  query: string,
  projectName: string,
) {
  const term = clean(query).toLowerCase();
  if (!term) return null;
  const texts = page.blocks.map((block) => clean(blockSearchText(block)));
  const blockIndex = texts.findIndex((text) =>
    text.toLowerCase().includes(term),
  );
  const headingMatch = [
    page.title,
    projectName,
    modeInfo[page.mode].title,
  ].some((text) => text.toLowerCase().includes(term));
  if (!headingMatch && blockIndex < 0) return null;
  const preview =
    blockIndex >= 0
      ? texts[blockIndex]
      : (texts.find((text) => text.length > 0) ?? "");
  return { excerpt: searchExcerpt(preview, query), blockIndex };
}

export function highlightParts(text: string, query: string) {
  const term = clean(query).toLowerCase();
  if (!term) return [{ text, matched: false }];
  const lower = text.toLowerCase();
  const parts: { text: string; matched: boolean }[] = [];
  let cursor = 0;
  let index = lower.indexOf(term);
  while (index !== -1) {
    if (index > cursor)
      parts.push({ text: text.slice(cursor, index), matched: false });
    parts.push({ text: text.slice(index, index + term.length), matched: true });
    cursor = index + term.length;
    index = lower.indexOf(term, cursor);
  }
  if (cursor < text.length)
    parts.push({ text: text.slice(cursor), matched: false });
  return parts;
}
