# Product Lifecycle Management (PLM) & ECO System

A full-stack enterprise Product Lifecycle Management (PLM) solution featuring Engineering Change Order (ECO) workflows, multi-level Bill of Materials (BOM) management, dynamic impact analysis, real-time collaboration via WebSockets, interactive analytics, and audit logging.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Key Features & Functionality](#key-features--functionality)
  - [1. Product Management](#1-product-management)
  - [2. Bill of Materials (BOM) Management](#2-bill-of-materials-bom-management)
  - [3. Engineering Change Order (ECO) Workflows](#3-engineering-change-order-eco-workflows)
  - [4. Dynamic Impact Analysis & Dependency Warnings](#4-dynamic-impact-analysis--dependency-warnings)
  - [5. Real-Time Collaboration & Chat](#5-real-time-collaboration--chat)
  - [6. Reports, Dashboards & Visual Analytics](#6-reports-dashboards--visual-analytics)
  - [7. Stage & Workflow Customization](#7-stage--workflow-customization)
  - [8. Security & Role-Based Access Control (RBAC)](#8-security--role-based-access-control-rbac)
- [Tech Stack](#tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Database Schema & Migrations](#database-schema--migrations)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation & Local Setup](#installation--local-setup)
  - [Docker Setup](#docker-setup)
- [API Reference Map](#api-reference-map)
- [NPM Scripts Reference](#npm-scripts-reference)

---

## 🌟 Overview

The **PLM System** empowers engineering and manufacturing teams to manage product definitions, control component revisions, trace historical changes, and handle Engineering Change Orders (ECOs) seamlessly. It automates stage-based review pipelines, alerts users of upstream dependencies when modifying components, and tracks every state transition in a central audit trail.

---

## ⚡ Key Features & Functionality

### 1. Product Management
- **Product Lifecycle Tracking**: Manage product records across multiple lifecycle stages (*Draft*, *Active*, *Archived*).
- **Automated Versioning**: Track major and minor version iterations driven automatically by approved ECOs.
- **Product Revision History**: Detailed audit trail showing every version update, modified attributes, timestamp, and responsible user.

### 2. Bill of Materials (BOM) Management
- **Multi-Level Component Trees**: Structure complex product assemblies with nested sub-components, part numbers, unit costs, and quantities.
- **Active vs. Historical Versions**: Maintain active BOM releases alongside revision history to support manufacturing traceability.
- **Dynamic Cost & Quantity Computation**: Aggregated cost calculations across component line items.

### 3. Engineering Change Order (ECO) Workflows
- **Dual Change Modes**: Submit change requests for either direct **Product attribute modifications** or **BOM component changes** (add, edit, delete component lines).
- **Configurable Pipeline Stages**: Move ECOs through configurable workflow stages (e.g., *New* ➔ *In Review* ➔ *Approval* ➔ *Done*).
- **Interactive Side-by-Side Diff Viewer**: Compare pre-change (old) vs post-change (new) attributes and BOM lines before applying changes.
- **Approval & Rejection Handling**: Approvers can accept or reject ECOs with mandatory rejection reasons recorded for accountability.
- **Automated Version Bumping**: When an ECO is completed/applied, affected products and BOMs are automatically bumped to their next version.
- **Optimistic Concurrency Control**: Timestamp-based locking prevents users from overwriting concurrent ECO edits.

### 4. Dynamic Impact Analysis & Dependency Warnings
- **Upstream Dependency Scanner**: When modifying a component or product, the system scans all parent BOMs referencing that item.
- **Risk Mitigation**: Visual alert cards surface potential cascading impacts on parent assemblies before an ECO is committed.

### 5. Real-Time Collaboration & Chat
- **WebSocket-Powered Direct Messaging**: Instant chat built with Socket.IO for cross-department communication.
- **Online Presence & Typing Indicators**: Real-time user status indicators and live typing feedback.
- **Unread Counters & Badge Notifications**: Instant visual indicators for incoming unread messages.

### 6. Reports, Dashboards & Visual Analytics
- **Executive Dashboard**: Key metrics showing open ECOs, pending approvals, active products, and active BOMs.
- **Interactive Charts (Recharts)**:
  - ECO Status distribution (Pie chart).
  - 12-Month ECO creation trend (Bar chart).
  - Distribution by ECO Type (Product vs BOM).
  - Workflow stage throughput metrics.
- **Version Matrix**: Comprehensive table linking active products to their active BOM versions.
- **PDF & Image Exporting**: Export visual reports directly to PDF or image files via `jspdf` and `html2canvas`.

### 7. Stage & Workflow Customization
- **Admin Stage Configurator**: Dynamically add, reorder, update, or remove workflow stages.
- **Conditional Approvals**: Mark specific stages as requiring formal managerial approval before advancing.

### 8. Security & Role-Based Access Control (RBAC)
- **JWT Authentication**: Secure token-based user sessions with salted password hashing (`bcryptjs`).
- **Role-Based Guards**: Granular access controls for roles (`admin`, `approver`, `engineer`, `user`).

---

## 🛠️ Tech Stack

### Frontend
- **Framework & Build Tool**: React 18, Vite
- **Styling & UI**: TailwindCSS, Lucide React (Icons)
- **State Management**: Zustand
- **Charts & Visualization**: Recharts
- **Real-Time Client**: Socket.IO Client
- **Export Utilities**: jsPDF, html2canvas
- **HTTP & Toasts**: Axios, React Hot Toast

### Backend
- **Runtime & Framework**: Node.js, Express.js
- **Database Engine**: PostgreSQL (`pg` connection pool)
- **Real-Time Engine**: Socket.IO
- **Security & Validation**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, Express Rate Limit, Express Validator

---

## 📂 Project Directory Structure

```text
PLM/
├── client/                      # React + Vite Frontend Application
│   ├── src/
│   │   ├── api/                 # Axios API instances & endpoints
│   │   ├── components/          # Reusable UI & Feature components
│   │   │   ├── bom/             # BOM tree & detail panels
│   │   │   ├── eco/             # ECO modals, cards, diff viewer, audit timeline
│   │   │   ├── layout/          # Navbar, Sidebar, Page wrappers
│   │   │   └── ui/              # Modals, Tables, Toast, Chat Panel, Badges
│   │   ├── pages/               # Top-level Page views (Dashboard, ECO, BOM, Reports, Settings, etc.)
│   │   ├── store/               # Zustand state stores (auth, ECO, BOM)
│   │   ├── App.jsx              # Main App router & route guards
│   │   └── main.jsx             # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Node.js + Express Backend Service
│   ├── src/
│   │   ├── config/              # PostgreSQL database pool configuration
│   │   ├── controllers/         # Request handling & response formatting
│   │   ├── middleware/          # JWT Auth, Role Guard, Rate Limiting
│   │   ├── routes/              # Express API route modules
│   │   ├── services/            # Core business logic (ECOService, ApprovalService, VersionService, AuditService)
│   │   ├── utils/               # Pagination & helper utilities
│   │   ├── migrate.js           # SQL Database Migration Runner
│   │   ├── seed.js              # Database Seeder script
│   │   └── server.js            # Express & Socket.IO server initialization
│   ├── migrations/              # SQL Schema Migration files (001 to 011)
│   └── package.json
│
├── docker-compose.yml           # Containerized orchestration setup
└── README.md                    # System documentation
```

---

## 🗄️ Database Schema & Migrations

The database is built on PostgreSQL with relational schemas managed via linear SQL migration scripts located in `server/migrations/`:

| Migration | Table / Feature | Description |
|---|---|---|
| `001` | `users` | User accounts, roles, password hashes |
| `002` | `products` | Product master data, lifecycle status, versioning |
| `003` | `bom`, `bom_components` | BOM master releases and nested line items |
| `004` | `eco_stages` | Configurable pipeline stages and approval requirements |
| `005` | `ecos` | Core ECO requests, links to product/BOM, effective dates |
| `006` | `eco_changes` | Itemized field and component diff changes per ECO |
| `007` | `audit_logs` | Immutable audit log records for tracking changes |
| `008` | `chat_messages` | Real-time chat message history and unread status |
| `009` | `eco_predictions` | Risk impact analysis records |
| `010` | Indexes | Performance indexes on foreign keys & search queries |
| `011` | Rejection Field | `rejection_reason` added to `ecos` table |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **PostgreSQL**: `v14.0` or higher
- **npm**: `v9.0` or higher
- *(Optional)* **Docker & Docker Compose**

---

### Environment Variables

#### Server (`server/.env`)
Create a `.env` file in the `server/` folder:
```env
PORT=5000
DATABASE_URL=postgres://plm_user:plm_password@localhost:5432/plm_db
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
```

#### Client (`client/.env`)
Create a `.env` file in the `client/` folder:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

### Installation & Local Setup

#### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd PLM

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

#### 2. Initialize Database
Make sure PostgreSQL is running and your target database (`plm_db`) exists, then execute migrations and seeding from the `server/` directory:
```bash
cd ../server
npm run migrate
npm run seed
```

#### 3. Run Development Servers

**Start Backend (Port 5000):**
```bash
cd server
npm run dev
```

**Start Frontend (Port 5173):**
```bash
cd client
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

### Docker Setup

You can launch the full stack (PostgreSQL, Backend API, and Frontend) with Docker Compose:

```bash
docker-compose up --build
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **PostgreSQL**: `localhost:5432`

---

## 📡 API Reference Map

### Authentication
- `POST /api/auth/register` — Register a new user account
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Retrieve current authenticated user profile

### Product Management
- `GET /api/products` — List paginated products (filterable by status/search)
- `POST /api/products` — Create a new product record
- `GET /api/products/:id` — Get product details and active BOM
- `PUT /api/products/:id` — Update product details
- `GET /api/products/:id/history` — Get product revision timeline

### Bill of Materials (BOM)
- `GET /api/bom` — Fetch all BOM releases
- `POST /api/bom` — Create a new BOM release
- `GET /api/bom/:id` — Get BOM details with component breakdown
- `PUT /api/bom/:id` — Update BOM components

### Engineering Change Orders (ECO)
- `GET /api/eco` — List paginated ECOs (filterable by stage, type, status)
- `POST /api/eco` — Submit a new ECO with itemized changes
- `GET /api/eco/:id` — Get full ECO details with old vs new diff view
- `PUT /api/eco/:id` — Update draft ECO changes
- `POST /api/eco/:id/next-stage` — Advance ECO to next workflow stage
- `PATCH /api/eco/:id/stage` — Update ECO stage directly
- `GET /api/eco/:id/impacts` — Run dynamic impact analysis scanner
- `POST /api/eco/:id/approve` — Approve pending ECO
- `POST /api/eco/:id/reject` — Reject ECO with rejection reason

### Reports & Analytics
- `GET /api/reports/dashboard-stats` — Overview metrics summary
- `GET /api/reports/eco-history` — Complete ECO audit list
- `GET /api/reports/version-matrix` — Product and active BOM version mapping
- `GET /api/reports/analytics` — Chart metrics (monthly trend, stage stats, status distribution)

### Real-Time Chat
- `GET /api/chat/users` — Fetch eligible team chat contacts
- `GET /api/chat/messages/:userId` — Fetch conversation message history
- `GET /api/chat/conversations` — List active conversation threads
- `GET /api/chat/unread` — Unread messages count

### Workflow Settings (Admin)
- `GET /api/settings/stages` — List all workflow stages
- `POST /api/settings/stages` — Add a new workflow stage
- `PUT /api/settings/stages/:id` — Edit stage order / approval rules
- `DELETE /api/settings/stages/:id` — Delete a stage

---

## 📜 NPM Scripts Reference

### Server (`server/`)
| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `node --watch src/server.js` | Starts server with automatic file watching |
| `npm start` | `node src/server.js` | Starts server in standard node environment |
| `npm run migrate` | `node src/migrate.js` | Runs pending SQL migration files |
| `npm run seed` | `node src/seed.js` | Seeds initial sample users, stages, and products |

### Client (`client/`)
| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `vite` | Starts Vite local development server |
| `npm run build` | `vite build` | Builds optimized production bundle |
| `npm run preview` | `vite preview` | Previews production build locally |

---

## 📄 License

This project is licensed under the **MIT License**.
