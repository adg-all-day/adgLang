# Imports and Exports

adgLang's module system lets you split code across files and build reusable packages. This guide covers imports, exports, module resolution, and package creation.

## Table of Contents

- [Module Basics](#module-basics)
- [Import Statement](#import-statement)
- [Export Statement](#export-statement)
- [Module Resolution](#module-resolution)
- [Standard Library](#standard-library)
- [Module Best Practices](#module-best-practices)

## Module Basics

### Modules

A module is a `.adg` file that contains code such as functions, structs, and constants. Modules help keep code organized and reusable.

**File: math.adg**

```adgLang
frame add(a: int, b: int) ret int {
    return a + b;
}

frame multiply(a: int, b: int) ret int {
    return a * b;
}
```

**File: main.adg**

```adgLang
import [add, multiply] from "math.adg";

frame main() ret int {
    local sum: int = add(5, 3);
    local product: int = multiply(5, 3);
    return 0;
}
```

### Module Scope

Each module has its own scope. Items are private by default and must be exported explicitly before other modules can access them.

## Import Statement

The `import` statement pulls items from other modules into the current scope.

### Named Imports

Use this form to import specific items:

```adgLang
import [add, subtract] from "math.adg";

frame main() ret int {
    local result: int = add(5, 3);
    return 0;
}
```

### Importing Types

You can also import structs and type aliases:

```adgLang
import [Point, Color] from "graphics.adg";

frame main() ret int {
    local p: Point;
    p.x = 10;
    p.y = 20;
    return 0;
}
```

### Importing Multiple Items

```adgLang
import [
    Vector2,
    Vector3,
    add,
    subtract,
    dot,
    cross
] from "math/vector.adg";
```

### Import Syntax Variations

```adgLang
# Single item
import [sqrt] from "math.adg";

# Multiple items
import [sin, cos, tan] from "math.adg";

# Types and functions
import [Point, distance] from "geometry.adg";
```

## Export Statement

The `export` statement makes items visible to other modules.

### Exporting Functions

```adgLang
# File: utils.adg

# Private function - not accessible outside this module
frame helperFunction() ret void {
    # ...
}

# Public function - accessible via import
export frame publicFunction() ret int {
    helperFunction();  # Can call private functions internally
    return 42;
}
```

### Exporting Structs

```adgLang
# File: shapes.adg

# Public struct
export struct Circle {
    radius: float,

    frame area(this: *Circle) ret float {
        return 3.14159 * this.radius * this.radius;
    }
}

# Private struct - only used internally
struct InternalHelper {
    data: int,
}
```

### Exporting Constants

```adgLang
# File: constants.adg

export global const PI: float = 3.14159265359;
export global const E: float = 2.71828182846;

# Private constant
global const INTERNAL_BUFFER_SIZE: int = 1024;
```

### Multiple Exports

```adgLang
# File: math.adg

export frame add(a: int, b: int) ret int {
    return a + b;
}

export frame subtract(a: int, b: int) ret int {
    return a - b;
}

export frame multiply(a: int, b: int) ret int {
    return a * b;
}

export struct Complex {
    real: float;
    imag: float;

    frame magnitude() ret float {
        return sqrt(this.real * this.real + this.imag * this.imag);
    }
}
```

## Module Resolution

adgLang uses a few strategies to find imported modules:

### Relative Imports

Use relative imports for files near the current file:

```adgLang
# In file: src/main.adg
import [helper] from "./utils.adg";        # Same directory
import [Config] from "./config/app.adg";   # Subdirectory
import [Parent] from "../shared.adg";      # Parent directory
```

### Project Structure Example

```
project/
  ├── main.adg
  ├── utils.adg
  ├── config/
  │   └── app.adg
  └── src/
      ├── module1.adg
      └── module2.adg
```

**In main.adg:**

```adgLang
import [helper] from "./utils.adg";
import [Config] from "./config/app.adg";
```

**In src/module1.adg:**

```adgLang
import [Config] from "../config/app.adg";
import [helper] from "../utils.adg";
```

### Standard Library Imports

Import from the standard library with the `std/` prefix:

```adgLang
import [String] from "std/string.adg";
import [Vec] from "std/vec.adg";
import [Map] from "std/map.adg";
import [Option, Some, None] from "std/option.adg";
```

### Package Imports

Import from installed packages like this:

```adgLang
# Import from package in adgLang_modules/
import [JsonParser] from "json_package/parser.adg";
```

### Search Order

adgLang resolves imports in this order:

1. **Relative paths** (`./`, `../`)
2. **Standard library** (`std/`)
3. **Local adgLang_modules** directory
4. **Global adgLang_modules** directory

## Standard Library

adgLang ships with a full standard library.

### Common Standard Library Modules

#### String Operations

```adgLang
import [String] from "std/string.adg";

frame main() ret int {
    local s: String;
    s.init("Hello, World!");

    printf("Length: %d\n", s.length());
    printf("Uppercase: %s\n", s.toUpper());

    s.cleanup();
    return 0;
}
```

#### Dynamic Arrays

```adgLang
import [Vec] from "std/vec.adg";

frame main() ret int {
    local v: Vec<int>;
    v.init();

    v.push(10);
    v.push(20);
    v.push(30);

    printf("Size: %d\n", v.size());
    printf("First: %d\n", v.get(0));

    v.cleanup();
    return 0;
}
```

#### Hash Maps

```adgLang
import [Map] from "std/map.adg";

frame main() ret int {
    local m: Map<string, int>;
    m.init();

    m.insert("Alice", 25);
    m.insert("Bob", 30);

    local age: int = m.get("Alice");
    printf("Alice's age: %d\n", age);

    m.cleanup();
    return 0;
}
```

#### Option Type

```adgLang
import [Option, Some, None] from "std/option.adg";

frame safeDivide(a: int, b: int) ret Option<int> {
    if (b == 0) {
        return None<int>();
    }
    return Some<int>(a / b);
}

frame main() ret int {
    local result: Option<int> = safeDivide(10, 2);

    if (result.isSome()) {
        printf("Result: %d\n", result.unwrap());
    } else {
        printf("Division by zero\n");
    }

    return 0;
}
```

#### Result Type

```adgLang
import [Result, Ok, Err] from "std/result.adg";

frame readFile(path: string) ret Result<string, string> {
    local file: File* = fopen(path, "r");
    if (file == nullptr) {
        return Err<string, string>("Failed to open file");
    }
    # ... read file ...
    return Ok<string, string>(contents);
}
```

### Full Standard Library Reference

```adgLang
# Core utilities
import [String] from "std/string.adg";
import [Array] from "std/array.adg";
import [Option, Some, None] from "std/option.adg";
import [Result, Ok, Err] from "std/result.adg";

# Collections
import [Vec] from "std/vec.adg";
import [Map] from "std/map.adg";
import [Set] from "std/set.adg";
import [Stack] from "std/stack.adg";
import [Queue] from "std/queue.adg";

# Iterators
import [Iter, Range] from "std/iter.adg";

# Algorithms
import [sort, binarySearch, reverse] from "std/algorithm.adg";

# I/O
import [print, println, readLine] from "std/io.adg";
import [File, FileMode] from "std/fs.adg";
import [Path] from "std/path.adg";

# Formatting
import [format, sprintf] from "std/fmt.adg";

# Math
import [abs, min, max, clamp] from "std/math.adg";
import [Random] from "std/rand.adg";

# JSON
import [JsonValue, parseJson, toJson] from "std/json.adg";

# Logging
import [log, error, warn, info, debug] from "std/log.adg";

# Assertions
import [assert, assertEq, assertNe] from "std/assert.adg";

# Command-line arguments
import [Args] from "std/args.adg";
```

## Creating Packages

Packages let you share and reuse code across projects.

### Package Structure

```
my_package/
  ├── adgLang-package.json     # Package configuration
  ├── README.md            # Documentation
  ├── LICENSE              # License file
  ├── src/
  │   ├── lib.adg         # Main library file
  │   ├── utils.adg       # Utility functions
  │   └── types.adg       # Type definitions
  ├── examples/
  │   └── example.adg     # Usage examples
  └── tests/
      └── test.adg        # Test files
```

### Creating a Simple Package

**Step 1: Create adgLang-package.json**

```json
{
  "name": "my_math_lib",
  "version": "1.0.0",
  "description": "A simple math library",
  "author": "Your Name",
  "license": "MIT",
  "main": "src/lib.adg",
  "dependencies": {},
  "keywords": ["math", "utilities"]
}
```

**Step 2: Create src/lib.adg**

```adgLang
# Main library file

export frame add(a: int, b: int) ret int {
    return a + b;
}

export frame multiply(a: int, b: int) ret int {
    return a * b;
}

export struct Complex {
    real: float;
    imag: float;

    frame magnitude() ret float {
        return sqrt(this.real * this.real + this.imag * this.imag);
    }
}
```

**Step 3: Using the Package**

Install in another project:

```bash
adgLang package install my_math_lib
```

Import and use:

```adgLang
import [add, multiply, Complex] from "my_math_lib/lib.adg";

frame main() ret int {
    local sum: int = add(5, 3);

    local c: Complex;
    c.real = 3.0;
    c.imag = 4.0;
    printf("Magnitude: %f\n", c.magnitude());

    return 0;
}
```

## Package Configuration

### adgLang-package.json Schema

```json
{
  "name": "package_name",           # Required: package name
  "version": "1.0.0",               # Required: semantic version
  "description": "Package description",
  "author": "Author Name <email@example.com>",
  "license": "MIT",                 # MIT, Apache-2.0, GPL-3.0, etc.
  "main": "src/lib.adg",           # Entry point
  "homepage": "https://github.com/user/package",
  "repository": {
    "type": "git",
    "url": "https://github.com/user/package.git"
  },
  "keywords": ["keyword1", "keyword2"],
  "dependencies": {
    "other_package": "^1.2.0"
  },
  "devDependencies": {
    "test_framework": "^2.0.0"
  },
  "scripts": {
    "test": "adgLang test",
    "build": "adgLang compile src/lib.adg"
  }
}
```

### Version Specification

```json
{
  "dependencies": {
    "exact": "1.2.3",           # Exact version
    "caret": "^1.2.3",          # Compatible (1.2.3 to <2.0.0)
    "tilde": "~1.2.3",          # Patch updates (1.2.3 to <1.3.0)
    "range": ">=1.0.0 <2.0.0",  # Version range
    "latest": "*"               # Latest version (not recommended)
  }
}
```

## Module Best Practices

### 1. One Module Per File

Keep each module focused on one job:

```adgLang
# Good: math_utils.adg
export frame add(a: int, b: int) ret int { ... }
export frame subtract(a: int, b: int) ret int { ... }

# Avoid: kitchen_sink.adg with unrelated functions
```

### 2. Explicit Exports

Only export what other modules actually need:

```adgLang
# Public API
export frame publicFunction() ret void { ... }

# Internal implementation (not exported)
frame helperFunction() ret void { ... }
```

### 3. Group Related Imports

```adgLang
# Standard library
import [Vec] from "std/vec.adg";
import [Map] from "std/map.adg";

# Third-party packages
import [JsonParser] from "json_lib/parser.adg";

# Local modules
import [Config] from "./config.adg";
import [Utils] from "./utils.adg";
```

### 4. Avoid Circular Dependencies

```adgLang
# BAD: Circular dependency
# module_a.adg imports from module_b.adg
# module_b.adg imports from module_a.adg

# GOOD: Extract shared code to a third module
# module_a.adg imports from shared.adg
# module_b.adg imports from shared.adg
```

### 5. Use Package Namespacing

```adgLang
# Instead of importing everything:
import [Vec, Map, Set, Stack, Queue] from "std/collections.adg";

# Import what you need:
import [Vec] from "std/vec.adg";
import [Map] from "std/map.adg";
```

### 6. Document Public APIs

```adgLang
# Calculates the factorial of n
# Returns 1 for n <= 0
export frame factorial(n: int) ret int {
    if (n <= 0) return 1;
    return n * factorial(n - 1);
}
```

### 7. Version Your Packages

Follow semantic versioning:

- **Major (1.0.0)**: Breaking changes
- **Minor (0.1.0)**: New features, backward compatible
- **Patch (0.0.1)**: Bug fixes

### 8. Test Your Exports

Make sure exported items behave the way you expect:

```adgLang
# tests/test_math.adg
import [add, multiply] from "../src/math.adg";
import [assert] from "std/assert.adg";

frame testAdd() ret void {
    assert(add(2, 3) == 5, "2 + 3 should equal 5");
}

frame testMultiply() ret void {
    assert(multiply(2, 3) == 6, "2 * 3 should equal 6");
}
```

## Common Patterns

### Library Pattern

Create a main library file that re-exports items from submodules:

**lib.adg:**

```adgLang
# Re-export from submodules
import [add, subtract] from "./math/basic.adg";
import [sin, cos] from "./math/trig.adg";
import [Vec2, Vec3] from "./math/vector.adg";

export frame add(a: int, b: int) ret int;
export frame subtract(a: int, b: int) ret int;
export frame sin(x: float) ret float;
export frame cos(x: float) ret float;
export struct Vec2;
export struct Vec3;
```

That way, users only need to import from `lib.adg`.

### Facade Pattern

Use a facade when you want to expose a simpler interface over more complex subsystems:

**facade.adg:**

```adgLang
import [ComplexSystem1] from "./internal/system1.adg";
import [ComplexSystem2] from "./internal/system2.adg";

export frame simpleOperation() ret void {
    # Hide complexity
    local s1: ComplexSystem1;
    local s2: ComplexSystem2;
    s1.init();
    s2.init();
    s1.doComplexThing();
    s2.doOtherComplexThing();
    s1.cleanup();
    s2.cleanup();
}
```

## Next Steps

- [Standard Library Reference](24-stdlib-reference.md) - Full stdlib documentation
- [Package Manager](PACKAGE_MANAGER.md) - Detailed package management guide
- [Build System](25-build-system.md) - Building multi-file projects
