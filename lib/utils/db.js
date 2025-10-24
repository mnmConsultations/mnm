/**
 * MongoDB Connection Utility
 * 
 * Manages MongoDB connection with Next.js best practices
 * Implements connection caching to prevent multiple connections
 * 
 * Features:
 * - Connection pooling via Mongoose
 * - Global connection caching (prevents reconnects on hot reload)
 * - Fallback to localhost for development
 * - bufferCommands: false for faster failures
 * 
 * Environment Variables:
 * - MONGODB_URI: MongoDB connection string (required in production)
 * - Defaults to localhost:27017/mnm for development
 * 
 * Connection Caching:
 * - Uses global.mongoose to persist connection across serverless invocations
 * - Reuses existing connection if available (cached.conn)
 * - Reuses connection promise if in-progress (cached.promise)
 * 
 * Next.js Serverless Optimization:
 * - Vercel/serverless functions reuse Node.js process when possible
 * - Caching prevents connection overhead on each request
 * - Fails fast with bufferCommands: false if connection lost
 * 
 * Error Handling:
 * - Clears promise cache on connection failure
 * - Allows retry on next invocation
 * - Throws error to caller for handling
 * 
 * Usage:
 * await connectDB();
 * // Connection established, ready for Mongoose queries
 */
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mnm";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
