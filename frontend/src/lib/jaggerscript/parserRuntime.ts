import parserSource from "../../../../jaggerscript/parser/parser.js?raw";

type ParserModule = {
  parse: (source: string) => unknown;
  SyntaxError?: unknown;
};

let cachedParser: ParserModule | null = null;

function buildParser(): ParserModule {
  const trimmedSource = parserSource.trim();
  const withoutExports = trimmedSource.replace(/^module\.exports\s*=\s*/, "");
  const expression = withoutExports.endsWith(";")
    ? withoutExports.slice(0, -1)
    : withoutExports;

  const parser = new Function(`"use strict"; return (${expression});`)();

  if (!parser || typeof parser !== "object" || typeof (parser as ParserModule).parse !== "function") {
    throw new Error("Failed to initialize the JaggerScript parser for the browser.");
  }

  return parser as ParserModule;
}

export function getParser(): ParserModule {
  if (!cachedParser) {
    cachedParser = buildParser();
  }

  return cachedParser;
}
