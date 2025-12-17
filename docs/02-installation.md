# Installation

This guide walks you through installing the adgLang compiler and getting your dev environment ready.

## Prerequisites

Before you install adgLang, make sure these are already available:

### Required

1. **Clang/LLVM** (version 13 or higher)
 - Used to turn LLVM IR into native executables
 - Provides the LLVM toolchain

2. **Bun** or **Node.js**
 - Bun (recommended): https://bun.sh
 - Node.js (v16+): https://nodejs.org

### Platform-Specific Instructions

#### Linux (Ubuntu/Debian)

```bash
# Install Clang/LLVM
sudo apt-get update
sudo apt-get install clang llvm

# Install Bun (recommended)
curl -fsSL https://bun.sh/install | bash

# Or install Node.js
sudo apt-get install nodejs npm
```

#### Linux (Fedora/RHEL)

```bash
# Install Clang/LLVM
sudo dnf install clang llvm

# Install Bun
curl -fsSL https://bun.sh/install | bash

# Or install Node.js
sudo dnf install nodejs npm
```

#### macOS

```bash
# Install Clang (comes with Xcode Command Line Tools)
xcode-select --install

# Or install via Homebrew
brew install llvm

# Install Bun (recommended)
curl -fsSL https://bun.sh/install | bash

# Or install Node.js
brew install node
```

#### Windows

1. **Install Clang/LLVM**
 - Download from: https://releases.llvm.org/
 - Or use Chocolatey: `choco install llvm`

2. **Install Bun or Node.js**

 ```powershell
   # Install Bun
 irm bun.sh/install.ps1 | iex

   # Or install Node.js from https://nodejs.org
 ```

3. **Windows Subsystem for Linux (WSL) Recommended**
 For the smoothest setup on Windows, consider using WSL:
 ```powershell
 wsl --install
 ```
 Then follow the Linux installation steps inside WSL.

## Installing adgLang

### Installing from Source

This gives you the latest development version:

```bash
# Clone the repository
git clone <repository-url>
cd adgLang

# Initialize and build
./init.sh

# Verify installation
adgLang --version
```

## Verifying Installation

Check the install with a small program:

```bash
# Create a test file
cat > test.adg << 'EOF'
extern printf(fmt: string, ...);

frame main() ret int {
    printf("ADGLANG is working!\n");
    return 0;
}
EOF

# Compile and run
adgLang test.adg --run
```

You should see:

```
ADGLANG is working!
```

## Editor Setup

### VS Code (Recommended)

1. **Install the Extension**

 ```bash
 cd adgLang/vscode-ext
 npm install
 npm run build
 code --install-extension vscode-adgLang-*.vsix
 ```

2. **Features**
 - Syntax highlighting
 - Code snippets
 - Auto-formatting
 - Error diagnostics (partial)

### Vim/Neovim

Create a syntax file at `~/.vim/syntax/adgLang.vim`:

```vim
" ADGLANG syntax highlighting
if exists("b:current_syntax")
  finish
endif

" Keywords
syn keyword adgLangKeyword frame local global import export extern return if else loop switch case default try catch throw break continue cast sizeof match type struct fallthrough
syn keyword adgLangType int uint float bool char void string
syn keyword adgLangBoolean true false
syn keyword adgLangNull nullptr

" Comments
syn match adgLangComment "#.*$"
syn region adgLangMultiComment start="###" end="###"

" Strings
syn region adgLangString start='"' end='"'
syn region adgLangChar start="'" end="'"

" Numbers
syn match adgLangNumber '\d\+'
syn match adgLangFloat '\d\+\.\d\+'

" Operators
syn match adgLangOperator "+\|-\|*\|/\|%\|&\||\|^\|~\|<<\|>>"
syn match adgLangOperator "==\|!=\|<\|>\|<=\|>="
syn match adgLangOperator "&&\|||\|!"

hi def link adgLangKeyword Keyword
hi def link adgLangType Type
hi def link adgLangBoolean Boolean
hi def link adgLangNull Constant
hi def link adgLangComment Comment
hi def link adgLangMultiComment Comment
hi def link adgLangString String
hi def link adgLangChar Character
hi def link adgLangNumber Number
hi def link adgLangFloat Float
hi def link adgLangOperator Operator

let b:current_syntax = "adgLang"
```

Add to `~/.vim/ftdetect/adgLang.vim`:

```vim
au BufRead,BufNewFile *.adg set filetype=adgLang
```

### Sublime Text

Create `ADGLANG.sublime-syntax` in your User packages directory:

```yaml
%YAML 1.2
---
name: ADGLANG
file_extensions: [adgLang]
scope: source.adg

contexts:
  main:
    - match: '\\b(frame|local|global|import|export|extern|return|if|else|loop|switch|case|default|try|catch|throw|break|continue|cast|sizeof|match|type|struct|fallthrough)\\b'
      scope: keyword.control.adg
    - match: '\b(int|uint|float|bool|char|void|string)\b'
      scope: storage.type.adg
    - match: '\b(true|false)\b'
      scope: constant.language.adg
    - match: "#.*$"
      scope: comment.line.adg
    - match: '"'
      push: string
    - match: "'"
      push: char
    - match: '\b\d+\.?\d*\b'
      scope: constant.numeric.adg

  string:
    - meta_scope: string.quoted.double.adg
    - match: '\\.'
      scope: constant.character.escape.adg
    - match: '"'
      pop: true

  char:
    - meta_scope: string.quoted.single.adg
    - match: "'"
      pop: true
```

## Troubleshooting

### "adgLang: command not found"

**Solution**: Make sure the installation directory is in your PATH.

If you installed with `./init.sh`, it should have added `ADGLANG_HOME` to your `~/.bashrc`. Try reloading your shell:

```bash
source ~/.bashrc
```

### "clang: command not found"

**Solution**: Clang is either missing or not on your PATH.

```bash
# Verify clang installation
which clang

# If not found, install as described in prerequisites
```

### Compilation errors with LLVM IR

**Solution**: Your LLVM version may be incompatible.

```bash
# Check LLVM version
llvm-config --version

# ADGLANG requires LLVM 11 or higher
# Upgrade if necessary
```

### Windows: "Unable to compile LLVM IR"

**Solution**: Use WSL, or make sure MinGW/MSYS2 is installed correctly.

Alternatively, compile LLVM IR manually:

```bash
adgLang main.adg  # Generates main.ll
clang main.ll -o main.exe
```

## Updating adgLang

```bash
cd adgLang
git pull
./init.sh
```

## Uninstalling

```bash
# Remove symlink (if created)
sudo rm /usr/bin/adgLang

# Remove ADGLANG_HOME from .bashrc
sed -i '/ADGLANG_HOME/d' ~/.bashrc

# Delete the cloned directory
rm -rf adgLang
```

## Next Steps

With adgLang installed, continue to:

- [Quick Start Guide](03-quick-start.md) - Write your first program
- [Syntax and Comments](04-syntax-comments.md) - Learn the language basics

## Getting Help

If something goes wrong:

1. Check the [Common Pitfalls](42-common-pitfalls.md) guide
2. Search existing issues
3. Create a new issue with:
 - Your operating system and version
 - adgLang version (`adgLang --version`)
 - Clang version (`clang --version`)
 - The complete error message
 - A minimal reproduction example
