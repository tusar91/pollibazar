# PolliBazar (পল্লি বাজার) — ই-কমার্স প্ল্যাটফর্ম

"গ্রামের বাজার, ঘরে পৌঁছাবে"

A complete, modern, responsive ecommerce marketplace for Bangladesh built for groceries, organic food, daily staples, and household products. Compatible with **Cloudflare Pages** and **Cloudflare Workers** with **Cloudflare D1** serverless relational database.

---

## 🏢 Business Information
- **Business Name:** PolliBazar
- **Hotline / Phone:** 01712334707
- **Email:** ice.tusar@gmail.com
- **Address:** PolliBazar, Madhurkhola, Muksudpur, Dohar, Dhaka, Bangladesh
- **Payment Methods:** Cash on Delivery (ক্যাশ অন ডেলিভারি), bKash (বিকাশ), Nagad (নগদ)
- **Currency:** ৳ (Bangladeshi Taka)
- **Language:** বাংলা (Primary), English (Technical/Code)

---

## ☁️ Cloudflare Pages Architecture & Deployment

The application is structured for direct deployment on **Cloudflare Pages**:
- **Target URL:** `https://pollibazar.pages.dev`
- **GitHub Repository:** `tusar91/pollibazar`
- **Production Branch:** `main`

### ⚙️ Cloudflare Pages Dashboard Build Settings:
When creating or updating your project in the Cloudflare Pages dashboard:
1. **Framework preset:** `Vite` (or `None`)
2. **Build command:** `npm run build`
3. **Build output directory:** `dist`
4. **Root directory:** `/` (leave empty or default)
5. **Environment variables (Settings > Environment variables):**
   - `NODE_VERSION` = `20`
   - `ENVIRONMENT` = `production`
6. **D1 Database Binding (Settings > Functions > D1 database bindings):**
   - Variable name: `DB`
   - D1 database: `pollibazar-db`

### 📦 Clean Installation Files Included:
- `.nvmrc` & `.node-version`: Pin Node.js 20 to ensure modern Vite and React 19 compatibility in Cloudflare build runners.
- `.npmrc`: Ensures deterministic, issue-free CI package installations.
- `package-lock.json`: Pre-resolved dependency graph resolving all peer dependencies with 0 conflicts.
- `public/_redirects`: Direct URL rewrite rule (`/* -> /index.html 200`) preventing 404s on browser refreshes.

### 📁 Project Structure
```text
/
├── index.html                  # HTML entry point (Bengali locale, SEO, Schema.org)
├── public/                     # Static assets automatically copied to dist/
│   ├── _redirects              # Cloudflare Pages SPA rewrite (/* -> /index.html 200)
│   ├── 404.html                # Friendly custom 404 page
│   └── images/                 # Product and category photography
│
├── functions/                  # Cloudflare Pages Functions (Serverless API)
│   └── api/
│       ├── _utils.ts           # Response formatting, Web Crypto hashing, session helpers
│       ├── health.ts           # GET /api/health (Database & service status)
│       ├── products/           # GET /api/products, POST /api/products, [id].ts
│       ├── categories/         # GET /api/categories, POST /api/categories
│       ├── orders/             # POST /api/orders (server-side verification), track.ts
│       ├── customers/          # GET /api/customers (admin only)
│       ├── settings/           # GET /api/settings, PUT /api/settings
│       └── admin/              # login.ts, logout.ts, me.ts
│
├── migrations/
│   └── 0001_initial.sql        # Complete Cloudflare D1 SQL schema with seed data
│
├── src/                        # React 19 + TypeScript + Tailwind CSS application
│   ├── components/             # Reusable UI components (Header, Footer, Cart, etc.)
│   ├── context/                # State management (Product, Cart, Order, Navigation)
│   ├── pages/                  # Customer storefront & Admin pages
│   └── types/                  # Central TypeScript definitions
│
├── wrangler.toml               # Cloudflare configuration with D1 binding
├── package.json
└── README.md
```

---

## 🗄️ Cloudflare D1 Database Setup

1. **Create the D1 database in your Cloudflare account:**
   ```bash
   npx wrangler d1 create pollibazar-db
   ```
2. **Copy the generated `database_id` into `wrangler.toml`:**
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "pollibazar-db"
   database_id = "YOUR_ACTUAL_D1_DATABASE_ID"
   ```
3. **Execute the initial schema migration & seed data:**
   ```bash
   # For local preview / development:
   npx wrangler d1 execute pollibazar-db --local --file=migrations/0001_initial.sql

   # For production:
   npx wrangler d1 execute pollibazar-db --remote --file=migrations/0001_initial.sql
   ```

---

## 🔐 Development Credentials
- **Admin Username:** `admin`
- **Development Password:** `admin123` *(Hashed with salt in `0001_initial.sql`)*
> ⚠️ **Security Notice:** Change the development password immediately before production use.

---

## 🛠️ Local Development & Build

```bash
# Install dependencies
npm install

# Start local Vite development server
npm run dev

# Build production assets for Cloudflare Pages
npm run build
```
Build output will be generated inside the `dist/` directory, ready for Cloudflare Pages.
