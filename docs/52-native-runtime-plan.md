# Plan: Native Runtime & Platform Independence

> **Status Update (January 2026)**: Phase 0 (Enhanced Error Handling) is complete.
> See [docs/66-runtime-library.md](66-runtime-library.md) for the current runtime docs.

## Current Implementation

Before going all the way to `libc` independence, we already built a solid runtime error handling system:

- **`lib/runtime.ll`**: Core LLVM IR runtime for exception handling, defer, try/catch
- **`lib/runtime_support.c`**: C support library for signal handlers, stack traces, formatted errors
- **`lib/build_runtime.sh`**: Build script for the C support library

This hybrid setup gives strong diagnostics while still staying compatible with the current codebase.

---

## 1. Executive Summary

The goal is straightforward: remove the `libc` (C Standard Library) dependency and ship a native adgLang runtime instead. That would let adgLang run straight on the Linux kernel, and later other operating systems, through system calls. The design stays modular so new platforms (OS) and architectures (CPU) can be added without reworking everything.

## 2. Current Dependencies Analysis

From a scan of `lib/` and `examples/`, these C functions are still in use and need replacements:

| Category    | Functions                              | Replacement Strategy                                    |
| :---------- | :------------------------------------- | :------------------------------------------------------ |
| **Memory**  | `malloc`, `free`                       | Implement `mmap`-based allocator in ADGLANG.                |
| **I/O**     | `printf`, `fprintf`                    | Implement type-safe `fmt` module using `write` syscall. |
| **String**  | `strlen`, `strcpy`, `strcmp`, `strcat` | Implement in pure ADGLANG (or optimized ASM).               |
| **Raw Mem** | `memcpy`, `memset`, `memcmp`           | Implement in pure ADGLANG (or optimized ASM).               |
| **Process** | `exit`, `__adgLang_argc`, `__adgLang_argv_get` | Implement `_start` entry point in ASM.                  |

## 3. Proposed Directory Structure

To make platform and architecture support cleaner, `lib/` should be split so generic code and system-specific code live separately.

```text
lib/
├── core/                  # Platform-agnostic implementations
│   ├── memory.adg         # malloc/free logic (calls sys.mmap)
│   ├── io.adg             # Generic Reader/Writer interfaces
│   ├── string.adg         # strlen, memcpy, etc.
│   └── start.adg          # Generic runtime initialization
├── sys/                   # System Interface Layer
│   ├── linux/
│   │   ├── x86_64/
│   │   │   ├── syscalls.s      # ASM wrappers (syscall0..6)
│   │   │   ├── constants.adg   # SYS_WRITE=1, SYS_EXIT=60
│   │   │   └── types.adg       # Struct layouts (stat, etc.)
│   │   └── arm64/              # Future support
│   │       └── ...
│   └── macos/                  # Future support
│       └── ...
└── std.adg                # Re-exports core modules
```

## 4. Implementation Steps

### Phase 1: The Syscall Interface

We need one consistent way to call kernel functions.

1. **Create `lib/sys/linux/x86_64/syscalls.s`**:
 - Define `syscall0` through `syscall6` following the Linux x86_64 calling convention (`rax`=sys, args=`rdi`,`rsi`,`rdx`,`r10`,`r8`,`r9`).
 - Define `_start` entry point.
2. **Create `lib/sys/linux/x86_64/constants.adg`**:
 - Export constants for syscall numbers (e.g., `const SYS_WRITE: i64 = 1;`).

### Phase 2: The Entry Point (`_start`)

The real program entry point is `_start`, not `main`.

1. **Assembly Bootstrap**:
 - `_start` pops `argc` and `argv` from the stack.
 - Calls an adgLang function `runtime_init(argc, argv)`.
 - Calls the user's `main()`.
 - Calls `sys_exit` with the return value.
2. **Runtime Init**:
 - Store `argc` and `argv` in global variables accessible via `std::args`.

### Phase 3: Memory Management

Replace `malloc` with a native allocator.

1. **`lib/core/memory.adg`**:
 - Implement a simple "Bump Allocator" or "Free List" allocator backed by `mmap` (Syscall 9).
 - Export `malloc(size)` and `free(ptr)`.
 - Implement `memcpy` and `memset` loops in adgLang.

### Phase 4: I/O & Formatting

Replace `printf`.

1. **`lib/core/io.adg`**:
 - Implement `print_str(s: string)` using `SYS_WRITE` (Syscall 1) to file descriptor 1 (stdout).
2. **`lib/core/fmt.adg`**:
 - Implement a formatter that converts integers/floats to string buffers.
 - Re-implement `printf` logic: parse format string -> call specific formatters -> buffer output -> flush to stdout.

### Phase 5: Compiler & Build System Updates

The compiler currently injects C declarations. That needs to stop.

1. **Modify `compiler/backend/CodeGenerator.ts`**:
 - Remove `this.emitDeclaration("declare ... @malloc ...")`.
 - Remove automatic injection of `printf`.
2. **Update Build Script (`cmp.sh` / `adgLang-wrapper.sh`)**:
 - **Detect Host**: Add logic to detect OS (`uname -s`) and Arch (`uname -m`).
 - **Select Files**: Based on host, include `lib/sys/linux/x86_64/*.s` and `*.adg`.
 - **Linker Flags**: Add `-nostdlib` to prevent linking `libc`.
 - **Assemble**: Run `as` on the selected assembly files before linking.

## 5. Extensibility Guide

### Adding a New Architecture (e.g., ARM64)

1. Create `lib/sys/linux/arm64/`.
2. Implement `syscalls.s` using ARM64 calling conventions (`x0`..`x7` registers, `svc` instruction).
3. Create `constants.adg` with ARM64-specific syscall numbers.
4. Update build script to select this folder when `uname -m` returns `aarch64`.

### Adding a New OS (e.g., macOS)

1. Create `lib/sys/macos/x86_64/`.
2. Implement `syscalls.s` (macOS syscalls often have a class offset).
3. Create `constants.adg` (macOS syscall numbers differ significantly from Linux).
4. Update build script to handle `Darwin`.

## 6. Migration Checklist

- [ ] Create `lib/sys` directory structure.
- [ ] Write `syscalls.s` for Linux x86_64.
- [ ] Write `constants.adg` for Linux x86_64.
- [ ] Implement `memory.adg` (malloc/free).
- [ ] Implement `string.adg` (memcpy/strlen).
- [ ] Implement `io.adg` (print/write).
- [ ] Update `CodeGenerator.ts` to remove injected externs.
- [ ] Update `cmp.sh` to assemble and link native objects.
- [ ] Verify `hello-world` example runs without `libc`.
