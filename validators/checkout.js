const { BookService } = require("../models/Book");

const NAME_RE = /^[A-Za-z][A-Za-z .'-]{1,59}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/; // Indian mobile number
const PIN_RE = /^[1-9]\d{5}$/; // Indian PIN code (6 digits, doesn't start with 0)
const PAYMENTS = ["upi", "card", "cod", "netbanking"];

function str(v) {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Validates checkout form data and performs authoritative server-side price calculation.
 * Zero-trust architecture: Prices, discounts, and totals sent by the client are ignored
 * and calculated strictly from the database.
 */
async function validateCheckout(body) {
  const errors = {};
  const b = body && typeof body === "object" ? body : {};

  // Customer Name
  const name = str(b.name);
  if (!name) errors.name = "Full name is required.";
  else if (!NAME_RE.test(name))
    errors.name = "Use 2–60 alphabetic letters; spaces, . ' - allowed.";

  // Customer Email
  const email = str(b.email).toLowerCase();
  if (!email) errors.email = "Email address is required.";
  else if (!EMAIL_RE.test(email))
    errors.email = "Enter a valid email address (e.g., student@example.com).";

  // Customer Phone
  const phone = str(b.phone);
  if (!phone) errors.phone = "Phone number is required.";
  else if (!PHONE_RE.test(phone))
    errors.phone = "Enter a valid 10-digit Indian mobile number starting with 6–9.";

  // Delivery Address
  const address = str(b.address);
  if (!address) errors.address = "Delivery address is required.";
  else if (address.length < 10 || address.length > 200)
    errors.address = "Address must be between 10 and 200 characters.";

  // Postal PIN Code
  const pin = str(b.pin);
  if (!pin) errors.pin = "Postal PIN code is required.";
  else if (!PIN_RE.test(pin))
    errors.pin = "Enter a valid 6-digit Indian PIN code (cannot start with 0).";

  // Payment Method
  const payment = str(b.payment).toLowerCase();
  if (!PAYMENTS.includes(payment)) {
    errors.payment = "Choose UPI, Credit/Debit Card, Net Banking, or Cash on Delivery.";
  }

  // Cart Items & Zero-Trust Authoritative Pricing
  const items = [];
  if (!Array.isArray(b.items) || b.items.length === 0) {
    errors.items = "Your cart is empty. Please add at least one book.";
  } else {
    for (const it of b.items) {
      const bookId = Number(it?.id);
      const qty = it?.qty;

      if (!bookId) {
        errors.items = "Invalid book identifier in cart.";
        break;
      }

      const book = await BookService.findById(bookId);
      if (!book) {
        errors.items = `Book ID ${bookId} is not in our catalog.`;
        break;
      }

      if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
        errors.items = `Quantity for "${book.title}" must be a whole number between 1 and 10.`;
        break;
      }

      items.push({
        id: book.id,
        title: book.title,
        price: book.price,
        qty,
      });
    }
  }

  // Calculate authoritative subtotal
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Promo code validation: PUSTAK10 yields 10% discount
  const coupon = str(b.coupon).toUpperCase();
  let discount = 0;
  if (coupon === "PUSTAK10" && subtotal > 0) {
    discount = Math.round(subtotal * 0.1);
  }

  // Shipping policy: Free shipping on orders above ₹500, else ₹50
  const shipping = subtotal > 0 && subtotal - discount >= 500 ? 0 : subtotal > 0 ? 50 : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  return {
    errors,
    clean: {
      name,
      email,
      phone,
      address,
      pin,
      payment,
      items,
      subtotal,
      discount,
      shipping,
      total,
      coupon: discount > 0 ? coupon : "",
    },
  };
}

module.exports = { validateCheckout };
