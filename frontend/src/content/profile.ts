import headshotImage from "../assets/headshot.png";
import domesPreview from "../assets/domes-preview.jpg";
import geneticPreview from "../assets/genetic-preview.jpg";
import jaggerscriptPreview from "../assets/jaggerscript-preview.jpg";
import materializePreview from "../assets/materialize-preview.jpg";
import type { ProfileContent } from "../types/content";

export const headshotAsset = headshotImage;

export const profileContent: ProfileContent = {
  name: "Jagger Brulato",
  title: "Full-Stack Engineer building platforms, distributed systems, and language tools.",
  location: "United States",
  email: "jaggerbrulato@gmail.com",
  heroSummary:
    "I build ambitious software across product surfaces and core infrastructure, with a bias toward hard technical problems, crisp execution, and developer empathy.",
  heroBullets: [
    "Platform-minded engineer focused on systems that help teams ship faster and more confidently.",
    "Comfortable moving from architecture and backend services to polished frontend experiences and developer tooling.",
    "Builder of custom language tooling, browser runtimes, and product-quality demos that make technical depth legible."
  ],
  metrics: [
    { label: "Primary lens", value: "Full-stack leadership" },
    { label: "Technical depth", value: "Distributed systems + PL" },
    { label: "What I optimize", value: "Shipping velocity and clarity" },
    { label: "Signature project", value: "JaggerScript" }
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
      eyebrow: "Systems Atlas",
      title: "A product-minded engineer with systems instincts.",
      summary:
        "The opening frame establishes breadth: platform work, distributed systems, and language tooling in one cohesive story.",
      position: [-8, 3, -1],
      camera: [-1, 1.8, 14],
      target: [-4, 1.4, 0],
      accent: "#57d0ff"
    },
    {
      id: "impact",
      label: "Impact",
      eyebrow: "Why Me",
      title: "I like technical work that creates leverage for other engineers.",
      summary:
        "The through-line is enablement: stronger platforms, better runtime visibility, and cleaner paths from idea to shipped product.",
      position: [-2, 0, 1],
      camera: [2, 1.2, 12],
      target: [0, 0.2, 0],
      accent: "#8de7c1"
    },
    {
      id: "experience",
      label: "Experience",
      eyebrow: "Execution",
      title: "Leadership, ownership, and hands-on delivery across the stack.",
      summary:
        "The experience arc highlights platform engineering, large-scale software environments, technical leadership, and shipping across multiple surfaces.",
      position: [4, 1.8, -2],
      camera: [5.5, 2.1, 11],
      target: [4.2, 1, -1.5],
      accent: "#f7a95b"
    },
    {
      id: "projects",
      label: "Projects",
      eyebrow: "Proof",
      title: "Distinctive projects that show range without feeling scattered.",
      summary:
        "The project set reinforces the story: language tooling, simulation, gameplay systems, and backend utilities with real engineering texture.",
      position: [7, -1.6, 0],
      camera: [6.5, 0.6, 12.5],
      target: [6.2, -0.8, 0],
      accent: "#df7dff"
    },
    {
      id: "craft",
      label: "Craft",
      eyebrow: "Stack",
      title: "I care about architecture, team effectiveness, and developer experience at the same time.",
      summary:
        "This section makes the leadership story concrete through tools, habits, and technical domains rather than generic self-descriptions.",
      position: [1, -3.4, -1],
      camera: [1.8, -1.1, 12.8],
      target: [1.5, -2, -0.5],
      accent: "#ffd36f"
    },
    {
      id: "contact",
      label: "Close",
      eyebrow: "Next Step",
      title: "If the role values technical ownership, I’d love to talk.",
      summary:
        "The ending should feel clear and confident: here is the work, here is the resume, and here is how to reach me.",
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
        "Built internal platform capabilities that helped engineering teams serve clients more efficiently and reason about live systems with better operational context.",
      highlights: [
        "Supported a streamlined internal application platform for engineering teams.",
        "Worked on visibility into cost, availability, and live process health through internal dashboards.",
        "Reinforced a platform-as-a-service mindset around reliability, architecture, and developer efficiency."
      ],
      tags: ["Platform engineering", "Internal tools", "Observability", "Developer enablement"]
    },
    {
      company: "Google",
      role: "Software Engineer",
      timeframe: "Full-time",
      location: "",
      summary:
        "Contributed as a full-time software engineer in a high-scale production environment where quality, collaboration, and engineering rigor mattered.",
      highlights: [
        "Worked in a production setting that demanded clean execution and strong engineering fundamentals.",
        "Sharpened instincts around scale, reliability, and collaborative software delivery.",
        "Added credibility to the story of shipping in large, mature engineering organizations."
      ],
      tags: ["Production systems", "Scale", "Collaboration", "Quality"]
    },
    {
      company: "Cornell Design & Tech Initiative",
      role: "Developer Lead and Technical Project Manager",
      timeframe: "University leadership",
      location: "Cornell University",
      summary:
        "Led developers across platforms while staying hands-on with full-stack implementation, technical decision-making, onboarding, and delivery.",
      highlights: [
        "Oversaw application development across multiple platforms and maintenance paths.",
        "Managed technical direction for the Cue subteam across web, Android, iOS, Windows, and backend services.",
        "Taught, onboarded, and unblocked other developers while shipping features directly."
      ],
      tags: ["Leadership", "Full-stack", "Mentorship", "Product delivery"]
    },
    {
      company: "Lowe’s",
      role: "Software Engineering Intern",
      timeframe: "Summer internship",
      location: "Merchandising systems",
      summary:
        "Worked on Lowe’s Central Price Master, touching frontend, backend microservices, and DevOps workflows in a modern enterprise stack.",
      highlights: [
        "Implemented frontend work in Angular and TypeScript.",
        "Built backend microservice APIs in Spring Boot and Java.",
        "Worked with GCP, Docker, Jenkins, Jira, and Bitbucket as part of the delivery flow."
      ],
      tags: ["Angular", "Spring Boot", "Java", "DevOps"]
    },
    {
      company: "Velocitor",
      role: "Software Engineer Intern",
      timeframe: "Mobile engineering internship",
      location: "Cross-platform mobile",
      summary:
        "Built cross-platform mobile solutions in C# and Xamarin for clients with operationally meaningful use cases like inventory, driver tracking, and scheduling.",
      highlights: [
        "Used C# and Xamarin before Microsoft’s broader Visual Studio integration.",
        "Helped support simultaneous cross-platform mobile development.",
        "Worked on practical, real-world client applications rather than toy internal demos."
      ],
      tags: ["C#", "Xamarin", "Mobile", "Client delivery"]
    }
  ],
  projects: [
    {
      slug: "jaggerscript",
      title: "JaggerScript",
      description:
        "A strongly typed, object-oriented scripting language with a browser-based interpreter and playground.",
      impact:
        "The project makes the deeper engineering story visible: parser design, intermediate representations, runtime behavior, and a developer-facing execution surface.",
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
        "An online multiplayer board game inspired by Santorini, built as an interactive systems-heavy side project.",
      impact:
        "Useful as a signal that I enjoy stateful product experiences and the engineering work that makes real-time interaction coherent.",
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
        "A demo and learning library that teaches an AI to throw a ball at a target using a custom genetic algorithm implementation.",
      impact:
        "Shows the ability to make algorithmic ideas approachable through interaction instead of burying them in abstract code alone.",
      stack: ["TypeScript", "Simulation", "ML concepts", "Visualization"],
      image: geneticPreview,
      links: [
        {
          label: "GitHub",
          href: "https://github.com/cornell-dti/Devsesh-GeneticTSAlgorithms"
        },
        { label: "Legacy Demo", href: "https://jagger.netlify.app/genetic/" }
      ]
    },
    {
      slug: "materialize",
      title: "materialize()",
      description:
        "A recursive Firestore utility that resolves reference-heavy data into client-ready structures with bounded depth.",
      impact:
        "A compact example of writing backend abstractions that make product teams faster without adding conceptual overhead for consumers.",
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
      title: "Leadership and team leverage",
      summary:
        "I’m most valuable when I can pair execution with structure, helping teams ship while clarifying the technical path forward.",
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
        "The backend and platform side of my work tends to center on reliability, architecture visibility, and operational clarity.",
      items: [
        "Distributed systems",
        "Platform engineering",
        "Cloud computing",
        "Observability",
        "Performance-minded design"
      ]
    },
    {
      title: "Product and implementation range",
      summary:
        "I’m comfortable moving from polished interfaces to service layers, developer tools, and runtime internals without losing the product narrative.",
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
    headline: "A language project that feels like an actual product experience.",
    summary:
      "JaggerScript is a browser-runnable interpreter for a strongly typed, OO-style scripting language. It is both a technical artifact and a communication tool: a way to show parser work, execution semantics, and runtime behavior in a form other people can actually explore.",
    bullets: [
      "Parser, compiler stage, and interpreter live inside the repo rather than being faked for presentation.",
      "Examples come directly from the language test programs, so the playground reflects the real runtime surface.",
      "The browser route is meant to feel like a compact IDE, not just a code block with a run button."
    ]
  }
};
