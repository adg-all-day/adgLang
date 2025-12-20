# Performance Tips

How to write efficient adgLang code.

## Memory

- Prefer stack allocation over heap allocation when possible.
- Pass large structs by pointer to avoid copying.

## Loops

- Keep work inside loops to a minimum.
- Use efficient algorithms.
