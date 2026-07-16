# PLM System

A full-stack Product Lifecycle Management (PLM) system with Engineering Change Order (ECO) workflows.

## Project Structure

- `client/`: React + Vite frontend
- `server/`: Node.js + Express backend

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL

## Setup

### 1. Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 2. Configure environment

Create a `.env` file inside `server/` with your database and auth settings.

Example values:

```env
PORT=5000
DATABASE_URL=postgres://username:password@localhost:5432/plm_db
JWT_SECRET=your_jwt_secret
```

### 3. Initialize database

From `server/`:

```bash
npm run migrate
npm run seed
```

## Run the app

### Backend

From `server/`:

```bash
npm run dev
```

### Frontend

From `client/`:

```bash
npm run dev
```

The frontend starts with Vite and connects to the backend API.

## Build frontend

From `client/`:

```bash
npm run build
npm run preview
```

## Scripts

### client

- `npm run dev`: Start Vite dev server
- `npm run build`: Build production assets
- `npm run preview`: Preview production build

### server

- `npm run dev`: Start backend with file watch
- `npm start`: Start backend normally
- `npm run migrate`: Run SQL migrations
- `npm run seed`: Seed initial data
