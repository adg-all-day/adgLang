# Quick Start Guide

This guide gets you from zero to running adgLang code in a few minutes.

## Your First Program

Start with the usual "Hello, World!" program.

### Step 1: Create a File

Create a file named `hello.adg`:

```bash
touch hello.adg
```

### Step 2: Write the Code

Open the file in your editor and put this in it:

```adgLang
# Import the printf function from the C standard library
extern printf(fmt: string, ...);

# The main function is the entry point of every ADGLANG program
frame main() ret int {
    # Print a message to the console
    printf("Hello, World!\n");

    # Return 0 to indicate success
    return 0;
}
```

### Step 3: Compile and Run

```bash
# Compile and run in one command
adgLang run hello.adg
```

You should see:

```
Hello, World!
```

You have now written and run your first adgLang program.

### Alternative: Compile Only

If you only want to compile:

```bash
# Compile to executable
adgLang build hello.adg -o hello

# Run the compiled binary
./hello
```

## Understanding the Code

Here is what each part is doing:

### Comments

```adgLang
# This is a single-line comment
```

Comments start with `#` and continue to the end of the line.

### External Functions

```adgLang
extern printf(fmt: string, ...);
```

- `extern` declares a function that is defined somewhere else (here, the C standard library)
- `printf` is the function name
- `(fmt: string, ...)` are the parameters
 - `fmt: string` - first parameter named `fmt` with type `string`
 - `...` - variadic, so it accepts extra arguments

### Function Declaration

```adgLang
frame main() ret int {
    # ...
}
```

- `frame` is adgLang's function keyword
- `main` is the function name (the program entry point)
- `()` - no parameters
- `ret int` - returns an integer
- `{ }` - function body

### Function Call

```adgLang
printf("Hello, World!\n");
```

This calls `printf` with a string argument.

### Return Statement

```adgLang
return 0;
```

This returns 0 to signal successful execution.

## Basic Examples

### Variables and Math

```adgLang
extern printf(fmt: string, ...);

frame main() ret int {
    # Declare a local variable
    local x: int = 10;
    local y: int = 20;

    # Perform arithmetic
    local sum: int = x + y;

    # Print the result
    printf("Sum: %d\n", sum);

    return 0;
}
```

**Output:**

```
Sum: 30
```

**Key Points:**

- Variables needs to be declared with `local` or `global`
- Type annotations come after the variable name: `x: int`
- You can initialize during declaration: `x: int = 10`

### Conditionals

```adgLang
extern printf(fmt: string, ...);

frame main() ret int {
    local age: int = 18;

    if (age >= 18) {
        printf("You are an adult\n");
    } else {
        printf("You are a minor\n");
    }

    return 0;
}
```

**Output:**

```
You are an adult
```

**Key Points:**

- Conditions needs to be in parentheses: `if (condition)`
- Use `{  }` for block statements
- Standard comparison operators: `==`, `!=`, `<`, `>`, `<=`, `>=`

### Loops

```adgLang
extern printf(fmt: string, ...);

frame main() ret int {
    local i: int = 0;

    # ADGLANG uses 'loop' instead of 'while'
    loop (i < 5) {
        printf("Count: %d\n", i);
        i = i + 1;
    }

    return 0;
}
```

**Output:**

```
Count: 0
Count: 1
Count: 2
Count: 3
Count: 4
```

**Key Points:**

- `loop` is adgLang's looping construct
- `loop (condition)` works like `while (condition)` in other languages
- `loop` with no condition creates an infinite loop

### Functions

```adgLang
extern printf(fmt: string, ...);

# Define a function that adds two numbers
frame add(a: int, b: int) ret int {
    return a + b;
}

frame main() ret int {
    local result: int = add(5, 3);
    printf("Result: %d\n", result);
    return 0;
}
```

**Output:**

```
Result: 8
```

**Key Points:**

- Functions are declared with `frame`
- Parameters use type annotations: `a: int`
- Set the return type with `ret int`
- Call functions like `add(5, 3)`

### Structs

```adgLang
extern printf(fmt: string, ...);

# Define a struct
struct Point {
    x: int,
    y: int
}

frame main() ret int {
    # Create a struct instance
    local p: Point;
    p.x = 10;
    p.y = 20;

    printf("Point: (%d, %d)\n", p.x, p.y);

    return 0;
}
```

**Output:**

```
Point: (10, 20)
```

**Key Points:**

