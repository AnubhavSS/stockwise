# Stockwise

**Inventory clarity. Business control.**

Stockwise is a premium inventory management dashboard for small and medium-sized businesses. This repository is a freelance developer assessment for SasthaSoft.

The current codebase is a **frontend foundation**: Next.js App Router, a shared application shell, reusable UI primitives, TypeScript domain types, Indian-market sample data, and Zustand stores with browser localStorage persistence. The five business modules are routed but not fully implemented yet.

> There is **no backend** and **no authentication** in this version. All data is mock data that can be persisted in the browser.

## Project objectives

- Establish a production-quality, maintainable frontend that can be extended module by module.
- Provide a consistent premium SaaS visual system (navy sidebar, warm workspace, restrained accent).
- Model inventory, sales, purchases, customers and suppliers with strict TypeScript types.
- Keep stock transaction logic separate from presentation so later workflows stay consistent.
- Persist client state safely without touching `localStorage` during server rendering.

## Features and planned modules

### Available now

- Application shell: collapsible desktop sidebar, mobile navigation drawer, header, breadcrumbs and page layout
- Shared components: `StatCard`, `PageHeader`, `DataTable`, `SearchInput`, `FilterDropdown`, `StatusBadge`, `DateRangeFilter`, `EmptyState`, `LoadingState`
- Module routes: Dashboard, Sales, Purchase, Stock, Reports, Customers, Suppliers
- Domain types, realistic INR sample data, Zustand store skeletons and localStorage hydration

### Planned (not implemented in this step)

1. **Dashboard** — derived KPIs, low-stock alerts, activity feed and charts
2. **Sales Management** — invoices, line items, payment status and stock deduction
3. **Purchase Management** — purchase orders, goods receipt and stock increase
4. **Stock Management** — catalogue, adjustments, valuation and movement history
5. **Reports & Analytics** — period filters and Recharts visualisations

Additional directories (Customers, Suppliers, and later Godowns) can be expanded on the same foundation.

## Technology stack

| Technology | Purpose |
|---|---|
| Next.js (App Router) | Frontend framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling and design tokens |
| shadcn/ui | Reusable UI primitives |
| Lucide React | Icons |
| Recharts | Charts (installed, unused until Reports) |
| Zustand | Client state |
| LocalStorage | Client persistence |
| ESLint | Code quality |

## Application architecture

```text
UI (App Router pages)
  → layout shell (sidebar, header, page container)
  → shared components
  → feature selectors / status maps
  → Zustand stores
  → mock data + localStorage
  → stock transaction helpers
```

- **Pages** are server components by default and currently render placeholders.
- **Client components** are limited to interactive chrome (sidebar, header, filters, providers).
- **Stores** hold source records only. Dashboard totals are derived via selectors, not stored separately.
- **Stock movements** are applied through `src/lib/stock-transactions.ts`, not inline in UI.

## Folder structure

```text
stockwise/
├── public/                 Static assets, including logo.svg
├── src/
│   ├── app/                Next.js App Router routes and global styles
│   ├── components/
│   │   ├── layout/         Sidebar, header, dashboard shell, page container
│   │   ├── providers/      Tooltip + Zustand hydration
│   │   ├── shared/         Cross-module UI primitives
│   │   └── ui/             shadcn/ui primitives
│   ├── config/             Site metadata and navigation
│   ├── data/               Realistic Indian sample datasets
│   ├── features/           Domain helpers (selectors, labels, alerts)
│   ├── hooks/              Client hooks such as useLocalStorage
│   ├── lib/                Utils, calculations, storage, stock movements
│   ├── store/              Zustand stores
│   └── types/              Shared TypeScript entities
├── components.json         shadcn/ui configuration
├── .env.example            Documented public environment variables
└── README.md
```

Feature component folders (`components/dashboard`, `components/sales`, and so on) are intentionally omitted until those modules are built, to avoid empty abstraction layers.

## Installation prerequisites

- Node.js 20 or later
- npm 10 or later
- A modern browser (Chrome, Edge, Firefox or Safari)

## Local setup

