# Inheritance

adgLang supports single inheritance for structs. If you do not specify a parent, the struct implicitly inherits from the root `Type` struct.

## Syntax

Use the `:` operator to name the parent struct.

```adgLang
struct Animal {
    name: string,
    frame makeSound(this: *Animal) {
        printf("Animal sound\n");
    }
}

struct Dog : Animal {
    breed: string,
    # Override the makeSound method
    frame makeSound(this: *Dog) {
        printf("Woof!\n");
    }
}
```

## Memory Layout

The parent struct's fields are placed at the start of the child struct. That makes pointer casting from `Child*` to `Parent*` safe.

If a struct has virtual methods, meaning methods that are inherited or overridden, it includes a hidden **vtable pointer** as its first field at offset 0. The actual data fields come after that pointer.

```adgLang
struct Animal {
    name: string
}

struct Dog : Animal {
    breed: string
}

frame main() ret int {
    local d: Dog;
    d.name = "Rex";
    d.breed = "Labrador";

    # Upcasting
    local a: *Animal = &d;
    a.makeSound(); # Calls Dog.makeSound via vtable

    return 0;
}
```

## Method Overriding & Virtual Dispatch

Methods declared in a parent struct can be overridden in a child struct by defining a method with the same name.

- **Virtual Dispatch**: When you call a method on a pointer to a parent type, the runtime looks up the real implementation in the object's vtable. That is why the correct method, such as `Dog.makeSound`, is called even when the variable type is `*Animal`.
- **VTable**: The compiler automatically creates a Virtual Method Table (vtable) for each struct involved in inheritance.

## Calling Parent Methods (Super)

adgLang does not have a `super` keyword. Instead, call the parent implementation explicitly with the parent struct name and pass the object pointer (`this`) as the first argument.

That skips virtual dispatch and calls the exact implementation defined on the parent struct.

```adgLang
struct Animal {
    frame speak(this: *Animal) {
        printf("Animal speaks\n");
    }
}

struct Dog : Animal {
    frame speak(this: *Dog) {
        printf("Dog barks\n");

        # Call parent implementation (super.speak())
        Animal.speak(this);
    }
}
```

## The `Type` Root Struct

All user-defined structs implicitly inherit from `Type`, which is defined in `std/type.adg`. That gives you common methods such as:

- `getTypeName() ret string`
- `toString() ret string`
- `destroy()`

You can override these methods in your own structs to provide custom string output or cleanup behavior.

```adgLang
struct Point {
    x: int,
    y: int,

    frame toString(this: *Point) ret string {
        return "Point(" + this.x.toString() + ", " + this.y.toString() + ")";
    }
}
```
