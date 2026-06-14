import type { PaperGraph } from "../../content/papers/types";

type PaperGraphProps = {
  graph: PaperGraph;
};

function SignalFlowGraph() {
  const nodes = [
    ["Input", 18, 58],
    ["Analysis", 166, 20],
    ["Emphasis", 166, 96],
    ["Tube", 326, 58],
    ["Flux", 326, 122],
    ["Bloom", 326, 186],
    ["Blend", 486, 122],
    ["De-emphasis", 632, 96],
    ["Stereo protect", 632, 172],
    ["Output", 802, 122]
  ] as const;

  return (
    <svg viewBox="0 0 940 244" role="img" aria-label="Hearth signal flow graph">
      <defs>
        <marker id="paper-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <g className="paper-graph__links">
        <path d="M126 82 C146 82 146 44 166 44" />
        <path d="M126 82 C146 82 146 120 166 120" />
        <path d="M274 120 C296 120 300 82 326 82" />
        <path d="M274 120 C296 120 300 146 326 146" />
        <path d="M274 120 C296 120 300 210 326 210" />
        <path d="M434 82 C462 82 462 146 486 146" />
        <path d="M434 146 L486 146" />
        <path d="M434 210 C462 210 462 146 486 146" />
        <path d="M594 146 C616 146 614 120 632 120" />
        <path d="M740 120 C762 120 762 146 802 146" />
        <path d="M740 196 C768 196 768 146 802 146" />
      </g>
      <g className="paper-graph__control-links">
        <path d="M220 68 L220 96" />
        <path d="M274 44 C328 20 380 20 380 58" />
        <path d="M274 44 C438 12 660 18 686 96" />
        <path d="M274 44 C500 6 724 48 686 172" />
      </g>
      {nodes.map(([label, x, y]) => (
        <g key={label} className="paper-graph__node" transform={`translate(${x} ${y})`}>
          <rect width="108" height="48" />
          <text x="54" y="30">{label}</text>
        </g>
      ))}
    </svg>
  );
}

function ServoResponseGraph() {
  const responseY = (x: number) => 0.92 - 0.48 / (1 + Math.exp(-10 * (x - 0.58)));
  const toSvgX = (x: number) => 54 + x * 520;
  const toSvgY = (y: number) => 42 + (1 - y) * 194;
  const thresholdX = 0.58;
  const thresholdSvgX = toSvgX(thresholdX);
  const thresholdSvgY = toSvgY(responseY(thresholdX));
  const points = Array.from({ length: 38 }, (_, index) => {
    const x = index / 37;
    return `${toSvgX(x)},${toSvgY(responseY(x))}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 640 300" role="img" aria-label="Warmth Servo response graph">
      <g className="paper-graph__axis">
        <path d="M54 236 H584" />
        <path d="M54 236 V34" />
        <text x="54" y="274">low brightness</text>
        <text x="454" y="274">high brightness</text>
        <text x="14" y="48">drive</text>
      </g>
      <path className="paper-graph__threshold" d={`M${thresholdSvgX} 34 V236`} />
      <polyline className="paper-graph__curve" points={points} />
      <circle className="paper-graph__point" cx={thresholdSvgX} cy={thresholdSvgY} r="5" />
      <text className="paper-graph__label" x={thresholdSvgX + 22} y={thresholdSvgY - 12}>servo threshold</text>
      <text className="paper-graph__label" x="314" y="156">upper-band drive backs off</text>
    </svg>
  );
}

function HarmonicProfileGraph() {
  const bars = [
    ["2", 152],
    ["3", 121],
    ["4", 82],
    ["5", 52],
    ["6", 33],
    ["7", 21]
  ] as const;

  return (
    <svg viewBox="0 0 640 300" role="img" aria-label="Hearth harmonic profile graph">
      <g className="paper-graph__axis">
        <path d="M56 236 H584" />
        <path d="M56 236 V34" />
        <text x="248" y="276">harmonic order</text>
        <text x="12" y="48">level</text>
      </g>
      {bars.map(([label, height], index) => {
        const x = 110 + index * 76;
        return (
          <g key={label} className="paper-graph__bar">
            <rect x={x} y={236 - height} width="44" height={height} />
            <text x={x + 22} y="260">{label}</text>
          </g>
        );
      })}
      <polyline
        className="paper-graph__curve paper-graph__curve--thin"
        points="132,84 208,115 284,154 360,184 436,203 512,215"
      />
    </svg>
  );
}

function PaperGraphFigure({ graph }: PaperGraphProps) {
  return (
    <figure className="paper-figure">
      <div className="paper-graph">
        {graph.kind === "signal-flow" ? <SignalFlowGraph /> : null}
        {graph.kind === "servo-response" ? <ServoResponseGraph /> : null}
        {graph.kind === "harmonic-profile" ? <HarmonicProfileGraph /> : null}
      </div>
      <figcaption>
        <strong>{graph.title}.</strong> {graph.description}
      </figcaption>
    </figure>
  );
}

export default PaperGraphFigure;
