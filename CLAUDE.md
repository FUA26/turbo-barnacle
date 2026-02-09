# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application using React 19, TypeScript, and Tailwind CSS v4. The project uses the App Router architecture and is configured with shadcn/ui components for the UI layer.

## Package Manager

This project uses **pnpm** as the package manager.

## Development Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Architecture

### Directory Structure

- `app/` - Next.js App Router pages and layouts
- `components/ui/` - shadcn/ui components (auto-generated, modify with caution)
- `components/` - Custom application components
- `lib/` - Utility functions and shared code
- `public/` - Static assets

### Path Aliases

The project uses TypeScript path aliases configured in `tsconfig.json`:

- `@/*` maps to the project root
- Common aliases: `@/components`, `@/lib`, `@/lib/utils`, `@/hooks`

### Component Architecture

- **shadcn/ui** components are built on Radix UI primitives
- Uses **CVA (Class Variance Authority)** for component variants
- **Hugeicons** is the icon library
- Components use the `cn()` utility from `lib/utils.ts` for className merging

### Styling

- **Tailwind CSS v4** with configuration in `app/globals.css`
- Uses CSS custom properties for theming (light/dark mode support)
- Base color theme: neutral
- Style variant: radix-vega
- Menu styling: inverted with bold accent

### Adding shadcn/ui Components

The project is configured with the shadcn MCP server. Use the shadcn tools to:

- Search for components: `mcp__shadcn__search_items_in_registries`
- View component details: `mcp__shadcn__view_items_in_registries`
- Get add commands: `mcp__shadcn__get_add_command_for_items`

### TypeScript Configuration

- Strict mode enabled
- Target: ES2017
- JSX: react-jsx

### Framework Versions

- Next.js: 16.1.6
- React: 19.2.3
- TypeScript: 5
- Tailwind CSS: 4.0
