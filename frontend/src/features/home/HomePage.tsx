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
            <span className="hero-panel__eyebrow">{profileContent.sceneSections[0].eyebrow}</span>
            <h1>{profileContent.name}</h1>
            <p className="hero-panel__title">{renderInlineEmphasis(profileContent.title)}</p>
            <p className="hero-panel__summary">{renderInlineEmphasis(profileContent.heroSummary)}</p>
            <ul className="detail-list detail-list--hero">
              {profileContent.heroBullets.map((bullet) => (
                <li key={bullet}>{renderInlineEmphasis(bullet)}</li>
              ))}
            </ul>
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
