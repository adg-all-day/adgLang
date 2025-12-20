# Type Aliases

Type aliases give an existing type another name. Use them to make complex types easier to read or to add clearer intent.

## Syntax

```adgLang
type UserID = int;
type Point = (int, int);
type Handler = Func<void>(int);
```

## Usage

```adgLang
local id: UserID = 123;
local p: Point = (0, 0);
```
