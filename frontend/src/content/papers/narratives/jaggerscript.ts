import { chapter, type NarrativePlan } from "./types";
export const jaggerscriptNarrative: NarrativePlan = {
  name: "JaggerScript",
  subtitle:
    "A small object-oriented language with a PEG parser, an explicit runtime, and a browser playground.",
  abstract:
    "JaggerScript is a TypeScript implementation of a small object-oriented language with an explicit interpreter runtime and browser playground. PEG parsing is normalized into executable node structures, which operate on invocation frames, heap-backed instance scopes, and tracked receiver state. Construction, reference access, and mutation preserve those storage boundaries, while return and break propagate through distinct control signals. The playground combines parser diagnostics and lightweight declaration checks with runtime error reporting. The implementation exposes how class-based programs execute without delegating their semantics to JavaScript objects, but leaves complete static expression typing and features such as inheritance, closures, and asynchronous execution outside its scope.",
  sections: [
    chapter(
      "motivation",
      "An Explicit Object Runtime",
      `
JaggerScript is a small object-oriented language implemented in TypeScript, with a PEG parser, interpreter, and browser playground. Its runtime makes allocation, invocation frames, and receiver state explicit rather than delegating execution to JavaScript objects.

The Counter example provides a short trace through that runtime. The more consequential cases involve nested construction, reference walks, and mutation: each must preserve the current receiver and distinguish frame-local storage from instance fields.
`,
    ),
    chapter(
      "language-model",
      "The Class Model",
      `
Programs consist of classes with fields, functions, and constructors, using primitive values and object references. The example’s CounterDemo class supplies main; Counter supplies the stateful instance. This class-based entry convention is part of the execution model rather than a standalone top-level function.

The implemented subset excludes inheritance, modules, generics, arrays, closures, and asynchronous execution. That scope leaves the runtime focused on references, mutation, and explicit call frames; declared types supply some runtime checks without providing complete static expression typing.
`,
    ),
    chapter(
      "compiler",
      "Parsing and Normalization",
      `
PEG output includes both language constructs and grammar helper nodes. Normalization removes that parser scaffolding before interpretation: calls receive argument arrays, literals receive value kinds, and statements receive runtime token kinds.

The resulting TypeScript structures classify the interpreter’s nodes. They do not certify that the source program has passed static type checking. This boundary allows grammar helpers to change without forcing evaluation to follow the parser’s incidental tree shape.
`,
      ["grammar", "program-representation"],
    ),
    chapter(
      "runtime",
      "Frames, Heap, and Receiver State",
      `
Function frames hold parameters and local bindings; heap-backed instance scopes hold fields. The running instance selects the receiver for field and method access. Those are distinct runtime structures, not interchangeable name maps.

Nested member access follows instance references one at a time. Lookup must distinguish frame names, instance fields, and primitive values encountered along the path. The Counter constructor’s start parameter is frame-local, while its value field is reached through the allocated instance; later calls resolve that same field through fresh invocation frames.
`,
    ),
    chapter(
      "allocation",
      "Object Construction",
      `
Construction allocates an instance, temporarily selects it for field initialization, restores the prior running instance, then invokes the constructor against the new object. That restoration is especially important when field initialization constructs another object: later work must resume with the surrounding receiver.

An instance’s field scope maps names to heap pointers. Primitive locals can live directly in frames, but a field write follows the owning instance’s mapping and either updates existing heap-backed storage or allocates a replacement slot. Updating the field mapping is part of reassignment, not a separate change to the local reference used to reach the object.

Local reassignment writes into the frame; field reassignment updates or replaces heap-backed storage through the owning scope. Field writes reject values incompatible with the stored type. Allocation, reference lookup, and mutation must preserve that distinction through nested object paths.
`,
    ),
    chapter(
      "evaluation",
      "Calls and Control Flow",
      `
Invocation evaluates arguments before binding them into a new frame, then executes normalized runtime nodes with the selected receiver. Constructors follow that mechanism with a newly allocated instance. Strict evaluation order makes nested argument effects occur before the body begins.

Return and break propagate distinct control signals. Function evaluation handles return at the call boundary; loop evaluation handles break at the loop boundary. A nested statement therefore propagates its result until the matching evaluator consumes it, instead of terminating whichever evaluator happens to see it first.
`,
      ["expression-semantics"],
    ),
    chapter(
      "runtime-errors",
      "Runtime Errors",
      `
Member lookup rejects a primitive where an instance is required, and field assignment rejects incompatible values. Failures occur at the scope walk or write that violates the rule, rather than allowing an undefined result to become a less informative error later.

These checks remain runtime obligations. The editor can reject unknown declared type names, but does not fully check expression types or reference paths. Distinguishing those guarantees matters more than the presence of annotations in otherwise accepted source.
`,
    ),
    chapter(
      "playground",
      "The Playground",
      `
Monaco displays parser failures as diagnostic ranges. A lightweight semantic pass compares declared types with primitives and classes in the source; the interpreter reports failures that need execution state.

Execution finds a class containing main, allocates its entry instance, and invokes main without arguments. The examples use that convention, including loops and nested references. Parser, normalization, highlighting, and runtime nodes have to stay aligned when syntax changes.
`,
      ["diagnostics"],
    ),
    chapter(
      "tradeoffs",
      "Validation and Scope",
      `
The Counter trace checks persistent field mutation, but nested references and construction are stronger tests of receiver handling. Restored receivers, invalid member access, and frame-versus-field reassignment exercise the boundaries that a single successful counter can miss.

Static analysis remains lightweight. Full expression typing would need rules for calls, assignments, and control flow, with source-aware diagnostics. The current runtime keeps those checks inspectable, at the cost of leaving many invalid programs detectable only during execution. The docs retain its grammar and complete runtime node shapes.
`,
      ["results"],
    ),
  ],
};
