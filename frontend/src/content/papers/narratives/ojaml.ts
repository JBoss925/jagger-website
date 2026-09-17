import { chapter, type NarrativePlan } from "./types";
export const ojamlNarrative: NarrativePlan = {
  name: "OJaml",
  subtitle:
    "An OCaml-inspired language with type inference, closures, and WebAssembly execution in the browser.",
  abstract:
    "OJaml is an OCaml-inspired language and browser playground that combines local WebAssembly execution with compiler-backed editor feedback. A TypeScript compiler performs inference and static checking before lowering programs through a uniform i32 ABI. Heap closures and program-specific indirect-call types support first-class functions, while specialization preserves integer and floating-point behavior across the shared representation. Source spans and checked metadata supply diagnostics, completions, and hovers from the same implementation used for execution. The result is a browser-hosted language with a compact runtime; garbage collection, recoverable exceptions, file imports, and functors remain outside its scope.",
  sections: [
    chapter(
      "thesis",
      "A Language in the Browser",
      `
OJaml is an OCaml-inspired language with a TypeScript compiler and browser playground. It compiles directly to WebAssembly and executes locally. The browser editor, CLI, and tests all use the same implementation, including type inference, pattern matching, and first-class functions.

The backend uses a uniform i32 ABI for both immediate values and heap pointers. That keeps generated signatures consistent across direct calls, closures, and collection helpers, but makes the checker responsible for distinctions that WebAssembly no longer sees. Integer and floating-point specializations preserve those distinctions where polymorphic code needs different operations.

The editor depends on the compiler too. Binding spans, inferred types, and library signatures survive checking so diagnostics and hovers can describe the same program that will execute. Keeping that information in the language implementation avoids maintaining a second, approximate model just for the playground.
`,
    ),
    chapter(
      "surface-language",
      "The Surface Language",
      `
OJaml keeps OCaml-style application, let bindings, recursion, and matching. The example below gives a compact view of the syntax; main supplies the result exported by the generated module.

The supported module system goes beyond qualified names. Nested modules and opens organize namespaces, while module signatures can contain abstract types, concrete record or variant manifests, and value declarations. Ascription checks both the promised value types and the structure of concrete type declarations. File imports and functors remain outside that scope.

These choices keep namespaces primarily in the compiler. Opened names resolve before emission, module-local constructors receive qualified tags, and module values become qualified globals. The backend does not need runtime module objects. The syntax remains useful for organizing programs without expanding the runtime representation around every namespace.
`,
    ),
    chapter(
      "ast",
      "The Syntax Tree and Source Spans",
      `
The AST retains expression spans and separate binder spans. That distinction matters to the editor: a function expression’s range is too broad for a diagnostic or hover aimed at one parameter. Later passes attach their results to the original binding and use sites rather than reconstructing locations after checking.

Checked token metadata can then associate a declaration and its references with resolved types. A mismatch retains the offending expression’s range, while a parameter hover retains the parameter’s own range. The AST is therefore also the basis for the compiler’s editor-facing output, not just an input to code generation.
`,
    ),
    chapter(
      "static-semantics",
      "Type Inference",
      `
OJaml’s inference uses fresh type variables and unification, with later references following the pruned representative. The editor relies on that behavior: a type refined elsewhere in a function must also appear refined at the declaration’s hover site. Copying a partial type too early would leave correct checking paired with stale feedback.

Recursive bindings enter the environment provisionally before their bodies are checked. Constraints from parameters, calls, and results refine that entry, and annotations feed the same process. Match arms are checked in environments extended by their pattern bindings, with their result types required to unify.

Emission starts only after names, call arities, branch types, and collection relationships have been checked. That establishes the types the backend uses to choose representations and helpers. It is a limited static contract: runtime bounds checks and missing-key traps remain necessary, and the implementation does not claim a complete safety proof for heap operations.
`,
      ["inference-proof"],
    ),
    chapter(
      "stdlib",
      "The Standard Library",
      `
Standard-library schemes instantiate fresh variables at each use while preserving repeated variables within that use. Map.set, for example, connects the map’s key and value types to the inserted pair and the returned map. Map.get uses those same relationships for its key argument and result. Fresh instantiation keeps separate maps independent without letting one map change its value type across calls.

Higher-order collection schemes also constrain callbacks to the collection’s element and result types. The compiler must carry that information through callback emission, where the source-level scheme ultimately meets an arity-specific indirect call.

Completions and hover details reuse the signature table. A library addition therefore has to agree with checking and emitted helpers as well as editor presentation. The full signatures belong in reference documentation; the design concern here is keeping those consumers consistent.
`,
    ),
    chapter(
      "runtime-layout",
      "Runtime Values and Memory",
      `
Every generated function boundary carries values in i32 slots. Integers and booleans are immediate; floats are boxed f64 values addressed by pointers. Strings, collections, records, variants, and closures are pointers too. WebAssembly signatures consequently cannot distinguish a list pointer from an integer: checked source types select the loads and helpers before those distinctions are erased.

Records use fields sorted by label so construction, access, and matching agree on offsets even when source order differs. Lists and collection entries use linked heap layouts. These representations keep helpers compact, with layout details shared by allocation and the operations that inspect them.

The heap begins after static string data and uses bump allocation. There is no garbage collector, so allocated objects live for the module instance’s lifetime. That is manageable for short playground runs, but accumulated allocation limits longer-lived programs. The uniform ABI simplifies calls without solving memory reclamation.
`,
    ),
    chapter(
      "patterns",
      "Pattern Matching",
      `
Matching lowers against those same heap layouts. The emitter stores the scrutinee once in a scratch local and generates structured conditionals. Tuple patterns check arity and element offsets; record patterns use sorted field offsets; constructors check tags before loading payloads. Allocation and matching must agree on those representations.

Exhaustiveness checking is deliberately conservative. A catch-all is sufficient; complete constructor coverage and the empty-list/cons split are supported too. Fixed-length array, set, and map patterns do not establish coverage on their own. The checker rejects coverage it cannot establish rather than implementing a general finite-domain analysis.

Set and map patterns also follow stored entry order and consume an exact length. Their matching behavior reflects the linked runtime layout, an important distinction from treating a map pattern as an unordered membership test. The documentation contains the complete pattern rules.
`,
    ),
    chapter(
      "closures",
      "Closures",
      `
Known functions retain a direct-call path. When passed as values, top-level functions can be wrapped as closures, while anonymous and local functions capture the variables identified by free-variable analysis. The returned adder below exercises that environment path with one captured offset.

A heap closure stores a function-table index followed by captures. Indirect calls load the index and pass the closure pointer as an environment argument; the body retrieves captures at fixed offsets. A locally recursive function can include its own closure pointer in that environment.

Indirect-call types are generated for the arities actually present in the program. Higher-order collection helpers use the matching call_indirect type, and returned or staged closures use the same convention. This avoids a small fixed-arity ceiling without forcing statically known calls through the closure path.
`,
    ),
    chapter(
      "wasm-backend",
      "The WebAssembly Backend",
      `
Emission combines those decisions into a WAT module: direct definitions, closure wrappers, program-specific indirect-call types, runtime helpers, and static data. Qualified module names have already been resolved, and checked expression shapes select integer operations, float operations, or host calls.

Polymorphic top-level functions can receive integer and floating-point specializations. A function used at both an integer and a float call site cannot blindly reuse operations over the uniform i32 slot: one operand is immediate and the other addresses boxed data. Specialization preserves that distinction after checking.

WABT converts the emitted text to a binary module. Instantiation provides output and supporting host functions, and the runtime reads main’s result. The editor’s execution route therefore uses the generated module, with the same lowering exercised by CLI and runtime tests.
`,
    ),
    chapter(
      "tooling",
      "Compiler Feedback in the Editor",
      `
Monaco consumes checked token metadata for inferred and instantiated types. A Map.get hover can show the types of the particular call rather than only the library’s generic scheme. Diagnostics translate compiler offsets to editor ranges, retaining the binder precision established in the AST.

Incomplete or rejected programs cannot always supply checked metadata. Lexical fallback still describes recognizable tokens, while completion uses shared signatures and namespace context. After a module prefix, the provider offers that module’s members without inserting the prefix again.

The fallback is narrower than successful checking, but keeps feedback available during editing. Shared compiler metadata and signature tables reduce drift between what the editor suggests and what the language accepts; they do not turn a failed check into a reliable inferred type for every expression.
`,
    ),
    chapter(
      "validation",
      "Validation and Limits",
      `
Validation crosses both sides of the checker/backend boundary. Negative cases exercise contradictory collection types, unresolved names, and invalid calls; execution cases exercise specialization, recursive and high-arity closures, patterns, and module resolution. Editor checks additionally compare inferred metadata and diagnostic ranges with source locations.

Checked programs can still trap on out-of-bounds reads, empty-list access, or absent map keys. Those failures are runtime traps rather than recoverable OJaml exceptions. File imports, functors, exceptions, and garbage collection remain outside the current implementation.

OJaml’s scope is a browser-hosted language whose compiler also supplies its editor feedback. The uniform ABI makes that runtime small, while checking and specialization preserve the distinctions it erases. Extending the language means preserving that agreement across types, layouts, calls, and source metadata.
`,
      ["tradeoffs", "implementation-correspondence"],
    ),
  ],
};
