# adgLang Playground

An interactive web playground for learning and experimenting with adgLang (Best Programming Language). Inspired by [gobyexample.com](https://gobyexample.com), it gives you a teaching-focused environment with 60+ annotated examples and a full "Zero to Hero" tutorial series.

## Features

✨ **Interactive Code Editor**

- Monaco Editor with adgLang syntax highlighting
- Real-time code editing with proper indentation
- Line numbers and code folding

🎓 **Learn by Example**

- 60+ curated examples covering all adgLang features
- Each example comes with detailed descriptions and explanations
- Progressive learning from "Hello World" to advanced topics

📚 **Zero to Hero Tutorial Series** _(NEW!)_

- 26 structured lessons from basics to advanced topics
- Interactive code snippets with "Run" functionality
- Multi-language comparisons (C, Python, Rust, JavaScript, Go)
- Hands-on challenges with hints and solutions
- Knowledge-check quizzes for retention
- Progress tracking with local storage

🔧 **Powerful Development Tools**

- **Output Tab**: View program output and errors
- **LLVM IR Tab**: Inspect generated intermediate representation
- **AST Tab**: Explore the Abstract Syntax Tree
- **Tokens Tab**: Inspect lexer tokens

📥 **Input & Arguments**

- Pass standard input (stdin) to programs
- Provide command-line arguments
- Test interactive programs

🚀 **Fast Compilation**

- Bun-powered backend for fast responses
- Real-time compilation and execution
- Detailed error messages with line numbers

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- [Clang/LLVM](https://llvm.org/) (for compiling LLVM IR)
- Node.js and TypeScript (for building adgLang compiler)

### Installation

1. Build the adgLang compiler first:

```bash
cd ../transpiler
bun install
bun run build
```

2. Start the playground server:

```bash
cd playground
bun run start
```

3. Open your browser to `http://localhost:3001`

## Project Structure

```
playground/
├── backend/
│   ├── server.ts         # Bun server with API endpoints
│   └── package.json
├── frontend/
│   ├── index.html        # Main playground UI
│   ├── tutorial.html     # Tutorial page UI
│   ├── style.css         # Styling and dark theme
│   ├── tutorial.css      # Tutorial-specific styles
│   ├── app.js            # Frontend logic and Monaco setup
│   └── tutorial.js       # Tutorial JavaScript functionality
├── examples/
│   ├── 01-hello-world.json
│   ├── 02-variables.json
│   └── ... (60+ examples)
└── tutorials/
    ├── 01-welcome-to-adgLang.json
    ├── 02-variables-and-types.json
    └── ... (26 lessons)
```

## Tutorial Topics

The "Zero to Hero" tutorial includes:

### Beginner (Lessons 1-10)

1. Welcome to adgLang - First program
2. Variables and Types - Data types, declarations
3. Operators - Arithmetic, comparison, logical
4. Control Flow (If/Else) - Conditionals
5. Loops - While, for, break, continue
6. Functions (Frames) - Parameters, returns
7. Arrays - Creation, indexing, iteration
8. Structs - Data structures
9. Struct Methods - Instance methods
10. Pointers - Memory addresses

### Intermediate (Lessons 11-20)

11. Enums & Pattern Matching - ADTs
12. Generics - Type parameters
13. Error Handling - try/catch/throw
14. Lambdas & Closures - Anonymous functions
15. Modules & Imports - Code organization
16. Memory Management - Stack/heap
17. Type Aliases - Type simplification
18. String Interpolation - Dynamic strings
19. Bitwise Operations - Bit manipulation
20. Inline Assembly - Low-level access

### Advanced (Lessons 21-26)

21. FFI - Calling C libraries
22. Building & Debugging - Compiler tools
23. Standard Library - Overview
24. Patterns & Idioms - Builder, Option, Result
25. Best Practices - Coding standards
26. What's Next - Continuing journey

## API Endpoints

### `GET /examples`

Returns all available examples with metadata.

### `GET /tutorials`

Returns all tutorial lessons with content and metadata.

### `POST /compile`

Compiles and runs adgLang code.

**Request:**

```json
{
  "code": "frame main() ret int { return 0; }",
  "input": "optional stdin input",
  "args": ["arg1", "arg2"]
}
```

**Response:**

```json
{
  "success": true,
  "output": "program output",
  "ir": "LLVM IR code",
  "ast": "Abstract Syntax Tree JSON",
  "tokens": "Lexer tokens JSON",
  "warnings": []
}
```

## Usage Tips

1. **Browse Examples**: Click examples in the sidebar to load them
2. **Edit Code**: Change code in the Monaco editor
3. **Run Programs**: Click "Run Code" to compile and execute
4. **View Internals**: Switch tabs to inspect IR, AST, or tokens
5. **Add Input**: Expand "Input & Arguments" to pass stdin/args
6. **Start Tutorial**: Click "Start Tutorial: Zero to Hero" for guided learning
7. **Track Progress**: Tutorial progress is stored in your browser

## Development

### Start Development Server

```bash
cd playground
bun run dev
```

### Modify Examples

Examples live in `playground/examples/`. Each example includes:

- `order`: Display order in sidebar
- `title`: Example name
- `snippet`: Short description
- `description`: Detailed explanation
- `code`: adgLang source code
- `input` (optional): Default stdin
- `args` (optional): Default command-line arguments

### Adding New Examples

Create a new JSON file in `examples/`:

```json
{
  "order": 26,
  "title": "Your Example",
  "snippet": "Short description",
  "description": "Detailed explanation of the concept",
  "code": "frame main() ret int {\n    return 0;\n}"
}
```

### Adding New Tutorial Lessons

Create a new JSON file in `tutorials/`:

```json
{
  "id": "unique-id",
  "order": 27,
  "title": "Lesson Title",
  "category": "Category Name",
  "difficulty": "beginner|intermediate|advanced",
  "duration": "5 min",
  "description": "Brief description",
  "prerequisites": ["previous-lesson-id"],
  "objectives": ["Learning goal 1", "Learning goal 2"],
  "sections": [
    {
      "type": "text",
      "title": "Section Title",
      "content": "Markdown content..."
    },
    {
      "type": "code",
      "title": "Code Example",
      "code": "frame main() ret int { return 0; }",
      "runnable": true,
      "expectedOutput": "0",
      "lineExplanations": { "1": "Explanation for line 1" }
    },
    {
      "type": "comparison",
      "title": "Language Comparison",
      "languages": { "ADGLANG": "...", "C": "...", "Python": "..." }
    },
    {
      "type": "challenge",
      "title": "Practice Challenge",
      "instructions": "Task description",
      "hint": "Optional hint",
      "solution": "Solution code"
    },
    {
      "type": "quiz",
      "questions": [
        {
          "question": "Question text?",
          "options": ["A", "B", "C", "D"],
          "correct": 0,
          "explanation": "Why A is correct"
        }
      ]
    }
  ],
  "nextLesson": "next-lesson-id"
}
```

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript, Monaco Editor
- **Backend**: Bun runtime, TypeScript
- **Compiler**: adgLang → LLVM IR → Native binary (via Clang)
- **Styling**: Custom dark theme with CSS variables

## Troubleshooting

**Server won't start:**

- Make sure Bun is installed: `bun --version`
- Check that port 3001 is available
- Make sure the adgLang compiler is built

**Compilation errors:**

- Verify Clang/LLVM is installed: `clang --version`
- Check file permissions in `/tmp`
- Look at the browser console for more detailed errors

**Examples not loading:**

- Check that JSON files are valid
- Make sure `server.ts` can read the `examples/` directory
- Look for errors in the server console

## License

Same as the adgLang compiler project.

## Contributing

Feel free to add more examples or improve the playground UI.
