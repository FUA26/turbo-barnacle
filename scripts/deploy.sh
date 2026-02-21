#!/bin/bash
set -e

echo "🚀 Deploying Naiera Starter..."

# Build Docker image
echo "Building Docker image..."
docker build -f .docker/Dockerfile -t naiera-starter:latest .

# Stop existing container
echo "Stopping existing container..."
docker stop naiera-starter 2>/dev/null || true
docker rm naiera-starter 2>/dev/null || true

# Start new container
echo "Starting new container..."
docker run -d \
  --name naiera-starter \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  naiera-starter:latest

echo "✅ Deployed successfully!"
echo "🌐 App running at http://localhost:3000"
