# Process Execution

The `std/process.adg` module gives you utilities for running shell commands and working with subprocesses. You can run commands, inspect exit status codes, and capture output. All functions effectively act like varargs, joining arguments with spaces to build the final command string.

**Safety Note:** This module automatically escapes every argument to prevent OS command injection. You can safely pass user input as separate arguments to these functions.

## Import

```adgLang
import exec, execStatus, execOutput, [ProcessResult] from "std/process.adg";
```

## API Reference

### Structs

#### `ProcessResult`

Holds the result of a process run that captures output.

```adgLang
struct ProcessResult {
    exitCode: int,      # The exit status code of the process
    output: String      # The captured standard output
}
```

### Safety and Injection Protection

The module automatically handles shell escaping for every argument.

```adgLang
# This is SAFE.
# The shell receives: echo 'hello;' 'echo' 'INJECTED'
# Output is literal "hello; echo INJECTED"
exec("echo", "hello; echo INJECTED");
```

### Functions

All execution functions accept variadic `...string` arguments. Those arguments are space-joined to form the shell command string, and each one is escaped automatically by wrapping it in single quotes with internal escaping.

#### `exec`

Runs a shell command and waits for it to finish. This function returns nothing and ignores the exit code.

```adgLang
frame exec(args: ...string)
```

- **Parameters**:
 - `args`: Parts of the command line.

#### `execShell`

Runs a command string directly without escaping. This is useful for pipelines, redirects, and environment variables, but it needs extra caution. It captures standard output.

```adgLang
frame execShell(cmd: string) ret ProcessResult
```

- **Parameters**:
 - `cmd`: The raw command string.
- **Returns**: A `ProcessResult` struct containing the `exitCode` and `output`.
- **Warning**: This function is vulnerable to command injection if you pass untrusted input.

#### `execSilent`

Runs a shell command safely while redirecting both stdout and stderr to `/dev/null`. This is useful when you just want to know whether a command works without cluttering output.

```adgLang
frame execSilent(args: ...string) ret int
```

- **Parameters**:
 - `args`: Parts of the command line.
- **Returns**: The exit status code.

#### `sleep`

Pauses execution for the given number of milliseconds.

```adgLang
frame sleep(ms: int)
```

#### `execOutput`

Runs a shell command, captures standard output, and returns both the exit code and the output.

```adgLang
frame execOutput(args: ...string) ret ProcessResult
```

- **Parameters**:
 - `args`: Parts of the command line.
- **Returns**: A `ProcessResult` struct containing the `exitCode` and `output`.

> **Note**: The `output` field in `ProcessResult` is a `String` object. You are responsible for managing its lifecycle when needed, though it usually follows the standard ownership rules.

## Examples

### Running a Command

You can pass the command as one string, which is still auto-escaped, or as multiple arguments. If you actually want shell metacharacters to be interpreted, be careful not to hide them inside an auto-escaped single string.

**Best Practice:** Pass the command and its arguments as separate parameters.

```adgLang
import exec, execShell, execSilent from "std/process.adg";

frame main() {
    # Preferred: Separate arguments
    # Safety: "adgLang_test" and "/tmp/..." are escaped, preventing injection
    exec("mkdir", "-p", "/tmp/adgLang_test");

    # Using shell features (piping) - USE execShell
    execShell("ls -la | grep adgLang");

    # Silent check
    if (execSilent("which", "git") == 0) {
        # git is installed
    }
}
```

### Checking Exit Status

This is useful when your control flow depends on whether a command succeeds.

```adgLang
import execStatus from "std/process.adg";
import printf from "libc";

frame main() {
    local status: int = execStatus("git", "status");

    if (status == 0) {
        printf("Git command successful\n");
    } else {
        printf("Git command failed with code %d\n", status);
    }
}
```

### Capturing Output

Use this when you need to work with a command's output.

```adgLang
import execOutput, [ProcessResult] from "std/process.adg";
import printf from "libc";

frame main() {
    # Capturing output from a constructed command
    local res: ProcessResult = execOutput("echo", "Hello", "World");

    # Ensure memory is cleaned up when scope exits
    defer res.output.destroy();

    if (res.exitCode == 0) {
        printf("Output: %s", res.output.data);
}
```
