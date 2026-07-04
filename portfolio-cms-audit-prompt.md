# Portfolio CMS — Full Codebase Audit & Production Hardening

## Prompt for Claude Code (VS Code)

---

### Copy everything below this line and paste into Claude Code in VS Code:

---

## Role & Context

You are a **4-person senior engineering team** auditing a Cloudflare R2 + Workers portfolio CMS backend before production deployment. This codebase was just built and has NOT been reviewed yet. Treat it as a **first pull request from a junior developer** — assume nothing works correctly until you verify it.

The project is at the root of this workspace: `portfolio-cms-worker/` (or the current directory). Read every single file before making any changes.

**Your team roles:**

1. **Security Architect** — finds auth bypasses, injection risks, secret leaks, CORS misconfigurations, header issues, timing attacks, token vulnerabilities
2. **Senior Backend Engineer** — finds logic bugs, race conditions, edge cases, type mismatches, broken CRUD flows, missing error handling, inconsistent patterns
3. **Performance Engineer** — finds unnecessary R2 reads/writes, missing caching headers, payload bloat, slow patterns, memory issues in Workers runtime
4. **QA Lead** — validates every API route works end-to-end, checks request/response contracts, finds missing validation, tests boundary conditions

---

## Phase 1 — FULL CODEBASE READ (Do this first, change nothing)

Read every file in the project. Build a mental map of:
- How requests flow from `index.ts` → middleware → handlers → R2
- How auth works end-to-end (login → token creation → token validation → route protection)
- How each handler reads/modifies/writes R2 data
- How errors propagate and get returned to the client
- How CORS is applied
- How types are used across the codebase

**Do NOT make any changes yet.** Just read and understand.

---

## Phase 2 — ISSUE DISCOVERY (Document everything before fixing)

After reading the full codebase, produce a **comprehensive audit report** organized by category. For each issue found, document:
- **File & line**: exact location
- **Severity**: 🔴 Critical (security/data loss) | 🟠 High (broken functionality) | 🟡 Medium (edge case/UX) | 🔵 Low (code quality)
- **Description**: what's wrong
- **Impact**: what happens if not fixed
- **Fix**: how to fix it

### Audit Checklist — Check EVERY item below:

---

### A. SECURITY AUDIT

**Authentication & Authorization:**
- [ ] Is the login endpoint properly rate-limited or does it allow brute force?
- [ ] Is the password comparison timing-safe (constant-time comparison)? If using simple `===` string comparison, it's vulnerable to timing attacks.
- [ ] Does the JWT include proper claims (`iss`, `sub`, `aud`, `exp`, `iat`, `jti`)?
- [ ] Is the JWT `exp` actually checked during validation? Is it checked BEFORE signature verification (fail fast)?
- [ ] Can an expired token still access admin routes?
- [ ] Is there any way to access `/api/admin/*` routes without a valid token?
- [ ] Can the token be replayed indefinitely within its TTL?
- [ ] Is there token revocation support? (At minimum: can admin change the JWT_SECRET to invalidate all tokens?)
- [ ] Are secrets (ADMIN_PASSWORD_HASH, JWT_SECRET) properly loaded from environment, never hardcoded?
- [ ] Is there any logging or console.log that leaks tokens, passwords, or hashes?

**Input Validation & Injection:**
- [ ] Is every handler validating input before processing? Check for missing validation on:
  - POST/PUT request bodies (are they validated as JSON? what if body is empty? what if body is not JSON?)
  - URL path parameters (`:id`, `:slug` — what if they contain special characters, `../`, null bytes?)
  - File uploads (type, size, filename — can someone upload a `.html` or `.js` file disguised as an image?)
  - Reorder payloads (what if sortOrder values are negative, duplicate, or non-integers?)
- [ ] Is there any path traversal risk in the upload handler's key generation? Can an attacker control the R2 storage path?
- [ ] Are R2 keys sanitized? What if a slug contains characters that break R2 key paths?
- [ ] Is there any risk of JSON injection through unsanitized string fields (title, description)?

