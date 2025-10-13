# adgLang Package Manager

The adgLang Package Manager is how you create, install, and use reusable code packages in adgLang projects.

## Package Structure

An adgLang package is described by an `adgLang.json` manifest in the package root:

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "description": "My awesome package",
  "main": "index.adg",
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {}
}
```

### Required Fields

- `name`: Package name (alphanumeric, hyphens, underscores, scopes allowed)
- `version`: Semantic version (e.g., "1.0.0")

### Optional Fields

- `description`: Short package description
- `main`: Entry point file (defaults to "index.adg")
- `author`: Package author
- `license`: License type
- `dependencies`: Map of package dependencies

## CLI Commands

### Initialize a New Package

```bash
adgLang init
```

Creates a new `adgLang.json` in the current directory using default values.

### Pack a Package

```bash
adgLang pack [directory]
```

Builds a `.tgz` archive for the package. If you do not pass a directory, it uses the current one.

Example:

```bash
cd my-package
adgLang pack
# Creates: my-package-1.0.0.tgz
```

### Install a Package

Install from a local tarball:

```bash
adgLang install ./my-package-1.0.0.tgz
```

Install to global location:

```bash
adgLang install ./my-package-1.0.0.tgz --global
```

Installation locations:

- **Local**: `./adgLang_modules/package-name/`
- **Global**: `~/.adg/packages/package-name/`

### List Installed Packages

List local packages:

```bash
adgLang list
```

List global packages:

```bash
adgLang list --global
```

### Uninstall a Package

Uninstall a local package:

```bash
adgLang uninstall <package-name>
# or use the alias
adgLang remove <package-name>
```

Uninstall a global package:

```bash
adgLang uninstall <package-name> --global
# or
adgLang remove <package-name> --global
```

Example:

```bash
adgLang uninstall math-utils --global
```

## Using Packages

After a package is installed, import from it by package name:

```adgLang
# Import from installed package
import add, subtract from "math-utils";

extern printf(fmt: string, ...) ret int;

frame main() ret int {
    local result: int = add(5, 3);
    printf("5 + 3 = %d\n", result);
    return 0;
}
```

### Package Resolution Order

When resolving an import, adgLang checks in this order:

1. **Relative imports** (./path or ../path)
2. **Standard library** (built-in modules like "std", "io", "math")
3. **Installed packages**:
 - Local packages in `./adgLang_modules/`
 - Global packages in `~/.adg/packages/`
4. **Additional search paths** (if configured)

## Example: Creating a Package

### 1. Create Package Structure

```
math-utils/
├── adgLang.json
├── index.adg
└── README.md
```

### 2. Define Package Manifest (adgLang.json)

```json
{
  "name": "math-utils",
  "version": "1.0.0",
  "description": "Mathematical utility functions for ADGLANG",
  "main": "index.adg",
  "author": "Your Name",
  "license": "MIT"
}
```

### 3. Implement Package Code (index.adg)

```adgLang
export add;
export subtract;
export multiply;
export divide;

frame add(a: int, b: int) ret int {
  return a + b;
}

frame subtract(a: int, b: int) ret int {
  return a - b;
}

frame multiply(a: int, b: int) ret int {
  return a * b;
}

frame divide(a: int, b: int) ret int {
  return a / b;
}
```

### 4. Pack and Install

```bash
cd math-utils
adgLang pack
adgLang install ./math-utils-1.0.0.tgz --global
```

### 5. Use in Your Project

```adgLang
import add, multiply from "math-utils";

frame main() ret int {
    local x: int = add(2, 3);
    local y: int = multiply(x, 4);
    return y;  # Returns 20
}
```

## Package Caching

When you compile with the `--cache` flag, package resolution and compilation are cached so later builds are faster:

```bash
adgLang main.adg --cache
```

## Best Practices

1. **Versioning**: Use semantic versioning (MAJOR.MINOR.PATCH)
2. **Documentation**: Include a README.md with usage examples
3. **Exports**: Export only the public API of your package
4. **Testing**: Include tests for your package functions
5. **Dependencies**: Put every package dependency in `adgLang.json`

## Troubleshooting

### Module not found

If you hit a "Module not found" error:

- Make sure the package is installed (`adgLang list`)
- Make sure the import name exactly matches the package name
- Try reinstalling the package

### Package name conflicts

If both a local and a global package share the same name:

- The local package wins
- Remove one of them to avoid confusion

### Permission errors

For global installs:

- Make sure you can write to `~/.adg/packages/`
- Or install locally instead
