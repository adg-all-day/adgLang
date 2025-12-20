# Module Resolution

When you import a module, the compiler checks a defined set of locations to find the file.

## Relative Imports

Imports that start with `./` or `../` are resolved relative to the current file.

```adgLang
import [foo] from "./utils.adg";
```

## Absolute Imports

Imports without a relative-path prefix are resolved from the project root or from configured include paths.

```adgLang
import [std] from "std";
```

## File Extensions

The `.adg` extension does not have to be included in import statements.

```adgLang
import [foo] from "./utils"; # Resolves to ./utils.adg
```
