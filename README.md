# Restora

Restora is a restaurant management platform for bringing restaurant teams,
operations, and guest experiences together. The repository contains a React
frontend and an Express/MongoDB API.

## What is included

- Public Restora landing page
- Registration and login flows
- Cookie-based JWT authentication
- Protected dashboard route
- Menu and availability management
- Tables and reservations
- Orders and payments
- Inventory tracking
- Operational reports
- Health check endpoint

## Technology

| Area | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Authentication | JWT in HTTP-only cookies |
| Validation | Zod |

## Project structure

```text
restora/
├── backend/     # Express REST API
├── frontend/    # React/Vite web application
└── README.md
```

## Requirements

- Node.js 18 or newer
- npm
- MongoDB database, local or hosted

## Quick start

Clone the repository and install dependencies in both applications:

```bash
git clone https://github.com/abmdevx/restora.git
cd restora

cd backend
npm install

cd ../frontend
npm install
```

Create the backend environment file described in
[backend/README.md](./backend/README.md), then start each application in a
separate terminal:

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

The frontend runs at `http://localhost:5173` and the API runs at
`http://localhost:8000` by default. The frontend expects the API under
`http://localhost:8000/api/v1` unless `VITE_API_URL` is configured.

## Environment variables

### Backend

Required backend variables:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/restora
FRONT_END_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=replace-with-a-long-random-secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=replace-with-a-different-long-random-secret
REFRESH_TOKEN_EXPIRY=7d
NODE_ENV=development
```

Never commit real credentials or secrets. See [backend/.env.example](./backend/.env.example) and
[backend/README.md](./backend/README.md) for the complete API setup.

### Frontend

```env
VITE_API_URL=http://localhost:8000/api/v1
```

If omitted, the frontend uses that URL as its development default.

Ready-to-copy templates are available at
[backend/.env.example](./backend/.env.example) and
[frontend/.env.example](./frontend/.env.example).

## API overview

The API is versioned under `/api/v1`:

| Prefix | Purpose |
| --- | --- |
| `/health` | Service health |
| `/users` | Registration, login, logout, and user management |
| `/menu` | Menu items |
| `/tables` | Table availability and management |
| `/reservations` | Reservations |
| `/orders` | Orders and payments |
| `/inventory` | Stock and inventory |
| `/reports` | Operational reports |

Authentication is handled with HTTP-only cookies. Protected endpoints require
the access-token cookie; administrative endpoints additionally require an
administrator role.

## Quality checks

Run frontend checks from `frontend/`:

```bash
npm run lint
npm run build
```

Run the backend development server from `backend/`:

```bash
npm run dev
```

## Contributing

1. Create a focused feature branch.
2. Keep frontend and backend changes scoped to the feature.
3. Run the relevant lint, build, and API checks.
4. Open a pull request with setup and testing notes.

## License

This project is currently intended for educational and personal development
use. Add a formal license before distributing it as an open-source package.
