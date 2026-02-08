# Lumina Learning Platform API (Multi-Tenant Edition)

Lumina is a highly scalable, production-ready **Multi-Tenant Learning Management System (LMS)** backend built with **Express**, **TypeScript**, and **MongoDB**. It features a robust **Modular Monolith** architecture designed to support multiple organizations (tenants) within a single deployment, providing tenant isolation, custom branding, and dedicated configuration.

## 🚀 Key Features

### 🏢 Multi-Tenancy Core
-   **Tenant Isolation**: Data is logically separated by `tenantId` using a globally applied Mongoose plugin, ensuring strict data privacy between organizations.
-   **Context Awareness**: Automatic tenant resolution via **Subdomains** (e.g., `school.lumina.com`) or **Custom Headers** (`x-tenant-id`).
-   **Custom Branding**: Each tenant can configure their own logos, primary/secondary colors, and fonts.
-   **Module Toggle**: Tenants can enable/disable specific modules (Gamification, Payments, Blog, etc.) based on their subscription.

### 🧩 16+ Specialized Modules
Lumina provides a full-featured e-learning experience through its modular architecture:

-   **🔐 Auth**: Secure JWT-based authentication with Access/Refresh token rotation.
-   **👤 Users**: Profile management with Role-Based Access Control (Student, Instructor, Admin, System Admin).
-   **🛠️ System Admin**: Centralized tenant management (onboarding, configuration) and super-admin controls.
-   **� CMS / Pages**: A dedicated module for tenants to create and manage custom pages (Landing, About, Contact) with dynamic routing.
-   **�📚 Courses**: Advanced course catalog with structured modules, lessons, and taxonomy.
-   **📝 Assessments**: Quizzes (time limits, passing scores) and Assignment management.
-   **🛒 Commerce**: Full shopping **Cart**, **Wishlist**, and **Payment** integration (Stripe/Paystack support per tenant).
-   **📝 Blog**: Content marketing and educational blogging system.
-   **☁️ Assets**: Professional media management using **Cloudinary**.
-   **💬 Discussions**: Course-wide forums and lesson-specific Q&A threads.
-   **🎮 Gamification**: Point system, Streak tracking, Leaderboards, and Achievements.
-   **📜 Certificates**: Automated PDF certificate generation.
-   **🤖 AI Engine**: AI-powered tutoring and study assistants.
-   **🎥 Live Sessions**: Real-time virtual classroom scheduling.
-   **🔔 Notifications**: Real-time multi-channel notification system.
-   **📊 Analytics**: Deep tracking for course progress and engagement.

## 🛡️ Security & Architecture

-   **Clean Architecture**: Modular structure for high maintainability.
-   **Security First**: Helmet, CORS, Rate Limiting, XSS Protection, and strict Tenant Context middleware.
-   **Validation**: Strict schema validation using Zod and Mongoose.
-   **Documentation**: Fully documented Interactive API using **Swagger (OpenAPI 3.0)**.
-   **Scalability**: Paginated and filterable discovery across all major data modules.

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file based on the following requirements:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# Security
JWT_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# System Admin Seeding (Optional - Defaults provided)
SYSTEM_ADMIN_EMAIL=admin@lumina.com
SYSTEM_ADMIN_PASSWORD=ChangeMe123!

# Commerce (Paystack/Stripe)
PAYSTACK_SECRET_KEY=your_paystack_key
STRIPE_SECRET_KEY=your_stripe_key

# Media Management (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Run Development
```bash
npm run dev
```

> **Note**: On the first run, the server will automatically seed a default **System Admin** user credentials (if not already present). Check your console implementation logs for confirmation.

## 📖 API Documentation
Once the server is running, access the full interactive API documentation at:
`http://localhost:5000/api-docs`

---
*Lumina - Empowering the future of digital learning.*
