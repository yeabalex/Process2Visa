import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    task: { type: String, required: true },
    completed: { type: Boolean, default: false },
    deadline: { type: Date }, // optional
  },
  { _id: false }
);

const stepSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // e.g., "research"
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed"],
      default: "not-started",
    },
    icon: { type: String },
    checklist: [checklistItemSchema],
    helpText: { type: String },
  },
  { _id: false }
);

const stepsSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service", 
      required: true,
    },
    steps: [stepSchema],
  },
  { timestamps: true }
);

const Steps = mongoose.models.Steps || mongoose.model("Steps", stepsSchema);

export default Steps;
