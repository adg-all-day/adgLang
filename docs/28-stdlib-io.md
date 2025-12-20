# Standard Library: I/O

The `IO` struct gives you utilities for printing output and reading input.

## Import

```adgLang
import [IO] from "std/io.adg";
```

## Printing Functions

| Function                                     | Description                               |
| -------------------------------------------- | ----------------------------------------- |
| `IO.print(s: string)`                        | Print string without newline              |
| `IO.printString(s: string)`                  | Print string with newline                 |
| `IO.printString(s: String)`                  | Print String object with newline          |
| `IO.printInt(n: int)`                        | Print integer with newline                |
| `IO.log(msg: string)`                        | Alias for printString                     |
| `IO.printf(format: string, a0: int) ret int` | Formatted print (wrapper around C printf) |

## Reading Functions

| Function                                      | Description                             |
| --------------------------------------------- | --------------------------------------- |
| `IO.read(format: string, ptr: *void) ret int` | Formatted read (wrapper around C scanf) |
| `IO.readLine(buf: string) ret int`            | Read line from stdin, returns length    |

## Example

```adgLang
import [IO] from "std/io.adg";

extern printf(fmt: string, ...);

frame main() {
    # Print without newline
    IO.print("Enter your name: ");

    # Read a line
    local buf: char[100];
    local len: int = IO.readLine(cast<string>(&buf));

    # Print with newline
    IO.printString("Hello!");
    IO.log("This is a log message");

    # Print integer
    IO.printInt(42);
}
```

## Low-level I/O

If you need tighter control, you can call C's `printf` directly:

```adgLang
extern printf(fmt: string, ...) ret int;
extern scanf(fmt: string, ...) ret int;

frame main() {
    printf("Hello, %s! You are %d years old.\n", "World", 25);

    local age: int = 0;
    printf("Enter age: ");
    scanf("%d", &age);
}
```
