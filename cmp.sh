#!/bin/bash

# Script to compile and run ADGLANG programs using the new 'run' command
# Usage: ./cmp.sh <file.adg> [args...]

SCRIPT_DIR=$(dirname "$0");

bun "$SCRIPT_DIR/index.ts" run "$@"
exit $?
