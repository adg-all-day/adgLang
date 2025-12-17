# Syntax and Comments

This guide explains the main syntax rules and comment styles in adgLang.

## File Encoding

adgLang source files:

- Should be UTF-8 encoded
- Use the `.adg` extension
- Can use either LF (Unix) or CRLF (Windows) line endings

## Basic Syntax Rules

### Statements

Most statements in adgLang end with a semicolon (`;`):

```adgLang
local x: int = 42;              # Variable declaration
printf("Hello\n");              # Function call
return 0;                       # Return statement
```

**Exceptions** (no semicolon needed):

- Block statements (`{ }`)
- Function/struct declarations
- Control flow structures (if, loop, switch)

```adgLang
if (x > 0) {          # No semicolon after '}'
    return x;
}                     # No semicolon after '}'

frame test() {        # No semicolon after '}'
    local y: int = 5;
}                     # No semicolon after '}'
```

### Blocks

Blocks use curly braces and can hold multiple statements:

```adgLang
{
    local x: int = 1;
    local y: int = 2;
    local z: int = x + y;
}
```

### Whitespace

adgLang is **whitespace-insensitive** (except inside strings):

```adgLang
# These are all equivalent
local x:int=42;
local x: int = 42;
local x : int = 42 ;

frame add(a:int,b:int)ret int{return a+b;}
frame add(a: int, b: int) ret int {
    return a + b;
}
```

**Best practice**: Use whitespace to keep code readable (see [Coding Conventions](40-coding-conventions.md)).

### Identifiers

Identifiers (names for variables, functions, types, and so on) must:

- Start with a letter (`a-z`, `A-Z`) or underscore (`_`)
- Contain only letters, digits (`0-9`), and underscores
- Not be a reserved keyword

```adgLang
# ✅ Valid identifiers
myVariable
_private
count123
MAX_VALUE
camelCase
snake_case

# ❌ Invalid identifiers
123start          # Cannot start with digit
my-variable       # Hyphens not allowed
struct             # Reserved keyword
```

**Reserved Keywords** (cannot be used as identifiers):

```
frame    local    global   import   export   extern
return   if       else     loop     switch   case
default  try      catch    throw    break
continue cast     sizeof   match    type     struct
fallthrough
true     false    nullptr  ret      this
```

### Case Sensitivity

adgLang is **case-sensitive**:

```adgLang
local myvar: int = 1;
local MyVar: int = 2;
local MYVAR: int = 3;

# These are three different variables
printf("%d %d %d\n", myvar, MyVar, MYVAR);  # Prints: 1 2 3
```

## Comments

Comments are ignored by the compiler and are meant for notes, docs, and explanations.

### Single-Line Comments

Start with `#` and run to the end of the line:

```adgLang
# This is a single-line comment

local x: int = 42;  # This is also a comment

# You can have multiple consecutive comments
# Each line needs its own # symbol
# Like this
```

Single-line comments can go almost anywhere:

```adgLang
local x: int = 42;   # Initialize x
                     # More explanation
if (x > 0) {         # Check if positive
    printf("Positive\n");
}  # end if
```

### Multi-Line Comments

These are wrapped between `/#` and `#/`:

```adgLang
/#
This is a multi-line comment.
It can span multiple lines.
Everything between /# and #/ markers is ignored.
#/

frame main() ret int {
    /#
    You can put multi-line comments
    inside function bodies too.
    #/
    return 0;
}
```

### Documentation Comments

adgLang does not have dedicated doc comment syntax (like `///` or `/**`), but regular comments work fine for documentation:

```adgLang
/#
Function: calculateSum
Purpose: Adds two integers and returns the result
Parameters:
  - a: First integer
  - b: Second integer
Returns: Sum of a and b
#/
frame calculateSum(a: int, b: int) ret int {
    return a + b;
}
```

### Nested Comments

Multi-line comments **DO NOT NEST**:

```adgLang
###
This is a comment
  ### This starts a NEW comment, closing the previous one
  This text is NOT commented!
###
```

To comment out code that already contains comments, use single-line comments:

```adgLang
# ###
# local x: int = 42;  # Initialize
# ###
```

## Comment Best Practices

### 1. Explain Why, Not What

```adgLang
# ❌ Bad - Obvious what the code does
local count: int = 0;  # Set count to 0

# ✅ Good - Explains why
local count: int = 0;  # Reset for next iteration
```

### 2. Keep Comments Up-to-Date

```adgLang
# ❌ Bad - Comment doesn't match code
# Calculate average
local sum: int = a + b;  # This just sums, doesn't average!

# ✅ Good
# Calculate sum of inputs
local sum: int = a + b;
```

### 3. Use Comments for Complex Logic

```adgLang
# Convert RGB to grayscale using luminance formula
# Human eye is more sensitive to green (0.59) than red (0.30) or blue (0.11)
local gray: int = cast<int>((r * 0.30) + (g * 0.59) + (b * 0.11));
```

### 4. Comment Temporary Code

