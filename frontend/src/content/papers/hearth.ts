import type { PaperDocument } from "./types";
import cleanGuitarDry from "../../assets/papers/hearth/clean-guitar-dry.mp3";
import cleanGuitarWet from "../../assets/papers/hearth/clean-guitar-wet.mp3";
import drumLoopDry from "../../assets/papers/hearth/drum-loop-dry.mp3";
import drumLoopWet from "../../assets/papers/hearth/drum-loop-wet.mp3";
import hearthPreviewImage from "../../assets/papers/hearth/hearth-1-0-ui.jpg";
import leadVocalDry from "../../assets/papers/hearth/lead-vocal-dry.mp3";
import leadVocalWet from "../../assets/papers/hearth/lead-vocal-wet.mp3";
import sawPadDry from "../../assets/papers/hearth/saw-pad-dry.mp3";
import sawPadWet from "../../assets/papers/hearth/saw-pad-wet.mp3";
export const hearthPaper: PaperDocument = {
    slug: "hearth",
    title: "Hearth: A Pleasantness-Constrained Saturation Device for Max for Live",
    subtitle: "A low-latency audio effect that combines anti-aliased tube saturation, quasi-hysteretic flux memory, transient bloom, and adaptive spectral control.",
    authors: ["Jagger Brulato"],
    date: "2026",
    abstract: "Hearth is a Max for Live saturation device designed for warm, stable harmonic coloration across vocals, guitars, synths, drums, and mix buses. Instead of exposing a generic distortion curve, Hearth uses three cooperating nonlinear lanes supervised by a Warmth Servo that reacts to brightness, roughness, level, and transient density. The device prioritizes low-latency performance, interpretable controls, and musical safety: upper-band drive backs off when the input becomes bright or rough, transient bloom remains time-local, and stereo protection keeps the center image intact. This paper summarizes the research basis, signal path, control surface, and first audio examples behind the Hearth implementation.",
    description: "A technical paper for a Max for Live warm-saturation plugin built from GenExpr, Gen DSP, and a research-backed pleasantness model.",
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
    previewImage: hearthPreviewImage,
    previewAlt: "Hearth 1.0 Max for Live device interface",
    actionLinks: [
        {
            label: "Download Hearth 1.0",
            href: "https://github.com/JBoss925/Hearth/releases/download/v1.0/Hearth.1.0.amxd",
            description: "Max for Live AMXD device"
        }
    ],
    sections: [
        {
            id: "motivation",
            eyebrow: "I",
            title: "Motivation",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Modern saturation plugins increasingly treat warmth as a signal path rather than a single transfer curve. Commercial tools such as Ableton Roar, FabFilter Saturn, Soundtoys Decapitator, Goodhertz Tupe, transformer models, and tape models all show the same broad pattern: shape the spectrum before the nonlinear element, control the dynamics around it, and suppress aliasing enough that the added harmonics read as density instead of digital glare."
                },
                {
                    kind: "paragraph",
                    text: "Hearth takes that lesson but narrows the product goal. It is not meant to be an all-purpose sound-destruction palette. The first release is a live-safe Max for Live device whose default operating region favors body, nostalgia, and low-risk musical coloration. The core question is how much harmonic interest can be added while keeping brightness, roughness, transient damage, and stereo drift under control."
                },
                {
                    kind: "bullets",
                    items: [
                        "Target use cases: vocals, clean guitar, bright synths, drum buses, and full-mix glue.",
                        "Primary constraint: density without roughness.",
                        "Implementation target: one Max for Live audio effect with most DSP in a Gen core."
                    ]
                }
            ],
        },
        {
            id: "architecture",
            eyebrow: "II",
            title: "Signal Architecture",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The Hearth signal path starts with DC filtering and input conditioning, then splits into an analysis bus and a compensated emphasis path. The nonlinear core is built from three lanes: an anti-aliased tube lane, a quasi-hysteretic flux-memory lane, and a transient-gated bloom lane. The lanes are recombined, passed through complementary de-emphasis, corrected for stereo safety, and finally trimmed through a soft safety stage."
                },
                {
                    kind: "graph",
                    graph: {
                        kind: "signal-flow",
                        title: "Hearth processing graph",
                        description: "The analysis bus controls emphasis, lane drive, de-emphasis, and stereo protection without interrupting the main low-latency audio path."
                    }
                },
                {
                    kind: "paragraph",
                    text: "This architecture is intentionally white-box. Each lane has a narrow purpose, and the adaptation layer modifies only a small number of musically meaningful parameters. That makes the device easier to reason about than a broad multiband distortion environment while still being richer than a static waveshaper."
                }
            ],
        },
        {
            id: "tube-lane",
            eyebrow: "III",
            title: "Anti-Aliased Tube Lane",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The tube lane is the main harmonic engine. It uses a smooth saturating transfer with small, controllable asymmetry so that low-order even and odd harmonics can be introduced without the abrupt spectral spread of hard clipping. In the implementation, the quality selector controls the number of internal ADAA evaluations used over the current sample segment."
                },
                {
                    kind: "graph",
                    graph: {
                        kind: "harmonic-profile",
                        title: "Low-order harmonic emphasis",
                        description: "The intended tube contribution is weighted toward second and third harmonics, with higher partials declining quickly."
                    }
                },
                {
                    kind: "equation",
                    label: "Tube input",
                    tex: "u[n] = g[n]x[n] + b[n]",
                    caption: "The tube shaper receives the pre-emphasized sample multiplied by dynamic drive and offset by a slowly moving bias."
                },
                {
                    kind: "paragraph",
                    text: "The lane is normalized around a dynamic bias term. Bias subtraction removes most DC introduced by asymmetry, while the later DC filter and stereo-protect stages handle residual drift. Hearth keeps this lane deliberately low-order; the goal is thickness and curvature, not foldover effects."
                },
                {
                    kind: "equation",
                    label: "Bias-compensated output",
                    tex: "y_T[n] = f_{\\mathrm{ADAA}}(u[n]) - f_{\\mathrm{ADAA}}(b[n])",
                    caption: "Subtracting the transfer evaluated at the bias point keeps asymmetry musically useful without allowing persistent DC to dominate."
                }
            ],
        },
        {
            id: "flux-memory",
            eyebrow: "IV",
            title: "Flux Memory Lane",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The flux lane is not a full tape or transformer model. It is a lighter path-dependent abstraction that gives rising and falling trajectories slightly different behavior. The purpose is to capture some of the audible benefits associated with hysteretic systems, such as attack rounding, denser lower mids, and small return-path differences, without the CPU cost of a high-detail physical model."
                },
                {
                    kind: "equation",
                    label: "Direction-sensitive memory",
                    tex: "m[n] = m[n-1] + \\alpha_{\\mathrm{dir}}(u[n] - m[n-1])",
                    caption: "The memory state approaches the current driven input with a rate selected from the current signal direction."
                },
                {
                    kind: "paragraph",
                    text: "The lane stores a memory variable whose update rate depends on signal direction. A loop-area control blends the memory term into the nonlinear input, while a damping term prevents the memory from turning into an obvious resonant artifact."
                },
                {
                    kind: "equation",
                    label: "Flux output",
                    tex: "y_F[n] = f_{\\mathrm{soft}}(u[n] + h m[n]) - \\eta m[n]",
                    caption: "The hysteresis-inspired memory bends the shaper input, then a damping term keeps the return path controlled."
                }
            ],
        },
        {
            id: "warmth-servo",
            eyebrow: "V",
            title: "Warmth Servo",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The Warmth Servo is Hearth's main product-level differentiator. It watches inexpensive proxies for level, brightness, roughness, and transient density, then applies conservative corrections to the nonlinear core. When brightness or roughness rise, upper-band drive and post-emphasis back off. When the source is dull but peaky, bloom and mild bias can increase. When a bus is already dense, the device leans on flux behavior instead of extra high-band tube drive."
                },
                {
                    kind: "graph",
                    graph: {
                        kind: "servo-response",
                        title: "Upper-band drive response",
                        description: "The servo leaves safe sources mostly unchanged and increasingly attenuates upper-band drive as brightness rises."
                    }
                },
                {
                    kind: "equation",
                    label: "Brightness proxy",
                    tex: "B[n] = \\frac{E_{\\mathrm{high}}[n]}{E_{\\mathrm{low}}[n] + E_{\\mathrm{mid}}[n] + \\epsilon}",
                    caption: "A high-band energy ratio acts as a cheap proxy for spectral centroid and perceived brightness."
                },
                {
                    kind: "paragraph",
                    text: "The servo is intentionally slow and bounded. It should feel like good gain staging and tone placement, not like an obvious modulation effect."
                },
                {
                    kind: "equation",
                    label: "Servo gain",
                    tex: "G_{\\mathrm{upper}}[n] = 1 - A \\cdot \\sigma(B[n] - B_0) - R \\cdot \\sigma(\\rho[n] - \\rho_0)",
                    caption: "Upper-band drive is reduced when brightness or roughness exceed their comfort thresholds."
                }
            ],
        },
        {
            id: "controls",
            eyebrow: "VI",
            title: "Macro-First Interface",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Hearth is deliberately macro-first. The Hearth knob is the primary control: it moves the device into a warm operating region quickly, then the surrounding controls handle source-specific refinement."
                },
                {
                    kind: "paragraph",
                    text: "That structure keeps the first move musical instead of technical. A user can decide how present the effect should be, then adjust brightness, density, stereo safety, or level only when the material calls for it."
                },
                {
                    kind: "bullets",
                    items: [
                        "The main macro reduces auditioning friction by making the effect more or less present with one gesture.",
                        "The underlying lanes and Warmth Servo stay available, but they do not become the starting point.",
                        "The same workflow works across vocals, guitars, synths, and buses before finer source-specific adjustments."
                    ]
                }
            ],
        },
        {
            id: "implementation",
            eyebrow: "VII",
            title: "Max for Live Implementation",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The repository contains the Max for Live wrapper, a generated Gen DSP patch, the source GenExpr file, and a build script that regenerates the Max files from the source implementation. The practical loading flow is to open Hearth.maxpat in Max 10 or newer, keep Hearth-Core.gendsp in the same folder, save the patch as a Max Audio Effect, and drop the resulting device into an Ableton Live audio track."
                },
                {
                    kind: "paragraph",
                    text: "Keeping the DSP in Gen gives the device a compact runtime path and makes the source suitable for direct review. The wrapper can remain focused on controls, preset handling, metering, and future visualization while the audio behavior stays centralized in the GenExpr core."
                },
                {
                    kind: "bullets",
                    items: [
                        "Hearth.maxpat: Max for Live audio-effect wrapper.",
                        "Hearth-Core.gendsp: generated Gen DSP patch.",
                        "hearth_core.genexpr: source DSP implementation.",
                        "tools/build_max_files.js: rebuild script for generated Max files."
                    ]
                }
            ],
        },
        {
            id: "ui-controls",
            eyebrow: "VIII",
            title: "Interface Controls",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Hearth's interface is organized around the order in which the audio is shaped: input and emphasis first, density lanes second, adaptive tone control third, and final blend/output controls last. The labels are intentionally plain because the device should be playable in a Live set without asking the user to think like the implementation."
                },
                {
                    kind: "paragraph",
                    text: "The controls are also grouped by risk. The left side contains source preparation and the main warmth macro. The center contains the more characterful nonlinear lanes. The right side contains the adaptive guard rails, wet/dry blend, output level, and safety-oriented options that keep the device usable on full tracks and buses."
                },
                {
                    kind: "bullets",
                    items: [
                        "Input dB: sets the level entering the analysis and nonlinear core, making gain staging explicit before saturation.",
                        "Hearth: acts as the main macro, raising drive, emphasis, and relaxed saturation behavior together while staying inside the warmth-first operating range.",
                        "Body dB: biases the compensated emphasis toward low-mid density so the nonlinear stage generates body instead of only post-EQ volume.",
                        "Bias: trims asymmetry in the tube lane, adding controlled even-order color while the downstream DC handling prevents drift.",
                        "Bloom: controls transient-only parallel saturation for attack rounding and perceived size without flattening the whole signal.",
                        "Flux: sets the quasi-hysteretic memory lane amount, adding path-dependent density and subtle return behavior.",
                        "Patina: adds optional texture and stays at zero by default so clean bus processing remains safe.",
                        "Adapt: controls Warmth Servo authority; higher values let brightness and roughness analysis steer drive and de-emphasis more strongly.",
                        "Dyn: sets program-dependent relaxation so the saturation responds to level instead of behaving like a fixed clipper.",
                        "Recovery: controls the return time for dynamic relaxation and memory behavior.",
                        "Velvet: increases upper-band softening, reducing glare when harmonic content starts to feel sharp.",
                        "Detail: restores controlled presence after the warm path so the output stays intelligible instead of merely darker.",
                        "Stereo: protects the center image and side balance when the device is used on stereo material.",
                        "Quality: selects the local anti-aliasing depth for the tube lane: Eco, Live, or High.",
                        "Mix, Output dB, and Auto: handle final parallel blend, level matching, and loudness-bias control while auditioning."
                    ]
                }
            ],
        },
        {
            id: "audio-samples",
            eyebrow: "IX",
            title: "Audio Samples",
            blocks: [
                {
                    kind: "paragraph",
                    text: "These wet/dry examples use matched clips from the Hearth 1.0 release. Each player starts the dry and processed buffers together, then switches the audible source with the toggle."
                },
                {
                    kind: "audio-samples"
                }
            ]
        }
    ],
    audioSamples: [
        {
            label: "Vocal body and sibilance",
            source: "Lead vocal",
            drySrc: leadVocalDry,
            wetSrc: leadVocalWet,
            durationSeconds: 16
        },
        {
            label: "Picked guitar transient rounding",
            source: "Clean guitar DI",
            drySrc: cleanGuitarDry,
            wetSrc: cleanGuitarWet,
            durationSeconds: 16
        },
        {
            label: "Bright synth restraint",
            source: "Saw pad",
            drySrc: sawPadDry,
            wetSrc: sawPadWet,
            durationSeconds: 16
        },
        {
            label: "Drum bus bloom",
            source: "Full drum loop",
            drySrc: drumLoopDry,
            wetSrc: drumLoopWet,
            durationSeconds: 14
        }
    ]
};
