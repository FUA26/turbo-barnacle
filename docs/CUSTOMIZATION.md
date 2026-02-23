# Customization Guide

This guide explains how to customize Naiera Starter for your specific needs.

## Branding

### Update App Name and Metadata

**1. package.json**

```json
{
  "name": "your-app-name",
  "version": "1.0.0",
  "description": "Your app description"
}
```

**2. .env.example**

```bash
NEXT_PUBLIC_APP_NAME="Your App Name"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

**3. app/layout.tsx**

```typescript
export const metadata = {
  title: "Your App Name",
  description: "Your app description",
};
```

**4. components/dashboard/sidebar.tsx**

```typescript
<span className="truncate font-semibold">Your App</span>
<span className="truncate text-xs text-muted-foreground">Dashboard</span>
```

### Change Logo and Favicon

**1. Replace logo**

```bash
# Replace public/logo.svg with your logo
# Or update references to use your logo path
```

**2. Replace favicon**

```bash
# Replace public/favicon.ico with your favicon
# Or add favicon in app/layout.tsx:
```

```typescript
// app/layout.tsx
export const metadata = {
  icons: {
    icon: "/your-icon.png",
    apple: "/apple-icon.png",
  },
};
```

### Update Color Scheme

**app/globals.css**

```css
@layer base {
  :root {
    /* Primary brand color */
    --primary: 220 90% 56%; /* HSL format */
    --primary-foreground: 0 0% 100%;

    /* Secondary accent */
    --secondary: 210 40% 96%;
    --secondary-foreground: 222 47% 11%;

    /* More colors... */
  }
}
```

**To find HSL values:**

- Use color picker tools (e.g., Figma, Photoshop)
- Online converters: https://htmlcolorcodes.com/hsl-from-hex.htm
- Browser DevTools color picker

## Authentication

### Add OAuth Providers

**Google OAuth**

**1. .env**

```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**2. lib/auth/config.ts**

```typescript
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // ... rest of config
});
```

**GitHub OAuth**

**1. .env**

```bash
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

**2. lib/auth/config.ts**

```typescript
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
});
```

### Change Session Strategy

**Database sessions (more secure):**

```typescript
// lib/auth/config.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
```

**JWT sessions (stateless):**

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
});
```

### Customize Auth Pages

**1. Override NextAuth pages**

```typescript
// lib/auth/config.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },
});
```

