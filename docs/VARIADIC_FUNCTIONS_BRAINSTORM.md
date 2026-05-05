# Variadic Functions Brainstorming

This document looks at the design and implementation of two kinds of variadic functions in adgLang: **Homogeneous** (same type) and **Heterogeneous** (mixed types).

## 1. Homogeneous Variadics (Type-Safe Arrays)

This lets you pass a variable number of arguments of a _single specific type_.

### Syntax & Auto-Count Mechanism

The user wants a specific signature shape to enable variadic functions:

1. The **Variadic Parameter** (`name: ...Type`) needs to be the **second-to-last** argument.
2. The **Last Parameter** needs to be of type `int`. This parameter automatically receives the argument count.

```adgLang
# Definition
# 'numbers' will receive the pointer to the array
# 'count' will automatically receive the number of elements
frame sum(numbers: ...int, count: int) ret int {
    local total = 0;
    local i = 0;
    loop (i < count) {
        total += numbers[i];
        i += 1;
    }
    return total;
}

# Call site - User does NOT pass the count manually
sum(10, 20, 30);
# Compiler transforms this to: sum([10, 20, 30], 3)
```

### Implementation Strategy

**Compiler Transformation:**
When the compiler sees a call to a function matching this pattern (`...Type`, `int`):

1. **Stack Allocation:** Allocate a fixed-size array on the caller's stack that matches the number of variadic arguments.
2. **Population:** Write the arguments into this array.
3. **Argument Injection:**
 - Pass the pointer to the array as the variadic argument.
 - Pass the integer literal (length) as the final `count` argument.

**LLVM IR Representation:**
The function signature `frame sum(numbers: ...int, count: int)` becomes:

```llvm
define i64 @sum(i64* %numbers, i64 %count)
```

**Pros:**

- **Ergonomic:** The caller does not have to count arguments manually.
- **Flexible:** The user can name the count variable however they want (`len`, `count`, `size`).
- **Safe:** The count is guaranteed to match the array size.

---

## 2. Heterogeneous Variadics (Mixed Types)

This lets you pass a variable number of arguments of _any type_, with runtime type inspection.

### Syntax

```adgLang
# Definition
frame printMixed(args: ..., arg_count: int) {
    local i = 0;
    loop (i < arg_count) {
        if (args[i] is int) {
            printf("Int: %d\n", args[i] as int);
        } else if (args[i] is string) {
            printf("String: %s\n", args[i] as string);
        }
        i += 1;
    }
}

# Call site
printMixed(42, "Hello", 3.14);
# Compiler transforms to: printMixed([Box(42), Box("Hello"), Box(3.14)], 3)
```

### Implementation Strategy: The `Any` Type

To support this without C++-style template bloat, we need a "Type Erasure" mechanism. We can introduce an internal `Any` struct (or `Variant`) that carries type information.

**The `Any` Struct:**

```adgLang
struct Any {
    type_id: u64,   # Unique identifier for the type
    data: *void     # Pointer to the actual data
}
```

**Compiler Transformation:**
When calling `printMixed(2, 42, "Hello")`:

1. **Type ID Generation:** Make sure every type in the program has a unique compile-time ID (we already have `Type` struct, so this is close).
2. **Boxing/Wrapping:**
 - For `42` (int): Store `42` in a stack slot. Create `Any { type_id: INT_ID, data: &stack_slot }`.
 - For `"Hello"` (string): Create `Any { type_id: STRING_ID, data: &string_ptr }`.
3. **Array Creation:** Allocate an array of `Any` on the stack: `Any[2]`.
4. **Passing:** Pass the pointer to the `Any` array to the function.

**Runtime Type Checking (`is` / `match`):**

- `args[i] is int` compiles to: `args[i].type_id == INT_ID`.
- `args[i] as int` compiles to: `*(cast<*int>(args[i].data))`.

### Handling Primitives vs Structs

- **Primitives (int, float):** Need to live in a temporary stack slot so we can take their address for the `data` pointer.
- **Structs:** Can pass the pointer directly if it is already a pointer, or the address of a stack copy.
- **Small Optimization:** The `Any` struct could use "Small String Optimization" style storage. Instead of only `*void`, it could be a union of `*void` and `u64` so small primitives can be stored directly without indirection.

---

## 3. Unified Implementation Plan

### Phase 1: RTTI (Runtime Type Information)

We need a solid way to identify types at runtime.

- **Action:** Extend the global `Type` system to assign a unique `u64` ID to every concrete type used in the program.
- **Intrinsic:** Add `__type_id<T>()` intrinsic to get this ID at compile time.

