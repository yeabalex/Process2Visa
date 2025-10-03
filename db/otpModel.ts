import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => Date.now() + 5 * 60 * 1000, // expires in 5 minutes
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// TTL index -> automatically deletes after expiration
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance method to verify and delete
otpSchema.methods.verifyAndDelete = async function (inputOtp: string) {
  if (this.expiresAt < new Date()) return false; // expired
  if (this.otp !== inputOtp) return false; // wrong OTP

  this.verified = true;
  await this.deleteOne(); // removes the document after successful verification
  return true;
};

const Otp = mongoose.models.Otp || mongoose.model("Otp", otpSchema);

export default Otp;