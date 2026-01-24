# Lumina Learning Platform API

Lumina is a highly scalable, production-ready Learning Management System (LMS) backend built with **Express**, **TypeScript**, and **MongoDB**. It features a robust **Modular Monolith** architecture designed for visual excellence, developer productivity, and high performance.

## 🚀 Key Modules

Lumina is composed of 16+ specialized modules providing a full-featured e-learning experience:

- **🔐 Auth**: Secure JWT-based authentication with Access/Refresh token rotation.
- **👤 Users**: Profile management, Role-Based Access Control (Student, Instructor, Admin).
- **📚 Courses**: Advanced course catalog with structured modules, lessons, and taxonomy (Categories/Subcategories).
- **📝 Assessments**: Quizzes (time limits, passing scores) and Assignment management.
- **🛒 Commerce**: Full shopping **Cart**, **Wishlist**, and **Paystack Payment** integration (including Webhooks).
- **📝 Blog**: Content marketing and educational blogging system with SEO support and reading time calculation.
- **☁️ Assets**: Professional media management using **Cloudinary** with folder-based organization and streaming uploads.
- **💬 Discussions**: Course-wide forums and lesson-specific Q&A threads with upvoting and "Accepted Answer" support.
- **🎮 Gamification**: Point system, Streak tracking, Leaderboards, and automated Achievement badges.
- **📜 Certificates**: Automated PDF certificate generation and public verification system.
- **🤖 AI Engine**: AI-powered tutoring sessions and study assistants.
- **🎥 Live Sessions**: Scheduling and management for real-time virtual classrooms.
- **🔔 Notifications**: Real-time multi-channel notification system (In-app, Email placeholder).
- **📊 Analytics**: Deep tracking for course progress, user engagement, and platform-wide statistics.
- **🛠️ System Admin**: Centralized taxonomy management and platform configuration.

## 🛡️ Security & Architecture

- **Clean Architecture**: Modular structure for high maintainability and easy scaling.
- **Security First**: Helmet, CORS, Rate Limiting, and XSS Protection.
- **Validation**: Strict schema validation using Zod and Mongoose.
- **Documentation**: Fully documented Interactive API using **Swagger (OpenAPI 3.0)**.
- **Scalability**: Paginated and filterable discovery across all major data modules (Courses, Enrollments, Discussions, Blogs).

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

# Commerce (Paystack)
PAYSTACK_SECRET_KEY=your_paystack_key
FRONTEND_URL=http://localhost:3000

# Media Management (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Run Development
```bash
npm run dev
```

## 📖 API Documentation
Once the server is running, access the full interactive API documentation at:
`http://localhost:5000/api-docs`

---
*Lumina - Empowering the future of digital learning.*
