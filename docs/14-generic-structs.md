# Generic Structs

Structs can also take type parameters.

## Syntax

```adgLang
struct Box<T> {
    value: T;
}

struct Pair<K, V> {
    key: K;
    value: V;
}
```

## Usage

```adgLang
local b: Box<int>;
b.value = 42;

local p: Pair<string, int>;
p.key = "age";
p.value = 30;
```
