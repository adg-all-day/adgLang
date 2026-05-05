# Reflection and Generic JSON

adgLang now includes **Runtime Type Information (RTTI)** and **Reflection**, which makes it possible to build solid generic libraries like JSON serialization without boilerplate.

## Reflection Basics

The `typeof<T>()` operator returns a pointer to `TypeInfo`, which describes a type at runtime.

### TypeInfo Structure

At the center of the reflection system is the `TypeInfo` struct, defined in `std/reflection.adg`:

```adgLang
struct TypeInfo {
    name: string,       # Type name (e.g., "int", "Point", "Array<int>")
    size: ulong,        # Size in bytes
    kind: u8,           # 0=Prim, 1=Struct, 2=Array, 3=Pointer, 4=Enum, 5=Func

    # For Structs
    num_fields: int,
    fields: *FieldInfo,
    num_methods: int,
    methods: *MethodInfo,

    # For Arrays/Pointers
    element_type: *TypeInfo
}

struct FieldInfo {
    name: string,
    offset: ulong,
    type_info: *TypeInfo
}

struct MethodInfo {
    name: string,
    func_ptr: *void
}
```

### Usage Example

```adgLang
import [TypeInfo], {TYPE_KIND_STRUCT} from "std/reflection.adg";

struct Point { x: int, y: int }

frame main() {
    local info: *TypeInfo = typeof<Point>();
    printf("Type: %s, Size: %d\n", info.name, info.size);

    if (info.kind == TYPE_KIND_STRUCT) {
        printf("Fields: %d\n", info.num_fields);
    }
}
```

## Generic JSON Library

The generic JSON library in `std/json.adg` uses reflection to automatically serialize and parse structs, arrays, and primitive values.

### Serialization

Use `JSON.stringify<T>(obj: *T)` to turn any object into a JSON string.

```adgLang
import [JSON] from "std/json.adg";

struct User {
    id: int,
    name: string,
    active: bool
}

frame main() {
    local u: User;
    u.id = 1;
    u.name = "Alice";
    u.active = true;

    local json: String = JSON.stringify<User>(&u);
    IO.log(json.toString());
    # Output: {"id":1,"name":"Alice","active":true}
}
```

### Parsing

Use `JSON.parse<T>(json: string)` to turn a JSON string into a new object.

```adgLang
frame main() {
    local json: string = "{\"id\":2,\"name\":\"Bob\",\"active\":false}";
    local uPtr: *User = JSON.parse<User>(json);

    printf("User: %s\n", uPtr.name);
    free(cast<string>(uPtr)); # Clean up if necessary
}
```

### Custom Serialization (`toJson`)

If you want custom serialization for a struct, implement a `toJson` method. The generic serializer looks for that method through reflection.

```adgLang
struct Date {
    timestamp: long,

    frame toJson(this: *Date) ret string {
        # Custom logic to format date
        local sb: StringBuilder = StringBuilder.new();
        sb.append("\"");
        sb.append(generic_format_date(this.timestamp));
        sb.append("\"");
        return sb.toString(); # Note: return raw JSON string
    }
}
```

### Supported Types

- **Primitives**: `int`, `float`, `bool`, `string`, `char`, `long`, `ushort`, `uint`, `ulong`.
- **Structs**: All fields are serialized automatically.
- **Arrays**: `Array<T>` is supported dynamically.
- **Pointers**: `*T` is serialized as the value it points to (or `null` if nullptr).
- **Enums**: (Partial support) Serialized as variant name or object depending on implementation.

## Performance Considerations

In adgLang, generating the metadata adds no compile-time overhead, but using reflection at runtime still involves pointer chasing. `typeof<T>()` returns a constant pointer resolved at compile-time/link-time.

The JSON library uses generic recursion. It is efficient, but it will still be slower than specialized hand-written serialization code. For extremely performance-sensitive paths, consider writing custom serialization methods.
