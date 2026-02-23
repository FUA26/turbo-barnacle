# Features

Complete list of features included in Naiera Starter.

## Core Features

### Authentication & Authorization

#### NextAuth.js v5

- **Credential-based login** with email and password
- **OAuth ready** - Easy integration with Google, GitHub, etc.
- **Email verification** - Verify user email addresses
- **Password reset** - Forgot password flow
- **Session management** - Secure session handling
- **Protected routes** - Route-level authentication checks

#### Role-Based Access Control (RBAC)

- **Permission system** - Fine-grained permissions (`RESOURCE_ACTION_SCOPE`)
- **Role management** - Create and manage roles
- **Permission caching** - 5-minute in-memory cache for performance
- **API protection** - Decorator-based API route protection
- **UI integration** - Permission-based UI element rendering
- **User permissions** - Check user permissions anywhere

#### Pre-configured Permissions

- User management (create, read, update, delete users)
- Role management (create, read, update, delete roles)
- Permission management (create, read, update, delete permissions)
- System settings management
- File upload and management
- Profile management

### File Management

#### File Upload System

- **MinIO integration** - S3-compatible object storage
- **Magic byte validation** - Verify file types by content, not extension
- **Size limits** - Configurable file size limits
- **Multiple file types** - Images, documents, videos
- **Progress tracking** - Upload progress indication
- **Error handling** - Comprehensive error messages

#### File Serving

- **API proxy** - All files served through Next.js API
- **Permission checks** - File access controlled by permissions
- **CDN-ready** - Easy migration to CDN
- **Responsive images** - Automatic image optimization
- **Avatar upload** - User profile picture management

#### File Management

- **File listing** - Browse uploaded files
- **Orphan cleanup** - Remove files not referenced in database
- **Admin tools** - File management dashboard
- **Storage tracking** - Monitor storage usage

### Dashboard & Navigation

#### Smart Navigation

- **Dynamic sidebar** - Collapsible navigation menu
- **Active indicators** - Highlight current page
- **Permission filtering** - Show only authorized menu items
- **Grouped navigation** - Organized menu sections
- **Icon integration** - Hugeicons for visual navigation

#### Breadcrumbs

- **Automatic generation** - Based on route structure
- **Clickable navigation** - Easy navigation back
- **Context-aware** - Shows current location

#### Smart Header

- **Dynamic page titles** - Auto-generated from route
- **Page icons** - Visual context for current page
- **User dropdown** - Quick access to profile and settings

#### Global Search

- **Keyboard shortcut** - Cmd+K / Ctrl+K
- **Permission-filtered** - Show only authorized results
- **User search** - Find users quickly
- **Role search** - Find roles
- **Permission search** - Find permissions
- **Quick navigation** - Jump to any page

### User Management

#### User CRUD

- **Create users** - Add new users to the system
- **List users** - Paginated user table
- **Edit users** - Update user information
- **Delete users** - Remove users with confirmation
- **Assign roles** - Give users specific roles
- **User search** - Filter and search users

#### Advanced Data Table

- **Column visibility** - Show/hide columns
- **Sorting** - Sort by any column
- **Filtering** - Faceted filters on multiple columns
- **Date range filtering** - Filter by date ranges
- **Pagination** - Server-side pagination
- **Responsive** - Mobile-friendly design
- **Skeleton loading** - Loading states
- **Bulk actions** - Perform actions on multiple rows

#### Profile Management

- **Avatar upload** - Upload profile picture
- **Edit profile** - Update name, email
- **Change password** - Secure password change
- **Profile validation** - Form validation with Zod

### Settings & Configuration

#### System Settings

- **Key-value storage** - Application settings in database
- **Settings UI** - Manage settings through dashboard
- **Type-safe** - Typed settings access
- **Permission-controlled** - Only admins can modify

#### User Settings

- **Theme toggle** - Dark/light mode
- **Language preference** - Multi-language ready
- **Notification settings** - Email preferences

### Email System

#### Email Templates

- **React Email** - Component-based email templates
- **Welcome email** - Send on user registration
- **Password reset** - Forgot password emails
- **Email verification** - Verify user email
- **Custom templates** - Easy to add more

#### Email Service

- **Resend integration** - Production email service
- **Template rendering** - Server-side rendering
- **Error handling** - Comprehensive error handling
- **Development mode** - Console logging in dev

### Forms & Validation

#### React Hook Form

- **Form components** - Reusable form fields
- **Zod validation** - Schema-based validation
- **Error handling** - Inline error messages
- **Submit handling** - Optimistic updates
- **Reset functionality** - Form reset after submit

#### Form Components

- **Input** - Text, email, password inputs
- **Textarea** - Multi-line text input
- **Select** - Dropdown selection
- **Checkbox** - Boolean inputs
- **Radio group** - Single-choice selection
- **Date picker** - Date selection
- **Form field** - Labeled form fields with errors

### State Management

#### TanStack Query (Server State)

- **Data fetching** - Cached API calls
- **Automatic refetching** - Keep data fresh
- **Optimistic updates** - Instant UI feedback
- **Mutation handling** - API mutations
- **Query invalidation** - Smart cache updates
- **Loading states** - Built-in loading indicators
- **Error handling** - Automatic error retries

#### Jotai (Local State)

- **Atom-based state** - Simple state management
- **Derived state** - Computed values
- **Persistent state** - LocalStorage integration
- **Type-safe** - TypeScript support

### UI Components

#### shadcn/ui Components