```adgLang
# TODO: Optimize this algorithm (currently O(n²))
# FIXME: Handle edge case when array is empty
# HACK: Temporary workaround for issue #123
# NOTE: This assumes input is always positive
```

### 5. Section Dividers

Use comments to split code into sections:

```adgLang
# ========================================
# Configuration Constants
# ========================================
global MAX_USERS: int = 100;
global TIMEOUT_MS: int = 5000;

# ========================================
# Helper Functions
# ========================================
frame validateInput(x: int) ret bool {
    return x >= 0;
```

## String Literals

Strings use double quotes and support escape sequences:

```adgLang
local msg: string = "Hello, World!";
local path: string = "C:\\Users\\Documents";  # Escaped backslash
local quote: string = "He said \"Hello\"";    # Escaped quotes
local newline: string = "Line 1\nLine 2";     # Newline character
```

**Common escape sequences:**

- `\n` - Newline
- `\t` - Tab
- `\\` - Backslash
- `\"` - Double quote
- `\r` - Carriage return
- `\0` - Null terminator

### Interpolated Strings

Interpolated strings use backticks (`` ` ``) and let you embed expressions with `${...}`:

```adgLang
local name: string = "ADGLANG";
local msg: string = `Hello, ${name}!`;
local calc: string = `1 + 2 = ${1 + 2}`;
```

## Character Literals

Single characters use single quotes:

```adgLang
local ch: char = 'A';
local newline: char = '\n';
local tab: char = '\t';
local quote: char = '\'';  # Escaped single quote
```

## Number Literals

### Integer Literals

```adgLang
local decimal: int = 42;        # Decimal
local negative: int = -100;     # Negative
local zero: int = 0;            # Zero
```

adgLang does **not** currently support:

- Hexadecimal literals (`0x2A`)
- Octal literals (`0o52`)
- Binary literals (`0b101010`)
- Number separators (`1_000_000`)

Use decimal only.

### Floating-Point Literals

```adgLang
local pi: float = 3.14159;
local small: float = 0.001;
local large: float = 1000.0;
local negative: float = -2.5;
```

adgLang does **not** currently support:

- Scientific notation (`1.5e10`)
- Float suffixes (`3.14f`)

## Boolean Literals

```adgLang
local isTrue: bool = true;
local isFalse: bool = false;
```

## Nullptr Literals

```adgLang
local ptr: *int = nullptr;     # Pointer-specific nullptr
```

**Difference:**

- `nullptr` - Specifically for pointers (more type-safe)

## Statements vs Expressions

### Statements

Actions that do not produce a value:

- Variable declarations
- Function calls (used as statements)
- Return statements
- Control flow (if, loop, etc.)

```adgLang
local x: int = 5;         # Statement
printf("Hello\n");        # Statement
return 0;                 # Statement
```

### Expressions

Computations that produce a value:

- Literals (`42`, `"hello"`, `true`)
- Variables (`x`, `myVar`)
- Operators (`a + b`, `x > 5`)
- Function calls (`add(1, 2)`)
- Ternary (`x > 0 ? 1 : -1`)

```adgLang
42                        # Expression
x + y                     # Expression
add(5, 3)                 # Expression
x > 0 ? "pos" : "neg"     # Expression
```

Expressions can also be used as statements:

```adgLang
add(5, 3);    # Expression used as statement (value discarded)
x + y;        # Valid but useless (value discarded)
```

## Line Continuation

adgLang has no explicit line continuation syntax. Just break long lines in natural places:

```adgLang
# ✅ Break at operators
local result: int = longVariableName +
                    anotherLongName +
                    yetAnotherValue;

# ✅ Break at commas
frame myFunction(
    param1: int,
    param2: string,
    param3: bool
) ret int {
    return 0;
}

# ✅ Break in function calls
printf("Long message: %d %d %d\n",
       firstValue,
       secondValue,
       thirdValue);
```

## Code Organization

### File Structure

Typical adgLang file structure:

```adgLang
# File: mymodule.adg

# 1. Comments/documentation
###
Module: mymodule
Description: Provides utility functions
###

# 2. Imports
import [Helper] from "./helper.adg";
extern printf(fmt: string, ...);

# 3. Type definitions
struct MyStruct {
    value: int
}

type MyAlias = int;

# 4. Global variables
global CONSTANT: int = 100;

# 5. Functions
frame myFunction() ret int {
    return 0;
}

# 6. Exports
export myFunction;
export [MyStruct];
```

## Summary

**Key Syntax Rules:**

- Most statements end with `;`
- Blocks use `{ }`
- Whitespace is generally ignored
- Case-sensitive identifiers
- Comments: `#` for single-line, `###` for multi-line

**Next Steps:**

- [Types and Variables](05-types-variables.md) - Learn about data types
- [Operators](06-operators.md) - Understand operators and expressions
- [Coding Conventions](40-coding-conventions.md) - Style guidelines

## Examples

See these examples for more syntax patterns:

- `examples/hello-world/` - Basic syntax
- `examples/primitives/` - Literals and types
- `examples/globals/` - Global variables
