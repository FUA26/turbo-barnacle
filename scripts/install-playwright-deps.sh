#!/bin/bash
# Playwright System Dependencies Installer
# Run this script to install required system dependencies for Playwright on Linux

set -e

echo "📦 Installing Playwright system dependencies..."

# Detect package manager
if command -v apt-get &> /dev/null; then
    echo "Using apt-get package manager..."
    sudo apt-get update
    sudo apt-get install -y \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libcups2 \
        libdrm2 \
        libxkbcommon0 \
        libxcomposite1 \
        libxdamage1 \
        libxfixes3 \
        libxrandr2 \
        libgbm1 \
        libasound2t64 \
        libatspi2.0-0 \
        libxshmfence1

elif command -v dnf &> /dev/null; then
    echo "Using dnf package manager..."
    sudo dnf install -y \
        atk \
        at-spi2-atk \
        cups-libs \
        libdrm \
        libxkbcommon \
        libXcomposite \
        libXdamage \
        libXfixes \
        libXrandr \
        mesa-libgbm \
        alsa-lib \
        at-spi2-core \
        libxshmfence

elif command -v pacman &> /dev/null; then
    echo "Using pacman package manager..."
    sudo pacman -S --needed \
        atk \
        at-spi2-core \
        cups \
        libdrm \
        libxkbcommon \
        libxcomposite \
        libxdamage \
        libxfixes \
        libxrandr \
        mesa \
        alsa-lib \
        libxshmfence

else
    echo "❌ Unable to detect package manager. Please install dependencies manually."
    echo "See https://playwright.dev/docs/linux for detailed instructions."
    exit 1
fi

echo "✅ Dependencies installed successfully!"
echo "You can now run: pnpm test:e2e"
