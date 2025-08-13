#!/bin/bash
# ADGLANG Compiler Wrapper Script
# This script ensures ADGLANG_HOME is set before running the compiler

# Get the directory where this script is located (resolving symlinks)
if [ -L "$0" ]; then
    # If this script is a symlink, resolve it to the real path
    REAL_SCRIPT="$(readlink -f "$0")"
    SCRIPT_DIR="$(dirname "$REAL_SCRIPT")"
else
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi

# If ADGLANG_HOME is not set, set it to the script directory
if [ -z "$ADGLANG_HOME" ]; then
    export ADGLANG_HOME="$SCRIPT_DIR"
fi

# Run the actual compiler binary from the installation directory
exec "$ADGLANG_HOME/adgLang" "$@"
