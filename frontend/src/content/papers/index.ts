import { aixcCompressorPaper } from "./aixcCompressor";
import { geneticTsPaper } from "./geneticTs";
import { hearthPaper } from "./hearth";
import { jaggerscriptPaper } from "./jaggerscript";
import { liveboardPaper } from "./liveboard";
import { ojamlPaper } from "./ojaml";
import { renginePaper } from "./rengine";
import { tsxlightRendererPaper } from "./tsxlightRenderer";

export const papers = [
  ojamlPaper,
  liveboardPaper,
  hearthPaper,
  jaggerscriptPaper,
  aixcCompressorPaper,
  geneticTsPaper,
  renginePaper,
  tsxlightRendererPaper
];

export function getPaperBySlug(slug: string | undefined) {
  return papers.find((paper) => paper.slug === slug);
}
