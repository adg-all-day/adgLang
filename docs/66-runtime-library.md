# Runtime Library

The adgLang runtime library provides core runtime support for adgLang programs, including exception handling, stack management, and better error diagnostics.

## Architecture Overview

The runtime is split into two components:

| Component               | Language | Purpose                                                   |
| ----------------------- | -------- | --------------------------------------------------------- |
| `lib/runtime.ll`        | LLVM IR  | Core exception handling, defer, try/catch, longjmp/setjmp |
| `lib/runtime_support.c` | C        | Signal handlers, stack traces, formatted error printing   |

This split architecture gives you:

- **Correct LLVM Integration**: Exception-handling primitives stay in LLVM IR so they integrate correctly with generated code.
- **Rich Diagnostics**: The C library gives you portable access to `backtrace()`, `dladdr()`, and signal handling.
- **Cross-Platform Support**: The C code handles platform-specific details for Linux and macOS.

## Runtime Error Types

The runtime detects and handles four kinds of runtime errors:

### 1. NULL Pointer Access

This triggers when code tries to access a member on a null pointer.

```adgLang
struct Point { x: int, y: int }

frame accessNull() {
    local p: *Point = nullptr;
    local x = p.x;  # Runtime error!
}
```

**Output:**

```
╔══════════════════════════════════════════════╗
║ NULL POINTER ACCESS                          ║
╚══════════════════════════════════════════════╝
Attempted to access member of nullptr
Function: accessNull
Expression: p.x
Location: line 5, column 14

=== ADGLANG Call Stack ===

=== Stack Trace ===
  [0] main(+0x26b6) [0x559e1bdb66b6]
  [1] accessNull_ + 0x41
  [2] main + 0x13a
```

### 2. Index Out of Bounds

This triggers when array access goes past the array bounds.

```adgLang
frame main() {
    local arr: int[5] = [1, 2, 3, 4, 5];
    local x = arr[10];  # Runtime error!
}
```

**Output:**

```
╔══════════════════════════════════════════════╗
║ INDEX OUT OF BOUNDS                          ║
╚══════════════════════════════════════════════╝
Array index 10 is out of bounds for size 5
Function: main
Location: line 3, column 15

=== Stack Trace ===
  [0] main(+0x2789) [0x55a1b2c3d789]
  [1] main + 0x52
```

### 3. Division by Zero

This triggers on integer division by zero.

```adgLang
frame divide(a: int, b: int) ret int {
    return a / b;  # Runtime error if b == 0!
}

frame main() {
    local result = divide(10, 0);
}
```

**Output:**

```
╔══════════════════════════════════════════════╗
║ DIVISION BY ZERO                             ║
╚══════════════════════════════════════════════╝
Integer division by zero
Function: divide
Location: line 2, column 12

=== Stack Trace ===
  [0] divide_i32_i32 + 0x35
  [1] main + 0x28
```

### 4. Stack Overflow

This triggers when the call stack goes past the maximum depth of 10,000 frames.

```adgLang
frame recursiveCall(n: int) {
    recursiveCall(n + 1);  # Infinite recursion!
}

frame main() {
    recursiveCall(0);
}
```

**Output:**

```
╔══════════════════════════════════════════════╗
║ STACK OVERFLOW                               ║
╚══════════════════════════════════════════════╝
Stack overflow

=== ADGLANG Call Stack ===
  ... 9980 more frames

=== Stack Trace ===
  [0] main(+0x2657) [0x55e54a55a657]
  [1] recursiveCall_i32 + 0x10
  [2] recursiveCall_i32 + 0x36
  [3] recursiveCall_i32 + 0x36
  ...
```

## Signal Handling

At program startup, the runtime automatically installs signal handlers using `__attribute__((constructor))`. This catches crashes that happen outside adgLang's explicit error checks:

| Signal    | Description                                           |
| --------- | ----------------------------------------------------- |
| `SIGSEGV` | Segmentation fault (invalid memory access)            |
| `SIGFPE`  | Floating point exception (e.g., hardware div-by-zero) |
| `SIGILL`  | Illegal instruction                                   |
| `SIGABRT` | Aborted (e.g., from `abort()` or assertion failure)   |
| `SIGBUS`  | Bus error (bad memory alignment)                      |

When a signal is caught, the handler:

1. Prints a formatted error box with the signal name
2. Prints the adgLang call stack (if available)
3. Prints the native stack trace
4. Re-raises the signal to allow core dump generation

## Stack Trace Generation

### Native Stack Traces

The runtime uses platform-specific APIs to generate native stack traces:

- **Linux/macOS**: Uses `backtrace()` from `<execinfo.h>` and `dladdr()` from `<dlfcn.h>`
- Symbol resolution gives you function names and offsets.
- Full symbol visibility requires the `-rdynamic` linker flag.

### adgLang Call Stack

The compiler emits calls to `__adgLang_enter_stack_frame()` and `__adgLang_leave_stack_frame()` at function entry and exit. This enables:

