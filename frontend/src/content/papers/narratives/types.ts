export type NarrativeChapter = {
  sourceId: string;
  title: string;
  paragraphs: string[];
  relatedSourceIds?: string[];
};
export type NarrativePlan = {
  name: string;
  subtitle: string;
  abstract: string;
  sections: NarrativeChapter[];
};
export function chapter(
  sourceId: string,
  title: string,
  text: string,
  relatedSourceIds?: string[],
): NarrativeChapter {
  return {
    sourceId,
    title,
    paragraphs: text
      .trim()
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.replace(/\s+/g, " ").trim()),
    ...(relatedSourceIds ? { relatedSourceIds } : {}),
  };
}
