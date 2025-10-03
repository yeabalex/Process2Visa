import mongoose from "mongoose";

const uri: string = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}

// Extend global type for development caching
declare global {
  var _mongoosePromise: Promise<typeof mongoose> | undefined;
}

let mongoosePromise: Promise<typeof mongoose>;

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to prevent multiple connections during hot reloads
  if (!global._mongoosePromise) {
    global._mongoosePromise = mongoose.connect(uri);
  }
  mongoosePromise = global._mongoosePromise;
} else {
  // In production, create a new connection
  mongoosePromise = mongoose.connect(uri);
}

// Optional: Add connection event listeners for debugging
mongoosePromise
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

export default mongoosePromise;