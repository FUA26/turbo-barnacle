# Boilerplate Usage Guide

This guide explains how to use Naiera Starter as a boilerplate for your project.

## Quick Start

### Option 1: GitHub Template (Recommended)

1. **Use as Template**
   - Visit the repository on GitHub
   - Click "Use this template" → "Create a new repository"
   - Name your repository and create it

2. **Clone Your New Repository**

```bash
git clone https://github.com/yourusername/your-project
cd your-project
```

3. **Install and Setup**

```bash
pnpm install
cp .env.example .env
# Edit .env with your configuration
docker-compose up -d
pnpm prisma:push
pnpm prisma:seed
pnpm dev
```

### Option 2: Clone and Fork

```bash
# Clone the boilerplate
git clone https://github.com/yourorg/naiera-starter your-project
cd your-project

# Remove git history
rm -rf .git
git init

# Update package.json with your project name
# Update README.md with your project description
# Update .env.example with your defaults

# Commit fresh start
git add .
git commit -m "Initial commit from Naiera Starter"
```

## Initial Configuration

### 1. Update Project Metadata

**package.json**:

```json
{
  "name": "your-project-name",
  "version": "0.1.0",
  "description": "Your project description",
  "author": "Your Name",
  "license": "MIT"
}
```

**.env.example**:

```bash
# App
NEXT_PUBLIC_APP_NAME="Your App Name"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**app/layout.tsx**:

```typescript
export const metadata = {
  title: "Your App Name",
  description: "Your app description",
};
```

### 2. Clean Up Unwanted Features

Remove features you don't need:

**Remove Analytics**:

```bash
rm -rf app/(dashboard)/analytics
rm -rf components/analytics
rm -rf lib/analytics
```

**Remove File Upload**:

```bash
rm -rf components/file-upload
rm -rf lib/file-upload
rm -rf lib/storage
rm -f app/api/files/**/*.ts
```

**Remove Email**:

```bash
rm -rf lib/email
rm -rf emails
```

### 3. Customize Branding

**Update Logo and Colors**:

1. **Logo**: Replace `public/logo.svg` with your logo
2. **Favicon**: Replace `public/favicon.ico`
3. **Colors**: Edit `app/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --primary: YOUR_HUE YOUR_SATURATION YOUR_LIGHTNESS;
    --primary-foreground: ...;
    /* ... more colors */
  }
}
```

### 4. Update Seed Data

**prisma/seed-roles.ts** - Update default roles for your app:

```typescript
const roles = [
  {
    name: "ADMIN",
    description: "Full system access",
    permissions: await getAllPermissions(),
  },
  {
    name: "USER",
    description: "Basic user access",
    permissions: await getBasicPermissions(),
  },
  // Add your custom roles
];
```

**prisma/seed-permissions.ts** - Add your custom permissions:

```typescript
export const PERMISSIONS = [
  // Existing permissions...

  // Your custom permissions
  "RESOURCE_ACTION_SCOPE",
  "ANOTHER_RESOURCE_ANOTHER_ACTION_SCOPE",
] as const;
```

## Customization Checklist

### Must-Do Before Launch

- [ ] Update app name and metadata
- [ ] Change default admin credentials in seed
- [ ] Configure email service (or disable)
- [ ] Set up production database
- [ ] Configure file storage (or remove feature)
- [ ] Update branding (logo, colors, favicon)
- [ ] Add your own permissions/roles
- [ ] Remove unused features
- [ ] Add your own pages/routes
- [ ] Set up domain and SSL

### Optional Customizations

- [ ] Add OAuth providers (Google, GitHub, etc.)
- [ ] Configure CDN for static assets
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Add analytics (Vercel Analytics, Plausible)
- [ ] Configure CI/CD pipeline
- [ ] Add end-to-end tests
- [ ] Set up staging environment
- [ ] Configure backup strategy

## Common Customizations

### Change Authentication Provider

**Add Google OAuth**:

1. **.env**:

```bash
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

2. **lib/auth/config.ts**:

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // ...
});
```

### Swap Database

**Switch to MySQL**:

1. **.env**:

```bash
DATABASE_URL="mysql://user:password@localhost:3306/dbname"
```

2. **prisma/schema.prisma**:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

3. **Run migrations**:

```bash
pnpm prisma:push
```

### Swap Object Storage

**Use AWS S3**:

1. **Install AWS SDK**:

```bash
pnpm add @aws-sdk/client-s3
```

2. **lib/storage/s3-client.ts**:

```typescript
import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
```

3. **Update upload service** to use S3 instead of MinIO

## Updating from Boilerplate

When the boilerplate is updated, you can merge changes:

```bash
# Add boilerplate as upstream
git remote add upstream https://github.com/yourorg/naiera-starter

# Fetch upstream changes
git fetch upstream

# Merge upstream changes
git merge upstream/master

# Resolve conflicts
# Test everything
git commit -m "Merge upstream changes"
```

## Support

- **Issues**: Report bugs at GitHub Issues
- **Discussions**: Ask questions in GitHub Discussions
- **Documentation**: See `docs/` folder for detailed guides

## License

This boilerplate is MIT licensed. You can use it for personal and commercial projects.
