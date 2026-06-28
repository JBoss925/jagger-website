import jaggerscriptPreview from "../../assets/jaggerscript-preview.jpg";
import type { PaperDocument } from "./types";
export const jaggerscriptPaper: PaperDocument = {
    slug: "jaggerscript",
    title: "JaggerScript: A Browser-Runnable Typed Scripting Language",
    subtitle: "A compact language implementation that owns the grammar, typed intermediate representation, heap-backed interpreter, examples, diagnostics, and browser playground.",
    authors: ["Jagger Brulato"],
    date: "2026",
    abstract: "JaggerScript is a small typed scripting language implemented in TypeScript. The system includes a PEG grammar, a compiler pass that converts parser output into a typed intermediate program representation, an interpreter with stack frames and heap-backed object instances, and a browser playground powered by Monaco. The language supports classes, constructors, functions, primitive values, arithmetic and boolean expressions, conditional blocks, loops, break, return, instantiation, scoped member access, and console output examples. This paper explains the implementation as a language-tooling system: a deliberate separation between parsing, normalization, runtime evaluation, and the interface used to explore the language.",
    description: "A technical paper for a small typed scripting language with a PEG parser, typed IR, heap-backed interpreter, and browser playground.",
    categories: ["Language Tooling", "Systems", "Research Notes"],
    tags: [
        "JaggerScript",
        "TypeScript",
        "React",
        "Vite",
        "PEG Parser",
        "Interpreter",
        "Object Model",
        "Language Design",
        "Runtime",
        "Monaco",
        "Monarch Highlighting",
        "Diagnostics"
    ],
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
                    text: "The separation is useful because each layer has a different failure mode. Grammar bugs produce malformed parse trees, compiler bugs produce incorrect normalized tokens, runtime bugs corrupt state, and interface bugs make the language hard to explore. The browser playground exposes those boundaries directly."
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
            id: "grammar",
            eyebrow: "IV",
            title: "Grammar and Surface Semantics",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The grammar is PEG-based and statement-oriented. A source file is a sequence of class declarations and comments. Class bodies contain field definitions, functions, and a constructor. Function bodies contain definitions, reassignment, function calls, object construction, conditionals, loops, break, and return."
                },
                {
                    kind: "equation",
                    label: "Program grammar",
                    tex: "P ::= (Class \\mid Comment)^{*}",
                    caption: "The parser accepts a program as a flat sequence of class declarations and comments."
                },
                {
                    kind: "equation",
                    label: "Class grammar",
                    tex: "Class ::= \\texttt{class}\\;C\\;\\{ Definition^{*}\\;Function^{*}\\;Constructor?\\}",
                    caption: "Classes own global definitions, functions, and an optional constructor body."
                },
                {
                    kind: "example",
                    label: "Representative program",
                    language: "javascript",
                    code: `class Counter {
  number value = 0;

  constructor(number start) {
    value = start;
  }

  func number next() {
    value = value + 1;
    return value;
  }
}`,
                    caption: "The language keeps class structure explicit while using compact imperative statements inside functions and constructors."
                },
                {
                    kind: "paragraph",
                    text: "Arithmetic expressions use conventional precedence by parsing additive tails over multiplicative terms. Boolean expressions compare two expressions with relational or equality operators. Function calls and scoped variables share the same scope prefix representation, which lets method calls and member access reuse the same scope-walk machinery."
                }
            ],
        },
        {
            id: "program-representation",
            eyebrow: "V",
            title: "Typed Program Representation",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The compiler output is a discriminated token graph. It is not a direct parser tree: every node receives a runtime token kind and only the fields needed by evaluation. That makes reconstruction straightforward because parser details such as whitespace and grammar helper productions are removed before interpretation."
                },
                {
                    kind: "example",
                    label: "Runtime tokens",
                    language: "typescript",
                    code: `Program = { token: Program, classes: Class[] }
Class = {
  token: Class;
  name: string;
  globalVars: Definition[];
  functions: Func[];
  construct?: Constructor;
}
Func = {
  token: Func;
  parent: string;
  name: string;
  args?: ArgsDefine;
  within: Token[];
}
Variable = {
  token: Variable;
  scope?: ScopeSpec;
  variableName: string;
  type: ValueType;
  typeStr: string;
}`,
                    caption: "The interpreter consumes normalized token objects instead of parser productions."
                },
                {
                    kind: "equation",
                    label: "Normalization invariant",
                    tex: "\\forall n \\in P_{typed},\\; n.token \\in Tokens",
                    caption: "Every executable node after compilation has a known runtime token tag."
                },
                {
                    kind: "paragraph",
                    text: "Definitions carry declared type strings; primitives are converted into typed Value nodes; arithmetic operators are represented as left expression plus ordered operation tail; function-call arguments are normalized into arrays even when the source contains one argument."
                }
            ],
        },
        {
            id: "runtime",
            eyebrow: "VI",
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
                },
                {
                    kind: "diagram",
                    label: "Interpreter state topology",
                    body: `Program
  |
  v
class table C -------- function table F
  |                         |
  v                         v
running instance i ---- stack frame K[sp]
  |                         |
  v                         v
globalScope: name -> ptr   locals: name -> Value
  |
  v
heap H: ptr -> Value`,
                    caption: "Object fields are addressed through heap pointers, while local variables live in the active stack frame."
                },
                {
                    kind: "paragraph",
                    text: "Assignments preserve the existing storage discipline. Local writes update the active frame. Field writes walk the scope path to the target instance and then update or replace the heap value behind the field pointer. If the existing field type and assigned value type disagree, the runtime rejects the assignment."
                },
                {
                    kind: "equation",
                    label: "Assignment type invariant",
                    tex: "\\operatorname{type}(H[p]) = \\operatorname{type}(v) \\Rightarrow H'[p] = v",
                    caption: "A field assignment is valid only when the stored field type agrees with the assigned value type."
                }
            ],
        },
        {
            id: "allocation",
            eyebrow: "VII",
            title: "Allocation and Object Identity",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Object construction allocates an Instance value on the heap, temporarily sets it as the running instance, evaluates global field definitions, restores the prior running instance, and finally evaluates the constructor body against the new instance."
                },
                {
                    kind: "diagram",
                    label: "Instance allocation",
                    body: `new Class(args)
  |
  v
allocate pointer p
  |
  v
heap[p] = Value(Instance)
  |
  v
runningInstance = heap[p]
  |
  v
evaluate field definitions into globalScope
  |
  v
evaluate constructor(args)
  |
  v
return Instance pointer`,
                    caption: "Field initialization and constructor execution both operate through the heap-backed instance scope."
                },
                {
                    kind: "equation",
                    label: "Object identity",
                    tex: "x \\equiv y \\Leftrightarrow ptr(x)=ptr(y)",
                    caption: "Two object values are the same runtime object exactly when their heap pointers match."
                },
                {
                    kind: "paragraph",
                    text: "Primitive values can be stored directly in stack frames, but object fields point into the heap. Reassignment to a field either reuses an existing heap-backed value or allocates a new heap slot and updates the owning instance's globalScope mapping."
                }
            ],
        },
        {
            id: "evaluation",
            eyebrow: "VIII",
            title: "Evaluation Semantics",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Evaluation is state-transforming. Most executable tokens consume an interpreter state and return an updated state plus, when applicable, a value. Function invocation creates a new frame, binds arguments, evaluates the function body in order, and unwinds on return. Constructors reuse the same mechanism while temporarily switching the running instance."
                },
                {
                    kind: "equation",
                    label: "Statement evaluation",
                    tex: "\\langle s, S \\rangle \\Downarrow S'",
                    caption: "Statements transform interpreter state."
                },
                {
                    kind: "equation",
                    label: "Expression evaluation",
                    tex: "\\langle e, S \\rangle \\Downarrow (v, S')",
                    caption: "Expressions produce a value and may also update state when calls or allocation occur."
                },
                {
                    kind: "diagram",
                    label: "Function call path",
                    body: `FuncCall
  |
  v
resolve receiver scope
  |
  v
lookup function in class table
  |
  v
push stack frame and bind args
  |
  v
evaluate body until return/break/end
  |
  v
pop frame and restore running instance`,
                    caption: "Function calls isolate locals in a stack frame while preserving object identity through the heap."
                },
                {
                    kind: "paragraph",
                    text: "Break is represented as a control signal rather than as an ordinary value. Loop evaluation catches the break signal and exits the nearest loop; return exits the current function body with the produced value."
                }
            ],
        },
        {
            id: "expression-semantics",
            eyebrow: "IX",
            title: "Expression Semantics",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Expression evaluation is strict and eager. Arithmetic expressions evaluate the left operand, then each operation tail in order. Boolean expressions evaluate both sides and apply the relational or equality operator. Function calls evaluate argument expressions before binding them to the callee's parameter names."
                },
                {
                    kind: "equation",
                    label: "Arithmetic fold",
                    tex: "\\operatorname{eval}(a_0\\;op_1\\;a_1\\ldots op_n\\;a_n)=(((a_0\\;op_1\\;a_1)\\;op_2\\;a_2)\\ldots op_n\\;a_n)",
                    caption: "The normalized arithmetic tail is evaluated as a left fold after grammar-level precedence has selected terms."
                },
                {
                    kind: "equation",
                    label: "Call binding",
                    tex: "K' = K[sp+1][param_i \\mapsto eval(arg_i)]",
                    caption: "A function call pushes a frame and binds evaluated arguments by position."
                },
                {
                    kind: "example",
                    label: "Scoped member access",
                    language: "text",
                    code: `doll.inner.value
  1. resolve doll in local frame or running instance scope
  2. assert doll is an Instance
  3. follow inner through doll.globalScope
  4. assert inner is an Instance
  5. read value from inner.globalScope`,
                    caption: "Scope paths are resolved one object boundary at a time with instance assertions at every intermediate step."
                }
            ],
        },
        {
            id: "playground",
            eyebrow: "X",
            title: "Browser Playground",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The browser integration turns the interpreter into a browser-native playground. Monaco provides the editable source surface, a Monarch tokenizer gives JaggerScript-specific highlighting, and a diagnostics pass marks syntax problems as the user edits."
                },
                {
                    kind: "paragraph",
                    text: "The examples rail is part of the technical interface. Small runnable programs exercise specific runtime behaviors and provide stable fixtures for understanding parser, compiler, and interpreter output."
                },
                {
                    kind: "bullets",
                    items: [
                        "Built-in examples include FizzBuzz, CubeRoot, DoublyLinkedList, DoubleBreak, OnlyTheEvens, NestingDollClasses, AllocateAnInstance, GetTheReference, and Random.",
                        "The Run action parses, compiles, evaluates, and prints interpreter output.",
                        "The Reset action restores the selected example source.",
                        "The browser route makes the language testable without local installation."
                    ]
                }
            ],
        },
        {
            id: "diagnostics",
            eyebrow: "XI",
            title: "Diagnostics and Editor Tooling",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The browser integration wraps the parser with Monaco diagnostics. Parse failures are converted into editor markers with line and column ranges. A lightweight semantic pass also identifies unknown declared types by comparing declarations against primitive type names and class names found in the current source."
                },
                {
                    kind: "equation",
                    label: "Marker mapping",
                    tex: "m = (line_s, col_s, line_e, col_e, message, severity)",
                    caption: "Parser locations are converted into Monaco marker records so syntax errors attach to source spans."
                },
                {
                    kind: "paragraph",
                    text: "Syntax highlighting is supplied through a Monarch tokenizer. Keywords, type keywords, function names, console calls, identifiers, class names, strings, numbers, comments, delimiters, and operators receive separate token classes. The editor route therefore presents the language as an owned tool rather than plain text in a generic textarea."
                },
                {
                    kind: "bullets",
                    items: [
                        "The Check action parses and reports diagnostics without running the program.",
                        "The Run action captures console output and restores the original console hooks after execution.",
                        "Examples are imported as raw source files so the playground and repository tests share the same corpus.",
                        "Editor theme state is persisted locally and does not affect runtime behavior."
                    ]
                }
            ],
        },
        {
            id: "runtime-errors",
            eyebrow: "XII",
            title: "Runtime Errors and Safety Checks",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The interpreter rejects invalid runtime states immediately. Missing variables, non-instance scoped access, unknown fields, and type-incompatible field assignments raise errors instead of returning undefined values. That behavior is important because the language has explicit type annotations but does not implement a full static checker."
                },
                {
                    kind: "bullets",
                    items: [
                        "Unbound local or field names produce a missing-variable error.",
                        "Attempting to traverse a primitive as an instance produces an instance assertion error.",
                        "Assigning a value whose typeStr differs from an existing field type is rejected.",
                        "Break is only meaningful inside loop evaluation and is represented as a control exception.",
                        "Console output is captured and formatted by the browser runtime wrapper."
                    ]
                },
                {
                    kind: "equation",
                    label: "Field assignment guard",
                    tex: "\\operatorname{typeStr}(old) \\ne \\operatorname{typeStr}(new) \\Rightarrow error",
                    caption: "Runtime field mutation preserves the declared or previously established field type."
                }
            ],
        },
        {
            id: "results",
            eyebrow: "XIII",
            title: "Results and Design Properties",
            blocks: [
                {
                    kind: "paragraph",
                    text: "JaggerScript demonstrates a complete small-language toolchain in TypeScript: a formal grammar, compiler normalization pass, explicit runtime state, class and instance semantics, scope traversal, function frames, source diagnostics, syntax highlighting, and a browser execution surface."
                },
                {
                    kind: "paragraph",
                    text: "The technical value is the separation of responsibilities. The parser recognizes syntax, the compiler gives syntax a runtime shape, the interpreter owns state transitions, and the editor projects parser/runtime results back to the user. That structure is sufficient to reconstruct the current language without treating the playground as a special case."
                },
                {
                    kind: "bullets",
                    items: [
                        "The language supports class-based object programs with constructors, fields, functions, loops, branches, return, break, allocation, reassignment, and scoped member access.",
                        "Heap-backed instances preserve object identity across local frames and nested references.",
                        "The compiler pass prevents parser-node shape from leaking directly into the interpreter.",
                        "The Monaco integration makes parse and type-name feedback available at edit time."
                    ]
                }
            ],
        }
    ],
    audioSamples: []
};
