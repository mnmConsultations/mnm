/**
 * Category Model
 * 
 * Represents relocation journey phases that group related tasks
 * Categories organize the user's checklist into manageable sections
 * 
 * Schema Fields:
 * @property {ObjectId} _id - MongoDB auto-generated unique identifier
 * @property {string} name - Category name (max 100 chars)
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
 * - Cannot delete last category
 * - Cannot delete category with tasks
 * 
 * Default Categories:
 * - "Before Arrival"
 * - "Upon Arrival"
 * - "First Weeks"
 * - "Ongoing"
 */
const { Schema, model, models } = require("mongoose");

const categorySchema = new Schema(
  {
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
      enum: [
        '2-3 months before arrival',
        'Before departure',
        'First week',
        'First week in Germany',
        'First month',
        'First month in Germany',
        '1-3 months',
        '3-6 months',
        '6+ months',
        'Throughout your stay',
        'Ongoing'
      ],
    },
  },
  { 
    timestamps: true,
    id: false, // Disable virtual id getter
    toJSON: { virtuals: false },
    toObject: { virtuals: false }
  }
);

categorySchema.index({ order: 1 });
categorySchema.index({ isActive: 1 });

const Category = models.Category || model("Category", categorySchema);
module.exports = Category;