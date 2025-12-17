# Control Flow

Control flow decides the order your code runs in. adgLang gives you the usual control structures, with a few syntax choices of its own.

## Table of Contents

- [If Statements](#if-statements)
- [Loop Statements](#loop-statements)
- [Switch Statements](#switch-statements)
- [Match Expressions](#match-expressions)
- [Break and Continue](#break-and-continue)
- [Return Statement](#return-statement)
- [Anonymous Blocks](#anonymous-blocks)

## If Statements

### Basic If

```adgLang
local condition: bool = true;
if (condition) {
    # Execute if condition is true
}
```

Example:

```adgLang
local age: int = 20;

if (age >= 18) {
    printf("You are an adult\n");
}
```

### If-Else

```adgLang
local condition: bool = true;
if (condition) {
    # Execute if true
} else {
    # Execute if false
}
```

Example:

```adgLang
local temperature: int = 35;
if (temperature > 30) {
    printf("It's hot\n");
} else {
    printf("It's not hot\n");
}
```

### Else-If Chains

```adgLang
local condition1: bool = false;
local condition2: bool = true;
local condition3: bool = false;

if (condition1) {
    # Execute if condition1 is true
} else if (condition2) {
    # Execute if condition1 is false and condition2 is true
} else if (condition3) {
    # Execute if conditions 1 and 2 are false, and condition3 is true
} else {
    # Execute if all conditions are false
}
```

Example:

```adgLang
local score: int = 85;
if (score >= 90) {
    printf("Grade: A\n");
} else if (score >= 80) {
    printf("Grade: B\n");
} else if (score >= 70) {
    printf("Grade: C\n");
} else if (score >= 60) {
    printf("Grade: D\n");
} else {
    printf("Grade: F\n");
}
```

### Nested If Statements

```adgLang
local hasAccount: bool = true;
local isLoggedIn: bool = true;
local hasPermission: bool = true;

if (hasAccount) {
    if (isLoggedIn) {
        if (hasPermission) {
            printf("Access granted\n");
        } else {
            printf("Insufficient permissions\n");
        }
    } else {
        printf("Please log in\n");
    }
} else {
    printf("Please create an account\n");
}
```

**Better alternative using logical operators:**

```adgLang
local hasAccount: bool = true;
local isLoggedIn: bool = true;
local hasPermission: bool = true;

if (hasAccount && isLoggedIn && hasPermission) {
    printf("Access granted\n");
} else if (hasAccount && isLoggedIn) {
    printf("Insufficient permissions\n");
} else if (hasAccount) {
    printf("Please log in\n");
} else {
    printf("Please create an account\n");
}
```

### Truthiness in Conditions

Conditions are treated as "truthy" with these rules:

```adgLang
# Numbers: 0 is false, non-zero is true
local x: int = 5;
if (x != 0) {  # true
    printf("x is non-zero\n");
}

# Pointers: nullptr is false, non-nullptr is true
local p: *int = nullptr;
if (p != nullptr) {  # false
    printf("p is not nullptr\n");
}

# Explicit comparison (preferred for clarity)
if (x != 0) {  # true
    printf("x is non-zero\n");
}

if (p != nullptr) {  # false
    printf("p is not nullptr\n");
}
```

### Single-Statement Bodies

Braces are **required**, even for a single statement:

```adgLang
local x: int = 1;

# CORRECT
if (x > 0) {
    x = x + 1;
}

# INCORRECT - will not compile
# if (x > 0)
#    x = x + 1;
```

This avoids common mistakes such as the "dangling else" problem.

## Loop Statements

adgLang uses the `loop` keyword for several different loop forms.

### Infinite Loop

```adgLang
frame shouldStop() ret bool { return true; }

loop {
    # Loops forever until break
    if (shouldStop()) {
        break;
    }
}
```

### While-Style Loop

This is the equivalent of a `while` loop in other languages.

```adgLang
local i: int = 0;
loop (i < 5) {
    printf("%d\n", i);
    i = i + 1;
}
```

### C-Style For Loop

adgLang also supports classic C-style `for` loop syntax with `loop (init; condition; step)`.

```adgLang
# Standard iteration
loop (local i: int = 0; i < 10; i = i + 1) {
    printf("%d\n", i);
}

# Loop with existing variable
local j: int = 0;
loop (; j < 5; j = j + 1) {
    printf("%d\n", j);
}

# Loop with missing parts (equivalent to while or infinite loop)
loop (; i < 10;) { ... }
loop (;;) { ... }
```

**Scoping:** The initialization variable, for example `local i: int = 0`, is scoped to the loop block and is not visible outside it.

### Condition-Based Loop

```adgLang
local condition: bool = false;
loop (condition) {
    # Execute while condition is true
}
```

Example:

```adgLang
local count: int = 0;
loop (count < 10) {
    printf("Count: %d\n", count);
    count++;
}
```

Example:

```adgLang
local i: int = 0;
loop (i < 10) {
    printf("i = %d\n", i);
    i = i + 1;
}
```

**Parts:**

1. **Initialization:** Runs once before the loop starts
2. **Condition:** Checked before each iteration
3. **Increment:** Runs after each iteration

### Loop Variables

Variables used by the loop condition need to be declared before the loop:

```adgLang
local i: int = 0;
loop (i < 5) {
    printf("%d\n", i);
    i = i + 1;
}

# i is accessible here
printf("Final: %d\n", i);
```

### Common Loop Patterns

**Counting up:**

```adgLang
local n: int = 10;
local i: int = 0;
loop (i < n) {
    # Executes n times: i = 0, 1, 2, ..., n-1
    i = i + 1;
}
```

**Counting down:**

```adgLang
local n: int = 10;
local i: int = n - 1;
loop (i >= 0) {
    # Executes n times: i = n-1, n-2, ..., 1, 0
    i = i - 1;
}
```

**Iterating array:**

```adgLang
local arr: int[10];
local i: int = 0;
loop (i < 10) {
    arr[i] = i * i;
    i = i + 1;
}
```

**Iterating with pointer:**

```adgLang
local arr: int[10];
local ptr: *int = &arr[0];
local end: *int = &arr[10];

loop (ptr < end) {
    *ptr = 0;
    ptr = &ptr[1];
}
```

**Processing until sentinel:**

```adgLang
extern getchar() ret char;
frame processChar(c: char) { c; }

local ch: char = getchar();
loop (ch != '\n') {
    processChar(ch);
    ch = getchar();
}
```

### Nested Loops

```adgLang
# Print multiplication table
local i: int = 1;
loop (i <= 10) {
    local j: int = 1;
    loop (j <= 10) {
        printf("%4d", i * j);
        j = j + 1;
    }
    printf("\n");
    i = i + 1;
}
```

## Switch Statements

Switch statements let you branch across multiple cases from one value. In adgLang, every case block must end explicitly.

### Strict Termination

Each case in a `switch` statement must end with a terminator:

- `break`: Exit the switch statement.
- `fallthrough`: Explicitly continue execution to the next case.
- `return`, `throw`, `continue`: Other standard control flow terminators.

This avoids the accidental fallthrough bugs common in C-like languages.

### Basic Switch

```adgLang
local expression: int = 1;

switch (expression) {
    case 1: {
        # Execute if expression == 1
        break;
    }
    case 2: {
        # Execute if expression == 2
        break;
    }
    default: {
        # Execute if no case matches
        break;
    }
}
```

### Integer Switch

```adgLang
local day: int = 3;

switch (day) {
    case 1: {
        printf("Monday\n");
        break;
    }
    case 2: {
        printf("Tuesday\n");
        break;
    }
    case 3: {
        printf("Wednesday\n");
        break;
    }
    case 4: {
        printf("Thursday\n");
        break;
    }
    case 5: {
        printf("Friday\n");
        break;
    }
    case 6: {
        printf("Saturday\n");
        break;
    }
    case 7: {
        printf("Sunday\n");
        break;
    }
    default: {
        printf("Invalid day\n");
        break;
    }
}
```

### Fallthrough

If you want shared handling or an intentional fallthrough, use the `fallthrough` keyword:

```adgLang
switch (x) {
    case 1:
    case 2:
    case 3: {
        printf("1, 2, or 3\n");
        break;
    }
    case 4: {
        printf("4");
        fallthrough;
    }
    case 5: {
        printf(" (and maybe 5)\n");
        break;
    }
}
```

### Character Switch

```adgLang
local op: char = '+';
local a: int = 10;
local b: int = 20;
local result: int = 0;

switch (op) {
    case '+': {
        result = a + b;
        break;
    }
    case '-': {
        result = a - b;
        break;
    }
    case '*': {
        result = a * b;
        break;
    }
    case '/': {
        result = a / b;
        break;
    }
    default: {
        printf("Unknown operator\n");
        break;
    }
}
```

### Default Case

The `default` case is optional, but usually worth including:

```adgLang
frame handleOne() {}
frame handleTwo() {}
frame handleUnexpected() {}

local value: int = 1;

# Without default - unmatched values do nothing
switch (value) {
    case 1: {
        handleOne();
        break;
    }
    case 2: {
        handleTwo();
        break;
    }
}

# With default - handles unexpected values
switch (value) {
    case 1: {
        handleOne();
        break;
    }
    case 2: {
        handleTwo();
        break;
    }
    default: {
        handleUnexpected();
        break;
    }
}
```

### Case Expressions

Case values need to be compile-time constants:

```adgLang
# local const OPTION_A: int = 1;
# local const OPTION_B: int = 2;
local option: int = 1;

switch (option) {
    case 1: { # OK: literal
        break;
    }
    case 2: { # OK: literal
        break;
    }
    # case x + 1: {    # ERROR: not a constant expression
    # }
}
```

## Match Expressions

adgLang also has strong pattern matching with `match`. Unlike `switch`, `match` is an expression that returns a value, and it can destructure enums, tuples, and primitive patterns.

### Pattern Types

Match expressions support several kinds of patterns:

- **Literal patterns**: Match exact values (e.g., `0`, `42`, `3.14`, `true`, `"hello"`)
- **Identifier patterns**: Bind matched values to variables (e.g., `x`, `n`)
- **Tuple patterns**: Destructure and match tuples (e.g., `(a, b)`, `(0, y)`)
- **Wildcard pattern**: Match anything with `_`
- **Enum patterns**: Match and destructure enum variants (e.g., `Option.Some(val)`)
- **Guard clauses**: Add conditions to patterns with `if` (e.g., `n if n > 0`)

### Basic Match

```adgLang
enum Status { Ok, Error(int) }

local s: Status = Status.Ok;

local msg: string = match(s) {
    Status.Ok => "Success",
    Status.Error(code) => "Failed with code",
};
```

### Primitive Pattern Matching

You can match primitive values with literals, identifiers, and guards:

```adgLang
# Integer matching
local x: int = 42;
match (x) {
    0 => printf("Zero\n"),
    42 => printf("The answer!\n"),
    n if n < 0 => printf("Negative: %d\n", n),
    _ => printf("Other\n"),
};

# Float matching
local f: float = 3.14;
match (f) {
    0.0 => printf("Zero\n"),
    3.14 => printf("Pi!\n"),
    val if val > 100.0 => printf("Large: %f\n", val),
    _ => printf("Other\n"),
};

# Boolean matching
local b: bool = true;
match (b) {
    true => printf("Yes\n"),
    false => printf("No\n"),
};

# String matching
local s: string = "hello";
match (s) {
    "" => printf("Empty\n"),
    "hello" => printf("Hello!\n"),
    str => printf("Other: %s\n", str),
};

# Character matching
local c: char = 'A';
match (c) {
    'A' => printf("Letter A\n"),
    'B' => printf("Letter B\n"),
    ch if ch >= '0' && ch <= '9' => printf("Digit\n"),
    _ => printf("Other\n"),
};
```

### Tuple Pattern Matching

You can also match and destructure tuples:

```adgLang
# Basic tuple patterns
local point: (int, int) = (5, 10);
match (point) {
    (0, 0) => printf("Origin\n"),
    (0, y) => printf("On Y-axis at %d\n", y),
    (x, 0) => printf("On X-axis at %d\n", x),
    (5, 10) => printf("Specific point\n"),
    (x, y) => printf("Point at (%d, %d)\n", x, y),
};

# Tuple patterns with guards
local coords: (int, int) = (3, 7);
match (coords) {
    (a, b) if a == b => printf("Diagonal\n"),
    (a, b) if (a + b) == 10 => printf("Sum is 10\n"),
    (a, b) if a > b => printf("X greater\n"),
    _ => printf("Other\n"),
};

# Mixed type tuples
local mixed: (int, bool) = (42, true);
match (mixed) {
    (0, _) => printf("Zero and anything\n"),
    (42, true) => printf("Answer and true\n"),
    (n, false) => printf("%d and false\n", n),
    (n, b) => printf("Other: %d, %d\n", n, b),
};

# Three-element tuples
local triple: (int, int, int) = (1, 2, 3);
match (triple) {
    (0, 0, 0) => printf("Origin\n"),
    (1, 2, 3) => printf("Sequential\n"),
    (a, b, c) if (a + b) == c => printf("a + b = c\n"),
    _ => printf("Other\n"),
};
```

### Wildcard Patterns

Use `_` when you want to match anything without binding it:

```adgLang
match (value) {
    0 => printf("Zero\n"),
    _ => printf("Non-zero\n"),  # Catches everything else
};

# In tuple patterns
match (pair) {
    (0, _) => printf("First is zero\n"),
    (_, 0) => printf("Second is zero\n"),
    _ => printf("Neither is zero\n"),
};
```

### Pattern Guards

Use `if` on patterns when you need extra conditions:

```adgLang
match (n) {
    x if x < 0 => printf("Negative\n"),
    x if x == 0 => printf("Zero\n"),
    x if x > 0 && x < 100 => printf("Small positive\n"),
    _ => printf("Large positive\n"),
};

# Complex guards with tuple patterns
match ((x, y)) {
    (a, b) if ((a % 2) == 0) && ((b % 2) == 0) => printf("Both even\n"),
    (a, b) if (a * b) > 50 => printf("Large product\n"),
    _ => printf("Other\n"),
};
```

### Match Arms with Blocks and Explicit Returns

Match arms can contain blocks. Inside those blocks, `return` yields a value for the `match` expression itself. It does not return from the surrounding function.

```adgLang
enum Status {
    Ok,
    Error(int)
}

local s: Status = Status.Ok;

local result: string = match(s) {
    Status.Ok => "All good",
    Status.Error(code) => {
        if (code == 404) {
            return "Not Found"; # Returns "Not Found" as the value of the match expression
        }
        if (code == 500) {
            return "Server Error";
        }
        return "Unknown Error";
    }
};
```

> **Note:** A `return` inside a match arm block returns to the `match` expression, not to the enclosing function. If you need to return from the function there, use a control-flow flag or restructure the code.

### Nested Matches

You can nest `match` expressions. Explicit returns yield to the nearest enclosing `match` expression.

```adgLang
enum Inner {
    Val(int),
    Empty
}

enum Option<T> {
    Some(T),
    None
}

local opt: Option<Inner> = Option<Inner>.None;
local res: int = match(opt) {
    Option.None => 0,
    Option.Some(val) => {
        return match(val) {
            Inner.Val(v) => { return v + 1; },
            Inner.Empty => 0
        };
    }
};
```

## Break and Continue

### Break Statement

`break` exits the innermost loop or switch:

```adgLang
local found: bool = false;
frame search(i: int) { i; }
frame process() {}
local value: int = 1;

# Exit loop early
local i: int = 0;
loop (i < 100) {
    if (found) {
        break;  # Exit loop
    }
    search(i);
    i = i + 1;
}

# Exit switch
switch (value) {
    case 1: {
        process();
        # break;  # Implicit in ADGLANG
    }
}
```

**In nested loops, `break` only exits the innermost loop:**

```adgLang
local shouldStop: bool = false;

local i: int = 0;
loop (i < 10) {
    local j: int = 0;
    loop (j < 10) {
        if (shouldStop) {
            break;  # Only exits inner loop
        }
        j = j + 1;
    }
    # Execution continues here after break
    i = i + 1;
}
```

**To break an outer loop, use a flag:**

```adgLang
local shouldStop: bool = false;

local done: bool = false;
local i: int = 0;
loop (i < 10 && !done) {
    local j: int = 0;
    loop (j < 10) {
        if (shouldStop) {
            done = true;
            break;
        }
        j = j + 1;
    }
    i = i + 1;
}
```

### Continue Statement

`continue` skips straight to the next loop iteration:

```adgLang
# Skip even numbers
local i: int = 0;
loop (i < 10) {
    if (i % 2 == 0) {
        i = i + 1;
        continue;  # Skip to next iteration
    }
    printf("%d is odd\n", i);
    i = i + 1;
}
```

**Continue behavior:**

- Skips the remaining statements in the loop body
- Executes the increment in for-style loops
- Re-checks the condition

```adgLang
local i: int = 0;
loop (i < 10) {
    i = i + 1;
    if (i % 2 == 0) {
        continue;
    }
    printf("%d\n", i);  # Only prints odd numbers
}
```

### Break and Continue with Nested Loops

```adgLang
local rows: int = 10;
local cols: int = 10;
local matrix: **int = nullptr; # Mock for compilation
frame process(val: int) { val; }

local i: int = 0;
loop (i < rows) {
    local j: int = 0;
    loop (j < cols) {
        if (matrix[i][j] == 0) {
            j = j + 1;
            continue;  # Skip this cell, continue inner loop
        }
        if (matrix[i][j] < 0) {
            break;  # Exit inner loop, continue outer loop
        }
        process(matrix[i][j]);
        j = j + 1;
    }
    i = i + 1;
}
```

## Return Statement

`return` exits a function and can optionally hand back a value.

### Return Without Value

```adgLang
frame printMessage(msg: string) ret void {
    printf("%s\n", msg);
    return;  # Optional for void functions
}

frame processData(data: *int) ret void {
    if (data == nullptr) {
        return;  # Early exit
    }
    # Process data
}
```

### Return With Value

```adgLang
frame add(a: int, b: int) ret int {
    return a + b;
}

frame max(a: int, b: int) ret int {
    if (a > b) {
        return a;
    } else {
        return b;
    }
}
```

### Multiple Return Statements

```adgLang
frame classify(age: int) ret string {
    if (age < 13) {
        return "child";
    } else if (age < 20) {
        return "teenager";
    } else if (age < 60) {
        return "adult";
    } else {
        return "senior";
    }
}
```

### Early Returns

Use early returns to cut down on nesting:

```adgLang
frame validate(data: *int) ret bool { data; return true; }
frame transform(data: *int) ret bool { data; return true; }
frame save(data: *int) ret bool { data; return true; }

# Instead of:
frame process(data: *int) ret bool {
    if (data != nullptr) {
        if (validate(data)) {
            if (transform(data)) {
                return save(data);
            }
        }
    }
    return false;
}

# Better:
frame processBetter(data: *int) ret bool {
    if (data == nullptr) {
        return false;
    }
    if (!validate(data)) {
        return false;
    }
    if (!transform(data)) {
        return false;
    }
    return save(data);
}
```

### Returning Structs

```adgLang
struct Point {
    x: int,
    y: int
}

frame createPoint(x: int, y: int) ret Point {
    local p: Point;
    p.x = x;
    p.y = y;
    return p;  # Returns a copy of the struct
}
```

## Control Flow Best Practices

1. **Prefer early returns** over deep nesting
2. **Use break and continue** instead of `goto` when possible
3. **Always include braces** even for one-line bodies
4. **Use switch for multi-way branches** on one value
5. **Add default cases** to switch statements
6. **Comment intentional fall-through** in switch statements
7. **Limit loop nesting depth** - move inner loops into functions when needed
8. **Use meaningful variable names** in loop counters (`i`, `j`, `k` are fine for simple loops)
9. **Avoid modifying loop counters** inside the loop body
10. **Check loop bounds** so you do not create infinite loops

## Common Patterns

### Search Loop

```adgLang
local size: int = 10;
local array: int[10];
local target: int = 5;
local found: bool = false;
local index: int = -1;

local i: int = 0;
loop (i < size && !found) {
    if (array[i] == target) {
        found = true;
        index = i;
    }
    i = i + 1;
}
```

### Input Validation Loop

```adgLang
extern scanf(fmt: string, ptr: *int);
local input: int;
loop (true) {
    printf("Enter a positive number: ");
    scanf("%d", &input);
    if (input > 0) {
        break;
    }
    printf("Invalid input. Try again.\n");
}
```

### Menu Loop

```adgLang
frame add() {}
frame remove() {}
extern scanf(fmt: string, ptr: *int);

local choice: int;
loop (true) {
    printf("1. Add\n");
    printf("2. Remove\n");
    printf("3. Exit\n");
    scanf("%d", &choice);

    switch (choice) {
        case 1: {
            add();
        }
        case 2: {
            remove();
        }
        case 3: {
            return 0;
        }
        default: {
            printf("Invalid choice\n");
        }
    }
}
```

## Anonymous Blocks

adgLang supports standalone `{ ... }` blocks as statements. They are handy when you want a new scope to limit variable lifetime or shadow names.

```adgLang
frame main() ret int {
    local x: int = 10;

    # Anonymous block
    {
        local x: int = 20;  # Shadows outer x
        local y: int = 30;
        printf("Inner x: %d, y: %d\n", x, y);
    }

    # y is not accessible here
    printf("Outer x: %d\n", x);  # Prints 10

    return 0;
}
```

## Defer Statement

The `defer` statement schedules a function call or block to run when the surrounding function returns or the surrounding block exits. Deferred statements run in LIFO (Last-In, First-Out) order.

`defer` is useful for cleanup work such as closing files, freeing memory, or unlocking mutexes.

### Basic Usage

```adgLang
frame main() {
    defer printf("World\n");
    printf("Hello ");
}
# Output:
# Hello World
```

### LIFO Order

```adgLang
{
    defer printf("First\n");
    defer printf("Second\n");
    printf("Start\n");
}
# Output:
# Start
# Second
# First
```

### Interaction with Exceptions

Deferred statements are guaranteed to run even if an exception is thrown during stack unwinding.

```adgLang
try {
    defer printf("Cleanup\n");
    throw 1;
} catch (e: int) {
    printf("Caught\n");
}
# Output:
# Cleanup
# Caught
```

### Capturing Variables

Deferred statements capture variables from the surrounding scope. Arguments to function calls in `defer` are evaluated immediately by value, similar to Go.

```adgLang
local i: int = 0;
defer printf("%d\n", i); # Captures i=0
i = 1;
# Output: 0
```

## Next Steps

- [Functions Basics](08-functions-basics.md) - Function declarations and calls
- [Functions Advanced](09-functions-advanced.md) - Overloading, recursion, pointers
- [Operators](06-operators.md) - Operator reference
