# Lost and Found Management System with Reward Feature

A full-stack **TypeScript** web application where users report lost items, post
found items, and submit claims to recover belongings — with an optional reward
system. Built for the SESD course project.

## Tech Stack

- **Backend:** Node.js + Express + TypeScript, MongoDB (Mongoose), JWT + Bcrypt
- **Frontend:** React + TypeScript + Vite + React Router
- **Architecture:** Clean layered MVC (routes → controllers → services → repositories)

## Repository Layout

```
.
├── idea.md                     Project scope and key features
├── useCaseDiagram.md           Mermaid use case diagram
├── sequenceDiagram.md          Mermaid sequence diagram (claim workflow)
├── classDiagram.md             Mermaid class diagram
├── ErDiagram.md                Mermaid ER diagram
├── backend/                    Express + TypeScript API
│   ├── src/
│   │   ├── config/             Singleton DB connection, Mongoose schemas, seed
│   │   ├── types/              Shared domain and Express type augments
│   │   ├── models/             OOP domain objects (User, Item/LostItem/FoundItem, Claim, Category)
│   │   ├── patterns/           Factory, Strategy, Observer implementations
│   │   ├── repositories/       BaseRepository + concrete repos per collection
│   │   ├── services/           Business logic (Auth, Item, Claim, Reward, Admin, Notification)
│   │   ├── controllers/        Thin HTTP adapters
│   │   ├── middleware/         auth + error handlers
│   │   ├── routes/             Express route tables
│   │   ├── app.ts              Express app factory
│   │   └── server.ts           Boot entry point
│   └── README.md
└── frontend/                   React + TypeScript + Vite SPA
    ├── src/
    │   ├── api/                fetch client + typed endpoint helpers
    │   ├── context/            AuthContext (JWT in localStorage)
    │   ├── components/         Navbar, ProtectedRoute, ItemCard
    │   ├── pages/              Login, Register, Home, ReportItem, ItemDetail,
    │   │                        MyItems, MyClaims, Inbox, Admin
    │   ├── types/              DTO types matching the backend
    │   └── styles/             global CSS
    └── README.md
```

## Clean Architecture

Each layer has one responsibility; dependencies flow inward.

```
   HTTP Request
       │
       ▼
  ┌────────────┐   routes + middleware (authenticate, requireAdmin, errors)
  │   Routes   │
  └─────┬──────┘
        ▼
  ┌─────────────┐  parse request, delegate, format response
  │ Controllers │
  └─────┬───────┘
        ▼
  ┌───────────┐    business rules, invariants, orchestration
  │ Services  │    (publishes domain events on EventBus)
  └─────┬─────┘
        ▼
  ┌──────────────┐ Mongoose only — no business rules here
  │ Repositories │
  └─────┬────────┘
        ▼
  ┌──────────┐
  │ Database │   MongoDB (via Mongoose ODM)
  └──────────┘
```

## OOP Principles in Use

| Principle     | Where it shows up                                                           |
|---------------|-----------------------------------------------------------------------------|
| Encapsulation | `User.toPublic()` strips the password hash before serialisation              |
| Inheritance   | `Item → LostItem / FoundItem`; `BaseRepository<TRow, TModel>` is abstract    |
| Polymorphism  | `FoundItem.hasReward()` overrides `Item.hasReward()`; `SearchStrategy.apply`|
| Abstraction   | Repositories hide SQL; services hide bcrypt/jwt from controllers             |

## Design Patterns

| Pattern         | File                                | Purpose                                            |
|-----------------|-------------------------------------|----------------------------------------------------|
| Singleton       | `backend/src/config/database.ts`    | Single Mongoose connection per process             |
| Factory Method  | `backend/src/patterns/ItemFactory.ts` | Centralised construction of LostItem/FoundItem   |
| Strategy        | `backend/src/patterns/SearchStrategy.ts` | Composable Mongo filter fragments for search  |
| Observer (pub/sub) | `backend/src/patterns/EventBus.ts` | Notifications decoupled from claim/reward flows  |
| Repository      | `backend/src/repositories/*`        | Data-access isolation from services                |
| Service Layer   | `backend/src/services/*`            | Business rules above repositories                  |
| MVC             | controllers + routes + views (React)| Separation of presentation / logic / data          |
| Middleware      | `backend/src/middleware/*`          | Cross-cutting concerns (auth, errors)              |

## Running Locally

```bash
# 0) Start MongoDB locally (or set MONGODB_URI to an Atlas URI)
#    macOS:  brew services start mongodb-community
#    docker: docker run -d -p 27017:27017 --name mongo mongo:7

# 1) Backend
cd backend
cp .env.example .env
npm install
npm run seed          # seeds categories + default admin
npm run dev           # http://localhost:5000

# 2) Frontend (new terminal)
cd frontend
npm install
npm run dev           # http://localhost:5173 (proxies /api → :5000)
```

Default admin: `admin@lostfound.local` / `admin123`

## Feature Checklist

- [x] User registration and login (JWT + bcrypt)
- [x] Report lost items with description, location, date, optional reward
- [x] Post found items
- [x] Submit claims with a justification message
- [x] Owner reviews claims and accepts/rejects
- [x] Reward lifecycle: not_declared → pending → completed (auto on accept)
- [x] Search / filter by keyword, type, status, category, location, date range
- [x] Admin: view users/items/claims, delete items, suspend/reinstate users,
      force-resolve disputed claims, see dashboard stats
- [x] Status tracking: open → claimed → returned → closed
- [x] In-app notifications via Observer pattern

## Course

Software Engineering and System Design — Milestone 3 (final submission).

## Author

Swarnim Balpande
