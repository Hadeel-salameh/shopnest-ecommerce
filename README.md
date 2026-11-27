# 🛍️ ShopNest — Full-Stack E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-brightgreen)](https://orm.drizzle.team)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952b3?logo=bootstrap)](https://getbootstrap.com)

A production-ready, full-stack e-commerce platform built with **Next.js App Router**, **PostgreSQL** via **Drizzle ORM**, **JWT authentication**, and a **Bootstrap 5** responsive frontend. Designed as a CV-ready portfolio project demonstrating clean architecture, security best practices, and professional code quality.

---

## ✨ Features

### Customer Features
- 🔐 **User Registration & Login** with secure JWT authentication
- 🛍️ **Product Catalog** with search, category filtering, and real-time stock display
- 🛒 **Shopping Cart** with quantity management (client-side state)
- 📦 **Order Placement** with atomic stock deduction
- 📋 **Order History** with expandable order item details
- 🎨 **Responsive UI** that works on all devices

### Admin Features
- 📊 **Admin Dashboard** with key business metrics
- ✏️ **Full Product CRUD** — create, read, update, delete products
- 🏷️ **Full Category CRUD** — with cascade protection
- 🔢 **Real-time Stock Monitoring** — low stock and out-of-stock alerts
- 🔒 **Role-based Access Control** — admin routes protected at API level

### Technical Features
- ✅ **RESTful API** with consistent JSON responses
- ✅ **JWT Authentication** with Bearer token scheme
- ✅ **bcrypt Password Hashing** (12 salt rounds)
- ✅ **Zod Input Validation** on all API endpoints
- ✅ **Database Transactions** for atomic order processing
- ✅ **Stock Snapshot** — order items store price at time of purchase
- ✅ **Proper HTTP Status Codes** throughout
- ✅ **CORS-safe** API routes

---

## 🛠️ Tech Stack

| Layer        | Technology                        |
|:-------------|:----------------------------------|
| Framework    | Next.js 16 (App Router)           |
| Language     | TypeScript 5.9                    |
| Database     | PostgreSQL 16                     |
| ORM          | Drizzle ORM 0.45                  |
| Auth         | Jose (JWT) + bcryptjs             |
| Validation   | Zod 4                             |
| Frontend     | Bootstrap 5.3 + Vanilla JS        |
| Icons        | Bootstrap Icons 1.11              |
| DB Driver    | node-postgres (pg)                |
| Environment  | dotenv via Next.js                |

---

## 📁 Project Structure

```
shopnest/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (Bootstrap CDN)
│   │   ├── globals.css               # Global styles
│   │   ├── page.tsx                  # Home page (product catalog)
│   │   ├── not-found.tsx             # 404 page
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   ├── register/
│   │   │   └── page.tsx              # Registration page
│   │   ├── orders/
│   │   │   └── page.tsx              # Order history page
│   │   ├── admin/
│   │   │   └── page.tsx              # Admin dashboard
│   │   └── api/                      # REST API routes
│   │       ├── health/route.ts       # Health check
│   │       ├── auth/
│   │       │   ├── register/route.ts
│   │       │   └── login/route.ts
│   │       ├── products/
│   │       │   ├── route.ts          # GET all, POST (admin)
│   │       │   └── [id]/route.ts     # GET one, PUT, DELETE
│   │       ├── categories/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── orders/
│   │       │   ├── route.ts          # POST create, GET mine
│   │       │   └── [id]/route.ts     # GET one
│   │       └── admin/
│   │           └── seed/route.ts     # Create first admin
│   ├── components/                   # Reusable React components
│   │   ├── Navbar.tsx
│   │   ├── ProductCard.tsx
│   │   ├── CartModal.tsx
│   │   └── Toast.tsx
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts                # Auth state management
│   │   └── useCart.ts                # Cart state management
│   ├── lib/                          # Shared utilities
│   │   ├── apiClient.ts              # Centralized fetch wrapper
│   │   ├── auth.ts                   # Server-side auth helpers
│   │   ├── jwt.ts                    # JWT sign/verify
│   │   ├── password.ts               # bcrypt helpers
│   │   └── validators.ts             # Zod schemas
│   └── db/
│       ├── index.ts                  # Drizzle client
│       └── schema.ts                 # Database schema & relations
├── .env                              # Local environment variables
├── .env.example                      # Template for contributors
├── .gitignore
├── drizzle.config.json               # Drizzle Kit configuration
├── next.config.ts
├── tsconfig.json
└── README.md
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
users ──────────── orders ──────────── order_items
  │                                         │
  │                                         │
  └──────── (role: admin|customer)          │
                                       products ──── categories
```

