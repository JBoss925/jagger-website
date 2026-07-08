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

function LiveBoardRuntimeGraph() {
  const nodes = [
    ["Browser", 32, 118, 118],
    ["Caddy", 198, 118, 104],
    ["Replica A", 374, 42, 112],
    ["Replica B", 374, 118, 112],
    ["Replica C", 374, 194, 112],
    ["PostgreSQL", 594, 74, 132],
    ["Redis", 594, 174, 132]
  ] as const;

  return (
    <svg viewBox="0 0 780 286" role="img" aria-label="LiveBoard multi-server runtime graph">
      <defs>
        <marker id="paper-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <g className="paper-graph__links">
        <path d="M150 142 H198" />
        <path d="M302 142 C336 142 336 66 374 66" />
        <path d="M302 142 H374" />
        <path d="M302 142 C336 142 336 218 374 218" />
        <path d="M486 66 C534 66 538 98 594 98" />
        <path d="M486 142 C534 142 538 98 594 98" />
        <path d="M486 218 C534 218 538 98 594 98" />
      </g>
      <g className="paper-graph__control-links">
        <path d="M486 66 C536 66 538 198 594 198" />
        <path d="M486 142 C536 142 538 198 594 198" />
        <path d="M486 218 C536 218 538 198 594 198" />
      </g>
      {nodes.map(([label, x, y, width]) => (
        <g key={label} className="paper-graph__node" transform={`translate(${x} ${y})`}>
          <rect width={width} height="48" />
          <text x={width / 2} y="30">{label}</text>
        </g>
      ))}
      <text className="paper-graph__label" x="606" y="62">durable state</text>
      <text className="paper-graph__label" x="612" y="244">coordination</text>
    </svg>
  );
}

function LiveBoardFanoutGraph() {
  const nodes = [
    ["Client A", 34, 48, 104],
    ["Replica A", 204, 48, 112],
    ["PostgreSQL", 388, 24, 132],
    ["Redis Pub/Sub", 388, 112, 132],
    ["Replica B", 588, 112, 112],
    ["Client B", 744, 112, 104],
    ["Client C", 744, 190, 104]
  ] as const;

  return (
    <svg viewBox="0 0 890 270" role="img" aria-label="LiveBoard cross replica fanout graph">
      <defs>
        <marker id="paper-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <g className="paper-graph__links">
        <path d="M138 72 H204" />
        <path d="M316 72 C344 72 354 48 388 48" />
        <path d="M520 48 C548 48 550 136 588 136" />
        <path d="M700 136 H744" />
        <path d="M700 136 C724 136 724 214 744 214" />
      </g>
      <g className="paper-graph__control-links">
        <path d="M316 72 C344 72 354 136 388 136" />
        <path d="M520 136 H588" />
      </g>
      {nodes.map(([label, x, y, width]) => (
        <g key={label} className="paper-graph__node" transform={`translate(${x} ${y})`}>
          <rect width={width} height="48" />
          <text x={width / 2} y="30">{label}</text>
        </g>
      ))}
      <text className="paper-graph__label" x="324" y="36">commit first</text>
      <text className="paper-graph__label" x="322" y="174">publish after commit</text>
    </svg>
  );
}

function LiveBoardRecoveryGraph() {
  const nodes = [
    ["Rejected write", 28, 52, 132],
    ["rate_limited", 226, 28, 126],
    ["Writer snapshot", 414, 28, 146],
    ["preview_reset", 226, 142, 126],
    ["Peer refresh", 414, 142, 146],
    ["Durable canvas", 622, 86, 146]
  ] as const;

  return (
    <svg viewBox="0 0 810 244" role="img" aria-label="LiveBoard rate-limit recovery graph">
      <defs>
        <marker id="paper-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <g className="paper-graph__links">
        <path d="M160 76 C190 76 192 52 226 52" />
        <path d="M352 52 H414" />
        <path d="M560 52 C594 52 594 110 622 110" />
        <path d="M160 76 C190 76 192 166 226 166" />
        <path d="M352 166 H414" />
        <path d="M560 166 C594 166 594 110 622 110" />
      </g>
      {nodes.map(([label, x, y, width]) => (
        <g key={label} className="paper-graph__node" transform={`translate(${x} ${y})`}>
          <rect width={width} height="48" />
          <text x={width / 2} y="30">{label}</text>
        </g>
      ))}
      <text className="paper-graph__label" x="424" y="18">sender replaces local optimism</text>
      <text className="paper-graph__label" x="424" y="210">peers discard transient preview</text>
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
        {graph.kind === "liveboard-runtime" ? <LiveBoardRuntimeGraph /> : null}
        {graph.kind === "liveboard-fanout" ? <LiveBoardFanoutGraph /> : null}
        {graph.kind === "liveboard-recovery" ? <LiveBoardRecoveryGraph /> : null}
      </div>
      <figcaption>
        <strong>{graph.title}.</strong> {graph.description}
      </figcaption>
    </figure>
  );
}

export default PaperGraphFigure;
