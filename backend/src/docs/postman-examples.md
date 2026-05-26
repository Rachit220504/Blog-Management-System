# Postman Testing Examples

## Environment Variables

- `baseUrl`: `http://localhost:5000/api/v1`
- `accessToken`: access JWT returned from login
- `refreshToken`: refresh JWT returned from login or set as cookie

## Test Flow

1. Register a user with `POST {{baseUrl}}/auth/register`.
2. Log in with `POST {{baseUrl}}/auth/login`.
3. Copy `accessToken` into the `Authorization` header as `Bearer {{accessToken}}`.
4. Hit `GET {{baseUrl}}/auth/profile`.
5. Trigger `POST {{baseUrl}}/auth/refresh-token` after access token expiry.
6. Call `POST {{baseUrl}}/auth/logout` to revoke the refresh token version.

## Example Headers

```http
Content-Type: application/json
Authorization: Bearer {{accessToken}}
```

## Example Protected Requests

- `GET {{baseUrl}}/posts/admin`
- `POST {{baseUrl}}/posts/admin`
- `PUT {{baseUrl}}/users/:id/role`
- `POST {{baseUrl}}/auth/logout`

## Expected Security Behavior

- Missing access token returns `401`
- Expired access token returns `401` with code `ACCESS_TOKEN_EXPIRED`
- Invalid refresh token returns `401`
- Logout clears secure cookies and revokes the refresh token version