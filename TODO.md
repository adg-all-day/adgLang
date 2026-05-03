# What's done, what's next

`[N]` = priority (lower = sooner). `[x]` = shipped.

## Shipped

### Compiler core
- [x] Parser error recovery — continues past the first syntax error
- [x] Formatter robustness — throws on syntax errors instead of acting like everything is fine
- [x] Peggy location handling (parser perf)
- [x] Generics: constraints + inference, parsing of `>>`, nested generics, static methods, monomorphization, instantiation in expressions
- [x] Strict type compatibility checking
- [x] Struct inheritance
- [x] Control flow analysis (catches missing returns)
- [x] Two-pass compilation for declaration hoisting
- [x] Array indexing type resolution
- [x] Method `this` (and it is now explicit in struct methods)
- [x] Module system + full import resolution before compile
- [x] Per-module compilation + linking with cache
- [x] LLVM IR codegen
- [x] Implicit constructor calls when you declare `local x: X;` and `X` has `frame new(this: *X)`
- [x] Canonical primitive int types
- [x] Implicit + explicit type casts
- [x] CLI compiler tool
- [x] try/catch
- [x] Type aliases
- [x] LLVM upgrade
- [x] `clang` instead of `lli` to run IR
- [x] Default exit code for `void main`
- [x] Package system (init, pack, install, list)
- [x] Constructors / destructors
- [x] Code formatter
- [x] Error messages with locations
- [x] `--emit` flag (AST/IR dump)
- [x] Updated language spec
- [x] VS Code extension + LSP
- [x] Function overloading by parameter types
- [x] Standard library
- [x] Interfaces / traits
- [x] Shell completions for the CLI
- [x] Operator overloading (24 operators — arithmetic, bitwise, comparison, unary, indexing, callable)
- [x] Generic-aware operator resolution (works on `Array<T>`, `Stack<T>`, etc.)

### Variadics
- [x] Homogeneous variadics (`...int`) on top of `...Any`. The type checker enforces that every arg matches `T`; the backend passes `T*` plus a count.

### Enums (full)
- [x] Declaration parsing — unit / tuple / struct variants
- [x] Generics with explicit type params
- [x] Type checking + exhaustiveness
- [x] All three construction syntaxes (`Color.Red`, `Message.Move(10, 20)`, `Shape.Circle { radius: 5.0 }`)
- [x] Pattern destructuring in match arms
- [x] Outer-scope variables visible inside arms
- [x] As function params + return types
- [x] LLVM IR with full payload storage and proper alignment
- [x] Methods on enums (`this` + generic context inheritance)
- [x] `==` / `!=` (tag + payload)
- [x] Recursive enums (pointer types, correct memory layout)
- [x] Type mangling with normalized primitives (`int`→`i32`)
- [x] Pattern guards: `Option.Some(x) if x > 0 => ...`
- [x] Runtime variant checks: `if (match<Option.Some>(opt)) { ... }`
- [x] Formatter support
- [x] 93 enum tests + 756 integration tests, all green
- [x] Examples + user/implementation docs
- [x] Root global `Type` struct — every struct inherits it implicitly

Future (not blocking, workarounds exist):
- Nested patterns like `Outer.Wrapped(Inner.Value(v))` — for now, nest match expressions
- Direct field access on struct variants (`msg.x`) — use pattern matching instead
- Namespace-qualified patterns (`Enums.Color.Red`) — import the enum directly
- Generic enum inference (`Option.Some(42)` → `Option<int>`) — needs bidirectional checking

### Type system & runtime
- [x] Cross-compilation via LLVM target triples
- [x] Primitives as structs inheriting `Primitive` (wrappers for int/float/bool/char)
- [x] `defer` — LIFO, scope-bound, void-only, recursion-safe, IDE-aware
- [x] Closures + lambdas: `|args| body`, capture by value, `Func<Ret>(Args...)`, IDE highlight + hover, integrates with enum patterns
- [x] `const` — locals + parameters, enforced in the type checker, recursive checks for member access and indexing, `this` is a const pointer in methods
- [x] C-style `for` (desugars to `while` in codegen, block-scoped)
- [x] Scope verification (block scope, no hoisting — documented)

### Diagnostics & tooling
- [x] Doc generator — multiline comments are now `/# ... #/` (Markdown-safe), generates Markdown, covers stdlib, `adgLang docs` command
- [x] Type narrowing / pattern matching: `is`, `as`, struct upcasting, chained casts, formatter parens, `match` integration, full test coverage
- [x] Unused variable detection (`_` prefix to suppress)
- [x] Stdlib internal error structs replacing integer codes: `ResultUnwrapError`, `OptionUnwrapError`, `IndexOutOfBoundsError`, `NullPointerError`, `DivisionByZeroError`, `IOError`, `CastError`
- [x] LSP: rename, find references, go-to-implementation, code actions (auto-import), more snippets
- [x] `Result<T, E>` in stdlib + `isOk`, `isErr`, `unwrap`, `unwrapOr`, `map`, `mapErr`, generic enum operator backend, `==`/`!=` for `Result` and `Option`, integration tests
- [x] `--eval` snippets show correct error context (`SourceManager` for virtual files)
- [x] Fuzzing: `fuzz/fuzz_target.ts` runs lex/parse/typecheck, `fuzz/run_fuzz.ts` mutates inputs, crashes saved to `fuzz/crash_*.adg`
- [x] Compiler perf benchmarks: `benchmark/measure_compilation.ts`, synthetic 1k–5k-function files, ms-precision
- [x] String interpolation: `$"..."` with `${expr}`, lex/parse/typecheck/codegen, docs at `docs/54-string-interpolation.md`
- [x] Structs can inherit primitives: `struct A : int`, with `__base__` field and wrap/unwrap casts

