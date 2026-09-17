import { chapter, type NarrativePlan } from "./types";
export const geneticTsNarrative: NarrativePlan = {
  name: "GeneticTS",
  subtitle:
    "An interactive genetic algorithm that evolves launch velocities in a physics scene.",
  abstract:
    "GeneticTS is an interactive genetic algorithm that searches for launch velocities in a two-dimensional physics scene. Each candidate runs in an isolated Matter.js world, with fitness based on closest approach for misses and arrival time for hits. Rank-biased selection, elite retention, blended offspring, mutation, and random resets balance retention with exploration. Stored trajectories drive playback and expose population diversity without rerunning evaluation. Seeded breeding supports repeatable comparisons, and sustained population hit rate determines solved status. The simulation makes adaptation after scene changes observable, while limiting the search to initial velocity and paying the cost of a fresh physics world for each candidate.",
  sections: [
    chapter(
      "motivation",
      "A Population of Shots",
      `
GeneticTS evolves a ball’s launch velocity in a Matter.js scene. Trajectories make the search visible: near misses, successful families, and adaptation after the target moves can be compared with the fitness scores.

The genome contains only horizontal and vertical initial velocity. Physics determines the rest of each attempt; there is no mid-flight steering or action sequence. That small search space keeps the relationship between breeding and trajectory changes visible.

The project is an interactive view of selection and adaptation, not an argument that evolution is the best solver for every shot. Its evaluation needs enough consistency for a change in fitness to reflect the candidate rather than leftover physics state.
`,
    ),
    chapter(
      "physics-model",
      "Physics Evaluation",
      `
Each genome runs in a fresh Matter.js world with identical bounds, ball, target, and field settings. Fixed 1/60-second steps produce a stored trajectory and target-overlap result, independently of playback.

Rebuilding the world per candidate avoids inherited collision and sleeping state, at a higher evaluation cost than object reuse. Rollouts are bounded by a frame budget and can terminate on a hit, floor settling, or repeated bounces. Those stopping rules are part of the fitness evaluation, not just performance shortcuts.
`,
    ),
    chapter(
      "fitness",
      "The Value of a Near Miss",
      `
Misses rank by closest approach over the trajectory, with a small path-length tie breaker. Using the minimum distance rather than the final position preserves information about useful arcs that finish far from the target.

Hits enter a separate, stronger score region and rank by arrival time. That discontinuity prevents a close miss from outranking a collision, while the time preference distinguishes successful strategies. Stored paths make both branches of the score inspectable.
`,
    ),
    chapter(
      "evolution",
      "Velocities Passed Forward",
      `
Elites are copied unchanged and parent selection is rank-biased within the leading portion of the evaluated population. Children blend parent velocities, then receive velocity jitter according to the mutation probability. A separate random-reset tail introduces entirely new velocities, roughly eight percent of the next population.

The reset tail is distinct from local mutation: it can explore away from the current family when moving the target makes the old solution ineffective. Elite retention preserves evaluated candidates while the two variation mechanisms operate at different distances from them.
`,
      ["algorithm"],
    ),
    chapter(
      "rendering-replay",
      "The Paths on Screen",
      `
Stored rollout paths are drawn as SVG polylines, and the best attempt is replayed at a fixed visual pace. Playback does not run a second simulation, so the visible hit corresponds to the evaluated result even if rendering timing changes.

Ghost paths expose whether the population concentrates around one miss or retains different approaches. Wind, launch velocity, hit rate, and closest distance connect the displayed trajectories to the score and current scene.
`,
    ),
    chapter(
      "interaction",
      "A Moving Target",
      `
Moving the target invalidates the scene under which the population was ranked. Existing velocities can seed the new search, but their paths and convergence statistics describe the previous evaluation. Search-parameter changes and environment changes therefore need to be handled separately.

Target constraints keep dragging within the stage, beyond the launcher’s minimum separation, and clear of the wind panel. Population shrinking retains the best ranked genomes; growing introduces random candidates. Reconfiguration preserves useful search material without preserving a solved claim for a changed scene.

`,
      ["target-constraints"],
    ),
    chapter(
      "implementation",
      "The Same Run Again",
      `
Evaluation and breeding run outside the React playback surface. Animation timing and drag events therefore do not determine the optimizer’s steps.

Mulberry32 supplies seeded parent selection and variation. Reproduction needs the same seed and generation together with population and environmental inputs; rerolling changes the random sequence. Scene, configuration, target, and population state remain separate from the rebuilt physics worlds.
`,
      ["state-schema"],
    ),
    chapter(
      "convergence",
      "A Hit and a Solved Scene",
      `
Solved status requires the configured population hit-rate threshold for consecutive generations. This distinguishes sustained success from one replayed hit and resets the meaning of convergence when the target changes.

Fixed-seed comparisons can isolate changes in mutation, population size, or elite share. Generation count alone is a poor cost measure because larger populations require more rollouts. Hit rate, best distance, path diversity, and solved streak expose different aspects of progress.

The search remains limited to two initial-velocity values and a finite rollout. Within that space, the paths show both improvement and loss of fitness after reconfiguration, without hiding the computational cost of evaluating each candidate.
`,
      ["tradeoffs", "results"],
    ),
  ],
};
