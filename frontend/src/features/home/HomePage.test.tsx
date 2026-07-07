import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { profileContent } from "../../content/profile";
import HomePage from "./HomePage";

vi.mock("./SceneBackdrop", () => ({
  default: () => <div data-testid="scene-backdrop" aria-hidden="true" />
}));

describe("HomePage", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("renders the hero and key project sections", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /Jagger Brulato/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId("scene-backdrop")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /The projects show how I build outside of work/i })
    ).toBeInTheDocument();
    expect(
      screen
        .getByLabelText("Profile links")
        .querySelectorAll("a")
    ).toHaveLength(4);
    expect(
      Array.from(screen.getByLabelText("Profile links").querySelectorAll("a")).map((link) =>
        link.textContent
      )
    ).toEqual(["GitHub", "LinkedIn", "Resume", "Email"]);
    expect(screen.getAllByRole("link", { name: "LinkedIn" })[0]).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/jaggerbrulato/"
    );
    expect(screen.getAllByRole("link", { name: "GitHub" })[0]).toHaveAttribute(
      "href",
      "https://github.com/JBoss925"
    );
    expect(screen.getAllByRole("link", { name: "Resume" })[0]).toHaveAttribute(
      "href",
      "/files/resume.pdf"
    );
    expect(screen.getAllByRole("link", { name: "Email" })[0]).toHaveAttribute(
      "href",
      "mailto:jagger@jaggerbrulato.com"
    );
    expect(
      screen.getByRole("heading", { name: /^JaggerScript$/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start Here\s*OJaml/i })).toHaveAttribute(
      "href",
      "/ojaml"
    );
    expect(
      screen.getByRole("heading", {
        name: /I lead by making the work clear and staying involved in the implementation/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Leadership" })).toHaveAttribute(
      "href",
      "#leadership"
    );
    expect(screen.getAllByRole("link", { name: "Email" })).toHaveLength(2);
    expect(screen.getByRole("link", { name: /Email me directly/i })).toHaveAttribute(
      "href",
      "mailto:jagger@jaggerbrulato.com"
    );
    expect(screen.getByText(profileContent.email)).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link", { name: /Open Demo/i })
        .some((link) => link.getAttribute("href") === "/rengine")
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: /Go to|Return to top/i })
    ).toBeInTheDocument();
  });

  it("smoothly scrolls on initial hash loads", async () => {
    const scrollTo = vi.fn();
    const scrollIntoView = vi.fn();
    const originalScrollTo = window.scrollTo;
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

    window.scrollTo = scrollTo;
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(
      <MemoryRouter initialEntries={["/#projects"]}>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(scrollTo).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: "smooth",
      });
    });

    window.scrollTo = originalScrollTo;
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  it("smoothly scrolls on initial experience card hash loads", async () => {
    const scrollTo = vi.fn();
    const scrollIntoView = vi.fn();
    const originalScrollTo = window.scrollTo;
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

    window.scrollTo = scrollTo;
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(
      <MemoryRouter initialEntries={["/#experience/red-ventures-platform-engineer"]}>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(scrollTo).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: "smooth",
      });
    });

    window.scrollTo = originalScrollTo;
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  it("smoothly scrolls on initial project card hash loads", async () => {
    const scrollTo = vi.fn();
    const scrollIntoView = vi.fn();
    const originalScrollTo = window.scrollTo;
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

    window.scrollTo = scrollTo;
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(
      <MemoryRouter initialEntries={["/#projects/jaggerscript"]}>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(scrollTo).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: "smooth",
      });
    });

    window.scrollTo = originalScrollTo;
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  it("resets to the top on plain homepage navigation", () => {
    const scrollTo = vi.fn();
    const scrollIntoView = vi.fn();
    const originalScrollTo = window.scrollTo;
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

    window.scrollTo = scrollTo;
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>
    );

    expect(scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "auto",
    });

    window.scrollTo = originalScrollTo;
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  it("smoothly scrolls to the hero when the brand is clicked on the homepage", () => {
    const scrollTo = vi.fn();
    const scrollIntoView = vi.fn();
    const originalScrollTo = window.scrollTo;
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

    window.scrollTo = scrollTo;
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>
    );

    scrollTo.mockClear();
    fireEvent.click(screen.getByRole("link", { name: /Jagger Brulato/i }));

    expect(scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });

    window.scrollTo = originalScrollTo;
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  it("scrolls directly to the hero on an initial hero hash load", async () => {
    const scrollTo = vi.fn();
    const scrollIntoView = vi.fn();
    const originalScrollTo = window.scrollTo;
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

    window.scrollTo = scrollTo;
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(
      <MemoryRouter initialEntries={["/#hero"]}>
        <HomePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: "smooth",
      });
    });
    expect(scrollIntoView).not.toHaveBeenCalled();

    window.scrollTo = originalScrollTo;
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });
});
