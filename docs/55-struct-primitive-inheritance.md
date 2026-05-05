# Struct Primitive Inheritance

adgLang lets structs inherit from primitive types, so you can build specialized types that still behave like primitives while adding extra methods and fields.

## Syntax

```adgLang
struct MyInt : int {
    # Methods can be added
    frame isEven(this: *MyInt) ret bool {
        return (*cast<*int>(this) % 2) == 0;
    }
}
```

## Usage

You can use instances of the struct anywhere the primitive type is expected through implicit conversion.

```adgLang
frame printInt(x: int) {
    printf("%d\n", x);
}

frame main() ret int {
    local m: MyInt = cast<MyInt>(42);

    # Call method on struct
    if (m.isEven()) {
        printf("Even!\n");
    }

    # Pass to function expecting int
    printInt(m); # Implicitly converted to int

    return 0;
}
```

## Casting

You can cast back and forth between the struct and the primitive type:

- `cast<MyInt>(int_value)`: Wraps the integer in the struct.
- `cast<int>(my_int_instance)`: Unwraps the integer from the struct.

## Memory Layout

The struct stores the primitive value as its first field, conceptually `__base__`. If the struct has virtual methods, or inherits from a struct that has them, it will also carry a vtable pointer.

If the struct has no extra fields and no virtual methods, its memory layout matches the primitive type exactly.
