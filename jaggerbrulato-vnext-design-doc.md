# JaggerBrulato.com vNext — Design Document

## 1. Concept

The new site should feel less like an interactive portfolio experience and more like **the personal computing environment of a strong systems/product engineer**.

The current site has substantial content: an introduction, engineering philosophy, detailed experience, a large project catalog, technical tags, and a “how I work” section. The redesign should retain that depth while making it dramatically denser, faster to scan, and more obviously aimed at engineers.

The core direction:

> **A developer portfolio expressed through the visual language of a code editor, terminal, debugger, and systems console, without becoming a terminal gimmick.**

Black canvas. Small typography. Dense information. Sharp edges. Syntax-color accents. Minimal imagery. Fast, restrained animation.

The visitor should immediately think:

**“This person builds software.”**

Not:

**“This person hired someone to make a flashy portfolio.”**

---

## 2. Design principles

### Dense, not crowded

The present portfolio contains enough information that it should not be reduced to a minimalist landing page with three oversized cards. The new design should instead make density part of its personality.

Think:

- Neovim
- VS Code command palette
- `htop`
- Git diff viewers
- debugger interfaces
- Unix man pages
- GitHub's dense engineering surfaces

rather than:

- giant hero typography
- huge whitespace
- floating glass cards
- 3D objects
- parallax showcases
- agency portfolio aesthetics

### Interface first

Almost everything should look like it belongs to one coherent software interface.

Avoid a sequence of visually independent landing-page sections.

Instead, the entire website should feel like **one application whose contents change as you navigate it**.

### Tech references should be functional

There is an important distinction between:

```text
$ cat about.txt
```

being decorative text...

and actually having a command interface through which someone can type:

```text
projects
experience google
open ojaml
skills typescript
```

The latter feels much more authentic.

### Animation should communicate state

No animations merely because something entered the viewport.

Motion should indicate:

- selection
- loading
- navigation
- focus
- expansion
- filtering
- execution
- state changes

That makes the site feel software-like rather than cinematic.

---

## 3. Primary visual concept: Personal Development Environment

I would structure the desktop site like a lightweight editor.

```text
┌─ jaggerbrulato.com ────────────────────────────────────────────────────┐
│ FILE  VIEW  GO  PROJECTS  TERMINAL                         ● ONLINE    │
├──────────────┬─────────────────────────────────────────────────────────┤
│ EXPLORER     │  ~/jagger/README.md                             ×      │
│              │                                                         │
│ ▾ profile    │  # Jagger Brulato                                      │
│   about.md   │                                                         │
│   focus.md   │  senior full-stack engineer                            │
│              │  product · systems · platform · infrastructure          │
│ ▾ experience │                                                         │
│   palmetto   │  I build software across layers.                       │
│   redventures│                                                         │
│   google     │  Currently                                             │
│   cornell    │  → Software Development Engineer III @ Palmetto        │
│              │                                                         │
│ ▾ projects   │  [ github ] [ linkedin ] [ resume ] [ email ]           │
│   ojaml      │                                                         │
│   hearth     │  ----------------------------------------------------   │
│   jaggerscript│                                                        │
│   ...        │  focus                                                  │
│              │                                                         │
│ ▾ reference  │  01  Product → backend → infrastructure                │
│   stack      │  02  Distributed systems                               │
│   principles │  03  Developer tooling                                 │
│              │                                                         │
├──────────────┴─────────────────────────────────────────────────────────┤
│ NORMAL │ main* │ TypeScript │ UTF-8 │                     Charlotte NC │
└────────────────────────────────────────────────────────────────────────┘
```

This should **evoke an editor**, but not clone VS Code.

That distinction is important.

Give it its own visual identity.

---

## 4. Overall layout

### Desktop

#### Top bar: ~28px

Very thin.

```text
jaggerbrulato.com       FILE  VIEW  GO  PROJECTS  TERMINAL       ● ONLINE
```

Possible interactions:

- `FILE` → resume/download/contact
- `GO` → command/search interface
- `PROJECTS` → project switcher
- `TERMINAL` → opens actual interactive command pane

But keep these secondary.

#### Left rail: 190–230px

A persistent file-tree representation of the site.