```bash
# Clone repository
git clone <repository-url>

# Navigate into project
cd stockwise

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/dashboard`.

Copy `.env.example` to `.env.local` if you want to override public labels. The app currently reads site metadata from `src/config/site.ts`; environment variables are reserved for later configuration.

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_NAME` | Public application name |
| `NEXT_PUBLIC_APP_TAGLINE` | Marketing tagline |
| `NEXT_PUBLIC_CURRENCY` | ISO currency code (`INR`) |
| `NEXT_PUBLIC_CURRENCY_SYMBOL` | Display symbol (`₹`) |
| `NEXT_PUBLIC_LOCALE` | Locale used for formatting (`en-IN`) |

No API keys, database URLs or auth secrets are required.

## Development commands

```bash
npm run dev
```

Starts the Next.js development server.

```bash
npm run lint
```

Runs ESLint using `eslint-config-next`.

## Build and production commands

```bash
npm run build
npm run start
npm run lint
```

`npm run build` produces an optimized production bundle. `npm run start` serves that bundle.

## State management approach

Zustand stores live in `src/store/`:

| Store | Holds |
|---|---|
| `inventory-store` | Products and stock movements |
| `sales-store` | Sales invoices and customers |
| `purchase-store` | Purchase orders and suppliers |
| `ui-store` | Sidebar collapse, mobile drawer, global search |

Persistence uses Zustand `persist` with `skipHydration: true`. A client `AppProviders` component rehydrates stores after mount so `localStorage` is never read during server rendering.

Derived values (inventory value, low-stock counts, monthly totals) are computed in `src/features/dashboard/selectors.ts` from the underlying records.

## Sample data and localStorage strategy

Sample data is modelled for Indian SME trade:

- Currency: **INR (₹)**
- Products include Wireless Mouse, USB-C Cable, Laptop Stand, Mechanical Keyboard, Monitor 24" and HDMI Cable
- Customers include Apex Retail, Bright Electronics, City Computers, Global Traders and Quick Mart
- Suppliers include Tech Distributors, Mega Supplies, Gadget World and Prime Electronics

Product, customer and supplier IDs are reused on sales, purchases and stock movements so later workflows stay consistent.

Storage keys:

- `stockwise-inventory`
- `stockwise-sales`
- `stockwise-purchases`
- `stockwise-ui`

Until the user changes data in a future module, stores initialise from the mock datasets. Clearing site data in the browser restores the seed.

`src/hooks/use-local-storage.ts` is a generic SSR-safe hook for additional client values.

## Inventory workflow overview

The intended stock flow (to be wired in later modules):

1. **Purchase received** → `quantityChange` is positive → on-hand quantity increases.
2. **Sale fulfilled** → `quantityChange` is negative → on-hand quantity decreases.
3. **Adjustment** → signed quantity change with remarks (damage, found stock, recount).

Helpers in `src/lib/stock-transactions.ts` apply a movement to a product list immutably. UI components should call those helpers rather than mutating quantities directly.

## Future enhancements

- Complete CRUD for the five primary modules
- Recharts dashboards and reports
- Godown / warehouse locations
- Export to CSV or PDF
- Backend API and authentication
- Multi-user roles and audit logs

## Screenshots

_Placeholder — add captures after the modules are implemented._

| Screen | Status |
|---|---|
| Dashboard | Layout + placeholder |
| Sales | Layout + placeholder |
| Purchase | Layout + placeholder |
| Stock | Layout + placeholder |
| Reports | Layout + placeholder |

```text
docs/screenshots/dashboard.png
docs/screenshots/sales.png
docs/screenshots/purchase.png
docs/screenshots/stock.png
docs/screenshots/reports.png
```

## Project author / credits

- **Project:** Stockwise
- **Assessment:** SasthaSoft freelance developer evaluation
- **Author:** Anubhav
- **Role:** Software engineer
- **UI kit:** [shadcn/ui](https://ui.shadcn.com)
- **Framework:** [Next.js](https://nextjs.org)

This version is a scaffold for the assessment. Please do not treat placeholder module pages as finished product features.
