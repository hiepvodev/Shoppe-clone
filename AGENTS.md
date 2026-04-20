# AGENTS.md

## Commands

```bash
npm run dev        # Dev server on port 3000
npm run build     # tsc && vite build
npm run lint      # ESLint
npm run test     # Vitest
npm run coverage # Vitest + coverage
```

**Order:** lint → typecheck → test

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router (src/useRouteElements.tsx)
- React Query + axios for API
- React Hook Form + Yup for validation
- i18next for i18n (src/i18n/, src/locales/)
- Vitest with jsdom

## Architecture

| Directory | Purpose |
|-----------|---------|
| `src/components/` | Reusable UI (Button, Header, Input, etc.) |
| `src/pages/` | Route pages (Cart, Checkout, Login, ProductList, ProductDetail, Register, User) |
| `src/apis/` | API calls |
| `src/layouts/` | Page layouts |
| `src/contexts/` | React contexts |
| `src/hooks/` | Custom hooks |

Entry: `src/main.tsx` → `src/App.tsx` → `src/useRouteElements.tsx`

Path alias: `@/` maps to `./src`

## Quirks

- Dev server runs on **port 3000** (not Vite default)
- Uses Yarn PnP (`.pnp.cjs`)
- Multiple Input components: `Input`, `InputV2`, `InputFile`, `InputNumber`
- Has ErrorBoundary component
- `strict: true` in tsconfig
- Prettier with Tailwind plugin