```text
PROFILE
├─ about.md
└─ focus.md

EXPERIENCE
├─ palmetto.ts
├─ red-ventures.go
├─ google.java
├─ cornell.ts
└─ ...

PROJECTS
├─ ojaml.ml
├─ hearth.gen
├─ jaggerscript.ts
├─ genetic-ts.ts
├─ jetstream.ts
└─ ...

REFERENCE
├─ stack.json
└─ principles.md
```

The extensions could loosely correspond to the technology most representative of the project/job.

That is a small detail, but exactly the sort of thing another engineer will notice.

Do not make folders gigantic.

Use ~12–13px text and ~24px rows.

#### Main pane

This is where almost all content lives.

Maximum readable width perhaps `900–1050px`, but don't artificially center it in a huge viewport.

Content begins near the left edge of the pane.

That creates the desired code/editor density.

#### Optional right rail

Only display this where useful.

For example, while viewing Google:

```text
SYMBOLS

Overview
M&A Integration
Pipeline Runtime
Execution
Infrastructure
Technologies
```

For a project:

```text
SYMBOLS

Overview
Architecture
Interesting Bits
Stack
Links
```

This directly borrows the useful concept of an editor's symbol outline.

On smaller desktops, hide it.

---

## 5. Homepage

I would **not** begin with a traditional hero.

The home route should open something analogous to:

```text
~/jagger/README.md
```

### Opening composition

```text
01  # Jagger Brulato
02
03  senior full-stack engineer
04  product · systems · backend · platform · infrastructure
05
06  I build software across layers.
07
08  currently:
09  → Software Development Engineer III @ Palmetto
10
11  previously:
12  → Red Ventures
13  → Google
14  → Cornell DTI
15
16  [github] [linkedin] [resume] [email]
```

Then:

```text
> focus
```

and the three strongest conceptual points currently represented on the site:

```text
01 / full-stack systems

   user experience
        ↓
   frontend state
        ↓
   API / services
        ↓
   data + events
        ↓
   infrastructure


02 / systems thinking

   queues · boundaries · observability · failure modes
   rollout paths · consistency · runtime behavior


03 / developer experience

   platforms · APIs · CI/CD · Terraform · dashboards
   internal tooling · deployment systems
```

This preserves what the current Focus section communicates, but compresses it considerably.

---

## 6. Experience design

Experience is arguably the strongest part of the site and deserves more emphasis than a conventional timeline.

The current site contains detailed work ranging from Palmetto product/backend work through Red Ventures platform engineering and Google's M&A/data systems.

I would treat jobs like source files.

### Experience index

```text
EXPERIENCE                                              2016 ───── 2026

2026 ─ now    PALMETTO                  SDE III              [active]
2024 ─ 2025   RED VENTURES              Platform Engineer
2021 ─ 2024   GOOGLE                    L4 Software Engineer
2020 ─ 2021   CORNELL DTI               Developer Lead
2020          GOOGLE                    SWE Intern
...
```

Hovering a line slightly brightens it and highlights the corresponding period on a subtle timeline.

Clicking opens that role in the main pane.

### Individual role

Instead of:

> giant logo  
> giant heading  
> paragraphs  
> giant tags

use something like:

```text
experience/google.java

Google                                                    2021 → 2024
L4 Software Engineer                               Sunnyvale, CA

scope
─────
Distributed data systems and M&A integration infrastructure.

selected work
─────────────

01  Designed a Beam/Dataflow integration service from scratch that
    automated tech-stack integrations between Google and acquisitions.

02  Built dynamically configured pipelines from protobuf definitions
    with parallel execution and live execution monitoring.

03  Led L3 developers and TVCs building the platform.

04  Built the Java service from first line → production:
    CI/CD · orchestration · roles · encryption · transforms · endpoints

stack
─────
Java    Beam    Dataflow    gRPC    Spanner    BigQuery
Pub/Sub Bazel   protobuf    SQL     PostgreSQL
```

All the richness remains, but the page becomes much easier to scan.

### Logo treatment

Either eliminate company logos entirely or show tiny monochrome 14–18px icons.

The text should carry the design.

---

## 7. Projects

This is where the terminal/editor concept can become especially effective.

The current site already has an unusually broad project collection: OJaml, Hearth, JaggerScript, games, JetStream, Rengine, renderer work, packages, and other experiments.

