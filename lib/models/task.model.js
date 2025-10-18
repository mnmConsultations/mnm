const { Schema, model, models } = require("mongoose");

const taskSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["beforeArrival", "uponArrival", "firstWeeks", "ongoing"],
    },
    order: {
      type: Number,
      required: true,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    estimatedDuration: {
      type: String, // e.g., "2-3 days", "1 week"
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    externalLinks: [{
      title: String,
      url: String,
      description: String,
    }],
    tips: [String],
    requirements: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
taskSchema.index({ category: 1, order: 1 });
taskSchema.index({ isActive: 1 });

const Task = models.Task || model("Task", taskSchema);
module.exports = Task;