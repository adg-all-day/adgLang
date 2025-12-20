# Package Management

adgLang ships with a built-in package manager for splitting code into reusable libraries and handling dependencies.

## Package Structure

An adgLang package is just a directory with an `adgLang.json` config file plus source files.

```
my-package/
  adgLang.json
  index.adg       # Entry point (optional, but recommended)
  src/
    lib.adg
```

### `adgLang.json`

This file stores the package metadata.

```json
{
  "name": "my-package",
  "version": "0.1.0",
  "description": "A useful library",
  "entry": "index.adg",
  "dependencies": {
    "other-package": "^1.0.0"
  }
}
```

## Creating a Package

1. Make a directory for your package.
2. Add an `adgLang.json` file.
3. Write the package code.
4. Pack it into a distributable archive:

```bash
adgLang pack
```

That creates `my-package-0.1.0.tar.gz` in the current directory.

## Installing Packages

To use a package from another project, install it first. Right now, installation works from a local `.tar.gz` file.

```bash
adgLang install ../path/to/my-package-0.1.0.tar.gz
```

This unpacks the package into your project's `adgLang_modules/` directory.

## Using Packages

Once installed, you can import the package by name in your adgLang code.

```adgLang
import [MyStruct, myFunction] from "my-package";

frame main() {
    myFunction();
}
```

The compiler maps `"my-package"` to `adgLang_modules/my-package/index.adg` (or whatever file `entry` points to).

## Dependency Resolution

When you run `adgLang install`, the package manager:

1. Unpacks the package to `adgLang_modules/<package-name>`.
2. Reads the package's `adgLang.json`.
3. (Future) Resolves and installs dependencies listed in `adgLang.json`.

## Best Practices

- **Entry Point**: Use `index.adg` to re-export your package's public API.
 ```adgLang
  # index.adg
 export [MyStruct] from "./src/structs.adg";
 export [myFunction] from "./src/funcs.adg";
 ```
- **Names**: Pick unique, lowercase package names (kebab-case is recommended).
