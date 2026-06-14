import katex from "katex";

type PaperMathProps = {
  tex: string;
  block?: boolean;
  label?: string;
};

function PaperMath({ tex, block = false, label }: PaperMathProps) {
  const html = katex.renderToString(tex, {
    displayMode: block,
    throwOnError: false,
    strict: "ignore"
  });

  return (
    <span
      className={block ? "paper-math paper-math--block" : "paper-math"}
      aria-label={label ?? tex}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default PaperMath;
