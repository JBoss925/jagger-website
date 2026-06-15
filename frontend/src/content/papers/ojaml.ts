import ojamlPreview from "../../assets/ojaml-preview.jpg";
import type { PaperDocument } from "./types";

export const ojamlPaper: PaperDocument = {
  slug: "ojaml",
  title: "OJaml: An OCaml-Inspired Language Compiled to WebAssembly",
  subtitle:
    "A browser-native language implementation with OCaml-style syntax, Hindley-Milner-inspired inference, polymorphic collections, first-class functions, and direct WebAssembly execution.",
  authors: ["Jagger Brulato"],
  date: "2026",
  abstract:
    "OJaml is an OCaml-inspired programming language designed to compile and run entirely inside the browser. Its implementation includes a lexer, recursive-descent parser, polymorphic type checker, WebAssembly text backend, runtime bridge, Monaco language service, examples, and reusable editor package. The current language supports top-level and local bindings, recursion, pattern matching, first-class functions and closures, strings, unit, polymorphic arrays, lists, and maps, higher-order collection operations, and browser-native printing. This paper describes how those pieces fit together and why WebAssembly makes a useful execution target for an interactive language workbench.",
  description:
    "A technical paper for an OCaml-inspired language with polymorphic type inference, first-class functions, collections, Monaco tooling, and a WebAssembly runtime.",
  categories: ["Language Tooling", "Systems", "Research Notes"],
  tags: ["TypeScript", "WebAssembly", "Type Inference", "Compiler", "Closures", "Monaco"],
  repoUrl: "https://github.com/JBoss925/OJaml",
  previewImage: ojamlPreview,
  previewAlt: "OJaml browser editor preview",
  previewCaption:
    "OJaml editor. Source is parsed, type checked, compiled to WebAssembly text, converted to a binary module, and executed locally in the browser.",
  actionLinks: [
    {
      label: "Open Editor",
      href: "/ojaml",
      description: "Compile and run OJaml programs in the browser"
    }
  ],
  sections: [
    {
      id: "motivation",
      eyebrow: "I",
      title: "Motivation",
      paragraphs: [
        "OJaml explores how much of an OCaml-like programming experience can live directly in a browser without a remote compiler. The useful constraint is that the whole path must be understandable and local: source text becomes an AST, the AST is checked, valid programs become WebAssembly, and the resulting module is instantiated by the browser.",
        "That makes the editor more than a syntax demo. Every example exercises the same compiler and runtime path that the command-line interface uses."
      ],
      bullets: [
        "Keep the syntax and programming model recognizably OCaml-inspired.",
        "Provide real static diagnostics before execution.",
        "Compile to portable WebAssembly rather than interpreting source in the editor.",
        "Package the editor so it can be embedded as a reusable component."
      ]
    },
    {
      id: "frontend",
      eyebrow: "II",
      title: "Lexer, Parser, and Language Core",
      paragraphs: [
        "The frontend uses a dedicated lexer and recursive-descent parser. Programs contain top-level let and let rec declarations, while expressions cover local let bindings, conditionals, function application, anonymous functions, arithmetic, comparisons, boolean operations, and match expressions.",
        "Pattern matching currently supports integer, string, boolean, unit, wildcard, and variable patterns. Match checking requires a wildcard or variable catch-all arm, which prevents a common class of incomplete programs before code generation."
      ],
      bullets: [
        "Top-level recursion supports examples such as factorial and Fibonacci.",
        "Local let expressions provide scoped intermediate values.",
        "Strings, booleans, integers, and unit form the primitive core.",
        "OCaml-style match expressions make control flow data-oriented."
      ]
    },
    {
      id: "types",
      eyebrow: "III",
      title: "Polymorphic Type Checking",
      paragraphs: [
        "The checker represents primitive types, type variables, collection applications, maps, and function types. It creates declaration stubs, checks bodies against those stubs, and unifies constraints as expressions are visited.",
        "The standard library is typed through explicit polymorphic schemes instead of untyped runtime hooks. Arrays, lists, maps, higher-order collection helpers, and print all enter the environment with complete signatures, then each use site receives fresh variables that are unified with the surrounding program.",
        "That matters most for maps: Map.empty begins with unknown key and value variables, Map.set fixes both sides from the provided key and value, and Map.get and Map.has must use the same key type later. Once a map becomes a (string, int) map, reading with an int key or writing a string value is rejected before WebAssembly generation.",
        "The editor surfaces the resulting function and value types through diagnostics, hover information, completion details, and signature help. Builtin hovers show the instantiated type at the call site, while non-typed tokens such as keywords, operators, literals, delimiters, and declaration separators still report useful lexical identity."
      ],
      equations: [
        {
          label: "Map.get",
          tex: "\\operatorname{Map.get} : ('k,\\;'v)\\;map \\rightarrow 'k \\rightarrow 'v",
          caption: "A map read uses the same key type established by the map and returns its value type."
        },
        {
          label: "Map.set",
          tex: "\\operatorname{Map.set} : ('k,\\;'v)\\;map \\rightarrow 'k \\rightarrow 'v \\rightarrow ('k,\\;'v)\\;map",
          caption: "A map write preserves the relationship between key type, value type, and the returned map."
        },
        {
          label: "List.map",
          tex: "\\operatorname{map} : ('a \\rightarrow 'b) \\rightarrow 'a\\;list \\rightarrow 'b\\;list",
          caption: "Higher-order collection operations preserve relationships between input and output element types."
        },
        {
          label: "Fold",
          tex: "\\operatorname{fold\\_left} : ('b \\rightarrow 'a \\rightarrow 'b) \\rightarrow 'b \\rightarrow 'a\\;array \\rightarrow 'b",
          caption: "The accumulator type remains independent from the collection element type."
        }
      ],
      bullets: [
        "Branches and match arms must agree on their result type.",
        "Calls are checked for arity and argument compatibility.",
        "Map keys and values remain statically connected across empty, set, get, and has calls.",
        "Undefined names and duplicate bindings are rejected.",
        "The print builtin accepts integers or strings and returns unit."
      ]
    },
    {
      id: "closures",
      eyebrow: "IV",
      title: "First-Class Functions and Closures",
      paragraphs: [
        "Functions are values in OJaml. Top-level functions can be passed into higher-order operations, anonymous functions can be created inside expressions, and closures can capture local values.",
        "The compiler lowers closures into heap-backed environments and table indices. Indirect calls use WebAssembly function tables, while captured values are loaded from the closure environment."
      ],
      equations: [
        {
          label: "Closure representation",
          tex: "c = (i_{table},\\;p_{env})",
          caption: "A closure pairs a callable table entry with a pointer to its captured environment."
        }
      ],
      bullets: [
        "Captured locals are stored in closure environments.",
        "Top-level functions receive closure wrappers when used as values.",
        "Indirect calls support higher-order collection functions.",
        "Direct calls remain available when the callee is statically known."
      ]
    },
    {
      id: "wasm",
      eyebrow: "V",
      title: "WebAssembly Backend and Runtime",
      paragraphs: [
        "The compiler emits WebAssembly text with memory, a function table, a mutable heap pointer, standard-library helpers, declarations, closure wrappers, pending lambdas, string data segments, and an exported main function.",
        "The browser runtime uses WABT to convert the emitted text into a binary module, validates it, instantiates it with printing imports, and executes main. Integers and booleans are immediate i32 values; strings, collections, maps, and closures are represented by heap pointers."
      ],
      equations: [
        {
          label: "Compilation path",
          tex: "source \\rightarrow AST \\rightarrow typed\\;AST \\rightarrow WAT \\rightarrow WASM \\rightarrow result",
          caption: "The editor executes the same compiler pipeline locally for every run."
        }
      ],
      bullets: [
        "WebAssembly memory stores strings and heap-backed runtime values.",
        "Function tables support indirect calls through closures.",
        "Imported print functions bridge WASM output back into the editor.",
        "The result panel exposes the main value, output, and generated module size."
      ]
    },
    {
      id: "tooling",
      eyebrow: "VI",
      title: "Browser Tooling and Next Steps",
      paragraphs: [
        "The reusable Monaco editor connects parsing and type checking directly to the authoring experience. Inline markers, completions, token-level hovers, signature help, examples, compilation output, and execution results make the implementation inspectable without local setup.",
        "Hover data now comes from the checker for typed identifiers and literals, so locals, parameters, top-level declarations, and standard-library calls expose their inferred types directly over the relevant token. When a token is lexical rather than typed, the language service still explains it as a keyword, operator, delimiter, or separator.",
        "The current core deliberately stops before several larger OCaml features. Algebraic data type declarations, records, tuples, modules, exceptions, structural collection patterns, bounds checks, and garbage collection are natural next steps."
      ],
      bullets: [
        "Examples cover primitives, recursion, pattern matching, higher-order functions, closures, and polymorphic collections.",
        "The editor can toggle between execution results and emitted WebAssembly text.",
        "The package exports both the editor component and the compiler/runtime APIs.",
        "Future work can grow the language while preserving the existing frontend, checker, backend, and tooling boundaries."
      ]
    }
  ],
  audioSamples: []
};
