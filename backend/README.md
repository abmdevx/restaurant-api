# Restora backend

The Restora backend is a versioned REST API for restaurant operations. It
provides authentication, authorization, validation, and CRUD workflows for
menus, tables, reservations, orders, inventory, and reports.

## Stack

- Node.js with native ES modules
- Express
- MongoDB with Mongoose
- JSON Web Tokens
- HTTP-only authentication cookies
- Zod request validation
- Swagger UI support

## Setup

From this directory:

```bash
npm install
```

Copy `.env.example` to `.env` and replace the placeholder secrets:

```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/restora
FRONT_END_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=replace-with-a-long-random-secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=replace-with-a-different-long-random-secret
REFRESH_TOKEN_EXPIRY=7d
NODE_ENV=development
```

`MONGO_URI` is also accepted as a legacy alias for `MONGODB_URI`. Use
different, long, randomly generated values for the access and refresh token
secrets. Do not commit `.env` files or real credentials.

Start the API:

```bash
npm run dev
```

The server listens on `http://localhost:3000` by default.

## API base URL and modules

All routes are versioned under `http://localhost:3000/api/v1`:

| Prefix | Description |
| --- | --- |
| `/health` | Health status |
| `/users` | Registration, login, sessions, and users |
| `/menu` | Menu item management |
| `/tables` | Tables and availability |
| `/reservations` | Reservation management |
| `/orders` | Orders and payment processing |
| `/inventory` | Stock management |
| `/reports` | Sales and operational reports |

Example public requests:

```text
GET  /api/v1/health
POST /api/v1/users/register
POST /api/v1/users/login
POST /api/v1/users/refresh-token
```

The remaining resources require authentication. Admin-only mutations also
require the authenticated user to have the `admin` role.

## Authentication

Successful login sets access and refresh tokens as HTTP-only cookies. Clients
must send requests with credentials enabled. The API also supports the
standard `Authorization: Bearer <token>` header for access-token requests.

Available user session operations include:

- Register
- Login
- Refresh access token
- Get the current user
- Change password
- Logout

## Validation and errors

Request bodies are validated with Zod before reaching controllers. Responses
use a consistent success/error shape, and centralized middleware handles
validation, authentication, invalid identifiers, and unexpected errors.

## Scripts

```bash
npm run dev   # Start with Nodemon
npm start     # Start the production server
```

## Structure

```text
src/
├── config/        # Database and API configuration
├── controllers/   # Request handlers
├── middleware/    # Authentication, authorization, validation
├── models/        # Mongoose models
├── routes/        # Versioned resource routes
├── utils/         # API errors, responses, async helpers
├── validations/   # Zod schemas
├── app.js         # Express app and middleware
└── server.js      # Database connection and HTTP server
```
