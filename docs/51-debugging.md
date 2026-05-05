# Debugging adgLang Programs

This guide shows how to debug adgLang programs with standard tools like LLDB and GDB, using the DWARF debug info the compiler emits.

## Runtime Error Messages

adgLang programs include improved runtime error handling by default. When a runtime error happens, you get formatted output with a stack trace:

```
╔══════════════════════════════════════════════╗
║ NULL POINTER ACCESS                          ║
╚══════════════════════════════════════════════╝
Attempted to access member of nullptr
Function: processData
Expression: p.value
Location: line 42, column 15

=== Stack Trace ===
  [0] processData_Point_ptr + 0x41
  [1] main + 0x13a
```

The runtime catches:

- **NULL pointer access** - with expression and location info
- **Index out of bounds** - with index and array size
- **Division by zero** - with function context
- **Stack overflow** - when the call stack goes past 10,000 frames

See [Runtime Library](66-runtime-library.md) for full details.

## Generating Debug Information

To debug effectively, compile with debug symbols enabled. Pass the `--dwarf` flag to the compiler.

```bash
# Compile with DWARF debug info
bun index.ts examples/my_program/main.adg --dwarf --emit llvm
```

That command does two things:

1. Generates LLVM IR with `!dbg` metadata nodes.
2. Makes sure the final object file includes DWARF sections.

## Using LLDB

[LLDB](https://lldb.llvm.org/) is the recommended debugger for LLVM-based languages.

### Starting a Session

1. **Compile your program**:

 ```bash
    # Assuming you have a script or command to build the executable
    # Ensure you pass the debug flags to clang/llc if you are linking manually
 clang output.ll -g -o my_program
 ```

2. **Launch LLDB**:
 ```bash
 lldb ./my_program
 ```

### Common Commands

- **Set a Breakpoint**:

 ```lldb
 (lldb) breakpoint set --name main
  # Or by file and line
 (lldb) breakpoint set --file main.adg --line 10
 ```

- **Run the Program**:

 ```lldb
 (lldb) run
 ```

- **Step Over/Into**:

 ```lldb
 (lldb) next # Step over
 (lldb) step # Step into function
 ```

- **Inspect Variables**:
 ```lldb
 (lldb) frame variable
 (lldb) print myVar
 ```

## Using GDB

[GDB](https://www.gnu.org/software/gdb/) (GNU Debugger) is another common option.

### Starting a Session

```bash
gdb ./my_program
```

### Common Commands

- **Break**: `break main` or `break main.adg:10`
- **Run**: `run`
- **Next**: `next` (step over)
- **Step**: `step` (step into)
- **Print**: `print myVar`
- **Backtrace**: `bt` (show call stack)

## Troubleshooting Debug Info

If the debugger is not showing source code or variables:

1. **Check Compilation Flags**: Make sure you used `--dwarf` during adgLang compilation and `-g` during the final Clang/GCC link step.
2. **Source Paths**: The debugger needs to find your source files. If you moved the binary, you may need to configure source mappings.
3. **Optimization**: Higher optimization levels (`-O2`, `-O3`) can inline functions or remove variables, which makes debugging harder. Use `-O0` for the cleanest debugging experience.

## Compiler Internals: How it Works

When you pass `--dwarf`, the adgLang compiler (`StatementGenerator.ts`) inserts calls to `llvm.dbg.declare` intrinsic functions.

- **DIBuilder**: The compiler uses a `DIBuilder` helper to build DWARF metadata nodes.
- **Scopes**: It tracks lexical scopes (functions, blocks) so variables are reported in the right context.
- **Type Mapping**: adgLang types are mapped to DWARF encodings such as `DW_ATE_signed` for `int`.

### Recent Fixes

- **Variable Scoping**: Fixed a bug where stack addresses for debug info were declared in the wrong scope, which could crash compilation.
- **Variadic Functions**: Improved the type descriptions used for variadic parameters in debug metadata.
