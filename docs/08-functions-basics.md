# Functions - Basics

Functions, called "frames" in adgLang, are the main way to organize and reuse code. This guide covers the core pieces: declaring functions, defining them, calling them, and working with parameters and return values.

## Table of Contents

- [Function Declaration](#function-declaration)
- [Function Definition](#function-definition)
- [Calling Functions](#calling-functions)
- [Return Values](#return-values)
- [Parameters](#parameters)
- [Extern Functions](#extern-functions)
- [Forward Declarations](#forward-declarations)
- [Function Scope](#function-scope)

## Function Declaration

In adgLang, you declare functions with the `frame` keyword.

### Basic Syntax

```text
frame functionName(parameters) ret returnType {
    # Function body
}
```

**Components:**

- `frame`: adgLang's keyword for functions
- `functionName`: Identifier for the function
- `parameters`: Comma-separated list of typed parameters
- `ret returnType`: Return type specification
- `{ }`: Function body containing statements

### Simple Example

```adgLang
frame greet() ret void {
    printf("Hello!\n");
}
```

### With Parameters

```adgLang
frame add(a: int, b: int) ret int {
    return a + b;
}
```

### No Parameters

```adgLang
extern time(t: *void) ret long;

frame getCurrentTime() ret long {
    return time(nullptr);
}
```

## Function Definition

A full function definition includes both the signature and the body.

### Void Functions

Functions that return no value use `ret void`:

```adgLang
frame printMessage(msg: string) ret void {
    printf("%s\n", msg);
}

frame clearScreen() ret void {
    printf("Clear Screen\n");
}
```

**Returning from void functions:**

```adgLang
frame logError(code: int, msg: string) ret void {
    if (code == 0) {
        return;  # Early exit, no value needed
    }
    printf("Error %d: %s\n", code, msg);
}
```

### Returning Values

Functions must return a value that matches the declared type:

```adgLang
frame square(x: int) ret int {
    return x * x;
}

frame divide(a: float, b: float) ret float {
    if (b == 0.0) {
        return 0.0;  # Error handling
    }
    return a / b;
}
```

### Multiple Return Points

Functions can have more than one return statement:

```adgLang
frame max(a: int, b: int) ret int {
    if (a > b) {
        return a;
    }
    return b;
}

frame sign(x: int) ret int {
    if (x > 0) { return 1; }
    if (x < 0) { return -1; }
    return 0;
}
```

## Calling Functions

### Basic Call

```adgLang
frame greet() ret void {}
frame add(a: int, b: int) ret int { return a + b; }
frame square(a: int) ret int { return a * a; }
extern printf(fmt: string, ...);

frame main() ret int {
    local x: int = 3;
    local y: int = 4;

    # Call void function
    greet();

    # Call function and use return value
    local sum: int = add(5, 3);
    printf("%d\n", sum);

    # Call function in expression
    local result: int = square(x) + square(y);
    printf("%d\n", result);
    return 0;
}
```

### Chaining Calls

```adgLang
frame max(a: int, b: int) ret int { return a > b ? a : b; }
frame abs(a: int) ret int { return a < 0 ? -a : a; }
frame add(a: int, b: int) ret int { return a + b; }
frame divide(a: int, b: float) ret float { return cast<float>(a) / b; }
extern printf(fmt: string, ...);

frame main() ret int {
    local x: int = -5;
    local y: int = 10;
    local a: int = 10;
    local b: int = 20;

    # Result of one function used as argument to another
    local result: int = max(abs(x), abs(y));
    printf("%d\n", result);

    # Multiple calls in expression
    local avg: float = divide(add(a, b), 2.0);
    printf("%f\n", avg);
    return 0;
}
```

### Discarding Return Values

```adgLang
frame add(a: int, b: int) ret int { return a + b; }
extern printf(fmt: string, ...);

frame main() ret int {
    # Return value is discarded
    add(5, 3);  # Warning: unused return value

    # Common with I/O functions
    printf("Hello\n");  # Returns number of characters, usually ignored
    return 0;
}
```

## Return Values

### Primitive Types

```adgLang
frame getAge() ret int {
    return 25;
}

frame getPI() ret float {
    return 3.14159;
}

frame getInitial() ret char {
    return 'J';
}

frame isValid() ret bool {
    return true;
}
```

### Structs

Functions can return struct values:

```adgLang
struct Point {
    x: int,
    y: int
}

frame createPoint(x: int, y: int) ret Point {
    local p: Point;
    p.x = x;
    p.y = y;
    return p;  # Returns a copy
}

frame main() ret int {
    # Usage
    local p: Point = createPoint(10, 20);
    return p.x;
}
```

### Pointers

```adgLang
extern malloc(size: int) ret *void;

frame allocateBuffer(size: int) ret *char {
    return cast<*char>(malloc(size));
}

frame findMax(arr: *int, size: int) ret *int {
    if (size == 0) {
        return nullptr;
    }
    local maxPtr: *int = &arr[0];
    local i: int = 1;
    loop (i < size) {
        if (arr[i] > *maxPtr) {
            maxPtr = &arr[i];
        }
        i++;
    }
    return maxPtr;
}
```

**Important:** Returning pointers to local variables is undefined behavior:

```adgLang
extern malloc(size: int) ret *void;

# DANGEROUS - Returns pointer to local variable
frame getBadPointer() ret *int {
    local x: int = 42;
    return &x;  # x is destroyed when function returns!
}

# SAFE - Returns pointer to static or heap memory
frame getGoodPointer() ret *int {
    return cast<*int>(malloc(cast<int>(sizeof(int))));
}
```

### Arrays

Arrays cannot be returned directly. Return a pointer instead:

```text
# ERROR - Cannot return array
frame createArray() ret int[10] {
    local arr: int[10];
    return arr;  # ERROR
}
```

# CORRECT - Return pointer

```adgLang
extern malloc(size: int) ret *void;

frame createArray() ret *int {
    local arr: *int = cast<*int>(malloc(10 * cast<int>(sizeof(int))));
    local i: int = 0;
    loop (i < 10) {
        arr[i] = i;
        i++;
    }
    return arr;
}
```

## Parameters

### By Value

Parameters are passed by value by default, which means they are copied:

```adgLang
frame increment(x: int) ret void {
    x++;  # Modifies local copy, not original
}

local a: int = 5;
increment(a);
printf("%d\n", a);  # Prints 5, not 6
```

### By Pointer (Reference-like)

If you need to modify the original value, pass a pointer:

```adgLang
frame increment(x: *int) ret void {
    *x = *x + 1;  # Modifies original through pointer
}

local a: int = 5;
increment(&a);
printf("%d\n", a);  # Prints 6
```

### Multiple Parameters

```adgLang
frame printPoint(x: int, y: int, z: int) ret void {
    printf("(%d, %d, %d)\n", x, y, z);
}

frame calculateVolume(length: float, width: float, height: float) ret float {
    return length * width * height;
}
```

### Array Parameters

Arrays are passed as pointers:

```adgLang
frame sumArray(arr: *int, size: int) ret int {
    local total: int = 0;
    local i: int = 0;
    loop (i < size) {
        total += arr[i];
        i++;
    }
    return total;
}

# Usage
local numbers: int[5] = [1, 2, 3, 4, 5];
local sum: int = sumArray(numbers, 5);
```

**Array decay:**

```adgLang
frame printFirst(arr: int[10]) ret void {
    # arr decays to *int
    printf("%d\n", arr[0]);
}
```

### Struct Parameters

Structs can be passed by value or by pointer:

```adgLang
struct Point {
    x: int,
    y: int
}

# By value (copies the struct)
frame printPointByValue(p: Point) ret void {
    printf("(%d, %d)\n", p.x, p.y);
    p.x = 0;  # Doesn't affect original
}

# By pointer (no copy)
frame printPointByPointer(p: *Point) ret void {
    printf("(%d, %d)\n", p.x, p.y);
}

# By pointer for modification
frame move(p: *Point, dx: int, dy: int) ret void {
    p.x += dx;
    p.y += dy;
}
```

### Const Parameters

adgLang does not have `const`, so the usual convention is to pass large structs by pointer even when you do not plan to modify them:

```adgLang
struct Point {
    x: int,
    y: int
}

frame sqrt(x: float) ret float { return x; }

# Pass by pointer to avoid copying, but don't modify
frame getDistance(p1: *Point, p2: *Point) ret float {
    local dx: int = p1.x - p2.x;
    local dy: int = p1.y - p2.y;
    return sqrt(cast<float>(dx * dx + dy * dy));
}
```

## Extern Functions

Use `extern` for functions defined somewhere else, such as the C standard library:

### Standard Library Functions

```adgLang
# <stdio.h>
# extern printf(format: string, ...) ret int;
extern scanf(format: string, ...) ret int;
extern fopen(filename: string, mode: string) ret *void;
extern fclose(file: *void) ret int;

# <stdlib.h>
extern malloc(size: int) ret *void;
extern free(ptr: *void) ret void;
extern exit(code: int) ret void;

# <string.h>
extern strlen(str: string) ret int;
extern strcpy(dest: string, src: string) ret string;
extern strcmp(s1: string, s2: string) ret int;

# <math.h>
extern sqrt(x: float) ret float;
extern pow(base: float, exp: float) ret float;
extern sin(x: float) ret float;
```

### Variadic Functions

Functions with variable arguments use `...`:

```adgLang
extern printf(fmt: string, ...);

frame main() ret int {
    local x: int = 10;
    local y: int = 20;
    printf("Hello\n");
    printf("Value: %d\n", 42);
    printf("x=%d, y=%d\n", x, y);
    return 0;
}
```

**Note:** adgLang does not support defining your own variadic functions, only calling extern ones.

### Linking

Extern functions need to be available at link time:

```sh
# Link with math library
adgLang compile -o program main.adg -lm

# Link with custom library
adgLang compile -o program main.adg -L./lib -lmylib
```

## Forward Declarations

adgLang requires a function to be declared before it is used. Use forward declarations when you need them:

### Basic Forward Declaration

```adgLang
frame main() ret int {
    local result: int = helper(5);  # Can call before definition
    return result;
}

# Actual definition
frame helper(x: int) ret int {
    return x * 2;
}
```

### Mutual Recursion

Forward declarations make mutual recursion possible:

```adgLang
frame isEven(n: int) ret bool {
    if (n == 0) { return true; }
    return isOdd(n - 1);
}

frame isOdd(n: int) ret bool {
    if (n == 0) { return false; }
    return isEven(n - 1);
}
```

### Circular Dependencies

```adgLang
frame processB(x: int) ret int {
    if (x < 0) {
        return processA(-x);
    }
    return x * 2;
}

frame processA(x: int) ret int {
    if (x > 10) {
        return processB(x - 10);
    }
    return x + 1;
}
```

## Function Scope

### Local Variables

Variables declared inside a function stay local to that function:

```adgLang
frame example() ret void {
    local x: int = 10;  # Local to example()
    local y: int = 20;  # Local to example()
    local z: int = x + y;
    if (z > 0) { return; }
}

# ERROR: x and y are not accessible here
```

### Nested Scopes

```adgLang
frame demo() ret void {
    local x: int = 10;

    if (true) {
        local y: int = 20;  # Scoped to if block
        printf("%d %d\n", x, y);  # Can access both
    }

    # ERROR: y is not accessible here
    printf("%d\n", x);  # OK
}
```

### Parameter Scope

Parameters are scoped to the function body:

```adgLang
frame process(data: *int, size: int) ret void {
    # data and size are accessible throughout function
    local i: int = 0;
    loop (i < size) {
        printf("%d\n", data[i]);
        i++;
    }
}
```

### Static Variables

adgLang does not have static local variables. Use globals when you need that behavior:

```adgLang
global callCount: int = 0;

frame increment() ret void {
    callCount++;
    printf("Called %d times\n", callCount);
}
```

## Common Patterns

### Swap Function

```adgLang
frame swap(a: *int, b: *int) ret void {
    local temp: int = *a;
    *a = *b;
    *b = temp;
}

# Usage
local x: int = 5;
local y: int = 10;
swap(&x, &y);
printf("x=%d, y=%d\n", x, y);  # x=10, y=5
```

### Min/Max Functions

```adgLang
frame min(a: int, b: int) ret int {
    return (a < b) ? a : b;
}

frame max(a: int, b: int) ret int {
    return (a > b) ? a : b;
}

frame clamp(value: int, low: int, high: int) ret int {
    return max(low, min(value, high));
}
```

### Validation Functions

```adgLang
extern strchr(s: string, c: int) ret *char;

frame isValidAge(age: int) ret bool {
    return age >= 0 && age <= 150;
}

frame isValidEmail(email: string) ret bool {
    # Simplified validation
    return strchr(email, '@') != nullptr;
}
```

### Initialization Functions

```adgLang
struct Config {
    width: int,
    height: int,
    fullscreen: bool
}

frame initConfig(cfg: *Config) ret void {
    cfg.width = 800;
    cfg.height = 600;
    cfg.fullscreen = false;
}

frame main() ret int {
    # Usage
    local cfg: Config;
    initConfig(&cfg);
    return 0;
}
```

## Best Practices

1. **One purpose per function** - A function should do one job well
2. **Descriptive names** - Prefer verb phrases like `calculateTotal` and `validateInput`
3. **Limit parameters** - More than 4-5 parameters often means refactoring is needed
4. **Limit length** - Functions longer than 50 lines often want splitting
5. **Use pointers for large structs** - Avoid copying a lot of data
6. **Check pointer parameters** - Make sure pointers are not `nullptr` before dereferencing
7. **Return early** - Exit fast for error cases
8. **Consistent return** - Every path in a non-void function should return a value
9. **Avoid side effects** - Keep functions predictable
10. **Document complex functions** - Add comments for algorithms or edge cases

## Common Mistakes

### Returning Local Address

```adgLang
# WRONG
frame getBadPointer() ret *int {
    local x: int = 42;
    return &x;  # Dangling pointer!
}

extern malloc(size: int) ret *void;

# CORRECT
frame getGoodPointer() ret *int {
    return cast<*int>(malloc(cast<int>(sizeof(int))));
}
```

### Not Returning a Value

```text
# ERROR: Control reaches end of non-void function
frame calculate(x: int) ret int {
    if (x > 0) {
        return x * 2;
    }
    # Missing return for x <= 0 case!
}
```

# CORRECT

```adgLang
frame calculate(x: int) ret int {
    if (x > 0) {
        return x * 2;
    }
    return 0;  # Handle all cases
}
```

### Passing Large Structs by Value

```adgLang
struct LargeData {
    values: int[1000]
}

# Inefficient: Copies 4000 bytes
frame process(data: LargeData) ret void {
    local val: int = data.values[0];
    printf("%d", val);
}

# Efficient: Passes pointer (8 bytes)
frame process(data: *LargeData) ret void {
    local val: int = data.values[0];
    printf("%d", val);
}
```

## Next Steps

- [Functions Advanced](09-functions-advanced.md) - Overloading, recursion, function pointers
- [Structs](11-structs.md) - Defining and using structures
- [Pointers](15-pointers.md) - Deep dive into pointer operations
