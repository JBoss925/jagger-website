import type { editor } from "monaco-editor";
import { getParser } from "./parserRuntime";

type SourcePosition = {
  line: number;
  column: number;
  offset: number;
};

type SourceLocation = {
  start: SourcePosition;
  end: SourcePosition;
};

type ParserSyntaxError = Error & {
  location?: SourceLocation;
};

function isParserSyntaxError(error: unknown): error is ParserSyntaxError {
  return (
    error instanceof Error &&
    typeof (error as ParserSyntaxError).location?.start?.line === "number" &&
    typeof (error as ParserSyntaxError).location?.start?.column === "number"
  );
}

export function getJaggerScriptSyntaxMarkers(
  source: string,
  severity: number
): editor.IMarkerData[] {
  try {
    getParser().parse(source);
  } catch (error) {
    if (!isParserSyntaxError(error)) {
      return [];
    }

    const start = error.location?.start;
    const end = error.location?.end ?? start;

    if (!start || !end) {
      return [];
    }

    return [
      {
        severity,
        message: error.message,
        startLineNumber: start.line,
        startColumn: start.column,
        endLineNumber: end.line,
        endColumn: end.column > start.column ? end.column : start.column + 1
      }
    ];
  }

  const knownTypes = new Set(["number", "string", "boolean", "undefined"]);
  const nonTypeStatementKeywords = new Set([
    "return",
    "break",
    "if",
    "elif",
    "else",
    "while",
    "for",
    "new",
    "super"
  ]);
  const classPattern = /^\s*class\s+([A-Z][\w$]*)\b/gm;

  for (const match of source.matchAll(classPattern)) {
    const className = match[1];

    if (className) {
      knownTypes.add(className);
    }
  }

  const markers: editor.IMarkerData[] = [];
  const lines = source.split("\n");
  const declarationPattern = /^(\s*)([A-Za-z_]\w*)\s+([a-z_]\w*)\s*(?==|;)/;

  lines.forEach((line, index) => {
    const match = line.match(declarationPattern);

    if (!match) {
      return;
    }

    const [, indentation = "", typeName = ""] = match;

    if (knownTypes.has(typeName) || nonTypeStatementKeywords.has(typeName)) {
      return;
    }

    markers.push({
      severity,
      message: `Unknown type "${typeName}".`,
      startLineNumber: index + 1,
      startColumn: indentation.length + 1,
      endLineNumber: index + 1,
      endColumn: indentation.length + typeName.length + 1
    });
  });

  return markers;
}
