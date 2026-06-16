import jaggerscriptPreview from "../../assets/jaggerscript-preview.jpg";
import type { PaperDocument } from "./types";
export const jaggerscriptPaper: PaperDocument = {
    slug: "jaggerscript",
    title: "JaggerScript: A Browser-Runnable Typed Scripting Language",
    subtitle: "A compact language implementation that owns the grammar, typed intermediate representation, heap-backed interpreter, examples, diagnostics, and browser playground.",
    authors: ["Jagger Brulato"],
    date: "2026",
    abstract: "JaggerScript is a small typed scripting language implemented in TypeScript. The project includes a PEG grammar, a compiler pass that converts parser output into a typed intermediate program representation, an interpreter with stack frames and heap-backed object instances, and a browser playground powered by Monaco. The language supports classes, constructors, functions, primitive values, arithmetic and boolean expressions, conditional blocks, loops, break, return, instantiation, scoped member access, and console output examples. This paper explains the implementation as a language-tooling project: a deliberate separation between parsing, normalization, runtime evaluation, and the interface used to explore the language.",
    description: "A technical paper for a small typed scripting language with a PEG parser, typed IR, heap-backed interpreter, and browser playground.",
    categories: ["Language Tooling", "Systems", "Research Notes"],
    tags: ["TypeScript", "PEG Parser", "Interpreter", "Language Design", "Runtime", "Monaco"],
    repoUrl: "https://github.com/JBoss925/JaggerScript",
    previewImage: jaggerscriptPreview,
    previewAlt: "JaggerScript browser playground preview",
    previewCaption: "JaggerScript playground. The browser surface combines editable source, built-in examples, syntax highlighting, diagnostics, and interpreter output.",
    actionLinks: [
        {
            label: "Open Playground",
            href: "/jaggerscript",
            description: "Run and edit JaggerScript examples in the browser"
        }
    ],
    sections: [
        {
            id: "motivation",
            eyebrow: "I",
            title: "Motivation",
            blocks: [
                {
                    kind: "paragraph",
                    text: "JaggerScript is less about inventing a production language and more about owning the whole language pipeline. It starts with source text, passes through a PEG grammar, normalizes into explicit program structures, and then executes through an interpreter whose state can be inspected and explained."
                },
                {
                    kind: "paragraph",
                    text: "That makes it a useful project because each layer has a different failure mode. Grammar bugs produce malformed parse trees, compiler bugs produce incorrect normalized tokens, runtime bugs corrupt state, and interface bugs make the language hard to explore. Building the browser playground made those boundaries visible."
                },
                {
                    kind: "bullets",
                    items: [
                        "Primary goal: implement the full parser-to-runtime loop in TypeScript.",
                        "User goal: make language behavior explorable without local setup.",
                        "Design constraint: keep the runtime small enough that examples are easy to reason about."
                    ]
                }
            ],
        },
        {
            id: "language-model",
            eyebrow: "II",
            title: "Language Model",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The language is class-oriented and deliberately compact. A program is a list of classes. Classes own global definitions, functions, and a constructor. Function bodies then contain definitions, reassignment, control flow, return, break, instantiation, function calls, variables, and expressions."
                },
                {
                    kind: "paragraph",
                    text: "The type vocabulary is intentionally small: numbers, strings, booleans, and object instances. That keeps the interpreter focused on scope, references, object allocation, and expression evaluation rather than a large standard library."
                },
                {
                    kind: "bullets",
                    items: [
                        "Classes and constructors provide object allocation and initialization.",
                        "Functions, while loops, if/elif/else blocks, break, and return provide imperative control flow.",
                        "Scoped member access supports object graphs such as linked lists and nested instances.",
                        "Example programs cover FizzBuzz, cube-root iteration, linked lists, nested classes, references, and randomized experiments."
                    ]
                }
            ],
        },
        {
            id: "compiler",
            eyebrow: "III",
            title: "Parser and Compiler Pass",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The parser grammar is written in PEG form and emits plain parser nodes with token-type labels. A separate compiler pass converts those raw nodes into a typed program representation. This second pass is important because it turns a syntax-shaped tree into runtime-shaped data."
                },
                {
                    kind: "equation",
                    label: "Frontend mapping",
                    tex: "C : A_{\\mathrm{parse}} \\rightarrow P_{\\mathrm{typed}}",
                    caption: "The compiler maps parser output into an explicit typed program structure consumed by the interpreter."
                },
                {
                    kind: "paragraph",
                    text: "That division keeps the grammar from becoming the whole language implementation. Parsing answers whether the input has the right shape; compilation decides what each shape means to the interpreter."
                },
                {
                    kind: "bullets",
                    items: [
                        "Raw nodes use names such as Class, Definition, Function, IfBlock, WhileLoop, FuncCall, and Primitive.",
                        "Compiled tokens use a smaller enum-like runtime vocabulary.",
                        "Expression conversion handles primitives, arithmetic expressions, boolean expressions, function calls, variables, and instantiation.",
                        "Comments are filtered from the executable program representation."
                    ]
                }
            ],
        },
        {
            id: "runtime",
            eyebrow: "IV",
            title: "Interpreter Runtime",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The interpreter state is built around a heap, a stack of function frames, a stack pointer, the currently running instance, class definitions, and function maps. Object instances hold a pointer and a global scope that maps field names to heap pointers."
                },
                {
                    kind: "equation",
                    label: "Runtime state",
                    tex: "S = (H,\\;K,\\;sp,\\;i_{\\mathrm{current}},\\;C,\\;F)",
                    caption: "The interpreter state combines heap, stack frames, active instance, class table, and function table."
                },
                {
                    kind: "paragraph",
                    text: "That model gives the language reference behavior without pretending JavaScript variables are the runtime. Local variables live in stack frames; object fields live through heap-backed instance scopes; scoped access walks object references until it reaches the requested field."
                },
                {
                    kind: "equation",
                    label: "Scoped lookup",
                    tex: "v(a.b.c) = H\\left[\\operatorname{scope}(H[\\operatorname{scope}(a)].b).c\\right]",
                    caption: "Member access is resolved by following instance scopes through heap pointers until the final field is found."
                }
            ],
        },
        {
            id: "playground",
            eyebrow: "V",
            title: "Browser Playground",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The portfolio integration turns the local interpreter into a browser-native playground. Monaco provides the editable source surface, a Monarch tokenizer gives JaggerScript-specific highlighting, and a diagnostics pass marks syntax problems as the user edits."
                },
                {
                    kind: "paragraph",
                    text: "The examples rail is as important as the editor. A language demo without small, runnable programs asks too much of the reader. The playground makes the interpreter concrete by loading programs that each exercise a different runtime behavior."
                },
                {
                    kind: "bullets",
                    items: [
                        "Built-in examples include FizzBuzz, CubeRoot, DoublyLinkedList, DoubleBreak, OnlyTheEvens, NestingDollClasses, AllocateAnInstance, GetTheReference, and Random.",
                        "The Run action parses, compiles, evaluates, and prints interpreter output.",
                        "The Reset action restores the selected example source.",
                        "The web route makes the language testable without cloning the repository."
                    ]
                }
            ],
        },
        {
            id: "takeaways",
            eyebrow: "VI",
            title: "Technical Takeaways",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The most useful lesson from JaggerScript is that a small language still benefits from production-shaped boundaries. A parser, compiler, runtime, diagnostics layer, and editor integration each deserve their own ownership line."
                },
                {
                    kind: "paragraph",
                    text: "The project also shows why browser execution is valuable for language tooling. When the user can edit an example, run it immediately, and see output beside the source, the implementation becomes easier to evaluate than a README-only interpreter."
                },
                {
                    kind: "bullets",
                    items: [
                        "Language projects become clearer when syntax, IR, and runtime state are separate.",
                        "Heap-backed instances make reference behavior visible and inspectable.",
                        "A browser playground turns the interpreter into a usable learning and debugging tool."
                    ]
                }
            ],
        }
    ],
    audioSamples: []
};
