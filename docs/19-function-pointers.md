# Function Pointers

In adgLang, functions are first-class values. That means you can pass them around, return them, and keep them in variables.

## Type Syntax

`Func<ReturnType>(ArgType1, ArgType2, ...)`

## Example

```adgLang
frame add(a: int, b: int) ret int {
    return a + b;
}

frame apply(op: Func<int>(int, int), x: int, y: int) ret int {
    return op(x, y);
}

frame main() ret int {
    local f: Func<int>(int, int) = add;
    return apply(f, 10, 20);
}
```