### Phase 2: The `Any` Type

- **Action:** Add `std.types.Any` to the standard library.
- **Action:** Implement implicit conversion from `T` to `Any` (boxing).

### Phase 3: Variadic Syntax Support

- **Parser:** Support `...Type` and `...` syntax in function parameters.
- **Codegen:**
 - For `...Type`: Generate array of `Type`.
 - For `...`: Generate array of `Any`.
 - Handle the "call site transformation" (packing args into arrays).

### Phase 4: Pattern Matching on `Any`

- **Action:** Enable `match` expressions to work on `Any` types by checking the internal `type_id`.

## 4. Open Questions / Edge Cases

1. **Ownership:** Who owns the data pointed to by `Any`?
 - _Proposal:_ The caller owns it. The `Any` array is valid _only_ for the duration of the function call. Storing an `Any` for later use is unsafe unless we implement a heap-allocated `Box<Any>`.
2. **Count Parameter:**
 - Should `count` be mandatory? The compiler already knows the length of the array it created. It could pass it implicitly as a second hidden argument (like Go slices or Rust slices).
 - _Recommendation:_ Pass length implicitly. `args.len` should be available inside the function.
3. **Spread Operator:**
 - **Syntax:** Use the `...` suffix to expand an array into arguments: `sum(my_array...)`.
 - **Mixed Usage:** Can be mixed with literals: `sum(1, 2, my_array..., 3)`.
 - **Implementation:**
 - _Direct Pass:_ If the call is only `sum(my_array...)`, pass the array pointer and length directly (Zero Copy).
 - _Mixed:_ If mixed (`sum(1, arr...)`), allocate a new array on the stack, copy literals, and `memcpy` the array contents.

## 4. Interaction with Arrays and Slices

To make variadics and the spread operator fit together cleanly, we need to clarify the relationship between `Array<T>` (Heap Vector) and `T[]` (Slice/View).

### Definitions

- **`Array<T>`**: A heap-allocated, growable vector (ptr, len, cap). Owns the data.
- **`T[]` (Slice)**: A lightweight view into an array (ptr, len). Does **not** own the data.
- **`T[N]` (Fixed Array)**: A stack-allocated array of constant size N.

### Converting `Array<T>` to `T[]`

We should **avoid** Variable Length Arrays (VLAs) like `local arr: T[x.size]` on the stack because of stack overflow risk. Slices are the better fit here.

```adgLang
# x is Array<int>
local slice: int[] = x.toSlice(); # Returns { ptr: x.data, len: x.len }
```

### Using Slices with Variadics

Since our Homogeneous Variadic function expects `(ptr, len)`, passing a Slice is straightforward (Zero Copy).

```adgLang
frame sum(numbers: ...int, count: int) { ... }

local vec: Array<int> = ...;

# Spread operator calls __spread__ method if defined
# Array<T> implements __spread__ to return T[]
sum(vec...);
# Compiles to:
# local slice = vec.__spread__();
# sum(slice.ptr, slice.len);
```

### The `__spread__` Operator Method

To let `instance...` work for any type, not just Arrays, we can define a special operator method:

```adgLang
struct MyCollection {
    frame __spread__(this: MyCollection) ret int[] {
        # Return a slice or array
    }
}
```

### Handling Dynamic Generation (e.g., Ranges)

For types like `Range(1, 10)` that do not have a backing array, `__spread__` needs to generate one.

**Problem:** We cannot return a stack array `T[N]` because `N` is dynamic. We also cannot easily return a heap array without leaking memory (who frees it?).

**Solution: Caller-Allocated Buffer (The "C++" Way)**
Instead of having the callee (`Range`) allocate memory, the **caller** provides the memory.

1. **Size Query:** The compiler calls `range.size()` (or `__len__`) to determine how much memory is needed.
2. **Allocation:** The compiler allocates a buffer of that size (on stack via `alloca` or heap).
3. **Fill:** The compiler calls `range.fill(buffer_ptr)` (or `__spread_into__`) to populate it.

```adgLang
struct Range {
    frame __len__(this: Range) ret int { return this.end - this.start; }
    frame __spread_into__(this: Range, buffer: *int) {
        # Fill buffer with values
    }
}

sum(Range(1, 4)...);
# Compiler transforms to:
# 1. size = range.__len__()
# 2. buffer = alloca(size * sizeof(int))
# 3. range.__spread_into__(buffer)
# 4. sum(buffer, size)
```

**Comparison with other languages:**

