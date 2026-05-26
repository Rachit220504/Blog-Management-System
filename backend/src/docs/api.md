# Blog Management System API

## Base URLs

- Versioned API: `/api/v1`
- Backward-compatible alias: `/api`

## Core Modules

- Authentication: `/auth`
- Posts: `/posts`
- Users: `/users`
- Dashboard: `/dashboard`
- Uploads: `/upload`

## Standards

- JWT authentication via `Authorization: Bearer <token>`
- Role-based authorization for `super_admin`, `editor`, `author`, `user`
- Unified JSON response envelope
- Centralized async error forwarding
- Validation before controller execution

## SEO-Centric Post Fields

- `slug`
- `summary`
- `metaTitle`
- `metaDescription`
- `canonicalUrl`
- `keywords`
- `faq`
- `tableOfContents`
- `readTime`

## Status Codes

- `200 OK`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `500 Internal Server Error`