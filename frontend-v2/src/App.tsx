import { useMemo, useState } from "react";
import { headshotAsset, profileContent } from "../../shared/content/profile";
import type { ProjectEntry } from "../../shared/types/content";

const projectFilters = ["Selected", "Product", "Systems", "Tools", "All"] as const;
type ProjectFilter = (typeof projectFilters)[number];

const filterTerms: Record<Exclude<ProjectFilter, "Selected" | "All">, string[]> = {
  Product: ["react", "game", "mobile", "pwa", "ui", "frontend", "web"],
  Systems: ["compiler", "runtime", "engine", "wasm", "parser", "language", "render"],
  Tools: ["library", "api", "tool", "package", "compression", "simulation", "developer"]
};

function plainText(value: string) {
  return value.replace(/\*\*(.*?)\*\*/g, "$1");
}

function projectHref(href: string) {
  return href.startsWith("/") ? `https://jaggerbrulato.com${href}` : href;
}

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
  const projects = useMemo(
    () => profileContent.projects.filter((project, index) => matchesFilter(project, filter, index)),
    [filter]
  );

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Jagger Brulato, back to top">
          <span className="brand-mark">JB</span>
          <span>Jagger Brulato</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#about">About</a>
        </nav>
        <a className="header-contact" href={`mailto:${profileContent.email}`}>Let’s talk <Arrow /></a>
      </header>

      <main id="top">
        <section className="hero section-pad">
          <div className="hero-kicker"><span className="status-dot" /> Available for the right collaboration</div>
          <h1>I build products that make <em>complex systems</em> feel simple.</h1>
          <div className="hero-footer">
            <p>{plainText(profileContent.heroSummary)}</p>
            <div className="hero-actions">
              <a className="button button-dark" href="#work">Explore my work <span aria-hidden="true">↓</span></a>
              <a className="text-link" href="https://jaggerbrulato.com/files/resume.pdf">View résumé <Arrow /></a>
            </div>
          </div>
          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit-core">JB</div>
            <span className="orbit-label orbit-label-a">PRODUCT</span>
            <span className="orbit-label orbit-label-b">SYSTEMS</span>
            <span className="orbit-label orbit-label-c">PLATFORM</span>
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
            ].map(([title, copy], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="work" className="work section-pad">
          <div className="section-heading">
            <div>
              <p className="section-index">02 — Selected work</p>
              <h2>Things I’ve built.</h2>
            </div>
            <div className="filters" aria-label="Filter projects">
              {projectFilters.map((item) => (
                <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>
              ))}
            </div>
          </div>
          <div className="project-grid">
            {projects.map((project, index) => {
              const primaryLink = project.links[0];
              return (
                <article className="project-card" key={project.slug}>
                  <a href={projectHref(primaryLink.href)} className="project-visual" aria-label={`${primaryLink.label}: ${project.title}`}>
                    {project.image ? <img src={project.image} alt="" loading="lazy" /> : <span>{String(index + 1).padStart(2, "0")}</span>}
                    <div className="project-number">{String(index + 1).padStart(2, "0")}</div>
                    <div className="project-open"><Arrow /></div>
                  </a>
                  <div className="project-meta">
                    <div>
                      <h3>{project.title}</h3>
                      <p>{plainText(project.description)}</p>
                    </div>
                    <ul>{project.stack.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                </article>
              );
            })}
          </div>
          {projects.length === 0 && <p className="empty-state">No projects match that filter yet.</p>}
        </section>

        <section id="experience" className="experience section-pad">
          <div className="experience-intro">
            <p className="section-index">03 — Experience</p>
            <h2>From startups to Google.</h2>
            <p>I’ve worked inside product teams, platform organizations, and large-scale data environments—often owning the path from an early decision to production.</p>
          </div>
          <div className="timeline">
            {profileContent.experience.map((job) => (
              <article key={job.slug}>
                <div className="company-logo">{job.logo ? <img src={job.logo} alt={job.logoAlt ?? ""} /> : job.company.slice(0, 1)}</div>
                <div className="job-title"><h3>{job.company}</h3><p>{job.role}</p></div>
                <p className="job-summary">{job.summary}</p>
                <div className="job-date"><strong>{job.timeframe}</strong><span>{job.location}</span></div>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="about section-pad">
          <div className="portrait-frame"><img src={headshotAsset} alt="Jagger Brulato" /></div>
          <div className="about-copy">
            <p className="section-index">04 — About</p>
            <h2>Curious by default.<br />Practical on purpose.</h2>
            <p>I’m a senior full-stack engineer who likes the seams between disciplines: where product meets architecture, where a developer tool becomes a user experience, and where a complicated system can become a clear one.</p>
            <p>Outside of work I build programming languages, renderers, games, simulations, and small experiments that teach me something new.</p>
            <div className="skill-row">
              {profileContent.skillClusters.flatMap((cluster) => cluster.items).slice(0, 8).map((skill) => <span key={skill}>{skill}</span>)}
            </div>
          </div>
        </section>

        <section className="contact section-pad">
          <p className="section-index">05 — Get in touch</p>
          <h2>Have something<br />interesting in mind?</h2>
          <a href={`mailto:${profileContent.email}`}>{profileContent.email} <Arrow /></a>
        </section>
      </main>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Jagger Brulato</span>
        <div>{profileContent.links.filter((link) => ["GitHub", "LinkedIn"].includes(link.label)).map((link) => <a key={link.label} href={link.href}>{link.label} <Arrow /></a>)}</div>
        <a href="#top">Back to top ↑</a>
      </footer>
    </div>
  );
}

export default App;
