// On local machines (especially Windows), custom DNS helps resolve MongoDB Atlas SRV records
// In cloud environments (Netlify / AWS Lambda), avoid overriding system resolvers
if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  try {
    const dns = require("node:dns");
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (err) {
    // Ignore DNS override errors
  }
}
const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  // If already connected, reuse connection (critical for Netlify / serverless environments)
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pustak_bookstore";

  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB] Warning: Could not connect to MongoDB at "${uri}".`);
    console.warn(`[MongoDB] Operating in graceful in-memory storage fallback mode.`);
    console.warn(`[MongoDB] Reason: ${error.message}`);
    if (error.reason && error.reason.servers) {
      try {
        console.log(
          [...error.reason.servers].map(([address, server]) => ({
            address,
            error: server.error?.message,
            type: server.type,
          }))
        );
      } catch (e) {}
    }
    return false;
  }
};

const getStatus = () => ({
  connected: isConnected,
  database: isConnected ? mongoose.connection.name : "in-memory-fallback",
  readyState: mongoose.connection.readyState,
  host: isConnected ? mongoose.connection.host : "localhost",
});

module.exports = { connectDB, getStatus };
