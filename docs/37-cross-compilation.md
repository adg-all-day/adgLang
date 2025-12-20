# Cross-Compilation

adgLang uses LLVM as its backend, so cross-compiling is pretty straightforward.

## Target Triples

You can pick the target architecture and OS with LLVM target triples.

```bash
# Example command
adgLang main.adg --target x86_64-pc-windows-msvc
```
