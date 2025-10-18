const { Schema, model, models } = require("mongoose");

const categorySchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    displayName: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    icon: {
      type: String, // Icon name or class
    },
    color: {
      type: String, // Color for UI theming
      default: "#3B82F6",
    },
    order: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    estimatedTimeFrame: {
      type: String, // e.g., "Before you arrive", "First week in Germany"
    },
  },
  { timestamps: true }
);

// Index for efficient queries
categorySchema.index({ order: 1 });
categorySchema.index({ isActive: 1 });

const Category = models.Category || model("Category", categorySchema);
module.exports = Category;