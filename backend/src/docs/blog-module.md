# Blog Module Reference

## Core Schema Fields

- `title`
- `slug`
- `content`
- `excerpt`
- `metaTitle`
- `metaDescription`
- `canonicalUrl`
- `featureImage`
- `ogTitle`
- `ogDescription`
- `ogImage`
- `twitterTitle`
- `twitterDescription`
- `twitterImage`
- `tags`
- `categories`
- `faq`
- `internalLinks`
- `externalLinks`
- `author`
- `status`
- `readingTime`
- `tableOfContents`

## Public APIs

- `GET /api/v1/posts`
- `GET /api/v1/posts/search`
- `GET /api/v1/posts/slug/:slug`
- `GET /api/v1/posts/categories`
- `GET /api/v1/posts/categories/:category`
- `GET /api/v1/posts/tags`
- `GET /api/v1/posts/tags/:tag`

## Admin APIs

- `GET /api/v1/posts/admin`
- `GET /api/v1/posts/admin/:id`
- `GET /api/v1/posts/admin/preview/:id`
- `POST /api/v1/posts/admin`
- `PUT /api/v1/posts/admin/:id`
- `PATCH /api/v1/posts/admin/:id/publish`
- `PATCH /api/v1/posts/admin/:id/draft`
- `DELETE /api/v1/posts/admin/:id`

## Workflow

1. Create or update a post with SEO metadata, tags, categories, and FAQ data.
2. Use the draft workflow while editing or publishing.
3. Preview draft content through the protected preview endpoint.
4. Publish when ready; `publishedAt` is retained and the slug remains unique.

## Validation Rules

- `title` is required and limited to 150 characters.
- `excerpt` is required and limited to 300 characters.
- `metaTitle` is limited to 70 characters.
- `metaDescription` is limited to 160 characters.
- `canonicalUrl`, `ogImage`, and `twitterImage` must be valid URLs when provided.
- `slug` must remain URL-safe and unique.

## RBAC

- `author` can manage own posts only.
- `editor` can manage all posts.
- `super_admin` has full access.
- `viewer` is read-only and uses the public endpoints only.