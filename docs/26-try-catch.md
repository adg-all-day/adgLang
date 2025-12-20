# Exception Handling with Try-Catch

adgLang supports structured exception handling with `try`, `catch`, and `throw`. That lets you deal with errors cleanly and keep error handling separate from the normal path through your code.

## Table of Contents

- [Basic Syntax](#basic-syntax)
- [Throwing Exceptions](#throwing-exceptions)
- [Catching Exceptions](#catching-exceptions)
- [Multiple Catch Blocks](#multiple-catch-blocks)
- [Catch-All Handler](#catch-all-handler)
- [Built-in Exceptions](#built-in-exceptions)
- [Custom Exception Types](#custom-exception-types)
- [Exception Propagation](#exception-propagation)
- [Defer with Exceptions](#defer-with-exceptions)
- [Best Practices](#best-practices)

## Basic Syntax

This is the basic shape of exception handling in adgLang:

```adgLang
try {
    # Code that might throw an exception
    throw 1;
} catch (e: int) {
    # Handle the exception
    printf("Caught error: %d\n", e);
}
```

## Throwing Exceptions

Use `throw` to raise an exception:

```adgLang
extern printf(fmt: string, ...);

frame divide(a: int, b: int) ret int {
    if (b == 0) {
        throw "Division by zero";
    }
    return a / b;
}

frame main() ret int {
    try {
        local result: int = divide(10, 0);
        printf("Result: %d\n", result);
    } catch (e: string) {
        printf("Error: %s\n", e);
    }
    return 0;
}
```

### Throwing Different Types

You can throw a value of any type:

```adgLang
extern printf(fmt: string, ...);

frame main() ret int {
    try {
        # Throw an integer error code
        throw 404;
    } catch (code: int) {
        printf("Error code: %d\n", code);
    }

    try {
        # Throw a string message
        throw "Something went wrong";
    } catch (msg: string) {
        printf("Message: %s\n", msg);
    }

    try {
        # Throw a custom struct
        throw ErrorInfo { code: 500, message: "Internal error" };
    } catch (err: ErrorInfo) {
        printf("Error %d: %s\n", err.code, err.message);
    }

    return 0;
}

struct ErrorInfo {
    code: int,
    message: string,
}
```

## Catching Exceptions

### Type-Specific Catch

Each catch block names the exception type it handles:

```adgLang
extern printf(fmt: string, ...);

frame riskyOperation() ret void {
    throw 42;
}

frame main() ret int {
    try {
        riskyOperation();
    } catch (e: int) {
        printf("Caught integer: %d\n", e);
    }
    return 0;
}
```

### Accessing Exception Value

Inside the catch block, the exception value is available as a local variable:

```adgLang
extern printf(fmt: string, ...);

frame main() ret int {
    try {
        throw "File not found: config.json";
    } catch (e: string) {
        printf("Error occurred: %s\n", e);

        # You can use 'e' like any other variable
        local len: int = strlen(e);
        printf("Error message length: %d\n", len);
    }
    return 0;
}

extern strlen(s: string) ret int;
```

## Multiple Catch Blocks

Use multiple catch blocks when you want to handle different exception types differently:

```adgLang
extern printf(fmt: string, ...);

struct FileError {
    path: string,
    code: int,
}

struct NetworkError {
    host: string,
    port: int,
}

frame loadData(source: string) ret void {
    if (source == "file") {
        throw FileError { path: "/data.txt", code: 2 };
    } else if (source == "network") {
        throw NetworkError { host: "api.example.com", port: 443 };
    }
}

frame main() ret int {
    try {
        loadData("file");
    } catch (e: FileError) {
        printf("File error at %s (code %d)\n", e.path, e.code);
    } catch (e: NetworkError) {
        printf("Network error: %s:%d\n", e.host, e.port);
    } catch (e: string) {
        printf("String error: %s\n", e);
    } catch (e: int) {
        printf("Error code: %d\n", e);
    }

    return 0;
}
```

### Catch Block Order

Catch blocks are checked top to bottom. Put the more specific types first:

```adgLang
extern printf(fmt: string, ...);

struct SpecificError {
    detail: string,
}

frame main() ret int {
    try {
        throw SpecificError { detail: "specific issue" };
    } catch (e: SpecificError) {
        # This catches SpecificError
        printf("Specific: %s\n", e.detail);
    } catch {
        # Catch-all for anything else
        printf("Unknown error\n");
    }

    return 0;
}
```

## Catch-All Handler

Use `catch` without a type when you want to catch any exception:

```adgLang
extern printf(fmt: string, ...);

frame unpredictable() ret void {
    # Could throw anything
    throw 123;
}

frame main() ret int {
    try {
        unpredictable();
    } catch {
        # Catches any exception
        printf("Something went wrong!\n");
    }

    return 0;
}
```

### Combining Typed and Catch-All

```adgLang
extern printf(fmt: string, ...);

frame main() ret int {
    try {
        throw 3.14;  # Throwing a float
    } catch (e: int) {
        printf("Integer error: %d\n", e);
    } catch (e: string) {
        printf("String error: %s\n", e);
    } catch {
        # Catches the float (and anything else)
        printf("Unknown error type\n");
    }

    return 0;
}
```

## Built-in Exceptions

### NullAccessError

adgLang throws `NullAccessError` automatically when code tries to access a member on a nullptr object:

```adgLang
extern printf(fmt: string, ...);

struct Point {
    x: int,
    y: int,
}

frame main() ret int {
    try {
        local p: *Point = nullptr;
        local v: int = p.x;  # Throws NullAccessError
    } catch (e: NullAccessError) {
        printf("Nullptr access detected!\n");
        printf("  Message: %s\n", e.message);
        printf("  Function: %s\n", e.function);
        printf("  Expression: %s\n", e.expression);
    }

    return 0;
}
```

**NullAccessError fields:**

- `message`: A human-friendly description (e.g., "Attempted to access member of nullptr object")
- `function`: The function where the access happened
- `expression`: The expression that triggered the fault (e.g., `p.x`)

### Array Bounds Errors

When bounds checking is on, out-of-bounds array access throws an exception:

```adgLang
extern printf(fmt: string, ...);

frame main() ret int {
    local arr: int[5] = [1, 2, 3, 4, 5];

    try {
        local val: int = arr[10];  # Out of bounds
    } catch (e: string) {
        printf("Bounds error: %s\n", e);
    }

    return 0;
}
```

## Custom Exception Types

Define custom exception types with structs:

```adgLang
extern printf(fmt: string, ...);

struct ValidationError {
    field: string,
    message: string,
    value: string,

    frame new(field: string, message: string, value: string) ret ValidationError {
        return ValidationError {
            field: field,
            message: message,
            value: value
        };
    }

    frame toString(this: *ValidationError) ret string {
        # In real code, you'd build this string properly
        return this.message;
    }
}

struct DatabaseError {
    code: int,
    query: string,
    message: string,
}

frame validateEmail(email: string) ret void {
    # Simplified validation
    if (email == "") {
        throw ValidationError.new("email", "Email is required", email);
    }
}

frame saveUser(email: string) ret void {
    validateEmail(email);

    # Simulate database error
    throw DatabaseError {
        code: 1045,
        query: "INSERT INTO users...",
        message: "Access denied"
    };
}

frame main() ret int {
    try {
        saveUser("");
    } catch (e: ValidationError) {
        printf("Validation failed for '%s': %s\n", e.field, e.message);
    } catch (e: DatabaseError) {
        printf("Database error %d: %s\n", e.code, e.message);
        printf("Query: %s\n", e.query);
    }

    return 0;
}
```

## Exception Propagation

Exceptions move up the call stack until something catches them:

```adgLang
extern printf(fmt: string, ...);

frame level3() ret void {
    printf("In level3, about to throw\n");
    throw "Error from level3";
}

frame level2() ret void {
    printf("In level2, calling level3\n");
    level3();
    printf("This won't print\n");
}

frame level1() ret void {
    printf("In level1, calling level2\n");
    level2();
    printf("This won't print\n");
}

frame main() ret int {
    try {
        level1();
    } catch (e: string) {
        printf("Caught in main: %s\n", e);
    }

    printf("Program continues after catch\n");
    return 0;
}
```

Output:

```
In level1, calling level2
In level2, calling level3
In level3, about to throw
Caught in main: Error from level3
Program continues after catch
```

### Re-throwing Exceptions

Catch an exception, do part of the handling, then throw it again:

```adgLang
extern printf(fmt: string, ...);

frame processData() ret void {
    try {
        throw "Data corruption detected";
    } catch (e: string) {
        printf("Logging error: %s\n", e);
        # Re-throw for caller to handle
        throw e;
    }
}

frame main() ret int {
    try {
        processData();
    } catch (e: string) {
        printf("Fatal error: %s\n", e);
    }
    return 0;
}
```

## Defer with Exceptions

`defer` makes sure cleanup code still runs when an exception is thrown:

```adgLang
extern printf(fmt: string, ...);
extern malloc(size: int) ret *void;
extern free(ptr: *void);

frame processFile() ret void {
    local buffer: *char = cast<*char>(malloc(1024));

    defer {
        printf("Cleaning up buffer\n");
        free(cast<*void>(buffer));
    }

    # This will throw, but defer still runs
    throw "Error processing file";
}

frame main() ret int {
    try {
        processFile();
    } catch (e: string) {
        printf("Caught: %s\n", e);
    }
    return 0;
}
```

Output:

```
Cleaning up buffer
Caught: Error processing file
```

### Multiple Defers

Defers run in reverse order (LIFO):

```adgLang
extern printf(fmt: string, ...);

frame example() ret void {
    defer { printf("First defer (runs last)\n"); }
    defer { printf("Second defer\n"); }
    defer { printf("Third defer (runs first)\n"); }

    throw "Error!";
}

frame main() ret int {
    try {
        example();
    } catch (e: string) {
        printf("Caught: %s\n", e);
    }
    return 0;
}
```

Output:

```
Third defer (runs first)
Second defer
First defer (runs last)
Caught: Error!
```

## Best Practices

### 1. Use Specific Exception Types

```adgLang
# Good: Specific error types
struct FileNotFoundError { path: string }
struct PermissionError { path: string, required: string }

# Avoid: Generic errors lose information
throw "error";
throw 1;
```

### 2. Handle Exceptions at the Right Level

```adgLang
# Good: Handle where you can meaningfully recover
frame loadConfig() ret Config {
    try {
        return parseConfigFile("config.json");
    } catch (e: FileNotFoundError) {
        # Can recover: use defaults
        return Config.default();
    }
    # Let other errors propagate
}

# Avoid: Catching everything blindly
frame badExample() ret void {
    try {
        doSomething();
    } catch {
        # What went wrong? We don't know!
    }
}
```

### 3. Always Clean Up Resources

```adgLang
frame processResource() ret void {
    local resource: *Resource = acquireResource();

    defer {
        releaseResource(resource);
    }

    # Exception-safe: resource is always released
    riskyOperation(resource);
}
```

### 4. Document Thrown Exceptions

```adgLang
# Throws: ValidationError if input is invalid
# Throws: DatabaseError if database operation fails
frame createUser(name: string, email: string) ret User {
    if (name == "") {
        throw ValidationError { field: "name", message: "Name required" };
    }
    # ...
}
```

### 5. Don't Use Exceptions for Control Flow

```adgLang
# Bad: Using exceptions for normal control flow
frame findItem(arr: *int, len: int, target: int) ret int {
    loop (local i: int = 0; i < len; i = i + 1) {
        if (arr[i] == target) {
            throw i;  # Don't do this!
        }
    }
    throw -1;
}

# Good: Return values for expected outcomes
frame findItem(arr: *int, len: int, target: int) ret int {
    loop (local i: int = 0; i < len; i = i + 1) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;  # Not found
}
```

### 6. Keep Try Blocks Small

```adgLang
# Good: Minimal try block
local data: string = readFile("input.txt");
try {
    processData(data);
} catch (e: ProcessingError) {
    handleError(e);
}

# Avoid: Large try blocks make it unclear what can throw
try {
    local data: string = readFile("input.txt");
    local parsed: Data = parseData(data);
    local validated: Data = validateData(parsed);
    local result: Result = processData(validated);
    saveResult(result);
} catch {
    # Which operation failed?
}
```

---

**Next:** Check out [Throwing Exceptions](27-throwing-exceptions.md) for more on the `throw` statement.
