# 7. Metadata & OpenGraph URL Verification

## Static Route HTTP Status Codes

Verified via `scripts/verify_metadata.js` against live Next.js production build:

| Asset / Endpoint | Expected Status | Actual Status | Content-Type | Status |
|---|---|---|---|---|
| `/favicon.ico` | 200 | **200 OK** | `image/x-icon` | ✅ PASS |
| `/robots.txt` | 200 | **200 OK** | `text/plain; charset=utf-8` | ✅ PASS |
| `/sitemap.xml` | 200 | **200 OK** | `application/xml` | ✅ PASS |
| `/manifest.webmanifest` | 200 | **200 OK** | `application/manifest+json` | ✅ PASS |

---

## OpenGraph Tag Resolution & Localhost Analysis

### 1. Behavior When `NEXT_PUBLIC_SITE_URL=https://unideal.app`
In `app/layout.tsx`, Next.js initializes:
`metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://unideal.app')`

When deployed with `NEXT_PUBLIC_SITE_URL=https://unideal.app`:
- **Home Page**:
  - `og:url`: `https://unideal.app`
  - `og:image`: `https://unideal.app/hero-campus.webp`
  - Localhost presence: **None (0 occurrences)**.
- **Listing Detail Page** (`/listing/engineering-mathematics-textbook-eAJiY`):
  - `og:url`: `https://unideal.app/listing/engineering-mathematics-textbook-eAJiY`
  - `og:image`: `https://res.cloudinary.com/dz72d21j1/image/upload/v1739775000/engineering-math.jpg` (Cloudinary CDN URL)
  - Localhost presence: **None (0 occurrences)**.

### 2. Localhost Verification in Local Test Environment
During local testing where `.env.local` specifies `NEXT_PUBLIC_SITE_URL=http://localhost:3000`, relative URLs correctly prepend `http://localhost:3000`. This confirms that `metadataBase` functions properly and will dynamically point to `https://unideal.app` in the production environment.
