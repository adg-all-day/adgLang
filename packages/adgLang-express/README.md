# adgLang-express

A lightweight web framework for adgLang, inspired by Express.js.

## Features

- **Routing**: Supports GET, POST, PUT, DELETE methods.
- **Parameters**: Extracts URL parameters (e.g., `/users/:id`).
- **Middleware**: Supports both global and router-level middleware.
- **Sub-routers**: Mountable routers for modular API design.
- **Static Files**: Serves static assets.

## Installation

```bash
adgLang install adgLang-express
# or via relative path in development
```

## Usage

### Basic Server

```adgLang
import [App], [Request], [Response] from "adgLang-express";

frame main() {
    local app: App = App.new();

    app.router.get("/", |req: *Request, res: *Response| {
        res.send("Hello World");
    });

    app.listen(3000);
}
```

### Middleware

Middleware functions run in order before route handlers. They can modify the request/response or handle cross-cutting concerns like logging.

```adgLang
frame logger(req: *Request, res: *Response) {
    printf("Request: %s\n", req.path);
}

app.use(cast<RouteHandler>(logger));
```

### Sub-Routers

You can build modular routers and mount them at specific paths.

```adgLang
local api: Router = Router.new();
api.get("/users", list_users);

# Mounts at /api/users
app.useRouter("/api", &api);
```

### Wildcard Routes

The router supports wildcard matching with `*`. Matches are checked in registration order.

```adgLang
# Matches /files/a.txt, /files/images/b.png, etc.
app.router.get("/files/*", file_handler);
```

### View Engine

adgLang Express works cleanly with **adgLang-templ**, a compiled template engine for adgLang. `adgLang-templ` compiles HTML templates into type-safe adgLang structs.

**Installation:**

```bash
adgLang install adgLang-templ
```

**Example (`views/home.bte`):**

```html
@args name: string
<h1>Hello, {{ name }}!</h1>
```

**Controller:**

```adgLang
import [Home] from "./views/home.adg";

app.router.get("/", |req: *Request, res: *Response| {
    local html: string = Home.render("World");
    res.html(html);
});
```

See [adgLang-templ](../adgLang-templ/README.md) for full documentation.
