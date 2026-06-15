import { aixcCompressorPaper } from "./aixcCompressor";
import { geneticTsPaper } from "./geneticTs";
import { hearthPaper } from "./hearth";
import { jaggerscriptPaper } from "./jaggerscript";
import { ojamlPaper } from "./ojaml";
import { renginePaper } from "./rengine";
import { tsxlightRendererPaper } from "./tsxlightRenderer";

export const papers = [
  hearthPaper,
  aixcCompressorPaper,
  ojamlPaper,
  jaggerscriptPaper,
  geneticTsPaper,
  renginePaper,
  tsxlightRendererPaper
];

export function getPaperBySlug(slug: string | undefined) {
  return papers.find((paper) => paper.slug === slug);
}