### Inline assembly (mostly there)
- [x] `asm("flavor") { ... }` with `intel`, `att`, `llvm`, `raw` flavors
- [x] Interpolation `(var)`, `(=var)`, `(&var)`
- [x] Explicit constraints `(var: "r")`
- [x] Clobbers `[ "eax", "memory" ]`
- [x] Codegen: `call asm` for x86/att, raw injection for llvm/raw
- [x] Tests in `examples/asm_test`, `examples/asm_flavors_test`
- Still missing: flavor-based wrapping for some cases, finer constraint validation, content validation

### Debugging (DWARF) — done
- [x] `--dwarf` flag, `DebugInfoGenerator`, `!llvm.dbg.cu` / `!DICompileUnit`, `!DISubprogram` per function, `!dbg` on instructions, full type descriptors (struct/enum/array/slice), variable tracking via `llvm.dbg.declare`

### Runtime library — done (Jan 2026)
- [x] `lib/runtime_support.c` replaces the stub
- [x] Signal handlers for SIGSEGV / SIGFPE / SIGILL / SIGABRT / SIGBUS
- [x] Colored ASCII error boxes
- [x] Native stack traces via `backtrace()` + `dladdr()`
- [x] adgLang-level call stack tracking
- [x] Specific messages for null-deref, OOB, div-by-zero, stack overflow — all with expression / function / line / column
- [x] `lib/build_runtime.sh`
- [x] `cli/BinaryRunner.ts` and `cli/CompilationRunner.ts` link the runtime
- [x] `docs/66-runtime-library.md`

### Watch mode — done (Jan 2026)
- [x] `--watch` flag → `cli/Watcher.ts`
- [x] 100ms debounce, error-recovery, recursive across all `.adg`, ignores `node_modules`, `.git`, `adgLang_modules`
- [x] Docs in `docs/39-compiler-options.md`, `docs/03-quick-start.md`

## Open

### High priority
- [ ] **User-defined type guards** (`is` functions)
- [5] **Parallel compilation** — dep-graph analysis, worker threads, careful with shared state

### Medium priority
- [4] **RAII / automatic resource management** — `Destructible` interface in stdlib, compiler pass to inject `x.destroy()` at scope end, move semantics (null out the source on transfer) to avoid double-free, `Unique<T>` and `Shared<T>` smart pointers
- [6] **Default + named arguments** — declaration / call syntax, defaults resolved at call site
- [6] **Better parser error recovery** — sync points, skip tokens, error nodes
- [6] **Nested pattern matching** — recursive patterns like `Option.Some(Result.Ok(x))`
- [ ] **Visibility modifiers** — `pub` / `private`, enforced semantically, module-level exports
- [3] ✅ **Basic package management** — done (`adgLang pack` / `install` / module resolution)
- [7] **Package registry + versioning** — metadata format, semver, registry API, publish/install
- [7] **WASM target** — wasm32 triple, ABI handling, primitive mapping, `.wasm` via LLVM
- [7] **bindgen** — libclang parses C headers, emit `extern` declarations
- [7] **Stdlib expansions:**
 - Structured logging (levels, formatters, sinks)
 - CLI argument parser (flags, options, subcommands, help)
 - Networking + HTTP (TCP/UDP, HTTP client)
 - Syscalls / OS (signals, env, process control)
 - Date / time / duration / formatting
 - JSON parse + stringify
 - Crypto + hashing (SHA-256, RNG)
 - Regex (match, replace, split)
 - More collections (Set, LinkedList, Queue, Stack, PriorityQueue)
 - BigInt (GMP wrapper or native)
 - Compression (zlib / gzip)
 - Encoding (Base64, Hex, CSV)

### Semantic analysis (partial)
- ✅ Unreachable code, redeclaration in same scope, unused variables
- ❌ Outer-scope shadowing warning

### Low priority / long term
- [8] **Null-safe ops** — `?.`, `??`, desugar to conditionals
- [8] **AST/IR-level optimizations** — DCE, constant folding, inlining before LLVM
- [8] **Compile-time function execution** — interpreter over the IR, runs during semantic analysis
- [8] **Coverage** — instrument LLVM IR for `llvm-cov`
- [8] **Arena allocators** — `Arena` struct, bulk alloc/free
- [8] **async / await** — state machines vs coroutines, event loop story
- [8] **Threads** — primitives, sync, memory model
- [9] **REPL** — input loop reusing parser/compiler, JIT or interpreter
- [9] **Eval/stdin error snippets** — pass source lines directly into `CompilerError`
- [9] **Reflection** — type metadata at compile time, runtime API
- [9] **Macros** — procedural, with their own expansion phase
- [9] **Extension methods** — symbol table looks them up, transpile to static calls
- [9] **Generators / `yield`** — transform to state-machine struct implementing `Iterator`
- [9] **Pipeline operator** `|>` — `x |> f` → `f(x)`
