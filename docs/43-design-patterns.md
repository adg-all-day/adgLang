# Design Patterns

Common patterns used in adgLang.

## Factory Pattern

Use static methods to create instances.

```adgLang
struct User {
    name: string;
    frame create(name: string) ret User {
        local u: User;
        u.name = name;
        return u;
    }
}
```

## RAII (Resource Acquisition Is Initialization)

Use structs to manage resources, but keep in mind that cleanup is still manual for now (there are no automatic destructors yet).