### Tables

#### `users`
| Column        | Type         | Constraints                    |
|:--------------|:-------------|:-------------------------------|
| id            | serial       | PRIMARY KEY                    |
| username      | varchar(100) | NOT NULL, UNIQUE               |
| email         | varchar(255) | NOT NULL, UNIQUE               |
| password_hash | varchar(255) | NOT NULL                       |
| role          | enum         | 'admin' \| 'customer', default 'customer' |
| created_at    | timestamp    | DEFAULT NOW()                  |

#### `categories`
| Column      | Type         | Constraints        |
|:------------|:-------------|:-------------------|
| id          | serial       | PRIMARY KEY        |
| name        | varchar(100) | NOT NULL, UNIQUE   |
| description | text         |                    |
| created_at  | timestamp    | DEFAULT NOW()      |

#### `products`
| Column      | Type           | Constraints              |
|:------------|:---------------|:-------------------------|
| id          | serial         | PRIMARY KEY              |
| name        | varchar(255)   | NOT NULL                 |
| description | text           |                          |
| price       | numeric(10,2)  | NOT NULL                 |
| stock       | integer        | NOT NULL, DEFAULT 0      |
| category_id | integer        | FK → categories.id       |
| created_at  | timestamp      | DEFAULT NOW()            |
| updated_at  | timestamp      | DEFAULT NOW()            |

#### `orders`
| Column      | Type          | Constraints                      |
|:------------|:--------------|:---------------------------------|
| id          | serial        | PRIMARY KEY                      |
| user_id     | integer       | NOT NULL, FK → users.id          |
| total_price | numeric(10,2) | NOT NULL                         |
| status      | enum          | pending/confirmed/shipped/... |
| created_at  | timestamp     | DEFAULT NOW()                    |

#### `order_items`
| Column     | Type          | Constraints               |
|:-----------|:--------------|:--------------------------|
| id         | serial        | PRIMARY KEY               |
| order_id   | integer       | NOT NULL, FK → orders.id  |
| product_id | integer       | NOT NULL, FK → products.id |
| quantity   | integer       | NOT NULL                  |
| price      | numeric(10,2) | NOT NULL (snapshot)       |

---

## 🚀 Installation

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm 9+

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/shopnest.git
cd shopnest

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Push database schema
npx drizzle-kit push

# 5. Create the first admin user
curl -X POST http://localhost:3000/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "securepassword",
    "seed_secret": "YOUR_SEED_SECRET"
  }'

# 6. (Optional) Run development server
npm run dev

# 7. Or build for production
npm run build && npm start
```

---

## 🐘 PostgreSQL Setup

### macOS (Homebrew)
```bash
brew install postgresql@16
brew services start postgresql@16
createdb shopnest_db
```

### Ubuntu / Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb shopnest_db
sudo -u postgres psql -c "CREATE USER shopnest WITH PASSWORD 'yourpassword';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE shopnest_db TO shopnest;"
```

### Windows
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/), then use pgAdmin or psql to create the database.

