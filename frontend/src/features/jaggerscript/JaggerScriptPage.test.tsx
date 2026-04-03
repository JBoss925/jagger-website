import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import JaggerScriptPage from "./JaggerScriptPage";

vi.mock("@monaco-editor/react", () => ({
  default: ({ value, onChange }: { value: string; onChange?: (value: string) => void }) => (
    <textarea
      aria-label="source editor"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  )
}));

vi.mock("../../lib/jaggerscript/bridge", () => ({
  loadExample: vi.fn((id = "doubly-linked-list") => ({
    id,
    title: id === "fizz-buzz" ? "FizzBuzz" : "DoublyLinkedList",
    description: "Mock example description",
    source: id === "fizz-buzz" ? "console.log('FizzBuzz');" : "console.log('List');"
  })),
  run: vi.fn(() => ["All elements:", "1", "2"])
}));

describe("JaggerScriptPage", () => {
  it("loads examples and runs the program", () => {
    render(
      <MemoryRouter>
        <JaggerScriptPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /FizzBuzz/i }));
    fireEvent.click(screen.getByRole("button", { name: /Run program/i }));

    expect(screen.getByText(/All elements:/i)).toBeInTheDocument();
    expect(screen.getByText(/Interpreter output/i)).toBeInTheDocument();
  });
});
