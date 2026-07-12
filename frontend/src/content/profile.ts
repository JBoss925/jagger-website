import headshotImage from "../assets/headshot.jpg";
import cornellDtiLogo from "../assets/company-logos/cornell-dti.svg";
import cornellUniversityLogo from "../assets/company-logos/cornell-university.svg";
import googleLogo from "../assets/company-logos/google.png";
import lowesLogo from "../assets/company-logos/lowes.png";
import palmettoLogo from "../assets/company-logos/palmetto.svg";
import redVenturesLogo from "../assets/company-logos/red-ventures.webp";
import velocitorLogo from "../assets/company-logos/velocitor.png";
import compressorPreview from "../assets/compressor-preview.svg";
import geneticPreview from "../assets/genetic-preview.jpg";
import hearthPreview from "../assets/papers/hearth/hearth-1-0-ui.jpg";
import jaggerscriptPreview from "../assets/jaggerscript-preview.jpg";
import jaggerGamesPreview from "../assets/jagger-games-preview.jpg";
import jetstreamPreview from "../assets/jetstream-preview.jpg";
import liveboardPreview from "../assets/liveboard-canvas-editor.jpg";
import monadPreview from "../assets/monad-preview.jpg";
import newReactTypingEffectDemo from "../assets/new-react-typing-effect-demo.gif";
import ojamlPreview from "../assets/ojaml-preview.jpg";
import portfolioPreview from "../assets/portfolio-preview.jpg";
import renginePreview from "../assets/rengine-preview.jpg";
import tsxlightRendererPreview from "../assets/tsxlight-renderer-preview.jpg";
import type { ProfileContent } from "../types/content";

export const headshotAsset = headshotImage;

