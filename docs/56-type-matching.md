# Type Matching

## Overview

adgLang gives you the `match<Type>(value)` expression for runtime type checks. It lets you check whether a value matches a specific type or enum variant at runtime. This is especially useful with algebraic data types like enums, and it also lays the groundwork for future generic type-checking features.

## Basic Usage

### Checking Enum Variants

The most common case is checking whether an enum value corresponds to a specific variant. That is often cleaner than writing a full `match` statement when you only care about one branch.

**Syntax:** `match<EnumName.Variant>(value)`

```adgLang
enum Option<T> {
    Some(T),
    None,
}

frame processOption(opt: Option<int>) ret int {
    # Check if the option is 'Some'
    if (match<Option.Some>(opt)) {
        printf("Value is present\n");
        # You can then safely extract the value (e.g., via pattern matching)
        return 1;
    } else {
        printf("Value is absent\n");
        return 0;
    }
}
```

### Return Type

The `match<Type>(value)` expression always returns a `bool`:

- `true`: If the value matches the specified type or variant.
- `false`: Otherwise.

## Advanced Usage

### Using in Logical Expressions

Because `match<Type>` returns a boolean, you can combine it with other logical operators:

```adgLang
if (match<Option.Some>(opt) && isValid(opt)) {
    process(opt);
}
```

### Early Returns (Guard Clauses)

A common pattern is to use `match<Type>` for early returns so you can avoid extra nesting:

```adgLang
frame getValue(opt: Option<int>) ret int {
    # Quick check for None case
    if (match<Option.None>(opt)) {
        return 0;  # Early return
    }

    # Proceed with logic for Some case
    # ...
    return 1;
}
```

## Implementation Details

### Enum Variant Matching

For enum variants, the compiler implements `match<Type>` by checking the enum value's **discriminant** tag.

1. **Discriminant Extraction**: The compiler generates code to read the hidden tag field of the enum.
2. **Comparison**: It compares this tag against the known index of the requested variant.
3. **Result**: The result of this integer comparison is returned as a boolean.

This is an O(1) operation and avoids heavy runtime type information (RTTI) overhead.

## Struct Pointer Type Checking

adgLang also gives you runtime type checks for struct pointers through the `is` and `as` operators. That makes polymorphic inheritance-based patterns possible.

### The `is` Operator

The `is` operator checks whether a struct pointer's runtime type matches, or is derived from, a target type.

**Syntax:** `pointer is *TargetType`

```adgLang
struct Animal { name: string }
struct Dog : Animal { breed: string }

frame processAnimal(animal: *Animal) {
    if (animal is *Dog) {
        printf("It's a dog!\n");
    } else {
        printf("It's some other animal\n");
    }
}

frame main() ret int {
    local dog = Dog { name: "Buddy", breed: "Golden Retriever" };
    local animal: *Animal = &dog;  # Upcast to base type

    processAnimal(animal);  # Prints: "It's a dog!"
    return 0;
}
```

**Implementation:** At runtime, the `is` operator compares vtable pointers. Each struct type in an inheritance hierarchy has its own vtable, so type identification stays O(1).

### The `as` Operator (Safe Downcast)

The `as` operator tries a safe downcast and returns `nullptr` when the types do not match.

**Syntax:** `pointer as *TargetType`

```adgLang
struct Animal { name: string }
struct Dog : Animal { breed: string }
struct Cat : Animal { indoor: bool }

frame processDog(animal: *Animal) {
    local dog = animal as *Dog;
    if (dog != nullptr) {
        printf("Dog breed: %s\n", dog.breed);
    } else {
        printf("Not a dog\n");
    }
}

frame main() ret int {
    local dog = Dog { name: "Buddy", breed: "Lab" };
    local cat = Cat { name: "Whiskers", indoor: true };

    processDog(cast<*Animal>(&dog));  # Prints: "Dog breed: Lab"
    processDog(cast<*Animal>(&cat));  # Prints: "Not a dog"
    return 0;
}
```

**Implementation:** The `as` operator checks the vtable at runtime. If the pointer's actual type matches the target type, it returns the cast pointer. Otherwise, it returns `nullptr`.

### Combining `is` and `as`

A common pattern is to use `is` for the check and then call `as` right away:

```adgLang
frame handleAnimal(animal: *Animal) {
    if (animal is *Dog) {
        local dog = animal as *Dog;  # Safe - we know it's a Dog
        printf("Dog: %s (%s)\n", dog.name, dog.breed);
    } else if (animal is *Cat) {
        local cat = animal as *Cat;
        printf("Cat: %s (indoor: %d)\n", cat.name, cat.indoor);
    }
}
```

### Limitations

- **Struct pointers only**: Runtime type checks with `is` and `as` only work on struct pointer types that participate in inheritance hierarchies.
- **VTable requirement**: Both the source and target types need vtables, either because they have methods or because they are part of an inheritance relationship.
- **No deep hierarchy checking**: Right now, `is` checks for an exact match with the target type, not whether the type appears anywhere higher in the inheritance chain.

### Future: Generic Type Matching

The `match<Type>` syntax is meant to support checks against arbitrary types in the future, for example `match<int>(someGenericValue)`. Right now that is only partially implemented and still needs a full RTTI system to work reliably for every type.

## Best Practices

- **Prefer Pattern Matching for Data Extraction**: If you need the data inside a variant, use the `match` statement instead. `match<Type>` works best for boolean checks.

 ```adgLang
  # Preferred if you need 'x'
 match (opt) {
 Option.Some(x) => { ... },
 Option.None => { ... }
 }

  # Preferred if you just need to check existence
 if (match<Option.Some>(opt)) { ... }
 ```

- **Use `is` and `as` for Polymorphic Code**: When working with struct inheritance, use `is` for type checks and `as` for safe downcasts.

 ```adgLang
  # Pattern: Safe downcast with null check
 local dog = animal as *Dog;
 if (dog != nullptr) {
      # Work with dog
 }
 ```

- **Use for Control Flow**: Use `match<Type>` to steer control flow based on the "shape" of your data.