- **C++:** Uses iterators (`begin`, `end`) for almost everything.
- **Rust:** Uses Iterators (`IntoIterator`).
- **Go:** Only lets you spread slices (`slice...`). You need to convert your custom type to a slice first.
- **Our Approach:** The "Caller-Allocated Buffer" is efficient (stack allocation is possible) and avoids the complexity of full iterator protocols for this specific use case.

## 5. RTTI and The `Any` Type

To support heterogeneous variadics (`args: ...`), we need a solid Runtime Type Information (RTTI) system and a generic container (`Any`).

### 5.1. RTTI Implementation

Every concrete type in the program gets a unique 64-bit ID at compile time.

**Type ID Generation:**

- **Compile-Time Hashing:** The compiler computes a stable hash of the type's fully qualified name and structure (e.g., `FNV-1a("std.collections.List<int>")`).
- **Collision Handling:** If two types hash to the same ID (rare), the compiler detects it and changes the seed.

**Metadata Storage:**
The compiler generates a read-only global table `__TYPE_METADATA` containing:

- Type Name (string)
- Size (int)
- Alignment (int)
- Pointer to VTable (if applicable)

**Intrinsics:**

- `__type_id<T>()`: Returns the `u64` ID of type `T`.
- `__type_name(id: u64)`: Returns the string name from the metadata table.

### 5.2. The `Any` Struct

The `Any` struct is the center of dynamic typing. It uses **Small Object Optimization (SOO)** so primitives do not need heap allocation.

```adgLang
struct Any {
    type_id: u64,
    data: u64      # Payload: Either a pointer OR the raw data
}
```

**Storage Rules:**

1. **Small Types (<= 64 bits):** `int`, `bool`, `char`, `float`, `*T`.
 - Stored _directly_ in the `data` field.
 - No extra allocation.
2. **Large Types (> 64 bits):** `structs`, `arrays`.
 - Stored on the stack (or heap), and `data` holds the _pointer_ to them.

**Boxing Logic (Compiler Generated):**

```adgLang
# User writes:
printMixed(42);

# Compiler generates:
local temp_any: Any;
temp_any.type_id = __type_id<int>();
temp_any.data = cast<u64>(42); # Direct storage
printMixed([temp_any], 1);
```

### 5.3. Pattern Matching on `Any`

We let `match` expressions inspect the `type_id` inside an `Any` value.

```adgLang
frame process(val: Any) {
    match (val) {
        int(i) => printf("Integer: %d\n", i),
        string(s) => printf("String: %s\n", s),
        Point(p) => printf("Point: %d, %d\n", p.x, p.y),
        _ => printf("Unknown type\n")
    }
}
```

**Desugaring:**
The compiler lowers the `match` into a switch on `val.type_id`:

```adgLang
switch (val.type_id) {
    case __type_id<int>(): {
        local i = cast<int>(val.data); # Direct unbox
        printf("Integer: %d\n", i);
    }
    case __type_id<string>(): {
        local s = cast<string>(val.data); # Direct unbox (string is a pointer)
        printf("String: %s\n", s);
    }
    case __type_id<Point>(): {
        local p_ptr = cast<*Point>(val.data); # Pointer unbox
        local p = *p_ptr;
        printf("Point: %d, %d\n", p.x, p.y);
    }
}
```

## 6. Example: `myPrintf` Implementation

With Heterogeneous Variadics, we can build a type-safe `printf` in adgLang using `Any` plus pattern matching.

```adgLang
# Note: 'args' is implicitly converted to 'Any[]' and 'count' is auto-filled
frame myPrintf(fmt: string, args: ..., count: int) {
    local arg_idx: int = 0;
    local i: int = 0;

    # Iterate over format string (simplified)
    loop (i < fmt.length()) {
        local c: char = fmt[i];

        if (c == '%') {
            i = i + 1;
            local specifier: char = fmt[i];

            if (arg_idx >= count) {
                throw "Not enough arguments";
            }

            local arg: Any = args[arg_idx];

            switch (specifier) {
                case 'd': {
                    match (arg) {
                        int(val) => printInt(val),
                        _ => throw "Type mismatch: expected int for %d"
                    }
                }
                case 's': {
                    match (arg) {
                        string(val) => printString(val),
                        _ => throw "Type mismatch: expected string for %s"
                    }
                }
                case 'v': {
                    # Generic printer using RTTI name
                    printString(__type_name(arg.type_id));
                    printString(": ");
                    # In a real impl, we'd have a recursive print function
                    printString("...");
                }
            }
            arg_idx = arg_idx + 1;
        } else {
            printChar(c);
        }
        i = i + 1;
    }
}

frame main() {
    myPrintf("Hello %s, count is %d\n", "World", 42);
}
```
