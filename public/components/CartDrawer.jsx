/**
 * CartDrawer.jsx
 * Pustak Bookstore — React 18 Cart Offcanvas Component
 *
 * Utilizes atomic actions dispatched to cartReducer:
 * - INCREMENT: Increases quantity up to max stock boundary
 * - DECREMENT: Decreases quantity, removes item at 0
 * - REMOVE: Drops line item
 * - CLEAR: Empties cart
 */

import React from "react";

export function CartDrawer({
  isOpen,
  onClose,
  cart = [],
  subtotal = 0,
  discount = 0,
  shipping = 0,
  grandTotal = 0,
  couponCode = "",
  setCouponCode,
  couponApplied = false,
  onApplyCoupon,
  onProceedToCheckout,
  dispatchCart,
  formatINR
}) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="offcanvas-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1045 }}
      ></div>
      <div
        className="offcanvas offcanvas-end show shadow-lg"
        tabIndex="-1"
        style={{ visibility: "visible", zIndex: 1050, width: "420px" }}
      >
        <div className="offcanvas-header border-bottom bg-light">
          <h5 className="offcanvas-title fw-bold brand-font d-flex align-items-center gap-2">
            <i className="bi bi-bag-fill text-warning"></i>
            <span>Your Reading Cart</span>
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>

        <div className="offcanvas-body p-3 d-flex flex-column">
          {cart.length === 0 ? (
            <div className="text-center my-auto py-5">
              <i className="bi bi-cart-x text-muted" style={{ fontSize: "3rem" }}></i>
              <h6 className="mt-3 text-muted">Your cart is currently empty</h6>
              <p className="text-muted small">Explore our collection and pick your next book!</p>
              <button
                type="button"
                className="btn btn-warning rounded-pill px-4 fw-bold mt-2"
                onClick={onClose}
              >
                Browse Books
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="flex-grow-1 overflow-auto pe-1">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="card mb-2 border rounded-3 p-2 bg-white shadow-sm"
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1 me-2">
                        <div className="fw-bold small text-dark text-truncate" style={{ maxWidth: "220px" }}>
                          {item.title}
                        </div>
                        <div className="text-muted small">by {item.author}</div>
                        <div className="fw-semibold text-warning mt-1">
                          {formatINR(item.price)}
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="d-flex align-items-center gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary py-0 px-2 rounded-circle"
                          onClick={() => dispatchCart({ type: "DECREMENT", id: item.id })}
                        >
                          -
                        </button>
                        <span className="px-2 small fw-bold">{item.qty}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary py-0 px-2 rounded-circle"
                          onClick={() => dispatchCart({ type: "INCREMENT", id: item.id })}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-danger p-0 ms-2"
                          onClick={() => dispatchCart({ type: "REMOVE", id: item.id })}
                          title="Remove item"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary & Coupon */}
              <div className="border-top pt-3 mt-2">
                {/* Coupon Code Input */}
                <div className="input-group input-group-sm mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Coupon: PUSTAK10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                  />
                  <button
                    className="btn btn-outline-dark fw-semibold"
                    type="button"
                    onClick={onApplyCoupon}
                    disabled={couponApplied || !couponCode.trim()}
                  >
                    {couponApplied ? "Applied ✓" : "Apply"}
                  </button>
                </div>

                {/* Subtotals */}
                <div className="d-flex justify-content-between text-muted small mb-1">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>

                {couponApplied && (
                  <div className="d-flex justify-content-between text-success small mb-1">
                    <span>Discount (10%)</span>
                    <span>-{formatINR(discount)}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between text-muted small mb-2">
                  <span>Delivery Fee</span>
                  <span>{shipping === 0 ? <strong className="text-success">FREE</strong> : formatINR(shipping)}</span>
                </div>

                <div className="d-flex justify-content-between fw-bold fs-5 text-dark border-top pt-2 mb-3">
                  <span>Grand Total</span>
                  <span className="text-warning">{formatINR(grandTotal)}</span>
                </div>

                <button
                  type="button"
                  className="btn btn-warning w-100 rounded-pill py-2 fw-bold shadow-sm"
                  onClick={onProceedToCheckout}
                >
                  Proceed to Checkout <i className="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default CartDrawer;
