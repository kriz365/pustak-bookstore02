function str(v) {
  return typeof v === "string" ? v.trim() : "";
}

const ALLOWED_CATEGORIES = [
  "Fiction",
  "Biography",
  "History",
  "Technology",
  "Science",
  "Philosophy",
  "General",
];

function validateBook(body) {
  const errors = {};
  const b = body && typeof body === "object" ? body : {};

  const title = str(b.title);
  if (!title) errors.title = "Book title is required.";
  else if (title.length < 2 || title.length > 120)
    errors.title = "Title must be between 2 and 120 characters.";

  const author = str(b.author);
  if (!author) errors.author = "Author name is required.";
  else if (author.length < 2 || author.length > 80)
    errors.author = "Author name must be between 2 and 80 characters.";

  const category = str(b.category) || "General";
  if (!ALLOWED_CATEGORIES.includes(category)) {
    errors.category = `Category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`;
  }

  const price = Number(b.price);
  if (b.price === undefined || b.price === null || isNaN(price)) {
    errors.price = "Valid price in INR is required.";
  } else if (price < 1 || price > 50000) {
    errors.price = "Price must be between ₹1 and ₹50,000.";
  }

  let stock = 10;
  if (b.stock !== undefined && b.stock !== "") {
    stock = Number(b.stock);
    if (!Number.isInteger(stock) || stock < 0 || stock > 1000) {
      errors.stock = "Stock must be a whole number between 0 and 1000.";
    }
  }

  let rating = 4.5;
  if (b.rating !== undefined && b.rating !== "") {
    rating = Number(b.rating);
    if (isNaN(rating) || rating < 1.0 || rating > 5.0) {
      errors.rating = "Rating must be between 1.0 and 5.0.";
    }
  }

  const description = str(b.description);
  if (description.length > 1000) {
    errors.description = "Description cannot exceed 1000 characters.";
  }

  const isbn = str(b.isbn);

  return {
    errors,
    clean: {
      title,
      author,
      category,
      price: Math.round(price * 100) / 100,
      stock,
      rating: Math.round(rating * 10) / 10,
      description,
      isbn,
    },
  };
}

module.exports = { validateBook, ALLOWED_CATEGORIES };
