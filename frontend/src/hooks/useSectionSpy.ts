import { useEffect, useState } from "react";

const ACTIVE_SECTION_OFFSET = 0.35;

export function useSectionSpy(sectionIds: string[], fallbackId: string) {
  const [activeSection, setActiveSection] = useState(fallbackId);

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) {
      return;
    }

    let frame = 0;

    const updateActiveSection = () => {
      const probeLine = window.innerHeight * ACTIVE_SECTION_OFFSET;
      let nextActiveSection = fallbackId;

      for (const element of elements) {
        const { top } = element.getBoundingClientRect();

        if (top <= probeLine) {
          nextActiveSection = element.id;
        } else {
          break;
        }
      }

      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      ) {
        nextActiveSection = elements[elements.length - 1].id;
      }

      setActiveSection((currentSection) =>
        currentSection === nextActiveSection ? currentSection : nextActiveSection
      );
    };

    const scheduleUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateActiveSection();
      });
    };

    updateActiveSection();

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [fallbackId, sectionIds]);

  return activeSection;
}
