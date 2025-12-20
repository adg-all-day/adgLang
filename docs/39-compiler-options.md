# Compiler Options

The adgLang compiler (`adgLang`) comes with a full command-line interface and a solid set of commands and flags.

## Commands

### `adgLang run <file> [args...]`

Compile and run an adgLang program.

**Examples:**

```bash
# Run a program
adgLang run hello.adg

# Pass arguments to the program
adgLang run hello.adg arg1 arg2

# Run with optimization
adgLang run hello.adg -O 2
```

### `adgLang dev <file> [args...]`

Development mode with watch and auto-run.

**Options:**

- `--clear`: Clear the screen on each recompile
- `--no-run`: Compile only, do not execute

**Examples:**

```bash
# Watch and run
adgLang dev main.adg

# Watch with screen clearing
adgLang dev main.adg --clear

# Watch but only compile
adgLang dev main.adg --no-run
```

### `adgLang build <file>`

Compile a program explicitly.

**Examples:**

```bash
# Basic compilation
adgLang build hello.adg

# Specify output file
adgLang build hello.adg -o myprogram
```

### `adgLang check <files...>`

Type-check files without generating code. This is the fast path.

**Examples:**

```bash
# Check single file
adgLang check main.adg

# Check multiple files
adgLang check src/*.adg

# JSON output
adgLang check main.adg --json
```

### `adgLang new <name>`

Create a new adgLang project.

**Examples:**

```bash
adgLang new my-project
```

### `adgLang clean`

Remove build artifacts.

**Options:**

- `--dry-run`: Show what would be deleted
- `-v, --verbose`: Verbose output

**Examples:**

```bash
adgLang clean
adgLang clean --dry-run
```

### `adgLang format [files...]`

Format adgLang source files.

**Options:**

- `-w, --write`: Write the formatted output back to files

**Examples:**

```bash
adgLang format main.adg
adgLang format -w main.adg
```

## Global Flags

These flags work with most commands:

- `-o <file>`: Output file name
- `-v, --verbose`: Verbose compiler output
- `-q, --quiet`: Suppress non-error output
- `-O <level>`: Optimization level (0, 1, 2, or 3)
- `-d, --dwarf`: Generate DWARF debug information
- `--debug`: Alias for --dwarf
- `--time`: Show compilation time statistics
- `--cache`: Enable incremental compilation
- `--json`: Output in JSON format
- `--color`: Force colored output
- `--no-color`: Disable colored output

## Direct Code Execution

For quick tests when you do not want to create files:

- `-e, --eval <code>`: Compile code passed directly on the command line
- `--stdin`: Compile code read from standard input

**Examples:**

```bash
# Evaluate code directly
adgLang -e 'frame main() ret int { return 0; }'

# Read from stdin
cat hello.adg | adgLang --stdin

# Emit AST from eval
adgLang -e 'frame main() { }' --emit ast
```

## Development Mode

The `adgLang dev` command gives you watch mode for quick iteration. It watches your adgLang source files, recompiles when they change, and can run the result automatically.

### Features

- **Automatic Recompilation**: Detects changes to `.adg` files and recompiles automatically
- **Auto-Run**: Runs your program after a successful compilation (use `--no-run` to disable)
- **Error Recovery**: Keeps watching even when compilation fails
- **Debouncing**: Avoids excessive recompiles from rapid file changes (100ms delay)
- **Recursive Watching**: Watches all `.adg` files in the directory tree
- **Smart Filtering**: Skips `node_modules`, `.git`, `adgLang_modules`, and hidden directories
- **Screen Clearing**: Can clear the screen on recompile with `--clear`

### Usage

```bash
# Basic watch and run
adgLang dev main.adg

# Watch and run with screen clearing
adgLang dev main.adg --clear

# Watch but only compile (don't run)
adgLang dev main.adg --no-run

# Watch with verbose output
adgLang dev main.adg -v
```

### Example Session

```bash
$ adgLang dev main.adg
[Watch] Starting watch mode...
[Watch] Watching directory: /path/to/project
[Watch] Entry point: main.adg
[Watch] Press Ctrl+C to stop

[12:00:00] Compiling /path/to/project/main.adg...
Hello, World!
[12:00:00] ✓ Compilation successful

[Watch] Found 3 ADGLANG files to watch

[Watch] Watching for changes...

# (File is edited and saved)
[Watch] File changed: /path/to/project/main.adg
[12:00:15] Compiling /path/to/project/main.adg...
Hello, ADGLANG!
[12:00:15] ✓ Compilation successful
```

### Error Handling

If your code has errors, watch mode shows them and keeps running:

```bash
[12:01:00] Compiling /path/to/project/main.adg...
error[main.adg:5:5]: Undefined symbol 'foo'
     3 | frame main() ret int {
     4 |     local x: int = 10;
>    5 |     foo();
       |      ^^^
     6 |     return 0;
     7 | }

help: Check if the symbol is declared.

1 error
[12:01:00] ✗ Compilation failed

# Still watching - fix the error and it will recompile
```

