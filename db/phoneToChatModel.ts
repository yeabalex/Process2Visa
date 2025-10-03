import mongoose from "mongoose";

const phoneChatSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true, // ensures no duplicate phone numbers
      trim: true,
    },
    chatId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // optional: adds createdAt & updatedAt fields
  }
);

// Create a unique index explicitly (recommended)
phoneChatSchema.index({ phoneNumber: 1 }, { unique: true });

const PhoneChat = mongoose.models.PhoneChat || mongoose.model("PhoneChat", phoneChatSchema);

export default PhoneChat;
