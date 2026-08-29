import { useMemo, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { headshotAsset, profileContent } from "../../shared/content/profile";
import type { ProjectEntry } from "../../shared/types/content";

const projectFilters = ["Selected", "Product", "Systems", "Tools", "All"] as const;
type ProjectFilter = (typeof projectFilters)[number];

const filterTerms: Record<Exclude<ProjectFilter, "Selected" | "All">, string[]> = {
  Product: ["react", "game", "mobile", "pwa", "ui", "frontend", "web"],
  Systems: ["compiler", "runtime", "engine", "wasm", "parser", "language", "render", "dsp"],
  Tools: ["library", "api", "tool", "package", "compression", "simulation", "developer"]
};

const orbitDomains = [
  { id: "product", code: "01", label: "Product", detail: "Interfaces, behavior, and resilient user flows." },
  { id: "systems", code: "02", label: "Systems", detail: "Runtime boundaries, data, events, and failure modes." },
  { id: "platform", code: "03", label: "Platform", detail: "Infrastructure and tooling that help teams ship." },
  { id: "craft", code: "04", label: "Craft", detail: "Pragmatic architecture, mentorship, and clear code." }
] as const;

const plainText = (value: string) => value.replace(/\*\*(.*?)\*\*/g, "$1");

function mainSiteHref(path = "") {
  if (import.meta.env.DEV) return `${window.location.protocol}//${window.location.hostname}:5173${path}`;
  return `https://jaggerbrulato.com${path}`;
}

const projectHref = (href: string) => href.startsWith("/") ? mainSiteHref(href) : href;

function matchesFilter(project: ProjectEntry, filter: ProjectFilter, index: number) {
  if (filter === "All") return true;
  if (filter === "Selected") return index < 6;
  const haystack = `${project.title} ${project.description} ${project.impact} ${project.stack.join(" ")}`.toLowerCase();
  return filterTerms[filter].some((term) => haystack.includes(term));
}

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function App() {
  const [filter, setFilter] = useState<ProjectFilter>("Selected");
  const [activeOrbitId, setActiveOrbitId] = useState<(typeof orbitDomains)[number]["id"]>("product");
  const [orbitTilt, setOrbitTilt] = useState({ x: 0, y: 0 });
  const projects = useMemo(
    () => profileContent.projects.filter((project, index) => matchesFilter(project, filter, index)),
    [filter]
  );
  const activeOrbit = orbitDomains.find((domain) => domain.id === activeOrbitId) ?? orbitDomains[0];
  const orbitStyle = {
    "--orbit-tilt-x": `${orbitTilt.x}deg`,
    "--orbit-tilt-y": `${orbitTilt.y}deg`
  } as CSSProperties;

  function handleOrbitPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -10;
    setOrbitTilt({ x: y, y: x });
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Jagger Brulato, back to top">
          <span className="brand-mark">JB</span><span>Jagger Brulato</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a><a href="#experience">Experience</a><a href="#expertise">Expertise</a><a href="#about">About</a>
        </nav>
        <a className="header-contact" href={`mailto:${profileContent.email}`}>Let’s talk <Arrow /></a>
      </header>

      <main id="top">
        <section className="hero section-pad">
          <div className="hero-kicker"><span className="status-dot" /> Senior full-stack engineer · {profileContent.location}</div>
          <h1>I build products that make <em>complex systems</em> feel simple.</h1>
          <div className="hero-footer">
            <p>{plainText(profileContent.heroSummary)}</p>
            <div className="hero-actions">
              <a className="button button-dark" href="#work">Explore my work <span aria-hidden="true">↓</span></a>
              <a className="text-link" href={mainSiteHref("/files/resume.pdf")}>View résumé <Arrow /></a>
            </div>
          </div>
          <div className="hero-system" style={orbitStyle} onPointerMove={handleOrbitPointerMove} onPointerLeave={() => setOrbitTilt({ x: 0, y: 0 })}>
            <div className="system-caption"><span>INTERACTIVE SYSTEM MODEL</span><small>MOVE / SELECT A DOMAIN</small></div>
            <div className="hero-orbit" aria-label="Interactive model of Jagger's engineering domains">
              <div className="orbit-grid" aria-hidden="true" />
              <span className="orbit-axis orbit-axis-x" aria-hidden="true" /><span className="orbit-axis orbit-axis-y" aria-hidden="true" />
              <div className="orbit-plane orbit-plane-one" aria-hidden="true"><div className="orbit-track"><i /></div></div>
              <div className="orbit-plane orbit-plane-two" aria-hidden="true"><div className="orbit-track"><i /></div></div>
              <div className="orbit-plane orbit-plane-three" aria-hidden="true"><div className="orbit-track"><i /></div></div>
              <div className="orbit-core"><span>JB</span><small>FULL STACK</small></div>
              {orbitDomains.map((domain) => (
                <button
                  type="button"
                  key={domain.id}
                  className={`orbit-node orbit-node-${domain.id}${activeOrbitId === domain.id ? " active" : ""}`}
                  onPointerEnter={() => setActiveOrbitId(domain.id)}
                  onFocus={() => setActiveOrbitId(domain.id)}
                  onClick={() => setActiveOrbitId(domain.id)}
                  aria-pressed={activeOrbitId === domain.id}
                >
                  <span>{domain.code}</span><strong>{domain.label}</strong>
                </button>
              ))}
            </div>
            <div className="orbit-readout" aria-live="polite"><span>{activeOrbit.code} / ACTIVE DOMAIN</span><strong>{activeOrbit.label}</strong><p>{activeOrbit.detail}</p></div>
          </div>
        </section>

        <section className="signal-strip section-pad" aria-label="Profile overview">
          <div className="signal-metrics">
            {profileContent.metrics.map((metric) => metric.label === "Start Here"
              ? <a className="signal-metric signal-metric-link" href={mainSiteHref("/ojaml")} key={metric.label}><span>{metric.label}</span><strong>{metric.value} <Arrow /></strong></a>
              : <article className="signal-metric" key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></article>)}
          </div>
          <div className="signal-points">
            {profileContent.heroBullets.map((bullet, index) => <p key={bullet}><span>0{index + 1}</span>{plainText(bullet)}</p>)}
          </div>
        </section>

        <section className="principles section-pad" aria-label="Engineering focus">
          <p className="section-index">01 — What I do</p>
          <div className="principles-copy">
            <h2>Senior engineering across the whole product.</h2>
            <p>I connect user experience to the services, data, infrastructure, and tools behind it—then keep the result understandable as it grows.</p>
          </div>
          <div className="principle-grid">
            {[
              ["Product", "Interfaces people understand, backed by deliberate behavior and resilient flows."],
              ["Platform", "Systems that help teams ship, observe, and operate software with less friction."],
              ["Craft", "Clear boundaries, pragmatic architecture, and code built to change."],
              ["Leadership", "Direction and mentorship without drifting away from implementation."]
            ].map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </section>

        <section id="work" className="work section-pad">
          <div className="section-heading">
            <div>
              <p className="section-index">02 — Work archive</p><h2>Things I’ve built.</h2>
              <p className="section-note">Showing {projects.length} of {profileContent.projects.length} projects. Open a project note for its impact, full stack, and every available link.</p>
            </div>
            <div className="filters" aria-label="Filter projects">
              {projectFilters.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}
            </div>
          </div>
          <div className="project-grid">
            {projects.map((project) => {
              const primaryLink = project.links[0];
              const projectNumber = profileContent.projects.findIndex((item) => item.slug === project.slug) + 1;
              return <article className="project-card" id={`project-${project.slug}`} key={project.slug}>
                <a href={projectHref(primaryLink.href)} className="project-visual" aria-label={`${primaryLink.label}: ${project.title}`}>
                  {project.image ? <img src={project.image} alt="" loading="lazy" /> : <span>{String(projectNumber).padStart(2, "0")}</span>}
                  <div className="project-number">{String(projectNumber).padStart(2, "0")}</div><div className="project-open"><Arrow /></div>
                </a>
                <div className="project-meta">
                  <div><h3>{project.title}</h3><p>{plainText(project.description)}</p></div>
                  <ul>{project.stack.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <details className="project-notes">
                  <summary><span>Project notes</span><span aria-hidden="true">+</span></summary>
                  <div className="project-notes-body">
                    <div><span className="detail-label">Why it matters</span><p>{plainText(project.impact)}</p></div>
                    <div><span className="detail-label">Full stack</span><div className="tag-cloud">{project.stack.map((item) => <span key={item}>{item}</span>)}</div></div>
                    <div><span className="detail-label">Links</span><div className="project-links">{project.links.map((link) => <a key={link.label} href={projectHref(link.href)}>{link.label} <Arrow /></a>)}</div></div>
                    {project.relatedLinks?.length ? <div><span className="detail-label">Related</span><div className="related-links">{project.relatedLinks.map((link) => <a key={link.href} href={projectHref(link.href)}><strong>{link.label}</strong><span>{link.description}</span><Arrow /></a>)}</div></div> : null}
                  </div>
                </details>
              </article>;
            })}
          </div>
          {projects.length === 0 && <p className="empty-state">No projects match that filter yet.</p>}
        </section>

        <section id="experience" className="experience section-pad">
          <div className="experience-intro">
            <p className="section-index">03 — Experience</p><h2>From startups to Google.</h2>
            <p>I’ve worked inside product teams, platform organizations, and large-scale data environments—often owning the path from an early decision to production.</p>
          </div>
          <div className="timeline">
            {profileContent.experience.map((job) => <article id={`role-${job.slug}`} key={job.slug}>
              <div className={job.slug.startsWith("cornell-dti-") ? "company-logo company-logo--cornell-dti" : "company-logo"}>{job.logo ? <img src={job.logo} alt={job.logoAlt ?? ""} /> : job.company.slice(0, 1)}</div>
              <div className="job-title"><h3>{job.company}</h3><p>{job.role}</p></div>
              <p className="job-summary">{job.summary}</p><div className="job-date"><strong>{job.timeframe}</strong><span>{job.location}</span></div>
              <details className="role-details">
                <summary><span>Selected work &amp; stack</span><span aria-hidden="true">+</span></summary>
                <div><ol>{job.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ol><div className="tag-cloud">{job.tags.map((tag) => <span className={`tag-${tag.tone}`} key={`${tag.tone}-${tag.label}`}>{tag.label}</span>)}</div></div>
              </details>
            </article>)}
          </div>
        </section>

        <section id="expertise" className="expertise section-pad">
          <div className="section-heading expertise-heading">
            <div><p className="section-index">04 — Capabilities</p><h2>Depth, without the silos.</h2></div>
            <p>Languages, frameworks, infrastructure, and engineering practice—organized around the systems they help create.</p>
          </div>
          <div className="skill-cluster-grid">
            {profileContent.skillClusters.map((cluster, index) => <article key={cluster.title}>
              <span className="cluster-number">0{index + 1}</span><h3>{cluster.title}</h3><p>{cluster.summary}</p>
              <div className="tag-cloud">{cluster.items.map((item) => <span key={item}>{item}</span>)}</div>
            </article>)}
          </div>
        </section>

        <section id="about" className="about section-pad">
          <div className="portrait-frame"><img src={headshotAsset} alt="Jagger Brulato" /></div>
          <div className="about-copy">
            <p className="section-index">05 — About</p><h2>Curious by default.<br />Practical on purpose.</h2>
            <p>I’m a senior full-stack engineer who likes the seams between disciplines: where product meets architecture, where a developer tool becomes a user experience, and where a complicated system can become a clear one.</p>
            <p>Outside of work I build programming languages, renderers, games, simulations, and small experiments that teach me something new.</p>
            <div className="about-links">{profileContent.links.map((link) => <a key={link.label} href={projectHref(link.href)}>{link.label} <Arrow /></a>)}</div>
          </div>
        </section>

        <section id="contact" className="contact section-pad">
          <p className="section-index">06 — Get in touch</p><h2>Have something<br />interesting in mind?</h2>
          <div className="contact-actions"><a href={`mailto:${profileContent.email}`}>{profileContent.email} <Arrow /></a><a href={mainSiteHref("/files/resume.pdf")}>Résumé <Arrow /></a></div>
        </section>
      </main>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Jagger Brulato</span>
        <div className="footer-links">{profileContent.links.map((link) => <a key={link.label} href={projectHref(link.href)}>{link.label} <Arrow /></a>)}</div>
        <div className="footer-views"><a href={mainSiteHref()}>Home view</a><a href={mainSiteHref("/games")}>Games</a><a href={mainSiteHref("/papers")}>Papers</a><a href="#top">Back to top ↑</a></div>
      </footer>
    </div>
  );
}

export default App;
