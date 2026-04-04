import { describe, expect, it } from "vitest";
import { getJaggerScriptSyntaxMarkers } from "./diagnostics";

describe("getJaggerScriptSyntaxMarkers", () => {
  it("returns no markers for valid code", () => {
    const markers = getJaggerScriptSyntaxMarkers(
      "class Main { constructor(){} func main(){} }",
      8
    );

    expect(markers).toEqual([]);
  });

  it("returns a parser marker for broken syntax", () => {
    const markers = getJaggerScriptSyntaxMarkers(
      "class Main { constructor() { func main(){} }",
      8
    );

    expect(markers).toHaveLength(1);
    expect(markers[0]?.message.length).toBeGreaterThan(0);
    expect(markers[0]?.startLineNumber).toBeGreaterThan(0);
    expect(markers[0]?.startColumn).toBeGreaterThan(0);
  });

  it("returns a marker for unknown declaration types", () => {
    const markers = getJaggerScriptSyntaxMarkers(
      [
        "class Main {",
        "  constructor(){",
        "    meme x = 4;",
        "  }",
        "  func main(){}",
        "}"
      ].join("\n"),
      8
    );

    expect(markers).toHaveLength(1);
    expect(markers[0]?.message).toMatch(/Unknown type/i);
  });

  it("does not flag control-flow keywords as declaration types", () => {
    const markers = getJaggerScriptSyntaxMarkers(
      [
        "class Main {",
        "  func main(){",
        "    return x;",
        "  }",
        "}"
      ].join("\n"),
      8
    );

    expect(markers).toEqual([]);
  });
});
