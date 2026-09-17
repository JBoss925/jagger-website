# Paper voice and editing checklist

The voice reference is the author's feedback in this task: direct statements, concrete examples, clear preferences, and an explanation of why something is wrong or designed a particular way. Keep the natural contractions and plain vocabulary. Do not copy the frustration or profanity into the articles. Do not invent personal anecdotes or development history.

These are editing patterns, not proof that a phrase was written by AI. The checklist covers the recurring problems in these drafts and common canned constructions. Technical distinctions, actual algorithms, and necessary scope statements still belong in the papers.

## Patterns to remove

1. Explicit reader instruction: “To build a similar system,” “For a builder,” “If you build…”
2. Lesson announcements: “The lesson is,” “The central takeaway,” “The durable lesson.”
3. Article itinerary: “This walkthrough follows,” “In this post, we will,” “Let’s explore.”
4. Narration about narration: “This belongs in the narrative,” “The paper’s concern is.”
5. Justifying inclusion: “This is a detail worth keeping,” “The screenshots belong here because.”
6. Imperative section titles: “Give…,” “Make…,” “Choose…,” “Start…,” “Keep…”
7. Addressing the reader instead of describing the system: “You should…,” “A builder should…”
8. Manufactured milestones: “The first milestone,” “A useful early milestone,” “The vertical slice aimed for.”
9. Generic final lessons: “The finished story demonstrates,” “Building this way means.”
10. Empty wrap-up labels: “In conclusion,” “In summary,” “In short,” “Bottom line.”
11. Repeated paragraph conclusions that restate the opening without adding a consequence.
12. Artificial contrast: “This isn’t about X. It’s about Y.”
13. Inflated contrast: “Not merely X, but Y,” “More than just X.”
14. Unnecessary defenses against claims nobody made.
15. Vague significance claims: “This is where the real work happens,” “That is what makes it interesting.”
16. Superlatives without evidence: “revolutionary,” “groundbreaking,” “game-changing,” “unparalleled.”
17. Filler importance markers: “Importantly,” “Crucially,” “It’s worth noting.”
18. Empty transitions: “At its core,” “Ultimately,” “At the end of the day.”
19. Showy verbs: “delve,” “unpack,” “unlock,” “foster,” “harness,” “leverage” when “use” says the same thing.
20. Decorative metaphors: “tapestry,” “symphony,” “dance,” “journey” for ordinary implementation.
21. Marketing adjectives: “seamless,” “effortless,” “powerful,” “robust” without a specific mechanism.
22. Inflated abstractions: “coherent agreement across boundaries” instead of naming state, revisions, or callbacks.
23. Assigning vague “responsibilities” instead of stating what a stage does.
24. Describing a “story” when the subject is an operation or a result.
25. Repeated “useful,” “important,” or “interesting” instead of stating the actual effect.
26. Gratuitous “quietly,” “silently,” or “hidden behind” language that dramatizes a normal limitation.
27. Rhetorical questions followed immediately by the author's answer.
28. “Imagine,” “Think of,” or “Consider” prompts when the example can be stated directly.
29. Forced sets of three concepts used for rhythm rather than precision.
30. Repeating an invariant in three consecutive paragraphs with different wording.
31. Identical paragraph structure in every section.
32. Mechanical “first / next / finally” narration unrelated to an actual sequence.
33. Claiming an implementation proves more than the source or tests establish.
34. Invented chronology: “I realized,” “after several attempts,” “the breakthrough was.”
35. Generic future promises: “opens the door,” “paves the way,” “the possibilities are endless.”
36. Faux profundity: “The beauty lies in,” “a testament to,” “a reminder that.”
37. Unnecessary reassurance: “simple yet powerful,” “small but mighty.”
38. Em dashes used to manufacture dramatic reveals or repeated rhetorical pivots.
39. Explaining that the reader is here to learn.
40. Replacing a necessary technical explanation with “see the docs.”

## Review

- Abstracts stand alone and summarize purpose, approach, outcome, and relevant limits. Use reported results when available; do not substitute an example, teaser, or unsupported efficacy claim for a summary.

- Headings name a subject, mechanism, result, or tradeoff.
- Assume familiarity with the subject’s standard terms and mechanisms. Explain this project’s representations, policies, and tradeoffs rather than teaching the field from scratch.
- Retain notation legends and definitions of project-specific concepts; remove glossary asides for standard terms.
- The opening establishes the project and a concrete behavior or tension worth following. An example supports the explanation rather than dictating every section.
- Each section develops a consequence or unanswered question from the preceding explanation; a list of correctly described subsystems is not enough.
- The ending resolves the opening example and its limits without repeating the article’s inventory.
- Each paragraph describes behavior, a design reason, an example, or a limit.
- Transitions follow dependencies in the project rather than announcing the article's structure.
- Examples retain real values, state changes, and representations.
- Technical contrasts explain an actual choice; rhetorical contrasts are removed.
- Visuals stay beside the mechanism they show.
- Docs links carry exhaustive reference details without replacing the explanation.
- Reported benchmarks remain identified as reported results.
- Source IDs, deep links, and original documentation remain intact.
- Scan the generated essays, then read the prose. Phrase matching alone does not establish the voice.