**CORS:**
- [ ] Does CORS correctly restrict origins in production? Is `*` used anywhere?
- [ ] Are preflight OPTIONS responses returning correct headers?
- [ ] Is `Access-Control-Allow-Credentials` set? Should it be?
- [ ] Does every response (including errors, 404s, 500s) include CORS headers? If error responses lack CORS headers, the browser will show a CORS error instead of the actual error.

**Headers & Transport:**
- [ ] Are these security headers set?
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Cache-Control` appropriate per endpoint (no-store for admin, cacheable for public)
  - `Content-Type: application/json` on every JSON response
- [ ] Is the `Content-Type` of the incoming request validated (should be `application/json` for POST/PUT)?

---

### B. LOGIC & CORRECTNESS AUDIT

**Router:**
- [ ] Does the router correctly match all documented routes? Test each route mentally:
  - `/api/projects` — does it match?
  - `/api/projects/healthcare-management-system` — does slug extraction work?
  - `/api/admin/projects` — does it match? Does auth guard run?
  - `/api/admin/projects/proj-hcm-001` — does ID extraction work?
  - `/api/admin/projects/reorder` — does it match? Or does it conflict with `:id` pattern?
  - `/api/admin/upload/assets/project-screenshots/image.png` — does the key extraction handle paths with multiple slashes?
- [ ] Is there a route conflict between `/api/admin/projects/reorder` (PATCH) and `/api/admin/projects/:id` (PUT/DELETE)? Does "reorder" get treated as an ID?
- [ ] Does the 404 handler work for unknown routes?
- [ ] Does the router distinguish between GET/POST/PUT/DELETE/PATCH correctly?

**CRUD Operations:**
- [ ] **CREATE**: Does it check for duplicate slugs before creating? What if two projects have the same title → same slug?
- [ ] **CREATE**: Does it properly auto-assign sortOrder as (max existing + 1)? What if the array is empty (first item)?
- [ ] **UPDATE**: Does it preserve `id` and `createdAt` even if the request body tries to overwrite them?
- [ ] **UPDATE**: If the title changes, does it regenerate the slug? Does it check for slug conflicts with other items?
- [ ] **DELETE**: Does it recalculate sortOrder for remaining items? Are there off-by-one errors?
- [ ] **DELETE**: If a project has associated images in R2, does deleting the project clean up the images? (Orphaned assets)
- [ ] **REORDER**: Does it validate that all IDs in the reorder request actually exist? What if a non-existent ID is included?
- [ ] **REORDER**: What if only partial IDs are sent (reorder 2 out of 5 projects)? Do the missing items get sortOrder 0 or undefined?

**R2 Operations:**
- [ ] What happens if `env.CMS_BUCKET.get("data/projects.json")` returns `null` (file doesn't exist yet)? Does it crash with `Cannot read properties of null`?
- [ ] Is there error handling for R2 write failures?
- [ ] Is `JSON.parse()` wrapped in try-catch everywhere R2 data is read? What if the JSON file is corrupted?
- [ ] Are R2 reads using `.text()` or `.json()` correctly? The R2 object body must be consumed properly.

**Data Integrity:**
- [ ] Is `updatedAt` set on every mutation?
- [ ] Is `createdAt` set only on creation and never modified on updates?
- [ ] Are `id` fields truly unique? Is `crypto.randomUUID()` used correctly?
- [ ] What happens if two admin requests hit the Worker simultaneously? (Read-modify-write race condition on the same JSON file)

---

### C. PERFORMANCE & EFFICIENCY AUDIT

**R2 Operations:**
- [ ] Are there any handlers that read R2 multiple times when once would suffice?
- [ ] For GET (public list) endpoints: are items filtered and sorted server-side before responding, or is the full array sent?
- [ ] For the upload handler: are large files handled efficiently? Workers have a ~128MB memory limit.
- [ ] Is there any R2 read/write that happens outside a request (global scope)? Workers share global scope across requests — this would cause bugs.

**Response Optimization:**
- [ ] Do public GET endpoints return `Cache-Control` headers so browsers/CDNs cache responses?
  - Recommended: `Cache-Control: public, max-age=300, s-maxage=3600` for public data
  - `Cache-Control: no-store` for admin endpoints
- [ ] Is the response payload optimized? Are internal fields (like `isVisible`, `createdAt`, `updatedAt`) stripped from public responses? Visitors don't need to see admin metadata.
- [ ] Is `ETag` or `Last-Modified` set for public responses to support conditional requests?

**Worker Size & Cold Start:**
- [ ] Is the bundled Worker size reasonable? Any unnecessary code bloat?
- [ ] Are imports tree-shakeable? No importing entire modules when only one function is used.

---

### D. EDGE CASES & BOUNDARY CONDITIONS

- [ ] Empty state: What does `/api/projects` return when there are zero projects? Should be `{ success: true, data: [], message: "..." }`, not an error.
- [ ] What if someone calls POST with `Content-Type: text/plain` instead of `application/json`?
- [ ] What if the request body is valid JSON but wrong shape? (e.g., `{ "name": "test" }` instead of `{ "title": "test" }`)
- [ ] What if the request body exceeds Workers' 1MB limit (100MB for paid)?
- [ ] What if the upload file has no extension?
- [ ] What if the upload filename contains unicode, spaces, or special characters?
- [ ] What if the slug generator produces an empty string? (e.g., title is all special characters)
- [ ] What if the same image filename is uploaded twice? Does it overwrite or create a unique name?
- [ ] What if `about.json` doesn't exist yet and admin tries GET /api/admin/about?
- [ ] What does the health endpoint `/api/health` return? Does it actually verify R2 connectivity or just return 200?
- [ ] What happens to the export endpoint if one of the R2 files doesn't exist? Does the entire export fail or does it skip missing files?
- [ ] Import endpoint: does it validate the JSON structure before writing to R2, or does it blindly write? What if malformed data is imported?

---

### E. API DESIGN & CONSISTENCY AUDIT

- [ ] Are all responses using the `ApiResponse<T>` wrapper consistently? No raw strings or unwrapped objects?
- [ ] Are HTTP status codes correct?
  - 200 for successful GET, PUT, PATCH, DELETE
  - 201 for successful POST (create)
  - 400 for validation errors
  - 401 for missing/invalid token
  - 403 for valid token but insufficient permissions (not needed for single admin, but consider)
  - 404 for not found
  - 405 for method not allowed
  - 500 for internal errors
- [ ] Are error messages consistent and helpful? No generic "Something went wrong" — include what went wrong.
- [ ] Is the public `/api/settings` endpoint returning only safe fields? (Not exposing `googleAnalyticsId` or internal config that should be admin-only)
- [ ] Does the public About endpoint strip sensitive info (phone, email) or is that intentional?

---

### F. MISSING FEATURES CHECK

Check if these features exist and are properly implemented:

- [ ] **Health check endpoint** (`/api/health`) — returns API status + R2 connectivity check
- [ ] **Export endpoint** (`/api/admin/export`) — downloads all CMS data as single JSON backup
- [ ] **Import endpoint** (`/api/admin/import`) — restores CMS data from a backup JSON
- [ ] **Upload handler** — accepts images, validates type/size, stores in R2, returns URL
- [ ] **Upload delete handler** — deletes a specific asset from R2
- [ ] **Reorder handler** for every collection (projects, products, services, FAQ)
- [ ] **Slug uniqueness** — enforced across creates and updates
- [ ] **Request logging** — at minimum, log the method + path + status code + response time for each request (use `console.log` which goes to Cloudflare dashboard logs)
- [ ] **Error boundary** — top-level try-catch in the main router that catches any unhandled error and returns a clean 500 response instead of crashing
- [ ] **Method not allowed** — if someone sends POST to a GET-only route, return 405 not 404
- [ ] **Trailing slash handling** — `/api/projects/` should work the same as `/api/projects`
- [ ] **Password change endpoint** — can the admin update their password via the API? If not, document how to do it via Wrangler CLI.
- [ ] **Bulk visibility toggle** — can admin hide/show multiple items at once? (nice to have)
- [ ] **Search/filter in admin** — do admin list endpoints support `?search=` query parameter? (nice to have)

---

### G. CODE QUALITY & CONSISTENCY

- [ ] Are there any `any` types? Replace with proper types.
- [ ] Are there any `// TODO` or `// FIXME` comments left in the code?
- [ ] Is error handling consistent across all handlers? (Same pattern everywhere)
- [ ] Are all imports correct? No unused imports?
- [ ] Is the code DRY? Any duplicated logic that should be extracted into a shared utility?
  - Common patterns to extract: "read JSON from R2, parse, handle null", "find item by ID in array", "write JSON back to R2"
