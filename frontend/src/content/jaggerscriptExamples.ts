import allocateInstanceSource from "../../../jaggerscript/test-program/AllocateAnInstance.j?raw";
import doublyLinkedListSource from "../../../jaggerscript/test-program/DoublyLinkedList.j?raw";
import doubleBreakSource from "../../../jaggerscript/test-program/DoubleBreak.j?raw";
import fizzBuzzSource from "../../../jaggerscript/test-program/FizzBuzz.j?raw";
import getReferenceSource from "../../../jaggerscript/test-program/GetTheReference.j?raw";
import onlyTheEvensSource from "../../../jaggerscript/test-program/OnlyTheEvens.j?raw";
import cubeRootSource from "../../../jaggerscript/test-program/CubeRoot.j?raw";
import nestingDollSource from "../../../jaggerscript/test-program/NestingDollClasses.j?raw";
import randomSource from "../../../jaggerscript/test-program/Random.j?raw";
import type { JaggerScriptExample } from "../types/content";

export const jaggerscriptExamples: JaggerScriptExample[] = [
  {
    id: "doubly-linked-list",
    title: "DoublyLinkedList",
    description: "Classes, mutation, and console output.",
    source: doublyLinkedListSource
  },
  {
    id: "fizz-buzz",
    title: "FizzBuzz",
    description: "Control flow, arithmetic, and logging.",
    source: fizzBuzzSource
  },
  {
    id: "only-the-evens",
    title: "OnlyTheEvens",
    description: "Filter evens with simple iteration.",
    source: onlyTheEvensSource
  },
  {
    id: "cube-root",
    title: "CubeRoot",
    description: "Numeric iteration inside the interpreter.",
    source: cubeRootSource
  },
  {
    id: "double-break",
    title: "DoubleBreak",
    description: "Nested loops and early exits.",
    source: doubleBreakSource
  },
  {
    id: "nesting-dolls",
    title: "NestingDollClasses",
    description: "Nested instances and object graphs.",
    source: nestingDollSource
  },
  {
    id: "allocate-instance",
    title: "AllocateAnInstance",
    description: "Allocate and initialize an instance.",
    source: allocateInstanceSource
  },
  {
    id: "get-the-reference",
    title: "GetTheReference",
    description: "Reference access and object behavior.",
    source: getReferenceSource
  },
  {
    id: "random",
    title: "Random",
    description: "A quick sandbox for language tweaks.",
    source: randomSource
  }
];

export const defaultExampleId = jaggerscriptExamples[0].id;
