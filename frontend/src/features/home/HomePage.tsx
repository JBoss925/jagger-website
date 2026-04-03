import { useEffect } from "react";
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

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const element = document.getElementById(location.hash.slice(1));
    if (!element) {
      return;
    }

    requestAnimationFrame(() => {
      element.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });
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
          <div className="hero-panel__copy glass-card">
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

          <div className="hero-panel__aside glass-card">
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
          eyebrow="Positioning"
          title="A hiring manager should leave this site understanding exactly how I add leverage."
          summary="The goal is not to list every tool I have touched. It is to make the through-line obvious: I lead, I ship, and I enjoy technically demanding work."
        >
          <div className="impact-grid">
            <article className="glass-card feature-card">
              <h3>Lead with full-stack ownership</h3>
              <p>
                I like taking responsibility for the whole path from user-facing experience to backend mechanics and operational reality.
              </p>
            </article>
            <article className="glass-card feature-card">
              <h3>Bring systems instincts to product work</h3>
              <p>
                Distributed systems, platform work, and runtime tooling sharpen how I think about reliability, interfaces, and scale.
              </p>
            </article>
            <article className="glass-card feature-card">
              <h3>Build for other engineers too</h3>
              <p>
                Some of my best work increases clarity for teammates, whether that means tooling, dashboards, onboarding, or better abstractions.
              </p>
            </article>
          </div>
        </SectionShell>

        <SectionShell
          id="experience"
          eyebrow="Experience"
          title="Execution across product engineering, platform work, and technical leadership."
          summary="These roles are the clearest signals of how I operate: hands-on, technically ambitious, and oriented toward team leverage."
        >
          <div className="experience-grid">
            {profileContent.experience.map((entry) => (
              <ExperienceCard key={`${entry.company}-${entry.role}`} entry={entry} />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="projects"
          eyebrow="Selected work"
          title="Projects that make the technical range concrete."
          summary="I want the portfolio section to reinforce the resume, not feel disconnected from it. These are the projects that best support that story."
        >
          <div className="project-grid">
            {profileContent.projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="craft"
          eyebrow="Craft and stack"
          title="Breadth matters, but the real signal is how the pieces connect."
          summary="I care about combining architecture, implementation, and communication in a way that helps teams move faster without lowering the technical bar."
        >
          <div className="skill-grid">
            {profileContent.skillClusters.map((cluster) => (
              <SkillClusterCard key={cluster.title} cluster={cluster} />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="contact"
          eyebrow="Next step"
          title="If this feels aligned with the kind of engineer you want on a team, let’s talk."
          summary="I’m especially interested in roles where technical ownership, product judgment, and platform thinking all matter at once."
        >
          <div className="glass-card contact-card">
            <div>
              <h3>Reach out</h3>
              <p>
                The fastest path is email, but the resume, GitHub, and LinkedIn are all linked here if you want the fuller picture.
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
    </div>
  );
}

export default HomePage;
