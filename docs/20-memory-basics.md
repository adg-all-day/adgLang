# Memory Basics

adgLang gives you direct, low-level control over memory, much like C.

## Stack vs Heap

- **Stack**: Local variables live on the stack. They are cleaned up automatically when the function returns.
- **Heap**: Dynamic memory lives on the heap. You allocate it with `malloc` and release it yourself with `free`.

## Pointers

Pointers let you work with memory addresses directly. See [Pointers](15-pointers.md) for the full rundown.
