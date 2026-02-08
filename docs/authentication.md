# SaaS Authentication

Lumina's authentication system is refactored to support **Strict Multi-Tenancy**. Users do not log in to a "global" platform; they log in to a specific **Tenant**.

## 1. Tenant-Scoped Users

Users are **not shared** across tenants.
- A user identity is unique only within a `tenantId`.
- **Global Identity**: There is no global "Lumina User" table. If a person belongs to two schools, they have two distinct User records with potentially different roles and profiles.

## 2. Authentication Flow (Google OAuth)

The Google OAuth flow (`passport.config.ts`) enforces tenant context.

### The Flow
1.  **Initiation**: User clicks "Login with Google" on a tenant's login page (e.g., `school-a.lumina.com/login`).
2.  **Request**: The request hits `/api/v1/auth/google`.
    - **Middleware**: `tenantMiddleware` identifies the tenant `school-a`.
    - **Passport**: Redirects to Google.
3.  **Callback**: Google redirects back to `/api/v1/auth/google/callback`.
    - **Context**: The callback request MUST still carry the tenant context (via cookie, session, or subdomain).
4.  **Resolution**:
    - The `GoogleStrategy` callback receives the `req` object.
    - It extracts `req.tenant`.
    - It queries the database: `User.findOne({ email: profile.email, tenantId: req.tenant._id })`.
5.  **Provisioning (Auto-Registration)**:
    - If no user is found for *this tenant*, a new User and StudentProfile are created, stamped with the current `tenantId`.

## 3. Security Implications

- **Cross-Tenant Leakage**: Impossible by design, as every query includes `tenantId`.
- **Super Admins**: System administrators have accounts in a specific "Main" or "Admin" tenant but may have logic to impersonate or manage other tenants (TBD).
