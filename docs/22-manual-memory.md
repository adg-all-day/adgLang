# Manual Memory Management

adgLang uses manual memory management for data allocated on the heap.

## malloc and free

You get these functions through the standard library (`libc`).

```adgLang
extern frame malloc(size: int) ret *void;
extern frame free(ptr: *void) ret void;

frame main() ret void {
    local ptr: *int = malloc(sizeof(int)) as *int;
    *ptr = 42;
    free(ptr);
}
```

## Best Practices

- Always match `malloc` with `free`.
- Avoid freeing the same pointer twice.
- Set pointers to `nullptr` after freeing them if they might be touched again.
