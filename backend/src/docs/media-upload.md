# Media Upload API

The upload module supports secure image handling for blog content and feature images.

## Environment Variables

- `UPLOAD_PROVIDER=local` or `cloudinary`
- `UPLOAD_MAX_FILE_SIZE=5242880`
- `UPLOAD_ALLOWED_MIME_TYPES=image/jpeg,image/jpg,image/png,image/webp,image/gif`
- `UPLOAD_DIR=public/uploads`
- `UPLOAD_BASE_URL=http://localhost:5000/uploads`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Endpoints

- `POST /api/upload` - backward-compatible single image upload
- `POST /api/upload/image` - upload a blog image
- `POST /api/upload/feature-image` - upload a feature image
- `POST /api/upload/gallery` - upload multiple images
- `GET /api/upload/media` - list local uploaded files
- `DELETE /api/upload/media` - delete a local file or Cloudinary asset by URL

## Notes

- Only authenticated users with `super_admin`, `editor`, or `author` roles can upload media.
- Files are validated by MIME type, extension, and buffer signature.
- Uploaded images are optimized to WebP before being saved locally or sent to Cloudinary.