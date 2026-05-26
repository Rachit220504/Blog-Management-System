# Authentication Examples

## Register

`POST /api/v1/auth/register`

Request body:
```json
{
  "name": "Alex SuperAdmin",
  "email": "admin@example.com",
  "password": "admin123"
}
```

Success response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "66a000000000000000000001",
    "name": "Alex SuperAdmin",
    "email": "admin@example.com",
    "role": "super_admin",
    "status": "active",
    "bio": "",
    "avatar": "",
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

## Login

`POST /api/v1/auth/login`

Request body:
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Success response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "66a000000000000000000001",
    "name": "Alex SuperAdmin",
    "email": "admin@example.com",
    "role": "super_admin",
    "status": "active",
    "bio": "",
    "avatar": "",
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

## Refresh Access Token

`POST /api/v1/auth/refresh-token`

Uses the `refreshToken` httpOnly cookie or an optional JSON body field.

Success response:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

## Logout

`POST /api/v1/auth/logout`

Uses the refresh token cookie or JSON body field and revokes the token version.

Success response:
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

## Protected Route Example

`GET /api/v1/auth/profile`

Headers:
```http
Authorization: Bearer <access_token>
```