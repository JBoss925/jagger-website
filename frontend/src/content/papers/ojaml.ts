import ojamlPreview from "../../assets/ojaml-preview.jpg";
import type { PaperDocument } from "./types";
export const ojamlPaper: PaperDocument = {
    slug: "ojaml",
    title: "OJaml: An OCaml-Inspired Language Compiled to WebAssembly",
    subtitle: "A complete browser-native language pipeline: lexical analysis, recursive-descent parsing, Hindley-Milner-style inference, typed standard-library schemes, closure conversion, WebAssembly emission, runtime execution, and Monaco tooling.",
    authors: ["Jagger Brulato"],
    date: "2026",
    abstract: "OJaml is an OCaml-inspired language implemented end to end in TypeScript. The project owns the full compiler pipeline: source text is lexed into tokens, parsed into an expression AST, checked by a Hindley-Milner-style unifier with explicit polymorphic standard-library schemes, lowered to WebAssembly text, compiled to a binary module through WABT, and instantiated directly in the browser. The language supports top-level and local bindings, recursion, pattern matching with tuple and list destructuring, first-class functions, closures, ints, floats, strings, unit, tuples, pair projection, power expressions, polymorphic functions, polymorphic arrays, lists, sets, maps, higher-order collection functions, runtime access checks, print/println output, to_string formatting, diagnostics, completions, token-level hovers, and a reusable Monaco editor package. This paper specifies the syntax, static semantics, runtime representation, compilation strategy, proof obligations, and implementation boundaries needed to reconstruct the current OJaml system.",
    description: "A detailed technical paper for reconstructing OJaml: grammar, AST, type inference, polymorphic stdlib typing, closure lowering, WebAssembly layout, runtime execution, and editor tooling.",
    categories: ["Language Tooling", "Systems", "Research Notes"],
    tags: [
        "OJaml",
        "TypeScript",
        "React",
        "Vite",
        "WebAssembly",
        "WABT",
        "Type Inference",
        "Hindley-Milner",
        "Compiler",
        "Closures",
        "Recursive Descent Parser",
        "Monaco",
        "CLI"
    ],
    repoUrl: "https://github.com/JBoss925/OJaml",
    previewImage: ojamlPreview,
    previewAlt: "OJaml browser editor preview",
    previewCaption: "OJaml editor. Source is parsed, type checked, compiled to WebAssembly text, converted to a binary module, and executed locally in the browser.",
    actionLinks: [
        {
            label: "Open Editor",
            href: "/ojaml",
            description: "Compile and run OJaml programs in the browser"
        }
    ],
    sections: [
        {
            id: "thesis",
            eyebrow: "I",
            title: "Thesis and Design Contract",
            blocks: [
                {
                    kind: "paragraph",
                    text: "OJaml is built around one constraint: the browser demo must be the real language implementation. There is no server compiler and no interpreter shortcut hidden behind the editor. The same source pipeline supports the reusable editor, the route embedded in the website, the command-line interface, the tests, and the generated WebAssembly output."
                },
                {
                    kind: "graph",
                    graph: {
                        kind: "ojaml-pipeline",
                        title: "Whole-system pipeline",
                        description: "The checker consumes the parser's AST as its semantic input. Token and span metadata from lexing travels on the dashed path for diagnostics, hovers, and source ranges."
                    }
                },
                {
                    kind: "equation",
                    label: "Compiler contract",
                    tex: "\\operatorname{run}(s) = \\operatorname{instantiate}(\\operatorname{wabt}(\\operatorname{emit}(\\operatorname{check}(\\operatorname{parse}(\\operatorname{lex}(s))))))",
                    caption: "Runtime behavior is downstream of syntax and type checking; invalid programs do not reach WebAssembly emission."
                },
                {
                    kind: "paragraph",
                    text: "OJaml keeps the source language narrow enough for the whole compiler to fit in a TypeScript codebase, while covering the mechanisms that distinguish an ML-family compiler from a syntax demo: inference, recursion, closures, heap allocation, indirect calls, polymorphic containers, and browser-native tooling. Syntax is OCaml-like, values cross WebAssembly function boundaries through a uniform i32 slot, static checks run before emission, and every standard-library function has an explicit type scheme."
                },
                {
                    kind: "paragraph",
                    text: "The implementation keeps stage boundaries visible. Lexing decides what tokens exist. Parsing decides the tree shape. Checking decides whether names, calls, branches, patterns, and standard-library uses are valid. Code generation decides memory layout and call shape. Runtime execution only runs programs that survived those prior stages."
                },
                {
                    kind: "paragraph",
                    text: "The main boundary is between the language surface and the representation the machine runs. The source language has ints, floats, tuples, functions, arrays, lists, sets, maps, strings, and pattern matching. The emitted WebAssembly mostly sees immediate integers and heap pointers. The type checker records the meaning that the backend erases from the raw i32 signatures."
                },
                {
                    kind: "bullets",
                    items: [
                        "The editor, examples, tests, and CLI exercise the same language stages.",
                        "The checker owns static validity; the runtime assumes checked programs.",
                        "The backend targets portable WebAssembly text instead of JavaScript evaluation.",
                        "The current scope is finite: no modules, records, algebraic data type declarations, exceptions, general tuple projection beyond pairs, garbage collection, or structural array/set/map patterns yet."
                    ]
                }
            ],
        },
        {
            id: "surface-language",
            eyebrow: "II",
            title: "Surface Language",
            blocks: [
                {
                    kind: "paragraph",
                    text: "An OJaml program is a sequence of top-level let declarations. A declaration may be recursive, may bind parameters, and may be separated by optional double semicolons. Expressions include primitives, tuples, variables, unary and binary operations, conditionals, local lets, function application, anonymous functions, and match expressions."
                },
                {
                    kind: "example",
                    label: "Hello world",
                    language: "ocaml",
                    code: `let main =
  println "Hello, OJaml!"`,
                    caption: "A minimal program binds main to an expression. println accepts int, float, or string, writes a trailing newline, and returns unit."
                },
                {
                    kind: "equation",
                    label: "Program grammar",
                    tex: "P ::= D^{*}\\quad\\quad D ::= \\texttt{let}\\;\\texttt{rec?}\\;x\\;x^{*}=e",
                    caption: "A program is a list of declarations; curried-looking parameters are stored as declaration parameters."
                },
                {
                    kind: "paragraph",
                    text: "The surface syntax borrows the OCaml forms that support this compiler's goals without committing to the whole language. Function application is whitespace-based. Parentheses group expressions and represent unit when empty. Comments are block comments with nesting support. Module-style standard-library names such as Map.get are lexed as identifiers, which avoids module parsing while still allowing namespaced builtins."
                },
                {
                    kind: "example",
                    label: "Core expression tour",
                    language: "ocaml",
                    code: `let rec fact n =
  match n with
  | 0 -> 1
  | 1 -> 1
  | _ -> n * fact (n - 1)

let main =
  let x = fact 5 in
  if x > 100 then x else 0`,
                    caption: "Top-level recursion, match, local let, arithmetic, comparison, and if/then/else all compile through the same expression checker."
                },
                {
                    kind: "equation",
                    label: "Expression grammar",
                    tex: "e ::= n\\mid f\\mid s\\mid b\\mid ()\\mid (e, e^{+})\\mid x\\mid e\\;e^{+}\\mid \\texttt{fun}\\;x^{+}\\rightarrow e\\mid \\texttt{let}\\;x=e\\;\\texttt{in}\\;e\\mid \\texttt{if}\\;e\\;\\texttt{then}\\;e\\;\\texttt{else}\\;e\\mid \\texttt{match}\\;e\\;\\texttt{with}\\;(p\\rightarrow e)^{+}",
                    caption: "The expression set covers the constructs needed for recursion, higher-order functions, tuple grouping, and collection programs."
                },
                {
                    kind: "paragraph",
                    text: "Every construct in the grammar maps to a direct AST node. That correspondence is an engineering choice: it keeps diagnostics precise, lets hover spans point back to real tokens, and lets later compilation passes switch on explicit node kinds instead of recovering meaning from parser artifacts."
                },
                {
                    kind: "bullets",
                    items: [
                        "Lexed token kinds include ints, floats, strings, identifiers, keywords, operators, parentheses, pipes, arrows, equals, separators, and EOF.",
                        "Supported primitive values are int, float, bool, string, and unit; tuple expressions group two or more values, and fst/snd project pairs.",
                        "Supported binary operators include int and float arithmetic, right-associative power **, mixed numeric comparisons, equality/inequality, boolean conjunction/disjunction, and int-only mod.",
                        "Patterns cover int, float, string, bool, unit, tuple structure, list structure, wildcard, and variable catch-all patterns."
                    ]
                }
            ],
        },
        {
            id: "ast",
            eyebrow: "III",
            title: "AST and Source Spans",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The parser emits a purpose-built AST rather than preserving parser tokens as the executable representation. Program nodes contain declarations. Declaration nodes store the binding name, precise binding span, parameter names, parameter spans, body expression, and full declaration span. Expression nodes carry a kind-specific payload and a source span."
                },
                {
                    kind: "diagram",
                    label: "AST shape",
                    body: `Program
  declarations: Declaration[]

Declaration
  kind: Let
  recursive: boolean
  name: string
  nameSpan: SourceSpan
  params: string[]
  paramSpans: SourceSpan[]
  value: Expr
  span: SourceSpan

Expr
  Int | Float | String | Bool | Unit | Tuple | Var
  Unary | Binary | If | LetIn
  Call | Fun | Match

Pattern
  PInt | PFloat | PString | PBool | PUnit
  PTuple | PListNil | PListCons | PWildcard | PVar`,
                    caption: "The AST mirrors the implemented language constructs, and binder spans are first-class data."
                },
                {
                    kind: "equation",
                    label: "Span invariant",
                    tex: "\\forall n \\in AST,\\; 0 \\le n.start \\le n.end \\le |source|",
                    caption: "Every diagnostic or hover range is an interval over the original source."
                },
                {
                    kind: "paragraph",
                    text: "Spans are not cosmetic. They are part of the language service contract. Diagnostics use spans to mark errors; editor hovers use spans to identify exactly which token is being described; local binders and function parameters keep separate name spans so a hover over the binder reports the same inferred type as a hover over a later use."
                },
                {
                    kind: "paragraph",
                    text: "This design keeps binding structure in the AST, so downstream passes do not need to re-tokenize source text to understand binding sites. The checker can annotate the program with symbol and token metadata after unification has resolved type variables."
                },
                {
                    kind: "bullets",
                    items: [
                        "Declaration name spans and parameter spans make top-level hovers precise.",
                        "Local let name spans make inferred local values hoverable at the binding site.",
                        "Function parameter spans make anonymous function parameters hoverable.",
                        "Pattern spans make variable catch-all and tuple-destructured bindings available to diagnostics and hovers."
                    ]
                }
            ],
        },
        {
            id: "static-semantics",
            eyebrow: "IV",
            title: "Static Semantics and Type Representation",
            blocks: [
                {
                    kind: "paragraph",
                    text: "OJaml uses a Hindley-Milner-style constraint system. Types are primitives, type variables, applications for tuples/arrays/lists/sets/maps, and function types. Checking walks the AST, creates fresh type variables where information is not known yet, and unifies constraints as expressions demand relationships between values."
                },
                {
                    kind: "paragraph",
                    text: "In plain terms, inference means type annotations are not required everywhere. The checker invents placeholders, then replaces or links those placeholders as it learns facts from literals, operators, branches, function calls, and standard-library signatures. If two facts disagree, such as a branch being both int and string, the program is rejected before code generation."
                },
                {
                    kind: "diagram",
                    label: "Type constructors",
                    body: `Type
  prim("int" | "float" | "bool" | "string" | "unit")
  var(id, instance?, numeric?)
  app("array", [elem])
  app("list", [elem])
  app("set", [elem])
  app("tuple", [item0, item1, ...])
  app("map", [key, value])
  fn(params[], result)`,
                    caption: "Heap-backed compound values are not erased during checking; tuple positions, collection elements, map keys, and map values remain visible to unification."
                },
                {
                    kind: "example",
                    label: "Rejected branch mismatch",
                    language: "ocaml",
                    code: `let main =
  if true then 1 else "no"`,
                    caption: "The condition is bool, but the branches try to unify int with string, so the checker rejects the program."
                },
                {
                    kind: "equation",
                    label: "Variable lookup",
                    tex: "\\frac{x:\\tau \\in \\Gamma}{\\Gamma \\vdash x : \\tau}\\quad\\quad\\frac{x:\\sigma \\in \\Delta}{\\Gamma,\\Delta \\vdash x : \\operatorname{fresh}(\\sigma)}",
                    caption: "Local values are used directly, while global declarations and builtins are freshly instantiated when referenced."
                },
                {
                    kind: "paragraph",
                    text: "Top-level declarations are installed into the global environment before their bodies are checked. A zero-parameter declaration receives a fresh type variable. A parameterized declaration receives a function stub whose parameter and result types are fresh variables. This permits recursive references because the name is available before the body is checked."
                },
                {
                    kind: "equation",
                    label: "Application",
                    tex: "\\frac{\\Gamma \\vdash f : \\tau_f\\quad \\Gamma \\vdash a_i : \\tau_i\\quad \\operatorname{unify}(\\tau_f,\\;\\tau_1 \\rightarrow \\cdots \\rightarrow \\tau_n \\rightarrow \\alpha)}{\\Gamma \\vdash f\\;a_1\\ldots a_n : \\alpha}",
                    caption: "Function application creates a fresh result type and unifies the callee against a function from argument types to that result."
                },
                {
                    kind: "paragraph",
                    text: "The checker rejects duplicate top-level bindings, undefined names, arity errors, branch disagreement, tuple/list arity or element mismatches in expressions and patterns, non-exhaustive matches without wildcard, variable, structurally exhaustive tuple arms, or complete list empty/cons coverage, invalid pair projection, invalid print/println arguments, and main values that cannot be returned directly from the runtime. main may return int, float, bool, or unit; strings and heap values should be printed, converted with to_string, or reduced to one of those result types."
                },
                {
                    kind: "equation",
                    label: "Branch agreement",
                    tex: "\\frac{\\Gamma \\vdash c:bool\\quad \\Gamma \\vdash t:\\tau\\quad \\Gamma \\vdash e:\\tau}{\\Gamma \\vdash \\texttt{if}\\;c\\;\\texttt{then}\\;t\\;\\texttt{else}\\;e : \\tau}",
                    caption: "Both branches of a conditional must unify to one result type."
                },
                {
                    kind: "bullets",
                    items: [
                        "Pruning follows instantiated type variables until it reaches a concrete representative.",
                        "Occurs checks prevent infinite types such as a = a -> b.",
                        "Freshening copies polymorphic variables so one builtin use cannot constrain another unrelated use.",
                        "Polymorphic functions whose bodies use numeric operators display constrained variables as number when they can be instantiated at either int or float call sites.",
                        "showType formats resolved types for diagnostics, completion details, and hover output."
                    ]
                }
            ],
        },
        {
            id: "stdlib",
            eyebrow: "V",
            title: "Typed Standard Library",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The standard library is part of the type environment, not an untyped escape hatch. Each builtin has a visible signature and a type factory. When the checker creates the builtins map, the factory constructs the type graph for that builtin. When a builtin is referenced, the checker freshens the graph so each call site receives independent variables."
                },
                {
                    kind: "example",
                    label: "Typed map success",
                    language: "ocaml",
                    code: `let main =
  let names = Map.set (Map.empty ()) "ada" 1815 in
  if Map.has names "ada"
  then Map.get names "ada"
  else 0`,
                    caption: "Map.set fixes names as a (string, int) map; Map.has and Map.get must use string keys, and Map.get returns int."
                },
                {
                    kind: "equation",
                    label: "Array API",
                    tex: "\\begin{aligned}\\operatorname{Array.make}&: int \\rightarrow 'a \\rightarrow 'a\\;array\\\\\\operatorname{Array.length}&: 'a\\;array \\rightarrow int\\\\\\operatorname{Array.get}&: 'a\\;array \\rightarrow int \\rightarrow 'a\\\\\\operatorname{Array.set}&: 'a\\;array \\rightarrow int \\rightarrow 'a \\rightarrow unit\\end{aligned}",
                    caption: "Array creation, length, reads, and writes preserve a single element type."
                },
                {
                    kind: "paragraph",
                    text: "Polymorphic collections force the signature table to connect every repeated type variable at the call site. Array.make must connect its element argument to the returned array element type. List.cons must connect the head value and tail list. Set.add must connect the old set element type, inserted value, and returned set. Map.set must connect map key, provided key, map value, provided value, and returned map. Map.get must return exactly the value type stored by the map and must accept exactly the map key type."
                },
                {
                    kind: "example",
                    label: "Typed map rejection",
                    language: "ocaml",
                    code: `let main =
  let names = Map.set (Map.empty ()) "ada" 1815 in
  Map.get names 1815`,
                    caption: "The map key type is string, so an int key cannot type check."
                },
                {
                    kind: "equation",
                    label: "List API",
                    tex: "\\begin{aligned}\\operatorname{List.empty}&: unit \\rightarrow 'a\\;list\\\\\\operatorname{List.cons}&: 'a \\rightarrow 'a\\;list \\rightarrow 'a\\;list\\\\\\operatorname{List.head}&: 'a\\;list \\rightarrow 'a\\\\\\operatorname{List.tail}&: 'a\\;list \\rightarrow 'a\\;list\\\\\\operatorname{List.is\\_empty}&: 'a\\;list \\rightarrow bool\\\\\\operatorname{List.length}&: 'a\\;list \\rightarrow int\\\\\\operatorname{List.map}&: ('a \\rightarrow 'b) \\rightarrow 'a\\;list \\rightarrow 'b\\;list\\end{aligned}",
                    caption: "List operations preserve or transform element types according to their function arguments."
                },
                {
                    kind: "equation",
                    label: "Set API",
                    tex: "\\begin{aligned}\\operatorname{Set.empty}&: unit \\rightarrow 'a\\;set\\\\\\operatorname{Set.add}&: 'a\\;set \\rightarrow 'a \\rightarrow 'a\\;set\\\\\\operatorname{Set.has}&: 'a\\;set \\rightarrow 'a \\rightarrow bool\\\\\\operatorname{Set.length}&: 'a\\;set \\rightarrow int\\end{aligned}",
                    caption: "Set insertion is persistent and idempotent: adding an existing value returns the existing set."
                },
                {
                    kind: "equation",
                    label: "Scalar and string API",
                    tex: "\\begin{aligned}\\operatorname{Float.of\\_int}&: int \\rightarrow float\\\\\\operatorname{Float.to\\_int}&: float \\rightarrow int\\\\\\operatorname{String.concat}&: string \\rightarrow string \\rightarrow string\\\\\\operatorname{String.length}&: string \\rightarrow int\\\\\\operatorname{String.split}&: string \\rightarrow string \\rightarrow string\\;list\\\\\\operatorname{to\\_string}&: 'a \\rightarrow string\\\\\\operatorname{fst}&: ('a,'b) \\rightarrow 'a\\\\\\operatorname{snd}&: ('a,'b) \\rightarrow 'b\\end{aligned}",
                    caption: "Scalar conversion and string helpers are typed in the same table as collection helpers."
                },
                {
                    kind: "paragraph",
                    text: "The editor reuses the same signature table for completion details. That prevents the type checker, hover provider, and autocomplete provider from drifting into contradictory definitions of the standard library."
                },
                {
                    kind: "equation",
                    label: "Map API",
                    tex: "\\begin{aligned}\\operatorname{Map.empty}&: unit \\rightarrow ('k,\\;'v)\\;map\\\\\\operatorname{Map.set}&: ('k,\\;'v)\\;map \\rightarrow 'k \\rightarrow 'v \\rightarrow ('k,\\;'v)\\;map\\\\\\operatorname{Map.get}&: ('k,\\;'v)\\;map \\rightarrow 'k \\rightarrow 'v\\\\\\operatorname{Map.has}&: ('k,\\;'v)\\;map \\rightarrow 'k \\rightarrow bool\\end{aligned}",
                    caption: "Map key and value variables remain connected across empty, set, get, and has."
                },
                {
                    kind: "bullets",
                    items: [
                        "print and println are checked through custom call logic: they accept int, float, or string and return unit.",
                        "to_string accepts any value and formats primitives, tuples, arrays, lists, sets, maps, and functions for output.",
                        "fst and snd are pair-specific projections; they reject non-tuples and tuples whose arity is not exactly two.",
                        "Array.iter and List.iter require callbacks returning unit.",
                        "Array.fold_left and List.fold_left keep accumulator type independent from element type.",
                        "Polymorphic builtins compile to uniform i32 functions at runtime; the checker preserves their static element, key, value, and callback relationships."
                    ]
                }
            ],
        },
        {
            id: "inference-proof",
            eyebrow: "VI",
            title: "Inference Proof Sketch",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The checker is not a formal proof assistant, but its structure follows the standard progress path for a typed language: every accepted expression receives a type, and every emitted call has a statically established arity and value representation. The proof obligation is limited by OJaml's uniform WebAssembly ABI: values travel through i32 parameters and results, with compiler-side int/float specialization where polymorphic functions need different concrete representations at different call sites."
                },
                {
                    kind: "equation",
                    label: "Unification preservation",
                    tex: "\\operatorname{unify}(\\tau_1,\\tau_2) \\Rightarrow \\operatorname{prune}(\\tau_1)=\\operatorname{prune}(\\tau_2)",
                    caption: "After a successful unify, both sides resolve to a shared representative type."
                },
                {
                    kind: "paragraph",
                    text: "Soundness here means the compiler never emits direct WebAssembly for a program with unresolved names, inconsistent branches, impossible call arity, or collection access whose key/value relationship is statically contradictory. Runtime helpers also trap invalid collection access such as out-of-bounds array reads, empty-list head/tail, and missing map keys. This is still not a full safety proof for every pointer operation: garbage collection and recoverable language-level exceptions are outside the current core."
                },
                {
                    kind: "equation",
                    label: "Map key lemma",
                    tex: "\\Gamma \\vdash m : (K,V)\\;map \\land \\Gamma \\vdash k : K \\Rightarrow \\Gamma \\vdash \\operatorname{Map.get}\\;m\\;k : V",
                    caption: "Map reads are type-preserving because Map.get unifies its key parameter with the map key type."
                },
                {
                    kind: "equation",
                    label: "Set membership lemma",
                    tex: "\\Gamma \\vdash s : T\\;set \\land \\Gamma \\vdash v : T \\Rightarrow \\Gamma \\vdash \\operatorname{Set.has}\\;s\\;v : bool",
                    caption: "Set membership is type-preserving because Set.has unifies the queried value with the set element type."
                },
                {
                    kind: "paragraph",
                    text: "The reconstruction hinge is preservation under unification: once two types are unified, all later pruned references see the same representative. Local hover information stays accurate because a binding span and every later use point at type graph nodes that resolve through the same pruning path."
                },
                {
                    kind: "equation",
                    label: "No cross-call pollution",
                    tex: "\\operatorname{fresh}(\\forall \\alpha.\\tau) = \\tau[\\alpha \\mapsto \\beta_{new}]",
                    caption: "Fresh variables ensure one call to List.map, Set.add, or Map.set does not constrain another independent call."
                },
                {
                    kind: "bullets",
                    items: [
                        "Base cases assign primitive types to literals.",
                        "Inductive expression cases add local constraints and unify recursively checked subexpressions.",
                        "Function cases introduce fresh parameter variables and infer the body under the extended environment.",
                        "Match cases unify every pattern with the scrutinee and every arm body with a shared result."
                    ]
                }
            ],
        },
        {
            id: "closures",
            eyebrow: "VII",
            title: "First-Class Functions and Closures",
            blocks: [
                {
                    kind: "paragraph",
                    text: "OJaml supports first-class functions through heap-allocated closures and WebAssembly function tables. A top-level function can be called directly when statically known, or wrapped as a closure when passed as a value. Anonymous functions become pending lambdas with captured variables recorded from free-variable analysis."
                },
                {
                    kind: "diagram",
                    label: "Closure layout",
                    body: `closure pointer p

p + 0   table index
p + 4   captured value 0
p + 8   captured value 1
...

indirect call:
  call_indirect(type fn_n)
    env = p
    arg_1 ... arg_n
    table_index = load(p + 0)`,
                    caption: "Every closure is both an environment pointer and the source of its callable table entry."
                },
                {
                    kind: "example",
                    label: "Closure capture",
                    language: "ocaml",
                    code: `let make_adder x =
  fun y -> x + y

let main =
  let add10 = make_adder 10 in
  add10 32`,
                    caption: "The anonymous function captures x. At runtime add10 is a closure whose environment stores 10."
                },
                {
                    kind: "equation",
                    label: "Closure value",
                    tex: "c = (i_{table},\\;v_0,\\ldots,v_n)",
                    caption: "The heap object stores the target function table index and all captured runtime values."
                },
                {
                    kind: "paragraph",
                    text: "A closure stores a table index followed by captured values. Indirect calls load the function table index from the closure pointer and pass the closure pointer as an environment parameter. Lambda bodies recover captured values by loading from fixed offsets in that environment."
                },
                {
                    kind: "example",
                    label: "Higher-order collection call",
                    language: "ocaml",
                    code: `let main =
  let xs = List.cons 3 (List.cons 2 (List.cons 1 (List.empty ()))) in
  List.fold_left (fun acc x -> acc + x) 0 xs`,
                    caption: "The fold callback is compiled as a closure and called indirectly by the List.fold_left runtime helper."
                },
                {
                    kind: "equation",
                    label: "Free-variable capture",
                    tex: "\\operatorname{captures}(\\texttt{fun}\\;x\\rightarrow e)=FV(e)\\setminus\\{x\\}",
                    caption: "Anonymous functions capture exactly the free variables that are local or already captured in the surrounding context."
                },
                {
                    kind: "paragraph",
                    text: "This representation keeps direct calls efficient while supporting higher-order collection functions such as List.map, Array.iter, and fold_left. The standard library calls callbacks through call_indirect with the correct arity-specific WebAssembly function type."
                },
                {
                    kind: "bullets",
                    items: [
                        "Top-level functions receive closure wrappers when they are used as values.",
                        "Pending lambdas are emitted after top-level declarations, with stable function-table indices.",
                        "Indirect calls are currently implemented for arities one through three.",
                        "Captured locals and captured captures are both loaded into the new closure environment."
                    ]
                }
            ],
        },
        {
            id: "runtime-layout",
            eyebrow: "VIII",
            title: "Runtime Value Representation",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The WebAssembly backend uses i32 as the universal value slot: every OJaml value that crosses a generated WebAssembly function boundary is carried in an i32 parameter or result. That does not mean every source value is an immediate integer. Integers and booleans are immediate i32 values, unit is zero, and floats are boxed f64 heap objects addressed by i32 pointers. Strings, tuples, arrays, lists, sets, maps, and closures are also heap pointers. WebAssembly function signatures stay uniform, while runtime interpretation depends on the static type chosen before emission."
                },
                {
                    kind: "paragraph",
                    text: "The backend tradeoff is representation opacity. Uniform i32 values give direct calls, indirect calls, and polymorphic collection helpers the same WebAssembly signature shape. The cost is that WebAssembly itself no longer knows whether an i32 is an immediate integer, a boxed-float pointer, a string pointer, a tuple pointer, a list pointer, a set pointer, or a closure pointer. OJaml relies on the checker and specialization pass to preserve that meaning before emission."
                },
                {
                    kind: "diagram",
                    label: "Heap object layouts",
                    body: `float pointer f
  f + 0   f64 payload

array pointer a
  a + 0   length
  a + 4   element 0
  a + 8   element 1

tuple pointer t
  t + 0   arity
  t + 4   item 0
  t + 8   item 1

list pointer l
  l + 0   head
  l + 4   tail pointer (0 = empty)

set pointer s
  s + 0   value
  s + 4   next pointer (0 = empty)

map pointer m
  m + 0   key
  m + 4   value
  m + 8   next pointer (0 = empty)

closure pointer c
  c + 0   table index
  c + 4   captured value 0`,
                    caption: "The runtime heap uses fixed layouts and linked structures, all addressed through i32 pointers."
                },
                {
                    kind: "equation",
                    label: "Allocation",
                    tex: "\\operatorname{alloc}(b) = p\\quad\\land\\quad heap' = heap + b",
                    caption: "The allocator is a monotonic bump pointer."
                },
                {
                    kind: "paragraph",
                    text: "The heap begins after static string data. Allocation is bump-pointer allocation: alloc(bytes) returns the current heap pointer and advances it by the requested byte count. There is no garbage collector in the current implementation. Allocated tuples, arrays, cons cells, set entries, map entries, and closures live for the lifetime of the module instance."
                },
                {
                    kind: "equation",
                    label: "Uniform lowering",
                    tex: "\\tau \\in \\{int,float,bool,unit,string,tuple,array,list,set,map,fn\\}\\Rightarrow \\operatorname{wasm}(\\tau)=i32",
                    caption: "Static types differ in the checker, but emitted runtime values share the same WebAssembly value type."
                },
                {
                    kind: "paragraph",
                    text: "Strings are emitted as WebAssembly data segments and represented by their memory offset. Floats are boxed by allocating eight bytes, storing an f64 payload there, and passing the resulting pointer through the same i32 value slot used by every other OJaml value. Float arithmetic and power unbox those pointers to f64 operands, perform the f64 operation, and box float results again. The runtime imports print_i32, print_f64, print_string, string primitives, pow_f64, and to_string support from JavaScript. The compiler chooses which import to call by consulting expression shape metadata derived from checked code."
                },
                {
                    kind: "bullets",
                    items: [
                        "Array.make traps negative lengths, and Array.get/Array.set trap null arrays, negative indexes, and indexes greater than or equal to the stored length.",
                        "Tuple values allocate fixed-size blocks and rely on the checker for arity and element-position consistency; fst and snd lower to fixed slot loads from pair blocks.",
                        "List.empty, Set.empty, and Map.empty are represented by null pointer 0; List.head and List.tail trap on empty lists.",
                        "Set.add prepends a value only when Set.has cannot find an equal existing value; float sets compare unboxed f64 payloads.",
                        "Map.set prepends a key/value entry, making newer bindings shadow older equal keys.",
                        "Map.get traps if no matching key exists; Map.has remains the non-trapping presence check."
                    ]
                }
            ],
        },
        {
            id: "wasm-backend",
            eyebrow: "IX",
            title: "WebAssembly Backend",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The compiler emits a complete WebAssembly text module. The module declares arity-specific function types for indirect calls, imports print_i32, print_f64, print_string, string host helpers, pow_f64, and to_string support, exports memory and main, defines a function table, owns a mutable heap global, emits standard-library helpers, emits closure wrappers, emits top-level declarations and int/float specializations, emits pending lambdas, and appends string data segments."
                },
                {
                    kind: "diagram",
                    label: "Generated module skeleton",
                    body: `(module
  (type $fn_1 ...)
  (type $fn_2 ...)
  (import "env" "print_i32" ...)
  (import "env" "print_f64" ...)
  (import "env" "print_string" ...)
  (import "env" "string_concat" ...)
  (import "env" "pow_f64" ...)
  (import "env" "to_string" ...)
  (memory (export "memory") 1)
  (table N funcref)
  (global $heap (mut i32) ...)

  ;; allocator and collection helpers
  ;; top-level closure wrappers
  ;; user declarations and int/float specializations
  ;; pending lambdas
  ;; string data segments

  (export "main" (func $main)))`,
                    caption: "The backend emits a self-contained module with runtime helpers and the user's program."
                },
                {
                    kind: "example",
                    label: "Expression lowering sketch",
                    language: "wat",
                    code: `let main = 40 + 2

;; lowers approximately to:
(func $main (result i32)
  (i32.add (i32.const 40) (i32.const 2)))`,
                    caption: "Primitive scalar expressions lower directly to simple WebAssembly instructions."
                },
                {
                    kind: "equation",
                    label: "Direct call",
                    tex: "\\operatorname{emit}(f\\;a_1\\ldots a_n)=(call\\;\\$f\\;\\operatorname{emit}(a_1)\\ldots\\operatorname{emit}(a_n))",
                    caption: "Known global callees are emitted as direct WebAssembly calls."
                },
                {
                    kind: "paragraph",
                    text: "Direct calls are emitted when the callee is a known global function. Polymorphic top-level functions may emit concrete int and float variants so a function such as square can be used at both square 9 and square 2.5 without confusing immediate ints with boxed-float pointers. Local function values, captured function values, anonymous functions, and top-level functions used as values are emitted through closure allocation and call_indirect. This keeps a direct call path for known functions while still supporting higher-order values."
                },
                {
                    kind: "equation",
                    label: "Indirect call",
                    tex: "\\operatorname{emit}(g\\;a_1\\ldots a_n)=\\operatorname{call\\_indirect}(\\$fn_n,\\;env=g,\\;args,\\;table=load(g))",
                    caption: "Function values are closure pointers and call through the function table."
                },
                {
                    kind: "paragraph",
                    text: "Expression emission follows the AST. Literals become constants, boxed floats, or string offsets. Tuple expressions allocate a fixed-size block, store the arity, then store each element in order. Binary operators become i32 or f64 operations depending on checked expression shape. Power is right-associative; int ** int lowers through an integer result helper, while any float operand routes through pow_f64 and returns a boxed float. Local lets become blocks that set locals then evaluate the body. Conditionals and matches become structured WebAssembly if expressions. Function values become closure pointers."
                },
                {
                    kind: "bullets",
                    items: [
                        "safe(name) maps source names like Map.get to valid WebAssembly identifiers such as Map_get.",
                        "StringPool interns string literals and emits one null-terminated data segment per distinct value.",
                        "The table contains top-level closure wrappers followed by anonymous lambda functions.",
                        "The backend emits all user-level values as i32, relying on prior static checks and int/float specialization for meaning."
                    ]
                }
            ],
        },
        {
            id: "patterns",
            eyebrow: "X",
            title: "Pattern Matching",
            blocks: [
                {
                    kind: "paragraph",
                    text: "Pattern matching is implemented for primitive, tuple, list, and catch-all patterns. A match expression checks the scrutinee once, then checks every arm under an environment extended by variables bound by the pattern. Arm result types must unify, and the match must contain a wildcard, variable catch-all, a tuple pattern whose subpatterns are all exhaustive, or complete list coverage with both [] and a catch-all cons arm."
                },
                {
                    kind: "example",
                    label: "Primitive and variable patterns",
                    language: "ocaml",
                    code: `let classify n =
  match n with
  | 0 -> "zero"
  | 1 -> "one"
  | value -> "many"`,
                    caption: "The final variable pattern both binds value and satisfies the catch-all requirement."
                },
                {
                    kind: "example",
                    label: "Tuple destructuring",
                    language: "ocaml",
                    code: `let describe point =
  match point with
  | (0, 0) -> "origin"
  | (x, y) -> String.concat (to_string x) (String.concat "," (to_string y))`,
                    caption: "Tuple patterns match by arity and element type, then bind element values for the arm body."
                },
                {
                    kind: "example",
                    label: "List destructuring",
                    language: "ocaml",
                    code: `let rec sum xs =
  match xs with
  | [] -> 0
  | head :: tail -> head + sum tail`,
                    caption: "List patterns expose the runtime list shape directly: null for empty, or head/tail slots for cons cells."
                },
                {
                    kind: "equation",
                    label: "Pattern typing",
                    tex: "\\frac{\\Gamma \\vdash e_s:\\tau_s\\quad p_i \\sim \\tau_s\\Rightarrow\\Gamma_i\\quad \\Gamma_i\\vdash e_i:\\tau}{\\Gamma\\vdash\\texttt{match}\\;e_s\\;\\texttt{with}\\;p_i\\rightarrow e_i : \\tau}",
                    caption: "Each pattern must be compatible with the scrutinee, and each arm body must produce the same result type."
                },
                {
                    kind: "paragraph",
                    text: "The exhaustiveness rule is conservative. The checker does not attempt full finite-domain analysis for bool or literal patterns. Instead, it requires a catch-all pattern, a tuple pattern whose nested patterns are all catch-alls, or the standard list split of [] plus a catch-all cons arm. Diagnostics can point to one mechanical requirement instead of explaining partial coverage for every primitive domain."
                },
                {
                    kind: "paragraph",
                    text: "The backend stores the scrutinee in a scratch local, then emits a chain of WebAssembly conditionals. Wildcard, unit, and variable patterns can immediately produce their body. Literal patterns compare the scrutinee against the literal representation. Tuple patterns test the tuple arity, recursively test nested element patterns, and bind variables from fixed element offsets. List patterns test the pointer for null or non-null, then bind head and tail from the cons cell before evaluating the arm body."
                },
                {
                    kind: "bullets",
                    items: [
                        "PInt, PFloat, PString, PBool, and PUnit unify the scrutinee with the matching primitive type.",
                        "PTuple unifies the scrutinee with a tuple type of the same arity and checks each element pattern against the corresponding element type.",
                        "PListNil unifies the scrutinee with a list type and matches only the empty list; PListCons unifies the head with the element type and the tail with the same list type.",
                        "PWildcard accepts any scrutinee type and binds nothing.",
                        "PVar accepts any scrutinee type and binds the variable to that type in the arm body.",
                        "Missing catch-all arms are rejected before code generation."
                    ]
                }
            ],
        },
        {
            id: "tradeoffs",
            eyebrow: "XI",
            title: "Tradeoffs and Current Boundaries",
            blocks: [
                {
                    kind: "paragraph",
                    text: "OJaml chooses a compact compiler over a complete OCaml clone. The current surface demonstrates inference, recursion, closures, tuples, pair projection, tuple/list destructuring, collections, pattern matching, WebAssembly emission, and editor tooling, but it does not yet include modules, user-defined algebraic data types, records, general tuple projection beyond pairs, exceptions, a garbage collector, or structural array/set/map patterns."
                },
                {
                    kind: "paragraph",
                    text: "The runtime makes a similar bargain. Bump allocation and linked heap layouts keep allocation code short and predictable, but allocated data lives for the lifetime of the module instance. Collection helpers now trap common invalid accesses instead of reading arbitrary memory, but those traps are not recoverable OJaml exceptions. A production ML runtime would need garbage collection, richer failure values, and a way to recover from or report runtime faults inside the language."
                },
                {
                    kind: "bullets",
                    items: [
                        "Static typing protects source-level meaning, while the backend keeps a uniform i32 representation.",
                        "Direct calls stay simple, while closure values use function-table indirection only when needed.",
                        "Polymorphic builtins are typed precisely, but their runtime helpers operate on uniform pointers and integers.",
                        "The editor tooling benefits from source spans carried through the parser and checker."
                    ]
                }
            ],
        },
        {
            id: "tooling",
            eyebrow: "XII",
            title: "Monaco Tooling and Language Service",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The Monaco integration turns the compiler into an interactive language workbench. The editor registers an OJaml language ID, language configuration, Monarch tokenizer, dark and light themes, completion provider, hover provider, signature help provider, and diagnostic marker producer."
                },
                {
                    kind: "diagram",
                    label: "Hover decision tree",
                    body: `hover(offset)
  |
  +-- parse + check succeeds?
  |      |
  |      +-- checked token covers offset -> show inferred detail
  |      |
  |      +-- otherwise -> lexical fallback
  |
  +-- parse/check fails -> lexical fallback`,
                    caption: "Typed hover information is preferred, but every meaningful token can still explain itself."
                },
                {
                    kind: "example",
                    label: "Instantiated hover",
                    language: "ocaml",
                    code: `let main =
  let names = Map.set (Map.empty ()) "ada" 1815 in
  Map.get names "ada"

hover Map.get:
  Map.get : (string, int) map -> string -> int`,
                    caption: "The hover reports the concrete map type inferred at the call site, not just the generic builtin signature."
                },
                {
                    kind: "paragraph",
                    text: "Diagnostics call parse and check on the current source. On OJamlError, the provider translates byte offsets to Monaco line/column ranges. Completion items include keywords, snippets, top-level symbols, and standard-library functions. Module-qualified autocomplete is context-aware: after Array., List., Set., or Map. it offers only members from that family rather than inserting a second module prefix."
                },
                {
                    kind: "paragraph",
                    text: "Hover data is checker-first and lexical-second. If the program parses and type checks, the hover provider uses checked token metadata so identifiers and builtin calls show inferred or instantiated types. If no checked token applies, lexical fallback still describes keywords, literals, operators, delimiters, declaration separators, and unknown identifiers."
                },
                {
                    kind: "bullets",
                    items: [
                        "Completion details come from the same stdlib signature table used by the checker.",
                        "Signature help currently focuses on print and println because they accept int, float, or string.",
                        "Token-level checked hovers cover locals, params, top-level declarations, literals, and builtin calls.",
                        "Lexical hovers identify non-typed tokens as keyword, operator, delimiter, separator, literal, or identifier."
                    ]
                }
            ],
        },
        {
            id: "validation",
            eyebrow: "XIII",
            title: "Validation Strategy",
            blocks: [
                {
                    kind: "paragraph",
                    text: "OJaml is validated with a Node test suite that exercises parsing, emitted WebAssembly text, runtime execution, diagnostics, polymorphic functions with int/float specialization, exact editor-example output transcripts, power precedence and associativity, runtime access traps, tuple type checking, pair projection, tuple and list pattern matching, tuple formatting, polymorphic arrays, polymorphic lists, polymorphic sets, polymorphic maps, pattern matching, first-class functions, closures, higher-order standard-library functions, to_string formatting, print/println behavior, and editor hover metadata."
                },
                {
                    kind: "example",
                    label: "Map type regression test",
                    language: "ocaml",
                    code: `let main =
  let m = Map.set (Map.empty ()) "one" 1 in
  let m = Map.set m "two" "nope" in
  Map.get m "one"`,
                    caption: "This must fail because the second Map.set attempts to write a string value into a (string, int) map."
                },
                {
                    kind: "equation",
                    label: "Round-trip execution obligation",
                    tex: "\\operatorname{check}(P)=ok \\land \\operatorname{emit}(P)=W \\Rightarrow \\operatorname{instantiate}(W)\\;\\text{exports}\\;main",
                    caption: "For valid programs, emitted WebAssembly should produce an instantiable module with main."
                },
                {
                    kind: "paragraph",
                    text: "The strongest tests are negative tests for the checker and runtime integration tests for language features. Negative tests prove the checker rejects invalid programs before emission. Runtime tests prove accepted programs still execute correctly after lowering to WebAssembly."
                },
                {
                    kind: "equation",
                    label: "Negative diagnostic obligation",
                    tex: "\\operatorname{invalid}(P) \\Rightarrow \\operatorname{markers}(P) \\ne \\varnothing",
                    caption: "Programs with static errors should surface diagnostics in the editor."
                },
                {
                    kind: "paragraph",
                    text: "The site build is also part of validation because OJaml is consumed as a submodule-backed editor package. A successful frontend build confirms the paper content, route import, and package integration still compile together."
                },
                {
                    kind: "bullets",
                    items: [
                        "Feature tests cover each supported syntax and standard-library family.",
                        "Compiler tests inspect generated WAT for scalar programs.",
                        "Runtime tests execute WASM and compare main result plus captured output transcripts.",
                        "Runtime safety tests assert traps for negative array lengths, out-of-bounds array access, empty-list head/tail, and missing map keys.",
                        "Specialization tests cover direct and higher-order polymorphic function calls across int and float call sites, including power-based helpers.",
                        "Tuple tests cover parsing, fst/snd projection, nested formatting, tuple pattern destructuring, collection nesting, structural type mismatches, direct-main rejection, editor examples, and hover strings.",
                        "List pattern tests cover [], right-associative cons patterns, recursive destructuring, closure captures, conservative exhaustiveness, diagnostics, editor examples, and hover strings.",
                        "Set tests cover empty sets, persistence, duplicate suppression, float equality, nested formatting, membership diagnostics, and hover strings.",
                        "Editor tests assert diagnostics and hover strings for inferred local and stdlib types."
                    ]
                }
            ],
        },
        {
            id: "implementation-correspondence",
            eyebrow: "XIV",
            title: "Implementation Correspondence",
            blocks: [
                {
                    kind: "paragraph",
                    text: "The paper maps directly onto the repository. The language core is not distributed across hidden build steps: each stage has a focused TypeScript module, and the public editor route composes those modules rather than replacing them. A reconstruction should preserve this correspondence so paper claims can be checked against concrete files."
                },
                {
                    kind: "diagram",
                    label: "Source map",
                    body: `src/lexer.ts        tokens, nested comments, string escapes
src/parser.ts       recursive-descent parser and source spans
src/ast.ts          Program, Declaration, Expr, Pattern types
src/check.ts        type graph, unification, stdlib schemes, hover tokens
src/compiler.ts     WAT emission, heap layouts, closures, stdlib runtime
src/runtime.ts      WABT conversion, imports, execution result
src/monacoOJaml.ts  diagnostics, completions, hovers, signature help
tests/*.test.ts     positive runtime tests and negative checker tests`,
                    caption: "The implementation is stage-shaped, so every concept in the paper has a concrete module."
                },
                {
                    kind: "paragraph",
                    text: "The most important cross-file invariant is name agreement. Standard-library names are parsed as identifiers, typed by check.ts, assigned arities and return shapes by compiler.ts, emitted as WebAssembly-safe names by safe(name), and surfaced to Monaco through the shared signature list. If one stage adds a builtin without the others, the language becomes inconsistent."
                },
                {
                    kind: "equation",
                    label: "Builtin consistency",
                    tex: "name \\in \\operatorname{Stdlib}_{check} \\Rightarrow name \\in \\operatorname{Arities}_{emit} \\land safe(name) \\in \\operatorname{WAT}",
                    caption: "A builtin is complete only when the checker, emitter, and generated WebAssembly agree on its identity and arity."
                },
                {
                    kind: "paragraph",
                    text: "The second cross-file invariant is representation agreement. The checker distinguishes int, float, bool, string, unit, tuples, arrays, lists, sets, maps, and functions. The emitter erases those distinctions to i32 only after type checking. Runtime helpers then interpret the i32 according to the static type that selected the helper."
                },
                {
                    kind: "bullets",
                    items: [
                        "Adding general tuple projection requires indexed access syntax, element-offset lowering, hover metadata for projected values, examples, and tests.",
                        "Adding records requires labels in the type representation, deterministic field layout, pattern or access syntax, and hover metadata for fields.",
                        "Adding modules requires real namespace syntax instead of treating dotted builtin names as plain identifiers.",
                        "Adding array, set, or map patterns requires syntax and exhaustiveness rules that fit their runtime shapes.",
                        "Adding garbage collection requires replacing the monotonic allocator without changing the checker-facing value model."
                    ]
                }
            ]
        }
    ],
    audioSamples: []
};
