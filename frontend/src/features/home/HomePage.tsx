import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import ExperienceCard from "../../components/ExperienceCard";
import ProjectCard from "../../components/ProjectCard";
import { renderInlineEmphasis } from "../../components/renderInlineEmphasis";
import SectionShell from "../../components/SectionShell";
import SiteNavigation from "../../components/SiteNavigation";
import SkillClusterCard from "../../components/SkillClusterCard";
import { profileContent, headshotAsset } from "../../content/profile";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useSectionSpy } from "../../hooks/useSectionSpy";
import { usePageReveal } from "../../hooks/usePageReveal";
import SceneBackdrop from "./SceneBackdrop";
import {
  getExperienceCardElementId,
  getProjectCardElementId,
  parseHomeHash
} from "./homeAnchors";

const sectionOrder = profileContent.sceneSections.map((section) => section.id);
const ENABLE_MOBILE_STATIC_SCENE = false;
const HEADER_SCROLL_GAP = 16;
const CARD_HASH_GAP = 14;
const INITIAL_SECTION_HASH_CORRECTION = 14;
const INITIAL_CARD_HASH_CORRECTION = 28;
const heroQuickLinks = profileContent.links.filter((link) =>
  ["LinkedIn", "GitHub", "Resume"].includes(link.label)
);

