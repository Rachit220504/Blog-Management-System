# Blog Management System

Production-ready blog platform with a public Next.js frontend, a Vite-based admin panel, and an Express/MongoDB backend. The system supports real content publishing, role-based administration, SEO-friendly routing, media uploads, taxonomy pages, and live dashboard data.

## Project Overview

This repository is organized as a small monorepo with three application surfaces:

- `backend/` - REST API, authentication, content management, analytics, and uploads
- `frontend/` - public blog experience built with Next.js App Router
- `admin/` - admin dashboard for posts, SEO, media, users, and settings

The public site is designed for readers and search engines. The admin panel is used by editors and administrators to create, publish, optimize, and manage content. The backend powers both apps with JWT auth, role-based permissions, validation, and media handling.

## Core Features

- Public blog listing, article pages, category pages, tag pages, search, and sitemap/robots support
- Admin dashboard with live stats, post management, taxonomy management, media library, quick search, and notifications
- SEO controls for slugs, canonical URLs, meta titles, descriptions, keywords, FAQ, and table of contents
- Local or Cloudinary media uploads with image deletion and gallery support
- Protected admin workflows with permissions for authors, editors, and super admins

## Role Permissions

The backend and admin UI use role-based access control. The canonical roles are `super_admin`, `editor`, `author`, and `user`. The app also treats `admin` as an alias for `super_admin`.

| Role | Permissions |
| --- | --- |
| `super_admin` | Full dashboard access, full post management, SEO editing, user management, taxonomy management, media upload/delete, and settings access |
| `editor` | View dashboard, create/update/publish posts, edit SEO, read taxonomy, upload media, and view settings |
| `author` | View dashboard, create/update own posts, edit SEO, upload media, and view settings |
| `user` | Basic dashboard and settings access only |

Permission groups used internally include:

- `dashboard:view`
- `posts:read`, `posts:create`, `posts:update`, `posts:delete`, `posts:publish`
- `seo:edit`
- `users:read`, `users:manage`
- `taxonomy:read`, `taxonomy:manage`
- `media:read`, `media:upload`, `media:delete`
- `settings:view`, `settings:manage`

## Setup Steps

### 1) Prerequisites

- Node.js 18 or newer
- npm
- MongoDB connection string
- Optional: Cloudinary account for hosted media uploads

### 2) Clone and install dependencies

Install dependencies separately in each app folder:

```bash
cd backend
npm install

cd ../frontend
npm install

cd ../admin
npm install
```

### 3) Configure environment variables

Create or update the `.env` files for the backend, frontend, and admin apps.

#### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/blog-management
JWT_SECRET=replace_with_a_long_random_secret
JWT_REFRESH_SECRET=replace_with_another_long_random_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
UPLOAD_PROVIDER=local
UPLOAD_DIR=public/uploads
UPLOAD_BASE_URL=http://localhost:5000/uploads
UPLOAD_MAX_FILE_SIZE=5242880
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```

Optional admin bootstrap values:

```env
ADMIN_NAME=Admin User
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_this_password
```

Cloudinary is optional. If you want hosted uploads, set:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
UPLOAD_PROVIDER=cloudinary
```

#### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Admin (`admin/.env`)

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_FRONTEND_URL=http://localhost:3000
```

If your backend runs on a different port, update the frontend and admin API URLs to match.

### 4) Start the backend

```bash
cd backend
npm run dev
```

The API is served at `http://localhost:5000` by default and exposes routes under `/api/v1`.

### 5) Start the public frontend

```bash
cd frontend
npm run dev
```

The public site runs on `http://localhost:3000` by default.

### 6) Start the admin panel

```bash
cd admin
npm run dev
```

The admin panel runs with Vite and should point to the same backend API URL configured in `VITE_API_URL`.

### 7) Create an admin user or seed data

Useful backend scripts:

```bash
cd backend
npm run create:admin
npm run seed
```

Use `ALLOW_LOCAL_SEED=true` when you want to run the seed script in a local environment.

## API Documentation

The API is versioned under `/api/v1`. A backward-compatible alias is also available at `/api`.

### Standards

- JWT authentication via `Authorization: Bearer <token>`
- Unified JSON response envelope
- Validation before controller execution
- Centralized async error handling
- Role-based authorization for protected endpoints

### Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Log in and receive tokens |
| `POST` | `/api/v1/auth/refresh-token` | Refresh the access token |
| `POST` | `/api/v1/auth/logout` | Revoke the refresh token |
| `GET` | `/api/v1/auth/profile` | Fetch the authenticated user profile |
| `PUT` | `/api/v1/auth/profile` | Update the authenticated user profile |

