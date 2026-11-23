# Pustak (पुस्तक) — Modern Full-Stack Bookstore

Pustak is an online bookstore application engineered with a reactive frontend and a secure RESTful backend featuring a **zero-trust validation pipeline**. The platform provides seamless book discovery, shopping cart management, instant checkout, real-time order tracking, and an inventory catalog management dashboard.

---

## 🌟 Key Features

- **Interactive Book Catalog:** Browse curated titles across Fiction, Technology, Biography, and History with live keyword search, category filtering, and sorting (by price, rating, or title).
- **Book Details & Synopsis:** Dedicated quick-view modal with author details, customer ratings, ISBN, published year, and availability.
- **Dynamic Shopping Cart:** State-driven cart drawer supporting item addition, increment/decrement controls, coupon discounts (`PUSTAK10`), dynamic delivery fee calculation, and order summaries.
- **Zero-Trust Validation Architecture:**
  - Client-side real-time validation for responsive UX feedback (validating Indian mobile numbers, postal PIN codes, email addresses, and character constraints).
  - Authoritative server-side price recalculation: client-submitted subtotals and prices are never trusted and are authoritatively verified against the database.
- **Order Tracking:** Lookup orders by reference number to view order progression (*Placed* &rarr; *Confirmed* &rarr; *Shipped* &rarr; *Delivered*), item breakdown, and shipping details.
- **Printable Invoices:** Clean order confirmation receipt with print/save support (`window.print()`).
- **Catalog Management (Inventory):** Administrative dashboard to create, update, and delete books in the database.
- **Reliable Database Layer:** Dual-mode MongoDB integration with automated catalog seeding and offline in-memory fallback.

---

## 🏗️ Architecture

```
pustak-bookstore/
├── config/
│   └── db.js              # Database connection and fallback management
├── data/
│   └── books.js           # Default book catalog seed data
├── models/
│   ├── Book.js            # Book schema and data service
│   └── Order.js           # Order schema and data service
├── public/
│   └── index.html         # Responsive Single Page Application
├── routes/
│   └── api.js             # RESTful API router (Books, Checkout, Orders)
├── validators/
│   ├── book.js            # Book creation/update validation rules
│   └── checkout.js        # Checkout validation and authoritative pricing
├── package.json           # Dependencies and scripts
├── server.js              # Application server entry point
├── test.js                # Integration test suite
└── run_full_test.js       # Test runner script
```

---

## 🚀 RESTful API Reference

### 📚 Books
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/books` | Retrieve catalog (supports `?search=`, `?category=`, `?sort=`) |
| `GET` | `/api/books/:id` | Retrieve single book details |
| `POST` | `/api/books` | Create new book in catalog |
| `PUT` | `/api/books/:id` | Update book details and inventory |
| `DELETE` | `/api/books/:id` | Delete book from catalog |

### 🛒 Checkout & Orders
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/checkout` | Process order with server-side validation and price calculation |
| `GET` | `/api/orders` | Retrieve list of recent orders |
| `GET` | `/api/orders/:id` | Look up order by ID with delivery status |
| `PUT` | `/api/orders/:id/status`| Update order fulfillment status |

### ⚙️ System
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/meta/status` | Server uptime and database connectivity state |

---

## 💻 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Runs the server with auto-reload at **http://localhost:3000**.

### 3. Start Production Server
```bash
npm start
```

### 4. Run Integration Tests
```bash
npm test
```
Or to run with an automatic background server:
```bash
npm run test:all
```
Verifies catalog querying, validation edge cases, price tampering defense, book CRUD operations, and error handling.
