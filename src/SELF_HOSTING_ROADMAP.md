# Self-Hosting Compiler Roadmap

This document lays out the requirements, missing features, and implementation plan for moving the adgLang compiler from a TypeScript app to a self-hosted adgLang app.

## 1. Core Goal

**Goal**: Build an adgLang compiler, written in adgLang, that emits LLVM IR.
**Backend**: We will keep using LLVM (`llc`) for optimization and binary generation. We are **not** aiming for direct native machine code generation right now.

## 2. Infrastructure Requirements

### 2.1 Memory Management (Critical)

Compilers allocate millions of small objects (AST nodes, Symbols, Types) that usually live for the full compilation run. Calling `malloc`/`free` for every node is inefficient and hard to manage.

- [x] **Arena Allocator**: Implemented in `lib/memory/arena_allocator.adg`.
 - **Review**: The current implementation looks solid. It correctly uses `mmap` for pages and a bump pointer for individual allocations.
 - **Action**: Make sure every compiler phase (Parser, TypeChecker) receives an `*ArenaAllocator` in its context.

### 2.2 Collections & Data Structures

We need a few specific structures for scopes and symbols.

- [x] **ScopeStack<T>**: A wrapper around `List<Map<string, T>>`.
 - **Usage**: Handles variable shadowing ` { local x; { local x; } }`.
 - **API**: `enterScope()`, `exitScope()`, `define(name, val)`, `lookup(name)`.
- [x] **Map<K,V>**: Existing `lib/map.adg` is sufficient.
- [x] **Set<T>**: Implemented in `lib/set.adg` (wraps `Map<T, bool>`).

### 2.3 Diagnostics & Error Reporting

We need error reporting with context, similar to the TypeScript version.

- [x] **Module: `std/diagnostics.adg`**
 - **Status**: Implemented in `lib/diagnostics.adg` and `examples/std_diagnostics`.
 - **Struct `Span`**: `{ file: string, start: int, end: int, line: int, col: int }`.
 - **Struct `Diagnostic`**: `{ level: Error|Warning, message: string, span: Span }`.
 - **Function `printDiagnostic(d)`**: Reads the source line and prints it with a caret/underline pointing at the error.

## 3. I/O and Filesystem

The current `fs` module reads whole files into strings. For a compiler, streaming is often preferable, but for adgLang source files (usually < 1MB), reading the full string is acceptable **if** we have a good abstraction for walking through it.

- [x] **Enhance `lib/fs.adg`**:
 - **Status**: Added `readFile` (read-to-string), `writeFile`, `exists`.
 - Add `BufferedReader` or `FileStream` for larger reads if necessary.
 - **Decision**: For v1, reading the full source into a `String` is acceptable, as long as we wrap it in a `SourceFile` struct.
- [x] **Enhance `lib/path.adg`**:
 - **Status**: Implemented and verified in `examples/stdlib_path`.
 - `resolve(base, relative)`: Handle `../`, `./` arithmetic.
 - `isAbsolute(path)`: Check for `/` root.
 - `normalize(path)`: Remove redundant slashes and dots.
 - **Requirement**: Required for module resolution (`import ... from "./foo.adg"`).

## 4. Lexing Strategy (Regex vs. Manual)

**Question**: Should we use C regex libs or manual checks?

**Decision**: **Manual Character Classification**.

- **Why?**
 - **Performance**: A switch-statement state machine is much faster than compiling and running a regex for every token.
 - **Dependencies**: It avoids linking complex C libraries (`libpcre` or `regex.h`).
 - **Control**: It is easier to handle edge cases (nested comments, string interpolation).
- **Implementation**:
 - Create helper `std/char_utils.adg`:
 - **Status**: Implemented in `lib/char_utils.adg`.
 - `isDigit(c)`, `isAlpha(c)`, `isWhitespace(c)`.
 - `isHex(c)`, `toLower(c)`.

## 5. Runtime Independence (Syscalls)

Right now, we depend on `libc` (`printf`, `malloc`, `fopen`).
**Plan**:

1. **Short-term**: Keep using `libc` via `extern` so compiler logic can move faster.
2. **Mid-term**: Wrap `libc` calls in `std` APIs so compiler code does not directly depend on C.
3. **Long-term**: Replace `std` implementations with `lib/sys/linux/*.s` (ASM syscalls) as defined in the native runtime plan.

## 6. Implementation Checklist

### Phase 1: Foundation (Current)

- [x] `ArenaAllocator` (`lib/memory/arena_allocator.adg`)
- [x] `CLI ArgParser` (`lib/arg_parser.adg`)
- [x] Implement `ScopeStack<T>`
- [x] Implement `std/diagnostics` (`lib/diagnostics.adg`)
- [x] Implement `Set<T>` (`lib/set.adg`)
- [x] Implement `Path` utilities (`lib/path.adg`)
- [x] Implement `FS` utilities (`lib/fs.adg`)

### Phase 2: Compiler Frontend

- [x] **SourceReader**: Struct to track `line`, `col`, and `index` while consuming chars (`src/source_reader.adg`).
- [x] **Lexer**: Convert `GrammarLexer.ts` logic to adgLang using `SourceReader` and manual char checks (`src/scanner.adg`).
- [x] **AST Defs**: Define `enum NodeKind` and `struct Node` hierarchy in adgLang (`src/ast.adg`).
- [x] **Symbol Table**: Define `Symbol`, `SymbolKind` and `SymbolTable` (`src/symbols.adg`).
- [x] **Semantic Types**: Define `Type` and `TypeKind` (`src/types.adg`).
- [ ] **Parser**: Recursive descent parser building AST nodes in the Arena (to be implemented in `src/parser.adg`).

### Phase 3: Middle & Backend

- [ ] **TypeChecker**: Walk the AST and resolve symbols with `ScopeStack`.
- [ ] **IRGen**: Walk the AST and print LLVM IR into a buffer.
- [ ] **Driver**: Wire together ArgParser -> Reader -> Lexer -> Parser -> IRGen -> File Write.

## 7. Notes on "ArenaAllocator.adg"

The provided implementation is **good**.

- It correctly handles `mmap` with `MAP_PRIVATE | MAP_ANONYMOUS`.
- It implements the `init`, `alloc`, `reset` lifecycle needed for compiler passes.
- **Micro-optimization**: Large allocations (`> default_block_size`) now skip the current block and get dedicated blocks to avoid fragmentation.
