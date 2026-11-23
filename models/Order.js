const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1, max: 10 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: Number, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      pin: { type: String, required: true, trim: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["upi", "card", "cod", "netbanking"],
      default: "upi",
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Placed",
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);

// In-memory fallback map
const memOrders = new Map();
let nextOrderSequence = 1001;

class OrderService {
  static async create(data) {
    if (mongoose.connection.readyState === 1) {
      if (!data.orderId) {
        const last = await OrderModel.findOne().sort({ orderId: -1 });
        data.orderId = last && last.orderId ? last.orderId + 1 : 1001;
      }
      const order = new OrderModel(data);
      const saved = await order.save();
      return saved.toObject();
    }
    const orderId = data.orderId || nextOrderSequence++;
    const order = {
      ...data,
      orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memOrders.set(orderId, order);
    return order;
  }

  static async findById(id) {
    const numId = Number(id);
    if (mongoose.connection.readyState === 1) {
      const order = await OrderModel.findOne({ orderId: numId }).lean();
      return order;
    }
    return memOrders.get(numId) || null;
  }

  static async findAll(limit = 50) {
    if (mongoose.connection.readyState === 1) {
      return await OrderModel.find().sort({ createdAt: -1 }).limit(limit).lean();
    }
    return Array.from(memOrders.values()).reverse().slice(0, limit);
  }

  static async updateStatus(id, status) {
    const numId = Number(id);
    if (mongoose.connection.readyState === 1) {
      return await OrderModel.findOneAndUpdate(
        { orderId: numId },
        { status },
        { returnDocument: "after" }
      ).lean();
    }
    const order = memOrders.get(numId);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    memOrders.set(numId, order);
    return order;
  }
}

module.exports = { OrderModel, OrderService };
