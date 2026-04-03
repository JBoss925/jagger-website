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
      screen.getByRole("heading", { name: /Projects that make the technical range concrete/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^JaggerScript$/i })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /Resume/i })[0]
    ).toHaveAttribute("href", "/files/resume.pdf");
  });
});
