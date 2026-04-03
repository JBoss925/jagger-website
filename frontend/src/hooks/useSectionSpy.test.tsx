import { act, render, screen } from "@testing-library/react";
import { useSectionSpy } from "./useSectionSpy";

const sectionIds = ["hero", "impact", "experience"];
const sections = [
  { id: "hero", top: 0, height: 500 },
  { id: "impact", top: 500, height: 500 },
  { id: "experience", top: 1000, height: 500 }
];

function HookHarness() {
  const activeSection = useSectionSpy(sectionIds, "hero");

  return (
    <>
      <output aria-label="active section">{activeSection}</output>
      {sections.map((section) => (
        <section key={section.id} id={section.id}>
          {section.id}
        </section>
      ))}
    </>
  );
}

describe("useSectionSpy", () => {
  const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
  const originalInnerHeight = window.innerHeight;
  const originalScrollHeight = document.documentElement.scrollHeight;
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;

  beforeEach(() => {
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      writable: true,
      value: 1000
    });

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 0
    });

    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 1800
    });

    window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }) as typeof window.requestAnimationFrame;

    window.cancelAnimationFrame = (() => undefined) as typeof window.cancelAnimationFrame;

    HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
      const id = this.getAttribute("id");
      const section = sections.find((entry) => entry.id === id);

      if (!section) {
        return originalGetBoundingClientRect.call(this);
      }

      const top = section.top - window.scrollY;
      const bottom = top + section.height;

      return {
        x: 0,
        y: top,
        top,
        bottom,
        left: 0,
        right: 1000,
        width: 1000,
        height: section.height,
        toJSON: () => ({})
      } as DOMRect;
    };
  });

  afterEach(() => {
    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      writable: true,
      value: originalInnerHeight
    });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: originalScrollHeight
    });
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  it("updates to the experience section when scrolling downward past it", () => {
    render(<HookHarness />);

    expect(screen.getByLabelText(/active section/i)).toHaveTextContent("hero");

    act(() => {
      window.scrollY = 700;
      window.dispatchEvent(new Event("scroll"));
    });

    expect(screen.getByLabelText(/active section/i)).toHaveTextContent("experience");
  });
});
