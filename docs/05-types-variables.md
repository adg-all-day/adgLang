# Types and Variables

This guide covers adgLang's type system features and variable declarations end to end.

## Table of Contents

- [Primitive Types](#primitive-types)
- [Composite Types](#composite-types)
- [Variable Declarations](#variable-declarations)
- [Type Inference](#type-inference)
- [Type Conversions](#type-conversions)

## Primitive Types

adgLang gives you a set of built-in primitive types for the core data you work with most.

### Integer Types

adgLang supports signed and unsigned integers in multiple sizes:

| Type  | Size   | Range             | LLVM Type | Aliases         |
| ----- | ------ | ----------------- | --------- | --------------- |
| `i8`  | 8-bit  | -128 to 127       | `i8`      | `char` (signed) |
| `u8`  | 8-bit  | 0 to 255          | `i8`      | `uchar`         |
| `i16` | 16-bit | -32,768 to 32,767 | `i16`     | `short`         |
| `u16` | 16-bit | 0 to 65,535       | `i16`     | `ushort`        |
| `i32` | 32-bit | -2³¹ to 2³¹-1     | `i32`     | `int`           |
| `u32` | 32-bit | 0 to 2³²-1        | `i32`     | `uint`          |
| `i64` | 64-bit | -2⁶³ to 2⁶³-1     | `i64`     | `long`          |
| `u64` | 64-bit | 0 to 2⁶⁴-1        | `i64`     | `ulong`         |

**Examples:**

```adgLang
# Using explicit sizes
local small: i8 = 100;
local medium: i16 = 30000;
local large: i32 = 2000000;
local huge: i64 = 9000000000;

# Using aliases (more common)
local count: int = 42;           # i32
local index: uint = 0;           # u32
local timestamp: long = 1234567890;  # i64

# Character as integer
local ch: char = 65;  # ASCII 'A'
```

**Important Notes:**

- The default integer type is `int` (32-bit signed)
- Arithmetic can overflow and wrap around
- There is no automatic bounds checking
- Mixing signed and unsigned values requires an explicit cast

### Floating-Point Types

| Type  | Size   | Precision          | LLVM Type | Alias    |
| ----- | ------ | ------------------ | --------- | -------- |
| `f32` | 32-bit | ~7 decimal digits  | `float`   | `float`  |
| `f64` | 64-bit | ~15 decimal digits | `double`  | `double` |

**Examples:**

```adgLang
local pi: float = 3.14159;       # f32
local precise: double = 3.141592653589793;  # f64
local small: float = 0.0001;
local big: double = 1.7e308;     # NOTE: scientific notation not yet supported

# Arithmetic
local sum: float = 1.5 + 2.5;    # 4.0
local product: float = 2.0 * 3.0;  # 6.0
```

**Important Notes:**

- The default floating-point type is `double` (64-bit)
- It follows the IEEE 754 standard
- Floating-point precision issues still apply
- Equality checks on floats (`==`) can be unreliable

### Boolean Type

Single bit, represented as `i1` in LLVM:

```adgLang
local isTrue: bool = true;
local isFalse: bool = false;

# From comparisons
local isGreater: bool = (5 > 3);    # true
local isEqual: bool = (1 == 2);     # false

# Logical operations
local both: bool = true && false;    # false
local either: bool = true || false;  # true
local not: bool = !true;             # false
```

**Important Notes:**

- `true` and `false` are the only boolean literals
- Integers do **not** auto-convert to bool
- Write explicit comparisons like `if (x != 0)`, not `if (x)`

### Character Type

8-bit unsigned integer, usually used for ASCII characters:

```adgLang
local letter: char = 'A';        # ASCII 65
local digit: char = '5';         # ASCII 53
local newline: char = '\n';      # Escape sequence

# Characters are just numbers
local num: int = cast<int>(letter);  # 65
printf("Letter: %c, Value: %d\n", letter, num);  # Letter: A, Value: 65
```

**Escape Sequences:**

- `\n` - Newline (LF)
- `\t` - Tab
- `\r` - Carriage return
- `\\` - Backslash
- `\'` - Single quote
- `\0` - Null terminator

### Void Type

Represents the absence of a value and is used for function return types:

```adgLang
# Function that doesn't return a value
frame printMessage(msg: string) ret void {
    printf("%s\n", msg);
    # No return statement needed
}

# Or explicitly return void
frame doNothing() ret void {
    return;  # Optional
}
```

**Important Notes:**

- You cannot declare variables of type `void`
- It is only used as a return type
- `main()` conventionally returns `int`, not `void`

### Nullptr Types

#### nullptr

Generic nullptr value:

```adgLang
local ptr: *int = nullptr;
```

#### nullptr

Type-safe nullptr specifically for pointers:

```adgLang
local ptr: *char = nullptr;
```

**Difference:**

- `nullptr` is the more type-safe option and is preferred for pointers

## Composite Types

### Pointer Types

Pointers store memory addresses:

```adgLang
# Pointer to int
local ptr: *int;

# Pointer to pointer (double indirection)
local pptr: **int;

# Pointer to struct
struct Point { x: int, y: int }
local p: *Point;

# Void pointer (points to any type)
local vptr: *void;
```

**Operations:**

```adgLang
local value: int = 42;
local ptr: *int = &value;     # Address-of operator
local deref: int = *ptr;      # Dereference operator

# Pointer arithmetic
ptr = ptr + 1;                # Move to next int
```

See [Pointers](15-pointers.md) for complete details.

### Array Types

Arrays can be fixed-size or dynamic:

```adgLang
# Fixed-size array
local arr: int[10];           # Array of 10 integers

# Dynamic array (pointer)
local dynArr: int[];          # Actually a pointer: *int

# Multi-dimensional arrays
local matrix: int[3][3];      # 3x3 matrix
```

**Access:**

```adgLang
arr[0] = 10;
local first: int = arr[0];
```

See [Arrays](16-arrays.md) for complete details.

### Tuple Types

Tuples group multiple values of different types:

```adgLang
# Tuple type with two elements
local pair: (int, bool);
pair = (42, true);

# Tuple with three elements
local triple: (int, float, bool) = (1, 3.14, false);

# Accessing elements (via destructuring)
local (a: int, b: bool) = pair;
printf("a=%d, b=%d\n", a, b);
```

See [Tuples](17-tuples.md) for complete details.

### Function Pointer Types

Function pointers let you store functions in variables:

```adgLang
# Function that takes two ints and returns int
local funcPtr: Func<int>(int, int);

# Assign a function to it
frame add(a: int, b: int) ret int {
    return a + b;
}
funcPtr = add;

# Call through pointer
local result: int = funcPtr(5, 3);  # 8
```

See [Function Pointers](19-function-pointers.md) for complete details.

### User-Defined Types (Structs)

These are your custom data structures:

```adgLang
struct Person {
    name: string,
    age: int,
    height: float
}

local p: Person;
p.name = "Alice";
p.age = 30;
p.height = 5.6;
```

See [Structs](11-structs.md) for complete details.

### Generic Types

Parameterized types:

```adgLang
# Generic struct
struct Box<T> {
    value: T
}

local intBox: Box<int>;
intBox.value = 42;

local floatBox: Box<float>;
floatBox.value = 3.14;
```

See [Generic Structs](14-generic-structs.md) for complete details.

## Variable Declarations

### Local Variables

Local variables are declared inside function scope:

```adgLang
frame myFunction() ret void {
    # Must use 'local' keyword
    local x: int;              # Declare without initialization
    local y: int = 10;         # Declare with initialization
    local z: int = x + y;      # Initialize with expression

    # Multiple declarations
    local a: int = 1;
    local b: int = 2;
    local c: int = 3;
}
```

**Scope Rules:**

Variables are scoped to the block where they are declared. Inner blocks can shadow names from outer blocks.

```adgLang
frame scopeExample() ret void {
    local x: int = 1;

    if (true) {
        local x: int = 2;      # Shadows outer x
        printf("%d\n", x);     # Prints: 2
    }

    # Anonymous block for scoping
    {
        local x: string = "shadow"; # Shadows outer x with different type
        printf("%s\n", x);          # Prints: shadow
    }

    printf("%d\n", x);         # Prints: 1
}
```

### Constants

Use the `const` keyword to declare immutable variables. Once initialized, the value cannot change.

```adgLang
global const INT_MAX: int = 2147483647;
local const PI: float = 3.14159;
local const MAX_RETRIES: int = 3;

# Error: Cannot assign to const variable
# PI = 3.14;
```

### Global Variables

Global variables are declared at module scope:

```adgLang
# Must use 'global' keyword
global MAX_SIZE: int = 100;
global PI: float = 3.14159;
global initialized: bool = false;

frame main() ret int {
    # Access global variables
    printf("Max: %d\n", MAX_SIZE);

    # Modify global variables
    initialized = true;

    return 0;
}
```

**Important Notes:**

- Globals are initialized before `main()` runs
- Every function in the module can see them
- They can be exported to other modules
- Overusing them makes code harder to reason about

### Type Annotations

Variables need explicit type annotations:

```adgLang
# ✅ Correct - explicit type
local x: int = 42;

# ❌ Wrong - missing type
local x = 42;  # Compile error

# ✅ Type can be on right side (in some contexts)
local (x: int, y: bool) = getTuple();
```

**Exception:** Tuple destructuring can infer from the right-hand side in some cases, but being explicit is still clearer.

### Initialization

Variables can be declared either with or without an initializer:

```adgLang
# Uninitialized (contains garbage)
local x: int;

# Initialized
local y: int = 0;

# Initialize from expression
local z: int = someFunction();
```

**Warning:** Uninitialized variables hold undefined values. Initialize them before use:

```adgLang
# ❌ Dangerous - x contains garbage
local x: int;
printf("%d\n", x);  # Undefined behavior

# ✅ Safe
local x: int = 0;
printf("%d\n", x);  # Prints: 0
```

### Tuple Destructuring

Use tuple destructuring to unpack multiple values at once:

```adgLang
# Function returns tuple
frame getCoordinates() ret (int, int) {
    return (10, 20);
}

# Destructure into separate variables
local (x: int, y: int) = getCoordinates();
printf("x=%d, y=%d\n", x, y);  # x=10, y=20

# Swap variables using tuples
local a: int = 1;
local b: int = 2;
(a, b) = (b, a);  # a=2, b=1
```

See [Tuples](17-tuples.md) for more details.

### Constants

adgLang does not have a dedicated `const` keyword yet. Use naming conventions instead:

```adgLang
# Convention: UPPER_CASE for constants
global MAX_CONNECTIONS: int = 100;
global DEFAULT_TIMEOUT: int = 30;

frame main() ret int {
    local BUFFER_SIZE: int = 1024;  # Conventionally constant
    # ...
}
```

## Type Inference

adgLang has **limited** type inference:

```adgLang
# ❌ No inference for simple variables
local x = 42;  # Error: type required

# ✅ Some inference in generic contexts
local box: Box<int>;
box.value = 42;  # Compiler knows value is int

# ✅ Return type inference in some cases
frame identity<T>(val: T) ret T {
    return val;  # Return type inferred as T
}
```

**Philosophy:** adgLang prefers explicitness over brevity to keep code clearer.

## Type Conversions

### Implicit Conversions

adgLang allows only a small set of implicit conversions:

```adgLang
# ✅ Numeric widening (smaller to larger)
local i: i32 = 42;
local l: i64 = i;  # i32 → i64 allowed

# ✅ Array to pointer decay
local arr: int[10];
local ptr: *int = arr;  # array → pointer

# ❌ No narrowing without cast
local l: i64 = 1000;
local i: i32 = l;  # Error: i64 → i32 requires cast

# ❌ No sign conversions
local i: int = -1;
local u: uint = i;  # Error: requires cast
```

### Explicit Conversions (Casting)

Use `cast<TargetType>(value)` when you need an explicit conversion:

```adgLang
# Number type conversions
local f: float = 3.14;
local i: int = cast<int>(f);  # 3 (truncates)

local i64: i64 = 1000000;
local i32: i32 = cast<i32>(i64);  # Narrowing

# Pointer conversions
local ptr: *void;
local intPtr: *int = cast<*int>(ptr);

# Sign conversions
local signed: int = -1;
local unsigned: uint = cast<uint>(signed);
```

**Warning:** Casts bypass type safety. Use them carefully:

```adgLang
# Dangerous: casting between incompatible types
local x: int = 42;
local ptr: *float = cast<*float>(&x);  # Reinterprets memory!
```

See [Casting](15-casting.md) for complete details.

### Type Aliases

Use type aliases to create alternate names for types:

```adgLang
# Simple alias
type ID = int;
type Username = string;

local userId: ID = 42;
local name: Username = "alice";

# Complex type aliases
type Callback = Func<void>(int);
type Point2D = (int, int);
type Matrix = float[3][3];

# Generic type alias
type Pair<T> = (T, T);
local coords: Pair<int> = (10, 20);
```

See [Type Aliases](18-type-aliases.md) for complete details.

## Type Checking

adgLang is **statically typed**, so all types are checked at compile time:

```adgLang
local x: int = 42;
local s: string = "hello";

# ✅ Type-safe operations
local y: int = x + 10;

# ❌ Type errors caught at compile time
local z: int = x + s;  # Error: cannot add int and string
if (x) { }             # Error: condition must be bool, not int
```

## Sizeof Operator

Get the size of a type or expression:

```adgLang
local size: i64 = sizeof(int);       # Size of int type (4 bytes)
local structSize: i64 = sizeof(Person);  # Size of struct

local x: int = 42;
local varSize: i64 = sizeof(x);      # Size of variable's type (4)

# Use for allocation
extern malloc(size: i64) ret *void;
local ptr: *int = cast<*int>(malloc(sizeof(int) * 10));  # Array of 10 ints
```

## Type Compatibility

### Assignment Compatibility

```adgLang
# ✅ Compatible: same type
local a: int = 42;
local b: int = a;

# ✅ Compatible: with implicit conversion
local c: i32 = 42;
local d: i64 = c;  # Widening allowed

# ❌ Incompatible: different types
local e: int = 42;
local f: float = e;  # Error: requires cast
```

### Function Argument Compatibility

```adgLang
frame process(x: int) ret void { }

local a: int = 42;
process(a);         # ✅ Exact match

local b: i8 = 10;
process(b);         # ✅ Implicit widening

local c: i64 = 100;
process(c);         # ❌ Error: narrowing requires cast
```

## Best Practices

### 1. Choose Appropriate Types

```adgLang
# ✅ Use smallest type that fits
local age: i8 = 25;        # 0-127 is plenty
local count: i32 = 1000;   # Default int

# ❌ Don't waste space
local age: i64 = 25;       # Overkill for age
```

### 2. Initialize Variables

```adgLang
# ✅ Always initialize
local count: int = 0;

# ❌ Dangerous
local count: int;  # Uninitialized!
```

### 3. Use Type Aliases for Clarity

```adgLang
# ❌ Unclear
frame processUser(id: int, role: int) ret void { }

# ✅ Clear
type UserID = int;
type UserRole = int;
frame processUser(id: UserID, role: UserRole) ret void { }
```

### 4. Prefer Explicit Types

```adgLang
# ✅ Explicit and clear
local count: int = 0;

# Even when longer
local coordinates: (int, int) = (0, 0);
```

### 5. Use const Convention

```adgLang
# ✅ UPPER_CASE for constants
global MAX_USERS: int = 1000;

# ✅ camelCase or snake_case for variables
local userCount: int = 0;
local user_count: int = 0;
```

## Common Pitfalls

### 1. Forgetting 'local' or 'global'

```adgLang
# ❌ Error
x: int = 42;

# ✅ Correct
local x: int = 42;
```

### 2. Uninitialized Variables

```adgLang
# ❌ Dangerous
local x: int;
printf("%d\n", x);  # Undefined!

# ✅ Safe
local x: int = 0;
```

### 3. Integer Overflow

```adgLang
local x: i8 = 127;
x = x + 1;  # Wraps to -128 (undefined behavior in C)
```

### 4. Float Comparison

```adgLang
# ❌ Unreliable
local a: float = 0.1 + 0.2;
if (a == 0.3) { }  # May be false!

# ✅ Use epsilon comparison
local epsilon: float = 0.0001;
if (a >= 0.3 - epsilon && a <= 0.3 + epsilon) { }
```

## Summary

**Key Points:**

- adgLang is statically typed and uses explicit declarations
- Primitive types include integers, floats, booleans, and characters
- Composite types include pointers, arrays, tuples, and structs
- Variables need to be declared with `local` or `global`
- Type inference is limited, so explicit code is the norm
- Use `cast<Type>()` for explicit conversions

**Next Steps:**

- [Operators](06-operators.md) - Learn about type operations
- [Pointers](15-pointers.md) - Deep dive into pointers
- [Structs](11-structs.md) - Create custom types

## Examples

See these examples:

- `examples/primitives/` - Basic types
- `examples/variables/` - Variable declarations
- `examples/type_aliases/` - Type aliases
- `examples/casts/` - Type casting
