# Multi-Tenant Restaurant Ordering SaaS

A multi-tenant SaaS platform for restaurants that provides restaurant-specific
management of menus, tables, QR codes, and customer orders.

Each restaurant operates as an independent tenant, with its own categories,
menu items, tables, and orders isolated from other restaurants on the platform.
Customers can scan a table-specific QR code to access the restaurant's digital
menu and place orders.

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
- Automatic QR code generation
- Table-specific customer menu URLs
- Public QR-based table lookup

### Customer Ordering

Planned:

- Digital restaurant menu
- Shopping cart
- Order placement
- Order tracking

> Customer ordering, kitchen management, and analytics are currently under development.

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

The application is designed as a multi-tenant SaaS platform where each
restaurant represents an independent tenant, with ownership over its own
categories, food items, tables, QR codes, and orders.

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
 └── Orders                      └── Orders
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

- [x] Project setup
- [x] Database design
- [x] Database migrations with Alembic
- [x] Restaurant authentication
- [x] Restaurant management APIs
- [x] Multi-tenant resource isolation
- [x] Table & QR code management

### In Progress

- [ ] Customer menu
- [ ] Shopping cart
- [ ] Order management
- [ ] Kitchen dashboard
- [ ] Real-time order tracking
- [ ] Role-based access control for restaurant staff
- [ ] Analytics
- [ ] Deployment

---

## Author

**Ishika Gupta**

Computer Science student focused on software engineering,
backend development, full-stack systems, and AI/RAG applications.