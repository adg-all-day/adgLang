# Introduction to adgLang

## What adgLang is

**adgLang (Best Programming Language)** is a statically-typed compiled language that transpiles to LLVM IR (Intermediate Representation). It aims to pair low-level performance with modern language features, which makes it a good fit for systems programming, performance-sensitive software, and learning how compilers and languages work.

adgLang uses `frame` for functions, `local` and `global` for variable declarations, and includes features like generics, `match`-based pattern matching, and algebraic data types through `enum`.

## Key Features

### Performance

- **Compiles to LLVM IR** - Uses LLVM's optimization pipeline
- **Zero-cost abstractions** - High-level features compile down to efficient machine code without runtime overhead
- **Manual memory management** - Full control over allocations with `malloc`/`free` or custom allocators
- **Native code generation** - Produces optimized machine code for your target platform
- **Inline assembly support** - Lets you drop to assembly when you need maximum control

### Type Safety

- **Strong static typing** - Finds errors at compile time before they become runtime bugs
- **Type inference** - Cuts down on boilerplate without giving up safety
- **Generics** - Lets you write reusable, type-safe code with `<T>` syntax
- **Option types** - Gives you a safer way to deal with nullable values through `Option<T>`
- **Runtime nullptr protection** - Throws `NullAccessError` automatically when `nullptr` is dereferenced

### Modern Language Features

- **Object-Oriented Programming** - Structs with methods and single inheritance
- **Generic Programming** - Parameterized types and functions with monomorphization
- **Module System** - Organize code with `import`/`export` statements
- **Pattern Matching** - `match` expressions with guards and destructuring
- **Exception Handling** - `try`/`catch`/`throw` blocks for error handling
- **Lambda Expressions** - First-class anonymous functions with closures
- **String Interpolation** - Embed expressions in strings with backticks and `${expr}`
- **Algebraic Data Types** - Define sum types with `enum` and match on variants

### Developer Experience

- **Clear error messages** - Helpful compiler diagnostics with source locations
- **Built-in formatter** - Consistent code style with `adgLang format`
- **Package manager** - Dependency management through `adgLang.json`
- **Cross-platform** - Target Linux, macOS, Windows, and more
- **VS Code integration** - Syntax highlighting, IntelliSense, and error diagnostics
- **Watch mode** - Recompile automatically on file changes with `adgLang watch`

## Why use adgLang

### For Systems Programming

adgLang gives you low-level control in the same general space as C/C++:

- Direct memory manipulation through pointers (`*T`, `&value`, `*ptr`)
- Inline assembly support with Intel, AT&T, and LLVM IR flavors
- No garbage collector overhead - you decide when memory is allocated and freed
- Predictable performance with no hidden runtime costs
- C ABI compatibility for straightforward FFI integration

### For Application Development

adgLang also gives you modern language tools:

- Generics for type-safe collections (`Array<T>`, `Map<K, V>`)
- Exception handling with `try`/`catch`/`throw` for sturdier error handling
- Module system with `import`/`export` for cleaner project layout
- Rich standard library covering I/O, strings, collections, math, and more
- Lambda expressions and closures for functional-style patterns

### For Learning

adgLang works well as a learning language:

- Simple, consistent syntax with clear keywords (`frame`, `local`, `struct`)
- Straightforward compilation model (source → LLVM IR → native code)
- Explicit memory management that teaches fundamentals instead of hiding them
- Detailed error messages with source locations that help you debug
- A smaller language spec that is easier to hold in your head

## Design Philosophy

### Explicit Over Implicit

adgLang leans toward clarity and explicitness:

- Variables needs to be declared as `local` or `global`
- Types are usually explicit (with inference where it helps)
- Memory allocation is manual and visible
- No hidden conversions or implicit type coercions
- `cast<T>` keeps type conversions explicit

### Safety Without Compromise

adgLang adds safety features without trading away performance:

- Static type checking catches many runtime bugs before the program runs
- Runtime nullptr protection throws `NullAccessError` on invalid access
- Optional bounds checking for array access
- Nullable types through `Option<T>` encourage explicit handling
- Pattern matching enforces exhaustive case handling

### Simplicity and Consistency

adgLang keeps the language small and regular:

- Fewer keywords and constructs to learn
- Repeating syntax patterns across the language
- Predictable behavior without surprises
- Minimal "magic" - what you write is what you get

## Language Overview

Here's a quick taste of adgLang syntax:

```adgLang
import [String] from "std";
extern printf(fmt: string, ...);

# Define a struct with methods
struct Point {
    x: int,
    y: int,

    frame new(x: int, y: int) ret Point {
        return Point { x: x, y: y };
    }

    frame distance(this: *Point) ret float {
        return sqrt(cast<float>(this.x * this.x + this.y * this.y));
    }
}

# Generic enum for optional values
enum Option<T> {
    Some(T),
    None,
}

# Main entry point
frame main() ret int {
    local p: Point = Point.new(3, 4);
    printf("Distance: %f\n", p.distance());

    # Pattern matching
    local opt: Option<int> = Option<int>.Some(42);
    match (opt) {
        Option<int>.Some(val) => printf("Value: %d\n", val),
        Option<int>.None => printf("No value\n"),
    };

    # String interpolation
    local msg: String = `Point is at (${p.x}, ${p.y})`;
    printf("%s\n", msg.toString());
    msg.destroy();

    return 0;
}
```

## Comparison with Other Languages

### vs C

**Similarities:**

- Manual memory management
- Pointers and low-level control
- Compiles to native code

**Improvements:**

- Modern type system with generics
- Built-in module system
- Exception handling
- Safer nullptr handling

### vs C++

**Similarities:**

- Object-oriented features
- Generic programming
- High performance

**Differences:**

- Simpler syntax (no templates, limited operator overloading)
- No implicit constructors/destructors
- More explicit memory management
- Smaller language specification

### vs Rust

**Similarities:**

- Memory safety focus
- Modern type system
- Zero-cost abstractions

**Differences:**

- Manual memory management (no borrow checker yet)
- Simpler ownership model
- Less complex type system
- Easier learning curve

### vs Go

**Similarities:**

- Simple syntax
- Modern tooling
- Fast compilation

**Differences:**

- No garbage collector
- Manual memory management
- Generics with monomorphization
- More low-level control

## When to Use adgLang

### ✅ Good Use Cases

- **Systems programming** - Operating systems, drivers, embedded systems
- **Performance-critical applications** - Game engines, simulations, scientific computing
- **CLI tools** - Fast startup, small binaries
- **Learning compilers and systems** - Clear compilation model
- **Projects requiring C interop** - Easy FFI

### ⚠ Consider Alternatives For

- **Web development** - Use JavaScript/TypeScript
- **Rapid prototyping** - Use Python or Ruby
- **Large teams new to systems programming** - Consider Rust or Go
- **Projects requiring garbage collection** - Use Go, Java, or C#

## Getting Help

- **Documentation** - You are already in it. Start with [Quick Start](03-quick-start.md)
- **Examples** - See the [examples directory](../examples/)
- **GitHub Issues** - Report bugs or request features
- **Community** - Join discussions (link to be added)

## What's Next?

Ready to move forward? Continue to:

1. [Installation Guide](02-installation.md) - Set up your development environment
2. [Quick Start](03-quick-start.md) - Write your first adgLang program
3. [Syntax and Comments](04-syntax-comments.md) - Learn the basics

---

**Note**: adgLang is under active development. Features and syntax may change. Check the [CHANGELOG](../CHANGELOG.md) for updates.
