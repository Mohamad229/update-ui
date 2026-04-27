# AGENTS.md - Damira Pharma Website

## Project Overview

Corporate pharmaceutical website with CMS built on Next.js 16 + React 19.
Multi-language support (EN/AR with RTL) and admin dashboard for content management.

---

## Build/Lint/Test Commands

```bash
# Development
npm run dev              # Start dev server on localhost:3000

# Build & Production
npm run build            # Production build
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint (flat config)
npm run lint -- --fix    # Auto-fix lint issues
```

### Running Tests (when added)
```bash
# Single test file
npx vitest run path/to/test.ts
npx jest path/to/test.ts --no-coverage

# Specific test by name
npx vitest -t "test name"
npx jest -t "test name"
```

---

## Framework Requirements

### CRITICAL: Next.js 16 Breaking Changes

This project uses **Next.js 16.2.2** with significant API changes from earlier versions.
**Always read `node_modules/next/dist/docs/` before writing code.**

Key docs locations:
- `node_modules/next/dist/docs/01-app/01-getting-started/` - Core concepts
- `node_modules/next/dist/docs/01-app/02-guides/` - Feature guides
- `node_modules/next/dist/docs/01-app/03-api-reference/` - API reference

### React 19 Considerations
- Uses React 19.2.4 with Server Components by default
- `useActionState` replaces `useFormState` for form handling
- Async params in dynamic routes: `params: Promise<{ id: string }>`

---

## Project Structure

```
damira-pharma-site/
├── app/                    # App Router (routes, layouts, pages)
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Global styles + Tailwind
│   └── [feature]/          # Feature routes
├── public/                 # Static assets
├── docs/                   # Project documentation
└── node_modules/next/dist/docs/  # Next.js reference docs
```

### File Conventions (App Router)
| File | Purpose |
|------|---------|
| `page.tsx` | Route page component |
| `layout.tsx` | Shared layout wrapper |
| `loading.tsx` | Loading skeleton/spinner |
| `error.tsx` | Error boundary (must be 'use client') |
| `not-found.tsx` | 404 UI |
| `route.ts` | API endpoint |

---

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** - no implicit any, strict null checks
- Use explicit types for function params and returns
- Prefer interfaces for object shapes, types for unions/primitives
- Use `@/*` path alias for imports (maps to project root)

```typescript
// Good
interface Product {
  id: string;
  name: string;
  status: 'available' | 'pipeline';
}

export async function getProduct(id: string): Promise<Product | null> {
  // ...
}

// Bad
export async function getProduct(id) {
  // ...
}
```

### Imports

Order imports in groups separated by blank lines:
1. React/Next.js built-ins
2. External libraries
3. Internal aliases (`@/`)
4. Relative imports
5. Types (use `import type` when possible)

```typescript
import { Suspense } from 'react';
import Image from 'next/image';

import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/data';

import { ProductCard } from './product-card';

import type { Product } from '@/types';
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Utilities/hooks | camelCase | `useProducts.ts` |
| Route folders | kebab-case | `product-catalog/` |
| Constants | SCREAMING_SNAKE | `MAX_PRODUCTS` |
| Types/Interfaces | PascalCase | `interface ProductProps` |

### Components

- **Server Components by default** - no directive needed
- **Client Components** - add `'use client'` at file top when using:
  - useState, useEffect, useContext
  - Event handlers (onClick, onChange)
  - Browser APIs (localStorage, window)
- Keep Client Components small and leaf-level

```typescript
// Server Component (default)
export default async function ProductList() {
  const products = await getProducts();
  return <div>{/* render */}</div>;
}

// Client Component
'use client'

import { useState } from 'react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  return <input onChange={(e) => setQuery(e.target.value)} />;
}
```

### Error Handling

- **Expected errors**: Return as values, don't throw
- **Unexpected errors**: Let error boundaries catch them
- Use `notFound()` for 404 cases
- Error boundaries (`error.tsx`) must be Client Components

```typescript
// Server Function - expected errors as return values
'use server'

export async function createProduct(formData: FormData) {
  const result = await db.products.create(/* ... */);
  if (!result.ok) {
    return { error: 'Failed to create product' };
  }
  return { success: true };
}

// Server Component - conditional rendering
export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  if (!product) {
    notFound();
  }
  return <ProductDetail product={product} />;
}
```

### CSS/Styling

- **Tailwind CSS 4** via `@tailwindcss/postcss`
- Use `@import "tailwindcss"` in globals.css
- CSS variables for theming (`--background`, `--foreground`)
- Use `@theme inline` for custom theme values
- Support dark mode via `prefers-color-scheme` or class

---

## Data Fetching Patterns

```typescript
// Direct fetch in Server Components
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <Component data={data} />;
}

// With caching control
const data = await fetch(url, {
  next: { revalidate: 3600 }  // Revalidate every hour
});
```

---

## Multi-language Support

This project supports English (primary) and Arabic (secondary):
- Implement RTL support for Arabic
- Use route groups or middleware for locale detection
- Store translations for all user-facing content

---

## Security Notes

- Never expose API keys in Client Components
- Use `NEXT_PUBLIC_` prefix only for public env vars
- Install `server-only` package for sensitive modules
- Validate all form inputs server-side

---

## Performance Guidelines

- Use `next/image` for all images with explicit dimensions
- Implement loading.tsx for route loading states
- Use Suspense boundaries for streaming
- Keep Client Components minimal to reduce JS bundle
- Use dynamic imports for heavy components

---

## Common Pitfalls

1. **Async params**: Dynamic route params are now Promises
   ```typescript
   // Next.js 16+
   export default async function Page({
     params,
   }: {
     params: Promise<{ slug: string }>
   }) {
     const { slug } = await params;
   }
   ```

2. **'use client' scope**: Marks entire module tree as client
3. **Context in Server Components**: Not supported - use Client Component wrapper
4. **Direct database calls**: Only in Server Components/Functions