- [ ] Are TypeScript types from `types.ts` actually used in all handlers? Or are some handlers using inline types?
- [ ] Is naming consistent? (camelCase for variables, PascalCase for types, kebab-case for files)
- [ ] Are magic strings avoided? (R2 keys should use `R2_KEYS` constants, not hardcoded strings)

---

### H. DEPLOYMENT & CONFIGURATION

- [ ] Does `wrangler.toml` have the correct configuration?
- [ ] Is `compatibility_date` set to a recent date?
- [ ] Are R2 bucket bindings correct for both production and preview?
- [ ] Does `tsconfig.json` include `@cloudflare/workers-types`?
- [ ] Is there a build script in `package.json`?
- [ ] Is there a dev script (`wrangler dev`) in `package.json`?
- [ ] Does `.gitignore` exclude `.dev.vars`, `node_modules/`, `dist/`, `.wrangler/`?
- [ ] Does the README document all setup steps including secret generation?

---

## Phase 3 — FIX EVERYTHING

After producing the audit report, fix every issue found. Apply fixes in this priority order:

### Priority 1 — 🔴 Critical (fix first)
Security vulnerabilities, auth bypasses, data loss risks, crashes on normal operations.

### Priority 2 — 🟠 High (fix second)
Broken CRUD operations, logic bugs, missing error handling, route conflicts.

