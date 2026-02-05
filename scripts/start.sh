#!/bin/bash

# Quick Start Script for Rapper Toon Sheet

set -e

echo "🎨 Rapper Toon Sheet - Quick Start"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your API keys."
    echo ""
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
    echo ""
fi

# Build shared package
echo "🔨 Building shared package..."
pnpm --filter @rapper-toon-sheet/shared build
echo ""

# Ask what to run
echo "What would you like to do?"
echo "1) Start both frontend and backend in development mode"
echo "2) Build for production"
echo "3) Start production server"
echo "4) Run with Docker Compose"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting development servers..."
        echo "   Backend: http://localhost:3001"
        echo "   Frontend: http://localhost:5173"
        echo ""
        pnpm dev
        ;;
    2)
        echo ""
        echo "🔨 Building for production..."
        pnpm build
        echo ""
        echo "✅ Build complete! Run './scripts/start.sh' with option 3 to start."
        ;;
    3)
        echo ""
        echo "🚀 Starting production server..."
        echo "   Server: http://localhost:3001"
        echo ""
        pnpm start
        ;;
    4)
        echo ""
        echo "🐳 Starting with Docker Compose..."
        docker-compose up --build
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac
