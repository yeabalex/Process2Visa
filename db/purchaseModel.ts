import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    chat_id: {
      type: String,
      required: true,
      index: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: ["cbe", "tele-birr"],
      required: true,
    },
    currency: {
      type: String,
      default: "ETB",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    txn_id: {
      type: String,
      required: true, // always provided
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const Purchase = mongoose.models.Purchase || mongoose.model("Purchase", purchaseSchema);

export default Purchase;
