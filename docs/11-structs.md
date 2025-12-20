# Structs

Structs let you bundle related data into one composite type. This guide walks through defining structs, using them, adding methods, working with inheritance, and the main patterns around them.

## Table of Contents

- [Defining Structs](#defining-structs)
- [Struct Members](#struct-members)
- [Creating Instances](#creating-instances)
- [Accessing Members](#accessing-members)
- [Struct Methods](#struct-methods)
- [Constructors and Destructors](#constructors-and-destructors)
- [Inheritance](#inheritance)
- [Nested Structs](#nested-structs)
- [Pointers to Structs](#pointers-to-structs)
- [Arrays of Structs](#arrays-of-structs)

## Defining Structs

### Basic Syntax

```adgLang
type type1 = int;
type type2 = int;

struct StructName {
    member1: type1,
    member2: type2,
    # ... more members
}
```

### Simple Example

```adgLang
struct Point {
    x: int,
    y: int
}

struct Person {
    name: string,
    age: int,
    height: float
}
```

### Empty Structs

```adgLang
struct Empty {
    # No members - valid but rarely useful
}
```

## Struct Members

### Data Members

Members are declared with a name and a type:

```adgLang
struct Rectangle {
    x: int,
    y: int,
    width: int,
    height: int
}

struct Color {
    red: i8,
    green: i8,
    blue: i8,
    alpha: i8
}
```

### Supported Member Types

Any adgLang type can be used as a struct member:

```adgLang
struct Point {
    x: int,
    y: int
}

struct Complex {
    # Primitives
    id: int,
    value: float,
    flag: bool,
    symbol: char,

    # Pointers
    next: *Complex,
    data: *int,

    # Arrays
    buffer: char[256],
    matrix: int[3][3],

    # Strings
    name: string,

    # Other structs
    position: Point
}
```

### Member Initialization

Members are not initialized automatically:

```adgLang
struct Point {
    x: int,
    y: int
}

frame main() ret int {
    local p: Point;
    # p.x and p.y contain garbage values!
    return p.x;
}
```

You need to initialize them yourself:

```adgLang
struct Point {
    x: int,
    y: int
}

frame main() ret int {
    local p: Point;
    p.x = 0;
    p.y = 0;
    return 0;
}
```

Or use an initialization function or constructor:

```adgLang
struct Point {
    x: int,
    y: int
}

frame initPoint(p: *Point) ret void {
    (*p).x = 0;
    (*p).y = 0;
}

frame main() ret int {
    local p: Point;
    initPoint(&p);
    return 0;
}
```

## Creating Instances

### Stack Allocation

```adgLang
struct Point {
    x: int,
    y: int
}

# Declare variable
local p: Point;

# Initialize members
p.x = 10;
p.y = 20;
```

### Heap Allocation

```adgLang
extern malloc(size: int) ret *void;
extern free(ptr: *void);

struct Point {
    x: int,
    y: int
}

# Allocate memory
local p: *Point = cast<*Point>(malloc(sizeof(Point)));

# Initialize members
(*p).x = 10;
(*p).y = 20;

# Remember to free
free(cast<*void>(p));
```

### Array of Structs

```adgLang
extern malloc(size: int) ret *void;
extern free(ptr: *void);

struct Point {
    x: int,
    y: int
}

frame main() ret int {
    # Stack array
    local points: Point[10];
    local i: int = 0;
    loop (i < 10) {
        points[i].x = i;
        points[i].y = i * i;
        i = i + 1;
    }

    # Heap array
    local heap_points: *Point = cast<*Point>(malloc(10 * cast<int>(sizeof(Point))));
    i = 0;
    loop (i < 10) {
        (*(heap_points + i)).x = i;
        (*(heap_points + i)).y = i * i;
        i = i + 1;
    }
    free(cast<*void>(heap_points));
    return 0;
}
```

## Accessing Members

### Dot Operator

Use `.` when you are accessing a struct directly:

```adgLang
struct Point {
    x: int,
    y: int
}

local p: Point;
p.x = 10;
p.y = 20;

local sum: int = p.x + p.y;

printf("Point: (%d, %d)\n", p.x, p.y);
```

### Pointer Access

Use `*` to dereference a pointer before member access, or use `.` directly and let automatic dereference handle it:

```adgLang
extern malloc(size: int) ret *void;

struct Point {
    x: int,
    y: int
}

local p: *Point = cast<*Point>(malloc(sizeof(Point)));
(*p).x = 10;
p.y = 20;  # Automatic dereference

printf("Point: (%d, %d)\n", (*p).x, (*p).y);

# Equivalent to:
(*p).x = 10;
(*p).y = 20;
```

### Nested Member Access

```adgLang
struct Point {
    x: int,
    y: int
}

struct Line {
    start: Point,
    end: Point
}

local line: Line;
line.start.x = 0;
line.start.y = 0;
line.end.x = 100;
line.end.y = 100;

# With pointers
local line_ptr: *Line = &line;
(*line_ptr).start.x = 5;
(*line_ptr).end.y = 50;
```

## Struct Methods

adgLang supports methods, which are functions attached to a struct:

### Defining Methods

```adgLang
frame sqrt(x: float) ret float { return x; }

struct Point {
    x: int,
    y: int,

    # Method declaration inside struct
    frame print(this: *Point) ret void {
        printf("(%d, %d)\n", this.x, this.y);
    }

    frame distance(this: *Point, other: *Point) ret float {
        local dx: int = this.x - (*other).x;
        local dy: int = this.y - (*other).y;
        return sqrt(cast<float>(dx * dx + dy * dy));
    }

    frame move(this: *Point, dx: int, dy: int) ret void {
        this.x = this.x + dx;
        this.y = this.y + dy;
    }
}
```

### The `this` Keyword

Inside methods, `this` points to the current instance:

```adgLang
struct Counter {
    count: int,

    frame increment(this: *Counter) ret void {
        this.count = this.count + 1;  # Access member through this
    }

    frame reset(this: *Counter) ret void {
        this.count = 0;
    }

    frame getValue(this: *Counter) ret int {
        return this.count;
    }
}
```

### Calling Methods

```adgLang
frame sqrt(x: float) ret float { return x; }

struct Point {
    x: int,
    y: int,

    frame print(this: *Point) ret void {
        printf("(%d, %d)\n", this.x, this.y);
    }

    frame distance(this: *Point, other: *Point) ret float {
        local dx: int = this.x - (*other).x;
        local dy: int = this.y - (*other).y;
        return sqrt(cast<float>(dx * dx + dy * dy));
    }

    frame move(this: *Point, dx: int, dy: int) ret void {
        this.x = this.x + dx;
        this.y = this.y + dy;
    }
}

local p: Point;
p.x = 10;
p.y = 20;
p.print();  # Calls p's print method

local p2: Point;
p2.x = 15;
p2.y = 25;

local dist: float = p.distance(&p2);

p.move(5, -5);
p.print();  # Now at (15, 15)
```

### Methods with Pointers

```adgLang
extern malloc(size: int) ret *void;
extern free(ptr: *void);

struct Point {
    x: int,
    y: int,

    frame print(this: *Point) ret void {
        printf("(%d, %d)\n", this.x, this.y);
    }

    frame move(this: *Point, dx: int, dy: int) ret void {
        this.x = this.x + dx;
        this.y = this.y + dy;
    }
}

local p: *Point = cast<*Point>(malloc(sizeof(Point)));
(*p).x = 10;
(*p).y = 20;
(*p).print();  # Works with pointers too
(*p).move(5, 5);
free(cast<*void>(p));
```

## Constructors and Destructors

adgLang does not provide automatic constructors or destructors, but you can follow common method patterns for both:

### Constructor Pattern

```adgLang
struct Person {
    name: string,
    age: int,

    frame init(this: *Person, n: string, a: int) ret void {
        this.name = n;
        this.age = a;
    }

    frame print(this: *Person) ret void {
        printf("%s, age %d\n", this.name, this.age);
    }
}

# Usage
local p: Person;
p.init("Alice", 30);
p.print();
```

### Destructor Pattern

```adgLang
extern malloc(size: int) ret *void;
extern free(ptr: *void);

struct Buffer {
    data: *char,
    size: int,

    frame init(this: *Buffer, s: int) ret void {
        this.data = cast<*char>(malloc(s));
        this.size = s;
    }

    frame cleanup(this: *Buffer) ret void {
        if (this.data != nullptr) {
            free(cast<*void>(this.data));
            this.data = nullptr;
            this.size = 0;
        }
    }
}

frame main() ret int {
    # Usage
    local buf: Buffer;
    buf.init(1024);
    # ... use buffer ...
    buf.cleanup();  # Must call manually!
    return 0;
}
```

### Factory Functions

Another option instead of constructors:

```adgLang
struct Point {
    x: int,
    y: int,
}

frame createPoint(x: int, y: int) ret Point {
    local p: Point;
    p.x = x;
    p.y = y;
    return p;
}

# Usage
local p: Point = createPoint(10, 20);
```

## Inheritance

adgLang supports single inheritance with the `:` syntax:

### Basic Inheritance

```adgLang
struct Animal {
    name: string,
    age: int,

    frame speak(this: *Animal) ret void {
        printf("%s makes a sound\n", this.name);
    }
}

struct Dog : Animal {
    breed: string,

    # Override speak
    frame speak(this: *Dog) ret void {
        printf("%s barks\n", this.name);
    }

    # New method
    frame fetch(this: *Dog) ret void {
        printf("%s fetches the ball\n", this.name);
    }
}
```

### Using Inherited Members

```adgLang
struct Animal {
    name: string,
    age: int,

    frame speak(this: *Animal) ret void {
        printf("%s makes a sound\n", this.name);
    }
}

struct Dog : Animal {
    breed: string,

    # Override speak
    frame speak(this: *Dog) ret void {
        printf("%s barks\n", this.name);
    }

    # New method
    frame fetch(this: *Dog) ret void {
        printf("%s fetches the ball\n", this.name);
    }
}

local dog: Dog;
dog.name = "Buddy";  # Inherited from Animal
dog.age = 3;         # Inherited from Animal
dog.breed = "Golden Retriever";  # Dog's own member

dog.speak();  # Calls Dog's speak: "Buddy barks"
dog.fetch();  # Calls Dog's fetch
```

### Method Override

Derived structs can override methods from the base struct:

```adgLang
struct Shape {
    x: int,
    y: int,

    frame area(this: *Shape) ret float {
        return 0.0;  # Default implementation
    }
}

struct Circle : Shape {
    radius: float,

    frame area(this: *Circle) ret float {
        return 3.14159 * this.radius * this.radius;
    }
}

struct Rectangle : Shape {
    width: float,
    height: float,

    frame area(this: *Rectangle) ret float {
        return this.width * this.height;
    }
}

local c: Circle;
c.radius = 5.0;
local a: float = c.area();
```

### Multi-Level Inheritance

```adgLang
struct Vehicle {
    speed: int,

    frame move(this: *Vehicle) ret void {
        printf("Moving at %d mph\n", this.speed);
    }
}

struct Car : Vehicle {
    doors: int
}

struct SportsCar : Car {
    turbo: bool,

    frame boost(this: *SportsCar) ret void {
        if (this.turbo) {
            this.speed = this.speed + 20;
        }
    }
}

# SportsCar has: speed (from Vehicle), doors (from Car), turbo (own)
local car: SportsCar;
car.speed = 100;  # From Vehicle
car.doors = 2;    # From Car
car.turbo = true; # Own member
car.move();       # From Vehicle
car.boost();      # Own method
```

## Nested Structs

Structs can include other structs as members:

### Composition

```adgLang
frame sqrt(x: float) ret float { return x; }

struct Point {
    x: int,
    y: int
}

struct Line {
    start: Point,
    end: Point,

    frame length(this: *Line) ret float {
        local dx: int = this.end.x - this.start.x;
        local dy: int = this.end.y - this.start.y;
        return sqrt(cast<float>(dx * dx + dy * dy));
    }
}

local line: Line;
line.start.x = 0;
line.start.y = 0;
line.end.x = 3;
line.end.y = 4;
printf("Length: %f\n", line.length());  # 5.0
```

### Deeply Nested Structs

```adgLang
struct Address {
    street: string,
    city: string,
    zip: string
}

struct Contact {
    phone: string,
    email: string,
    address: Address
}

struct Person {
    name: string,
    contact: Contact
}

local person: Person;
person.name = "Alice";
person.contact.phone = "555-1234";
person.contact.email = "alice@example.com";
person.contact.address.street = "123 Main St";
person.contact.address.city = "Springfield";
person.contact.address.zip = "12345";
```

## Pointers to Structs

### Basic Pointer Usage

```adgLang
struct Point {
    x: int,
    y: int
}

local p: Point;
p.x = 10;
p.y = 20;

local ptr: *Point = &p;
printf("(%d, %d)\n", (*ptr).x, (*ptr).y);

(*ptr).x = 30;
printf("(%d, %d)\n", p.x, p.y);  # Now (30, 20)
```

### Dynamic Allocation

```adgLang
extern malloc(size: int) ret *void;
extern free(ptr: *void);

struct Point {
    x: int,
    y: int
}

local p: *Point = cast<*Point>(malloc(sizeof(Point)));
if (p == nullptr) {
    printf("Allocation failed\n");
    return 1;
}

(*p).x = 10;
(*p).y = 20;

# Use the struct...

free(cast<*void>(p));
```

### Linked Structures

```adgLang
extern malloc(size: int) ret *void;

struct Node {
    data: int,
    next: *Node,

    frame append(this: *Node, value: int) ret void {
        if (this.next == nullptr) {
            this.next = cast<*Node>(malloc(sizeof(Node)));
            (*this.next).data = value;
            (*this.next).next = nullptr;
        } else {
            (*this.next).append(value);
        }
    }
}

local head: Node;
head.data = 1;
head.next = nullptr;
head.append(2);
head.append(3);
```

## Arrays of Structs

### Stack-Allocated Array

```adgLang
struct Point {
    x: int,
    y: int
}

local points: Point[3];
points[0].x = 0;
points[0].y = 0;
points[1].x = 10;
points[1].y = 10;
points[2].x = 20;
points[2].y = 20;

local i: int = 0;
loop (i < 3) {
    printf("Point %d: (%d, %d)\n", i, points[i].x, points[i].y);
    i = i + 1;
}
```

### Heap-Allocated Array

```adgLang
extern malloc(size: int) ret *void;
extern free(ptr: *void);

struct Point {
    x: int,
    y: int
}

frame main() ret int {
    local size: int = 10;
    local points: *Point = cast<*Point>(malloc(size * cast<int>(sizeof(Point))));

    local i: int = 0;
    loop (i < size) {
        (*(points + i)).x = i;
        (*(points + i)).y = i * i;
        i = i + 1;
    }

    free(cast<*void>(points));
    return 0;
}
```

### Multi-Dimensional Arrays

```adgLang
struct Cell {
    value: int,
    visited: bool
}

local grid: Cell[10][10];
local i: int = 0;
loop (i < 10) {
    local j: int = 0;
    loop (j < 10) {
        grid[i][j].value = i * 10 + j;
        grid[i][j].visited = false;
        j = j + 1;
    }
    i = i + 1;
}
```

## Struct Alignment and Size

### sizeof Operator

```adgLang
struct Compact {
    a: u8,
    b: u8
}

struct Padded {
    a: u8,
    b: int
}

printf("Compact: %d bytes\n", sizeof(Compact));  # 2
printf("Padded: %d bytes\n", sizeof(Padded));    # 16 (due to alignment)
```

### Memory Layout

Struct members are laid out in declaration order, but padding may be inserted for alignment:

```adgLang
struct Example {
    a: u8,    # Offset 0
    # 7 bytes padding
    b: int,   # Offset 8
    c: u16,   # Offset 16
    # 6 bytes padding
    d: int    # Offset 24
}
# Total size: 32 bytes
```

## Common Patterns

### Option/Result Types

```adgLang
struct Option<T> {
    hasValue: bool,
    value: T,

    frame isSome(this: *Option<T>) ret bool {
        return this.hasValue;
    }

    frame isNone(this: *Option<T>) ret bool {
        return !this.hasValue;
    }
}

frame divide(a: int, b: int) ret Option<int> {
    local result: Option<int>;
    if (b == 0) {
        result.hasValue = false;
        return result;
    }
    result.hasValue = true;
    result.value = a / b;
    return result;
}

local res: Option<int> = divide(10, 2);
```

### Builder Pattern

```adgLang
struct Config {
    width: int,
    height: int,
    fullscreen: bool,
    vsync: bool,

    frame setWidth(this: *Config, w: int) ret *Config {
        this.width = w;
        return this;
    }

    frame setHeight(this: *Config, h: int) ret *Config {
        this.height = h;
        return this;
    }

    frame setFullscreen(this: *Config, f: bool) ret *Config {
        this.fullscreen = f;
        return this;
    }
}

# Usage
local cfg: Config;
cfg.setWidth(1920).setHeight(1080).setFullscreen(true);
```

## Best Practices

1. **Initialize all members** - Do not leave members holding garbage values
2. **Use constructors** - Add `init()` methods when setup is non-trivial
3. **Use destructors** - Add `cleanup()` methods when managing resources
4. **Small structs by value, large by pointer** - Pass small structs (<16 bytes) by value
5. **Consistent naming** - Use PascalCase for struct names and camelCase for members
6. **Group related data** - Only bundle data that actually belongs together
7. **Limit struct size** - Huge structs usually point to weak design
8. **Prefer composition over inheritance** - Reach for inheritance sparingly
9. **Document complex structs** - Add comments for purpose and invariants
10. **Check allocations** - Always make sure `malloc` succeeded

## Next Steps

- [Methods and This](12-methods-this.md) - Deep dive into struct methods
- [Inheritance](13-inheritance.md) - Advanced inheritance patterns
- [Memory Management](14-memory.md) - Managing struct lifetimes
- [Pointers](15-pointers.md) - Pointer operations with structs
