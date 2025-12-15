# Changelog

Built in the spirit of [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added

**Real runtime library.** The old stub is out. You now have:
- Signal handlers for SIGSEGV / SIGFPE / SIGILL / SIGABRT / SIGBUS
- Colored ASCII error boxes when things blow up
- Native + adgLang stack traces (via `backtrace()` / `dladdr()`)
- Targeted messages for null deref (with the expression), index OOB (with index + size), divide-by-zero (with function context), stack overflow
- New: `lib/runtime_support.c`, `lib/build_runtime.sh`
- Docs: `docs/66-runtime-library.md`

**Strict switch.** Silent fallthrough is gone.
- Every `case` / `default` must end with `break`, `return`, `throw`, `continue`, or the new `fallthrough` keyword
- `break` now works inside `switch` (it used to be loop-only)
- Fixed several older tests that depended on the previous loose behavior
- Formatter, VS Code extension, and `docs/07-control-flow.md` updated

**`std/process.adg`.** Run processes from your code:
- `exec(args...)`, `execStatus(args...)`, `execOutput(args...) -> ProcessResult`
- `execShell(cmd)` for pipes / redirects, `execSilent(args...)` to suppress output, `sleep(ms)`
- Variadic args auto-join with spaces and auto-escape, so shell injection is not the default

**Pattern matching, properly.**
- All primitive types: int / i8–i64 / u8–u64 / float / f32 / f64 / bool / string / char
- Tuples of any arity
- Patterns: literals, identifiers (binding), tuples, `_`, guard clauses (`pattern if cond`)
- Formatter handles every pattern type
- Backend: fixed float→double and bool→i1 normalization
- 49 new tests; examples in `examples/primitive_patterns/` and `examples/tuple_patterns/`

**CLI rewrite.** It is subcommand-first now:
- `adgLang run <file> [args...]` — compile + execute
- `adgLang dev <file> [args...]` — watch + auto-run
- `adgLang build <file>` — just compile
- `adgLang check <files...>` — type check, no codegen
- `adgLang new <name>` — scaffold a project
- `adgLang clean` — remove build artefacts and caches

**New global flags:** `-q/--quiet`, `-O 0..3`, `--debug` (alias of `--dwarf`), `--time`, `--json`, `--color`/`--no-color`.

**Dev-only flags:** `--clear` (clear screen on rebuild), `--no-run` (compile only).

**Logger.** Every `console.*` call is now replaced by a structured logger: `LogLevel` (DEBUG / INFO / WARN / ERROR / SILENT), colored + tagged output, `time()` profiling.

### Changed

- `lib/process.adg` now uses variadic args everywhere, which is nicer to use and safer.
- `std` re-exports now include `std/process.adg`.
- **Breaking:** `--run` removed from main; use `adgLang run` instead.
- **Breaking:** `--watch` removed from main; use `adgLang dev`.
- **Breaking:** `-g` is now `-d` for DWARF.
- The main command does one job now: file → LLVM IR.
- All 16 test files moved over to `adgLang run`.
- `processCode` now accepts a `sourceLabel` param.
- `JsonParser.parseString` was flattened from deep nesting into `else if` chains, which is much easier to scan.

### Documentation

- `README.md` — full CLI reference.
- `docs/39-compiler-options.md` — rewritten around the command-first CLI.
- `docs/03-quick-start.md` — now uses `adgLang run`.
- Pattern matching: new section in `docs/07-control-flow.md`, plus `LANGUAGE_SPEC.md` and `AGENTS.MD`.
- `is` / `as` operators: new content in `docs/06-operators.md` and `docs/56-type-matching.md`, with safe-downcast examples.

### Fixed

- **BUG-118 — Unicode strings in LLVM IR.** `escapeString()` now uses `TextEncoder` for UTF-8 byte counts, so the length mismatches are gone.
- **BUG-119 — `is` was lying.** It used to be a compile-time check that always returned `true` for derived types. It now does a real vtable comparison.
- **BUG-120 — `as` was unsafe.** It used to cast anything without checking. It now validates through the vtable and returns `nullptr` on mismatch, so `local dog = animal as *Dog; if (dog != nullptr) { ... }` actually behaves correctly.
- Vtables are now generated for inherited structs even when they add no methods. That is required for runtime type identification.
- Struct + lambda equality: `icmp` on aggregates produced invalid LLVM IR. It now does field-wise comparison with a `memcmp` fallback.
- Pattern matching codegen:
 - Float literals get `.0` appended for float types
 - Type-name normalization (float→double, bool→i1)
 - Tuple pattern string comparison: `strcmpResult` ordering vs. `cmpReg`
 - Exit codes (return 0 from main in examples)
- Subcommand flag conflicts resolved.
- Commander.js parent-option inheritance fixed.
- `--eval` and `--stdin` restored.
- Type defs for all new flags in `cli/types.ts`.
- **Reflection:** `double` was being identified as `void` in `ReflectionGenerator`. Fixed `TypeInfo` and `Any` construction.
- Example projects fixed:
 - `json_io_demo` — missing test config, broken imports
 - `jsonable_test` — rewritten to use `std/json`
 - `method_reflection_test` — stdlib imports
 - `reflection_basic` — `TypeInfo` import from `std/reflection.adg`
 - `type_match` — test expectation for double/float

### Known Limitations

- **BUG-104:** Nested tuple patterns (`((a, b), c) => ...`) are still unsupported. Workaround: nest match expressions, or destructure first. Details in BUGS.md.

## [Previous Release]

### Added

**Watch mode** — `-w` / `--watch`:
- Watches every `.adg` file in the tree
- 100ms debounce
- Keeps watching after a failed compile
- Ignores `node_modules`, `.git`, `adgLang_modules`, hidden dirs
- Colored timestamps and status
- Works with `--run` for compile-and-execute on save
- Guide in `docs/39-compiler-options.md`

Plus: test config for `bug_086_test_simple` covering `sizeof` on type aliases (`int`, `int[10]`, pointers).

### Fixed

- **BUG-102 — Qualified names in nested generic enums.** `std.Option<std.Option<int>>` now resolves. `TypeGenerator.resolveType()` strips namespace prefixes when direct lookup fails. Fixes `enum_chaining_test`.
- **BUG-103 — Enum-to-enum casting dropped payloads.** `UnaryExpressionGenerator.emitCast()` now copies both the discriminant and the data: `extractvalue`/`insertvalue` for same-size, `memcpy` otherwise. Nested enum values now survive assignment and pattern matching.

### Changed

- Tests: 1,342 passing (up from 1,323), 100% on integration.
- Watch mode is now wired into the CLI.
- Docs touched: `docs/39-compiler-options.md`, `docs/03-quick-start.md`, README.

## [2026-01-02]

### Fixed

A large batch of compiler bugs in enum handling, type resolution, and codegen. Full list in BUGS.md (BUG-001 through BUG-103).

### Documentation

- BUGS.md — every issue tracked with status + repro steps
- README.md — current test counts
- 56-file `docs/` tree covering the whole language
- AGENTS.MD — contributor and AI-assistant instructions

### Testing

- 1,342 tests, 89 test files
- Integration suite covers every language feature
- Unit tests for lexer, parser, type checker, codegen
- Fuzz harness for stability

## About this project

**adgLang** is a statically-typed compiled language that emits LLVM IR. It aims for systems-language performance and control, with modern language features on top.

### Highlights

- LLVM backend
- Static types with generics + inference
- Structs, methods, inheritance
- Module system + package manager
- Exceptions (try/catch)
- Pattern matching + enums
- Inline assembly
- Cross-compilation
- Code formatter
- VS Code extension with LSP

### Status

Production-ready. The test suite and docs are extensive, and development is still active.