### Priority 3 — 🟡 Medium (fix third)
Edge cases, missing validation, performance issues, inconsistent responses.

### Priority 4 — 🔵 Low (fix last)
Code quality, naming, documentation, nice-to-have features.

**For each fix:**
1. State which issue you're fixing (reference the audit report)
2. Show the exact file and the change
3. Explain why this fix is correct
4. Move to the next issue

---

## Phase 4 — HARDENING & PROFESSIONAL POLISH

After all issues are fixed, add these production hardening features if they don't already exist:

### 4A. Request Logging Middleware
Add lightweight request logging that captures:
```
[2026-07-03T10:30:00Z] POST /api/admin/projects 201 145ms
[2026-07-03T10:30:05Z] GET /api/projects 200 12ms
```
Use `console.log` — Cloudflare captures Worker logs in the dashboard.

### 4B. Rate Limiting (Simple)
Since Workers don't have built-in rate limiting on the free tier, implement a simple in-memory approach:
- Track login attempts by IP
- After 5 failed login attempts from the same IP within 15 minutes, block further attempts
- Note: This is per-isolate (not globally shared), so it's not bulletproof, but it's better than nothing

### 4C. Cache Control Headers
Add proper cache headers to all responses:
```
Public GET endpoints:  Cache-Control: public, max-age=300, s-maxage=3600
Admin endpoints:       Cache-Control: no-store, no-cache, must-revalidate
Upload/asset URLs:     Cache-Control: public, max-age=31536000, immutable
Error responses:       Cache-Control: no-store
```

### 4D. Security Headers
Add to every response:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 4E. R2 Helper Utility
If not already extracted, create a shared R2 utility:
```typescript
// src/utils/r2-helpers.ts
async function readJsonFromR2<T>(bucket: R2Bucket, key: string): Promise<T | null>
async function writeJsonToR2<T>(bucket: R2Bucket, key: string, data: T): Promise<void>
async function readCollectionFromR2<T>(bucket: R2Bucket, key: string): Promise<T[]>
```
This eliminates duplicated R2 read/parse/write logic across all handlers.

