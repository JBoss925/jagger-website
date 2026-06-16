import geneticPreview from "../../assets/genetic-preview.jpg";
import type { PaperDocument } from "./types";
export const geneticTsPaper: PaperDocument = {
    slug: "genetic-ts",
    title: "Genetic Algorithms in TypeScript: An Interactive Launch Optimizer",
    subtitle: "A browser simulation where a population of launch velocities evolves under Matter.js physics, wind, gravity, mutation, and draggable targets.",
    authors: ["Jagger Brulato"],
    date: "2026",
    abstract: "Genetic Algorithms in TypeScript is an interactive simulation that evolves launch velocities for a ball trying to hit a target in a bounded physics scene. Each genome is a two-dimensional initial velocity. The simulator evaluates a generation by replaying every genome through Matter.js, scoring hits, minimum distance, and path behavior, then breeding the next generation through elitism, rank-biased parent selection, blend crossover, mutation, and random resets. The UI exposes the important algorithm and environment parameters so the reader can see convergence change when gravity, wind, population size, mutation rate, elite share, target size, or the target position changes.",
    description: "A technical paper for an interactive genetic algorithm demo that evolves projectile launch velocities under configurable physics.",
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
                    text: "The project turns a genetic algorithm into something visible. Instead of optimizing an abstract score in a console, every candidate is a launch trajectory. The reader can watch the best path, see ghost attempts, drag the target, and change the physics while the population adapts."
                },
                {
                    kind: "paragraph",
                    text: "That makes it useful as both a demo and a debugging surface. Selection pressure, mutation rate, population size, and environmental difficulty are usually hidden inside algorithm logs. Here, each setting changes the shape of the paths on screen."
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
            id: "evolution",
            eyebrow: "III",
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
            id: "interaction",
            eyebrow: "IV",
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
            id: "implementation",
            eyebrow: "V",
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
                        "The site route embeds the simulation as a first-class portfolio demo."
                    ]
                }
            ],
        },
        {
            id: "takeaways",
            eyebrow: "VI",
            title: "Technical Takeaways",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The demo works because the optimization target is understandable. A user does not need to know genetic algorithms to see the population improve from bad trajectories to accurate launches."
                },
                {
                    kind: "paragraph",
                    text: "The broader lesson is that algorithm demos benefit from direct manipulation. When the reader can drag the target or change the physics and see the population recover, the algorithm becomes less like a black box and more like a system with observable pressure."
                },
                {
                    kind: "bullets",
                    items: [
                        "Genetic algorithms are easiest to teach when fitness is visual.",
                        "Interactive parameter changes expose the exploration/exploitation tradeoff.",
                        "A small, well-scoped genome can still produce rich emergent behavior."
                    ]
                }
            ],
        }
    ],
    audioSamples: []
};