### Connection String Format
```
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

---

## 🔑 Environment Variables

| Variable       | Description                          | Required |
|:---------------|:-------------------------------------|:---------|
| `DATABASE_URL` | PostgreSQL connection string          | ✅ Yes   |
| `JWT_SECRET`   | Secret key for JWT signing            | ✅ Yes   |
| `SEED_SECRET`  | Protects the admin seed endpoint      | Optional |

---

## 📡 API Reference

### Base URL
```
http://localhost:3000/api
```

### Authentication
Protected endpoints require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

### Endpoints

| Method | Endpoint                   | Auth     | Description              |
|:-------|:---------------------------|:---------|:-------------------------|
| GET    | `/api/health`              | None     | Health check             |
| POST   | `/api/auth/register`       | None     | Register new user        |
| POST   | `/api/auth/login`          | None     | Login & get JWT token    |
| GET    | `/api/products`            | None     | List all products        |
| GET    | `/api/products/:id`        | None     | Get single product       |
| POST   | `/api/products`            | Admin    | Create product           |
| PUT    | `/api/products/:id`        | Admin    | Update product           |
| DELETE | `/api/products/:id`        | Admin    | Delete product           |
| GET    | `/api/categories`          | None     | List all categories      |
| GET    | `/api/categories/:id`      | None     | Get single category      |
| POST   | `/api/categories`          | Admin    | Create category          |
| PUT    | `/api/categories/:id`      | Admin    | Update category          |
| DELETE | `/api/categories/:id`      | Admin    | Delete category          |
| POST   | `/api/orders`              | User     | Create order             |
| GET    | `/api/orders`              | User     | Get own orders           |
| GET    | `/api/orders/:id`          | User     | Get specific order       |
| POST   | `/api/admin/seed`          | Secret   | Create first admin user  |

---

## 📖 API Examples

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGci...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 5, "quantity": 1 }
  ]
}
```

---

## 🔒 Security

- **Passwords** are hashed with bcrypt (12 salt rounds) — never stored in plaintext
- **JWT tokens** expire after 7 days and are verified on every protected request
- **Role-based authorization** enforced at the API route level
- **Input validation** via Zod on all API endpoints before DB access
- **Environment variables** for all secrets — never hardcoded
- **SQL injection protection** through Drizzle ORM parameterized queries
- **Atomic transactions** for order creation — prevents partial stock deduction

---

## 🧪 Testing the API (Postman / curl)

### 1. Register a Customer
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
# Save the access_token from the response
```

### 3. Get Products (public)
```bash
curl http://localhost:3000/api/products
```

### 4. Create a Product (admin only)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"name":"New Product","price":29.99,"stock":100,"categoryId":1}'
```

### 5. Place an Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{"items":[{"product_id":1,"quantity":1}]}'
```

### 6. Test Insufficient Stock
```bash
# Request more than available stock
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{"items":[{"product_id":1,"quantity":9999}]}'
# Returns 400: Insufficient stock
```

---

## 🎯 Order Processing Flow

```
1.  Client sends POST /api/orders with items array
2.  JWT token verified — user identity extracted
3.  Input validated via Zod schema
4.  All product IDs fetched in a single DB query
5.  Existence check for each product
6.  Stock availability check for each product
7.  Total price calculated server-side
8.  Database transaction begins:
    a. Order record inserted
    b. OrderItem records inserted (with price snapshot)
    c. Product stock decremented
    d. Transaction committed
9.  Success response returned with order details
10. On any failure → transaction rolled back, stock unchanged
```

---

## 🚀 Future Improvements

- [ ] Email notifications for order confirmation
- [ ] Payment integration (Stripe / PayPal)
- [ ] Product image upload with cloud storage
- [ ] Pagination for product listings
- [ ] Advanced search with Elasticsearch
- [ ] Admin order management (update status)
- [ ] Customer review & rating system
- [ ] Discount codes and promotions
- [ ] Wishlist functionality
- [ ] OAuth login (Google, GitHub)
- [ ] Redis caching for frequently accessed data
- [ ] Rate limiting on authentication endpoints

---

## 👨‍💻 Author

**Software Engineering Graduate**

Built as a full-stack portfolio project demonstrating:
- RESTful API design
- JWT-based authentication
- Role-based access control
- Relational database modeling
- Atomic transaction handling
- Clean, maintainable TypeScript code

---

## 📄 License

MIT License — free to use, modify, and distribute.
