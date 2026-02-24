# adgLang-templ

**adgLang-templ** is a simple compiled template engine for the Best Programming Language (adgLang). It compiles `.bte` (adgLang Template) files into type-safe adgLang structs.

## Features

- **Compiled**: Templates compile directly into adgLang code, so there is zero parsing overhead at runtime.
- **Type Safe**: Arguments are typed in the template header.
- **Automatic Escaping**: Output is HTML-escaped by default to prevent XSS.
- **Components**: Templates compile to structs, which makes composition through method calls easy.

## Installation

This package gives you a CLI tool for compiling templates.

```bash
cd packages/adgLang-templ
bun install
bun run build
# The binary is now at dist/adgLang-templ
```

## Usage

### CLI

To compile a directory of templates:

```bash
adgLang run packages/adgLang-templ/src/cli.adg generate ./src/views -o ./src/views
```

Arguments:

- `<input_dir>`: Directory containing `.bte` files.
- `-o <output_dir>`: Destination for generated `.adg` files.
- `--ext <extension>`: output extension (default `.adg`).

### Template Syntax (`.bte`)

#### 1. Header Directives

Templates **must** start with header directives that define arguments and imports.

- **`@args <signature>`**: Defines the arguments for the generated `render` function.
- **`@import <module>`**: Imports external adgLang modules (e.g., structs used in args).

```html
@import [User] from "../models.adg" @args user: *User, title: string
```

#### 2. Interpolation

- **Escaped Output**: `{{ expression }}`
 - Automatically escapes HTML entities (`<`, `>`, `&`, `"`, `'`).
 - Expression must evaluate to a `string`.

 ```html
 <p>Hello, {{ user.name }}</p>
 ```

- **Raw Output**: `{{ !expression }}`
 - Outputs the string directly without escaping.
 - Useful for rendering other templates (partials).

 ```html
 {{ !Navbar.render(user) }}
 ```

#### 3. Control Flow

The compiler supports basic control flow that maps to adgLang keywords. Keep in mind: `}` needs to be on its own line for the naive parser to detect it correctly in some cases.

- **`@if (condition) {`**
- **`@else {`** (or `@else if`)
- **`@loop (condition) {`**

```html
@if (user.is_admin) {
<button>Delete</button>
} @else {
<span>Read only</span>
}
```

loops:

```html
@loop (i < 10) {
<li>Item {{ i }}</li>
{{ i = i + 1; "" }}
<!-- side effect hack if needed, though usually logic should be in controller -->
}
```

### Generated Code Model

A template named `home.bte` compiles into a struct `Home`.

**Input (`home.bte`):**

```html
@args name: string
<h1>Hello {{ name }}</h1>
```

**Output (`home.adg`):**

```adgLang
import [StringBuilder] from "std/string_builder.adg";
import [HTMLEscape_appendEscaped] from "adgLang-templ";

struct Home {
    frame render(name: string) ret string {
        local _sb = StringBuilder.new(1024);
        _sb.append("<h1>Hello ");
        HTMLEscape_appendEscaped(&_sb, name);
        _sb.append("</h1>\n");
        return _sb.toString();
    }
}
export [Home];
```

## Runtime Dependencies

The generated code depends on:

1. `std/string_builder.adg` (Standard Library)
2. `adgLang-templ` runtime (for `HTMLEscape_appendEscaped`)

Make sure your project links against these.

## Example

See `examples/tiki/src/views` for a complete usage example in a real application.
