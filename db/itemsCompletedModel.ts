import mongoose from "mongoose";

// Schema for tracking completed items
const itemsCompletedSchema = new mongoose.Schema(
  {
    serviceid: {
      type: String,
      required: true,
      index: true
    },
    chat_id: {
      type: String,
      required: true,
      index: true
    },
    item_id: {
      type: String,
      required: true,
      index: true
    },
    completed_at: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Create compound index for efficient lookups
itemsCompletedSchema.index({ serviceid: 1, chat_id: 1, item_id: 1 }, { unique: true });

// Export the model
export const ItemsCompleted = mongoose.models.ItemsCompleted || mongoose.model("ItemsCompleted", itemsCompletedSchema);
