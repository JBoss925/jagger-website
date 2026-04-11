import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RenginePage from "./RenginePage";

class ResizeObserverMock {
  observe() {}
  disconnect() {}
}

describe("RenginePage", () => {
  beforeEach(() => {
    if (typeof ResizeObserver === "undefined") {
      Object.defineProperty(globalThis, "ResizeObserver", {
        value: ResizeObserverMock,
        configurable: true
      });
    }
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      () =>
        ({
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          translate: vi.fn(),
          rotate: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          arc: vi.fn(),
          stroke: vi.fn(),
          fill: vi.fn(),
          setTransform: vi.fn(),
          fillStyle: "",
          strokeStyle: "",
          lineWidth: 1
        }) as unknown as CanvasRenderingContext2D
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the demo picker and wireframe toggle", () => {
    render(
      <MemoryRouter>
        <RenginePage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Rengine/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Wireframes: On/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Switch Root to local space/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Purple Cube 1 canvas/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Live Component Tree/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Collapse Root/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Previous demo/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Next demo/i })).toBeEnabled();
  });

  it("switches demos and toggles wireframes", () => {
    render(
      <MemoryRouter>
        <RenginePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Time Dif/i }));
    fireEvent.click(screen.getByRole("button", { name: /Wireframes: On/i }));

    expect(screen.getByLabelText(/Time Dif canvas/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Wireframes: Off/i })).toBeInTheDocument();
  });

  it("steps through demos with the rail navigation buttons", () => {
    render(
      <MemoryRouter>
        <RenginePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Next demo/i }));

    expect(screen.getByLabelText(/Purple Cube 2 canvas/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Previous demo/i })).toBeEnabled();
  });

  it("collapses and expands tree children from a parent node", () => {
    render(
      <MemoryRouter>
        <RenginePage />
      </MemoryRouter>
    );

    const toggle = screen.getByRole("button", { name: /Collapse Root/i });
    fireEvent.click(toggle);

    expect(screen.queryByText(/Inner Pivot|Outer Pivot|Primary Box/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Expand Root/i }));

    expect(screen.getByText(/Outer Pivot|Primary Box/i)).toBeInTheDocument();
  });

  it("swaps a single node between world and local space", () => {
    render(
      <MemoryRouter>
        <RenginePage />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /Switch Root to local space/i })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/world transform values/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /Switch Root to local space/i }));

    expect(screen.getByRole("button", { name: /Switch Root to world space/i })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/local transform values/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/world transform values/i).length).toBeGreaterThan(0);
  });
});
