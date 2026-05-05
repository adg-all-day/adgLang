# adgLang Playground - Quick Start Guide

## 🎯 Getting Started

1. **Start the server:**

 ```bash
 cd playground
 ./start.sh
 ```

 Or start it manually:

 ```bash
 cd playground/backend
 bun run dev
 ```

2. **Open your browser:**
 Go to `http://localhost:3001`

3. **Start learning:**
 - Click any example in the sidebar
 - Read the description at the top
 - Study the annotated code
 - Click "Run Code" to watch it execute
 - Explore the IR, AST, and Tokens tabs

## 🎓 Learning Path

### Beginner (Examples 1-7)

- Hello World
- Variables & types
- Basic math & operators
- If statements
- While & For loops
- Functions (frames)

### Intermediate (Examples 8-16)

- Structs
- Pointers
- Arrays
- Strings
- Boolean logic
- Switch statements
- Recursion
- Type casting
- Ternary operator

### Advanced (Examples 17-25)

- Bitwise operations
- Sizeof operator
- Struct methods
- Command-line arguments
- Standard input
- Global variables
- Type aliases
- Multi-dimensional arrays
- Fibonacci (algorithm practice)

## 💡 Tips & Tricks

### Using Input & Arguments

1. Expand the "Input & Arguments" section
2. Enter text in "Standard Input" for `scanf` programs
3. Add space-separated arguments for command-line programs
4. Example 20 and 21 show these features

### Understanding Output Tabs

**Output Tab**

- Shows program stdout/stderr
- Displays runtime errors
- Green for success, red for errors

**LLVM IR Tab**

- Shows the generated intermediate representation
- Helps you see how adgLang compiles to LLVM
- Useful when you want to understand optimization

**AST Tab**

- Shows the Abstract Syntax Tree
- Helps you understand program structure
- Useful for debugging parser issues

**Tokens Tab**

- Shows lexer output
- Lets you inspect how source code tokenizes
- Useful for syntax errors

### Modifying Examples

- You can edit any example code directly
- Your changes do not affect the original
- Click another example to reset
- Use the Format button to clean up code

### Common Issues

**Server not starting?**

```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill existing process
kill -9 <PID>
```

**Compilation fails?**

- Check if Clang is installed: `clang --version`
- Make sure the adgLang compiler is built: `cd .. && bun run build`
- Read the error message for syntax issues

**Examples not loading?**

- Check browser console (F12)
- Verify all JSON files are valid
- Restart the server

## 🔧 Development

### Adding Your Own Example

1. Create `playground/examples/26-your-example.json`:

```json
{
  "order": 26,
  "title": "Your Feature",
  "snippet": "Short description",
  "description": "Detailed explanation...",
  "code": "frame main() ret int {\n  return 0;\n}"
}
```

2. Restart server to load the new example
3. It will show up in the sidebar

### Customizing the UI

- Edit `frontend/style.css` for appearance
- Modify `frontend/app.js` for behavior
- Update `frontend/index.html` for structure
- Changes take effect when the browser refreshes

### Backend API

Add custom endpoints in `backend/server.ts`:

```typescript
if (url.pathname === "/my-endpoint" && req.method === "GET") {
  return new Response(JSON.stringify({ data: "..." }), { headers });
}
```

## 📚 adgLang Language Quick Reference

### Variables

```adgLang
local name: type;
global count: int;
```

### Functions

```adgLang
frame functionName(param: type) ret returnType {
  return value;
}
```

### Structs

```adgLang
struct MyStruct {
  field: type,
  frame method(this: MyStruct) ret type {
    return this.field;
  }
}
```

### Control Flow

```adgLang
if (condition) { }
while (condition) { }
for (init; condition; update) { }
switch (value) { case x: break; }
```

### Types

- `int`, `float`, `string`, `bool`
- `byte`, `char`
- `type*` (pointer)
- `type[size]` (array)

### Operators

- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Logical: `&&`, `||`, `!`
- Bitwise: `&`, `|`, `^`, `~`, `<<`, `>>`
- Ternary: `condition ? true : false`

## Next Steps

1. Complete all 25 examples in order
2. Try modifying examples to experiment
3. Write your own adgLang programs
4. Explore the compiler source code
5. Contribute examples or features!

## 📞 Support

- Check `playground/README.md` for more detailed docs
- View compiler docs in the parent directory
- Report issues on the project repository
