# Extending the Compiler

This guide walks through extending the adgLang compiler, with a focus on adding new primitive types and their object-oriented wrappers.

## Adding New Primitive Types

adgLang supports primitive types such as `i32`, `i64`, and `double`. To add object-oriented behavior like methods to those primitives, the compiler uses wrapper structs. For example, `Int` wraps `i32`.

When you write `42.toString()`, the compiler:

1. Identifies `42` as an `i32`.
2. Looks up the wrapper struct for `i32` (which is `Int`).
3. Resolves the `toString` method on the `Int` struct.

### Steps to Add a New Primitive Wrapper

#### 1. Define the Wrapper Struct

Add the struct definition in `lib/primitives.adg`. That file contains the standard library definitions for primitive wrappers.

Example for `Long` (wrapping `i64`):

```adgLang
struct Long {
    value: i64,

    # Constructor (optional, but good practice)
    frame new(v: i64) ret Long {
        local l: Long;
        l.value = v;
        return l;
    }

    # Method example
    frame toString(this: *Long) ret String {
        local buf: *char = malloc(32);
        sprintf(buf, "%lld", this.value); # Use %lld for long long (i64)
        local s: String = String.new(buf);
        free(buf);
        return s;
    }
}

export [Long];
```

#### 2. Register the Primitive Mapping

Update `compiler/middleend/BuiltinTypes.ts` to map the primitive type name to the struct name.

```typescript
export const PRIMITIVE_STRUCT_MAP: Record<string, string> = {
  i32: "Int",
  i1: "Bool",
  double: "Double",
  i64: "Long", // Add this line
};
```

#### 3. Recompile the Standard Library

If the standard library is precompiled, you may need to rebuild it. In the current setup, `lib/primitives.adg` is usually included or parsed while compiling user programs, so changes should take effect right away.

## Adding New Compiler Features

### Project Structure

- **`compiler/frontend`**: Lexer and Parser. This layer turns source code into an Abstract Syntax Tree (AST).
- **`compiler/middleend`**: Type Checker, Call Checker, and Semantic Analysis. This layer validates the AST.
- **`compiler/backend`**: Code Generator. This layer turns the AST into LLVM IR.

### Common Tasks

- **Adding a Keyword**:
 1. Update `compiler/frontend/Lexer.ts` to recognize the token.
 2. Update `compiler/frontend/Parser.ts` to parse the new syntax.
- **Adding a Built-in Function**:
 1. Define it in `compiler/middleend/BuiltinFunctions.ts` (if applicable) or in the standard library (`lib/`).
- **Modifying Code Generation**:
 1. Look at `compiler/backend/codegen/StatementGenerator.ts` or `ExpressionGenerator.ts`.

## Testing Your Changes

Always run the test suite after you make changes:

```bash
bun test
```

For new features, add a new test in `tests/` or a new example in `examples/`.
