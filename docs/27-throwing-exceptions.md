# Throwing Exceptions

You can throw an exception value of any type.

## Syntax

Use `throw` followed by an expression.

```adgLang
frame divide(a: int, b: int) ret int {
    if (b == 0) {
        throw "Division by zero";
    }
    return a / b;
}
```

## Propagation

Exceptions move up the call stack until a `try-catch` block catches them. If nothing catches the exception, the program stops.

## Runtime-Generated Exceptions

The compiler/runtime throws `NullAccessError` for you when you access a nullptr object. That error includes `message`, `function`, and `expression` fields so you can inspect what failed when you catch it.
