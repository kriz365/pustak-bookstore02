// Automated Integration Test Suite for Pustak Bookstore
const base = process.env.BASE || "http://127.0.0.1:3000";

const validOrder = {
  name: "Ritkriti Singh",
  email: "ritkriti.singh@example.com",
  phone: "9876543210",
  address: "Flat 402, Green Valley Apartments, Alandi, Pune",
  pin: "412105",
  payment: "upi",
  coupon: "PUSTAK10",
  items: [{ id: 5, qty: 2 }],
};

const checkoutCases = [
  ["valid order with coupon", validOrder, 201],
  ["empty request body", {}, 422],
  ["invalid email format", { ...validOrder, email: "ritkriti@" }, 422],
  ["invalid mobile number", { ...validOrder, phone: "12345" }, 422],
  ["invalid 4-digit PIN", { ...validOrder, pin: "0123" }, 422],
  ["unsupported payment", { ...validOrder, payment: "bitcoin" }, 422],
  ["empty cart array", { ...validOrder, items: [] }, 422],
  ["excessive quantity (99)", { ...validOrder, items: [{ id: 5, qty: 99 }] }, 422],
  ["unknown book id", { ...validOrder, items: [{ id: 9999, qty: 1 }] }, 422],
];

async function runTests() {
  console.log("=========================================================");
  console.log("  PUSTAK INTEGRATION TESTS — WEB TECHNOLOGY PRACTICALS   ");
  console.log(`  Target: ${base}                                        `);
  console.log("=========================================================\n");

  let failCount = 0;
  let testCount = 0;

  function assert(title, condition, extra = "") {
    testCount++;
    if (condition) {
      console.log(`\x1b[32m✔ PASS\x1b[0m  [#${testCount}] ${title} ${extra}`);
    } else {
      failCount++;
      console.log(`\x1b[31m✖ FAIL\x1b[0m  [#${testCount}] ${title} ${extra}`);
    }
  }

  try {
    // 1. Test GET /api/books (Practical 6)
    const booksRes = await fetch(`${base}/api/books`);
    const booksData = await booksRes.json();
    assert(
      "GET /api/books returns book catalog",
      booksRes.status === 200 && Array.isArray(booksData.books) && booksData.books.length > 0,
      `(${booksData.books?.length} books found)`
    );

    // 2. Test GET /api/books with search and category filters
    const filterRes = await fetch(`${base}/api/books?category=Technology&search=clean`);
    const filterData = await filterRes.json();
    assert(
      "GET /api/books with filters works",
      filterRes.status === 200 && filterData.books.some((b) => b.title.includes("Clean Code")),
      `(${filterData.books?.length} matched)`
    );

    // 3. Test Checkout Server-Side Validation (Practical 4 & 5)
    console.log("\n--- Checking Zero-Trust Checkout Validation Suite ---");
    let placedOrderId = null;
    for (const [label, body, wantStatus] of checkoutCases) {
      const res = await fetch(`${base}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const passed = res.status === wantStatus;
      assert(
        `Checkout: ${label.padEnd(25)}`,
        passed,
        `-> Status: ${res.status} (Expected: ${wantStatus})`
      );
      if (res.status === 201 && data.order) {
        placedOrderId = data.order.orderId;
      }
    }

    // 4. Test Zero-Trust Authoritative Price Recalculation
    console.log("\n--- Checking Price Tampering Defense (Zero-Trust) ---");
    const tamperedPayload = {
      ...validOrder,
      items: [{ id: 5, qty: 1 }], // Clean Code book is ₹899
      total: 1, // Client maliciously attempts to pay ₹1
      subtotal: 1,
    };
    const tamperRes = await fetch(`${base}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tamperedPayload),
    });
    const tamperData = await tamperRes.json();
    const authoritativeTotal = tamperData.order?.total;
    assert(
      "Server ignores client total and recalculates authoritatively",
      tamperRes.status === 201 && authoritativeTotal > 1,
      `(Server calculated ₹${authoritativeTotal} instead of malicious ₹1)`
    );

    // 5. Test GET /api/orders/:id (Practical 6)
    if (placedOrderId) {
      const orderRes = await fetch(`${base}/api/orders/${placedOrderId}`);
      const orderData = await orderRes.json();
      assert(
        `GET /api/orders/${placedOrderId} returns placed order`,
        orderRes.status === 200 && orderData.order?.orderId === placedOrderId
      );
    }

    // 6. Test Book CRUD Create (POST /api/books) (Practical 6 & 7)
    console.log("\n--- Checking RESTful Book CRUD Operations ---");
    const newBookPayload = {
      title: "Automated Software Testing",
      author: "Elfriede Dustin",
      category: "Technology",
      price: 649,
      stock: 12,
      rating: 4.6,
      isbn: "978-0201648218",
      description: "Introduction, management, and performance for automated software testing.",
    };
    const createBookRes = await fetch(`${base}/api/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBookPayload),
    });
    const createBookData = await createBookRes.json();
    const createdBookId = createBookData.book?.id;
    assert(
      "POST /api/books creates a new book",
      createBookRes.status === 201 && !!createdBookId,
      `(Created book id: ${createdBookId})`
    );

    // 7. Test Book CRUD Update (PUT /api/books/:id)
    if (createdBookId) {
      const updateRes = await fetch(`${base}/api/books/${createdBookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: 699, stock: 15 }),
      });
      const updateData = await updateRes.json();
      assert(
        "PUT /api/books/:id updates book details",
        updateRes.status === 200 && updateData.book?.price === 699,
        `(Updated price to ₹${updateData.book?.price})`
      );

      // 8. Test Book CRUD Delete (DELETE /api/books/:id)
      const deleteRes = await fetch(`${base}/api/books/${createdBookId}`, {
        method: "DELETE",
      });
      assert(
        "DELETE /api/books/:id removes book from inventory",
        deleteRes.status === 200
      );
    }

    // 9. Test Malformed JSON Handling (Practical 5 Error Handling Middleware)
    console.log("\n--- Checking Error Handling & Edge Cases ---");
    const malformedRes = await fetch(`${base}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ bad json ::: ",
    });
    assert(
      "Malformed JSON returns clean HTTP 400 Bad Request without stack trace",
      malformedRes.status === 400
    );

    // 10. Test Unknown Route Handler (404)
    const unknownRes = await fetch(`${base}/api/nonexistent-endpoint`);
    assert(
      "Unknown endpoint returns clean HTTP 404 Not Found",
      unknownRes.status === 404
    );

    // 11. Test System Status Metadata
    const statusRes = await fetch(`${base}/api/meta/status`);
    const statusData = await statusRes.json();
    assert(
      "GET /api/meta/status provides backend and database health",
      statusRes.status === 200 && statusData.success === true && statusData.database !== undefined
    );

    console.log("\n=========================================================");
    console.log(`  TEST RESULTS: ${testCount - failCount}/${testCount} PASSED`);
    if (failCount === 0) {
      console.log("  \x1b[32mALL INTEGRATION TESTS PASSED SUCCESSFULLY!\x1b[0m");
    } else {
      console.log(`  \x1b[31m${failCount} TESTS FAILED\x1b[0m`);
    }
    console.log("=========================================================\n");

    process.exit(failCount ? 1 : 0);
  } catch (err) {
    console.error("Test execution failed:", err.message);
    process.exit(1);
  }
}

runTests();