Rather than giant image cards, make projects resemble processes/packages/modules.

### Project browser

```text
PROJECTS / 12

NAME                 TYPE             LANG          STATUS
──────────────────────────────────────────────────────────────
OJaml                compiler         TypeScript    active
Hearth               audio DSP        GenExpr       released
JaggerScript         language         TypeScript    stable
Genetic Learners     simulation       TypeScript    stable
Jagger Games         games            TypeScript    active
JetStream            application      TypeScript    stable
Rengine              renderer         TypeScript    experiment
TSXLight             renderer         TypeScript    research
...
```

Hover:

```text
> OJaml

OCaml-inspired language and WebAssembly compiler.
HM-style inference · ADTs · modules · structural patterns

↗ demo    ↗ source
```

Click opens full project.

This is far denser and feels appropriate to the content.

---

## 8. Individual project pages

Each should resemble technical documentation rather than a case-study landing page.

Example:

```text
projects/ojaml/README.md

# OJaml

type        programming language / compiler
language    TypeScript
target      WebAssembly
status      active

An OCaml-inspired language and compiler built end-to-end in TypeScript.

architecture
────────────

source
   │
 lexer
   │
 parser
   │
 AST
   │
 inference
   │
 normalized IR
   │
 closure conversion
   │
 WAT emission
   │
 WebAssembly
```

Then:

```text
interesting_bits

+ Hindley-Milner-style inference
+ polymorphic functions
+ signature-checked modules
+ structural patterns
+ ADTs
+ browser Monaco playground
+ Node CLI
```

Links:

```text
[01] open playground
[02] github source
[03] technical paper
```

---

## 9. Images

This redesign should be extremely restrained about imagery.

Most project screenshots should **not appear until the project is selected**.

Even then, don't display large hero images.

Use something resembling a preview buffer:

```text
┌ preview ──────────────────────────────────────┐
│                                              │
│              project screenshot              │
│                                              │
└──────────────────────────────────────────────┘
```

Possibly grayscale initially, with full color appearing on hover/focus.

This keeps the site technical while still demonstrating that the projects actually exist.

---

## 10. Color system

The background should not be pure `#000000`; extremely dark neutral gray generally renders better.

Suggested base:

```text
background       #08090a
surface          #0d0f11
surface-active   #121519

border           #23272e

text-primary     #d5d8dc
text-secondary   #8a9099
text-muted       #555b65
```

Then use syntax-like semantic colors.

```text
cyan        types / links / navigation
green       active / success / current
violet      technologies / symbols
orange      dates / metadata
yellow      command results / highlighted values
red         errors / deprecated / unavailable
blue        external links
```

Important:

### Do not rainbow-color everything.

Most of the UI should remain gray.

Color becomes effective precisely because it is sparse.

For example:

```text
const role: Role = {
  company: "Google",
  title: "Software Engineer",
  years:  "2021–2024"
}
```

could give each syntactic class slightly different coloration.

---

## 11. Typography

Make the entire site monospaced or very nearly so.

My default would be:

**IBM Plex Mono**  
or  
**JetBrains Mono**

Both read well enough for long copy.

Something like:

```css
body:
  font-size: 13px;
  line-height: 1.55;

navigation:
  font-size: 12px;

metadata:
  font-size: 11px;

page title:
  font-size: 24–28px;
```

Do not use 72px portfolio headings.

Even `Jagger Brulato` should probably remain under 32px.

The small scale is part of the aesthetic.

---

## 12. Syntax highlighting as graphic design

This could become one of the site's defining features.

Use syntax conventions throughout ordinary information.

Example:

```ts
const jagger = {
  role: "Senior Full-Stack Engineer",
  interests: [
    "product",
    "distributed systems",
    "platform engineering",
    "programming languages",
  ],
  location: "Charlotte, NC",
};
```

But only sparingly.

I would **not** turn every paragraph into fake JavaScript.

Instead use actual syntax treatments as visual accents:

```text
experience.google
project.ojaml
status = "active"
location: "Charlotte, NC"
```

It should feel natural to engineers, not like a recruiter wrote `while (alive) { code(); }`.

---

## 13. Command palette

Press:

```text
⌘ K
```

or

```text
Ctrl K
```

