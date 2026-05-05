# adgLang

A statically-typed, compiled programming language that transpiles to LLVM IR.

## Install

```bash
git clone https://github.com/adg-all-day/adgLang.git
cd adgLang
bun install
bun run build
./adgLang run examples/hello-world/hello.adg
```

## Feature matrix

| Area              | Status |
|-------------------|--------|
| Lexer / parser    | done   |
| Type checker      | done   |
| Generics + traits | done   |
| Pattern matching  | done   |
| LLVM IR backend   | done   |
| Bytecode VM + JIT | done   |
| LSP + VS Code     | done   |
| Package manager   | done   |
| Playground (WASM) | done   |
| Stdlib            | done   |
| Async / scheduler | done   |
| Formatter         | done   |
| Fuzz harness      | done   |
| Benchmarks        | done   |

See `docs/` for the language tour, `LANGUAGE_SPEC.md` for the full reference,
and `examples/` for runnable programs.
