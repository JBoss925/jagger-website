import { makeEssay } from "./editorial";
import { aixcCompressorPaper } from "../docs/aixcCompressor";
import { geneticTsPaper } from "../docs/geneticTs";
import { hearthPaper } from "../docs/hearth";
import { jaggerscriptPaper } from "../docs/jaggerscript";
import { liveboardPaper } from "../docs/liveboard";
import { ojamlPaper } from "../docs/ojaml";
import { renginePaper } from "../docs/rengine";
import { tsxlightRendererPaper } from "../docs/tsxlightRenderer";

export const sourceDocuments = [
  ojamlPaper,
  liveboardPaper,
  hearthPaper,
  jaggerscriptPaper,
  aixcCompressorPaper,
  geneticTsPaper,
  renginePaper,
  tsxlightRendererPaper
];

export const papers = sourceDocuments.map(makeEssay);

export function getPaperBySlug(slug: string | undefined) {
  return papers.find((paper) => paper.slug === slug);
}
