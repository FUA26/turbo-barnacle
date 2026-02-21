# Deployment Guide

This guide covers deploying Naiera Starter to various platforms.

## Prerequisites

Before deploying, ensure you have:

- Production database (PostgreSQL)
- Object storage (MinIO or S3-compatible)
- Email service (Resend API key)
- Domain name configured

## Environment Variables

Required for production:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"

# Object Storage
MINIO_ENDPOINT="your-storage-endpoint"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="your-access-key"
MINIO_SECRET_KEY="your-secret-key"
MINIO_BUCKET="naiera-uploads"
MINIO_USE_SSL="true"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://yourdomain.com"

# App
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_NAME="Your App Name"

# Email
RESEND_API_KEY="your-resend-api-key"
```

Generate NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

## Vercel (Recommended)

Vercel is the easiest deployment option for Next.js applications.

### Steps

1. **Push code to GitHub**

```bash
git remote add origin https://github.com/yourusername/naiera-starter
git push -u origin main
```

2. **Import project in Vercel**

- Go to [vercel.com](https://vercel.com)
- Click "Add New Project"
- Import from GitHub

3. **Configure environment variables**

In Vercel project settings:

- Add all required environment variables from above
- Set `NEXTAUTH_URL` to your domain

4. **Deploy**

- Vercel automatically deploys on push
- Access your app at `https://your-app.vercel.app`

5. **Custom domain** (optional)

- In Vercel project settings → Domains
- Add your custom domain
- Configure DNS records

### Database on Vercel

Use Vercel Postgres or external PostgreSQL:

**Vercel Postgres**:

```bash
# Install Vercel CLI
pnpm add -g vercel

# Link project
vercel link

# Create Postgres database
vercel postgres create

# Pull environment variables
vercel env pull .env.local
```

**External PostgreSQL**:

Set `DATABASE_URL` and `DIRECT_URL` to your database connection string.

### Storage on Vercel

For production, consider using:

- **AWS S3** - Production object storage
- **Cloudflare R2** - S3-compatible, no egress fees
- **MinIO** - Self-hosted option

Configure MinIO environment variables accordingly.

## Docker

Deploy using Docker containers.

### Build and Run

```bash
# Build image
docker build -f .docker/Dockerfile -t naiera-starter:latest .

# Run container
docker run -d \
  --name naiera-starter \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  naiera-starter:latest
```

### Docker Compose (Production)

```bash
# Start all services
docker-compose -f .docker/docker-compose.prod.yml up -d

# View logs
docker-compose -f .docker/docker-compose.prod.yml logs -f

# Stop services
docker-compose -f .docker/docker-compose.prod.yml down
```

### Database Backup

```bash
# Backup database
./scripts/db-backup.sh

# Restore from backup
gunzip < backup_file.sql.gz | docker exec -i postgres psql -U postgres naiera
```

## VPS / Cloud Server

Deploy to your own server (Ubuntu 20.04+ recommended).

### Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Install Node.js (for build time)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Deploy

```bash
# Clone repository
git clone https://github.com/yourorg/naiera-starter
cd naiera-starter

# Create production environment
cp .env.example .env.production
nano .env.production  # Edit with your values

# Deploy
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable HTTPS with Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

### Systemd Service

Create `/etc/systemd/system/naiera-starter.service`:

```ini
[Unit]
Description=Naiera Starter
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/naiera-starter
ExecStart=/usr/bin/docker run -p 3000:3000 --env-file /var/www/naiera-starter/.env.production naiera-starter:latest
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable naiera-starter
sudo systemctl start naiera-starter
```

## Monitoring

### Health Checks

Add health check endpoint (already included in `/api/health`):

```bash
curl https://yourdomain.com/api/health
```

### Logs

**Vercel**: View logs in Vercel dashboard

**Docker**:

```bash
docker logs -f naiera-starter
```

**Systemd**:

```bash
journalctl -u naiera-starter -f
```

### Error Tracking

Consider integrating:

- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Vercel Analytics** - Performance metrics

## Post-Deployment Checklist

- [ ] Database migrations run
- [ ] Environment variables configured
- [ ] SSL/HTTPS enabled
- [ ] Custom domain configured
- [ ] Email service working
- [ ] File uploads working
- [ ] Health check passing
- [ ] Backup script configured
- [ ] Monitoring configured
- [ ] DNS propagated

## Troubleshooting

### Build Fails

Check Node.js version:

```bash
node --version  # Should be 20+
```

### Database Connection Fails

Verify DATABASE_URL format and network access:

```bash
# Test connection
psql $DATABASE_URL
```

### File Uploads Fail

Check MinIO/S3 credentials and bucket permissions:

```bash
# Test MinIO
curl http://your-minio-endpoint:9000
```

### Environment Variables Not Working

Ensure no trailing spaces or special characters in `.env` file.

## Scaling

### Horizontal Scaling

- Use managed database (RDS, Cloud SQL)
- Use CDN for static assets (Cloudflare)
- Load balancer (ALB, Nginx)
- Multiple app instances behind load balancer

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Add caching (Redis)
- Use CDN for file storage
