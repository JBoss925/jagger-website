import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./HomePage";

describe("HomePage", () => {
  it("renders the hero and key project sections", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /Jagger Brulato/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /These projects fill in the rest of the picture/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^JaggerScript$/i })
    ).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link", { name: /Open Demo/i })
        .some((link) => link.getAttribute("href") === "/rengine")
    ).toBe(true);
    expect(
      screen.getAllByRole("link", { name: /Resume/i })[0]
    ).toHaveAttribute("href", "/files/resume.pdf");
    expect(
      screen.getByRole("button", { name: /Go to|Return to top/i })
    ).toBeInTheDocument();
  });

  it("uses an immediate scroll on initial hash loads", () => {
    const scrollTo = vi.fn();
    const originalScrollTo = window.scrollTo;

    window.scrollTo = scrollTo;

    render(
      <MemoryRouter initialEntries={["/#projects"]}>
        <HomePage />
      </MemoryRouter>
    );

    expect(scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "auto",
    });

    window.scrollTo = originalScrollTo;
  });

  it("does not trigger an extra programmatic jump on an initial hero hash load", () => {
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

    expect(scrollTo).not.toHaveBeenCalled();
    expect(scrollIntoView).not.toHaveBeenCalled();

    window.scrollTo = originalScrollTo;
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });
});