and open:

```text
> _
```

Search everything.

Typing:

```text
goo
```

produces:

```text
Experience  Google — L4 Software Engineer
Project     Google Scheduler
Skill       Google Cloud Platform
```

Typing:

```text
compiler
```

could return:

```text
OJaml
JaggerScript
Programming Language Design
WebAssembly
Type Systems
```

This is an interaction that is simultaneously:

- useful
- professional
- technically thematic

Far better than adding fake terminal animations merely for aesthetics.

---

## 14. Actual terminal

I would still include one.

But make it **optional**.

Toggle with:

```text
Ctrl + `
```

A ~250px bottom panel slides upward:

```text
jagger@portfolio ~/ $
```

Commands:

```text
help
about
experience
experience google
projects
open ojaml
skills
resume
contact
clear
theme
```

Potential easter eggs:

```text
whoami
uname -a
git log
ls
cat README.md
```

For example:

```text
$ git log --oneline

2026  palmetto
2025  red-ventures
2024  google
2021  cornell
...
```

This is where you can indulge the concept without forcing it upon ordinary visitors.

---

## 15. Vim interactions

Support them without requiring them.

Possible keys:

```text
j / k       next / previous item
gg          top
G           bottom
/           search
:projects   projects
:experience experience
:resume     resume
:contact    email
```

When someone presses `:`, a small command line appears at the bottom.

This will be a very nice detail for exactly the audience you're targeting.

But mouse/touch navigation must remain completely conventional.

---

## 16. Animation language

The current redesign goal calls for animation, but I would radically change its nature.

### Page opening

Instead of flying cameras:

```text
README.md
```

appears.

Then content resolves in over ~150–250ms.

Not letter-by-letter.

Perhaps metadata appears first:

```text
~/jagger/README.md
```

followed by the content pane.

### Navigation

Selecting:

```text
google.java
```

could produce:

```text
README.md  →  google.java
```

with a quick horizontal buffer transition.

~160ms.

No huge slides.

### File tree

Folders use familiar terminal disclosure:

```text
▸ projects
```

to:

```text
▾ projects
```

with a 100ms height reveal.

### Command palette

Fast scale/fade:

```text
opacity 0 → 1
translateY(-4px) → 0
```

~120ms.

### Cursor

An occasional blinking block cursor is enough:

```text
█
```

Do not put blinking cursors everywhere.

### Text loading

For particularly technical sections, you could show a very short parser-like flash:

```text
indexing project...
```

then render.

Keep it under ~200ms so it never becomes friction.

---

## 17. Persistent status bar

One of my favorite pieces of this concept.

Bottom 22–24px:

```text
 NORMAL    main*     TypeScript     UTF-8     Ln 1, Col 1     Charlotte, NC
```

Different pages could alter the language.

OJaml:

```text
 NORMAL    projects/ojaml     OCaml/TypeScript     UTF-8
```

Hearth:

```text
 NORMAL    projects/hearth     GenExpr / DSP     48 kHz
```

Google:

```text
 NORMAL    experience/google     Java     distributed systems
```

Subtle, useful, and fun without being obnoxious.

---

## 18. Skills

I would eliminate the enormous conventional skills badge wall.

Instead create something closer to a package manifest:

```text
stack.json

languages
  TypeScript       ███████████████████
  Java             █████████████████
  Python           ███████████████
  Go               ███████████
  C#               ██████████
  Swift            █████████
  ...

domains
  full-stack
  distributed systems
  platform engineering
  developer tooling
  data pipelines
  programming languages
  mobile
  infrastructure
```

I would avoid fake numerical percentages.

Alternatively, categorize by use:

```text
daily
TypeScript · React · Node · MongoDB

production
Java · Python · Go · PostgreSQL · Kafka · Terraform

systems / projects
OCaml · C/C++ · WebAssembly · DSP · graphics
```

That is much more credible.

---

## 19. How I work

The current site explicitly emphasizes clear systems, practical architecture, maintainable code, leadership, systems/platform work, and breadth across engineering layers.

I would turn this into something like:

```text
principles.md

01 / make boundaries obvious

     Systems should make ownership and data flow understandable.


02 / design for failure

     Queues, retries, observability, idempotency and rollout behavior
     are part of the system, not afterthoughts.


