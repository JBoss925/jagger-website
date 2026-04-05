import headshotImage from "../assets/headshot.jpg";
import domesPreview from "../assets/domes-preview.jpg";
import geneticPreview from "../assets/genetic-preview.jpg";
import jaggerscriptPreview from "../assets/jaggerscript-preview.jpg";
import materializePreview from "../assets/materialize-preview.jpg";
import type { ProfileContent } from "../types/content";

export const headshotAsset = headshotImage;

export const profileContent: ProfileContent = {
  name: "Jagger Brulato",
  title: "Full-stack engineer working across product, platform, and language tooling.",
  location: "United States",
  email: "jaggerbrulato@gmail.com",
  heroSummary:
    "I like working on software that crosses boundaries: product work, backend systems, internal tooling, and the weird projects that force you to understand how things actually work.",
  heroBullets: [
    "Most of my work has been some mix of product delivery, platform thinking, and developer-facing tooling.",
    "I’m happiest when I get to move between the UI, the backend, and the operational side of the system.",
    "JaggerScript is the clearest side-project example of that: language design, runtime work, and a browser experience around it."
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
      title: "I’m a full-stack engineer who likes technically demanding work.",
      summary:
        "This is the short version: the work I enjoy tends to sit somewhere between product engineering, platform work, and developer tooling.",
      position: [-8, 3, -1],
      camera: [-1, 1.8, 14],
      target: [-4, 1.4, 0],
      accent: "#57d0ff"
    },
    {
      id: "impact",
      label: "Focus",
      eyebrow: "Focus",
      title: "A lot of the work I care about is really leverage work.",
      summary:
        "Sometimes that means product features. Sometimes it means internal tools, visibility, cleaner abstractions, or a better path for the next engineer touching the code.",
      position: [-2, 0, 1],
      camera: [2, 1.2, 12],
      target: [0, 0.2, 0],
      accent: "#8de7c1"
    },
    {
      id: "experience",
      label: "Experience",
      eyebrow: "Experience",
      title: "Most of my experience has been hands-on across different parts of the stack.",
      summary:
        "These roles are the best quick read on how I work and what kinds of environments I’ve worked in.",
      position: [4, 1.8, -2],
      camera: [5.5, 2.1, 11],
      target: [4.2, 1, -1.5],
      accent: "#f7a95b"
    },
    {
      id: "projects",
      label: "Projects",
      eyebrow: "Projects",
      title: "These are the projects I’d point someone to first.",
      summary:
        "They’re the best examples of the kinds of problems I like spending time on outside of work too.",
      position: [7, -1.6, 0],
      camera: [6.5, 0.6, 12.5],
      target: [6.2, -0.8, 0],
      accent: "#df7dff"
    },
    {
      id: "craft",
      label: "Craft",
      eyebrow: "How I work",
      title: "I care a lot about how the technical pieces fit together.",
      summary:
        "The through-line for me is usually product sense, engineering judgment, and making the system easier to work in over time.",
      position: [1, -3.4, -1],
      camera: [1.8, -1.1, 12.8],
      target: [1.5, -2, -0.5],
      accent: "#ffd36f"
    },
    {
      id: "contact",
      label: "Contact",
      eyebrow: "Contact",
      title: "If this lines up with the kind of work you need done, reach out.",
      summary:
        "Email is the easiest way to get in touch, and the rest is here if you want to look through it first.",
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
      timeframe: "Most recent role",
      location: "",
      summary:
        "Worked on internal platform capabilities and tooling for engineering teams.",
      highlights: [
        "Worked on internal application platform work used by engineering teams.",
        "Built better visibility into cost, availability, and process health.",
        "Spent a lot of time in the space between platform reliability and day-to-day developer experience."
      ],
      tags: ["Platform engineering", "Internal tools", "Observability", "Developer enablement"]
    },
    {
      company: "Google",
      role: "Software Engineer",
      timeframe: "Full-time",
      location: "",
      summary:
        "Worked as a software engineer in a large production environment.",
      highlights: [
        "Got experience shipping in an environment with real scale and mature engineering processes.",
        "Spent time around the kinds of reliability and quality expectations that come with that.",
        "Worked in a place where collaboration and clean execution mattered."
      ],
      tags: ["Production systems", "Scale", "Collaboration", "Quality"]
    },
    {
      company: "Cornell Design & Tech Initiative",
      role: "Developer Lead and Technical Project Manager",
      timeframe: "University leadership",
      location: "Cornell University",
      summary:
        "Led student developers while still staying hands-on with implementation and technical direction.",
      highlights: [
        "Worked across web, Android, iOS, Windows, and backend services.",
        "Handled technical direction for the Cue subteam.",
        "Did a lot of onboarding, unblocking, and feature work at the same time."
      ],
      tags: ["Leadership", "Full-stack", "Mentorship", "Product delivery"]
    },
    {
      company: "Lowe’s",
      role: "Software Engineering Intern",
      timeframe: "Summer internship",
      location: "Merchandising systems",
      summary:
        "Worked on Lowe’s Central Price Master across frontend, backend services, and DevOps tooling.",
      highlights: [
        "Built frontend features in Angular and TypeScript.",
        "Worked on backend APIs in Spring Boot and Java.",
        "Used the surrounding delivery stack: GCP, Docker, Jenkins, Jira, and Bitbucket."
      ],
      tags: ["Angular", "Spring Boot", "Java", "DevOps"]
    },
    {
      company: "Velocitor",
      role: "Software Engineer Intern",
      timeframe: "Mobile engineering internship",
      location: "Cross-platform mobile",
      summary:
        "Built cross-platform mobile software in C# and Xamarin for client projects.",
      highlights: [
        "Worked on client applications for things like inventory, driver tracking, and scheduling.",
        "Built in a cross-platform mobile stack before that workflow became more common.",
        "Got early experience shipping software tied to real operational use cases."
      ],
      tags: ["C#", "Xamarin", "Mobile", "Client delivery"]
    }
  ],
  projects: [
    {
      slug: "jaggerscript",
      title: "JaggerScript",
      description:
        "A small object-oriented language with its own parser, interpreter, and browser playground.",
      impact:
        "This is probably the most complete example of the kind of side project I like building.",
      stack: ["TypeScript", "PEG parser", "Interpreter", "Browser tooling"],
      image: jaggerscriptPreview,
      links: [
        { label: "Open Playground", href: "/jaggerscript" },
        { label: "Source", href: "https://github.com/JBoss925/JaggerScript" }
      ]
    },
    {
      slug: "domes",
      title: "Domes",
      description:
        "An online multiplayer board game inspired by Santorini.",
      impact:
        "I built it because I like stateful interactive systems, especially when the product side and the technical side are tightly coupled.",
      stack: ["Realtime gameplay", "Web app", "State management"],
      image: domesPreview,
      links: [
        { label: "Legacy Demo", href: "https://jagger.netlify.app/domes/" }
      ]
    },
    {
      slug: "genetic-ts",
      title: "Genetic Algorithms in TypeScript",
      description:
        "A rebuilt interactive simulation where a genetic algorithm learns the launch velocity needed to hit a target.",
      impact:
        "I wanted this to feel like a real tool: tweak the physics, reroll the target, and watch the population adapt in real time.",
      stack: ["TypeScript", "matter-js", "Genetic algorithms", "Interactive simulation"],
      image: geneticPreview,
      links: [
        {
          label: "Open Demo",
          href: "/genetic-ts"
        },
        { label: "Source", href: "https://github.com/JBoss925/GeneticTS" }
      ]
    },
    {
      slug: "materialize",
      title: "materialize()",
      description:
        "A Firestore utility for resolving reference-heavy data into something easier to consume.",
      impact:
        "It’s a small example, but it shows the kind of backend utility work I enjoy writing.",
      stack: ["TypeScript", "Firestore", "Backend utilities", "Data shaping"],
      image: materializePreview,
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
        "I tend to end up in roles where I’m writing code, helping make decisions, and unblocking other people at the same time.",
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
        "A lot of the backend work I enjoy ends up around reliability, observability, and internal architecture.",
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
        "I like not being boxed into one layer of the stack.",
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
      "JaggerScript is a browser-runnable interpreter for a small strongly typed scripting language. I built it because I wanted a project that forced me to own the parser, runtime, and the experience around it.",
    bullets: [
      "The parser, compiler stage, and interpreter are all real parts of the project.",
      "The examples come from the language repo itself.",
      "I wanted the browser route to feel more like a tool than a code sample."
    ]
  }
};
