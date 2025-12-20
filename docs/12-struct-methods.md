# Struct Methods

Structs can define methods that belong to them.

## Instance Methods

Instance methods take `this` as the first parameter. The type of `this` needs to be either the struct type itself or a pointer to it.

```adgLang
frame sqrt(x: float) ret float { return x; }

struct Vector {
    x: int,
    y: int,

    frame length(this: *Vector) ret float {
        return sqrt(cast<float>(this.x * this.x + this.y * this.y));
    }
}
```

## Static Methods

Static methods live inside the struct but do not take `this`.

```adgLang
struct Vector {
    x: int,
    y: int,

    frame zero() ret Vector {
        local v: Vector;
        v.x = 0;
        v.y = 0;
        return v;
    }
}
```

## Calling Methods

```adgLang
extern printf(fmt: string, ...);
frame sqrt(x: float) ret float { return x; }

struct Vector {
    x: int,
    y: int,

    frame zero() ret Vector {
        local v: Vector;
        v.x = 0;
        v.y = 0;
        return v;
    }

    frame length(this: *Vector) ret float {
        return sqrt(cast<float>(this.x * this.x + this.y * this.y));
    }
}

frame main() ret int {
    local v: Vector = Vector.zero();
    local len: float = v.length();
    printf("%f", len);
    return 0;
}
```

## Explicit Method Invocation

You can also call member methods statically by using the struct name and passing the object instance or pointer as the first argument yourself.

```adgLang
local v: Vector;
v.x = 3;
v.y = 4;

# Standard method call syntax
v.length();

# Explicit static call syntax
Vector.length(&v);
```

This is especially useful for:

1. **Calling Parent Methods**: Simulating `super` calls in inheritance (see [Inheritance](13-inheritance.md)).
2. **Disambiguation**: When multiple methods may have similar names or when you're working with function pointers.

## Bound Methods

You can assign methods to variables. If you access an instance method without calling it, you get a "bound method" (a `Lambda`) that captures the object instance (`this`).

```adgLang
struct Counter {
    val: int,
    frame increment(this: *Counter) {
        this.val = this.val + 1;
    }
}

frame main() {
    local c: Counter = Counter { val: 0 };

    # 'inc' is a Lambda that captures 'c'
    local inc: Lambda<void>() = c.increment;

    inc(); # Calls c.increment(), c.val becomes 1
    inc(); # c.val becomes 2
}
```

If the method takes a pointer receiver (`this: *Type`), the bound method keeps reference semantics. Changes made through the bound method affect the original object.
