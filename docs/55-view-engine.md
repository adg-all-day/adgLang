# View Engine (adgLang-templ)

adgLang ships with a compiled, type-safe view engine through the `adgLang-templ` package. The syntax is similar to Razor and other text-based template engines, but it transpiles straight into adgLang structs.

## Overview

The view engine lets you write `.bte` files that mix HTML, or any other text, with adgLang code.

- **Type Safe**: Templates declare their arguments.
- **Compiled**: Templates turn into native adgLang structs and participate in the build process.
- **Secure**: Interpolated strings are HTML-escaped by default.

## Syntax

### Directives

Header directives define the template interface.

```html
@import [User] from "../models.adg" @args user: *User
```

### Interpolation

Use `{{ }}` to print values.

```html
<!-- Escaped (default) -->
<p>Hello, {{ user.name }}</p>

<!-- Raw (Unescaped) -->
{{ !Navbar.render(user) }}
```

### Control Flow

Native control flow works here too.

```html
@if (user.isLoggedIn) {
<p>Welcome back!</p>
} @else {
<a href="/login">Login</a>
} @loop (i < 5) {
<span>{{ i }}</span>
{{ i = i + 1; "" }} }
```

## Compilation

Templates are compiled with the `adgLang-templ` CLI tool.

```bash
adgLang run packages/adgLang-templ/src/cli.adg generate src/views -o src/views
```

That generates `.adg` files such as `src/views/MyView.adg`, each defining a struct like `MyView` with a `render` method.

## Usage in Code

Because templates become structs, you use them the same way you use any other object.

```adgLang
import [MyView] from "./views/MyView.adg";

frame handleRequest(req: *Request, res: *Response) {
    local html: string = MyView.render(userData);

    # Clean up the allocated string
    defer MyView.free(html);

    res.html(html);
}
```

## More Information

For the full docs, see [packages/adgLang-templ/README.md](../packages/adgLang-templ/README.md).
