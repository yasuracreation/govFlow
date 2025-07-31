# GovFlow Backend API (Mock Data)

## Overview
This backend is designed with a layered, domain-driven architecture, using mock data for now, and ready for easy migration to Prisma/PostgreSQL. Each domain (user, template, etc.) has its own route, controller, service, VM, and mapper. All business logic is in services, and JWT-based auth is enforced via middleware.

## Structure
```
Backend/
  src/
    controllers/      # Route handlers, call services, return VMs
    services/         # Business logic, interact with mock data (later: Prisma)
    mappers/          # Map domain models <-> VMs
    middlewares/      # Auth, error handling, etc.
    routes/           # Express routers per domain
    vms/              # ViewModels (API response/request shapes)
    data/             # Mock data as JSON
    utils/            # JWT, helpers
    app.ts            # Express app setup
    server.ts         # Entry point
  package.json
  tsconfig.json
```

## How to Run
1. `cd Backend`
2. `npm install`
3. `npm run dev` (or `npm start` for production)

## API Example
- `GET /api/users` - List users (admin only)
- `GET /api/templates` - List document templates

## Auth
- Pass JWT in `Authorization: Bearer <token>` header
- Middleware checks role and token validity

## Migration to Prisma/Postgres
- Replace mock data access in services with Prisma queries
- Keep interfaces and VMs unchanged for smooth migration

## Conventions
- All business logic in services
- Controllers only handle HTTP/request/response
- VMs and mappers keep API responses consistent
- Each domain is isolated for maintainability 