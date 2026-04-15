# Backend — Lost and Found API (TypeScript)

Express + TypeScript backend for the Lost and Found Management System.

## Architecture

Clean layered architecture:

```
routes  →  controllers  →  services  →  repositories  →  database (MongoDB)
                                     ↘
                                       patterns (Factory, Strategy, Observer)
```

- **Singleton** — `config/database.ts` (one Mongoose connection per process)
- **Repository** — `repositories/BaseRepository.ts` + concrete repos per collection
- **Service Layer** — business rules live in `services/*` (no HTTP concerns)
- **MVC** — `controllers/*` parse requests and delegate to services
- **Factory Method** — `patterns/ItemFactory.ts` builds `LostItem` / `FoundItem`
- **Strategy** — `patterns/SearchStrategy.ts` composes filter clauses
- **Observer (pub/sub)** — `patterns/EventBus.ts` decouples notifications

## Setup

```bash
cd backend
cp .env.example .env
npm install
npm run seed        # seeds categories + admin user (starts Mongo connection)
npm run dev         # development, hot reload
# or
npm run build && npm start
```

Default admin: `admin@lostfound.local` / `admin123`

## API

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me                    (auth)

GET    /api/items/search?keyword=&type=&status=&categoryId=&location=&dateFrom=&dateTo=
GET    /api/items/categories
GET    /api/items/:id
GET    /api/items/mine                 (auth)
POST   /api/items/lost                 (auth)
POST   /api/items/found                (auth)
PUT    /api/items/:id                  (auth, owner)
DELETE /api/items/:id                  (auth, owner or admin)
POST   /api/items/:id/reward           (auth, owner)
POST   /api/items/:id/reward/complete  (auth, owner)

POST   /api/claims                     (auth)  { itemId, message }
PUT    /api/claims/:id/accept          (auth, owner)
PUT    /api/claims/:id/reject          (auth, owner)
GET    /api/claims/item/:itemId        (auth, owner)
GET    /api/claims/my-claims           (auth)
GET    /api/claims/my-inbox            (auth)
GET    /api/claims/notifications       (auth)

GET    /api/admin/stats                (admin)
GET    /api/admin/users                (admin)
GET    /api/admin/items                (admin)
GET    /api/admin/claims               (admin)
DELETE /api/admin/items/:id            (admin)
PUT    /api/admin/users/:id/suspend    (admin)
PUT    /api/admin/users/:id/reinstate  (admin)
PUT    /api/admin/claims/:id/resolve   (admin)  { resolution: 'accepted'|'rejected' }
```
