import { chapter, type NarrativePlan } from "./types";
export const hearthNarrative: NarrativePlan = {
  name: "Hearth",
  subtitle:
    "A Max for Live saturation device with tube curvature, flux memory, and adaptive tone control.",
  abstract:
    "Hearth is a Max for Live saturation device designed to add harmonic density while preserving transient definition and controlling glare. Its GenExpr core combines tube-style curvature, direction-dependent flux memory, and transient-gated bloom within an emphasis and compensation path. A slow, bounded Warmth Servo uses source-analysis proxies to moderate selected parameters, while a macro couples drive, tone, and character. Local anti-aliasing and limited memory state keep the design suited to low-latency processing. Wet/dry recordings illustrate the complete device’s response; the design remains a musical approximation rather than a detailed magnetic model or an automatic assessment of perceived warmth.",
  sections: [
    chapter(
      "motivation",
      "Warmth Without Losing the Attack",
      `
Turning up saturation can add body and dull an attack in the same gesture. A bright source can become brittle; stereo processing can disturb the image. Hearth is a Max for Live audio effect designed around that balance: harmonic density with restrained glare, recognizable transients, and stable stereo behavior.

Warmth is the musical target, not a single measured quantity. A vocal’s sibilance and a guitar’s picked attack put different demands on the processor. Hearth divides those jobs among tube curvature, flux memory, transient bloom, and adaptive tone control instead of relying on one transfer curve.
`,
    ),
    chapter(
      "audio-samples",
      "The Sound of the Device",
      `
The wet/dry comparisons include the complete device, including compensation and output gain. The player starts both buffers together and switches the audible path, allowing comparison at the same point in the passage. Comparable output levels help distinguish added texture from a louder presentation.

Vocals expose upper-band roughness; drums expose changes to attacks. These recordings offer specific material for hearing the balance between density, definition, and audible adaptation. They do not establish one useful setting for every source.
`,
    ),
    chapter(
      "architecture",
      "The Signal Path",
      `
Input conditioning removes DC before a pre-emphasized audio path feeds the tube, flux, and bloom contributions. They recombine before de-emphasis, stereo protection, output trim, and a soft safety stage. A parallel analysis bus drives selected parameters rather than adding processing stages in series.

The emphasis pair shapes how the nonlinear core is driven as well as its final tonal balance. Generated harmonics prevent pre- and de-emphasis from simply cancelling. Adjusting the input spectrum therefore changes the character produced by the lanes, not only the EQ heard at the output.
`,
    ),
    chapter(
      "tube-lane",
      "The Tube Lane",
      `
The tube lane uses smooth curvature with controllable asymmetry to produce even as well as odd harmonics. Its chart illustrates the intended low-order emphasis; the bars are conceptual rather than measured device output.

ADAA-style antiderivative anti-aliasing evaluates the tube response over the interval between sample values. The quality selector changes local evaluation density over that segment. Anti-aliasing is confined to this lane rather than achieved by globally oversampling the device, leaving the other stages’ numerical limits intact.

Bias-point subtraction reduces DC introduced by asymmetry. Later DC and stereo protection address residual drift, keeping the operating-point change from becoming an uncontrolled output offset.
`,
    ),
    chapter(
      "flux-memory",
      "Flux Memory",
      `
The flux lane adds a direction-dependent approach rate to a small memory state. Blending that state into the nonlinear input gives rising and falling portions of a picked note different responses, adding density and rounding without relying entirely on tube drive.

Damping bounds the memory contribution. This is a compact hysteresis approximation, not a physical tape or transformer model. The limited state keeps realtime cost predictable while leaving detailed magnetic behavior outside its scope.
`,
    ),
    chapter(
      "warmth-servo",
      "Bloom and the Warmth Servo",
      `
Bloom adds a transient-gated contribution alongside the tube and flux lanes. The gate limits its duration, allowing attack-local character without sustaining another layer of distortion across the passage.

The Warmth Servo uses level, brightness, roughness, and transient-density proxies to adjust selected parameters slowly and within bounds. Higher brightness or roughness reduces upper-band drive and emphasis; a dull, peaky source can favor bloom or mild bias. An already dense bus can favor flux behavior instead of more high-band tube drive. Those adjustments moderate the user’s setting rather than replacing it. Slow movement limits audible modulation, while bounded range keeps the detector response from overtaking the macro’s chosen balance.

The brightness equation uses estimated high-, low-, and mid-band energies, with epsilon guarding the denominator near silence. It is a glare proxy rather than a direct warmth measurement. The response plot illustrates the direction of control, not a calibrated response for every source.
`,
    ),
    chapter(
      "controls",
      "The Controls",
      `
The main macro couples drive, tone, and character along a chosen mapping. Independently increasing those parameters would not necessarily preserve the same balance. Secondary controls refine the lanes and adaptation without exposing every internal DSP parameter.

The interface follows the path from input preparation and emphasis through density and adaptive tone to blend and output safety. That grouping separates remedies for excess brightness from changes to transient character.
`,
      ["ui-controls"],
    ),
    chapter(
      "implementation",
      "The DSP Core and Device Wrapper",
      `
The GenExpr source generates the Gen DSP core and Max for Live wrapper. Hearth.maxpat and Hearth-Core.gendsp connect that core to the device controls inside Ableton Live; the documented loading workflow requires Max 10 or newer.

The build script regenerates the Max files. Editing a generated patch separately can leave source and device out of sync or lose the change on regeneration. The DSP source therefore remains the implementation to modify and review.
`,
    ),
    chapter(
      "tradeoffs",
      "A Live Device’s Limits",
      `
Local anti-aliasing and bounded flux state suit the device’s low-latency target. Global oversampling or a detailed magnetic model would change both numerical behavior and runtime cost. The chosen approximations leave limits that cannot be removed by increasing the quality selector.

The full listening path remains the test of a setting. Curvature, memory, and gating create character; emphasis and compensation determine how it survives at the output. The servo can restrain glare within its range, but cannot establish whether more saturation belongs in a particular mix.
`,
    ),
  ],
};