03 / stay close to the implementation

     Architecture decisions are better when the person making them
     understands the code and production behavior.


04 / optimize for other engineers

     Good abstractions remove work without hiding important behavior.
```

This can become one of the strongest parts of the site.

---

## 20. Navigation model

URLs should remain conventional and indexable:

```text
/
 /experience
 /experience/google
 /experience/palmetto

 /projects
 /projects/ojaml
 /projects/hearth

 /reference
 /contact
```

But the visual application can make them feel like:

```text
~/experience/google.java
~/projects/ojaml/README.md
```

Deep linking should continue to work normally.

---

## 21. Mobile

Do **not** attempt to squeeze a fake IDE onto a phone.

Mobile becomes:

```text
jaggerbrulato.com                 [⌘]

README.md

# Jagger Brulato

senior full-stack engineer
product · systems · platform

─────────────────────────────────

> experience

PALMETTO
SDE III
2026 → now

RED VENTURES
Platform Engineer
2024 → 2025

GOOGLE
L4 Software Engineer
2021 → 2024

─────────────────────────────────

> projects
...
```

The explorer becomes an overlay drawer.

The status bar remains at the bottom.

Command palette still works.

No horizontal desktop chrome cosplay.

---

## 22. Small visual details

I would use:

- 0–3px border radius maximum
- 1px borders
- almost no shadows
- no glassmorphism
- no gradients except perhaps extremely subtle syntax glows
- native-looking scrollbars
- 12–14px UI text
- custom text selection color
- thin dividers
- dotted indentation guides in trees
- tiny directory/file icons
- subtle line numbers
- subtle active-line background

Example:

```text
38 │ Built dynamically configured pipelines from protobuf definitions
39 │ with parallel execution and live execution monitoring.
40 │
41 │ Technologies
42 │ Java · Beam · Dataflow · Spanner · BigQuery
   │ █
```

---

## 23. One controlled wow interaction

The redesign still needs something memorable.

I would make it the **system map**.

Run:

```text
:map
```

or choose:

```text
VIEW → SYSTEM MAP
```

and the content pane turns into a minimal interactive dependency graph:

```text
                         ┌─ compilers
                         │
        ┌─ projects ─────┼─ DSP
        │                │
        │                └─ simulations
        │
JAGGER ─┼─ product ───── React
        │                │
        │                Node
        │
        ├─ systems ───── distributed data
        │                queues
        │                infrastructure
        │
        └─ platform ───── Terraform
                         Kubernetes
                         CI/CD
```

Hovering a concept highlights jobs and projects where it appears.

For example, hover:

```text
distributed systems
```

and highlight:

```text
Google
Red Ventures
Palmetto
OJaml runtime
```

This gives you a unique interaction comparable in sophistication to the existing 3D site while being much more aligned with the new aesthetic.

---

## 24. Proposed page hierarchy

```text
jagger/
│
├── README.md
│
├── experience/
│   ├── README.md
│   ├── palmetto.ts
│   ├── red-ventures.go
│   ├── google.java
│   ├── cornell.ts
│   ├── google-intern.java
│   ├── lowes.java
│   ├── incite.py
│   └── velocitor.cs
│
├── projects/
│   ├── README.md
│   ├── ojaml/
│   ├── hearth/
│   ├── jaggerscript/
│   ├── genetic-learners/
│   ├── games/
│   ├── jetstream/
│   ├── rengine/
│   ├── tsxlight/
│   └── ...
│
├── reference/
│   ├── stack.json
│   └── principles.md
│
└── contact
```

The important thing is that this is **the navigation metaphor**, not necessarily the actual source tree.

---

## 25. Homepage priority

A recruiter or engineer should understand the following within ~10 seconds:

```text
Jagger Brulato

Senior full-stack engineer.

Product
Backend
Distributed systems
Platform
Infrastructure

Palmetto ← current
Red Ventures
Google

OJaml
Hearth
JaggerScript
+ more

