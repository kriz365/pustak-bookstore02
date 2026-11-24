/**
 * BookCard.jsx
 * Pustak Bookstore — React 18 Book Presentation Card
 *
 * Demonstrates:
 * - Functional React component with prop destructuring
 * - Conditional styling based on book category and stock level
 * - Event callbacks for modal opening and cart addition
 */

import React from "react";

export function BookCard({ book, onSelectBook, onAddToCart, formatINR }) {
  const isOutOfStock = book.stock <= 0;

  return (
    <div className="col">
      <div className="book-card h-100 d-flex flex-column justify-content-between">
        {/* Visual Book Cover */}
        <div
          className={`book-cover bg-${book.category || "General"}`}
          onClick={() => onSelectBook(book)}
          title="Click to view details"
        >
          <div>
            <span className="badge bg-dark bg-opacity-50 text-white mb-2 font-monospace">
              {book.category}
            </span>
            <div className="title">{book.title}</div>
          </div>
          <div className="author">by {book.author}</div>
        </div>

        {/* Info & Action Controls */}
        <div className="mt-3 d-flex flex-column gap-2 flex-grow-1 justify-content-between">
          <div className="d-flex align-items-center justify-content-between">
            <span className="rating-badge">
              <i className="bi bi-star-fill text-warning"></i>
              {book.rating || 4.5}
            </span>
            <span
              className={`badge ${
                isOutOfStock
                  ? "bg-danger text-white"
                  : "text-bg-light text-muted border"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : `${book.stock} in stock`}
            </span>
          </div>

          <div className="d-flex align-items-center justify-content-between pt-2 border-top">
            <div className="price-tag">{formatINR(book.price)}</div>
            <div className="d-flex gap-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill"
                onClick={() => onSelectBook(book)}
                title="Quick View"
              >
                <i className="bi bi-eye"></i>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-warning rounded-pill px-3 fw-bold"
                onClick={() => onAddToCart(book)}
                disabled={isOutOfStock}
              >
                <i className="bi bi-cart-plus me-1"></i> Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookCard;
