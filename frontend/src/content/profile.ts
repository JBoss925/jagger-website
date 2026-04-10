import headshotImage from "../assets/headshot.jpg";
import domesPreview from "../assets/domes-preview.jpg";
import geneticPreview from "../assets/genetic-preview.jpg";
import jaggerscriptPreview from "../assets/jaggerscript-preview.jpg";
import jigsawPreview from "../assets/jigsaw-preview.jpg";
import jinxPreview from "../assets/jinx-preview.jpg";
import jordlePreview from "../assets/jordle-preview.jpg";
import jolorPreview from "../assets/jolor-preview.jpg";
import judokuPreview from "../assets/judoku-preview.jpg";
import idolPreview from "../assets/idol-preview.jpg";
import materializePreview from "../assets/materialize-preview.jpg";
import monadPreview from "../assets/monad-preview.jpg";
import newReactTypingEffectDemo from "../assets/new-react-typing-effect-demo.gif";
import renginePreview from "../assets/rengine-preview.jpg";
import tsxlightRendererPreview from "../assets/tsxlight-renderer-preview.jpg";
import type { ProfileContent } from "../types/content";

export const headshotAsset = headshotImage;

export const profileContent: ProfileContent = {
  name: "Jagger Brulato",
  title: "Full-stack engineer across product, platform, and language tooling.",
  location: "United States",
  email: "jaggerbrulato@gmail.com",
  heroSummary:
    "I like work that makes me understand the whole system: the product surface, the backend, the tooling around it, and the operational reality once it is live.",
  heroBullets: [
    "I have shipped frontend product work, backend services, internal platforms, dashboards, mobile apps, and developer-facing tooling.",
    "I do my best work when I can move across layers instead of treating the UI, the backend, and operations like separate worlds.",
    "The side projects here are a good sample too: interpreters, simulations, games, and backend utilities."
  ],
  metrics: [
    { label: "Main lane", value: "Full-stack" },
    { label: "Also drawn to", value: "Platform + PL" },
    { label: "Favorite work", value: "Distributed systems" },
    { label: "Favorite Project", value: "JaggerScript" }
  ],
  links: [
    { label: "Email", href: "mailto:jaggerbrulato@gmail.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/jaggerbrulato/" },
    { label: "GitHub", href: "https://github.com/JBoss925" },
    { label: "Resume", href: "/files/resume.pdf" }
  ],
  sceneSections: [
    {
      id: "hero",
      label: "Intro",
      eyebrow: "Intro",
      title: "I’m a full-stack engineer who likes work with real technical depth.",
      summary:
        "Most of the work I’m proud of sits somewhere between product engineering, backend systems, internal tools, and the kinds of projects that force you to understand the whole stack.",
      position: [-8, 3, -1],
      camera: [-1, 1.8, 14],
      target: [-4, 1.4, 0],
      accent: "#57d0ff"
    },
    {
      id: "impact",
      label: "Focus",
      eyebrow: "Focus",
      title: "The work I like most usually makes something easier for someone.",
      summary:
        "Sometimes that means a user-facing feature. Sometimes it means a platform, a dashboard, a reusable abstraction, or a cleaner path for the next engineer who touches the code.",
      position: [-2, 0, 1],
      camera: [2, 1.2, 12],
      target: [0, 0.2, 0],
      accent: "#8de7c1"
    },
    {
      id: "experience",
      label: "Experience",
      eyebrow: "Experience",
      title: "I’ve worked in startups, big companies, internal platform teams, and student-led product teams.",
      summary:
        "Taken together, these roles show the range of environments I’ve worked in and the kinds of technical work I keep getting pulled toward.",
      position: [4, 1.8, -2],
      camera: [5.5, 2.1, 11],
      target: [4.2, 1, -1.5],
      accent: "#f7a95b"
    },
    {
      id: "projects",
      label: "Projects",
      eyebrow: "Projects",
      title: "These are the projects that show how I think best.",
      summary:
        "They are the strongest examples of the things I tend to build on my own: interpreters, simulations, games, utilities, and systems with real behavior instead of static demos.",
      position: [7, -1.6, 0],
      camera: [6.5, 0.6, 12.5],
      target: [6.2, -0.8, 0],
      accent: "#df7dff"
    },
    {
      id: "craft",
      label: "Craft",
      eyebrow: "How I work",
      title: "I care a lot about how the pieces fit together across the whole system.",
      summary:
        "The through-line for me is usually the same: make the thing clearer, make it easier to change, and make it less painful for the next person who has to work in it.",
      position: [1, -3.4, -1],
      camera: [1.8, -1.1, 12.8],
      target: [1.5, -2, -0.5],
      accent: "#ffd36f"
    },
    {
      id: "contact",
      label: "Contact",
      eyebrow: "Contact",
      title: "If this sounds like the kind of engineer you need, reach out.",
      summary:
        "Email is the easiest way to reach me. The resume, GitHub, and LinkedIn are here too if you want the longer version first.",
      position: [-5, -2.4, 1],
      camera: [-3.6, -0.4, 13],
      target: [-3.6, -1.2, 0],
      accent: "#ff8ca8"
    }
  ],
  experience: [
    {
      company: "Red Ventures",
      role: "Platform Engineer",
      timeframe: "2024-2025",
      location: "Internal platform engineering",
      summary:
        "Built internal platform capabilities that made it easier for engineering teams to launch, operate, and understand applications without rebuilding the same infrastructure each time.",
      highlights: [
        "Designed, prototyped, and developed flexible applications for common internal use cases so new services could be launched through a streamlined platform experience instead of bespoke setup work.",
        "Used Terraform and platform automation to make bringing up new applications feel much closer to a product workflow than a manual infrastructure exercise.",
        "Built internal dashboards and monitoring surfaces that gave engineers visibility into cost, availability, and process health, feeding back into architecture and operational decisions.",
        "Worked at the seam between platform reliability and developer experience: keeping systems healthy while also making them easier for other engineers to use."
      ],
      tags: ["Platform engineering", "Terraform", "Internal tools", "Observability"]
    },
    {
      company: "Lowe’s",
      role: "Software Engineer",
      timeframe: "2024",
      location: "Hybrid",
      summary:
        "Worked as a full-time software engineer after interning there earlier, contributing in a large enterprise environment with real production delivery expectations.",
      highlights: [
        "Operated in a mature enterprise setting where shipping meant working across existing systems, stakeholders, and delivery processes instead of building in isolation.",
        "Built on earlier experience with Lowe’s merchandising and pricing systems, which gave me context for how large retail organizations structure software delivery around real business operations.",
        "Added another production environment to my background between startup, big tech, and internal platform work, which is part of why I’m comfortable adapting to very different engineering cultures."
      ],
      tags: ["Enterprise software", "Production delivery", "Cross-functional work", "Retail systems"]
    },
    {
      company: "Google",
      role: "Software Engineer",
      timeframe: "2021-2024",
      location: "Full-time",
      summary:
        "Worked as a software engineer in a high-scale production environment with strong expectations around execution quality, reliability, and collaboration.",
      highlights: [
        "Shipped in an environment where engineering quality, testing, review discipline, and operational reliability were treated as baseline requirements rather than nice-to-haves.",
        "Worked in systems large enough that scale, correctness, maintainability, and coordination all had to be part of the implementation from the start.",
        "Built experience operating within mature engineering processes while still delivering clean, practical work in collaboration with other engineers and partner teams."
      ],
      tags: ["Production systems", "Scale", "Reliability", "Engineering quality"]
    },
    {
      company: "Cornell Design & Tech Initiative",
      role: "Developer Lead",
      timeframe: "2020-2021",
      location: "Cornell University",
      summary:
        "Oversaw development across DTI applications and the technology around their maintenance and deployment while still staying hands-on with implementation and developer support.",
      highlights: [
        "Oversaw development across DTI apps on multiple platforms and the maintenance and deployment work around them instead of focusing on only one codebase.",
        "Worked directly with teams to help developers get unstuck, onboard new members, and teach the engineering practices needed to contribute effectively.",
        "Balanced leadership responsibilities with hands-on implementation, which meant keeping architectural decisions practical and close to the code."
      ],
      tags: ["Leadership", "Mentorship", "Cross-platform", "Developer support"]
    },
    {
      company: "Cornell Design & Tech Initiative",
      role: "Technical Project Manager",
      timeframe: "2017-2020",
      location: "Cue subteam",
      summary:
        "Led the Cue app subteam while also doing full-stack product work across the interface, backend APIs, and deployment setup that kept the project moving.",
      highlights: [
        "Built user interfaces across web, Android, iOS, and Windows, alongside the backend systems that powered them.",
        "Worked on dynamic webpages, backend APIs, and database work using tools like Django and Heroku rather than staying boxed into one layer.",
        "Helped make technical decisions, coordinate developers, and keep the product moving from early implementation toward something real and usable."
      ],
      tags: ["Technical direction", "Full-stack", "Django", "Project leadership"]
    },
    {
      company: "Lowe’s",
      role: "Software Engineering Intern",
      timeframe: "2019",
      location: "Merchandising IT",
      summary:
        "Worked on Lowe’s Central Price Master, contributing across frontend, backend microservices, and the surrounding DevOps and delivery stack.",
      highlights: [
        "Implemented frontend work in Angular and TypeScript for a large internal pricing system.",
        "Built backend microservice APIs in Spring Boot and Java.",
        "Worked with the surrounding delivery and infrastructure tooling including GCP, GCR, Docker, Jenkins, Jira, and Bitbucket, so the internship covered far more than writing feature code."
      ],
      tags: ["Angular", "Spring Boot", "Java", "DevOps"]
    },
    {
      company: "Incite Analytics",
      role: "Full Stack Developer",
      timeframe: "2018-2019",
      location: "Health tech startup",
      summary:
        "Worked at a cardiovascular health startup, building full-stack product functionality and helping connect frontend workflows to backend data and database management.",
      highlights: [
        "Built front-end UI and user-facing functionality while also working on backend systems and Django-based database management.",
        "Worked in a smaller startup environment where communication between product behavior and backend implementation mattered just as much as the code itself.",
        "Added early experience moving between interface work and backend/data concerns instead of being confined to one layer of the stack."
      ],
      tags: ["Startup", "Django", "Full-stack", "Health tech"]
    },
    {
      company: "Velocitor",
      role: "Software Engineer Intern",
      timeframe: "2016",
      location: "Cross-platform mobile",
      summary:
        "Built cross-platform mobile software in C# and Xamarin for large-client operational applications well before that style of workflow became common.",
      highlights: [
        "Used C# with Xamarin and binding libraries to support simultaneous cross-platform development.",
        "Worked on applications for inventory management, live driver tracking, and bus scheduling, so the software was tied directly to real operational use cases.",
        "Got early experience shipping practical software for clients in an environment where reliability and usability mattered more than novelty."
      ],
      tags: ["C#", "Xamarin", "Mobile", "Client delivery"]
    }
  ],
  projects: [
    {
      slug: "jaggerscript",
      title: "JaggerScript",
      description:
        "A small typed scripting language with its own parser, interpreter, and browser playground.",
      impact:
        "This is one of the clearest examples of how I like to work: own the language, the runtime, and the interface around it.",
      stack: ["TypeScript", "PEG parser", "Interpreter", "Browser tooling"],
      image: jaggerscriptPreview,
      icon: "jaggerscript",
      links: [
        { label: "Open Playground", href: "/jaggerscript" },
        { label: "Source", href: "https://github.com/JBoss925/JaggerScript" }
      ]
    },
    {
      slug: "genetic-ts",
      title: "Genetic Algorithms in TypeScript",
      description:
        "An interactive simulation where a genetic algorithm learns the launch velocity needed to hit a target under changing physics.",
      impact:
        "Change gravity and wind, rerun the population, and watch the algorithm adapt in real time.",
      stack: ["TypeScript", "matter-js", "Genetic algorithms", "Interactive simulation"],
      image: geneticPreview,
      icon: "genetic",
      links: [
        {
          label: "Open Demo",
          href: "/genetic-ts"
        },
        { label: "Source", href: "https://github.com/JBoss925/GeneticTS" }
      ]
    },
    {
      slug: "tsxlight-renderer",
      title: "TSXLight Renderer",
      description:
        "A proof-of-concept TSX rendering engine for web and Electron apps, built around a custom JSX factory, server-managed component trees, and socket-triggered callbacks.",
      impact:
        "This is the kind of lower-level experiment I enjoy because it forces me to think about rendering, state persistence, per-user sessions, and page transitions from first principles.",
      stack: ["TypeScript", "Custom JSX factory", "SSR + sockets", "Electron + Express"],
      image: tsxlightRendererPreview,
      icon: "tsxlight",
      links: [{ label: "Source", href: "https://github.com/JBoss925/tsxlight-renderer" }]
    },
    {
      slug: "rengine",
      title: "Rengine",
      description:
        "A small rendering and game engine experiment with scenes, entities, transform hierarchies, animation loops, and switchable canvas or React output.",
      impact:
        "What I like about this one is that the interesting work sits below the demo: engine boundaries, update loops, renderer abstraction, and entity composition you can reason about directly.",
      stack: ["TypeScript", "Canvas rendering", "Game loops", "Entity systems"],
      image: renginePreview,
      icon: "rengine",
      links: [{ label: "Source", href: "https://github.com/JBoss925/Rengine" }]
    },
    {
      slug: "new-react-typing-effect",
      title: "new-react-typing-effect",
      description:
        "A reusable typing animation component published as a TypeScript React package, with customizable cursor rendering, text rendering, and pacing controls.",
      impact:
        "It is a smaller project, but it still shows a practical skill I value: designing a clean component API, shipping types with the library, and making customization flexible instead of bolted on.",
      stack: ["React", "TypeScript library", "Component API design", "NPM Packaging"],
      image: newReactTypingEffectDemo,
      icon: "typing-effect",
      links: [
        { label: "NPM", href: "https://www.npmjs.com/package/new-react-typing-effect" },
        { label: "Source", href: "https://github.com/JBoss925/new-react-typing-effect" }
      ]
    },
    {
      slug: "idol",
      title: "IDOL",
      description:
        "An internal tools platform for Cornell DTI that bundles org operations, scheduling workflows, member data, and the team website into one TypeScript monorepo.",
      impact:
        "It is a strong example of the full-stack work I like most: shared types, real product surface area, business logic-heavy APIs, and software a 100+ person organization actually depends on.",
      stack: ["TypeScript monorepo", "Next.js", "Express + Netlify", "Firebase"],
      image: idolPreview,
      icon: "idol",
      links: [
        { label: "Open Site", href: "https://idol.cornelldti.org/" },
        { label: "Source", href: "https://github.com/cornell-dti/idol" }
      ]
    },
    {
      slug: "jordle",
      title: "Jordle",
      description:
        "A six-letter daily word game with archives, persistent daily state, and a much larger curated word set behind it.",
      impact:
        "I wanted at least one project on the site that people might come back to every day.",
      stack: ["React", "Daily puzzles", "Local persistence", "Game UI"],
      image: jordlePreview,
      icon: "jordle",
      links: [
        { label: "Play Jordle", href: "/games/jordle" },
        { label: "Source", href: "https://github.com/JBoss925/jagger-website" }
      ]
    },
    {
      slug: "jolor",
      title: "Jolor",
      description:
        "A daily color-guessing game where the name is the clue and you have to dial in the actual color yourself.",
      impact:
        "It let me build a daily game that is much more visual than Jordle while still needing careful state, feedback, archive handling, and a clean interface.",
      stack: ["React", "Daily puzzles", "Color systems", "Game UI"],
      image: jolorPreview,
      icon: "jolor",
      links: [
        { label: "Play Jolor", href: "/games/jolor" },
        { label: "Source", href: "https://github.com/JBoss925/jagger-website" }
      ]
    },
    {
      slug: "jinx",
      title: "Jinx",
      description:
        "A daily minefield puzzle that keeps the rules simple: reveal safe cells, flag mines, and read the numbers carefully.",
      impact:
        "This one let me build a cleaner version of that classic board logic while keeping the state, archive, and hint systems tight.",
      stack: ["React", "Grid logic", "Daily puzzles", "Local persistence"],
      image: jinxPreview,
      links: [
        { label: "Play Jinx", href: "/games/jinx" },
        { label: "Source", href: "https://github.com/JBoss925/jagger-website" }
      ]
    },
    {
      slug: "judoku",
      title: "Judoku",
      description:
        "A smaller daily sudoku built around a 6x6 grid, notes mode, and a faster solve than a full-sized board.",
      impact:
        "I wanted a number puzzle that still feels satisfying, but fits better on a phone and does not ask for a giant time commitment.",
      stack: ["React", "Constraint puzzles", "State management", "Daily puzzles"],
      image: judokuPreview,
      links: [
        { label: "Play Judoku", href: "/games/judoku" },
        { label: "Source", href: "https://github.com/JBoss925/jagger-website" }
      ]
    },
    {
      slug: "jigsaw",
      title: "Jigsaw",
      description:
        "A daily tile-swap picture puzzle where each board is a scrambled image you have to piece back together.",
      impact:
        "It added something visual to the games section and gave me a fun excuse to build image slicing, archive handling, and a simple interaction loop around it.",
      stack: ["React", "Image puzzles", "Daily puzzles", "Interaction design"],
      image: jigsawPreview,
      links: [
        { label: "Play Jigsaw", href: "/games/jigsaw" },
        { label: "Source", href: "https://github.com/JBoss925/jagger-website" }
      ]
    },
    {
      slug: "domes",
      title: "Domes",
      description:
        "A two-player strategy game inspired by Santorini, built around movement, tempo, and board control.",
      impact:
        "It sits right in the overlap I like most: clear game rules, interaction design, and state that has to stay coherent turn after turn.",
      stack: ["React", "Turn-based gameplay", "State machines", "Game UI"],
      image: domesPreview,
      icon: "domes",
      links: [
        { label: "Play Domes", href: "/games/domes" },
        { label: "Source", href: "https://github.com/JBoss925/jagger-website" }
      ]
    },
    {
      slug: "chains",
      title: "Chains",
      description:
        "A monadic pattern for wrapping a value, composing transformations over it, and layering side behaviors like history or undo on top.",
      impact:
        "It is the kind of abstraction work I enjoy most: simple at the call site, but strong enough to support richer behavior underneath.",
      stack: ["TypeScript", "Monads", "Composable abstractions", "API design"],
      image: monadPreview,
      links: [
        {
          label: "Reference",
          href: "https://gist.github.com/JBoss925/183ba9fa079ebab1d5f908fbf7725243"
        }
      ]
    },
    {
      slug: "materialize",
      title: "materialize()",
      description:
        "A Firestore utility for turning reference-heavy data into something easier to read and use.",
      impact:
        "It is a small utility, but it captures a kind of backend work I genuinely enjoy: taking something awkward and making it simple enough to use everywhere.",
      stack: ["TypeScript", "Firestore", "Backend utilities", "Data shaping"],
      image: materializePreview,
      icon: "materialize",
      links: [
        {
          label: "Reference",
          href: "https://gist.github.com/JBoss925/192cad63b955f41e9615622b5c943d15"
        }
      ]
    }
  ],
  skillClusters: [
    {
      title: "Working with a team",
      summary:
        "I usually end up doing some mix of implementation, technical direction, and unblocking other people at the same time.",
      items: [
        "Technical leadership",
        "Developer onboarding",
        "Cross-functional communication",
        "System design",
        "Execution under ambiguity"
      ]
    },
    {
      title: "Systems and platform work",
      summary:
        "A lot of the backend work I enjoy sits around reliability, observability, internal platforms, and the infrastructure that makes product teams faster.",
      items: [
        "Distributed systems",
        "Platform engineering",
        "Cloud computing",
        "Observability",
        "Performance-minded design"
      ]
    },
    {
      title: "Range",
      summary:
        "I like being able to move between layers instead of getting stuck in only one of them.",
      items: [
        "Frontend engineering",
        "Backend APIs",
        "Mobile development",
        "Programming language tooling",
        "TypeScript, Java, Python, C#"
      ]
    }
  ],
  jaggerscriptIntro: {
    headline: "A language project I built all the way through.",
    summary:
      "JaggerScript is a browser-runnable interpreter for a small typed scripting language. I built it because I wanted a project that forced me to own the parser, the runtime, and the actual interface people would use to explore it.",
    bullets: [
      "The parser, compiler stage, and interpreter are all real parts of the project, not placeholders.",
      "The examples are actual language programs from the repo, not fake demo text.",
      "I wanted the browser route to be interactive and useful, not a static demo."
    ]
  }
};