GitHub · Resume · Email
```

Then the environment rewards exploration.

This is important because the new design should not sacrifice communication for the terminal concept.

---

## 26. What I would specifically remove from the current design

### Remove

- the 3D world entirely
- camera movement
- large spatial separation between subjects
- oversized visual project presentation
- substantial decorative imagery
- big portfolio typography
- floating cards
- excessive scrolling simply to travel between concepts

### Retain

- basically all substantive written content
- project demos
- project deep links
- technical papers
- source links
- resume
- experience detail
- technology metadata
- responsive layout
- the current strong emphasis on technical breadth

The current site already provides enough substantive material to justify a dense information-oriented design.

---

## 27. Tone

The UI copy should be extremely matter-of-fact.

Good:

```text
PROJECTS / 12
```

```text
status: active
```

```text
source ↗
```

```text
built with
```

```text
selected work
```

Avoid:

```text
Explore my journey
```

```text
Welcome to my digital universe
```

```text
Where creativity meets technology
```

The site should assume the visitor is intelligent.

---

## 28. Potential identity

I would **not** brand this as a literal terminal.

The broader metaphor should be:

## Jagger's development environment

The terminal is simply one component.

That opens the door to concepts from:

- editors
- language servers
- Unix
- Git
- debuggers
- package managers
- command palettes
- profilers
- system monitors

without trapping the whole design inside a fake shell.

---

## 29. Suggested implementation architecture

Given that the existing portfolio is React/Vite and already integrates project demos and routing, retaining that foundation makes sense.

I would structure the new frontend around:

```text
<AppShell>
  <MenuBar />
  <Explorer />
  <TabBar />

  <Buffer>
    <RouterView />
  </Buffer>

  <Outline />

  <Terminal />
  <StatusBar />
  <CommandPalette />
</AppShell>
```

And make content strongly data-driven:

```ts
interface Experience {
  slug: string;
  company: string;
  title: string;
  period: DateRange;
  summary: string;
  highlights: Highlight[];
  technologies: string[];
}

interface Project {
  slug: string;
  name: string;
  type: string;
  status: ProjectStatus;
  summary: string;
  description: string[];
  technologies: string[];
  links: Link[];
}
```

The editor should essentially just be a sophisticated renderer/navigation layer over this structured data.

---

## 30. Visual target in one screen

The target I have in mind is roughly:

```text
┌ jaggerbrulato.com ────────────────────────────────────────────────────┐
│ FILE  GO  VIEW  TERMINAL                                      ●      │
├────────────────┬──────────────────────────────────────────────────────┤
│ EXPLORER       │ README.md                                            │
│                │                                                      │
│ ▾ profile      │ 01  # Jagger Brulato                                │
│   README.md    │ 02                                                   │
│   focus.md     │ 03  senior full-stack engineer                      │
│                │ 04  product · backend · systems · platform           │
│ ▾ experience   │ 05                                                   │
│   palmetto.ts  │ 06  I build across the stack, from interface        │
│   redventures  │ 07  behavior through backend systems and infra.     │
│   google.java  │ 08                                                   │
│                │ 09  current                                         │
│ ▾ projects     │ 10  Software Development Engineer III @ Palmetto    │
│   ojaml.ml     │ 11                                                   │
│   hearth.gen   │ 12  previous                                        │
│   jagger.ts    │ 13  Google · Red Ventures · Cornell DTI             │
│                │ 14                                                   │
│ ▾ reference    │ 15  github  linkedin  resume  email                 │
│   stack.json   │ 16                                                   │
│   principles   │ 17  ───────────────────────────────────────────────  │
│                │ 18                                                   │
│                │ 19  SELECTED PROJECTS                               │
│                │ 20                                                   │
│                │ 21  OJaml          compiler       TypeScript        │
│                │ 22  Hearth         audio DSP      GenExpr           │
│                │ 23  JaggerScript   language       TypeScript        │
│                │ 24  JetStream      application    TypeScript        │
│                │ 25                                                   │
├────────────────┴──────────────────────────────────────────────────────┤
│ NORMAL │ main* │ TypeScript │ UTF-8 │                          100%   │
└──────────────────────────────────────────────────────────────────────┘
```

That would be a significant improvement for the audience you're targeting.

It preserves what is unusual about the existing portfolio, namely the sheer amount of engineering work and range, but changes the presentation from **“explore my 3D portfolio”** to **“inspect my work.”**

That phrase could almost be the design philosophy for the entire rewrite:

> **Not a portfolio to explore. A body of work to inspect.**
