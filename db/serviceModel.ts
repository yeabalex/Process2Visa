import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // e.g., "premium_plan", "consultation", "ebook"
      trim: true,
      lowercase: true, // store consistently
    },
    displayName: {
      type: String,
      trim: true, // e.g., "Premium Plan"
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: "ETB",
      trim: true,
    },
    image: {
      type: String,
      trim: true, // URL or path to the background image
    },
  },
  { timestamps: true }
);

const Service = mongoose.models.Service || mongoose.model("Service", serviceSchema);

export default Service;
