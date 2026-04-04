import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import ExperienceCard from "../../components/ExperienceCard";
import ProjectCard from "../../components/ProjectCard";
import SectionShell from "../../components/SectionShell";
import SiteNavigation from "../../components/SiteNavigation";
import SkillClusterCard from "../../components/SkillClusterCard";
import { profileContent, headshotAsset } from "../../content/profile";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useSectionSpy } from "../../hooks/useSectionSpy";
import { usePageReveal } from "../../hooks/usePageReveal";
import SceneBackdrop from "./SceneBackdrop";

const sectionOrder = profileContent.sceneSections.map((section) => section.id);

function HomePage() {
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isCompactViewport = useMediaQuery("(max-width: 960px)");
  const useStaticScene = prefersReducedMotion || isCompactViewport;
  const activeSectionId = useSectionSpy(sectionOrder, profileContent.sceneSections[0].id);
  const isPageReady = usePageReveal();
  const hasHandledInitialHash = useRef(false);
  const activeSectionIndex = sectionOrder.indexOf(activeSectionId);
  const nextSectionId =
    activeSectionIndex >= 0 && activeSectionIndex < sectionOrder.length - 1
      ? sectionOrder[activeSectionIndex + 1]
      : "hero";
  const isAtLastSection = activeSectionIndex === sectionOrder.length - 1;

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
    element.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }

  useLayoutEffect(() => {
    if (!location.hash) {
      hasHandledInitialHash.current = true;
      return;
    }

    const targetId = location.hash.slice(1);
    const element = document.getElementById(targetId);
    if (!element) {
      return;
    }

    const shouldAnimateScroll =
      hasHandledInitialHash.current && !prefersReducedMotion;

    hasHandledInitialHash.current = true;

    if (!shouldAnimateScroll) {
      if (targetId === "hero") {
        return;
      }

      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";

      element.scrollIntoView({
        behavior: "auto",
        block: "start"
      });

      requestAnimationFrame(() => {
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
      });

      return;
    }

    if (targetId === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, [location.hash, prefersReducedMotion]);

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
      />

      <main className="content-shell home-shell">
        <section id="hero" className="hero-panel">
          <div className="hero-panel__copy">
            <span className="hero-panel__eyebrow">{profileContent.sceneSections[0].eyebrow}</span>
            <h1>{profileContent.name}</h1>
            <p className="hero-panel__title">{profileContent.title}</p>
            <p className="hero-panel__summary">{profileContent.heroSummary}</p>
            <ul className="detail-list detail-list--hero">
              {profileContent.heroBullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <div className="hero-panel__actions">
              <a className="cta-button" href="#experience">
                See experience
              </a>
              <a className="cta-button cta-button--secondary" href="/jaggerscript">
                Explore JaggerScript
              </a>
            </div>
          </div>

          <div className="hero-panel__aside">
            <div className="hero-panel__portrait-wrap">
              <img src={headshotAsset} alt="Jagger Brulato portrait" className="hero-panel__portrait" />
            </div>
            <div className="metric-grid">
              {profileContent.metrics.map((metric) => (
                <article key={metric.label} className="metric-card">
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <SectionShell
          id="impact"
          eyebrow="Focus"
          title="The work I’m most drawn to usually creates leverage somewhere."
          summary="That can mean product features, platform work, developer tooling, or just making a system easier for the next person to work in."
        >
          <div className="impact-grid">
            <article className="glass-card feature-card">
              <h3>Own the whole path</h3>
              <p>
                I like being able to follow a problem from the interface all the way down to the backend and operational details.
              </p>
            </article>
            <article className="glass-card feature-card">
              <h3>Bring systems thinking into product work</h3>
              <p>
                A lot of what I’ve learned from systems and platform work shows up in how I build product software too.
              </p>
            </article>
            <article className="glass-card feature-card">
              <h3>Build things other engineers use</h3>
              <p>
                Some of the most satisfying work for me is tooling, visibility, onboarding, and internal abstractions.
              </p>
            </article>
          </div>
        </SectionShell>

        <SectionShell
          id="experience"
          eyebrow="Experience"
          title="This is the fastest way to get a feel for the kinds of work I’ve done."
          summary="It spans product engineering, platform work, and leading teams while still staying close to the code."
        >
          <div className="experience-grid">
            {profileContent.experience.map((entry) => (
              <ExperienceCard key={`${entry.company}-${entry.role}`} entry={entry} />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="projects"
          eyebrow="Projects"
          title="These projects fill in the rest of the picture."
          summary="They’re the ones that say the most about what I like building when nobody is assigning it to me."
        >
          <div className="project-grid">
            {profileContent.projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="craft"
          eyebrow="How I work"
          title="The stack matters less to me than how the pieces connect."
          summary="I care a lot about good boundaries, good defaults, and making software easier to work in over time."
        >
          <div className="skill-grid">
            {profileContent.skillClusters.map((cluster) => (
              <SkillClusterCard key={cluster.title} cluster={cluster} />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="contact"
          eyebrow="Contact"
          title="If this looks like the kind of background you need, reach out."
          summary="I’m especially interested in work where product thinking and technical ownership both matter."
        >
          <div className="glass-card contact-card">
            <div>
              <h3>Reach out</h3>
              <p>
                Email is easiest, but the resume, GitHub, and LinkedIn are here too if you want to look around first.
              </p>
            </div>
            <div className="contact-links">
              {profileContent.links.map((link) => (
                <a key={link.href} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  {link.label}
                </a>
              ))}
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
