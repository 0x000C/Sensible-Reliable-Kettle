#!/bin/bash

# Simple script to prepare results for sharing

echo "📦 Preparing arena results for sharing..."

if [ ! -f "src/data/arena-results.json" ]; then
    echo "❌ Error: arena-results.json not found!"
    echo "Run 'npm run arena' first to generate results."
    exit 1
fi

# Copy to desktop for easy access
DESKTOP="$HOME/Desktop"
cp src/data/arena-results.json "$DESKTOP/flip7-arena-results.json"

echo "✅ Results copied to your Desktop: flip7-arena-results.json"
echo ""
echo "📊 Quick summary:"
cat src/data/arena-results.json | grep -A 10 "overallRankings" | head -20

echo ""
echo "📤 Next steps:"
echo "  1. The file is on your Desktop: flip7-arena-results.json"
echo "  2. You can just paste the contents into the chat, or"
echo "  3. Upload it to GitHub in the src/data/ folder"
