#!/bin/bash

# Hostinger Build Script
# This script is called by Hostinger's auto-deployment

echo "🎬 Building cinematicRenderer2D playground for Hostinger..."

# Build the playground (not the library!)
npm run build:playground

# Note: You may see validation warnings about missing dist/ files.
# This is expected and safe to ignore - we're only building the playground.

echo "✅ Build complete! dist-playground/ is ready."