### 4F. CRUD Helper Utility
If not already extracted, create shared CRUD helpers:
```typescript
// src/utils/crud-helpers.ts
async function createItem<T extends { id: string; sortOrder: number }>(
  bucket: R2Bucket,
  key: string,
  newItem: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'>,
  generateSlug?: (item: any) => string
): Promise<T>

async function updateItem<T extends { id: string }>(
  bucket: R2Bucket,
  key: string,
  id: string,
  updates: Partial<T>
): Promise<T | null>

async function deleteItem<T extends { id: string; sortOrder: number }>(
  bucket: R2Bucket,
  key: string,
  id: string
): Promise<boolean>

async function reorderItems<T extends { id: string; sortOrder: number }>(
  bucket: R2Bucket,
  key: string,
  orderMap: { id: string; sortOrder: number }[]
): Promise<T[]>
```
This DRYs up the entire handler layer. Projects, Products, Services, and FAQ all share the same CRUD pattern.

### 4G. Input Sanitization
Add a sanitize utility that:
- Trims all string fields
- Strips HTML tags from text fields (prevent stored XSS)
- Validates URL fields are actually URLs
- Normalizes email to lowercase
- Rejects strings that are only whitespace

### 4H. Graceful Degradation
- If any seed JSON file doesn't exist in R2, public endpoints should return empty arrays/objects, not 500 errors
- The health endpoint should actually test R2 connectivity (try to read a small test key)
- Import should validate the complete structure before writing anything (atomic: all-or-nothing)

### 4I. API Versioning Readiness
Add `/api/v1/` prefix support in the router so future API changes don't break existing clients. For now, both `/api/projects` and `/api/v1/projects` should work.

---

## Phase 5 — FINAL VERIFICATION

After all fixes and hardening:

1. **Read every file one more time** and verify:
   - No TypeScript errors
   - No unused imports
   - No `any` types
   - No `console.log` of sensitive data
   - All handlers use the standardized response helpers
   - All admin routes are behind the auth guard
   - All R2 reads handle the null case

2. **Trace these request flows** mentally and verify they work:
   - Visitor opens portfolio → GET /api/projects → returns only visible projects sorted by sortOrder
   - Admin logs in → POST /api/auth/login → returns JWT
   - Admin creates a project → POST /api/admin/projects with Bearer token → creates in R2, returns 201
   - Admin updates a project title → PUT /api/admin/projects/:id → slug regenerated, updatedAt set
   - Admin deletes a project → DELETE /api/admin/projects/:id → removed from array, sortOrders recalculated
   - Admin reorders projects → PATCH /api/admin/projects/reorder → sortOrders updated
   - Admin uploads an image → POST /api/admin/upload → image stored in R2, URL returned
   - Admin exports all data → POST /api/admin/export → single JSON with all sections
   - Admin imports a backup → POST /api/admin/import → validates then writes all sections
   - Invalid token → any admin route → 401 response WITH CORS headers
   - Unknown route → 404 response WITH CORS headers
   - Malformed JSON body → 400 response with clear error message

3. **Produce a final summary**:
   - Total issues found (by severity)
   - Total issues fixed
   - Features added during hardening
   - Any remaining known limitations
   - Confirmation the codebase is production-ready

---

## CRITICAL RULES

- **Read everything BEFORE changing anything** — understand the full codebase first
- **Document issues BEFORE fixing** — no silent fixes; I need to see what was wrong
- **One fix at a time** — don't bulk-change 10 files at once; fix one issue, confirm, move on
- **Never break existing functionality** — every fix must preserve what already works
- **Test mentally after each fix** — trace the request flow through the changed code
- **No new dependencies** — everything must remain zero-dependency Workers-compatible
- **Preserve the existing project structure** — don't reorganize files unless there's a critical reason
- **If you find an architectural problem** that requires significant restructuring, stop and present it to me with options before proceeding

---

## START NOW

Begin with Phase 1 — read every file in the project. Then produce the Phase 2 audit report. Do NOT start fixing anything until the full audit report is complete and I've seen it.
