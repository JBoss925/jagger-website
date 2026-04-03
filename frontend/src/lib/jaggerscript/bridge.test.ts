import { loadExample, run } from "./bridge";

describe("JaggerScript bridge", () => {
  it("runs a real example without relying on CommonJS globals", () => {
    const example = loadExample("fizz-buzz");
    const output = run(example.source).join("\n");

    expect(output).toBeTruthy();
    expect(output).not.toMatch(/module is not defined/i);
    expect(output).not.toMatch(/Failed to initialize the JaggerScript parser/i);
  });
});
