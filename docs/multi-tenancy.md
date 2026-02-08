# Multi-Tenancy Architecture

Lumina is built as a **Strict SaaS** application, meaning all data and user interactions are scoped to a specific tenant (School/Organization). This document outlines the architecture, isolation strategy, and onboarding processes.

## 1. Core Concepts

### Tenant Identity
Every request to the API is identified as belonging to a specific tenant. This is determined by the `tenantMiddleware` using one of the following strategies:
1.  **Custom Domain/Subdomain**: `school-a.lumina.com` -> Tenant: `school-a`
2.  **Header**: `x-tenant-id: <tenant-object-id>` (Primary method for API testing/development)

### Context Management
We use `AsyncLocalStorage` to store the tenant context for the duration of a request.
- **Middleware**: `src/common/middlewares/tenant.middleware.ts`
- **Context Access**: `src/common/contexts/tenant.context.ts`

## 2. Data Isolation Strategy

We employ a **Shared Database, Separate Schemas (Logical Isolation)** approach.

### Tenant Plugin
All Mongoose models that require isolation use the `tenantPlugin`.
- **Path**: `src/common/plugins/tenant.plugin.ts`
- **Function**:
    - Automatically adds a `tenantId` field to the schema.
    - Adds a global `pre('find')` hook to filter queries by the current `tenantId` from context.
    - Adds a global `pre('save')` hook to automatically inject the `tenantId` into new documents.

### Indexes & Uniqueness
Global uniqueness constraints (e.g., `email: unique`) are removed in favor of compound tenant-scoped indexes.
- **Example**: `userSchema.index({ email: 1, tenantId: 1 }, { unique: true })`
- This allows `alice@example.com` to exist in *Tenant A* and a different user with the same email in *Tenant B*.

## 3. Tenant Onboarding Flow

Onboarding is currently an **internal administrative process**.

### Step 1: Creation
An admin creates a tenant via the System Admin API.
- **Endpoint**: `POST /api/v1/system-admin/tenants`
- **Payload**:
  ```json
  {
    "name": "Acme University",
    "slug": "acme", // Optional, auto-generated from name if omitted
    "domain": "acme.university.com", // Optional custom domain
    "ownerId": "user_id_of_owner" // Optional, defaults to creator
  }
  ```

### Step 2: Configuration (Automatic)
The system automatically assigns a default configuration:
- **Modules**: All core modules (Gamification, Payments, etc.) are enabled by default.
- **Branding**: Default primary color (`#007bff`) and font (`Inter`).

### Step 3: Activation
The tenant is immediately active. The `slug` or `domain` is reserved globally to prevent collisions.

## 4. Tenant Configuration
Tenants can be configured via `PATCH /api/v1/system-admin/tenants/:tenantId/config` to update:
- **Branding**: Logos, colors, fonts.
- **Feature Flags**: Enable/Disable specific modules.
- **Payment Keys**: Encrypted Paystack/Stripe keys.
