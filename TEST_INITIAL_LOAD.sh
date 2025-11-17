#!/bin/bash

# Quick Test Script for Initial Load Fix
# This script helps you quickly test the fix locally

echo "🧪 Initial Load Fix - Quick Test Script"
echo "========================================"
echo ""

# Check if required files exist
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Run this script from the project root."
    exit 1
fi

echo "✅ Project files found"
echo ""

# Check if local server is available
if command -v python3 &> /dev/null; then
    echo "📡 Starting local development server..."
    echo "   Server will run on: http://localhost:8080"
    echo ""
    echo "🎯 Test Scenarios to Try:"
    echo "   1. Open DevTools Console (F12)"
    echo "   2. Run: localStorage.clear()"
    echo "   3. Hard refresh (Cmd+Shift+R)"
    echo "   4. Watch console for retry attempts"
    echo ""
    echo "📖 See TESTING_INITIAL_LOAD_FIX.md for detailed test scenarios"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8080
elif command -v python &> /dev/null; then
    echo "📡 Starting local development server..."
    echo "   Server will run on: http://localhost:8080"
    echo ""
    echo "🎯 Test Scenarios to Try:"
    echo "   1. Open DevTools Console (F12)"
    echo "   2. Run: localStorage.clear()"
    echo "   3. Hard refresh (Cmd+Shift+R)"
    echo "   4. Watch console for retry attempts"
    echo ""
    echo "📖 See TESTING_INITIAL_LOAD_FIX.md for detailed test scenarios"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m SimpleHTTPServer 8080
else
    echo "❌ Error: Python not found."
    echo "   Please install Python or use another local server (e.g., 'npx http-server')"
    exit 1
fi