- Tracking the current call depth
- Detecting stack overflow before it crashes
- Enhanced stack traces with adgLang function names

## Error Output Formatting

Error messages use ANSI escape codes for colored output:

| Color  | Usage                                         |
| ------ | --------------------------------------------- |
| Red    | Error box borders and titles                  |
| Yellow | Error descriptions and details                |
| Cyan   | Section headers (Stack Trace, ADGLANG Call Stack) |
| Gray   | Frame numbers in stack traces                 |
| Bold   | Function names and values                     |

The formatting degrades gracefully on terminals that do not support color.

## API Reference

### Core Functions (runtime.ll)

```llvm
; Enter a stack frame (call at function entry)
declare void @__adgLang_enter_stack_frame()

; Leave a stack frame (call at function exit)
declare void @__adgLang_leave_stack_frame()

; Throw null pointer access error
declare void @__adgLang_throw_null_access(i8* %func, i8* %expr, i32 %line, i32 %col)

; Throw index out of bounds error
declare void @__adgLang_throw_index_out_of_bounds(i32 %index, i32 %size, i8* %func, i32 %line, i32 %col)

; Throw division by zero error
declare void @__adgLang_throw_division_by_zero(i8* %func, i32 %line, i32 %col)

; Throw stack overflow error
declare void @__adgLang_throw_stack_overflow()
```

### Support Functions (runtime_support.c)

```c
// Print formatted error box
void __adgLang_print_error_box(const char *title);

// Print error detail line
void __adgLang_print_error_detail(const char *label, const char *value);

// Print error location
void __adgLang_print_error_location(int32_t line, int32_t col);

// Print native stack trace
void __adgLang_print_stack_trace(void);

// Print ADGLANG-level call stack
void __adgLang_print_adgLang_stack_trace(void);

// Panic with message (noreturn)
void __adgLang_panic(const char *message);

// Assert condition
void __adgLang_assert(int condition, const char *message, const char *file, int32_t line);
```

## Building the Runtime

The runtime support library needs to be compiled before you use it:

```bash
cd lib
./build_runtime.sh
```

This produces:

- `runtime_support.o` - Object file linked into every adgLang program
- `libadgLang_runtime_support.a` - Static library (optional)

### Compilation Flags

The C runtime is compiled with:

- `-fPIC` - Position-independent code
- `-O2` - Optimization level 2
- `-rdynamic` - Export symbols for stack traces

## Linking

The adgLang compiler automatically links both runtime components:

```bash
clang -o program program.ll lib/runtime.ll lib/runtime_support.o -rdynamic -lm
```

The `-rdynamic` flag is required so `dladdr()` can resolve symbol names in stack traces.

## Exception Handling Integration

The runtime ties into adgLang's try/catch mechanism:

```adgLang
try {
    riskyOperation();
} catch (e: int) {
    printf("Caught error: %d\n", e);
}
```

The `defer` statement also behaves correctly:

```adgLang
frame example() {
    defer { printf("Cleanup!\n"); }
    riskyOperation();  # If this throws, defer still runs
}
```

Both `defer` and `try/catch` are implemented with `setjmp`/`longjmp` in `runtime.ll`.

## Debugging Tips

### Getting Better Stack Traces

1. **Compile with debug info**: Use `--dwarf` flag

 ```bash
 adgLang build --dwarf myprogram.adg
 ```

2. **Use addr2line**: Convert addresses to file:line

 ```bash
 addr2line -e myprogram 0x559e1bdb66b6
 ```

3. **Use gdb**: Full debugging experience
 ```bash
 gdb ./myprogram
 (gdb) run
 (gdb) bt # backtrace after crash
 ```

### Disabling Signal Handlers

If you are debugging with external tools like Valgrind or gdb, you may want to disable the runtime signal handlers:

```bash
# Let gdb handle signals
(gdb) handle SIGSEGV nostop noprint pass
```

## Platform Support

| Platform     | Stack Traces | Signal Handling |
| ------------ | ------------ | --------------- |
| Linux x86_64 | ✅ Full      | ✅ Full         |
| Linux ARM64  | ✅ Full      | ✅ Full         |
| macOS x86_64 | ✅ Full      | ✅ Full         |
| macOS ARM64  | ✅ Full      | ✅ Full         |
| Windows      | ❌ Not yet   | ❌ Not yet      |

## Future Improvements

Planned runtime-library improvements:

1. **Source Code Display**: Show the offending line of source code in error messages
2. **Memory Sanitizer Integration**: Detect use-after-free, memory leaks
3. **Windows Support**: Platform-specific implementations for Windows
4. **Custom Error Handlers**: Allow user code to register error callbacks
5. **Performance Profiling**: Built-in profiling support

## See Also

- [Error Handling](26-try-catch.md) - `try/catch` and `throw`
- [Memory Management](20-memory-basics.md) - `malloc`/`free` patterns
- [Debugging](51-debugging.md) - Debugging adgLang programs
- [Compiler Options](39-compiler-options.md) - Debug flags and options
