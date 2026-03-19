# Live Chat Application

A full-stack real-time chat platform built with React, Vite, Node.js, Express, MongoDB, and Stream. The project supports user authentication, profile onboarding, friend discovery, direct messaging, video calling, blocking/reporting, and an admin panel for user moderation.

## Overview

This project is split into two applications:

- `frontend/` contains the React client built with Vite, Tailwind CSS, DaisyUI, React Query, and Zustand.
- `backend/` contains the Express API, MongoDB models, authentication logic, Stream integration, and admin endpoints.

The app is designed around language-learning style social matching, where users complete a profile, connect with other users, and start one-to-one conversations.

## Features

- User signup, login, logout, and password reset
- JWT-based authentication using secure HTTP-only cookies
- Profile onboarding with avatar, bio, languages, and location
- Friend discovery with username search
- Send, accept, and reject friend requests
- Real-time one-to-one chat with Stream Chat
- Video call links and in-app calling with Stream Video
- Block and unblock users
- Report users for moderation
- Admin dashboard to:
  - view all users
  - activate or deactivate non-admin accounts
  - review submitted reports
- Automatic admin account seeding from environment variables

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS 4
- DaisyUI
- TanStack React Query
- React Router
- Zustand
- Axios
- Stream Chat React SDK
- Stream Video React SDK

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- JWT
- bcryptjs
- cookie-parser
- cors
- dotenv
- Stream Chat SDK

## Project Structure

```text
10. Live chat/
|-- backend/
|   |-- src/
|   |   |-- controllers/
|   |   |-- lib/
|   |   |-- models/
|   |   |-- routes/
|   |   `-- server.js
|   `-- package.json
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- admin/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- lib/
|   |   `-- pages/
|   `-- package.json
`-- README.md
```

## Environment Variables

Create a `.env` file inside `backend/` with the following values:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
ADMIN_FULL_NAME=Admin
ADMIN_USERNAME=admin
```

Create a `.env` file inside `frontend/` with:

```env
VITE_STREAM_API_KEY=your_stream_api_key
```

## Installation

Install dependencies for both apps:

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

## Running The Project

Start the backend first:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Admin Access

When the backend connects to MongoDB, it automatically seeds or syncs an admin account using:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_FULL_NAME`
- `ADMIN_USERNAME`

After signing in with that account, the app redirects the admin user to:

`/admin/manage-users`

From there, the admin can manage user activation status and review submitted reports.

## Available Scripts

### Backend

- `npm run dev` starts the backend with file watching

### Frontend

- `npm run dev` starts the Vite development server
- `npm run build` creates a production build
- `npm run preview` previews the production build locally
- `npm run lint` runs ESLint

## API Summary

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/onboarding`
- `GET /api/auth/me`

### User

- `GET /api/user`
- `GET /api/user/friends`
- `GET /api/user/blocked-users`
- `GET /api/user/friend-requests`
- `GET /api/user/outgoing-friend-requests`
- `POST /api/user/friend-request/:id`
- `PUT /api/user/accept-friend-request/:id`
- `PUT /api/user/reject-friend-request/:id`
- `POST /api/user/block/:id`
- `POST /api/user/unblock/:id`
- `POST /api/user/report/:id`

### Chat

- `GET /api/chat/token`

### Admin

- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/active`
- `GET /api/admin/reports`

## Notes

- The frontend is currently configured to call the backend at `http://localhost:3000/api`.
- The backend CORS configuration currently allows `http://localhost:5173`.
- Stream credentials are required for chat and video calling features.
- There are currently no automated tests configured in this repository.

## Future Improvements

- Add automated tests for frontend and backend flows
- Add deployment instructions for production
- Add pagination and filters in the admin dashboard
- Add online presence and typing indicators
- Add report status updates and moderation actions

## License

This project is currently unlicensed unless you choose to add a license file.
