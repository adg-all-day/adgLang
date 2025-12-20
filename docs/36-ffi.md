# Foreign Function Interface (FFI)

adgLang can call functions implemented in C and other languages that use the C ABI.

## Declaring External Functions

Use the `extern` keyword.

```adgLang
extern frame printf(fmt: string, ...) ret int;
extern frame malloc(size: int) ret *void;
```

## Linking

When you compile, you need to link against the libraries that provide those external functions.
