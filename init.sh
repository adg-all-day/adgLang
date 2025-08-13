#!/bin/bash

# Get the absolute path to the ADGLANG installation directory
ADGLANG_HOME_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing ADGLANG..."
bun i
bun run build

# Make the wrapper script executable
chmod +x ./adgLang-wrapper.sh

# Install system-wide symlink
sudo ln -srf ./adgLang-wrapper.sh /usr/bin/adgLang

# Add ADGLANG_HOME to .bashrc if not already present
if ! grep -q "export ADGLANG_HOME=" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# ADGLANG Compiler Home Directory" >> ~/.bashrc
    echo "export ADGLANG_HOME=\"$ADGLANG_HOME_PATH\"" >> ~/.bashrc
    echo "ADGLANG_HOME added to ~/.bashrc"
else
    # Update existing ADGLANG_HOME if path changed
    sed -i "s|export ADGLANG_HOME=.*|export ADGLANG_HOME=\"$ADGLANG_HOME_PATH\"|" ~/.bashrc
    echo "ADGLANG_HOME updated in ~/.bashrc"
fi

# Export for current session
export ADGLANG_HOME="$ADGLANG_HOME_PATH"

echo "Installation complete. You can now use the 'adgLang' command."
echo "ADGLANG_HOME is set to: $ADGLANG_HOME"
echo "Please run 'source ~/.bashrc' or restart your terminal to use ADGLANG_HOME in new sessions."
