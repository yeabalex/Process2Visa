import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    telegramUsername: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: true,
      enum: ["general", "visa", "technical", "booking", "billing", "other"],
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    ticketId: {
      type: String,
      unique: true,
      required: true,
    },
    assignedTo: {
      type: String,
      default: "",
    },
    resolution: {
      type: String,
      default: "",
    },
    resolvedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Add indexes for better query performance
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ category: 1 });
supportTicketSchema.index({ createdAt: -1 });
supportTicketSchema.index({ phoneNumber: 1 });
supportTicketSchema.index({ ticketId: 1 });

const SupportTicket = mongoose.models.SupportTicket || mongoose.model("SupportTicket", supportTicketSchema);

export default SupportTicket;
