#!/bin/bash

# Next.js Boilerplate Setup Script
# This script helps you get started with the boilerplate

set -e

echo "🚀 Setting up Next.js Boilerplate..."
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You'll need to use an external PostgreSQL database."
    echo "   Update DATABASE_URL in .env file with your database credentials."
fi

echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🗄️  Starting PostgreSQL container..."
if command -v docker &> /dev/null; then
    docker compose up -d
    echo "✅ PostgreSQL container started"
    sleep 3
fi

echo ""
echo "🔧 Setting up database..."
pnpm prisma generate
pnpm prisma db push
echo "✅ Database schema created"

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start the development server:"
echo "     pnpm dev"
echo ""
echo "  2. In another terminal, create an admin user:"
echo "     curl -X POST http://localhost:3000/api/seed"
echo ""
echo "  3. Open your browser to:"
echo "     http://localhost:3000"
echo ""
echo "  4. Login with:"
echo "     Email: admin@example.com"
echo "     Password: admin123"
echo ""
echo "📚 For more details, see IMPLEMENTATION_SUMMARY.md"
