import { describe, expect, it } from "vitest";
import type { DocPage } from "../../content/docs";
import { findDocMatch, highlightParts, searchExcerpt } from "./docSearch";

const page: DocPage = {
  id: "runtime",
  mode: "reference",
  title: "WebAssembly Runtime",
  blocks: [
    {
      kind: "paragraph",
      text: "The runtime owns memory and validates the output.",
    },
    {
      kind: "example",
      label: "Indirect calls",
      code: "call_indirect (type $closure)",
      caption: "Functions are invoked through the function table.",
    },
  ],
};
describe("documentation search", () => {
  it("finds code content and supplies its actual excerpt and block anchor", () => {
    const match = findDocMatch(page, "CALL_INDIRECT", "OJaml");
    expect(match?.blockIndex).toBe(1);
    expect(match?.excerpt).toContain("call_indirect (type $closure)");
  });
  it("finds titles and project labels without inventing a content match", () => {
    expect(findDocMatch(page, "webassembly", "OJaml")?.blockIndex).toBe(-1);
    expect(findDocMatch(page, "OJaml", "OJaml")).not.toBeNull();
  });
  it("does not return internal data keys as visible search matches", () => {
    expect(findDocMatch(page, "paragraph", "OJaml")).toBeNull();
    expect(findDocMatch(page, "   ", "OJaml")).toBeNull();
  });
  it("centers a bounded excerpt on a late match", () => {
    const excerpt = searchExcerpt(
      "Before the match. ".repeat(70) +
        "UNIQUE MATCH appears here. " +
        "After the match. ".repeat(70),
      "unique match",
    );
    expect(excerpt).toContain("UNIQUE MATCH");
    expect(excerpt.startsWith("…")).toBe(true);
    expect(excerpt.endsWith("…")).toBe(true);
    expect(excerpt.length).toBeLessThan(250);
  });
  it("highlights literal repeated matches while preserving original case and text", () => {
    const text = "Map.get first, then map.GET. [a+b] stays literal.";
    const parts = highlightParts(text, "map.get");
    expect(parts.filter((p) => p.matched).map((p) => p.text)).toEqual([
      "Map.get",
      "map.GET",
    ]);
    expect(parts.map((p) => p.text).join("")).toBe(text);
    expect(
      highlightParts(text, "[a+b]")
        .filter((p) => p.matched)
        .map((p) => p.text),
    ).toEqual(["[a+b]"]);
  });
});
