const mongoose = require("mongoose");
const initialBooks = require("../data/books");

const bookSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    author: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    category: {
      type: String,
      required: true,
      enum: ["Fiction", "Biography", "History", "Technology", "Science", "Philosophy", "General"],
      default: "General",
    },
    price: { type: Number, required: true, min: 1, max: 50000 },
    rating: { type: Number, default: 4.5, min: 1.0, max: 5.0 },
    stock: { type: Number, default: 10, min: 0, max: 1000 },
    isbn: { type: String, default: "" },
    publishedYear: { type: Number, default: new Date().getFullYear() },
    description: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Fallback in-memory store in case MongoDB is offline
let memBooks = JSON.parse(JSON.stringify(initialBooks));
let nextMemId = 100;

const BookModel = mongoose.models.Book || mongoose.model("Book", bookSchema);

// Service wrapper providing seamless MongoDB operations with fallback
class BookService {
  static async seedInitialData() {
    if (mongoose.connection.readyState === 1) {
      try {
        const count = await BookModel.countDocuments();
        if (count === 0) {
          console.log("[MongoDB] Seeding initial book collection...");
          await BookModel.insertMany(initialBooks);
          console.log(`[MongoDB] Seeded ${initialBooks.length} books successfully.`);
        }
      } catch (err) {
        console.error("[MongoDB] Seeding error:", err.message);
      }
    }
  }

  static async find(filter = {}, sort = {}) {
    if (mongoose.connection.readyState === 1) {
      const query = BookModel.find(filter);
      if (Object.keys(sort).length > 0) query.sort(sort);
      return await query.lean();
    }
    // Fallback
    let res = [...memBooks];
    if (filter.category) res = res.filter((b) => b.category === filter.category);
    if (filter.$or) {
      const q = filter.$or[0]?.title?.$regex ? filter.$or[0].title.$regex.source.toLowerCase() : "";
      if (q) {
        res = res.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            (b.description && b.description.toLowerCase().includes(q))
        );
      }
    }
    return res;
  }

  static async findById(id) {
    const numId = Number(id);
    if (mongoose.connection.readyState === 1) {
      const doc = await BookModel.findOne({ id: numId }).lean();
      return doc;
    }
    return memBooks.find((b) => b.id === numId) || null;
  }

  static async create(data) {
    if (mongoose.connection.readyState === 1) {
      // Find highest id if not provided
      if (!data.id) {
        const maxDoc = await BookModel.findOne().sort({ id: -1 });
        data.id = maxDoc && maxDoc.id ? maxDoc.id + 1 : 1;
      }
      const newBook = new BookModel(data);
      const saved = await newBook.save();
      return saved.toObject();
    }
    const id = data.id || nextMemId++;
    const book = { ...data, id, createdAt: new Date().toISOString() };
    memBooks.push(book);
    return book;
  }

  static async updateById(id, updateData) {
    const numId = Number(id);
    if (mongoose.connection.readyState === 1) {
      const updated = await BookModel.findOneAndUpdate({ id: numId }, updateData, {
        returnDocument: "after",
        runValidators: true,
      }).lean();
      return updated;
    }
    const idx = memBooks.findIndex((b) => b.id === numId);
    if (idx === -1) return null;
    memBooks[idx] = { ...memBooks[idx], ...updateData };
    return memBooks[idx];
  }

  static async deleteById(id) {
    const numId = Number(id);
    if (mongoose.connection.readyState === 1) {
      const res = await BookModel.findOneAndDelete({ id: numId }).lean();
      return res;
    }
    const idx = memBooks.findIndex((b) => b.id === numId);
    if (idx === -1) return null;
    const removed = memBooks.splice(idx, 1)[0];
    return removed;
  }

  static async count(filter = {}) {
    if (mongoose.connection.readyState === 1) {
      return await BookModel.countDocuments(filter);
    }
    return memBooks.length;
  }
}

module.exports = { BookModel, BookService };
