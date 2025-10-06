import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  telegramChatId: { 
    type: String, 
    required: true, 
    unique: true
  },
  fullName: { type: String, trim: true },
  age: { type: Number, min: 0 },
  phoneNumber: String,
  email: { type: String, lowercase: true, trim: true },
  nationality: String,
  educationLevel: {
    type: String,
    enum: ["High School", "Diploma", "Bachelor", "Master", "PhD", "Other"]
  },
}, { timestamps: true });

const itemProgressSchema = new mongoose.Schema(
  {
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const completedItemsSchema = new mongoose.Schema(
  {
    item_id: { type: String, required: true, index: true },
    chat_id: { type: String, required: true, index: true },
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
    completed_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const userProgressSchema = new mongoose.Schema(
  {
    chat_id: { type: String, required: true, index: true },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    progress: {
      type: Map,
      of: {
        type: Map,
        of: Boolean, // courseProgressId -> moduleId -> itemId -> completed
      },
      default: {},
    },
    completedItems: [completedItemsSchema], // Store completed items for this service
  },
  { timestamps: true }
);

const contentSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    blocks: { type: Array, default: [] },
    deadline: String,
    points: String,
    status: String,
  },
  { _id: false }
);

const courseItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["video", "reading", "assignment", "quiz", "lab"],
      required: true,
    },
    completed: { type: Boolean, default: false },
    duration: String,
    description: String,
    content: contentSchema,
    deadline: String,
    points: String,
    status: String,
  },
  { _id: false }
);
const courseModuleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    expanded: { type: Boolean, default: false },
    items: { type: [courseItemSchema], default: [] },
  },
  { _id: false }
);

// Define course progress schema
const courseProgressSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    progress: { type: Number, default: 0 }, // Progress percentage for this progress instance
    modules: { type: [courseModuleSchema], default: [] },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Define course schema
const courseSchema = new mongoose.Schema(
  {
    progress: { type: Number, required: true },
    country: { type: String, required: true },
    service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
    module: { type: [courseModuleSchema], default: [] },
  },
  { timestamps: true }
);

// ✅ Use existing models if they exist to avoid OverwriteModelError
export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const UserCourses = mongoose.models.UserCourses || mongoose.model("UserCourses", courseSchema);
export const UserProgress = mongoose.models.UserProgress || mongoose.model("UserProgress", userProgressSchema);
export const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);
export const CompletedItems = mongoose.models.CompletedItems || mongoose.model("CompletedItems", completedItemsSchema);
