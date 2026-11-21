import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { profileContent } from "../../content/profile";
import { papers } from "../../content/papers";
import LibraryPage from "./LibraryPage";

describe("Unified library", () => {
  function setup(path = "/library") {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <LibraryPage />
      </MemoryRouter>,
    );
  }
  it("keeps every project, site view, and original source discoverable", () => {
    setup();
    expect(document.querySelectorAll(".library-grid article")).toHaveLength(
      profileContent.projects.length,
    );
    expect(
      screen.getByRole("link", { name: /Interactive 3D view/ }),
    ).toHaveAttribute("href", "https://interactive3d.jaggerbrulato.com");
    expect(
      document.querySelector(
        'a[href="https://github.com/JBoss925/jagger-website"]',
      ),
    ).toBeInTheDocument();
    for (const paper of papers) {
      expect(
        document.querySelector(`a[href="/papers/${paper.slug}"]`),
      ).toBeInTheDocument();
      expect(
        document.querySelector(`a[href="/docs/${paper.slug}"]`),
      ).toBeInTheDocument();
    }
    for (const path of [
      "/ojaml",
      "/jaggerscript",
      "/genetic-ts",
      "/rengine",
      "/games/jordle",
      "/games/jolor",
      "/games/jinx",
      "/games/judoku",
      "/games/jigsaw",
      "/games/domes",
    ]) {
      expect(document.querySelector(`a[href="${path}"]`)).toBeInTheDocument();
    }
  });
  it("filters papers and documentation without hiding their paired reading links", () => {
    setup();
    fireEvent.click(
      screen.getByRole("button", { name: "Papers", exact: true }),
    );
    expect(document.querySelectorAll(".library-grid article")).toHaveLength(8);
    fireEvent.click(
      screen.getByRole("button", { name: "Documentation", exact: true }),
    );
    expect(document.querySelectorAll(".library-grid article")).toHaveLength(8);
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "genetic" },
    });
    expect(document.querySelectorAll(".library-grid article")).toHaveLength(1);
    expect(
      document.querySelector('a[href="/papers/genetic-ts"]'),
    ).toBeInTheDocument();
  });
  it("restores URL filters and offers recovery from an empty search", () => {
    setup("/library?type=Papers&q=unfindable");
    expect(screen.getByText("No projects found.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Clear filters/ }));
    expect(document.querySelectorAll(".library-grid article")).toHaveLength(14);
  });
});
