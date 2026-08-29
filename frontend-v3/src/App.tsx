import { useEffect, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { profileContent } from "../../shared/content/profile";
import type { ExperienceEntry, ProjectEntry } from "../../shared/types/content";

const projectMeta: Record<string, { type: string; language: string; status: string; ext: string }> = {
  ojaml: { type: "compiler", language: "TypeScript", status: "active", ext: "ml" },
  hearth: { type: "audio DSP", language: "GenExpr", status: "released", ext: "gen" },
  jaggerscript: { type: "language", language: "TypeScript", status: "stable", ext: "ts" },
  "genetic-learners": { type: "simulation", language: "TypeScript", status: "stable", ext: "ts" },
  "jagger-games": { type: "games", language: "TypeScript", status: "active", ext: "ts" },
  jetstream: { type: "application", language: "TypeScript", status: "stable", ext: "ts" },
  rengine: { type: "renderer", language: "TypeScript", status: "experiment", ext: "ts" },
  "tsxlight-renderer": { type: "renderer", language: "TypeScript", status: "research", ext: "tsx" }
};

const roleExt = (job: ExperienceEntry) => job.company === "Google" ? "java" : job.company === "Red Ventures" ? "go" : job.company.includes("Incite") ? "py" : job.company.includes("Velocitor") ? "cs" : "ts";
const metaFor = (project: ProjectEntry) => projectMeta[project.slug] ?? { type: project.icon ?? "project", language: project.stack[0] ?? "TypeScript", status: "stable", ext: "ts" };
const clean = (value: string) => value.replace(/\*\*(.*?)\*\*/g, "$1");
const externalize = (href: string) => href.startsWith("/") ? `https://jaggerbrulato.com${href}` : href;

type EditorTab = { path: string; label: string; icon: string };

function tabForPath(path: string): EditorTab {
  if (path === "/") return { path, label: "README.md", icon: "md" };
  if (path === "/focus") return { path, label: "focus.md", icon: "md" };
  if (path === "/experience") return { path, label: "README.md", icon: "md" };
  if (path === "/projects") return { path, label: "README.md", icon: "md" };
  if (path === "/reference/stack") return { path, label: "stack.json", icon: "json" };
  if (path === "/reference/principles") return { path, label: "principles.md", icon: "md" };
  if (path === "/contact") return { path, label: "contact.md", icon: "md" };
  if (path === "/map") return { path, label: "system-map.graph", icon: "map" };
  const job = profileContent.experience.find((item) => path === `/experience/${item.slug}`);
  if (job) return { path, label: `${job.company.toLowerCase().replaceAll(" ", "-")}.${roleExt(job)}`, icon: roleExt(job) };
  const project = profileContent.projects.find((item) => path === `/projects/${item.slug}`);
  if (project) return { path, label: `${project.slug}.${metaFor(project).ext}`, icon: metaFor(project).ext };
  return { path, label: path.split("/").filter(Boolean).pop() ?? "README.md", icon: "md" };
}

function Line({ n, children, active }: { n: number; children?: ReactNode; active?: boolean }) {
  return <div className={`code-line${active ? " code-line--active" : ""}`}><span className="line-number">{String(n).padStart(2, "0")}</span><div>{children}</div></div>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="doc-section"><h2>{title}</h2>{children}</section>;
}

function Home() {
  const current = profileContent.experience[0];
  return <Document title="README.md">
    <Line n={1}><h1><i>#</i> Jagger Brulato</h1></Line><Line n={2} />
    <Line n={3}><p className="lead">senior full-stack engineer</p></Line>
    <Line n={4}><p className="syntax-list">product <b>·</b> systems <b>·</b> backend <b>·</b> platform <b>·</b> infrastructure</p></Line><Line n={5} />
    <Line n={6}><p>{profileContent.sceneSections[0].summary}</p></Line><Line n={7} />
    <Line n={8}><span className="label">currently:</span></Line>
    <Line n={9} active><Link className="current-role" to={`/experience/${current.slug}`}>→ {current.role} @ {current.company}</Link></Line><Line n={10} />
    <Line n={11}><span className="label">previously:</span></Line>
    {profileContent.experience.slice(1, 5).map((job, index) => <Line n={12 + index} key={job.slug}><Link className="inline-link" to={`/experience/${job.slug}`}>→ {job.company}</Link></Line>)}
    <Line n={16} /><Line n={17}><div className="link-row">{profileContent.links.map((link) => <a key={link.label} href={externalize(link.href)}>{link.label.toLowerCase()}</a>)}</div></Line>
    <Line n={18} /><Line n={19}><div className="divider" /></Line><Line n={20} />
    <Line n={21}><h2><i>›</i> focus</h2></Line><Line n={22} />
    <Line n={23}><div className="focus-grid">
      <article><b>01 / full-stack systems</b><p>user experience<br />↓<br />frontend state<br />↓<br />API / services<br />↓<br />data + events<br />↓<br />infrastructure</p></article>
      <article><b>02 / systems thinking</b><p>queues · boundaries · observability · failure modes · rollout paths · consistency · runtime behavior</p></article>
      <article><b>03 / developer experience</b><p>platforms · APIs · CI/CD · Terraform · dashboards · internal tooling · deployment systems</p></article>
    </div></Line><Line n={24} /><Line n={25}><div className="divider" /></Line><Line n={26} />
    <Line n={27}><h2><i>›</i> selected projects</h2></Line><Line n={28} />
    <Line n={29}><ProjectTable projects={profileContent.projects.slice(0, 6)} /></Line>
  </Document>;
}

function Document({ title, children }: { title: string; children: ReactNode }) {
  useEffect(() => { document.title = `${title} — Jagger Brulato`; }, [title]);
  return <div className="document">{children}</div>;
}

function ExperienceIndex() {
  return <Document title="experience/README.md"><div className="plain-doc"><p className="path">~/jagger/experience/README.md</p><h1><i>#</i> Experience</h1><p className="muted">2016 ───────────────────────────── 2026</p>
    <div className="experience-table">{profileContent.experience.map((job) => <Link to={`/experience/${job.slug}`} key={job.slug}><time>{job.timeframe.replace("Present", "now")}</time><strong>{job.company}</strong><span>{job.role}</span>{job === profileContent.experience[0] && <em>[active]</em>}</Link>)}</div>
  </div></Document>;
}

function ExperienceDetail() {
  const { slug } = useParams(); const job = profileContent.experience.find((item) => item.slug === slug);
  if (!job) return <Navigate to="/experience" replace />;
  return <Document title={`experience/${job.company.toLowerCase()}.${roleExt(job)}`}><div className="plain-doc detail-doc"><p className="path">experience/{job.company.toLowerCase().replaceAll(" ", "-")}.{roleExt(job)}</p>
    <header className="detail-header"><div><h1>{job.company}</h1><p>{job.role}</p></div><div><time>{job.timeframe.replace("Present", "now").replace("-", " → ")}</time><span>{job.location}</span></div></header>
    <Section title="scope"><p>{job.summary}</p></Section>
    <Section title="selected work"><ol className="numbered-list">{job.highlights.map((item, i) => <li key={item}><span>{String(i + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol></Section>
    <Section title="stack"><div className="tech-list">{job.tags.map((tag) => <span key={tag.label}>{tag.label}</span>)}</div></Section>
  </div></Document>;
}

function ProjectTable({ projects }: { projects: ProjectEntry[] }) {
  return <div className="project-table"><div className="table-head"><span>NAME</span><span>TYPE</span><span>LANG</span><span>STATUS</span></div>{projects.map((project) => { const meta = metaFor(project); return <Link to={`/projects/${project.slug}`} key={project.slug}><strong>{project.title}</strong><span>{meta.type}</span><span>{meta.language}</span><em className={`status-${meta.status}`}>{meta.status}</em></Link>; })}</div>;
}

function Projects() {
  const [selected, setSelected] = useState(profileContent.projects[0]);
  return <Document title="projects/README.md"><div className="plain-doc"><p className="path">~/jagger/projects/README.md</p><div className="title-row"><h1><i>#</i> Projects / {profileContent.projects.length}</h1><span>j / k to inspect</span></div>
    <div onMouseLeave={() => setSelected(profileContent.projects[0])}><ProjectTableInteractive projects={profileContent.projects} onSelect={setSelected} /></div>
    <div className="hover-inspector"><span>› {selected.title}</span><p>{clean(selected.description)}</p><div>{selected.links.map((link) => <a key={link.label} href={externalize(link.href)}>{link.label.toLowerCase()} ↗</a>)}</div></div>
  </div></Document>;
}

function ProjectTableInteractive({ projects, onSelect }: { projects: ProjectEntry[]; onSelect: (p: ProjectEntry) => void }) {
  return <div className="project-table"><div className="table-head"><span>NAME</span><span>TYPE</span><span>LANG</span><span>STATUS</span></div>{projects.map((project) => { const meta = metaFor(project); return <Link onFocus={() => onSelect(project)} onMouseEnter={() => onSelect(project)} to={`/projects/${project.slug}`} key={project.slug}><strong>{project.title}</strong><span>{meta.type}</span><span>{meta.language}</span><em className={`status-${meta.status}`}>{meta.status}</em></Link>; })}</div>;
}

function ProjectDetail() {
  const { slug } = useParams(); const project = profileContent.projects.find((item) => item.slug === slug);
  if (!project) return <Navigate to="/projects" replace />;
  const meta = metaFor(project);
  return <Document title={`projects/${project.slug}/README.md`}><div className="plain-doc detail-doc"><p className="path">projects/{project.slug}/README.md</p><h1><i>#</i> {project.title}</h1>
    <dl className="metadata"><div><dt>type</dt><dd>{meta.type}</dd></div><div><dt>language</dt><dd>{meta.language}</dd></div><div><dt>status</dt><dd className="green">{meta.status}</dd></div></dl>
    <p className="project-lead">{clean(project.description)}</p>
    <Section title="interesting bits"><ul className="plus-list">{project.stack.slice(0, 9).map((item) => <li key={item}>+ {item}</li>)}</ul></Section>
    <Section title="why it matters"><p>{clean(project.impact)}</p></Section>
    {project.image && <Section title="preview"><div className="preview-buffer"><img src={project.image} alt={`${project.title} preview`} /></div></Section>}
    <div className="number-links">{project.links.map((link, i) => <a href={externalize(link.href)} key={link.label}>[{String(i + 1).padStart(2, "0")}] {link.label.toLowerCase()} ↗</a>)}</div>
  </div></Document>;
}

function Stack() {
  const groups = [{ name: "daily", items: ["TypeScript", "React", "Node.js", "MongoDB"] }, { name: "production", items: ["Java", "Python", "Go", "PostgreSQL", "Kafka", "Terraform"] }, { name: "systems / projects", items: ["OCaml", "C/C++", "WebAssembly", "DSP", "graphics", "compilers"] }];
  return <Document title="reference/stack.json"><div className="plain-doc"><p className="path">reference/stack.json</p><pre className="manifest"><span>{`{`}</span>{groups.map((g) => <span key={g.name}>  <i>"{g.name}"</i>: [<b>{g.items.map(x => `"${x}"`).join(", ")}</b>],</span>)}<span>{`}`}</span></pre><Section title="domains"><div className="domain-list">{profileContent.skillClusters.flatMap((cluster) => cluster.items).map((x) => <span key={x}>{x}</span>)}</div></Section></div></Document>;
}

function Principles() {
  const values = [["make boundaries obvious", "Systems should make ownership and data flow understandable."], ["design for failure", "Queues, retries, observability, idempotency, and rollout behavior are part of the system."], ["stay close to implementation", "Architecture decisions improve when the person making them understands code and production behavior."], ["optimize for other engineers", "Good abstractions remove work without hiding important behavior."]];
  return <Document title="reference/principles.md"><div className="plain-doc"><p className="path">reference/principles.md</p><h1><i>#</i> Principles</h1><div className="principles-list">{values.map(([title, copy], i) => <article key={title}><span>{String(i + 1).padStart(2, "0")} /</span><div><h2>{title}</h2><p>{copy}</p></div></article>)}</div></div></Document>;
}

const mapGroups = [
  { name: "projects", path: "/projects", nodes: [{ label: "compilers", path: "/projects/ojaml" }, { label: "DSP", path: "/projects/hearth" }, { label: "simulations", path: "/projects/genetic-ts" }] },
  { name: "product", path: "/experience", nodes: [{ label: "React", path: "/reference/stack" }, { label: "Node", path: "/reference/stack" }, { label: "mobile", path: "/experience" }] },
  { name: "systems", path: "/reference/principles", nodes: [{ label: "distributed data", path: "/experience/google-software-engineer" }, { label: "queues", path: "/experience" }, { label: "infrastructure", path: "/reference/stack" }] },
  { name: "platform", path: "/experience/red-ventures-platform-engineer", nodes: [{ label: "Terraform", path: "/experience/red-ventures-platform-engineer" }, { label: "Kubernetes", path: "/experience/red-ventures-platform-engineer" }, { label: "CI/CD", path: "/reference/stack" }] }
];
function SystemMap() {
  const [active, setActive] = useState("systems");
  return <Document title="SYSTEM MAP"><div className="plain-doc map-doc"><p className="path">VIEW / SYSTEM MAP</p><h1><i>:</i> map</h1><p className="muted">hover to inspect · click any node to open its buffer</p><div className="system-map"><Link className="map-root" to="/">JAGGER</Link>{mapGroups.map((group) => <div className={`map-branch${active === group.name ? " active" : ""}`} key={group.name} onMouseEnter={() => setActive(group.name)}><Link className="map-branch-title" to={group.path}>├─ {group.name}</Link><div>{group.nodes.map((node) => <Link key={node.label} to={node.path}>└─ {node.label}</Link>)}</div></div>)}</div><div className="map-results"><span>REFERENCES / {active.toUpperCase()}</span><p>{active === "projects" ? "OJaml · Hearth · JaggerScript · Genetic Learners" : active === "product" ? "Palmetto · Jagger Games · JetStream" : active === "platform" ? "Red Ventures · Google · Palmetto" : "Google · Red Ventures · Palmetto · OJaml runtime"}</p></div></div></Document>;
}

function Contact() { return <Document title="contact"><div className="plain-doc"><p className="path">~/jagger/contact</p><h1><i>#</i> Contact</h1><p className="project-lead">Email is the simplest way to reach me.</p><div className="contact-links"><a href={`mailto:${profileContent.email}`}>{profileContent.email} ↗</a>{profileContent.links.slice(1).map((l) => <a key={l.label} href={externalize(l.href)}>{l.label.toLowerCase()} ↗</a>)}</div></div></Document>; }

function TreeGroup({ label, children }: { label: string; children: ReactNode }) { const [open, setOpen] = useState(true); return <div className="tree-group"><button className="tree-folder" onClick={() => setOpen(!open)}><span>{open ? "▾" : "▸"}</span>{label}</button>{open && <div className="tree-children">{children}</div>}</div>; }
function Explorer({ close }: { close?: () => void }) {
  const { pathname } = useLocation(); const file = (to: string, icon: string, text: string) => <Link onClick={close} className={`tree-file${pathname === to ? " active" : ""}`} to={to}><span className={`file-icon ${icon}`}>{icon === "json" ? "{}" : icon === "md" ? "M↓" : icon.toUpperCase()}</span>{text}</Link>;
  return <aside className="explorer"><div className="panel-title"><span>EXPLORER</span>{close && <button onClick={close}>×</button>}</div><div className="tree-root">JAGGER</div>
    <TreeGroup label="profile">{file("/", "md", "README.md")}{file("/focus", "md", "focus.md")}</TreeGroup>
    <TreeGroup label="experience">{file("/experience", "md", "README.md")}{profileContent.experience.map(j => file(`/experience/${j.slug}`, roleExt(j), `${j.company.toLowerCase().replaceAll(" ", "-")}.${roleExt(j)}`))}</TreeGroup>
    <TreeGroup label="projects">{file("/projects", "md", "README.md")}{profileContent.projects.slice(0, 12).map(p => file(`/projects/${p.slug}`, metaFor(p).ext, `${p.slug}.${metaFor(p).ext}`))}</TreeGroup>
    <TreeGroup label="reference">{file("/reference/stack", "json", "stack.json")}{file("/reference/principles", "md", "principles.md")}{file("/map", "map", "system-map.graph")}{file("/contact", "md", "contact.md")}</TreeGroup>
  </aside>;
}

type Command = { label: string; kind: string; path: string };
function Palette({ close }: { close: () => void }) {
  const navigate = useNavigate(); const [q, setQ] = useState(""); const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);
  const commands: Command[] = [{ label: "README — About", kind: "File", path: "/" }, { label: "Experience index", kind: "Go", path: "/experience" }, { label: "Projects index", kind: "Go", path: "/projects" }, { label: "System map", kind: "View", path: "/map" }, ...profileContent.experience.map(j => ({ label: `${j.company} — ${j.role}`, kind: "Experience", path: `/experience/${j.slug}` })), ...profileContent.projects.map(p => ({ label: p.title, kind: "Project", path: `/projects/${p.slug}` }))];
  const results = commands.filter(c => `${c.kind} ${c.label}`.toLowerCase().includes(q.toLowerCase())).slice(0, 9);
  return <div className="overlay" onMouseDown={close}><div className="palette" onMouseDown={e => e.stopPropagation()}><div className="palette-input"><span>›</span><input ref={input} value={q} onChange={e => setQ(e.target.value)} placeholder="Search files, projects, experience..." onKeyDown={e => { if (e.key === "Enter" && results[0]) { navigate(results[0].path); close(); } }} /></div><div>{results.map(c => <button key={c.path} onClick={() => { navigate(c.path); close(); }}><span>{c.kind}</span><strong>{c.label}</strong></button>)}{!results.length && <p>No symbols found.</p>}</div><footer><span>↵ open</span><span>esc close</span></footer></div></div>;
}

type TerminalEntry = { kind: "system" | "command" | "output" | "success" | "error" | "help"; text: string };

function Terminal({ close, onResizeStart }: { close: () => void; onResizeStart: (event: ReactPointerEvent<HTMLDivElement>) => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [lines, setLines] = useState<TerminalEntry[]>([{ kind: "system", text: "Jagger Development Environment · type 'help' for commands" }]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const run = (e: FormEvent) => {
    e.preventDefault();
    const rawCommand = value.trim();
    const command = rawCommand.toLowerCase();
    if (!command) return;
    setValue(""); setHistory((current) => [...current, rawCommand]); setHistoryIndex(-1);
    if (command === "clear") { setLines([]); return; }
    let output = "command not found — type 'help' to list available commands";
    let kind: TerminalEntry["kind"] = "error";
    if (command === "help") { output = "NAVIGATION\n  about                 open README.md\n  experience [company]  inspect roles\n  projects              list project modules\n  open [project]         inspect a project\n\nREFERENCE\n  skills                 open stack.json\n  map                    open system map\n  resume                 open resume.pdf\n  contact                open contact.md\n\nSYSTEM\n  ls · whoami · uname -a · git log · clear\n\nUse ↑ / ↓ to recall command history."; kind = "help"; }
    else if (["about", "cat readme.md", "whoami"].includes(command)) { navigate("/"); output = "opened README.md · Jagger Brulato — senior full-stack engineer"; kind = "success"; }
    else if (command.startsWith("experience")) { const term = command.split(" ")[1]; const job = term && profileContent.experience.find(j => j.company.toLowerCase().includes(term)); navigate(job ? `/experience/${job.slug}` : "/experience"); output = job ? `opened ${job.company.toLowerCase()}.${roleExt(job)}` : `indexed ${profileContent.experience.length} experience files`; kind = "success"; }
    else if (command === "projects" || command === "ls") { navigate("/projects"); output = `indexed ${profileContent.projects.length} project modules`; kind = "success"; }
    else if (command.startsWith("open ")) { const term = command.slice(5); const project = profileContent.projects.find(x => x.slug.includes(term) || x.title.toLowerCase().includes(term)); if (project) { navigate(`/projects/${project.slug}`); output = `opened ${project.slug}.${metaFor(project).ext}`; kind = "success"; } else output = `project not found: ${term}`; }
    else if (command === "skills") { navigate("/reference/stack"); output = "opened stack.json"; kind = "success"; }
    else if (command === "map" || command === ":map") { navigate("/map"); output = "resolved system-map.graph"; kind = "success"; }
    else if (command === "contact") { navigate("/contact"); output = `opened contact.md · ${profileContent.email}`; kind = "success"; }
    else if (command === "resume") { window.open("https://jaggerbrulato.com/files/resume.pdf", "_blank"); output = "opened resume.pdf"; kind = "success"; }
    else if (command === "uname -a") { output = "jagger.dev 3.0.0 · TypeScript/React · x86_64"; kind = "output"; }
    else if (command === "git log") { output = profileContent.experience.slice(0, 5).map(j => `${j.timeframe.padEnd(13)} ${j.company}`).join("\n"); kind = "output"; }
    setLines((current) => [...current, { kind: "command", text: rawCommand }, { kind, text: output }]);
  };

  const recallHistory = (direction: -1 | 1) => {
    if (!history.length) return;
    if (historyIndex === -1 && direction === 1) return;
    const next = historyIndex === -1 ? (direction === -1 ? history.length - 1 : -1) : historyIndex + direction;
    if (next < 0) { setHistoryIndex(0); setValue(history[0]); }
    else if (next >= history.length) { setHistoryIndex(-1); setValue(""); }
    else { setHistoryIndex(next); setValue(history[next]); }
  };

  const focusCommandLine = (event: ReactPointerEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, input, .terminal-resizer")) return;
    event.preventDefault();
    inputRef.current?.focus({ preventScroll: true });
  };

  return <section className="terminal" onPointerDownCapture={focusCommandLine}>
    <div className="terminal-resizer" onPointerDown={onResizeStart} aria-label="Resize terminal" />
    <header><span>TERMINAL <i>jagger</i></span><span className="terminal-shortcut">ctrl + `</span><button onClick={close} aria-label="Close terminal">×</button></header>
    <div className="terminal-output" aria-live="polite">{lines.map((line, index) => line.kind === "command" ? <div className="terminal-entry terminal-entry--command" key={index}><span>jagger@portfolio ~/ $</span><strong>{line.text}</strong></div> : <pre className={`terminal-entry terminal-entry--${line.kind}`} key={index}>{line.text}</pre>)}</div>
    <form onSubmit={run}><label htmlFor="terminal-input"><span>jagger@portfolio</span> <i>~/</i> $</label><input id="terminal-input" ref={inputRef} autoFocus spellCheck={false} autoComplete="off" value={value} onChange={e => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "ArrowUp") { e.preventDefault(); recallHistory(-1); } if (e.key === "ArrowDown") { e.preventDefault(); recallHistory(1); } }} /></form>
  </section>;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [terminal, setTerminal] = useState(false);
  const [fileMenu, setFileMenu] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [terminalHeight, setTerminalHeight] = useState(240);
  const [tabs, setTabs] = useState<EditorTab[]>(() => [tabForPath(location.pathname)]);
  const [draggedTabPath, setDraggedTabPath] = useState<string | null>(null);

  useEffect(() => {
    const nextTab = tabForPath(location.pathname);
    setTabs((current) => current.some((tab) => tab.path === nextTab.path) ? current.map((tab) => tab.path === nextTab.path ? nextTab : tab) : [...current, nextTab]);
    setFileMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(true); }
      if (e.ctrlKey && e.key === "`") { e.preventDefault(); setTerminal((value) => !value); }
      if (e.key === "Escape") { setPalette(false); setDrawer(false); setFileMenu(false); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  const beginResize = (event: ReactPointerEvent, mode: "sidebar" | "terminal") => {
    event.preventDefault();
    const start = mode === "sidebar" ? event.clientX : event.clientY;
    const initial = mode === "sidebar" ? sidebarWidth : terminalHeight;
    document.body.classList.add("is-resizing");
    const move = (pointerEvent: PointerEvent) => {
      if (mode === "sidebar") setSidebarWidth(Math.max(150, Math.min(440, initial + pointerEvent.clientX - start)));
      else setTerminalHeight(Math.max(120, Math.min(window.innerHeight - 150, initial + start - pointerEvent.clientY)));
    };
    const stop = () => {
      document.body.classList.remove("is-resizing");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };

  const closeTab = (path: string) => {
    const index = tabs.findIndex((tab) => tab.path === path);
    let remaining = tabs.filter((tab) => tab.path !== path);
    if (!remaining.length) remaining = [tabForPath("/")];
    setTabs(remaining);
    if (location.pathname === path) navigate(remaining[Math.min(index, remaining.length - 1)].path);
  };

  const reorderTab = (targetPath: string) => {
    if (!draggedTabPath || draggedTabPath === targetPath) return;
    setTabs((current) => {
      const sourceIndex = current.findIndex((tab) => tab.path === draggedTabPath);
      const targetIndex = current.findIndex((tab) => tab.path === targetPath);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const reordered = [...current];
      const [moved] = reordered.splice(sourceIndex, 1);
      reordered.splice(targetIndex, 0, moved);
      return reordered;
    });
  };

  const status = location.pathname.includes("ojaml") ? ["OCaml/TypeScript", "compiler"] : location.pathname.startsWith("/experience") ? ["TypeScript", "experience"] : location.pathname === "/map" ? ["Graph", "12 symbols"] : ["TypeScript", "UTF-8"];
  const shellRows = terminal ? `29px minmax(0, 1fr) ${terminalHeight}px 23px` : "29px minmax(0, 1fr) 23px";

  return <div className={`ide-shell${terminal ? " terminal-open" : ""}`} style={{ gridTemplateRows: shellRows }}><header className="menu-bar"><div className="site-id"><b>JB</b> jaggerbrulato.com</div><nav>
      <div className="menu-item"><button onClick={() => setFileMenu((value) => !value)} aria-expanded={fileMenu}>FILE</button>{fileMenu && <div className="file-menu"><Link to="/">Open README.md</Link><a href="https://jaggerbrulato.com/files/resume.pdf">Open resume.pdf</a><button onClick={() => closeTab(location.pathname)}>Close active buffer</button></div>}</div>
      <button onClick={() => setPalette(true)}>GO</button><button onClick={() => navigate("/map")}>VIEW</button><button onClick={() => navigate("/projects")}>PROJECTS</button><button onClick={() => setTerminal((value) => !value)}>TERMINAL</button><button className="contact-command" onClick={() => navigate("/contact")}>CONTACT</button><a className="resume-command" href="https://jaggerbrulato.com/files/resume.pdf" target="_blank" rel="noreferrer">RESUME</a>
    </nav><div className="online"><i /> ONLINE</div><button className="mobile-command" onClick={() => setDrawer(true)}>⌘</button></header>
    <div className="workspace" style={{ gridTemplateColumns: `${sidebarWidth}px 4px minmax(0, 1fr)` }}><Explorer /><div className="sidebar-resizer" onPointerDown={(event) => beginResize(event, "sidebar")} aria-label="Resize explorer" />{drawer && <div className="drawer-backdrop" onClick={() => setDrawer(false)}><div onClick={e => e.stopPropagation()}><Explorer close={() => setDrawer(false)} /></div></div>}
      <main className="editor"><div className="tab-bar">{tabs.map((tab) => <div key={tab.path} draggable className={`tab${location.pathname === tab.path ? " active" : ""}${draggedTabPath === tab.path ? " dragging" : ""}`} onDragStart={(event) => { setDraggedTabPath(tab.path); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", tab.path); }} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }} onDrop={(event) => { event.preventDefault(); reorderTab(tab.path); setDraggedTabPath(null); }} onDragEnd={() => setDraggedTabPath(null)} aria-grabbed={draggedTabPath === tab.path}><button className="tab-select" onClick={() => navigate(tab.path)} title={`${tab.label} — drag to reorder`}><span className={`file-icon ${tab.icon}`}>{tab.icon === "json" ? "{}" : tab.icon === "md" ? "M↓" : tab.icon.toUpperCase()}</span><span>{tab.label}</span></button><button className="tab-close" onClick={() => closeTab(tab.path)} aria-label={`Close ${tab.label}`}>×</button></div>)}</div><div className="breadcrumbs">jagger <span>›</span> {location.pathname.split("/").filter(Boolean).join(" › ") || "README.md"}</div><div className="buffer"><Routes><Route path="/" element={<Home />} /><Route path="/focus" element={<Principles />} /><Route path="/experience" element={<ExperienceIndex />} /><Route path="/experience/:slug" element={<ExperienceDetail />} /><Route path="/projects" element={<Projects />} /><Route path="/projects/:slug" element={<ProjectDetail />} /><Route path="/reference/stack" element={<Stack />} /><Route path="/reference/principles" element={<Principles />} /><Route path="/map" element={<SystemMap />} /><Route path="/contact" element={<Contact />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></div></main></div>
    {terminal && <Terminal close={() => setTerminal(false)} onResizeStart={(event) => beginResize(event, "terminal")} />}{palette && <Palette close={() => setPalette(false)} />}
    <footer className="status-bar"><div><strong>NORMAL</strong><span>main*</span><span>{status[0]}</span></div><div><span>{status[1]}</span><span>Ln 1, Col 1</span><span>Charlotte, NC</span></div></footer></div>;
}

export default App;
