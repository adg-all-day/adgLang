# adgLang Benchmarks

This directory holds benchmark programs used to compare adgLang with languages such as C, Go, and Python.

## Structure

Each benchmark lives in its own subdirectory (for example, `loop_to_million`).
Inside each directory you will find:

- `loop.adg`: The adgLang version
- `loop.c`: The C version
- `loop.go`: The Go version
- `loop.py`: The Python version
- `loop.js`: The JavaScript version
- `run.sh`: A script that compiles and runs every implementation, then reports execution times.

## Running Benchmarks

To run one benchmark, move into its directory and run `run.sh`:

```bash
cd loop_to_million
./run.sh
```

## Requirements

- `bun` (for running the adgLang compiler)
- `gcc` (for C)
- `go` (for Go)
- `python3` (for Python)
- `node` (for JavaScript)
