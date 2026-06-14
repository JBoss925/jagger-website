import { hearthPaper } from "./hearth";

export const papers = [hearthPaper];

export function getPaperBySlug(slug: string | undefined) {
  return papers.find((paper) => paper.slug === slug);
}