### Limitations

- Development mode only supports a single entry file (not multiple files at once)
- Use Ctrl+C to stop watching

## Emit Types

Use these to control what the compiler outputs:

- `llvm` (default): Generate LLVM IR
- `ast`: Output Abstract Syntax Tree as JSON
- `tokens`: Output lexical tokens
- `formatted`: Format the source code (same as `adgLang format`)

**Examples:**

```bash
# Generate LLVM IR
adgLang build main.adg --emit llvm

# Output AST for tooling
adgLang build main.adg --emit ast > ast.json

# View tokens
adgLang build main.adg --emit tokens
```

## Optimization Levels

Control code optimization with `-O`:

- `-O 0`: No optimization (default, fastest compilation)
- `-O 1`: Basic optimization
- `-O 2`: Moderate optimization (recommended for production)
- `-O 3`: Aggressive optimization (may increase compilation time)

**Examples:**

```bash
# Development build (fast compilation)
adgLang run main.adg -O 0

# Production build (optimized)
adgLang build main.adg -O 2 -o myapp
```

## Debug Information

Generate DWARF debug information for debugging with gdb/lldb:

```bash
# Enable debug info
adgLang build main.adg -d

# Or use the long form
adgLang build main.adg --dwarf

# Or use the alias
adgLang build main.adg --debug
```

## Cross-Compilation

Compile for different target platforms:

**Flags:**

- `--target <triple>`: Target platform triple
- `--march <arch>`: Target architecture
- `--cpu <cpu>`: Specific CPU model
- `--sysroot <path>`: Sysroot for cross-compilation
- `--clang-flag <flag>`: Pass additional flags to clang

**Supported Targets:**

- `x86_64-pc-linux-gnu` (Linux x64)
- `aarch64-unknown-linux-gnu` (Linux ARM64)
- `arm64-apple-darwin` (macOS ARM64)
- `x86_64-apple-darwin` (macOS x64)
- `x86_64-pc-windows-gnu` (Windows x64)

**Examples:**

```bash
# Cross-compile for ARM64 Linux
adgLang build main.adg --target aarch64-unknown-linux-gnu

# Cross-compile for Windows from Linux
adgLang build main.adg --target x86_64-pc-windows-gnu

# Specify architecture details
adgLang build main.adg --target aarch64-unknown-linux-gnu --march=armv8-a

# Use custom sysroot
adgLang build main.adg \\
  --target aarch64-unknown-linux-gnu \\
  --sysroot /opt/cross/aarch64-linux-gnu
```

## Linking Options

Control library linking:

- `-l, --lib <lib>`: Link with a library
- `-L, --lib-path <path>`: Add library search path
- `--object <file>`: Link with object file

**Examples:**

```bash
# Link with math library
adgLang build main.adg -l m

# Add library search path
adgLang build main.adg -L /usr/local/lib -l mylib

# Link with object files
adgLang build main.adg --object utils.o --object helpers.o
```

## Output Control

- `-q, --quiet`: Suppress non-error messages
- `-v, --verbose`: Show detailed compilation steps
- `--json`: Output results in JSON format (useful for tooling)
- `--time`: Show compilation time statistics
- `--color`: Force colored output
- `--no-color`: Disable colored output

**Examples:**

```bash
# Quiet compilation
adgLang build main.adg -q

# Verbose output for debugging
adgLang build main.adg -v

# Time the compilation
adgLang build main.adg --time

# JSON output for CI/CD
adgLang check main.adg --json
```

## Caching

Enable incremental compilation with module caching:

```bash
# Enable caching for faster rebuilds
adgLang build main.adg --cache
```

Cached modules live in `adgLang_modules/.cache/`. Use `adgLang clean` to clear the cache.

## Complete Examples

### Development Workflow

```bash
# Start development with watch mode
adgLang dev main.adg --clear

# In another terminal, format on save
adgLang format -w main.adg

# Check types without full compilation
adgLang check main.adg
```

### Production Build

```bash
# Build optimized release binary
adgLang build main.adg -O 2 -o myapp

# Build with debug symbols for debugging
adgLang build main.adg -O 0 -d -o myapp-debug

# Cross-compile for multiple platforms
adgLang build main.adg -O 2 --target x86_64-pc-linux-gnu -o myapp-linux
adgLang build main.adg -O 2 --target x86_64-pc-windows-gnu -o myapp.exe
adgLang build main.adg -O 2 --target arm64-apple-darwin -o myapp-macos
```

### CI/CD Integration

```bash
# Type check all files
adgLang check src/*.adg --json --quiet

# Build with timing
adgLang build main.adg -O 2 --time --json

# Clean before build
adgLang clean && adgLang build main.adg -O 2
```
