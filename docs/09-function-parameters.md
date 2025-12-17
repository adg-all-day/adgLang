# Function Parameters

Functions in adgLang can accept parameters and return values.

## Parameters

You declare parameters with their types.

```adgLang
frame add(a: int, b: int) ret int {
    return a + b;
}
```

## Const Parameters

You can mark parameters as `const` so they can't be modified inside the function.

```adgLang
frame print(msg: const string) {
    # msg = "new string"; # Error: Cannot assign to const parameter
    printf("%s\n", msg);
}
```

## Return Values

Functions put the return type after the parameter list with `ret Type`. If a function returns nothing, use `ret void` or leave the return type out, which defaults to void.

```adgLang
frame log(msg: string) ret void {
    printf("%s\n", msg);
}
```

## Variadic Functions

adgLang supports two kinds of variadic functions: **FFI Variadics** for C compatibility and **Native Variadics** for type-safe argument packing.

### FFI Variadics

These are mainly for calling C functions such as `printf`.

```adgLang
extern frame printf(fmt: string, ...);
```

### Native Variadics

Native variadic functions let you take a variable number of arguments. The compiler automatically packs those arguments into an array and passes the count along with it.

#### Homogeneous Variadics (Same Type)

If you want multiple arguments of one type, use the `...Type` syntax.

**Requirements:**

1. The variadic parameter needs to be the **second-to-last** parameter.
2. The **last parameter** needs to be of type `int` (to receive the count).

```adgLang
# 'nums' receives a pointer to an array of ints
# 'count' receives the number of arguments passed
frame sum(...nums: int, count: int) ret int {
    local total: int = 0;
    local i: int = 0;
    loop (i < count) {
        total += nums[i];
        i += 1;
    }
    return total;
}

frame main() {
    # Called naturally:
    local s: int = sum(10, 20, 30, 40);
    # Compiler transforms to: sum([10, 20, 30, 40], 4)
}
```

#### Heterogeneous Variadics (Mixed Types)

If you want mixed argument types, use `...Any`. The compiler wraps each argument in an `Any` struct that carries its type ID and data.

```adgLang
# 'args' is an array of Any structs
frame printAll(...args: Any, count: int) {
    local i: int = 0;
    loop (i < count) {
        local arg: Any = args[i];
        # Use match<Type> or type_id to inspect
        if ((arg is int)) {
            printf("Int: %d\n", cast<int>(arg.data));
        } else if ((arg is string)) {
            printf("String: %s\n", cast<string>(arg.data));
        }
        i += 1;
    }
}

frame main() {
    printAll(42, "Hello", 3.14);
}
```