### Posts and Taxonomy

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/posts` | Public post listing |
| `GET` | `/api/v1/posts/search` | Search published posts |
| `GET` | `/api/v1/posts/categories` | Fetch categories |
| `GET` | `/api/v1/posts/categories/:category` | Fetch posts in a category |
| `GET` | `/api/v1/posts/tags` | Fetch tags |
| `GET` | `/api/v1/posts/tags/:tag` | Fetch posts for a tag |
| `GET` | `/api/v1/posts/slug/:slug` | Fetch a single post by slug |
| `GET` | `/api/v1/posts/admin` | Admin post listing |
| `POST` | `/api/v1/posts/admin` | Create a post |
| `GET` | `/api/v1/posts/admin/:id` | View a post in admin mode |
| `PUT` | `/api/v1/posts/admin/:id` | Update a post |
| `DELETE` | `/api/v1/posts/admin/:id` | Delete a post |
| `PATCH` | `/api/v1/posts/admin/:id/publish` | Publish a post |
| `PATCH` | `/api/v1/posts/admin/:id/draft` | Move a post back to draft |
| `GET` | `/api/v1/posts/admin/preview/:id` | Preview a post before publishing |

### Dashboard

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/dashboard/stats` | Live dashboard metrics |

### Users

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/users` | List users |
| `PUT` | `/api/v1/users/:id/role` | Change user role |
| `PUT` | `/api/v1/users/:id/status` | Enable or disable a user |

### Media Uploads

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/upload/media` | List uploaded media |
| `POST` | `/api/v1/upload/image` | Upload a single image |
| `POST` | `/api/v1/upload/feature-image` | Upload a featured image |
| `POST` | `/api/v1/upload/gallery` | Upload multiple images |
| `DELETE` | `/api/v1/upload/media` | Delete media |
| `POST` | `/api/v1/upload` | Backward-compatible upload endpoint |

### Example request headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Example response shape

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {}
}
```

## SEO Features Implemented

The project includes a production-focused SEO workflow across the public site and admin tools.

- Automatic slug generation from titles and meta titles
- Canonical URL generation and validation, including support for localhost during development
- Editable meta title and meta description fields
- Keywords support for content pages
- FAQ and table-of-contents support for articles
- Read-time generation for content pages
- Breadcrumb structured data for taxonomy and article routes
- Collection structured data for category and tag archive pages
- Robots and sitemap support in the Next.js frontend
- SEO-aware public routes for category, tag, and article pages

## Screenshots

All section screenshots are grouped below in one gallery (images loaded from the `screenshots/` folder).

<table>
  <tr>
    <td><img src="screenshots/Screenshot%202026-05-27%20191121.png" alt="Screenshot 1" width="100%" /></td>
    <td><img src="screenshots/Screenshot%202026-05-27%20191133.png" alt="Screenshot 2" width="100%" /></td>
    <td><img src="screenshots/Screenshot%202026-05-27%20191139.png" alt="Screenshot 3" width="100%" /></td>
  </tr>
  <tr>
    <td><img src="screenshots/Screenshot%202026-05-27%20191148.png" alt="Screenshot 4" width="100%" /></td>
    <td><img src="screenshots/Screenshot%202026-05-27%20191214.png" alt="Screenshot 5" width="100%" /></td>
    <td><img src="screenshots/Screenshot%202026-05-27%20191221.png" alt="Screenshot 6" width="100%" /></td>
  </tr>
  <tr>
    <td><img src="screenshots/Screenshot%202026-05-27%20191236.png" alt="Screenshot 7" width="100%" /></td>
    <td><img src="screenshots/Screenshot%202026-05-27%20191249.png" alt="Screenshot 8" width="100%" /></td>
    <td><img src="screenshots/Screenshot%202026-05-27%20191319.png" alt="Screenshot 9" width="100%" /></td>
  </tr>
  <tr>
    <td><img src="screenshots/Screenshot%202026-05-27%20191433.png" alt="Screenshot 10" width="100%" /></td>
    <td><img src="screenshots/Screenshot%202026-05-27%20191446.png" alt="Screenshot 11" width="100%" /></td>
    <td><img src="screenshots/Screenshot%202026-05-27%20191452.png" alt="Screenshot 12" width="100%" /></td>
  </tr>
  <tr>
    <td><img src="screenshots/Screenshot%202026-05-27%20191459.png" alt="Screenshot 13" width="100%" /></td>
    <td><img src="screenshots/Screenshot%202026-05-27%20191507.png" alt="Screenshot 14" width="100%" /></td>
    <td><img src="screenshots/Screenshot%202026-05-27%20191514.png" alt="Screenshot 15" width="100%" /></td>
  </tr>
  <tr>
    <td><img src="screenshots/Screenshot%202026-05-27%20191521.png" alt="Screenshot 16" width="100%" /></td>
    <td><img src="screenshots/Screenshot%202026-05-27%20191530.png" alt="Screenshot 17" width="100%" /></td>
    <td></td>
  </tr>
</table>

If you'd like captions under each screenshot, tell me the preferred label for each file and I will add them.

## Useful Notes

- The public frontend uses Next.js App Router and server-side metadata generation.
- The admin panel uses React Query for live data fetching and cache updates.
- If you change the backend port, update `NEXT_PUBLIC_API_URL` and `VITE_API_URL` to match it.
- Uploaded local media is served from the backend `/uploads` path.

## License

No license file is included in this repository. Add one if you plan to distribute or open source the project.