- **Button** - Various button styles and sizes
- **Card** - Content containers
- **Form** - Form components with validation
- **Input** - Text inputs
- **Select** - Dropdown selects
- **Dialog** - Modal dialogs
- **Popover** - Floating content
- **Toast** - Notification toasts
- **Table** - Data tables
- **Badge** - Status badges
- **Progress** - Progress bars
- **Alert** - Alert messages
- **Command** - Command palette
- **Calendar** - Date picker
- **Sidebar** - Collapsible sidebar
- **Separator** - Visual separators

#### Custom Components

- **Avatar** - User avatars with fallbacks
- **Data table** - Advanced table with sorting/filtering
- **Filter bar** - Date range and filter controls
- **Chart wrapper** - Reusable chart containers
- **Protected route** - Route protection wrapper
- **Error boundary** - Error handling
- **Loading skeleton** - Loading placeholders

### Analytics Dashboard

#### Summary Cards

- **Total users** - User count with growth trend
- **Active sessions** - Current active users
- **API requests** - Request volume over time
- **Storage usage** - Disk space breakdown

#### User Statistics

- **User growth** - User registration over time
- **Role distribution** - Users by role
- **Growth charts** - Visual growth representation

#### System Statistics

- **API volume** - Request trends
- **Response time** - Performance metrics
- **Cache hit rate** - Cache effectiveness

#### Activity Logs

- **Login activity** - Successful/failed logins
- **Recent actions** - User activity feed
- **Activity timeline** - Chronological activity view

#### Resource Usage

- **Storage breakdown** - Storage by type
- **Bandwidth usage** - Transfer statistics

### Testing

#### Unit Testing

- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing
- **Test setup** - Configured test environment
- **MSW** - API mocking

#### End-to-End Testing

- **Playwright** - E2E test framework
- **Auth flows** - Login, registration, logout
- **CRUD operations** - Create, read, update, delete
- **Navigation** - Page navigation
- **Forms** - Form submission
- **Permissions** - Access control

#### Test Coverage

- **Unit tests** - Components, utilities
- **API tests** - Route handlers
- **E2E tests** - User flows

### Developer Experience

#### Type Safety

- **TypeScript strict mode** - Maximum type safety
- **Prisma types** - Auto-generated database types
- **API types** - Type-safe API calls
- **Form types** - Inferred from Zod schemas

#### Code Quality

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Lefthook** - Git hooks (pre-commit, pre-push)
- **Type checking** - Automated type checks

#### Development Tools

- **Hot reload** - Instant feedback
- **Fast refresh** - Preserve component state
- **Error overlay** - In-browser error display
- **Source maps** - Easy debugging

#### Documentation

- **CLAUDE.md** - AI assistant instructions
- **Inline comments** - Code documentation
- **Type definitions** - Self-documenting types
- **README** - Project documentation

### Deployment

#### Build Optimization

- **Standalone output** - Optimized production build
- **Image optimization** - Automatic image optimization
- **Font optimization** - Automatic font optimization
- **Tree shaking** - Remove unused code
- **Code splitting** - Route-based splitting

#### Deployment Options

- **Vercel** - One-click deployment
- **Docker** - Containerized deployment
- **VPS** - Manual server deployment
- **CI/CD** - GitHub Actions workflow

#### Production Ready

- **Environment variables** - Secure configuration
- **Health checks** - API health endpoint
- **Error handling** - Comprehensive error handling
- **Logging** - Structured logging
- **Rate limiting** - API rate limiting
- **CORS** - Cross-origin configuration

### Security

#### Authentication Security

- **Password hashing** - bcrypt with salt rounds
- **Secure sessions** - HttpOnly cookies
- **CSRF protection** - Built-in CSRF protection
- **Session expiration** - Automatic timeout

#### API Security

- **Rate limiting** - Prevent abuse
- **Input validation** - Zod schema validation
- **SQL injection prevention** - Prisma ORM
- **XSS prevention** - React escaping
- **Permission checks** - Server-side authorization

#### File Security

- **File type validation** - Magic byte checking
- **Size limits** - Prevent large uploads
- **Serving through API** - Permission checks
- **Sanitization** - File name sanitization

### Internationalization (i18n) Ready

- **Locale structure** - Ready for translations
- **Date formatting** - Locale-aware dates
- **Number formatting** - Locale-aware numbers
- **Currency formatting** - Ready for currencies

### Accessibility

- **ARIA labels** - Screen reader support
- **Keyboard navigation** - Full keyboard control
- **Focus management** - Proper focus handling
- **Color contrast** - WCAG compliant colors
- **Semantic HTML** - Proper HTML structure

## Roadmap

Features planned for future releases:

- [ ] Multi-language support (i18n)
- [ ] Two-factor authentication (2FA)
- [ ] Audit logging
- [ ] Webhook system
- [ ] Advanced reporting
- [ ] Real-time notifications
- [ ] Dark mode toggle
- [ ] Mobile app (React Native)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] GraphQL API option
- [ ] WebSocket support
- [ ] Background job processing

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL + Prisma ORM
- **Storage**: MinIO (S3-compatible)
- **Auth**: NextAuth.js v5
- **Forms**: React Hook Form + Zod
- **State**: TanStack Query + Jotai
- **Testing**: Vitest + React Testing Library + Playwright
- **Email**: React Email + Resend
- **Deployment**: Vercel ready

## Performance

- **Server Components** - Reduced client JavaScript
- **Streaming** - Progressive page rendering
- **Image optimization** - Automatic optimization
- **Font optimization** - Self-hosting with next/font
- **Code splitting** - Route-based splitting
- **Edge runtime** - Edge functions support
- **Cache strategy** - Smart caching with TanStack Query

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)