export const profileContent: ProfileContent = {
  name: "Jagger Brulato",
  title: "Senior full-stack engineer across product, systems, platform, and infrastructure work.",
  location: "United States",
  email: "jagger@jaggerbrulato.com",
  heroSummary:
    "I’m a senior engineer who works across **product, backend, platform, data, infrastructure, and developer tooling**. I like roles where those pieces connect.",
  heroBullets: [
    "I’ve worked at **Google, startups, platform teams, and product teams**.",
    "I can **lead the work, make technical decisions, write the code, mentor engineers, and keep the system understandable as it grows**.",
    "My side projects follow the same pattern: **languages, runtimes, compilers, simulations, games, compression, renderers, and backend utilities**."
  ],
  metrics: [
    { label: "Main lane", value: "Full-stack" },
    { label: "Favorite work", value: "Product" },
    { label: "Also into", value: "Platform + PL" },
    { label: "Start Here", value: "OJaml" }
  ],
  links: [
    { label: "Email", href: "mailto:jagger@jaggerbrulato.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/jaggerbrulato/" },
    { label: "GitHub", href: "https://github.com/JBoss925" },
    { label: "Resume", href: "/files/resume.pdf" }
  ],
  sceneSections: [
    {
      id: "hero",
      label: "Intro",
      eyebrow: "Intro",
      title: "I’m a senior full-stack engineer across product, platform, data, and infrastructure.",
      summary:
        "I’ve built customer apps, backend services, platform automation, data pipelines, dashboards, mobile software, and developer tooling.",
      position: [-8, 3, -1],
      camera: [-1, 1.8, 14],
      target: [-4, 1.4, 0],
      accent: "#57d0ff"
    },
    {
      id: "impact",
      label: "Focus",
      eyebrow: "Focus",
      title: "I like making products, platforms, and internal tools easier to use.",
      summary:
        "That can be a React product surface, a Node service, a Terraform workflow, a Beam pipeline, a Grafana dashboard, or a cleaner API for another engineer.",
      position: [-2, 0, 1],
      camera: [2, 1.2, 12],
      target: [0, 0.2, 0],
      accent: "#8de7c1"
    },
    {
      id: "experience",
      label: "Experience",
      eyebrow: "Experience",
      title: "I’ve worked at Google, startups, platform teams, and product teams.",
      summary:
        "I’ve owned systems end to end: product behavior, backend design, data flow, deployment, observability, and the workflow around it.",
      position: [4, 1.8, -2],
      camera: [5.5, 2.1, 11],
      target: [4.2, 1, -1.5],
      accent: "#f7a95b"
    },
    {
      id: "projects",
      label: "Projects",
      eyebrow: "Projects",
      title: "The projects show how I build outside of work.",
      summary:
        "I build compilers, interpreters, runtimes, simulations, games, compression experiments, renderers, engines, libraries, and backend utilities.",
      position: [7, -1.6, 0],
      camera: [6.5, 0.6, 12.5],
      target: [6.2, -0.8, 0],
      accent: "#df7dff"
    },
    {
      id: "craft",
      label: "Craft",
      eyebrow: "How I work",
      title: "I care about clear boundaries, practical architecture, and maintainable systems.",
      summary:
        "I like code that is easy to understand, easy to change, observable, testable, and built around clear tradeoffs.",
      position: [1, -3.4, -1],
      camera: [1.8, -1.1, 12.8],
      target: [1.5, -2, -0.5],
      accent: "#ffd36f"
    },
    {
      id: "leadership",
      label: "Leadership",
      eyebrow: "Leadership",
      title: "I lead while staying close to the code and the production details.",
      summary:
        "I set direction, make decisions, mentor engineers, organize execution, review code, and do implementation work myself.",
      position: [-5.6, -3.2, 0],
      camera: [-3.9, -0.95, 12.6],
      target: [-4.9, -1.75, 0],
      accent: "#8fc9a3"
    },
    {
      id: "contact",
      label: "Contact",
      eyebrow: "Contact",
      title: "If you need a senior engineer who can lead and build, reach out.",
      summary:
        "Email is the easiest way to reach me. The resume, GitHub, and LinkedIn are here too if you want the longer version first.",
      position: [-10.4, -1.5, 1],
      camera: [-7.6, 0.25, 13],
      target: [-8.8, -0.45, 0],
      accent: "#ff8ca8"
    }
  ],
  experience: [
    {
      slug: "palmetto-software-development-engineer-iii",
      company: "Palmetto",
      role: "Software Development Engineer III",
      timeframe: "2026-Present",
      location: "Charlotte, NC",
      logo: palmettoLogo,
      logoAlt: "Palmetto logo",
      summary:
        "Senior software engineering role at a clean-energy startup, focused on the Palmetto app and the backend services behind its home-energy product experience.",
      highlights: [
        "Building Node/Express services, MongoDB integrations, React product surfaces, and testable flows that help the Palmetto app turn complex home-energy data into a clearer customer experience.",
        "Delivering customer-facing marketplace, rewards, recommendations, referrals, and onboarding features for homeowners moving through solar and energy workflows.",
        "Contributing to solar production, electricity usage, grid export, utility connection, and energy-trend analytics for the newer Solar and Electricity usage experience.",
        "Improving OAuth/JWT/Auth0-backed utility authentication, account state, energy history, and statistics flows across iOS, Android, and web clients.",
        "Supporting idempotent onboarding, account-state, and third-party provider workflows with queue infrastructure so customer actions move reliably across services and app clients."
      ],
      tags: [
        { label: "TypeScript", tone: "language" },
        { label: "JavaScript", tone: "language" },
        { label: "React", tone: "framework" },
        { label: "Three.js", tone: "framework" },
        { label: "Node.js", tone: "framework" },
        { label: "Express", tone: "framework" },
        { label: "NestJS", tone: "framework" },
        { label: "Vite", tone: "framework" },
        { label: "Webpack", tone: "framework" },
        { label: "Babel", tone: "framework" },
        { label: "MongoDB", tone: "infrastructure" },
        { label: "GCP", tone: "infrastructure" },
        { label: "Docker", tone: "infrastructure" },
        { label: "Kafka", tone: "infrastructure" },
        { label: "RabbitMQ", tone: "infrastructure" },
        { label: "BullMQ", tone: "infrastructure" },
        { label: "Auth0", tone: "infrastructure" },
        { label: "API gateways", tone: "infrastructure" },
        { label: "Senior engineering", tone: "practice" },
        { label: "REST APIs", tone: "practice" },
        { label: "OAuth", tone: "practice" },
        { label: "JWT", tone: "practice" },
        { label: "SSR", tone: "practice" },
        { label: "Testing", tone: "practice" },
        { label: "3D scenes", tone: "practice" },
        { label: "Full-stack", tone: "practice" },
        { label: "Responsive UI", tone: "practice" },
        { label: "Authentication", tone: "practice" },
        { label: "Async event handling", tone: "practice" },
        { label: "Event-driven workflows", tone: "practice" },
        { label: "Idempotent systems", tone: "practice" },
        { label: "Startup engineering", tone: "domain" },
        { label: "Energy data", tone: "domain" },
        { label: "Backend systems", tone: "domain" },
        { label: "Consumer apps", tone: "domain" },
        { label: "Mobile apps", tone: "domain" },
        { label: "Utility integrations", tone: "domain" },
        { label: "Home energy", tone: "domain" },
        { label: "Smart home integration", tone: "domain" }
      ]
    },
    {
      slug: "red-ventures-platform-engineer",
      company: "Red Ventures",
      role: "Platform Engineer",
      timeframe: "2024-2025",
      location: "Fort Mill, SC",
      logo: redVenturesLogo,
      logoAlt: "Red Ventures logo",
      summary:
        "Built internal platform capabilities used by Red Ventures engineers to launch, operate, and understand applications without rebuilding the same infrastructure each time.",
      highlights: [
        "Designed, prototyped, and developed internal applications that turned common launch paths into a few-click platform experience for engineering teams.",
        "Built prototype applications and reusable infrastructure patterns as guides for client teams, allowing future teams to spin up similar projects in minutes.",
        "Built React platform surfaces backed by Golang runtime automation and a custom Terraform provider that generated and deployed infrastructure repeatably.",
        "Worked across Kubernetes/Helm workflows, ECS/Fargate services, routing, domains, and async work queues so client applications could be provisioned and operated through the platform.",
        "Built Grafana dashboards and Databricks reporting pipelines that let engineers analyze cost, availability, process health, and other architecture-shaping metrics."
      ],
      tags: [
        { label: "Golang", tone: "language" },
        { label: "TypeScript", tone: "language" },
        { label: "Python", tone: "language" },
        { label: "React", tone: "framework" },
        { label: "Terraform", tone: "infrastructure" },
        { label: "AWS", tone: "infrastructure" },
        { label: "Redis", tone: "infrastructure" },
        { label: "ECS", tone: "infrastructure" },
        { label: "Fargate", tone: "infrastructure" },
        { label: "SQS", tone: "infrastructure" },
        { label: "nginx", tone: "infrastructure" },
        { label: "API gateways", tone: "infrastructure" },
        { label: "Helm", tone: "infrastructure" },
        { label: "Kubernetes", tone: "infrastructure" },
        { label: "Docker", tone: "infrastructure" },
        { label: "DynamoDB", tone: "infrastructure" },
        { label: "Amazon RDS", tone: "infrastructure" },
        { label: "PostgreSQL", tone: "infrastructure" },
        { label: "Lambda", tone: "infrastructure" },
        { label: "Lambda@Edge", tone: "infrastructure" },
        { label: "Route 53", tone: "infrastructure" },
        { label: "Grafana", tone: "infrastructure" },
        { label: "Databricks", tone: "infrastructure" },
        { label: "Platform automation", tone: "practice" },
        { label: "Custom providers", tone: "practice" },
        { label: "CI/CD", tone: "practice" },
        { label: "Observability", tone: "practice" },
        { label: "Tracing", tone: "practice" },
        { label: "Dashboards", tone: "practice" },
        { label: "ETL pipelines", tone: "practice" },
        { label: "Incident response", tone: "practice" },
        { label: "Cost optimization", tone: "practice" },
        { label: "Developer experience", tone: "practice" },
        { label: "Security governance", tone: "practice" },
        { label: "Platform engineering", tone: "domain" },
        { label: "Web", tone: "domain" },
        { label: "Internal developer platform", tone: "domain" },
        { label: "High-traffic systems", tone: "domain" }
      ]
    },
    /*
    {
      slug: "lowes-software-engineer",
      company: "Lowe’s",
      role: "Software Engineer",
      timeframe: "2024",
      location: "Charlotte, NC",
      logo: lowesLogo,
      logoAlt: "Lowe's logo",
      summary:
        "Worked as a full-time software engineer after interning there earlier, contributing in a large enterprise environment with real production delivery expectations.",
      highlights: [
        "Built and maintained enterprise retail systems in a mature production environment with established delivery processes.",
        "Maintained a suite of 20+ Java microservices, updating Docker images and runtimes, upgrading Alpine base versions, and addressing security vulnerabilities across the service fleet.",
        "Shipped backend changes inside existing stakeholder, review, and release workflows rather than in isolation, keeping changes compatible with a larger retail platform.",
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
    */
    {
      slug: "google-software-engineer",
      company: "Google",
      role: "L4 Software Engineer",
      timeframe: "2021-2024",
      location: "Sunnyvale, CA",
      logo: googleLogo,
      logoAlt: "Google logo",
      summary:
        "Built distributed data systems at Google for M&A integrations, shared data infrastructure, and internal reporting in a high-scale production environment.",
      highlights: [
        "Designed a Beam/Dataflow integration service from scratch that automated tech stack integrations between Google and acquisitions, saving hundreds of engineering hours and ETL software licenses.",
        "Led L3 developers and TVCs on a high-performance, reusable, self-service platform for Google's M&A integration needs.",
        "Built and executed pipelines dynamically from protobuf definitions and user-provided variables, with a live UI for tracking execution so teams could reuse, reconfigure, launch, and iterate on pipelines quickly.",
        "Built the Java codebase from first line to live service, including CI/CD, compute orchestration, role management, encryption, parallel execution, custom transforms, and custom endpoints.",
        "Worked with Bazel, Pub/Sub, Spanner, BigQuery, Bigtable, Cloud SQL, PostgreSQL, GoogleSQL, Capacitor, Cloud Storage, and other databases, sources, and sinks to support flexible batch and streaming pipeline execution.",
        "Surfaced data and metrics used by other Google teams, including accounting, HR, Google Cloud, and acquisition teams powering their own systems."
      ],
      tags: [
        { label: "Java", tone: "language" },
        { label: "SQL", tone: "language" },
        { label: "Bazel", tone: "framework" },
        { label: "Dataflow", tone: "framework" },
        { label: "gRPC", tone: "framework" },
        { label: "Apache Beam", tone: "framework" },
        { label: "Spanner", tone: "infrastructure" },
        { label: "Bigtable", tone: "infrastructure" },
        { label: "BigQuery", tone: "infrastructure" },
        { label: "Pub/Sub", tone: "infrastructure" },
        { label: "Capacitor", tone: "infrastructure" },
        { label: "GoogleSQL", tone: "infrastructure" },
        { label: "Cloud SQL", tone: "infrastructure" },
        { label: "PostgreSQL", tone: "infrastructure" },
        { label: "Cloud Storage", tone: "infrastructure" },
        { label: "Code generation", tone: "practice" },
        { label: "Streaming pipelines", tone: "practice" },
        { label: "ETL", tone: "practice" },
        { label: "Batch processing", tone: "practice" },
        { label: "Protocol buffers", tone: "practice" },
        { label: "Pipeline orchestration", tone: "practice" },
        { label: "Self-service tooling", tone: "practice" },
        { label: "Internal developer tools", tone: "practice" },
        { label: "Graph execution", tone: "practice" },
        { label: "Analytics", tone: "domain" },
        { label: "M&A systems", tone: "domain" },
        { label: "Data pipelines", tone: "domain" },
        { label: "Data warehousing", tone: "domain" },
        { label: "Reporting systems", tone: "domain" },
        { label: "Distributed systems", tone: "domain" },
        { label: "Integration systems", tone: "domain" }
      ]
    },
    {
      slug: "cornell-dti-developer-lead",
      company: "Cornell Design & Tech Initiative",
      role: "Developer Lead",
      timeframe: "2020-2021",
      location: "Cornell University",
      logo: cornellDtiLogo,
      logoAlt: "Cornell Design and Tech Initiative logo",
      summary:
        "Oversaw development across Cornell DTI, a 100+ member student product organization, while staying hands-on with implementation and developer support.",
      highlights: [
        "Helped teams build products for Cornell undergrads, professors, Disability Services, CULift dispatchers, housing search, course planning, office hours, student research, and DTI's own internal operations.",
        "Supported CoursePlan's automatic degree-requirement tracking, Queue Me In's office-hours queue and analytics, Carriage's accessibility ride scheduling, CU Apartments' housing reviews, and IDOL's 100+ member org automation.",
        "Guided React, Vue, Angular, React Native, Flutter, Node, Firebase, GraphQL, and native mobile teams through architecture decisions, release issues, and code review without turning leadership into distance from the code.",
        "Balanced hands-on implementation, product management, design collaboration, code review, mentoring, release support, and practical architecture decisions across multiple products.",
        "Worked with PMs, designers, TPMs, and developers to keep scopes clear, ownership explicit, and production releases moving across semester-based teams.",
        "Improved developer onboarding and review practices so teams could keep shipping software that real Cornell communities used."
      ],
      tags: [
        { label: "TypeScript", tone: "language" },
        { label: "JavaScript", tone: "language" },
        { label: "Java", tone: "language" },
        { label: "Swift", tone: "language" },
        { label: "Kotlin", tone: "language" },
        { label: "Dart", tone: "language" },
        { label: "React", tone: "framework" },
        { label: "Angular", tone: "framework" },
        { label: "Node", tone: "framework" },
        { label: "Flutter", tone: "framework" },
        { label: "Vue.js", tone: "framework" },
        { label: "Svelte", tone: "framework" },
        { label: "Next.js", tone: "framework" },
        { label: "GraphQL", tone: "framework" },
        { label: "React Native", tone: "framework" },
        { label: "MongoDB", tone: "infrastructure" },
        { label: "Firebase", tone: "infrastructure" },
        { label: "Firestore", tone: "infrastructure" },
        { label: "GitHub", tone: "infrastructure" },
        { label: "Figma", tone: "infrastructure" },
        { label: "Leadership", tone: "practice" },
        { label: "REST APIs", tone: "practice" },
        { label: "CI/CD", tone: "practice" },
        { label: "Mentorship", tone: "practice" },
        { label: "Code review", tone: "practice" },
        { label: "Product management", tone: "practice" },
        { label: "Design collaboration", tone: "practice" },
        { label: "Deployment pipelines", tone: "practice" },
        { label: "Release support", tone: "practice" },
        { label: "Developer onboarding", tone: "practice" },
        { label: "Architecture review", tone: "practice" },
        { label: "Web", tone: "domain" },
        { label: "iOS", tone: "domain" },
        { label: "Android", tone: "domain" },
        { label: "Mobile", tone: "domain" },
        { label: "Accessibility", tone: "domain" },
        { label: "EdTech", tone: "domain" },
        { label: "Campus apps", tone: "domain" }
      ]
    },
    {
      slug: "google-swe-intern",
      company: "Google",
      role: "SWE Intern",
      timeframe: "2020",
      location: "Remote",
      logo: googleLogo,
      logoAlt: "Google logo",
      summary:
        "Created an open-source scheduler and roster organizer for Alvin Ailey Dance Company in NYC, building a multi-user full-stack experience shaped closely with clients and stakeholders.",
      highlights: [
        "Held weekly meetings with Alvin Ailey clients and stakeholders to design the product around real scheduling, roster, and dancer operations.",
        "Translated a manual coordination process into role-specific workflows for administrators, schedulers, and dancers using the same shared roster data.",
        "Built Angular and Angular Material interfaces plus custom data structures for drag-and-drop roster editing, administration tools, and dancer self-service time-off requests.",
        "Built the Java/Spring Boot backend with PostgreSQL-backed APIs, access controls, notifications, backup rotations, and collaboration-friendly scheduling flows behind the open-source product."
      ],
      tags: [
        { label: "Java", tone: "language" },
        { label: "TypeScript", tone: "language" },
        { label: "Angular", tone: "framework" },
        { label: "Spring Boot", tone: "framework" },
        { label: "Angular Material", tone: "framework" },
        { label: "JUnit", tone: "framework" },
        { label: "PostgreSQL", tone: "infrastructure" },
        { label: "GCP", tone: "infrastructure" },
        { label: "Full-stack", tone: "practice" },
        { label: "REST APIs", tone: "practice" },
        { label: "CI/CD", tone: "practice" },
        { label: "Authentication", tone: "practice" },
        { label: "Authorization", tone: "practice" },
        { label: "Admin tooling", tone: "practice" },
        { label: "Open source", tone: "practice" },
        { label: "Drag-and-drop UI", tone: "practice" },
        { label: "Backup automation", tone: "practice" },
        { label: "Stakeholder collaboration", tone: "practice" },
        { label: "Web", tone: "domain" },
        { label: "Mobile", tone: "domain" },
        { label: "Mobile notifications", tone: "domain" },
        { label: "Scheduling software", tone: "domain" },
        { label: "Multi-user systems", tone: "domain" }
      ]
    },
    {
      slug: "cornell-dti-technical-project-manager",
      company: "Cornell Design & Tech Initiative",
      role: "Technical Project Manager",
      timeframe: "2017-2020",
      location: "Cornell University",
      logo: cornellDtiLogo,
      logoAlt: "Cornell Design and Tech Initiative logo",
      summary:
        "Led the Cue app subteam while also doing full-stack product work across the interface, backend APIs, and deployment setup that kept the project moving.",
      highlights: [
        "Led the Cue app subteam building native iOS and Android apps plus the web and backend systems that powered Cornell campus-event discovery.",
        "Worked across React/Redux event-management surfaces, Django and Node APIs, shared event data models, and deployment setup so technical decisions stayed connected to the user experience.",
        "Coordinated developers, mentored teammates, reviewed code, collaborated with designers in Figma, managed sprints, and moved the product toward app-store deployment."
      ],
      tags: [
        { label: "TypeScript", tone: "language" },
        { label: "JavaScript", tone: "language" },
        { label: "Python", tone: "language" },
        { label: "Swift", tone: "language" },
        { label: "Java", tone: "language" },
        { label: "Kotlin", tone: "language" },
        { label: "React", tone: "framework" },
        { label: "Redux", tone: "framework" },
        { label: "Django", tone: "framework" },
        { label: "Django REST Framework", tone: "framework" },
        { label: "Node.js", tone: "framework" },
        { label: "Express", tone: "framework" },
        { label: "GraphQL", tone: "framework" },
        { label: "Material UI", tone: "framework" },
        { label: "Webpack", tone: "framework" },
        { label: "MongoDB", tone: "infrastructure" },
        { label: "Firebase", tone: "infrastructure" },
        { label: "Firestore", tone: "infrastructure" },
        { label: "GitHub Actions", tone: "infrastructure" },
        { label: "Heroku", tone: "infrastructure" },
        { label: "AWS", tone: "infrastructure" },
        { label: "GCP", tone: "infrastructure" },
        { label: "Figma", tone: "infrastructure" },
        { label: "REST APIs", tone: "practice" },
        { label: "Product management", tone: "practice" },
        { label: "Agile", tone: "practice" },
        { label: "Code review", tone: "practice" },
        { label: "Mentorship", tone: "practice" },
        { label: "Design collaboration", tone: "practice" },
        { label: "App store deployment", tone: "practice" },
        { label: "Technical direction", tone: "practice" },
        { label: "Project leadership", tone: "practice" },
        { label: "Web", tone: "domain" },
        { label: "Desktop", tone: "domain" },
        { label: "iOS", tone: "domain" },
        { label: "Android", tone: "domain" },
        { label: "Mobile", tone: "domain" }
      ]
    },
    {
      slug: "cornell-dti-full-stack-developer",
      company: "Cornell Design & Tech Initiative",
      role: "Full Stack Developer",
      timeframe: "2017-2019",
      location: "Cornell University",
      logo: cornellDtiLogo,
      logoAlt: "Cornell Design and Tech Initiative logo",
      summary:
        "Worked as a full-stack developer on a Cornell DTI project team, building user interfaces and backend systems across multiple platforms.",
      highlights: [
        "Built native mobile features, supporting React/Redux web interfaces, and other client surfaces used by the Cue events team.",
        "Contributed to Django and Node backend systems, REST APIs, product data, and deployment paths that kept the mobile and web experiences moving together.",
        "Worked on Cue across the student-facing mobile app, organization-facing event management website, and backend APIs for Cornell campus events.",
        "Contributed across both frontend and backend responsibilities, which established the multi-platform full-stack workflow that later carried into team leadership work.",
        "Kept event creation, organization data, discovery flows, and API behavior aligned across the web manager, mobile clients, and backend service."
      ],
      tags: [
        { label: "TypeScript", tone: "language" },
        { label: "JavaScript", tone: "language" },
        { label: "Python", tone: "language" },
        { label: "Swift", tone: "language" },
        { label: "Java", tone: "language" },
        { label: "React", tone: "framework" },
        { label: "Redux", tone: "framework" },
        { label: "Django", tone: "framework" },
        { label: "Django REST Framework", tone: "framework" },
        { label: "Node.js", tone: "framework" },
        { label: "Express", tone: "framework" },
        { label: "Material UI", tone: "framework" },
        { label: "Webpack", tone: "framework" },
        { label: "Heroku", tone: "infrastructure" },
        { label: "Full-stack", tone: "practice" },
        { label: "REST APIs", tone: "practice" },
        { label: "Web", tone: "domain" },
        { label: "iOS", tone: "domain" },
        { label: "Android", tone: "domain" },
        { label: "Mobile", tone: "domain" }
      ]
    },
    {
      slug: "lowes-software-engineering-intern",
      company: "Lowe’s",
      role: "Software Engineering Intern",
      timeframe: "2019",
      location: "Mooresville, NC",
      logo: lowesLogo,
      logoAlt: "Lowe's logo",
      summary:
        "Worked on Lowe's Central Price Master, contributing across frontend, backend microservices, and the surrounding delivery tooling.",
      highlights: [
        "Owned an Angular/TypeScript data-filtering view for Central Price Master end to end, connecting frontend behavior to a backend aggregation service used by internal pricing teams.",
        "Built and maintained Java/Spring Boot microservices supporting Lowe's merchandising and pricing workflows, with PostgreSQL/NoSQL data access, REST APIs, and JUnit coverage around the delivery path.",
        "Worked with Jenkins, Jira, Bitbucket, Docker, GCP, and Google Container Registry as part of the surrounding delivery, testing, security, and infrastructure workflow.",
        "Learned how internal enterprise software moves through real review, release, and operational constraints."
      ],
      tags: [
        { label: "Java", tone: "language" },
        { label: "TypeScript", tone: "language" },
        { label: "SQL", tone: "language" },
        { label: "Angular", tone: "framework" },
        { label: "Spring Boot", tone: "framework" },
        { label: "Maven", tone: "framework" },
        { label: "JUnit", tone: "framework" },
        { label: "PostgreSQL", tone: "infrastructure" },
        { label: "Jenkins", tone: "infrastructure" },
        { label: "Bitbucket", tone: "infrastructure" },
        { label: "Docker", tone: "infrastructure" },
        { label: "GCR", tone: "infrastructure" },
        { label: "GCP", tone: "infrastructure" },
        { label: "NoSQL", tone: "infrastructure" },
        { label: "Jira", tone: "practice" },
        { label: "REST APIs", tone: "practice" },
        { label: "Unit testing", tone: "practice" },
        { label: "Integration testing", tone: "practice" },
        { label: "CI/CD", tone: "practice" },
        { label: "Security", tone: "practice" },
        { label: "End-to-end ownership", tone: "practice" },
        { label: "Web", tone: "domain" },
        { label: "Microservices", tone: "domain" },
        { label: "Enterprise retail systems", tone: "domain" },
        { label: "Pricing systems", tone: "domain" },
        { label: "Merchandising systems", tone: "domain" },
        { label: "Data aggregation", tone: "domain" }
      ]
    },
    {
      slug: "incite-analytics-full-stack-developer",
      company: "Incite Analytics",
      role: "Full Stack Developer",
      timeframe: "2018-2019",
      location: "Cornell University",
      logo: cornellUniversityLogo,
      logoAlt: "Cornell University logo",
      summary:
        "Worked at a cardiovascular health startup, building product functionality that helped track and detect heart problems in patients across mobile clients and backend systems.",
      highlights: [
        "Built patient-facing iOS and Android interfaces for cardiovascular health applications used to track and detect heart problems.",
        "Worked on Django backend systems, SQL/PostgreSQL/MySQL data management, REST APIs, AWS hosting, reporting, testing, and patient-data workflows supporting cardiovascular product behavior.",
        "Worked in a smaller startup environment where communication between product behavior, web/mobile implementation, HIPAA-aware data concerns, and clinical analytics mattered just as much as the code itself.",
        "Helped connect mobile patient-facing workflows with backend data management so product decisions stayed close to real healthcare use cases and reporting needs."
      ],
      tags: [
        { label: "Python", tone: "language" },
        { label: "Swift", tone: "language" },
        { label: "Java", tone: "language" },
        { label: "SQL", tone: "language" },
        { label: "React", tone: "framework" },
        { label: "Django", tone: "framework" },
        { label: "PostgreSQL", tone: "infrastructure" },
        { label: "MySQL", tone: "infrastructure" },
        { label: "AWS", tone: "infrastructure" },
        { label: "Database management", tone: "infrastructure" },
        { label: "Full-stack", tone: "practice" },
        { label: "REST APIs", tone: "practice" },
        { label: "HIPAA", tone: "practice" },
        { label: "ETL", tone: "practice" },
        { label: "Reporting", tone: "practice" },
        { label: "Testing", tone: "practice" },
        { label: "Product engineering", tone: "practice" },
        { label: "Health tech", tone: "domain" },
        { label: "Startup engineering", tone: "domain" },
        { label: "Patient data", tone: "domain" },
        { label: "Clinical analytics", tone: "domain" },
        { label: "Web frontend", tone: "domain" },
        { label: "iOS", tone: "domain" },
        { label: "Android", tone: "domain" },
        { label: "Mobile", tone: "domain" }
      ]
    },
    {
      slug: "velocitor-software-engineer-intern",
      company: "Velocitor",
      role: "Software Engineer Intern",
      timeframe: "2016",
      location: "Charlotte, NC",
      logo: velocitorLogo,
      logoAlt: "Velocitor logo",
      summary:
        "Built cross-platform mobile software in C# and Xamarin for large-client operational applications, while also contributing platform-specific code on both Android and iOS.",
      highlights: [
        "Supported simultaneous C#/.NET and Xamarin development while still handling platform-specific mobile behavior when shared abstractions were not enough.",
        "Wrote Java Android and Objective-C iOS code alongside the shared application layer, including REST API integration, SQLite/local storage, testing, debugging, and app-store deployment work.",
        "Worked on applications for inventory management, live GPS driver tracking, logistics, fleet management, and bus scheduling, so the software was tied directly to real operational use cases.",
        "Built in an environment where cross-platform abstractions still had to respect native mobile behavior, device APIs, offline/local data, and client-specific operational workflows."
      ],
      tags: [
        { label: "C#", tone: "language" },
        { label: "Java", tone: "language" },
        { label: "Objective-C", tone: "language" },
        { label: "Xamarin", tone: "framework" },
        { label: "Xamarin.Forms", tone: "framework" },
        { label: "Xamarin.iOS", tone: "framework" },
        { label: "Xamarin.Android", tone: "framework" },
        { label: ".NET", tone: "framework" },
        { label: "SQLite", tone: "infrastructure" },
        { label: "REST APIs", tone: "practice" },
        { label: "Mobile testing", tone: "practice" },
        { label: "Debugging", tone: "practice" },
        { label: "App store deployment", tone: "practice" },
        { label: "Binding libraries", tone: "practice" },
        { label: "Cross-platform apps", tone: "practice" },
        { label: "Native interop", tone: "practice" },
        { label: "Mobile", tone: "domain" },
        { label: "Android", tone: "domain" },
        { label: "iOS", tone: "domain" },
        { label: "Inventory systems", tone: "domain" },
        { label: "Scheduling software", tone: "domain" },
        { label: "GPS tracking", tone: "domain" },
        { label: "Logistics software", tone: "domain" },
        { label: "Fleet management", tone: "domain" }
      ]
    }
  ],
  projects: [
    {
      slug: "ojaml",
      title: "OJaml",
      description:
        "An OCaml-inspired language and compiler built end to end in TypeScript with **lexing, recursive-descent parsing, Hindley-Milner-style inference, polymorphic functions, typed standard-library schemes, tuples, records, structural pattern matching, polymorphic collections, and WebAssembly emission**.",
      impact:
        "The browser-native Monaco playground and Node CLI run the same pipeline through WABT, with diagnostics, hovers, completions, closure conversion, high-arity function values, floats, strings, tuples, records, arrays, lists, sets, maps, runtime access checks, and compiler-specialization coverage.",
      stack: [
        "OJaml",
        "TypeScript",
        "React",
        "Vite",
        "WebAssembly",
        "WAT emission",
        "WABT",
        "Monaco Editor",
        "Hover metadata",
        "Autocomplete",
        "Recursive descent parser",
        "Static analysis",
        "Hindley-Milner typing",
        "Type inference",
        "Polymorphic functions",
        "Polymorphic stdlib",
        "Closure conversion",
        "Structural patterns",
        "First-class functions",
        "Polymorphic collections",
        "Records",
        "Higher-order functions",
        "CLI tooling",
        "Vitest",
        "Runtime safety checks",
        "Type systems",
        "Compilers"
      ],
      image: ojamlPreview,
      icon: "ojaml",
      links: [
        { label: "Open Editor", href: "/ojaml" },
        { label: "Open Paper", href: "/papers/ojaml" },
        { label: "Source", href: "https://github.com/JBoss925/OJaml" }
      ]
    },
    {
      slug: "liveboard",
      title: "LiveBoard",
      description:
        "A distributed collaborative whiteboard with **realtime sync, Redis-backed fanout, durable PostgreSQL canvas state, transient drag/style previews, shared undo/redo history, live cursors, presence indicators, file management, access control, grouping, transforms, text styling, and infinite-canvas navigation**.",
      impact:
        "FastAPI replicas coordinate through Redis Pub/Sub and shared rate-limit counters while PostgreSQL tracks revisions, history, memberships, and canvas JSON. Clients reconcile durable revisions, recover from gaps or rate limits, and keep remote cursors in sync.",
      stack: [
        "TypeScript",
        "React",
        "Vite",
        "Python",
        "FastAPI",
        "PostgreSQL",
        "Redis",
        "WebSockets",
        "Docker",
        "Docker Compose",
        "SVG editor",
        "Realtime collaboration",
        "Distributed support",
        "Redis Pub/Sub",
        "Durable storage",
        "Transient operations",
        "Live sync",
        "Cursor syncing",
        "Rate limiting",
        "Revision reconciliation",
        "Server-side history",
        "Undo / redo",
        "Presence",
        "Access control",
        "Folder trees",
        "Drag and drop",
        "Infinite canvas",
        "Text controls",
        "Shape grouping",
        "Z-ordering",
        "Operational state"
      ],
      image: liveboardPreview,
      links: [
        { label: "Open Paper", href: "/papers/liveboard" },
        { label: "Source", href: "https://github.com/JBoss925/LiveBoard" }
      ]
    },
    {
      slug: "hearth",
      title: "Hearth",
      description:
        "A Max for Live warm-saturation device with **GenExpr DSP, adaptive tone control, anti-aliased tube drive, flux memory, and transient bloom**.",
      impact:
        "The project combines implementation and research: a real M4L audio effect plus a technical paper explaining the pleasantness-constrained DSP architecture behind it.",
      stack: [
        "Max",
        "Max for Live",
        "Ableton Live",
        "Max 10",
        "GenExpr",
        "Gen DSP",
        "Node.js build tooling",
        "Audio DSP",
        "Saturation",
        "ADAA",
        "Hysteresis",
        "Transient processing",
        "Stereo processing",
        "Research writing"
      ],
      image: hearthPreview,
      links: [
        {
          label: "Download Hearth 1.0",
          href: "https://github.com/JBoss925/Hearth/releases/download/v1.0/Hearth.1.0.amxd"
        },
        { label: "Open Paper", href: "/papers/hearth" },
        { label: "Source", href: "https://github.com/JBoss925/Hearth" }
      ]
    },
    {
      slug: "jaggerscript",
      title: "JaggerScript",
      description:
        "A small typed scripting language with **classes, constructors, scoped member access, control flow, object allocation, and a browser-runnable interpreter**.",
      impact:
        "This is one of the clearest examples of how I like to work: **own the grammar, compiler normalization, heap-backed runtime, Monaco diagnostics, syntax highlighting, examples, and playground interface** around it.",
      stack: [
        "JaggerScript",
        "TypeScript",
        "React",
        "Vite",
        "PEG parser",
        "Monaco Editor",
        "Monarch highlighting",
        "Diagnostics",
        "Object model",
        "Interpreter",
        "Browser tooling",
        "Language design",
        "Runtime systems"
      ],
      image: jaggerscriptPreview,
      icon: "jaggerscript",
      links: [
        { label: "Open Editor", href: "/jaggerscript" },
        { label: "Open Paper", href: "/papers/jaggerscript" },
        { label: "Source", href: "https://github.com/JBoss925/JaggerScript" }
      ]
    },
    {
      slug: "aixc-compressor",
      title: "AIXC Compressor",
      description:
        "A deterministic predictor-based text compression format with **packed hit/miss streams, residual coding, manifest hashing, and multiple predictor backends**.",
      impact:
        "It explores how much archive size can move when encoder and decoder share a predictor contract, with a reference codec, CLI, tests, benchmarks, and a local workbench.",
      stack: [
        "C",
        "Python",
        "Native C extension",
        "C hot paths",
        "Compression",
        "Binary formats",
        "Predictor models",
        "LZP",
        "Hugging Face",
        "PyTorch",
        "Huffman coding",
        "CRC / SHA integrity",
        "CLI tooling",
        "Pytest",
        "Ruff",
        "Benchmarking"
      ],
      image: compressorPreview,
      links: [
        { label: "Open Paper", href: "/papers/aixc-compressor" },
        { label: "Source", href: "https://github.com/JBoss925/aixc-compressor" }
      ]
    },
    {
      slug: "genetic-ts",
      title: "Genetic Algorithms in TypeScript",
      description:
        "An interactive simulation where a **genetic algorithm** learns the launch velocity needed to hit a target under changing gravity, wind, mutation, and population settings.",
      impact:
        "Change the environment, drag the target, rerun the population, and watch the algorithm **adapt in real time** through best-path traces, ghost trajectories, hit-rate metrics, and generation-by-generation feedback.",
      stack: [
        "TypeScript",
        "React",
        "Vite",
        "Matter.js",
        "Vitest",
        "Genetic algorithms",
        "Seeded randomness",
        "Population evolution",
        "Interactive simulation",
        "Physics modeling",
        "Trajectory search",
        "Data visualization",
        "Parameter tuning"
      ],
      image: geneticPreview,
      icon: "genetic",
      links: [
        {
          label: "Open Demo",
          href: "/genetic-ts"
        },
        { label: "Open Paper", href: "/papers/genetic-ts" },
        { label: "Source", href: "https://github.com/JBoss925/GeneticTS" }
      ]
    },
    {
      slug: "jagger-games",
      title: "Jagger Games",
      description:
        "A collection of browser games: **Jordle**, **Jolor**, **Jinx**, **Judoku**, and **Jigsaw** are daily puzzles, while **Domes** is a standalone two-player strategy game.",
      impact:
        "They share the same site architecture, with puzzle generation, local persistence, archive handling where it fits, and responsive game interfaces.",
      stack: [
        "TypeScript",
        "React",
        "Vite",
        "Vitest",
        "Daily puzzles",
        "Word games",
        "Color games",
        "Logic puzzles",
        "Sudoku",
        "Jigsaw puzzles",
        "Local persistence",
        "Deterministic daily seeds",
        "JSON puzzle data",
        "SVG assets",
        "Archive systems",
        "Turn-based gameplay",
        "Game UI",
        "Responsive UI"
      ],
      image: jaggerGamesPreview,
      relatedLinks: [
        {
          label: "Jordle",
          href: "/games/jordle",
          description: "Six-letter word puzzle with daily boards and archives."
        },
        {
          label: "Jolor",
          href: "/games/jolor",
          description: "Color-name guessing game where you dial in the target swatch."
        },
        {
          label: "Jinx",
          href: "/games/jinx",
          description: "Minefield logic puzzle built around reveals, flags, and hints."
        },
        {
          label: "Judoku",
          href: "/games/judoku",
          description: "Compact 6x6 sudoku with notes mode and quick daily solves."
        },
        {
          label: "Jigsaw",
          href: "/games/jigsaw",
          description: "Tile-swap picture puzzle with a new scrambled image each day."
        },
        {
          label: "Domes",
          href: "/games/domes",
          description: "Two-player strategy game about movement, tempo, and board control."
        }
      ],
      links: [
        { label: "Open Games", href: "/games" },
        {
          label: "Source",
          href: "https://github.com/JBoss925/jagger-website/tree/main/frontend/src/features/games"
        }
      ]
    },
    {
      slug: "jetstream",
      title: "JetStream",
      description:
        "A production-oriented weather app that uses **Open-Meteo data**, a React/Vite dashboard, a NestJS backend-for-frontend, and an installable PWA shell.",
      impact:
        "The useful work is in the quality-of-life details: **saved preferences, live and deterministic test modes, direct or backend data paths, rich weather instruments, and service-worker caching** that make it feel like a real app.",
      stack: [
        "TypeScript",
        "React",
        "Vite",
        "NestJS",
        "Node.js",
        "Open-Meteo",
        "REST APIs",
        "Swagger",
        "PWA",
        "Service workers",
        "LocalStorage",
        "NPM workspaces",
        "ESLint",
        "Vitest"
      ],
      image: jetstreamPreview,
      links: [
        { label: "Open App", href: "https://jetstream.jaggerbrulato.com/" },
        { label: "Source", href: "https://github.com/JBoss925/JetStream" }
      ]
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
        "React",
        "Vite",
        "Canvas rendering",
        "Game loops",
        "Entity systems",
        "Scene graphs",
        "Transform hierarchies",
        "Renderer abstraction",
        "Debug visualization",
        "Vitest",
        "Engine architecture"
      ],
      image: renginePreview,
      icon: "rengine",
      links: [
        { label: "Open Demo", href: "/rengine" },
        { label: "Open Paper", href: "/papers/rengine" },
        { label: "Source", href: "https://github.com/JBoss925/Rengine" }
      ]
    },
    {
      slug: "portfolio-site",
      title: "Portfolio Site",
      description:
        "This site: a React/Vite portfolio built around a **3D section backdrop, project deep links, resume delivery, embedded demos, and daily games**.",
      impact:
        "It is the connective tissue for the rest of the work here, combining **frontend polish, routing, responsive project cards, test coverage, and subproject integrations** into one deployable portfolio.",
      stack: [
        "TypeScript",
        "React",
        "Vite",
        "Three.js",
        "@react-three/fiber",
        "@react-three/drei",
        "React Router",
        "Matter.js",
        "Monaco Editor",
        "WABT",
        "KaTeX",
        "Web Audio",
        "Vitest",
        "Playwright",
        "Responsive UI"
      ],
      image: portfolioPreview,
      links: [
        { label: "Open Site", href: "https://jaggerbrulato.com/" },
        { label: "Source", href: "https://github.com/JBoss925/jagger-website" }
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
        "TSX",
        "SSR",
        "Socket.io",
        "Electron",
        "Express",
        "WebSocket",
        "JSDOM",
        "Firebase Admin",
        "Material UI",
        "State management",
        "Page management",
        "Callback registry",
        "Rendering architecture",
        "Realtime UI"
      ],
      image: tsxlightRendererPreview,
      icon: "tsxlight",
      links: [
        { label: "Open Paper", href: "/papers/tsxlight-renderer" },
        { label: "Source", href: "https://github.com/JBoss925/tsxlight-renderer" }
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
        "TypeScript",
        "Component API design",
        "Library design",
        "Reusable components",
        "NPM Packaging",
        "Type declarations",
        "Package publishing",
        "Cursor customization",
        "Text animation",
        "TSLint",
        "Prettier",
        "Animation components"
      ],
      image: newReactTypingEffectDemo,
      icon: "typing-effect",
      links: [
        { label: "NPM", href: "https://www.npmjs.com/package/new-react-typing-effect" },
        { label: "Source", href: "https://github.com/JBoss925/new-react-typing-effect" }
      ]
    },
    {
      slug: "chains",
      title: "Chains",
      description:
        "A TypeScript monadic pattern for wrapping a value, composing transformations over it, changing output types, and layering side behaviors like history or undo on top.",
      impact:
        "It is the kind of abstraction work I enjoy most: simple at the call site, but strong enough to support richer behavior underneath through generic metadata, fluent chaining, history tracking, and undoable state transitions.",
      stack: [
        "TypeScript",
        "Monads",
        "Generics",
        "Type-changing chains",
        "Composable abstractions",
        "Generic metadata",
        "API design",
        "Functional patterns",
        "History / undo",
        "Fluent APIs",
        "State transitions"
      ],
      image: monadPreview,
      links: [
        {
          label: "Reference",
          href: "https://gist.github.com/JBoss925/183ba9fa079ebab1d5f908fbf7725243"
        }
      ]
    }
  ],
  skillClusters: [
    {
      title: "Working with a team",
      summary:
        "I’m useful when a team needs **technical direction, implementation, code review, architecture decisions, and help unblocking other engineers**.",
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
        "A lot of my strongest work is around **platforms, reliability, observability, CI/CD, deployment paths, cloud infrastructure, and asynchronous systems**.",
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
        "I’ve worked across enough layers to **connect product decisions to frontend state, backend APIs, data models, infrastructure, and developer experience**.",
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
    headline: "A language project I built end to end.",
    summary:
      "JaggerScript is a browser-runnable interpreter for a small typed scripting language. I built the parser, compiler stage, runtime, examples, diagnostics, and playground as one complete project.",
    bullets: [
      "The parser, compiler stage, and interpreter are separate parts of the implementation.",
      "The examples are actual programs from the repo, not placeholder demo text.",
      "The browser route is meant to be a usable playground, not a screenshot of an idea."
    ]
  }
};
