/**
 * ReadingGoalAdvisor.jsx
 * Pustak Bookstore — Interactive React 18 Component
 *
 * Demonstrates:
 * - Reactive state with `useState`
 * - Performance-optimized dynamic recalculation with `useMemo`
 * - Inter-component event dispatch to parent cart reducer via props
 * - Live React state inspection for academic demonstration
 */

import React, { useState, useMemo } from "react";

export function ReadingGoalAdvisor({ books = [], onAddToCart, onQuickView }) {
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [targetBooksCount, setTargetBooksCount] = useState(2);
  const [showStateInspector, setShowStateInspector] = useState(false);

  // Dynamic calculations via useMemo
  const metrics = useMemo(() => {
    const monthlyHours = (dailyMinutes * 30) / 60;
    const estPages = Math.round(dailyMinutes * 30 * 0.8); // avg reading speed ~0.8 pages/min
    
    let persona = "Casual Reader";
    let personaIcon = "bi-cup-hot";
    if (dailyMinutes >= 60) {
      persona = "Master Polymath";
      personaIcon = "bi-mortarboard-fill";
    } else if (dailyMinutes >= 45) {
      persona = "Deep Thinker";
      personaIcon = "bi-lightning-charge-fill";
    } else if (dailyMinutes >= 30) {
      persona = "Steady Scholar";
      personaIcon = "bi-book-half";
    }

    // Filter books by genre
    const genreFiltered = selectedGenre === "All"
      ? books
      : books.filter((b) => (b.category || "").toLowerCase() === selectedGenre.toLowerCase());

    // Best recommendation from this genre (highest rating or first)
    const sortedByRating = [...genreFiltered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const topRecommendation = sortedByRating[0] || books[0] || null;

    // Bundle cost estimation
    const avgPrice = genreFiltered.length > 0
      ? Math.round(genreFiltered.reduce((sum, b) => sum + (b.price || 0), 0) / genreFiltered.length)
      : 499;
    
    const estimatedCost = avgPrice * targetBooksCount;
    const estimatedSavings = Math.round(estimatedCost * 0.1); // 10% coupon savings

    return {
      monthlyHours: monthlyHours.toFixed(1),
      estPages,
      persona,
      personaIcon,
      topRecommendation,
      estimatedCost,
      estimatedSavings,
      availableInGenre: genreFiltered.length
    };
  }, [dailyMinutes, selectedGenre, targetBooksCount, books]);

  return (
    <div className="card shadow-sm border-0 mb-4 bg-white rounded-4 overflow-hidden border-start border-4 border-warning">
      <div className="card-body p-4">
        {/* Header with React Badge */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-dark text-warning p-2 rounded-3 fs-6">
              <i className="bi bi-atom me-1"></i> React 18 Component
            </span>
            <h5 className="mb-0 fw-bold brand-font text-dark">
              Smart Reading Goal & Bundle Estimator
            </h5>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
            onClick={() => setShowStateInspector(!showStateInspector)}
            title="Inspect live React hook state"
          >
            <i className="bi bi-code-slash me-1"></i>
            {showStateInspector ? "Hide State" : "Inspect React State"}
          </button>
        </div>

        <p className="text-muted small mb-4">
          Calculates your reading pace, personalized book recommendations, and budget savings in real-time using React <code>useState</code> and <code>useMemo</code> hooks without full page reloads.
        </p>

        {/* Live State Inspector Panel */}
        {showStateInspector && (
          <div className="bg-dark text-light p-3 rounded-3 mb-4 font-monospace small">
            <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom border-secondary">
              <span className="text-warning fw-bold">⚛️ Live React Component State Snapshot:</span>
              <span className="badge bg-success">Reactive Virtual DOM</span>
            </div>
            <pre className="mb-0 text-info" style={{ maxHeight: "160px", overflowY: "auto" }}>
              {JSON.stringify(
                {
                  component: "ReadingGoalAdvisor",
                  hookState: {
                    dailyMinutes,
                    selectedGenre,
                    targetBooksCount,
                    monthlyHours: metrics.monthlyHours,
                    estPages: metrics.estPages,
                    readingPersona: metrics.persona,
                    estimatedCostINR: metrics.estimatedCost,
                    couponSavingsINR: metrics.estimatedSavings,
                    recommendedBook: metrics.topRecommendation?.title || "None"
                  }
                },
                null,
                2
              )}
            </pre>
          </div>
        )}

        <div className="row g-4 align-items-center">
          {/* Controls Column */}
          <div className="col-lg-7">
            {/* 1. Daily Minutes Selector */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-dark d-flex justify-content-between">
                <span>1. Daily Reading Commitment:</span>
                <span className="text-warning fw-bold">{dailyMinutes} mins / day</span>
              </label>
              <div className="d-flex gap-2 flex-wrap">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 ${
                      dailyMinutes === mins
                        ? "btn-dark fw-bold text-warning"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => setDailyMinutes(mins)}
                  >
                    <i className="bi bi-clock me-1"></i> {mins} mins
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Genre Selector */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-dark">
                2. Preferred Literary Genre:
              </label>
              <div className="d-flex gap-2 flex-wrap">
                {["All", "Fiction", "Technology", "History", "Biography", "Science"].map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 ${
                      selectedGenre === genre
                        ? "btn-warning fw-bold text-dark"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Monthly Books Stepper */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-dark d-flex justify-content-between">
                <span>3. Target Books This Month:</span>
                <span className="text-primary fw-bold">{targetBooksCount} books</span>
              </label>
              <div className="d-flex align-items-center gap-3">
                <input
                  type="range"
                  className="form-range"
                  min="1"
                  max="5"
                  step="1"
                  value={targetBooksCount}
                  onChange={(e) => setTargetBooksCount(Number(e.target.value))}
                />
                <span className="badge bg-light text-dark border px-3 py-2 fs-6">
                  {targetBooksCount} / mo
                </span>
              </div>
            </div>

            {/* Metric Badges */}
            <div className="row g-2 mt-2">
              <div className="col-4">
                <div className="p-2 border rounded-3 bg-light text-center">
                  <div className="text-muted small">Monthly Time</div>
                  <div className="fw-bold text-dark">{metrics.monthlyHours} hrs</div>
                </div>
              </div>
              <div className="col-4">
                <div className="p-2 border rounded-3 bg-light text-center">
                  <div className="text-muted small">Est. Pages</div>
                  <div className="fw-bold text-dark">~{metrics.estPages}</div>
                </div>
              </div>
              <div className="col-4">
                <div className="p-2 border rounded-3 bg-light text-center">
                  <div className="text-muted small">Your Persona</div>
                  <div className="fw-bold text-warning text-truncate">
                    <i className={`bi ${metrics.personaIcon} me-1`}></i>
                    {metrics.persona}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Recommendation & Savings Column */}
          <div className="col-lg-5">
            <div className="p-3 bg-light rounded-4 border">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="badge bg-warning text-dark fw-bold">
                  <i className="bi bi-stars me-1"></i> React AI Pick
                </span>
                <span className="text-muted small">
                  {metrics.availableInGenre} books in {selectedGenre}
                </span>
              </div>

              {metrics.topRecommendation ? (
                <div className="card border-0 bg-white shadow-sm p-3 rounded-3 mb-3">
                  <div className="d-flex gap-3 align-items-center">
                    <div
                      className={`book-cover bg-${metrics.topRecommendation.category || "General"} d-flex align-items-center justify-content-center text-white rounded p-2`}
                      style={{ width: "65px", height: "85px", fontSize: "0.7rem", textAlign: "center" }}
                    >
                      <span className="fw-bold">{metrics.topRecommendation.title.substring(0, 18)}...</span>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark text-truncate" style={{ maxWidth: "180px" }}>
                        {metrics.topRecommendation.title}
                      </div>
                      <div className="text-muted small">by {metrics.topRecommendation.author}</div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <span className="fw-bold text-dark">₹{metrics.topRecommendation.price}</span>
                        <span className="rating-badge small">
                          <i className="bi bi-star-fill text-warning"></i> {metrics.topRecommendation.rating || 4.5}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-3 pt-2 border-top">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-pill flex-fill"
                      onClick={() => onQuickView && onQuickView(metrics.topRecommendation)}
                    >
                      <i className="bi bi-eye me-1"></i> Preview
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-warning rounded-pill fw-bold flex-fill"
                      onClick={() => onAddToCart && onAddToCart(metrics.topRecommendation)}
                      disabled={metrics.topRecommendation.stock <= 0}
                    >
                      <i className="bi bi-cart-plus me-1"></i> Add to Cart
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3 text-muted small">
                  No books found in this genre.
                </div>
              )}

              {/* Estimated Budget & Savings Box */}
              <div className="p-2 px-3 bg-white rounded-3 border d-flex justify-content-between align-items-center small">
                <div>
                  <span className="text-muted">Est. Bundle ({targetBooksCount} bks):</span>
                  <span className="fw-bold text-dark ms-2">₹{metrics.estimatedCost}</span>
                </div>
                <div className="text-success fw-bold">
                  <i className="bi bi-tag-fill me-1"></i> Save ₹{metrics.estimatedSavings} (10%)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReadingGoalAdvisor;
