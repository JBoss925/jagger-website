import doublyLinkedListSource from "../../../jaggerscript/test-program/DoublyLinkedList.j?raw";
import fizzBuzzSource from "../../../jaggerscript/test-program/FizzBuzz.j?raw";
import cubeRootSource from "../../../jaggerscript/test-program/CubeRoot.j?raw";
import nestingDollSource from "../../../jaggerscript/test-program/NestingDollClasses.j?raw";
import randomSource from "../../../jaggerscript/test-program/Random.j?raw";
import type { JaggerScriptExample } from "../types/content";

export const jaggerscriptExamples: JaggerScriptExample[] = [
  {
    id: "doubly-linked-list",
    title: "DoublyLinkedList",
    description:
      "A larger object-oriented demo with custom classes, sorting, mutation, and console output.",
    source: doublyLinkedListSource
  },
  {
    id: "fizz-buzz",
    title: "FizzBuzz",
    description:
      "A compact sanity check for control flow, arithmetic, and console logging.",
    source: fizzBuzzSource
  },
  {
    id: "cube-root",
    title: "CubeRoot",
    description:
      "Shows numeric operations and iterative problem solving inside the interpreter.",
    source: cubeRootSource
  },
  {
    id: "nesting-dolls",
    title: "NestingDollClasses",
    description:
      "Exercises nested instances and reference-heavy object graphs in the runtime.",
    source: nestingDollSource
  },
  {
    id: "random",
    title: "Random",
    description:
      "A smaller playground for poking at the language and tweaking behavior quickly.",
    source: randomSource
  }
];

export const defaultExampleId = jaggerscriptExamples[0].id;
