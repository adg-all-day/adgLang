# Constructors and Destructors

adgLang is not a fully object-oriented language like C++, but it does support practical patterns for managing an object's lifecycle.

## Constructors

Constructors are usually static methods that return a new struct instance.

```adgLang
struct String {
    data: *char,
    len: int,

    frame new(s: *char) ret String {
        local str: String;
        str.data = s; # Simplified
        str.len = 0;  # Simplified
        return str;
    }
}
```

## Implicit Constructors

adgLang can call constructors implicitly for local variables. If a struct defines a method named `new` whose first argument is a pointer to the instance (`this`), the compiler will call that method automatically when you declare a variable of that struct type without an explicit initializer.

### Concrete Structs

For a regular struct, just define a `new` method.

```adgLang
struct Point {
    x: int,
    y: int,

    frame new(this: *Point) {
        this.x = 0;
        this.y = 0;
        printf("Point initialized\n");
    }
}

frame main() {
    local p: Point; # Implicitly calls p.new()
}
```

### Generic Structs

Implicit constructors work with generic structs too. That gives you a way to customize initialization based on the type parameter.

If you need to inspect a generic parameter `T` inside the constructor without risking recursive constructor calls or other side effects, use the pattern of declaring a dummy variable initialized to 0.

```adgLang
extern memcpy(dest: *void, src: *void, n: int) ret *void;

struct Point<T> {
    x: T,
    y: T,

    frame new(this: *Point<T>) {
        # Use a dummy variable initialized to 0 to check the type T.
        # This avoids triggering any potential constructors for T itself.
        local dummy: T = 0;

        if ((dummy is int)) {
            local val_x: int = 10;
            local val_y: int = 20;
            # Use memcpy for generic field assignment to bypass type checking limitations
            memcpy(cast<*void>(&this.x), cast<*void>(&val_x), sizeof(int));
            memcpy(cast<*void>(&this.y), cast<*void>(&val_y), sizeof(int));
        } else if ((dummy is char)) {
            local val_x: char = 'a';
            local val_y: char = 'b';
            memcpy(cast<*void>(&this.x), cast<*void>(&val_x), sizeof(char));
            memcpy(cast<*void>(&this.y), cast<*void>(&val_y), sizeof(char));
        }
    }
}

frame main() {
    local p: Point<int>; # Implicitly calls Point<int>.new(&p)
}
```

## Destructors

Destructors are methods for cleaning up resources. adgLang does not call destructors automatically, so you need to call them yourself.
If you have structs that inherit from other structs, calling one destructor will automatically trigger the others.

```adgLang
extern free(ptr: *void);

struct String {
    data: *char,
    len: int,

    frame destroy(this: *String) ret void {
        free(cast<*void>(this.data));
    }
}
```
