# Restora frontend

The Restora frontend is a responsive React application for restaurant teams
and guests. It provides the branded public experience, authentication screens,
and the protected application shell.

## Stack

- React 19
- Vite
- React Router
- ESLint
- Tailwind CSS v4 with responsive layouts and Restora brand tokens

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Restora landing page |
| `/login` | Public | Sign in |
| `/register` | Public | Create an account |
| `/dashboard` | Private | Authenticated user dashboard |

Private routes redirect unauthenticated users to `/login`. The current user
session is stored locally for the client shell, while authentication itself is
performed by the backend with HTTP-only cookies.

## Setup

From this directory:

```bash
npm install
npm run dev
```

The Vite development server runs at `http://localhost:5173`.

## Environment

Copy `.env.example` to `.env.local` and adjust it when needed:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

`VITE_API_URL` must include the API version prefix. The default value is
`http://localhost:8000/api/v1`.

## Backend integration

The authentication forms call:

- `POST /users/register`
- `POST /users/login`
- `POST /users/logout`

Requests include credentials so the backend can set and clear its HTTP-only
authentication cookies. Start the backend before testing account flows; setup
instructions are in [../backend/README.md](../backend/README.md).

## Scripts

```bash
npm run dev       # Start Vite with hot reload
npm run lint      # Run ESLint
npm run build     # Create a production build
npm run preview   # Preview the production build locally
```

## Frontend structure

```text
src/
├── api/          # API client and authentication requests
├── components/   # Reusable visual components
├── context/      # Auth and theme providers
├── hooks/        # Shared context hooks
├── layouts/      # Auth and authenticated page shells
├── pages/        # Route-level page components
├── routes/       # Route definitions and guards
├── App.jsx       # Provider and router composition only
├── index.css     # Tailwind theme and global styles
└── main.jsx      # React entry point
public/
└── restora.png   # Brand logo
```
