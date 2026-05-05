# Type Matching with `match<Type>`

## Overview

adgLang gives you the `match<Type>(value)` expression for runtime type checking. Right now, this feature works with **enum variants** and provides a base for future generic type checking.

## Basic Usage

### Checking Enum Variants

Use `match<EnumName.Variant>(value)` to check whether an enum value is a specific variant:

```adgLang
enum Option<T> {
    Some(T),
    None,
}

frame processOption(opt: Option<int>) ret int {
    if (match<Option.Some>(opt)) {
        printf("Value is present\n");
        return 1;
    } else {
        printf("Value is absent\n");
        return 0;
    }
}
```

### Return Type

`match<Type>(value)` always returns a `bool`:

- `true` if the value matches the specified type/variant
- `false` otherwise

## Common Patterns

### Early Returns

Check variants before pattern matching when you want an early return:

```adgLang
frame getValue(opt: Option<int>) ret int {
    # Quick check before expensive operations
    if (match<Option.None>(opt)) {
        return 0;  # Early return
    }

    # Now we know it's Some, safe to extract
    return match (opt) {
        Option<int>.Some(x) => x,
        Option<int>.None => 0,  # Unreachable but needed for exhaustiveness
    };
}
```

### Validation

Validate enum state before you process it:

```adgLang
frame handleResponse(resp: Response<Data, Error>) ret bool {
    if (match<Response.Err>(resp)) {
        printf("Error occurred\n");
        return false;
    }

    # Continue with success case
    return true;
}
```

### Multiple Checks

Check several variants one after another:

```adgLang
frame classifyMessage(msg: Message) ret string {
    if (match<Message.Info>(msg)) {
        return "info";
    }
    if (match<Message.Warning>(msg)) {
        return "warning";
    }
    if (match<Message.Error>(msg)) {
        return "error";
    }
    return "unknown";
}
```

### Logical Expressions

Combine type checks with boolean logic:

```adgLang
frame isErrorOrWarning(msg: Message) ret bool {
    return match<Message.Error>(msg) || match<Message.Warning>(msg);
}

frame isSome(opt: Option<int>) ret bool {
    return match<Option.Some>(opt);
}
```

## Integration with Pattern Guards

`match<Type>` works cleanly with pattern guards in match expressions:

```adgLang
frame processValue(opt: Option<int>) ret int {
    # Use type matching for early check
    if (!match<Option.Some>(opt)) {
        return 0;
    }

    # Then use pattern guards for detailed matching
    return match (opt) {
        Option<int>.Some(x) if x > 0 => x,
        Option<int>.Some(x) if x < 0 => -x,
        Option<int>.Some(_) => 0,
        Option<int>.None => 0,
    };
}
```

## Working with Generic Enums

`match<Type>` fully supports generic enums:

```adgLang
enum Result<T, E> {
    Ok(T),
    Err(E),
}

frame isOk<T, E>(result: Result<T, E>) ret bool {
    return match<Result.Ok>(result);
}

frame main() ret int {
    local success: Result<int, string> = Result<int, string>.Ok(42);
    local failure: Result<int, string> = Result<int, string>.Err("failed");

    if (isOk<int, string>(success)) {
        printf("Success!\n");
    }

    if (!isOk<int, string>(failure)) {
        printf("Failure!\n");
    }

    return 0;
}
```

## Performance

`match<Type>` for enum variants is very efficient:

- Extracts the discriminant tag (single memory load)
- Compares it with the variant index (single comparison)
- Total: ~2-3 CPU instructions after LLVM optimization

That makes it suitable for hot code paths and performance-critical sections.

## Comparison with Pattern Matching

### When to use `match<Type>`

- Need a quick boolean check
- Want early returns based on a variant
- Need conditional logic without extracting data
- Want to combine multiple type checks with boolean operators
- Need validation before processing

### When to use pattern matching

- Need to extract variant data
- Have more complex branching with multiple cases
- Need pattern guards for value-based conditions
- Want exhaustiveness checking
- Prefer the more idiomatic style for variant handling

### Example Comparison

Using `match<Type>`:

```adgLang
if (match<Option.Some>(opt)) {
    # Still need another match to extract value
    local value: int = match (opt) {
        Option<int>.Some(x) => x,
        Option<int>.None => 0,  # unreachable
    };
}
```

Using pattern matching directly:

```adgLang
match (opt) {
    Option<int>.Some(x) => {
        # Have x directly available
        processValue(x);
    },
    Option<int>.None => {},
}
```

**Recommendation:** Use pattern matching when you need the data. Use `match<Type>` for quick checks or when combining it with other logic.

## Generic Type Checking

`match<Type>` supports checking generic parameters against concrete types. This works because adgLang uses monomorphization for generics, which means the compiler generates specialized versions of the function for each concrete type used.

```adgLang
frame processGeneric<T>(value: T) ret int {
    if (match<int>(value)) {
        # value is an int
        return 1;
    }
    if (match<float>(value)) {
        # value is a float
        return 2;
    }
    return -1;
}
```

This lets you write generic functions that behave differently depending on the concrete type of the argument.

## Limitations

1. **Enum variants:** Works with enum variant checking
2. **Primitive type checking:** Supported (e.g., `match<int>`)
3. **Struct type checking:** Supported (e.g., `match<MyStruct>`)
4. **Inheritance checking:** `match<BaseType>(derivedValue)` is not yet fully supported (checks for exact type match)

## See Also

- [Pattern Matching](07-control-flow.md#pattern-matching) - Complete guide to pattern matching
- [Enums](11-enums.md) - Enum declaration and usage
- [Generics](10-generics.md) - Generic types and functions
- [Pattern Guards](07-control-flow.md#pattern-guards) - Conditional patterns in match expressions
