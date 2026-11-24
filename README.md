# Pustak (पुस्तक) — Modern Full-Stack Bookstore

Pustak is an online bookstore application engineered with a **React 18 Single-Page Application (SPA)** frontend and a secure Node.js/Express RESTful backend featuring a **zero-trust validation pipeline**. The platform provides seamless book discovery, shopping cart management, instant checkout, real-time order tracking, and an inventory catalog management dashboard.

---

## 🌟 Key Features

- **React 18 Single-Page Application (SPA):** High-performance reactive interface powered by the React 18 Virtual DOM, providing seamless navigation without full-page reloads.
- **⚛️ Interactive React Reading Goal & Bundle Estimator (`ReadingGoalAdvisor.jsx`):** An interactive React widget utilizing `useState` and `useMemo` hooks to calculate reading speed, monthly reading hours, persona badge, dynamic book recommendations, and estimated bundle savings in real time with an expandable Live React State Inspector.
- **⚛️ Centralized Cart State (`useReducer`):** Atomic cart state handling (`ADD_ITEM`, `INCREMENT`, `DECREMENT`, `REMOVE`, `CLEAR`) ensuring instant synchronization between the animated header cart badge and the slide-out drawer.
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

## ⚛️ React 18 Architecture & Components

The client layer is organized into modular React components leveraging modern React patterns and Hooks:

| Component | File | Responsibilities & Hooks |
| :--- | :--- | :--- |
| `<PustakApp>` | `public/index.html` | Root state container; manages active navigation tabs, book catalog state, and modal triggers. |
| `<ReadingGoalAdvisor>` | `public/components/ReadingGoalAdvisor.jsx` | Interactive reading goal planner with live state calculations (`useState`, `useMemo`). |
| `<CartDrawer>` | `public/components/CartDrawer.jsx` | Slide-out shopping cart drawer responding to atomic `cartReducer` dispatch actions. |
| `<BookCard>` | `public/components/BookCard.jsx` | Reusable presentation card rendering book cover styling, rating, and stock triggers. |

### React Hooks Utilized
- **`useReducer`**: Centralized state management for shopping cart operations, ensuring atomic predictability.
- **`useState`**: Reactive state management for search queries, active category filters, modal visibility, and form inputs.
- **`useMemo`**: Performance optimization for subtotal calculations, coupon discounts, conditional shipping fees, and reading goal estimates.
- **`useEffect` & `useCallback`**: Debounced REST API query synchronization with the Express backend to prevent redundant network requests.

---

## 🏗️ Architecture & File Structure

```
pustak-bookstore/
├── config/
│   └── db.js              # Database connection and fallback management
├── data/
│   └── books.js           # Default book catalog seed data
├── models/
│   ├── Book.js            # Book schema and data service
│   └── Order.js           # Order schema and data service
├── netlify/
│   └── functions/
│       └── api.js         # Netlify Serverless API handler
├── public/
│   ├── index.html         # React 18 SPA Entrypoint & Layout
│   └── components/        # Modular React Components
│       ├── ReadingGoalAdvisor.jsx   # Interactive Goal & Bundle Estimator
│       ├── CartDrawer.jsx           # Offcanvas Shopping Cart
│       └── BookCard.jsx             # Reusable Book Presentation Card
├── routes/
│   └── api.js             # RESTful API router (Books, Checkout, Orders)
├── validators/
│   ├── book.js            # Book creation/update validation rules
│   └── checkout.js        # Checkout validation and authoritative pricing
├── netlify.toml           # Netlify build configuration & API redirects
├── package.json           # Dependencies (React, Express, Mongoose, etc.)
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
