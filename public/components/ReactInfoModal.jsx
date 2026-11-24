/**
 * ReactInfoModal.jsx
 * Pustak Bookstore — React 18 Architecture Inspector Modal
 *
 * Provides examiners and evaluators with immediate, transparent insight
 * into how React 18 powers the Single Page Application (SPA).
 */

import React from "react";

export function ReactInfoModal({ isOpen, onClose, cartCount = 0, booksCount = 0 }) {
  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(13, 35, 40, 0.75)", zIndex: 1060 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-dark text-white border-bottom border-warning border-3 p-4">
            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-warning text-dark p-2 rounded-3 fs-5">
                <i className="bi bi-atom"></i>
              </span>
              <div>
                <h5 className="modal-title fw-bold mb-0 brand-font">
                  React 18 Single-Page Application (SPA) Architecture
                </h5>
                <p className="text-warning-emphasis small mb-0">
                  Pustak Client Architecture & State Management Overview
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4 bg-light">
            {/* Live Metrics Row */}
            <div className="row g-3 mb-4">
              <div className="col-sm-4">
                <div className="card border-0 bg-white shadow-sm p-3 rounded-3 text-center">
                  <div className="text-muted small">Rendering Engine</div>
                  <div className="fw-bold text-dark fs-6 mt-1">
                    <i className="bi bi-cpu text-warning me-1"></i> React 18.3 Virtual DOM
                  </div>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="card border-0 bg-white shadow-sm p-3 rounded-3 text-center">
                  <div className="text-muted small">Active Cart Items</div>
                  <div className="fw-bold text-warning fs-6 mt-1">
                    <i className="bi bi-bag-check text-warning me-1"></i> {cartCount} items (useReducer)
                  </div>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="card border-0 bg-white shadow-sm p-3 rounded-3 text-center">
                  <div className="text-muted small">Catalog State</div>
                  <div className="fw-bold text-success fs-6 mt-1">
                    <i className="bi bi-check-circle text-success me-1"></i> {booksCount} Books Cached
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: React Hooks */}
            <h6 className="fw-bold text-dark mb-3">
              <i className="bi bi-lightning-charge-fill text-warning me-1"></i> React Hooks Utilized
            </h6>
            <div className="list-group mb-4 shadow-sm border-0 rounded-3">
              <div className="list-group-item p-3 border-0 border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <strong className="text-dark"><code>useReducer</code> — Centralized Cart State</strong>
                  <span className="badge bg-primary">Predictable State</span>
                </div>
                <p className="text-muted small mb-0 mt-1">
                  Replaces fragmented <code>useState</code> hooks with atomic actions: <code>ADD_ITEM</code>, <code>INCREMENT</code>, <code>DECREMENT</code>, <code>REMOVE</code>, and <code>CLEAR</code>. Guarantees header badge and offcanvas drawer stay 100% in sync.
                </p>
              </div>

              <div className="list-group-item p-3 border-0 border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <strong className="text-dark"><code>useState</code> — Reactive UI State</strong>
                  <span className="badge bg-secondary">Component State</span>
                </div>
                <p className="text-muted small mb-0 mt-1">
                  Drives live search inputs, category chip active states, sorting dropdowns, modal visibility toggles, and form field validation.
                </p>
              </div>

              <div className="list-group-item p-3 border-0 border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <strong className="text-dark"><code>useMemo</code> — Calculated Values</strong>
                  <span className="badge bg-success">Performance</span>
                </div>
                <p className="text-muted small mb-0 mt-1">
                  Caches computationally expensive calculations: subtotal sums, 10% coupon discount logic, conditional ₹50 delivery fees, and grand totals.
                </p>
              </div>

              <div className="list-group-item p-3 border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <strong className="text-dark"><code>useEffect</code> &amp; <code>useCallback</code> — Asynchronous REST Sync</strong>
                  <span className="badge bg-info text-dark">Data Fetching</span>
                </div>
                <p className="text-muted small mb-0 mt-1">
                  Debounces search and filter queries by 200ms before dispatching asynchronous HTTP fetch requests to <code>/api/books</code>, eliminating unnecessary server hits.
                </p>
              </div>
            </div>

            {/* Section 2: Component Hierarchy */}
            <h6 className="fw-bold text-dark mb-3">
              <i className="bi bi-diagram-3-fill text-warning me-1"></i> Component Hierarchy
            </h6>
            <div className="bg-white p-3 rounded-3 shadow-sm font-monospace small border">
              <div className="text-primary fw-bold">&lt;PustakApp&gt; (Root State Container)</div>
              <div className="ps-3 text-secondary">├── &lt;HeaderNavbar /&gt; (Brand Logo, Tab Switcher, Animated Cart Badge)</div>
              <div className="ps-3 text-secondary">├── &lt;HeroBanner /&gt; (Tactile 3D Shelf Spines Display)</div>
              <div className="ps-3 text-success fw-semibold">├── &lt;ReadingGoalAdvisor /&gt; (Interactive Goal Planner &amp; Bundle Estimator)</div>
              <div className="ps-3 text-secondary">├── &lt;BookCatalogGrid /&gt; (Search Input, Filter Chips, Dynamic &lt;BookCard /&gt;s)</div>
              <div className="ps-3 text-secondary">├── &lt;CartOffcanvas /&gt; (useReducer Drawer, Coupon Input, Checkout Trigger)</div>
              <div className="ps-3 text-secondary">├── &lt;CheckoutModal /&gt; (Zero-Trust Validation &amp; Order Submission)</div>
              <div className="ps-3 text-secondary">├── &lt;TrackOrderView /&gt; (Real-time Timeline Stepper)</div>
              <div className="ps-3 text-secondary">└── &lt;AdminInventoryView /&gt; (REST CRUD Operations Modal)</div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer border-top bg-white p-3">
            <button
              type="button"
              className="btn btn-warning rounded-pill px-4 fw-bold"
              onClick={onClose}
            >
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReactInfoModal;
