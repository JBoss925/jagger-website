import { convertToProgram } from "../../../../old_website/jagger-website/src/jaggerscript/compiler/compiler";
import { evalProgram } from "../../../../old_website/jagger-website/src/jaggerscript/interpreter/interpreter";
import {
  defaultExampleId,
  jaggerscriptExamples
} from "../../content/jaggerscriptExamples";
import type { JaggerScriptExample } from "../../types/content";
import { getParser } from "./parserRuntime";

function formatValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Error) {
    return value.message;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function loadExample(id = defaultExampleId): JaggerScriptExample {
  return jaggerscriptExamples.find((example) => example.id === id) ?? jaggerscriptExamples[0];
}

export function run(source: string): string[] {
  const output: string[] = [];
  const capture = (...args: unknown[]) => {
    output.push(args.map(formatValue).join(" "));
  };

  const originalLog = console.log;
  const originalError = console.error;

  console.log = capture;
  console.error = capture;

  try {
    const ast = getParser().parse(source);
    const program = convertToProgram(ast);
    evalProgram(program);

    if (output.length === 0) {
      output.push("Program completed without console output.");
    }
  } catch (error) {
    output.push(formatValue(error));
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }

  return output;
}