function HeroQuickLinkIcon({ label }: { label: string }) {
  if (label === "LinkedIn") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (label === "GitHub") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.69-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.16 1.18A10.95 10.95 0 0 1 12 5.54c.98 0 1.97.13 2.89.39 2.19-1.49 3.15-1.18 3.15-1.18.63 1.58.23 2.75.12 3.04.74.8 1.18 1.82 1.18 3.08 0 4.42-2.69 5.39-5.26 5.68.42.36.78 1.07.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M6 2.75h7.35L19 8.4v12.85H6V2.75Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M13.25 2.9v5.65h5.55M8.75 12.25h6.5M8.75 15.75h6.5M8.75 19.25h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomePage() {
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isCompactViewport = useMediaQuery("(max-width: 768px)");
  const useStaticScene =
    prefersReducedMotion || (ENABLE_MOBILE_STATIC_SCENE && isCompactViewport);
  const activeSectionId = useSectionSpy(sectionOrder, profileContent.sceneSections[0].id);
  const isPageReady = usePageReveal();
  const hasSyncedSectionUrl = useRef(false);
  const initialHashPending = useRef(
    location.pathname === "/" && Boolean(location.hash || window.location.hash)
  );
  const activeSectionIndex = sectionOrder.indexOf(activeSectionId);
  const nextSectionId =
    activeSectionIndex >= 0 && activeSectionIndex < sectionOrder.length - 1
      ? sectionOrder[activeSectionIndex + 1]
      : "hero";
  const isAtLastSection = activeSectionIndex === sectionOrder.length - 1;

  function getHeaderScrollOffset() {
    const navShell = document.querySelector<HTMLElement>(".site-nav-shell");
    if (!navShell) {
      return HEADER_SCROLL_GAP;
    }

    return navShell.getBoundingClientRect().height + HEADER_SCROLL_GAP;
  }

  function scrollToSection(targetId: string) {
    if (targetId === "hero") {
      window.history.replaceState(null, "", "/#hero");
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
      return;
    }

    const element = document.getElementById(targetId);
    if (!element) {
      return;
    }

    window.history.replaceState(null, "", `/#${targetId}`);

    const top = Math.max(
      0,
      window.scrollY + element.getBoundingClientRect().top - getHeaderScrollOffset()
    );

    window.scrollTo({
      top,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  }

  function scrollToHashTarget(hash: string, options?: { initialLoad?: boolean }) {
    if (!hash) {
      return;
    }

    const parsedHash = parseHomeHash(hash);
    if (!parsedHash) {
      return;
    }

    const element = document.getElementById(parsedHash.targetElementId);
    if (!element) {
      return;
    }

    if (parsedHash.targetElementId === "hero") {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
      return;
    }

    const initialCorrection = options?.initialLoad
      ? parsedHash.cardSlug
        ? INITIAL_CARD_HASH_CORRECTION
        : INITIAL_SECTION_HASH_CORRECTION
      : 0;
    const targetOffset =
      getHeaderScrollOffset() +
      (parsedHash.cardSlug ? CARD_HASH_GAP : 0) +
      initialCorrection;
    const top = Math.max(
      0,
      window.scrollY + element.getBoundingClientRect().top - targetOffset
    );

    window.scrollTo({
      top,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  }

  useLayoutEffect(() => {
    if (location.pathname === "/" && !location.hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [location.pathname, location.hash]);

  useLayoutEffect(() => {
    if (location.pathname !== "/") {
      initialHashPending.current = false;
      return;
    }

    const hash = location.hash || window.location.hash;
    if (!hash) {
      initialHashPending.current = false;
      return;
    }

    const isInitialLoad = initialHashPending.current;
    if (isInitialLoad && !isPageReady) {
      return;
    }

    initialHashPending.current = false;
    scrollToHashTarget(hash, { initialLoad: isInitialLoad });
  }, [isPageReady, location.hash, location.pathname, prefersReducedMotion]);

  useEffect(() => {
    if (location.pathname !== "/") {
      return;
    }

    const onHashChange = () => {
      initialHashPending.current = false;
      scrollToHashTarget(window.location.hash);
    };

    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [location.pathname, prefersReducedMotion]);

  useEffect(() => {
    if (location.pathname !== "/") {
      hasSyncedSectionUrl.current = false;
      return;
    }

    if (!hasSyncedSectionUrl.current) {
      hasSyncedSectionUrl.current = true;
      return;
    }

    window.history.replaceState(null, "", `/#${activeSectionId}`);
  }, [activeSectionId, location.pathname]);

  return (
    <div className={isPageReady ? "page-shell page-shell--ready" : "page-shell page-shell--entering"}>
      <SceneBackdrop
        sections={profileContent.sceneSections}
        activeSectionId={activeSectionId}
        useStaticScene={useStaticScene}
      />
      <SiteNavigation
        sections={profileContent.sceneSections}
        activeSectionId={activeSectionId}
        onSectionNavigate={scrollToSection}
      />

      <main className="content-shell home-shell">
        <section id="hero" className="hero-panel">
          <div className="hero-panel__copy">
            <div className="hero-panel__copy-content">
              <span className="hero-panel__eyebrow">{profileContent.sceneSections[0].eyebrow}</span>
              <h1>{profileContent.name}</h1>
              <p className="hero-panel__title">{renderInlineEmphasis(profileContent.title)}</p>
              <p className="hero-panel__summary">{renderInlineEmphasis(profileContent.heroSummary)}</p>
              <ul className="detail-list detail-list--hero">
                {profileContent.heroBullets.map((bullet) => (
                  <li key={bullet}>{renderInlineEmphasis(bullet)}</li>
                ))}
              </ul>
              <div className="hero-panel__quick-links" aria-label="Profile links">
                {heroQuickLinks.map((link) => (
                  <a
                    key={link.href}
                    className="hero-panel__quick-link"
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    <HeroQuickLinkIcon label={link.label} />
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="hero-panel__aside">
            <div className="hero-panel__portrait-wrap">
              <img src={headshotAsset} alt="Jagger Brulato portrait" className="hero-panel__portrait" />
            </div>
            <div className="metric-grid">
              {profileContent.metrics.map((metric) => (
                metric.label === "Start Here" ? (
                  <a key={metric.label} className="glass-card metric-card metric-card--interactive" href="/ojaml">
                    <span>{metric.label}</span>
                    <strong className="metric-card__link-value">
                      {metric.value}
                      <span aria-hidden="true" className="metric-card__link-indicator">
                        <svg viewBox="0 0 16 16" focusable="false">
                          <path
                            d="M5 11L11 5M6 5h5v5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </strong>
                  </a>
                ) : (
                  <article key={metric.label} className="glass-card metric-card">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </article>
                )
              ))}
            </div>
          </div>
        </section>

        <SectionShell
          id="impact"
          eyebrow="Focus"
          title="I like work that crosses **product, backend, data, infrastructure, and developer tooling**."
          summary="For me that has meant **consumer apps, React and Three.js product surfaces, Node services, platform automation, data pipelines, mobile software, dashboards, and internal systems**."
        >
          <div className="impact-grid">
            <article className="glass-card feature-card">
              <h3>Work across the stack</h3>
              <p>
                {renderInlineEmphasis(
                  "I can work from the **user experience** through the **backend, data model, event flow, infrastructure, and runtime behavior**."
                )}
              </p>
            </article>
            <article className="glass-card feature-card">
              <h3>Use systems work in product work</h3>
              <p>
                {renderInlineEmphasis(
                  "Platform and data systems work has made me better at product engineering. I think carefully about boundaries, data flow, queues, observability, failure modes, and rollout paths."
                )}
              </p>
            </article>
            <article className="glass-card feature-card">
              <h3>Build things other engineers use</h3>
              <p>
                {renderInlineEmphasis(
                  "I like building tools, dashboards, APIs, deployment paths, Terraform workflows, CI/CD systems, and abstractions that other engineers use."
                )}
              </p>
            </article>
          </div>
        </SectionShell>

        <SectionShell
          id="experience"
          eyebrow="Experience"
          title="My experience spans **product, platform, data, mobile, infrastructure, and leadership**."
          summary="That includes senior startup work, Google data systems, AWS platform engineering, internal developer platforms, production apps, and team leadership."
        >
          <div className="experience-grid">
            {profileContent.experience.map((entry) => (
              <ExperienceCard
                key={`${entry.company}-${entry.role}`}
                id={getExperienceCardElementId(entry)}
                entry={entry}
              />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="projects"
          eyebrow="Projects"
          title="The projects show how I build outside of work."
          summary="They’re practical and technical: languages, parsers, runtimes, WebAssembly, games, simulations, compression, renderers, libraries, and backend utilities."
        >
          <div className="project-grid">
            {profileContent.projects.map((project) => (
              <ProjectCard
                key={project.slug}
                id={getProjectCardElementId(project)}
                project={project}
              />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="craft"
          eyebrow="How I work"
          title="I care about **clear systems**, practical architecture, and maintainable code."
          summary="I like code with clear boundaries, obvious ownership, useful tests, good observability, and tradeoffs the team can explain."
        >
          <div className="skill-grid">
            {profileContent.skillClusters.map((cluster) => (
              <SkillClusterCard key={cluster.title} cluster={cluster} />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="leadership"
          eyebrow="Leadership"
          title="I lead by making the work clear and staying involved in the implementation."
          summary="I set direction, make tradeoffs, mentor engineers, organize execution, review code, and take implementation work myself."
        >
          <div className="leadership-principles">
            <div className="glass-card">
              <strong>Set a clear direction</strong>
              <p>
                Turn an ambiguous goal into a plan with clear priorities, ownership,
                milestones, technical decisions, and a path to delivery.
              </p>
            </div>
            <div className="glass-card">
              <strong>Lead from the work</strong>
              <p>
                Make architecture decisions with firsthand context, and take on difficult
                implementation work when the team needs it: APIs, data flow, platform code,
                UI state, or deployment logic.
              </p>
            </div>
            <div className="glass-card">
              <strong>Organize for momentum</strong>
              <p>
                Break work into parallel tracks, surface dependencies early, and keep
                communication direct across product, design, engineering, and operations.
              </p>
            </div>
            <div className="glass-card">
              <strong>Raise the whole team</strong>
              <p>
                Share context, review thoughtfully, and help engineers take ownership of
                larger parts of the system, from feature work to architecture and production support.
              </p>
            </div>
          </div>
        </SectionShell>

        <SectionShell
          id="contact"
          eyebrow="Contact"
          title="If you need a senior engineer who can lead and build, reach out."
        >
          <div className="contact-layout">
            <div className="glass-card contact-card__intro">
              <p>
                {renderInlineEmphasis(
                  "Email is the most direct way to reach me. I’m interested in **startups, product engineering, platform work, data-heavy systems, infrastructure-heavy teams, and senior roles where I still write code**."
                )}
              </p>
              <a className="contact-card__cta" href={`mailto:${profileContent.email}`}>
                <span className="contact-card__cta-eyebrow">Email me directly</span>
                <strong>{profileContent.email}</strong>
              </a>
            </div>
            <div className="glass-card contact-card__panel">
              <div className="contact-card__fit">
                <span className="contact-card__eyebrow">Strong fit</span>
                <strong>I’m usually a good fit for</strong>
                <ul>
                  <li>Ownership over a product, platform, system, or technical direction</li>
                  <li>Problems that cross frontend, backend, data, infrastructure, CI/CD, or operations</li>
                  <li>A team that values direct communication, high ownership, and hands-on leadership</li>
                </ul>
              </div>
              <div className="contact-card__actions">
                <a className="contact-card__action" href={`mailto:${profileContent.email}`}>
                  Email
                </a>
                {profileContent.links
                  .filter((link) => !link.href.startsWith("mailto:"))
                  .map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="contact-card__action"
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                    >
                      {link.label}
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </SectionShell>
      </main>

      <button
        type="button"
        className={
          isAtLastSection
            ? "section-advance section-advance--return"
            : "section-advance"
        }
        aria-label={
          isAtLastSection
            ? "Return to top of page"
            : `Go to ${profileContent.sceneSections[activeSectionIndex + 1]?.label ?? "next section"}`
        }
        title={
          isAtLastSection
            ? "Back to top"
            : `Next: ${profileContent.sceneSections[activeSectionIndex + 1]?.label ?? "Next section"}`
        }
        onClick={() => scrollToSection(nextSectionId)}
      >
        <span className="section-advance__label" aria-hidden={!isAtLastSection}>
          Back to top
        </span>
        <span className="section-advance__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="presentation">
            <path
              d="M12 6v12M12 18l-5-5M12 18l5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </div>
  );
}

export default HomePage;
