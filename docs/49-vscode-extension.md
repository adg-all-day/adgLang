# VS Code Extension

adgLang ships with a full VS Code extension. It adds complete language server protocol (LSP) support so everyday editing is faster and less tedious.

## Features

### Syntax Highlighting

TextMate grammar with support for:

- **Keywords**: Control flow (`if`, `loop`, `match`), declarations (`struct`, `enum`, `frame`), modifiers (`export`, `extern`)
- **Types**: Built-in types (`int`, `bool`, `string`) plus user-defined types
- **Comments**: Line comments (`#`) and block comments (`/#...#/`)
- **String Interpolation**: Embedded expressions with `${...}` syntax
- **Operators**: Arithmetic, comparison, logical, and bitwise operators
- **Literals**: Numbers (decimal, hex, binary, octal), booleans, strings

### IntelliSense & Code Completion

Smart, context-aware completion driven by the compiler type checker:

- **Member Access**: Type `user.` to see all fields and methods
- **Partial Matching**: Type `user.getNa` to narrow results to `getName`, `getAge`, and similar matches
- **Method Signatures**: Parameter names and types show up as snippets
- **Import Completions**: Autocomplete imported symbols from packages and the stdlib
- **Generic Types**: Full support for `Array<int>.` completions
- **Enum Variants**: Type `Status.` to see `Active`, `Inactive`, etc.
- **Keyword Suggestions**: adgLang keywords appear where they make sense

### Hover Information

Tooltips show rich type information:

- **Functions**: Full signatures with parameter names and return types
- **Structs**: Fields and methods in one place
- **Enums**: All variants with payload types
- **Specs (Interfaces)**: Method signatures and implementation relationships
- **Variables**: Inferred types on hover
- **Methods**: Which spec/interface they implement
- **Cross-File Support**: Works across imports and packages

### Go to Definition

Jump straight to symbol definitions:

- **Local Symbols**: Functions, structs, enums, and variables in the current file
- **Imported Symbols**: Definitions in imported modules
- **Stdlib Symbols**: Standard library implementations
- **Package Symbols**: Installed package sources

### Inlay Hints

Inline hints for:

- **Parameter Names**: See parameter names in calls: `calculate(→base: 10, →power: 2)`
- **Return Types**: Hover over function declarations to inspect return types
- **Type Parameters**: Generic arguments in more complex expressions

### Diagnostics

Real-time error reporting:

- **Type Errors**: Catch mismatches before compiling
- **Syntax Errors**: Immediate feedback on invalid syntax
- **Import Errors**: Missing or invalid imports
- **Location Information**: Click through to the error location

## Installation

### Quick Install

Use the install script:

```bash
cd vscode-ext
./install.sh
```

This will:

1. Install npm dependencies
2. Compile TypeScript to JavaScript
3. Package the extension as `.vsix`
4. Install into VS Code

### Manual Installation

If you want to do the steps yourself:

```bash
cd vscode-ext
npm install
npm run compile
npx @vscode/vsce package
code --install-extension adgLang-vscode-*.vsix
```

### Marketplace (Coming Soon)

The extension is planned for the VS Code Marketplace for one-click installs.

## Usage

### Basic Navigation

1. **Open an adgLang file** (`.adg` extension) - syntax highlighting turns on automatically
2. **Hover over symbols** - inspect type info and docs
3. **Ctrl/Cmd + Click** - jump to definition
4. **Ctrl/Cmd + Space** - trigger completion

### IntelliSense Examples

**Member Access:**

```adgLang
struct User {
    name: string,
    age: int,
    frame getName(this: *User) ret string {
        return this.name;
    }
}

frame main() ret int {
    local user: User;
    user.   # <- Type here to see: getName, name, age
    return 0;
}
```

**Import Completions:**

```adgLang
import [Array] from "std/array.adg";

frame main() ret int {
    local arr: Array<int>;
    arr.    # <- See: push, pop, len, get, set, map, filter...
    return 0;
}
```

**Enum Completions:**

```adgLang
enum Status {
    Active,
    Inactive,
    Pending
}

frame main() ret int {
    local status: Status = Status.  # <- See: Active, Inactive, Pending
    return 0;
}
```

## Development

To work on the extension:

1. Open the `vscode-ext/` folder in VS Code
2. Install dependencies: `npm install`
3. Press `F5` to launch Extension Development Host
4. Open a `.adg` file and test features
5. Make changes and reload the extension window

### Project Structure

```
vscode-ext/
├── src/
│   ├── extension.ts          # LSP client entry point
│   ├── server.ts             # LSP server implementation
│   ├── services/
│   │   ├── ASTCompletionHandler.ts  # Code completion
│   │   ├── ASTHoverHandler.ts       # Hover tooltips
│   │   ├── ASTDefinitionHandler.ts  # Go-to-definition
│   │   ├── InlayHintProvider.ts     # Parameter hints
│   │   ├── ASTResolver.ts           # Type resolution
│   │   └── SymbolIndex.ts           # Symbol indexing
│   └── test/                 # Test suite
├── syntaxes/
│   └── adgLang.tmLanguage.json   # TextMate grammar
├── language-configuration.json
└── package.json
```

### Testing

Run the test suite:

```bash
cd vscode-ext
bun test
```

Tests cover:

- Code completion (member access, imports, generics)
- Hover information (functions, structs, enums)
- Go-to-definition navigation
- Symbol resolution across files
- Type inference and checking

## Troubleshooting

### Extension Not Activating

- Make sure the file uses the `.adg` extension
- Reload the VS Code window: `Ctrl/Cmd + Shift + P` → "Reload Window"
- Check the Output panel: View → Output → "adgLang Language Server"

### Completions Not Working

- Make sure the file is saved (or use in-memory parsing)
- Check for syntax errors that block parsing
- Verify stdlib and package imports

### Hover Not Showing Information

- Hover directly on the symbol name
- Give the parser a moment to index the file
- Make sure the symbol is defined in the workspace

## Contributing

Contributions are welcome. Please:

1. Fork the repository
2. Make changes in the `vscode-ext/` directory
3. Run tests: `bun test`
4. Test manually in Extension Development Host
5. Submit a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

The VS Code extension is part of the adgLang project and uses the Apache-2.0 License.
