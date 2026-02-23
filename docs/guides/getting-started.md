# Getting Started

## Prerequisites

- Node.js 20+
- pnpm
- Docker (for Postgres + MinIO)
- Git

## Installation

```bash
git clone https://github.com/yourorg/naiera-starter
cd naiera-starter
pnpm install
```

## Environment Setup

```bash
cp .env.example .env
# Edit .env with your values
```

Required environment variables:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/naiera"
DIRECT_URL="postgresql://postgres:password@localhost:5432/naiera"

# MinIO (Object Storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="naiera-uploads"
MINIO_USE_SSL="false"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Naiera Starter"

# Email (optional - for development)
# RESEND_API_KEY="your-resend-api-key"
```

## Database Setup

```bash
# Start services (PostgreSQL + MinIO)
docker-compose up -d

# Run database migrations
pnpm prisma:push

# Seed database with initial data
pnpm prisma:seed

# (Optional) Open Prisma Studio to view database
pnpm prisma:studio
```

## Development

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

Default login credentials (from seed):

- Email: `admin@example.com`
- Password: `password`

## Testing

```bash
pnpm test           # Run tests
pnpm test:ui        # Run tests with UI
pnpm test:coverage  # Run tests with coverage
```

## Building

```bash
pnpm build
pnpm start
```

## Next Steps

- Explore the dashboard features
- Read the [architecture documentation](../architecture/overview.md)
- Check out the [deployment guide](./deployment.md)
- Start building your features!

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Errors

```bash
# Check if PostgreSQL is running
docker ps

# Check logs
docker logs <container-name>

# Restart services
docker-compose restart
```

### MinIO Connection Errors

```bash
# Check MinIO is accessible
curl http://localhost:9000

# Access MinIO console
open http://localhost:9001
# Login: minioadmin / minioadmin
```

### Permission Cache Issues

If you've changed roles/permissions and don't see changes:

```bash
# Restart dev server to clear cache
# Ctrl+C then pnpm dev
```
