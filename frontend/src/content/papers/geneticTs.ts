import geneticPreview from "../../assets/genetic-preview.jpg";
import type { PaperDocument } from "./types";
export const geneticTsPaper: PaperDocument = {
    slug: "genetic-ts",
    title: "Genetic Algorithms in TypeScript: An Interactive Launch Optimizer",
    subtitle: "A browser simulation where a population of launch velocities evolves under Matter.js physics, wind, gravity, mutation, and draggable targets.",
    authors: ["Jagger Brulato"],
    date: "2026",
    abstract: "Genetic Algorithms in TypeScript is an interactive simulation that evolves launch velocities for a ball trying to hit a target in a bounded physics scene. Each genome is a two-dimensional initial velocity. The simulator evaluates a generation by replaying every genome through Matter.js, scoring hits, minimum distance, and path behavior, then breeding the next generation through elitism, rank-biased parent selection, blend crossover, mutation, and random resets. The UI exposes the important algorithm and environment parameters so the reader can see convergence change when gravity, wind, population size, mutation rate, elite share, target size, or the target position changes.",
    description: "A technical paper for an interactive genetic algorithm system that evolves projectile launch velocities under configurable physics.",
    categories: ["Simulation", "Systems", "Research Notes"],
    tags: ["TypeScript", "Genetic Algorithms", "Matter.js", "Simulation", "Physics", "Visualization"],
    repoUrl: "https://github.com/JBoss925/GeneticTS",
    previewImage: geneticPreview,
    previewAlt: "Genetic Algorithms in TypeScript simulation preview",
    previewCaption: "GeneticTS simulation preview. A population of launch velocities is evaluated through a physics scene and evolved toward a moving target.",
    actionLinks: [
        {
            label: "Open Demo",
            href: "/genetic-ts",
            description: "Run the interactive genetic algorithm simulation"
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
                    text: "The system makes a genetic algorithm observable. Instead of optimizing an abstract score in a console, every candidate is a launch trajectory. The interface exposes the best path, ghost attempts, draggable target position, and configurable physics while the population adapts."
                },
                {
                    kind: "paragraph",
                    text: "That makes the optimizer both an algorithm and a debugging surface. Selection pressure, mutation rate, population size, and environmental difficulty are usually hidden inside algorithm logs. Here, each setting changes the shape of the paths on screen."
                },
                {
                    kind: "bullets",
                    items: [
                        "Genome: a two-dimensional launch velocity.",
                        "Environment: Matter.js physics with walls, gravity, wind, restitution, and drag.",
                        "Goal: evolve enough successful launch attempts to satisfy a solved streak."
                    ]
                }
            ],
        },
        {
            id: "fitness",
            eyebrow: "II",
            title: "Genome Evaluation and Fitness",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Each genome is evaluated by creating a fresh Matter.js engine, placing the ball at the launch point, applying the genome as initial velocity, and stepping the world for a fixed number of frames. During the replay, the simulator records the path, the minimum distance to the target, whether the ball hit the target, and when the hit occurred."
                },
                {
                    kind: "equation",
                    label: "Genome",
                    tex: "g = (v_x, v_y)",
                    caption: "A candidate solution is only the initial x and y velocity applied to the ball."
                },
                {
                    kind: "paragraph",
                    text: "The fitness function strongly rewards hits, especially early hits. Misses are still ranked by closeness, with a small travel-distance tie breaker so that useful motion beats a static failure."
                },
                {
                    kind: "equation",
                    label: "Miss score",
                    tex: "F_{\\mathrm{miss}} = \\frac{5000}{1 + d_{\\min}} + 0.0025\\min(L, 900)",
                    caption: "Unsuccessful attempts are scored by closest approach plus a small path-length tie breaker."
                },
                {
                    kind: "equation",
                    label: "Hit score",
                    tex: "F_{\\mathrm{hit}} = 10000 + 18(T - t_{\\mathrm{hit}})",
                    caption: "Successful attempts dominate misses, and faster hits rank above slower hits."
                }
            ],
        },
        {
            id: "physics-model",
            eyebrow: "III",
            title: "Physics Model and Termination",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The simulator treats every candidate as a deterministic rollout in the same bounded world. A Matter.js engine is constructed per genome, gravity and wind are combined into one field vector, four walls are inserted with restitution, and the ball is launched from a fixed point. The engine advances at 60 Hz until the candidate hits the target, exhausts the frame budget, settles on the floor, or bounces enough times that the attempt no longer carries useful search information."
                },
                {
                    kind: "equation",
                    label: "Net field",
                    tex: "\\vec{a} = (0, g) + w(\\cos\\theta, \\sin\\theta)",
                    caption: "Gravity strength and wind controls combine into the acceleration field assigned to the Matter.js engine."
                },
                {
                    kind: "diagram",
                    label: "Evaluation loop",
                    body: `genome (vx, vy)
  |
  v
fresh Matter.js engine
  |
  v
apply net field + walls + ball velocity
  |
  v
step frames -> record path, distance, contacts
  |
  +-- target overlap -> hit score
  +-- rest / bounce / frame cap -> miss score`,
                    caption: "Each genome receives an isolated physics replay so cross-candidate state cannot leak into fitness."
                },
                {
                    kind: "equation",
                    label: "Target overlap",
                    tex: "d_t = \\lVert p_t - q \\rVert_2 - (r_{target} + r_{ball})",
                    caption: "A hit occurs when the signed clearance between the ball center and target center is non-positive."
                },
                {
                    kind: "paragraph",
                    text: "The default frame budget is 200 steps. Rest detection stops attempts that reach the floor with velocity below the configured tolerance for consecutive frames. Wall-contact counting stops degenerate attempts that repeatedly bounce around the boundary instead of expressing a useful launch strategy."
                }
            ],
        },
        {
            id: "state-schema",
            eyebrow: "IV",
            title: "State and Configuration Schema",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The simulation state can be reconstructed from four groups of data: immutable scene bounds, mutable configuration, target state, and population state. The engine does not store hidden physics state between generations; every genome evaluation creates a new Matter.js world."
                },
                {
                    kind: "example",
                    label: "Core state",
                    language: "typescript",
                    code: `type VelocityGenome = { vx: number; vy: number };
type Target = { x: number; y: number; radius: number };

type GeneticSimulationState = {
  seed: number;
  generation: number;
  target: Target;
  population: VelocityGenome[];
  solvedStreak: number;
  bestEverFitness: number;
  lastSummary: GenerationSummary;
};`,
                    caption: "The persistent state contains only the data needed to evaluate the next generation and render the current one."
                },
                {
                    kind: "example",
                    label: "Default configuration",
                    language: "text",
                    code: `populationSize = 42
targetRadius = 22
gravityStrength = 0.98
ballRadius = 12
windDirection = -18 degrees
windMagnitude = 0.18
mutationRate = 0.18
elitePercent = 18
attemptFrames = 200
successStreakTarget = 3
ghostCount = 5`,
                    caption: "These defaults define the baseline search space and solved condition."
                },
                {
                    kind: "equation",
                    label: "Simulation bounds",
                    tex: "\\Omega = [0,760] \\times [0,460],\\quad q_0=(84,368)",
                    caption: "The launch point q0 and rectangular bounds define the coordinate system for targets and paths."
                }
            ],
        },
        {
            id: "evolution",
            eyebrow: "V",
            title: "Selection, Crossover, and Mutation",
            blocks: [
                {
                    kind: "paragraph",
                    text: "After evaluation, attempts are sorted by descending fitness. A configurable elite share is copied directly into the next generation. Parents are chosen from the top portion of the ranked population using a rank-biased picker, so stronger attempts are more likely to breed without making the population entirely deterministic."
                },
                {
                    kind: "equation",
                    label: "Blend crossover",
                    tex: "g_c = \\lambda g_a + (1-\\lambda)g_b, \\quad \\lambda \\in [0.28, 0.72]",
                    caption: "Child velocity is a weighted blend of two parent launch velocities."
                },
                {
                    kind: "paragraph",
                    text: "Children are generated by blending parent velocities, then applying random jitter with probability equal to the mutation rate. A small random-reset group is added each generation to preserve exploration when the current population converges too narrowly."
                },
                {
                    kind: "equation",
                    label: "Mutation",
                    tex: "g'_c = g_c + (\\epsilon_x, \\epsilon_y)",
                    caption: "When mutation fires, velocity jitter is scaled by the current wind and gravity settings."
                },
                {
                    kind: "bullets",
                    items: [
                        "Elite share defaults to 18% and is clamped to preserve at least two elites.",
                        "The parent pool includes at least the elite set plus extra high-ranking attempts.",
                        "Random resets occupy about 8% of the population.",
                        "Velocity bounds keep candidate launches inside a useful range."
                    ]
                }
            ],
        },
        {
            id: "algorithm",
            eyebrow: "VI",
            title: "Evolution Algorithm",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The implemented algorithm is a compact elitist genetic search over a continuous two-dimensional genome. It is not a symbolic planner and it does not analytically solve the projectile equation. The only objective signal comes from simulated rollouts."
                },
                {
                    kind: "example",
                    label: "Generation step",
                    language: "text",
                    code: `evaluate every genome
sort attempts by descending fitness
copy elite attempts directly
while population is not full:
  pick two parents from the ranked parent pool
  blend their velocity vectors
  optionally jitter vx and vy
  clamp velocity bounds
append a small random-reset tail
evaluate the next generation`,
                    caption: "The algorithm preserves strong candidates, samples the ranked frontier, and keeps an explicit exploration tail."
                },
                {
                    kind: "equation",
                    label: "Elite count",
                    tex: "E = \\operatorname{clamp}\\left(\\operatorname{round}\\left(\\frac{e}{100}N\\right), 2, N-1\\right)",
                    caption: "The elite percentage is converted into an integer count while preserving at least two elites and at least one non-elite slot."
                },
                {
                    kind: "equation",
                    label: "Rank-biased index",
                    tex: "i = \\left\\lfloor U^{1.7}\\,|P| \\right\\rfloor,\\quad U \\sim \\mathcal{U}(0,1)",
                    caption: "Exponentiating the random source biases parent selection toward the front of the sorted parent pool without making parent choice deterministic."
                },
                {
                    kind: "paragraph",
                    text: "Random resets occupy roughly eight percent of the next population. This matters in a draggable interactive scene because the target or field can move abruptly; a converged population near the old solution should not be the only genetic material available for the new problem."
                }
            ],
        },
        {
            id: "target-constraints",
            eyebrow: "VII",
            title: "Target Constraints and Reconfiguration",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The target is constrained so the search problem remains valid and the controls remain usable. Its x coordinate must stay to the right of the launcher by a fixed minimum, its radius must fit inside the stage, and it must avoid the wind panel region so the draggable target does not overlap UI instrumentation."
                },
                {
                    kind: "equation",
                    label: "Target domain",
                    tex: "x \\in [\\max(q_{0x}+120, inset+r),\\; W-inset-r],\\quad y \\in [inset+r,\\; H-inset-r]",
                    caption: "The target domain is the stage rectangle shrunk by radius and safe inset, with an additional x-distance constraint from the launch point."
                },
                {
                    kind: "diagram",
                    label: "Reconfiguration path",
                    body: `control change or drag
  |
  v
copy ranked genomes from previous summary
  |
  v
resize population to new populationSize
  |
  v
clamp target to legal bounds
  |
  v
evaluate immediately under new config
  |
  v
reset solved streak`,
                    caption: "Interactive changes preserve useful genetic material where possible while invalidating solved-state history."
                },
                {
                    kind: "paragraph",
                    text: "Population resizing is rank-preserving. If the population shrinks, the highest-ranked genomes survive. If it grows, new random genomes are appended. That gives configuration changes continuity without pretending old convergence statistics still apply."
                }
            ],
        },
        {
            id: "interaction",
            eyebrow: "VIII",
            title: "Interactive Controls",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The UI is built around parameters that visibly affect convergence. Population size changes the amount of search per generation. Mutation rate controls exploration. Elite share controls exploitation. Gravity, wind direction, wind magnitude, ball size, and target size change the underlying physics problem."
                },
                {
                    kind: "paragraph",
                    text: "Changing a control reconfigures the simulation immediately. The existing ranked genomes are resized where possible, the target is clamped back into valid bounds, and the population starts adapting under the new conditions."
                },
                {
                    kind: "bullets",
                    items: [
                        "Drag the target to make the population solve a new point.",
                        "Change gravity and wind to alter the field forces.",
                        "Pause, reroll, and reset controls let the reader compare convergence behavior.",
                        "Ghost paths show top attempts beyond the single best trajectory."
                    ]
                }
            ],
        },
        {
            id: "convergence",
            eyebrow: "IX",
            title: "Convergence Criteria and Observability",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The simulator separates a lucky hit from a solved field. A generation is considered generation-solved only when the hit rate reaches the configured threshold. The overall scene is solved only after that condition holds for the configured number of consecutive generations."
                },
                {
                    kind: "equation",
                    label: "Generation solved predicate",
                    tex: "\\operatorname{solvedGen}(G) = \\frac{|\\{a \\in G : a.hit\\}|}{N} \\ge 0.75",
                    caption: "The default solved predicate requires at least 75% of the generation to hit the target."
                },
                {
                    kind: "equation",
                    label: "Solved streak",
                    tex: "s_t = \\begin{cases}s_{t-1}+1 & \\operatorname{solvedGen}(G_t)\\\\0 & \\text{otherwise}\\end{cases}",
                    caption: "A scene is solved when the solved streak reaches the configured success-streak target."
                },
                {
                    kind: "paragraph",
                    text: "The rendered surface exposes the state variables that matter: generation number, hit rate, best minimum distance, solved streak, current target, best trajectory, ghost trajectories, wind vector, and launch velocity. The visualization is not decorative; it is the diagnostic layer for the search process."
                }
            ],
        },
        {
            id: "implementation",
            eyebrow: "X",
            title: "Implementation Shape",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The implementation keeps the genetic algorithm in a pure simulation module and the visual playback in the React page. That separation matters because the evolution loop can be tested independently from the animated presentation."
                },
                {
                    kind: "paragraph",
                    text: "A deterministic Mulberry32 random source is used per seed and generation. That makes a generation reproducible without removing the user's ability to reroll targets or change the environment."
                },
                {
                    kind: "bullets",
                    items: [
                        "simulation.ts owns genomes, population state, target bounds, evaluation, breeding, and reconfiguration.",
                        "GeneticTsPage.tsx owns controls, SVG rendering, path playback, dragging, and replay timing.",
                        "Matter.js provides collision, gravity, walls, restitution, and ball motion.",
                        "The browser route embeds the simulation as a first-class interactive system."
                    ]
                }
            ],
        },
        {
            id: "rendering-replay",
            eyebrow: "XI",
            title: "Rendering and Replay Mechanics",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Rendering is a projection of evaluated simulation data, not a second simulation. The best path and ghost paths are already produced during fitness evaluation. The UI converts those point arrays into SVG polylines and animates the ball by stepping through the best path at a fixed replay rate."
                },
                {
                    kind: "equation",
                    label: "Replay frame",
                    tex: "p_{display}(t)=path_{\\lfloor \\alpha t \\rfloor \\bmod |path|}",
                    caption: "The displayed ball samples the evaluated best path using a replay-speed coefficient alpha."
                },
                {
                    kind: "example",
                    label: "SVG projection",
                    language: "text",
                    code: `bestAttempt.path -> highlighted polyline
topAttempts[1..ghostCount] -> translucent ghost polylines
bestAttempt.genome -> launch velocity arrow
target -> draggable circle and hit halo
wind config -> wind vector panel
summary -> generation/hit/min-distance stats`,
                    caption: "All visual layers are derived from the current simulation summary and configuration."
                },
                {
                    kind: "paragraph",
                    text: "Because rendering is derived from stored attempts, pausing the animation does not pause the optimizer state itself. It only stops the visible replay on the selected best trajectory."
                }
            ],
        },
        {
            id: "results",
            eyebrow: "XII",
            title: "Results and Design Properties",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The completed system demonstrates a stable browser-native evolutionary optimizer whose fitness signal is generated by a real physics engine rather than a hand-written parabola. The model supports target dragging, immediate parameter changes, deterministic seeded generations, replayable best paths, and visible population diversity without requiring a server process."
                },
                {
                    kind: "paragraph",
                    text: "The main technical result is not that a genetic algorithm can find a projectile velocity; the analytic problem is simpler than that. The result is an inspectable optimization surface where selection pressure, mutation, random resets, field forces, boundary collisions, and solved predicates are all observable in one interface."
                },
                {
                    kind: "bullets",
                    items: [
                        "The genome is minimal: two velocity scalars are sufficient to produce rich trajectory behavior.",
                        "The fitness function is discontinuous at target contact, which creates a clear separation between near misses and hits.",
                        "The 75% hit-rate solved predicate avoids declaring success from a single lucky candidate.",
                        "The visual replay layer makes convergence auditable through paths, ghost attempts, hit count, and target distance."
                    ]
                }
            ],
        }
    ],
    audioSamples: []
};
