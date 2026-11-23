const express = require("express");
const { BookService } = require("../models/Book");
const { OrderService } = require("../models/Order");
const { validateCheckout } = require("../validators/checkout");
const { validateBook, ALLOWED_CATEGORIES } = require("../validators/book");
const { getStatus } = require("../config/db");

const router = express.Router();

// -------------------------------------------------------------
// 1. BOOKS CRUD ENDPOINTS
// -------------------------------------------------------------

/**
 * GET /api/books
 * Supports ?search=, ?category=, ?sort=(price-asc|price-desc|rating|title)
 */
router.get("/books", async (req, res, next) => {
  try {
    const q = String(req.query.search || "").trim().toLowerCase();
    const cat = String(req.query.category || "").trim();
    const sort = String(req.query.sort || "").trim();

    let books = await BookService.find();

    // Client/Filter logic
    if (cat && cat !== "All") {
      books = books.filter((b) => b.category.toLowerCase() === cat.toLowerCase());
    }

    if (q) {
      books = books.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.description && b.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sort === "price-asc") {
      books.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      books.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      books.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === "title") {
      books.sort((a, b) => a.title.localeCompare(b.title));
    }

    res.json({
      success: true,
      count: books.length,
      categories: ALLOWED_CATEGORIES,
      books,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/books/:id
 * Retrieve single book by ID
 */
router.get("/books/:id", async (req, res, next) => {
  try {
    const book = await BookService.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found." });
    }
    res.json({ success: true, book });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/books
 * Create a new book (CRUD Create)
 */
router.post("/books", async (req, res, next) => {
  try {
    const { errors, clean } = validateBook(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        success: false,
        message: "Book validation failed. Please correct input fields.",
        errors,
      });
    }

    const created = await BookService.create(clean);
    res.status(201).json({
      success: true,
      message: `Book "${created.title}" added to inventory successfully.`,
      book: created,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/books/:id
 * Update an existing book (CRUD Update)
 */
router.put("/books/:id", async (req, res, next) => {
  try {
    const existing = await BookService.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Book not found to update." });
    }

    const { errors, clean } = validateBook({ ...existing, ...req.body });
    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        success: false,
        message: "Book update validation failed.",
        errors,
      });
    }

    const updated = await BookService.updateById(req.params.id, clean);
    res.json({
      success: true,
      message: `Book "${updated.title}" updated successfully.`,
      book: updated,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/books/:id
 * Delete book from inventory (CRUD Delete)
 */
router.delete("/books/:id", async (req, res, next) => {
  try {
    const existing = await BookService.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Book not found to delete." });
    }

    const deleted = await BookService.deleteById(req.params.id);
    res.json({
      success: true,
      message: `Book "${existing.title}" deleted from inventory.`,
      book: deleted,
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 2. CHECKOUT & ORDERS (Zero-Trust Validation & MongoDB Persistence)
// -------------------------------------------------------------

/**
 * POST /api/checkout
 * Validates untrusted payload, verifies cart against DB, creates order
 */
router.post("/checkout", async (req, res, next) => {
  try {
    const { errors, clean } = await validateCheckout(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        success: false,
        message: "Please fix the highlighted fields.",
        errors,
      });
    }

    const orderData = {
      customer: {
        name: clean.name,
        email: clean.email,
        phone: clean.phone,
        address: clean.address,
        pin: clean.pin,
      },
      paymentMethod: clean.payment,
      items: clean.items,
      subtotal: clean.subtotal,
      discount: clean.discount,
      shipping: clean.shipping,
      total: clean.total,
      status: "Placed",
    };

    const savedOrder = await OrderService.create(orderData);

    res.status(201).json({
      success: true,
      message: `Order #${savedOrder.orderId} placed successfully. Thank you, ${clean.name}!`,
      order: savedOrder,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders
 * Retrieve all orders for management/tracking
 */
router.get("/orders", async (req, res, next) => {
  try {
    const orders = await OrderService.findAll(50);
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders/:id
 * Retrieve order details by Order ID
 */
router.get("/orders/:id", async (req, res, next) => {
  try {
    const order = await OrderService.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/orders/:id/status
 * Update order tracking status
 */
router.put("/orders/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];
    if (!status || !allowed.includes(status)) {
      return res.status(422).json({
        success: false,
        message: `Invalid status. Choose one of: ${allowed.join(", ")}`,
      });
    }

    const updated = await OrderService.updateStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    res.json({ success: true, message: `Order #${req.params.id} marked as ${status}.`, order: updated });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 3. SYSTEM METADATA
// -------------------------------------------------------------

router.get("/meta/status", async (req, res) => {
  const dbStatus = getStatus();
  const bookCount = await BookService.count();
  const orders = await OrderService.findAll();

  res.json({
    success: true,
    server: {
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
    },
    database: {
      ...dbStatus,
      bookCount,
      orderCount: orders.length,
    },
  });
});

module.exports = router;