- Structs use `struct Name { fields }`
- Fields are separated by commas
- Access fields with dot notation: `p.x`

## Common Compilation Options

### Generate LLVM IR Only

```bash
adgLang hello.adg
# Creates hello.ll (LLVM IR file)
```

### Specify Output Name

```bash
adgLang hello.adg -o myprogram
# Creates 'myprogram' executable
```

### Verbose Output

```bash
adgLang hello.adg -v --run
# Shows detailed compilation steps
```

### View Different Outputs

```bash
# View AST (Abstract Syntax Tree)
adgLang hello.adg --emit ast

# View tokens
adgLang hello.adg --emit tokens

# View formatted code
adgLang hello.adg --emit formatted
```

### Run code without a file

- Evaluate a snippet passed on the command line:

```bash
adgLang -e 'frame main() ret int { return 0; }' --run
```

- Compile from stdin (useful with pipes):

```bash
cat examples/hello-world/main.adg | adgLang --stdin --run
```

`--emit tokens|ast|formatted|llvm` works with both `-e` and `--stdin`; diagnostics label source locations as `<eval>` or `<stdin>`.

## Project Structure

For larger programs, it helps to organize code like this:

```
myproject/
├── main.adg           # Entry point
├── utils.adg          # Utility functions
└── types.adg          # Type definitions
```

**main.adg:**

```adgLang
import add from "./utils.adg";
extern printf(fmt: string, ...);

frame main() ret int {
    local result: int = add(5, 3);
    printf("Result: %d\n", result);
    return 0;
}
```

**utils.adg:**

```adgLang
export add;

frame add(a: int, b: int) ret int {
    return a + b;
}
```

Compile with:

```bash
adgLang main.adg --run
```

## Using the Standard Library

adgLang ships with a standard library:

```adgLang
import [IO] from "std/io.adg";

frame main() ret int {
    IO.log("Hello from stdlib!");
    IO.printInt(42);
    return 0;
}
```

**Key standard library modules:**

- `std/io.adg` - Input/output operations
- `std/array.adg` - Dynamic arrays
- `std/string.adg` - String utilities
- `std/math.adg` - Math functions
- `std/fs.adg` - File system operations

See [Standard Library documentation](28-stdlib-io.md) for full details.

## Interactive Development

For quick experiments and fast iteration, adgLang gives you a few options:

### Watch Mode (Recommended)

The `--watch` flag recompiles automatically when files change:

```bash
# Watch and run - recompiles on every save
adgLang mycode.adg --watch --run
```

This is the recommended development loop because you get immediate feedback without recompiling by hand.

### Manual Compilation

For quick one-off runs, use the `--run` flag:

```bash
# Edit, compile, run in one command
adgLang mycode.adg --run
```

See [Compiler Options](39-compiler-options.md) for more on watch mode and other development features.

## Common Beginner Mistakes

### 1. Missing semicolons

```adgLang
# ❌ Wrong
local x: int = 5
printf("x = %d\n", x)

# ✅ Correct
local x: int = 5;
printf("x = %d\n", x);
```

### 2. Forgetting 'local' or 'global'

```adgLang
# ❌ Wrong
x: int = 5;

# ✅ Correct
local x: int = 5;
```

### 3. Missing parentheses in conditions

```adgLang
# ❌ Wrong
if x > 5 {
    # ...
}

# ✅ Correct
if (x > 5) {
    # ...
}
```

### 4. Wrong loop syntax

```adgLang
# ❌ Wrong (C-style for loop doesn't exist)
for (i = 0; i < 10; i++) {
    # ...
}

# ✅ Correct
local i: int = 0;
loop (i < 10) {
    # ...
    i = i + 1;
}
```

### 5. Forgetting return type

```adgLang
# ❌ Wrong
frame add(a: int, b: int) {
    return a + b;
}

# ✅ Correct
frame add(a: int, b: int) ret int {
    return a + b;
}
```

## What's Next?

Now that you have the basics down, you can:

1. **Learn the details** - Read [Types and Variables](05-types-variables.md)
2. **Explore examples** - Check out the [examples directory](../examples/)
3. **Build something** - Try a small project
4. **Read advanced topics** - Dive into [Generics](10-generics-functions.md) or [Pointers](15-pointers.md)

## Getting Help

- **Documentation** - You are already in it
- **Examples** - See working code in `examples/`
- **Community** - Join discussions on GitHub
- **Issues** - Report bugs or ask questions

Happy coding!