**2. Create custom pages in app/auth/**

## Database

### Switch Database Provider

**To MySQL:**

**1. prisma/schema.prisma**

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

**2. Update .env**

```bash
DATABASE_URL="mysql://user:password@localhost:3306/dbname"
DIRECT_URL="mysql://user:password@localhost:3306/dbname"
```

**3. Re-generate and push**

```bash
pnpm prisma generate
pnpm prisma:push
```

**To MongoDB:**

**1. Install MongoDB connector**

```bash
pnpm add prisma-mongodb
```

**2. prisma/schema.prisma**

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

**3. Update model IDs**

```prisma
model User {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  // ... rest of model
}
```

### Add Custom Models

**1. prisma/schema.prisma**

```prisma
model Post {
  id          String   @id @default(cuid())
  title       String
  content     String?
  published   Boolean  @default(false)
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([authorId])
}
```

**2. Add to User model**

```prisma
model User {
  // ... existing fields
  posts Post[]
}
```

**3. Create migration**

```bash
pnpm prisma migrate dev --name add_posts
```

**4. Create CRUD API**

```typescript
// app/api/posts/route.ts
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { apiSuccess } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

export const GET = protectApiRoute({
  permissions: ["POST_READ_ANY"],
  handler: async () => {
    const posts = await prisma.post.findMany();
    return apiSuccess({ posts });
  },
});
```

### Add Database Indexes

```prisma
model User {
  id    String @id @default(cuid())
  email String @unique

  @@index([email])  // Single column index
  @@index([createdAt, name])  // Composite index
}
```

## File Storage

### Switch to AWS S3

**1. Install AWS SDK**

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**2. lib/storage/s3-client.ts**

```typescript
import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
```

**3. .env**

```bash
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="your-bucket-name"
```

**4. Update upload service to use S3**

### Switch to Cloudflare R2

Similar to S3, but with different endpoint:

```typescript
import { S3Client } from "@aws-sdk/client-s3";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

### Add File Size Limits

**lib/storage/file-validator.ts**

```typescript
export const MAX_FILE_SIZE = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  DEFAULT: 2 * 1024 * 1024, // 2MB
};
```

## UI Components

### Modify shadcn/ui Components

**1. Install shadcn CLI**

```bash
pnpm add -D shadcn-ui
```

**2. Add new component**

```bash
pnpm shadcn-ui add accordion
```

**3. Customize component**
Edit in `components/ui/accordion.tsx`

### Create Custom Components

**Example: Status Badge**

```typescript
// components/ui/status-badge.tsx
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "active" | "inactive" | "pending";
  className?: string;
}

const statusStyles = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge className={cn(statusStyles[status], className)}>
      {status}
    </Badge>
  );
}
```

## Permissions & Roles

### Add New Permission

**1. prisma/seed-permissions.ts**

```typescript
export const PERMISSIONS = [
  // ... existing
  "BLOG_POST_CREATE_ANY",
  "BLOG_POST_READ_ANY",
  "BLOG_POST_UPDATE_ANY",
  "BLOG_POST_DELETE_ANY",
] as const;

export type Permission = (typeof PERMISSIONS)[number];
```

**2. Run seed**

```bash
pnpm tsx prisma/seed-permissions.ts
```

**3. Assign to role**

```typescript
// prisma/seed-roles.ts
const bloggerPermissions = [
  // ... existing
  "BLOG_POST_CREATE_ANY",
  "BLOG_POST_READ_ANY",
  "BLOG_POST_UPDATE_ANY",
  "BLOG_POST_DELETE_ANY",
];
```

### Create Custom Role

**prisma/seed-roles.ts**

```typescript
const roles = [
  // ... existing roles
  {
    name: "MODERATOR",
    description: "Content moderator",
    permissions: ["USER_READ_ANY", "POST_UPDATE_ANY", "POST_DELETE_ANY"],
  },
];
```

### Change Permission Format

Default format: `RESOURCE_ACTION_SCOPE`

**To change format, update:**

1. `prisma/seed-permissions.ts` - Permission definitions
2. `lib/rbac-server/permission-crud.ts` - Permission parsing
3. `lib/rbac-client/hooks.ts` - Permission checking

## API

### Add Rate Limiting

**lib/api/middleware/rate-limit.ts**

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function rateLimit(identifier: string) {
  const { success, remaining } = await ratelimit.limit(identifier);
  if (!success) {
    throw new RateLimitError();
  }
}
```

**Use in API route:**

```typescript
import { rateLimit } from "@/lib/api/middleware/rate-limit";

export const POST = protectApiRoute({
  handler: async (req, session) => {
    await rateLimit(session.user.id);
    // Your handler code
  },
});
```

### Add API Versioning

**Structure:**

```
app/api/
├── v1/
│   ├── users/
│   │   └── route.ts
│   └── posts/
│       └── route.ts
└── v2/
    ├── users/
    │   └── route.ts
    └── posts/
        └── route.ts
```

**Usage:**

- `/api/v1/users` - Version 1
- `/api/v2/users` - Version 2

### Add CORS Configuration

**next.config.ts**

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://yourdomain.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
        ],
      },
    ];
  },
};
```

## Forms

### Add Form Validation

**lib/validations/post.ts**

```typescript
import { z } from "zod";

export const postFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  published: z.boolean().default(false),
  tags: z.array(z.string()).min(1, "Add at least one tag"),
});

export type PostFormData = z.infer<typeof postFormSchema>;
```

**Use in component:**

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postFormSchema, type PostFormData } from "@/lib/validations/post";

export function PostForm() {
  const form = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      content: "",
      published: false,
      tags: [],
    },
  });

  const onSubmit = async (data: PostFormData) => {
    // Submit to API
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

## Email

### Change Email Provider

**To SendGrid:**

**1. Install SendGrid SDK**

```bash
pnpm add @sendgrid/mail
```

**2. lib/email/service/sendgrid.ts**

```typescript
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await sgMail.send({
    from: "noreply@yourdomain.com",
    to,
    subject,
    html,
  });
}
```

**To AWS SES:**

**1. Install AWS SDK**

```bash
pnpm add @aws-sdk/client-ses
```

**2. lib/email/service/ses.ts**

```typescript
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({ region: process.env.AWS_REGION });

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const command = new SendEmailCommand({
    Source: "noreply@yourdomain.com",
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: html } },
    },
  });

  await sesClient.send(command);
}
```

### Add Custom Email Template

**emails/templates/custom-email.tsx**

```typescript
import { Button } from "./components/button";
import { Email } from "@/email";

interface CustomEmailProps {
  name: string;
  actionUrl: string;
}

export function CustomEmail({ name, actionUrl }: CustomEmailProps) {
  return (
    <Email>
      <h1>Welcome, {name}!</h1>
      <p>Click the button below to verify your account.</p>
      <Button href={actionUrl}>Verify Account</Button>
    </Email>
  );
}
```

## Deployment

### Environment-Specific Config

**.env.development**

```bash
DATABASE_URL="postgresql://localhost:5432/dev_db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**.env.production**

```bash
DATABASE_URL="postgresql://prod-server:5432/prod_db"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Add Post-Build Script

**package.json**

```json
{
  "scripts": {
    "postbuild": "node scripts/post-build.js"
  }
}
```

**scripts/post-build.js**

```javascript
// Run after build completes
console.log("Build complete!");
// Generate sitemap, optimize images, etc.
```

## Monitoring & Analytics

### Add Sentry Error Tracking

**1. Install Sentry**

```bash
pnpm add @sentry/nextjs
```

**2. Configure Sentry**

```bash
pnpm@sentry/wizard -i nextjs
```

**3. Configure DSN in .env**

```bash
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
SENTRY_AUTH_TOKEN="your-auth-token"
```

### Add Vercel Analytics

**1. Install**

```bash
pnpm add @vercel/analytics
```

**2. Add to layout**

```typescript
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## Testing

### Configure Test Coverage

**vitest.config.ts**

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    },
  },
});
```

### Run Coverage

```bash
pnpm test:coverage
```

View report at `coverage/index.html`

## Advanced Customizations

### Add WebSocket Support

**lib/websocket/server.ts**

```typescript
import { Server } from "ws";

const wss = new Server({ port: 8080 });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    // Handle incoming message
  });

  ws.send("Connected to server");
});
```

### Add GraphQL API

**1. Install dependencies**

```bash
pnpm add @apollo/server @as-integrations/next graphql
```

**2. Create GraphQL server**

```typescript
// app/api/graphql/route.ts
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";

const resolvers = {
  Query: {
    hello: () => "Hello world!",
  },
};

const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server);

export { handler as GET, handler as POST };
```

### Add Redis Cache

**1. Install Redis client**

```bash
pnpm add redis
```

**2. Create cache client**

```typescript
// lib/cache/redis.ts
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function cacheGet<T>(key: string): Promise<T | null> {
  const value = await redis.get(key);
  return value ? JSON.parse(value as string) : null;
}

export async function cacheSet(key: string, value: any, ttl = 3600) {
  await redis.setex(key, ttl, JSON.stringify(value));
}
```

### Add Background Jobs

**1. Install job queue**

```bash
pnpm add bullmq
```

**2. Create queue**

```typescript
// lib/jobs/queue.ts
import { Queue } from "bullmq";

export const emailQueue = new Queue("emails", {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});
```

**3. Create worker**

```typescript
// lib/jobs/workers/email.ts
import { Worker } from "bullmq";

const worker = new Worker(
  "emails",
  async (job) => {
    // Send email
    await sendEmail(job.data);
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || "6379"),
    },
  }
);
```

## Need Help?

- Check the [documentation](../STRUCTURE.md)
- Review [CLAUDE.md](../../CLAUDE.md) for AI assistance
- Open an issue on GitHub
- Join our community Discord
