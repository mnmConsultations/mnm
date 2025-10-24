/**
 * Category Model
 * 
 * Represents relocation journey phases that group related tasks
 * Categories organize the user's checklist into manageable sections
 * 
 * Schema Fields:
 * @property {string} id - Unique camelCase identifier (auto-generated from displayName)
 * @property {string} name - Internal name (same as id, legacy field)
 * @property {string} displayName - User-facing label shown in UI (max 100 chars)
 * @property {string} description - Category explanation (max 500 chars)
 * @property {string} icon - Icon name for visual identification
 * @property {string} color - Hex color code for UI theming (default: #3B82F6)
 * @property {number} order - Display order in dashboard (managed by admin)
 * @property {boolean} isActive - Soft delete flag (hidden categories)
 * @property {string} estimatedTimeFrame - Human-readable phase duration (e.g. "First week in Germany")
 * 
 * Indexes:
 * - (order): Fast sorted retrieval for dashboard display
 * - (isActive): Filter hidden categories efficiently
 * 
 * Business Rules:
 * - Max 6 categories total
 * - ID auto-regenerates when displayName changes
 * - Cannot delete last category
 * - Cannot delete category with tasks
 * - Cascading update: ID changes propagate to all tasks
 * 
 * Default Categories:
 * - beforeArrival: "Before Arrival"
 * - uponArrival: "Upon Arrival"
 * - firstWeeks: "First Weeks"
 * - ongoing: "Ongoing"
 */
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
      type: String,
    },
    color: {
      type: String,
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
      type: String,
    },
  },
  { timestamps: true }
);

categorySchema.index({ order: 1 });
categorySchema.index({ isActive: 1 });

const Category = models.Category || model("Category", categorySchema);
module.exports = Category;