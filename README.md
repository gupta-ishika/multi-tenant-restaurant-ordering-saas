# Multi-Tenant Restaurant Ordering SaaS

A multi-tenant SaaS platform for restaurants, providing restaurant-specific management of menus, tables, and QR codes, with customer ordering functionality under development.

Each restaurant operates as an independent tenant, with its own categories, menu items, and tables isolated from other restaurants on the platform. Customers can scan a table-specific QR code to view the restaurant's digital menu.

---

## Features

### Multi-Tenant Restaurant Management
- Restaurant-specific data ownership
- Tenant-isolated resources
- Restaurant profile management

### Authentication & Authorization
- Restaurant registration and login
- Password hashing
- JWT authentication
- Protected API routes
- Authenticated restaurant context

### Menu Management
- Create and manage food categories
- Create, update, and delete food items
- Restaurant ownership validation
- Soft deletion of resources

### Table & QR Management
- Create and manage restaurant tables
- Automatic QR code generation on table creation
- Environment-configurable QR target URLs
- QR code image regeneration with tenant isolation
- Public QR-based table and restaurant menu routing

### Customer Ordering & Live Tracking
- Table QR code scanning and direct digital menu access
- Multi-tenant menu isolation (view only scanned restaurant's menu)
- Real-time client-side shopping cart with table persistence
- Unauthenticated customer order placement
- Real-time order tracking page with live status updates

### Restaurant Order Management & Kitchen Feed
- Live restaurant orders feed with status filtering
- Itemized order breakdown and total computation
- Single order inspection and status lifecycle updates (`PENDING` → `CONFIRMED` → `PREPARING` → `READY` → `COMPLETED` / `CANCELLED`)
- Auto-refreshing order updates


---

## Architecture

```text
                    ┌──────────────────────┐
                    │      React Client    │
                    │   React + Tailwind   │
                    └──────────┬───────────┘
                               │
                            REST API
                               │
                    ┌──────────▼───────────┐
                    │       FastAPI        │
                    │ Authentication       │
                    │ Tenant Isolation     │
                    │ Business Logic       │
                    └──────────┬───────────┘
                               │
                         SQLAlchemy
                               │
                    ┌──────────▼───────────┐
                    │     PostgreSQL       │
                    │     Tenant Data      │
                    └──────────────────────┘

                  Docker / Docker Compose
```

### Tenant Isolation

The application is designed as a multi-tenant SaaS platform where each restaurant represents an independent tenant, with ownership over its own categories, food items, tables, and QR codes.

Every authenticated request carries the restaurant's identity in its JWT.
Protected API endpoints use that identity to scope database queries by
`restaurant_id`, ensuring that a restaurant can only access its own resources.

The same application infrastructure serves multiple restaurants while
maintaining logical isolation between their data.

```text
Restaurant A                    Restaurant B
 ├── Categories                  ├── Categories
 ├── Food Items                  ├── Food Items
 ├── Tables                      ├── Tables
```

---

## Database Design

The application uses PostgreSQL with SQLAlchemy and Alembic.

Core entities include:

```text
Restaurant
   │
   ├── Categories
   │      └── Food Items
   │
   ├── Tables
   │      └── QR Code
   │
   └── Orders
          └── Order Items
```

Restaurant-owned resources are associated with a `restaurant_id` to support
tenant-level data isolation.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy |
| Database | PostgreSQL |
| Migrations | Alembic |
| Authentication | JWT, bcrypt |
| QR Generation | Python QRCode |
| Infrastructure | Docker, Docker Compose |
| API Documentation | Swagger / OpenAPI |
| Version Control | Git, GitHub |

---

## Key Engineering Concepts

- Multi-tenant SaaS architecture
- Tenant-level data isolation
- REST API design
- JWT authentication
- Resource-level authorization
- Ownership-scoped database queries
- SQLAlchemy relationships
- Database migrations with Alembic
- Soft-delete patterns
- QR-based resource access
- Containerized PostgreSQL development

---

## Project Structure

```text
multi-tenant-restaurant-ordering-saas/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── database/
│   │   ├── enums/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── alembic/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/gupta-ishika/multi-tenant-restaurant-ordering-saas.git
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

### 3. Start the backend

```bash
cd backend

# Activate virtual environment
venv\Scripts\activate      # Windows
# source venv/bin/activate # macOS/Linux

uvicorn app.main:app --reload
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

### Application URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://127.0.0.1:8000 |
| Swagger / OpenAPI | http://127.0.0.1:8000/docs |

---

## Current Status

### Completed

- [x] Project setup & configuration
- [x] Database design & schema modeling
- [x] Database migrations with Alembic
- [x] Multi-tenant restaurant authentication & authorization (JWT, bcrypt)
- [x] Restaurant menu categories and food items management APIs
- [x] Multi-tenant resource isolation & security audits
- [x] Table management APIs with status toggles
- [x] Dynamic QR code generation, regeneration, & static serving
- [x] Public table QR routing & customer menu viewing
- [x] Customer shopping cart & table session management
- [x] Customer checkout & unauthenticated order placement
- [x] Live customer order tracking & status monitoring
- [x] Restaurant live orders feed, item details & status transitions

### In Progress

- [ ] Table management frontend UI & QR download/print view
- [ ] Analytics & sales metrics dashboard
- [ ] Role-based access control for restaurant staff
- [ ] Production deployment


---

## Author

**Ishika Gupta**

Computer Science student focused on software engineering,
backend development, full-stack systems, and AI/RAG applications.~