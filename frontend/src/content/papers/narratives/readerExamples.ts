import type { PaperSectionBlock } from "../types";

// Essay-specific examples leave the original reference manuscripts intact.
export const storyOverrides: Record<string, PaperSectionBlock> = {
  jaggerscript: {
    kind: "example",
    label: "A Counter Program",
    language: "javascript",
    code: `class CounterDemo {
  constructor() {}

  func main() {
    Counter counter = new Counter(4);
    console.log(counter.next());
    console.log(counter.next());
  }
}

class Counter {
  number value = 0;

  constructor(number start) {
    value = start;
  }

  func next() {
    value = value + 1;
    return value;
  }
}`,
    caption:
      "CounterDemo supplies the entry method. Each next call changes the same Counter instance; the program prints 5 and 6.",
  },
};

export const readerExamples: Record<
  string,
  Record<string, PaperSectionBlock[]>
> = {
  ojaml: {
    closures: [
      {
        kind: "example",
        label: "A Captured Offset",
        language: "ocaml",
        code: `let make_adder offset =
  fun value -> offset + value

let main =
  let add_seven = make_adder 7 in
  add_seven 5`,
        caption:
          "main returns 12. The returned function keeps offset equal to 7 after make_adder has returned.",
      },
    ],
  },
  "aixc-compressor": {
    "reference-codec": [
      {
        kind: "example",
        label: "A Hit and Miss Trace",
        language: "text",
        code: `Source:             A B B A
Stored seed:        A
Predictor:          repeats the most recent unit

Next source unit:   B     B     A
Prediction:         A     B     B
Decision:           MISS  HIT   MISS
Stored residual:    B     —     A
Reconstructed unit: B     B     A`,
        caption:
          "A schematic byte-mode trace with literal residuals. The seed, decisions, and residuals recover ABBA; packing and container overhead are omitted.",
      },
    ],
  },
  rengine: {
    "transform-composition": [
      {
        kind: "diagram",
        label: "A Child Under a Rotating Parent",
        body: `Parent position (100, 50)
  └─ Child local position (20, 0)

Parent rotation 0°   → child world position (120, 50)
Parent rotation 90°  → child world position (100, 70)

Child local position stays (20, 0).`,
        caption:
          "A conceptual canvas-space example with zero anchors, unit scale, and a positive quarter-turn rotation.",
      },
    ],
  },
  "tsxlight-renderer": {
    "component-model": [
      {
        kind: "example",
        label: "A Button Element",
        language: "tsx",
        code: "<button onClick={increment}>{count}</button>",
        caption:
          "Server component expression: rendering emits the count label and registers increment with the component receiver.",
      },
    ],
    communication: [
      {
        kind: "example",
        label: "A Counter Event",
        language: "text",
        code: `Server component: count = 4
Shell:             button shows 4

Click
  → bridge sends the current callback address
  → server resolves it within the renderer and page
  → callback changes count to 5
  → render produces a new shell and callback table
  → shell receives markup showing 5`,
        caption:
          "A logical event trace rather than a literal socket payload. State changes on the server before the new label reaches the client.",
      },
    ],
  },
};

export const detailCaptions: Record<string, string> = {
  liveboard:
    "S_r is the saved canvas state before operation op_r. invert computes its inverse, the operation that restores the affected state for undo.",
  hearth:
    "The E terms estimate energy in high, low, and mid bands at sample time n. Epsilon protects the denominator near silence; B is the resulting brightness proxy.",
  "genetic-ts":
    "The genome g contains horizontal velocity v_x and vertical velocity v_y. These two values determine the launch, not subsequent steering.",
  rengine:
    "W_e is the child's world transform, W_parent its parent's world transform, and M_e its local transform. Composition uses the parent-before-local order shown in the equation.",
  "tsxlight-renderer":
    "For user u, renderer R_u contains DOM shell D_u, component tree C_u, active page P_u, and callback table K_u.",
};
