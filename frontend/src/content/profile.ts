import headshotImage from "../assets/headshot.jpg";
import cornellDtiLogo from "../assets/company-logos/cornell-dti.svg";
import cornellUniversityLogo from "../assets/company-logos/cornell-university.svg";
import googleLogo from "../assets/company-logos/google.png";
import lowesLogo from "../assets/company-logos/lowes.png";
import redVenturesLogo from "../assets/company-logos/red-ventures.webp";
import velocitorLogo from "../assets/company-logos/velocitor.png";
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
    "I like work that makes me understand the **whole system**: the product surface, the backend, the tooling around it, and the operational reality once it is live.",
  heroBullets: [
    "I have shipped **frontend product work, backend services, internal platforms, dashboards, mobile apps, and developer-facing tooling**.",
    "I do my best work when I can **move across layers** instead of treating the UI, the backend, and operations like separate worlds.",
    "The side projects here are a good sample too: **interpreters, simulations, games, and backend utilities**."
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
      logo: redVenturesLogo,
      logoAlt: "Red Ventures logo",
      summary:
        "Built internal platform capabilities that made it easier for engineering teams to launch, operate, and understand applications without rebuilding the same infrastructure each time.",
      highlights: [
        "Designed, prototyped, and developed flexible internal applications for common platform use cases so new services could be launched through a streamlined platform experience instead of bespoke setup work.",
        "Built frontend product surfaces for platform tooling in TypeScript and React, alongside the infrastructure and runtime work behind those flows.",
        "Used Golang to generate and deploy Terraform through a custom Terraform provider and runtime, turning infrastructure setup into a more repeatable platform workflow.",
        "Built internal dashboards and monitoring surfaces that gave engineers visibility into cost, availability, and process health, feeding back into architecture and operational decisions.",
        "Worked at the seam between platform reliability and developer experience, keeping systems healthy while also making them easier for other engineers to use."
      ],
      tags: [
        { label: "Golang", tone: "language" },
        { label: "TypeScript", tone: "language" },
        { label: "React", tone: "framework" },
        { label: "Web", tone: "domain" },
        { label: "Platform engineering", tone: "domain" },
        { label: "Terraform", tone: "infrastructure" },
        { label: "Custom providers", tone: "framework" },
        { label: "Observability", tone: "practice" },
        { label: "Platform automation", tone: "infrastructure" },
        { label: "Dashboards", tone: "practice" }
      ]
    },
    {
      company: "Lowe’s",
      role: "Software Engineer",
      timeframe: "2024",
      location: "Hybrid",
      logo: lowesLogo,
      logoAlt: "Lowe's logo",
      summary:
        "Worked as a full-time software engineer after interning there earlier, contributing in a large enterprise environment with real production delivery expectations.",
      highlights: [
        "Built and maintained enterprise retail systems using Java, Spring, Spring Boot, and Kafka in a mature production environment with established delivery processes.",
        "Maintained a suite of 25+ microservices, updating Docker images and runtimes, upgrading Alpine base versions, and addressing security vulnerabilities across the service fleet.",
        "Worked across existing systems, stakeholders, and release workflows rather than building in isolation, which meant shipping changes that fit into a much larger operational environment.",
        "Built on earlier experience with Lowe's merchandising and pricing systems, adding more depth in large-scale backend delivery and enterprise software coordination."
      ],
      tags: [
        { label: "Java", tone: "language" },
        { label: "Spring", tone: "framework" },
        { label: "Spring Boot", tone: "framework" },
        { label: "Kafka", tone: "infrastructure" },
        { label: "Distributed systems", tone: "domain" },
        { label: "Enterprise software", tone: "domain" },
        { label: "Production delivery", tone: "practice" },
        { label: "Retail systems", tone: "domain" },
        { label: "Merchandising systems", tone: "domain" }
      ]
    },
    {
      company: "Google",
      role: "Software Engineer",
      timeframe: "2021-2024",
      location: "Full-time",
      logo: googleLogo,
      logoAlt: "Google logo",
      summary:
        "Built distributed data systems at Google, spanning self-service pipeline generation, shared data infrastructure, and internal reporting systems in a high-scale production environment.",
      highlights: [
        "Built complex distributed data systems using Apache Beam, where arbitrary graph pipeline definitions were generated at runtime and executed through a self-service internal tool.",
        "Worked with Bazel, Pub/Sub, Spanner, BigQuery, Cloud SQL, PostgreSQL, and other databases, sources, and sinks to support flexible pipeline execution across varied data environments.",
        "Built custom reporting and data pipelines around Google's internal shared data layer for mergers and acquisitions, automating manual report creation and exposing M&A data more broadly across the company."
      ],
      tags: [
        { label: "Java", tone: "language" },
        { label: "Apache Beam", tone: "framework" },
        { label: "Bazel", tone: "framework" },
        { label: "Pub/Sub", tone: "infrastructure" },
        { label: "Spanner", tone: "infrastructure" },
        { label: "BigQuery", tone: "infrastructure" },
        { label: "Cloud SQL", tone: "infrastructure" },
        { label: "PostgreSQL", tone: "infrastructure" },
        { label: "Data pipelines", tone: "domain" },
        { label: "Self-service tooling", tone: "practice" },
        { label: "Distributed systems", tone: "domain" }
      ]
    },
    {
      company: "Cornell Design & Tech Initiative",
      role: "Developer Lead",
      timeframe: "2020-2021",
      location: "Cornell University",
      logo: cornellDtiLogo,
      logoAlt: "Cornell Design and Tech Initiative logo",
      summary:
        "Oversaw development across DTI applications and the technology around their maintenance and deployment while still staying hands-on with implementation and developer support.",
      highlights: [
        "Oversaw development across DTI apps on multiple platforms, including native iOS in Swift, native Android in Java and Kotlin, and cross-platform work in Flutter.",
        "Supported teams building applications in React, React Native, and Angular, with backends primarily in Node and supporting services built with Firebase and GraphQL.",
        "Balanced leadership responsibilities with hands-on implementation, helping developers get unstuck while keeping architectural decisions practical and close to the code."
      ],
      tags: [
        { label: "Swift", tone: "language" },
        { label: "Java", tone: "language" },
        { label: "Kotlin", tone: "language" },
        { label: "Dart", tone: "language" },
        { label: "React", tone: "framework" },
        { label: "React Native", tone: "framework" },
        { label: "Angular", tone: "framework" },
        { label: "Vue.js", tone: "framework" },
        { label: "Svelte", tone: "framework" },
        { label: "Next.js", tone: "framework" },
        { label: "Flutter", tone: "framework" },
        { label: "Node", tone: "framework" },
        { label: "Firebase", tone: "infrastructure" },
        { label: "GraphQL", tone: "framework" },
        { label: "Web", tone: "domain" },
        { label: "iOS", tone: "domain" },
        { label: "Android", tone: "domain" },
        { label: "Mobile", tone: "domain" },
        { label: "Leadership", tone: "practice" }
      ]
    },
    {
      company: "Google",
      role: "SWE Intern",
      timeframe: "2020",
      location: "Internship",
      logo: googleLogo,
      logoAlt: "Google logo",
      summary:
        "Created an open-source scheduler and roster organizer for Alvin Ailey Dance Company in NYC, building a multi-user full-stack experience shaped closely with clients and stakeholders.",
      highlights: [
        "Held weekly meetings with clients and stakeholders to design and refine the product around the company's real scheduling and operational needs.",
        "Built custom user interfaces in Angular and TypeScript, along with the data structures behind workflows like drag-and-drop roster editing, administration tools, and dancer self-service time-off requests.",
        "Built the backend in Java with Spring Boot and PostgreSQL, alongside features such as mobile notifications, automatic roster backup rotations, and collaboration-friendly scheduling flows."
      ],
      tags: [
        { label: "Java", tone: "language" },
        { label: "TypeScript", tone: "language" },
        { label: "Angular", tone: "framework" },
        { label: "Spring Boot", tone: "framework" },
        { label: "PostgreSQL", tone: "infrastructure" },
        { label: "Full-stack", tone: "practice" },
        { label: "Web", tone: "domain" },
        { label: "Mobile", tone: "domain" },
        { label: "Open source", tone: "practice" },
        { label: "Scheduling software", tone: "domain" },
        { label: "Multi-user systems", tone: "domain" },
        { label: "Stakeholder collaboration", tone: "practice" }
      ]
    },
    {
      company: "Cornell Design & Tech Initiative",
      role: "Technical Project Manager",
      timeframe: "2017-2020",
      location: "Cue subteam",
      logo: cornellDtiLogo,
      logoAlt: "Cornell Design and Tech Initiative logo",
      summary:
        "Led the Cue app subteam while also doing full-stack product work across the interface, backend APIs, and deployment setup that kept the project moving.",
      highlights: [
        "Led a team building native iOS and Android applications in Swift, Java, and Kotlin, alongside the backend systems that powered them.",
        "Worked across backends in Python with Django and Node with Express, with data and service infrastructure using MongoDB, Firebase, Firestore, and GraphQL.",
        "Helped make technical decisions, coordinate developers, and keep the product moving from early implementation toward something real and usable."
      ],
      tags: [
        { label: "Python", tone: "language" },
        { label: "Swift", tone: "language" },
        { label: "Java", tone: "language" },
        { label: "Kotlin", tone: "language" },
        { label: "Django", tone: "framework" },
        { label: "Express", tone: "framework" },
        { label: "MongoDB", tone: "infrastructure" },
        { label: "Firebase", tone: "infrastructure" },
        { label: "Firestore", tone: "infrastructure" },
        { label: "GraphQL", tone: "framework" },
        { label: "Web", tone: "domain" },
        { label: "Desktop", tone: "domain" },
        { label: "iOS", tone: "domain" },
        { label: "Android", tone: "domain" },
        { label: "Mobile", tone: "domain" },
        { label: "Technical direction", tone: "practice" },
        { label: "Project leadership", tone: "practice" }
      ]
    },
    {
      company: "Cornell Design & Tech Initiative",
      role: "Full Stack Developer",
      timeframe: "2017-2019",
      location: "Project team",
      logo: cornellDtiLogo,
      logoAlt: "Cornell Design and Tech Initiative logo",
      summary:
        "Worked as a full-stack developer on a Cornell DTI project team, building user interfaces and backend systems across multiple platforms.",
      highlights: [
        "Built native iOS and Android application features in Swift, Java, and Kotlin, along with supporting web interfaces and other client surfaces used by the team.",
        "Worked across backends in Python with Django and Node with Express, with MongoDB, Firebase, Firestore, and GraphQL supporting product data and APIs.",
        "Contributed across both frontend and backend responsibilities, which established the multi-platform full-stack workflow that later carried into team leadership work."
      ],
      tags: [
        { label: "Python", tone: "language" },
        { label: "Swift", tone: "language" },
        { label: "Java", tone: "language" },
        { label: "Kotlin", tone: "language" },
        { label: "Django", tone: "framework" },
        { label: "Express", tone: "framework" },
        { label: "MongoDB", tone: "infrastructure" },
        { label: "Firebase", tone: "infrastructure" },
        { label: "Firestore", tone: "infrastructure" },
        { label: "GraphQL", tone: "framework" },
        { label: "Web", tone: "domain" },
        { label: "Desktop", tone: "domain" },
        { label: "iOS", tone: "domain" },
        { label: "Android", tone: "domain" },
        { label: "Mobile", tone: "domain" },
        { label: "Full-stack", tone: "practice" }
      ]
    },
    {
      company: "Lowe’s",
      role: "Software Engineering Intern",
      timeframe: "2019",
      location: "Merchandising IT",
      logo: lowesLogo,
      logoAlt: "Lowe's logo",
      summary:
        "Worked on Lowe's Central Price Master, contributing across frontend, backend microservices, and the surrounding delivery tooling.",
      highlights: [
        "Implemented frontend work in Angular and TypeScript for a large internal pricing system, including a data filtering view for a data aggregator microservice that I owned end to end.",
        "Built and maintained several Spring Boot microservices in Java supporting merchandising and pricing workflows.",
        "Worked with the surrounding delivery and infrastructure tooling including Jenkins, Jira, Bitbucket, GCP, Google Container Registry, and Docker, so the internship covered far more than writing feature code."
      ],
      tags: [
        { label: "Angular", tone: "framework" },
        { label: "Spring Boot", tone: "framework" },
        { label: "Java", tone: "language" },
        { label: "TypeScript", tone: "language" },
        { label: "Web", tone: "domain" },
        { label: "Jenkins", tone: "infrastructure" },
        { label: "Bitbucket", tone: "infrastructure" },
        { label: "Jira", tone: "practice" },
        { label: "Docker", tone: "infrastructure" },
        { label: "GCR", tone: "infrastructure" },
        { label: "GCP", tone: "infrastructure" }
      ]
    },
    {
      company: "Incite Analytics",
      role: "Full Stack Developer",
      timeframe: "2018-2019",
      location: "Health tech startup",
      logo: cornellUniversityLogo,
      logoAlt: "Cornell University logo",
      summary:
        "Worked at a cardiovascular health startup, building product functionality that helped track and detect heart problems in patients across mobile clients and backend systems.",
      highlights: [
        "Built user-facing mobile interfaces in Swift for iOS and Java for Android for the company's client applications.",
        "Worked on backend systems and Django-based database management supporting cardiovascular health workflows and patient-facing product behavior.",
        "Worked in a smaller startup environment where communication between product behavior, mobile implementation, and backend data concerns mattered just as much as the code itself."
      ],
      tags: [
        { label: "Python", tone: "language" },
        { label: "Swift", tone: "language" },
        { label: "Java", tone: "language" },
        { label: "Django", tone: "framework" },
        { label: "Full-stack", tone: "practice" },
        { label: "Health tech", tone: "domain" },
        { label: "iOS", tone: "domain" },
        { label: "Android", tone: "domain" },
        { label: "Mobile", tone: "domain" },
        { label: "Database management", tone: "infrastructure" }
      ]
    },
    {
      company: "Velocitor",
      role: "Software Engineer Intern",
      timeframe: "2016",
      location: "Cross-platform mobile",
      logo: velocitorLogo,
      logoAlt: "Velocitor logo",
      summary:
        "Built cross-platform mobile software in C# and Xamarin for large-client operational applications, while also contributing platform-specific code on both Android and iOS.",
      highlights: [
        "Used C# with Xamarin and binding libraries to support simultaneous cross-platform development.",
        "Wrote platform-specific code in Java for Android and Objective-C for iOS alongside the shared mobile application layer.",
        "Worked on applications for inventory management, live driver tracking, and bus scheduling, so the software was tied directly to real operational use cases."
      ],
      tags: [
        { label: "C#", tone: "language" },
        { label: "Java", tone: "language" },
        { label: "Objective-C", tone: "language" },
        { label: "Xamarin", tone: "framework" },
        { label: "Mobile", tone: "domain" },
        { label: "Android", tone: "domain" },
        { label: "iOS", tone: "domain" },
        { label: "Inventory systems", tone: "domain" },
        { label: "Scheduling software", tone: "domain" }
      ]
    }
  ],
  projects: [
    {
      slug: "jaggerscript",
      title: "JaggerScript",
      description:
        "A small typed scripting language with its own **parser, interpreter, and browser playground**.",
      impact:
        "This is one of the clearest examples of how I like to work: **own the language, the runtime, and the interface** around it.",
      stack: [
        "TypeScript",
        "PEG parser",
        "Interpreter",
        "Browser tooling",
        "Language design",
        "Runtime systems"
      ],
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
        "An interactive simulation where a **genetic algorithm** learns the launch velocity needed to hit a target under changing physics.",
      impact:
        "Change gravity and wind, rerun the population, and watch the algorithm **adapt in real time**.",
      stack: [
        "TypeScript",
        "matter-js",
        "Genetic algorithms",
        "Interactive simulation",
        "Physics modeling",
        "Data visualization"
      ],
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
        "A proof-of-concept TSX rendering engine for web and Electron apps, built around a **custom JSX factory**, server-managed component trees, and socket-triggered callbacks.",
      impact:
        "This is the kind of lower-level experiment I enjoy because it forces me to think about **rendering, state persistence, per-user sessions, and page transitions** from first principles.",
      stack: [
        "TypeScript",
        "Custom JSX factory",
        "SSR + sockets",
        "Electron + Express",
        "Rendering architecture",
        "Realtime UI"
      ],
      image: tsxlightRendererPreview,
      icon: "tsxlight",
      links: [{ label: "Source", href: "https://github.com/JBoss925/tsxlight-renderer" }]
    },
    {
      slug: "rengine",
      title: "Rengine",
      description:
        "A small rendering and game engine experiment with **scenes, entities, transform hierarchies, animation loops, and switchable canvas or React output**.",
      impact:
        "What I like about this one is that the interesting work sits below the demo: **engine boundaries, update loops, renderer abstraction, and entity composition** you can reason about directly.",
      stack: [
        "TypeScript",
        "Canvas rendering",
        "Game loops",
        "Entity systems",
        "Scene graphs",
        "Engine architecture"
      ],
      image: renginePreview,
      icon: "rengine",
      links: [
        { label: "Open Demo", href: "/rengine" },
        { label: "Source", href: "https://github.com/JBoss925/Rengine" }
      ]
    },
    {
      slug: "new-react-typing-effect",
      title: "new-react-typing-effect",
      description:
        "A reusable typing animation component published as a TypeScript React package, with customizable cursor rendering, text rendering, and pacing controls.",
      impact:
        "It is a smaller project, but it still shows a practical skill I value: designing a clean component API, shipping types with the library, and making customization flexible instead of bolted on.",
      stack: [
        "React",
        "TypeScript library",
        "Component API design",
        "NPM Packaging",
        "Animation components",
        "Developer experience"
      ],
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
      stack: [
        "TypeScript monorepo",
        "Next.js",
        "Express + Netlify",
        "Firebase",
        "Internal tools",
        "Business logic APIs"
      ],
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
      stack: [
        "TypeScript",
        "React",
        "Daily puzzles",
        "Local persistence",
        "Game UI",
        "Word games",
        "Archive systems"
      ],
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
      stack: [
        "TypeScript",
        "React",
        "Daily puzzles",
        "Color systems",
        "Game UI",
        "Visual feedback",
        "Archive systems"
      ],
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
      stack: [
        "TypeScript",
        "React",
        "Grid logic",
        "Daily puzzles",
        "Local persistence",
        "Hint systems",
        "Board state"
      ],
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
      stack: [
        "TypeScript",
        "React",
        "Constraint puzzles",
        "State management",
        "Daily puzzles",
        "Notes mode",
        "Mobile-first UI"
      ],
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
      stack: [
        "TypeScript",
        "React",
        "Image puzzles",
        "Daily puzzles",
        "Interaction design",
        "Image slicing",
        "Archive systems"
      ],
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
      stack: [
        "TypeScript",
        "React",
        "Turn-based gameplay",
        "State machines",
        "Game UI",
        "Board strategy",
        "Rules engines"
      ],
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
      stack: [
        "TypeScript",
        "Monads",
        "Composable abstractions",
        "API design",
        "Functional patterns",
        "History / undo"
      ],
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
      stack: [
        "TypeScript",
        "Firestore",
        "Backend utilities",
        "Data shaping",
        "Data access",
        "Reference materialization"
      ],
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
        "I usually end up doing some mix of **implementation, technical direction, and unblocking other people** at the same time.",
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
        "A lot of the backend work I enjoy sits around **reliability, observability, internal platforms, and the infrastructure that makes product teams faster**.",
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
        "I like being able to **move between layers** instead of getting stuck in only one of them.",
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
