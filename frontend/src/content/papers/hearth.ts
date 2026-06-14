import type { PaperDocument } from "./types";

export const hearthPaper: PaperDocument = {
  slug: "hearth",
  title: "Hearth: A Pleasantness-Constrained Saturation Device for Max for Live",
  subtitle:
    "A low-latency audio effect that combines anti-aliased tube saturation, quasi-hysteretic flux memory, transient bloom, and adaptive spectral control.",
  authors: ["Jagger Brulato"],
  date: "2026",
  abstract:
    "Hearth is a Max for Live saturation device designed for warm, stable harmonic coloration across vocals, guitars, synths, drums, and mix buses. Instead of exposing a generic distortion curve, Hearth uses three cooperating nonlinear lanes supervised by a Warmth Servo that reacts to brightness, roughness, level, and transient density. The device prioritizes low-latency performance, interpretable controls, and musical safety: upper-band drive backs off when the input becomes bright or rough, transient bloom remains time-local, and stereo protection keeps the center image intact. This paper summarizes the research basis, signal path, feature model, and validation plan behind the first Hearth implementation.",
  description:
    "A technical paper for a Max for Live warm-saturation plugin built from GenExpr, Gen DSP, and a research-backed pleasantness model.",
  categories: ["Audio DSP", "Max for Live", "Research Notes"],
  tags: [
    "Audio DSP",
    "Saturation",
    "Max for Live",
    "GenExpr",
    "ADAA",
    "Hysteresis",
    "Psychoacoustics"
  ],
  repoUrl: "https://github.com/JBoss925/Hearth",
  previewAlt: "Hearth paper preview showing a signal path and warm saturation transfer curve",
  sections: [
    {
      id: "motivation",
      eyebrow: "I",
      title: "Motivation",
      paragraphs: [
        "Modern saturation plugins increasingly treat warmth as a signal path rather than a single transfer curve. Commercial tools such as Ableton Roar, FabFilter Saturn, Soundtoys Decapitator, Goodhertz Tupe, transformer models, and tape models all show the same broad pattern: shape the spectrum before the nonlinear element, control the dynamics around it, and suppress aliasing enough that the added harmonics read as density instead of digital glare.",
        "Hearth takes that lesson but narrows the product goal. It is not meant to be an all-purpose sound-destruction palette. The first release is a live-safe Max for Live device whose default operating region favors body, nostalgia, and low-risk musical coloration. The core question is how much harmonic interest can be added while keeping brightness, roughness, transient damage, and stereo drift under control."
      ],
      bullets: [
        "Target use cases: vocals, clean guitar, bright synths, drum buses, and full-mix glue.",
        "Primary constraint: density without roughness.",
        "Implementation target: one Max for Live audio effect with most DSP in a Gen core."
      ]
    },
    {
      id: "architecture",
      eyebrow: "II",
      title: "Signal Architecture",
      paragraphs: [
        "The Hearth signal path starts with DC filtering and input conditioning, then splits into an analysis bus and a compensated emphasis path. The nonlinear core is built from three lanes: an anti-aliased tube lane, a quasi-hysteretic flux-memory lane, and a transient-gated bloom lane. The lanes are recombined, passed through complementary de-emphasis, corrected for stereo safety, and finally trimmed through a soft safety stage.",
        "This architecture is intentionally white-box. Each lane has a narrow purpose, and the adaptation layer modifies only a small number of musically meaningful parameters. That makes the device easier to reason about than a broad multiband distortion environment while still being richer than a static waveshaper."
      ],
      graph: {
        kind: "signal-flow",
        title: "Hearth processing graph",
        description:
          "The analysis bus controls emphasis, lane drive, de-emphasis, and stereo protection without interrupting the main low-latency audio path."
      }
    },
    {
      id: "tube-lane",
      eyebrow: "III",
      title: "Anti-Aliased Tube Lane",
      paragraphs: [
        "The tube lane is the main harmonic engine. It uses a smooth saturating transfer with small, controllable asymmetry so that low-order even and odd harmonics can be introduced without the abrupt spectral spread of hard clipping. In the implementation, the quality selector controls the number of internal ADAA evaluations used over the current sample segment.",
        "The lane is normalized around a dynamic bias term. Bias subtraction removes most DC introduced by asymmetry, while the later DC filter and stereo-protect stages handle residual drift. Hearth keeps this lane deliberately low-order; the goal is thickness and curvature, not foldover effects."
      ],
      equations: [
        {
          label: "Tube input",
          tex: "u[n] = g[n]x[n] + b[n]",
          caption:
            "The tube shaper receives the pre-emphasized sample multiplied by dynamic drive and offset by a slowly moving bias."
        },
        {
          label: "Bias-compensated output",
          tex: "y_T[n] = f_{\\mathrm{ADAA}}(u[n]) - f_{\\mathrm{ADAA}}(b[n])",
          caption:
            "Subtracting the transfer evaluated at the bias point keeps asymmetry musically useful without allowing persistent DC to dominate."
        }
      ],
      graph: {
        kind: "harmonic-profile",
        title: "Low-order harmonic emphasis",
        description:
          "The intended tube contribution is weighted toward second and third harmonics, with higher partials declining quickly."
      }
    },
    {
      id: "flux-memory",
      eyebrow: "IV",
      title: "Flux Memory Lane",
      paragraphs: [
        "The flux lane is not a full tape or transformer model. It is a lighter path-dependent abstraction that gives rising and falling trajectories slightly different behavior. The purpose is to capture some of the audible benefits associated with hysteretic systems, such as attack rounding, denser lower mids, and small return-path differences, without the CPU cost of a high-detail physical model.",
        "The lane stores a memory variable whose update rate depends on signal direction. A loop-area control blends the memory term into the nonlinear input, while a damping term prevents the memory from turning into an obvious resonant artifact."
      ],
      equations: [
        {
          label: "Direction-sensitive memory",
          tex: "m[n] = m[n-1] + \\alpha_{\\mathrm{dir}}(u[n] - m[n-1])",
          caption:
            "The memory state approaches the current driven input with a rate selected from the current signal direction."
        },
        {
          label: "Flux output",
          tex: "y_F[n] = f_{\\mathrm{soft}}(u[n] + h m[n]) - \\eta m[n]",
          caption:
            "The hysteresis-inspired memory bends the shaper input, then a damping term keeps the return path controlled."
        }
      ]
    },
    {
      id: "warmth-servo",
      eyebrow: "V",
      title: "Warmth Servo",
      paragraphs: [
        "The Warmth Servo is Hearth's main product-level differentiator. It watches inexpensive proxies for level, brightness, roughness, and transient density, then applies conservative corrections to the nonlinear core. When brightness or roughness rise, upper-band drive and post-emphasis back off. When the source is dull but peaky, bloom and mild bias can increase. When a bus is already dense, the device leans on flux behavior instead of extra high-band tube drive.",
        "The servo is intentionally slow and bounded. It should feel like good gain staging and tone placement, not like an obvious modulation effect."
      ],
      equations: [
        {
          label: "Brightness proxy",
          tex: "B[n] = \\frac{E_{\\mathrm{high}}[n]}{E_{\\mathrm{low}}[n] + E_{\\mathrm{mid}}[n] + \\epsilon}",
          caption:
            "A high-band energy ratio acts as a cheap proxy for spectral centroid and perceived brightness."
        },
        {
          label: "Servo gain",
          tex: "G_{\\mathrm{upper}}[n] = 1 - A \\cdot \\sigma(B[n] - B_0) - R \\cdot \\sigma(\\rho[n] - \\rho_0)",
          caption:
            "Upper-band drive is reduced when brightness or roughness exceed their comfort thresholds."
        }
      ],
      graph: {
        kind: "servo-response",
        title: "Upper-band drive response",
        description:
          "The servo leaves safe sources mostly unchanged and increasingly attenuates upper-band drive as brightness rises."
      }
    },
    {
      id: "controls",
      eyebrow: "VI",
      title: "Controls and Feature Mapping",
      paragraphs: [
        "Hearth exposes a macro-first interface. The main Hearth control increases drive, emphasis depth, and mild sag while leaving the adaptive guard rails active. Body targets lower-mid density, Velvet increases high-band softening, Bloom controls transient-only parallel saturation, Flux controls the path-dependent lane, and Adapt sets the servo authority.",
        "The current GenExpr implementation includes DC filtering, input conditioning, brightness and roughness analysis, level and transient analysis, compensated low-mid and presence emphasis, ADAA-style atan saturation, quasi-hysteretic flux memory, transient bloom, stereo protection, auto trim, patina, mix, output trim, and final safety saturation. Quality selects local tube-lane anti-aliasing depth: Eco uses one ADAA evaluation, Live uses two internal points, and High uses four internal points over the current sample segment."
      ],
      bullets: [
        "Hearth: macro drive, emphasis, and sag.",
        "Body: low-mid target around the warmth region.",
        "Velvet: upper-band softening and de-emphasis.",
        "Bloom: transient-only parallel density.",
        "Flux: quasi-hysteretic path dependence.",
        "Adapt: Warmth Servo authority.",
        "Quality: local anti-aliasing depth without full-device oversampling."
      ]
    },
    {
      id: "implementation",
      eyebrow: "VII",
      title: "Max for Live Implementation",
      paragraphs: [
        "The repository contains the Max for Live wrapper, a generated Gen DSP patch, the source GenExpr file, and a build script that regenerates the Max files from the source implementation. The practical loading flow is to open Hearth.maxpat in Max 10 or newer, keep Hearth-Core.gendsp in the same folder, save the patch as a Max Audio Effect, and drop the resulting device into an Ableton Live audio track.",
        "Keeping the DSP in Gen gives the device a compact runtime path and makes the source suitable for direct review. The wrapper can remain focused on controls, preset handling, metering, and future visualization while the audio behavior stays centralized in the GenExpr core."
      ],
      bullets: [
        "Hearth.maxpat: Max for Live audio-effect wrapper.",
        "Hearth-Core.gendsp: generated Gen DSP patch.",
        "hearth_core.genexpr: source DSP implementation.",
        "tools/build_max_files.js: rebuild script for generated Max files."
      ]
    },
    {
      id: "validation",
      eyebrow: "VIII",
      title: "Validation Plan",
      paragraphs: [
        "The useful validation target is not only whether Hearth saturates. It must remain musically stable across sources. The first test corpus should include sibilant vocal, clean picked guitar, bright synth pad, mono bass, close snare, full drum bus, and a full-mix excerpt. Each sample should be evaluated for added body, preserved intelligibility, controlled brightness, transient rounding, and mono compatibility.",
        "The website presentation is prepared for before-and-after listening examples. Once audio is available, each sample slot can be replaced with source and processed media without changing the paper structure."
      ]
    }
  ],
  audioSamples: [
    { label: "Vocal body and sibilance", source: "Lead vocal", status: "planned" },
    { label: "Picked guitar transient rounding", source: "Clean guitar DI", status: "planned" },
    { label: "Bright synth restraint", source: "Saw pad", status: "planned" },
    { label: "Drum bus bloom", source: "Full drum loop", status: "planned" }
  ]
};
