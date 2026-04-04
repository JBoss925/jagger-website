import { loadExample, run } from "./bridge";

describe("JaggerScript bridge", () => {
  it("runs a real example without relying on CommonJS globals", () => {
    const example = loadExample("fizz-buzz");
    const output = run(example.source).join("\n");

    expect(output).toBeTruthy();
    expect(output).not.toMatch(/module is not defined/i);
    expect(output).not.toMatch(/Failed to initialize the JaggerScript parser/i);
  });

  it("decodes newline and backslash escapes in console output", () => {
    const output = run(`
class Main {
  constructor(){}

  func main(){
    console.log('Line one\\nLine two');
    console.log('Path: C\\\\temp');
    console.log('Literal slash n: \\\\n');
  }
}
    `);

    expect(output[0]).toBe("Line one\nLine two");
    expect(output[1]).toBe("Path: C\\temp");
    expect(output[2]).toBe("Literal slash n: \\n");
  });
});
