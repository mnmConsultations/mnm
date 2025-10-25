/**
 * User Progress Model
 * 
 * Tracks task completion status and progress percentages per user
 * Auto-created on first dashboard access
 * 
 * Schema Fields:
 * @property {ObjectId} userId - Reference to User (unique, one progress record per user)
 * @property {number} overallProgress - Total completion percentage (0-100)
 * @property {object} categoryProgress - Per-category completion percentages (dynamic)
 *   - Keys are category ObjectIds (converted to string)
 *   - Values are completion percentages (0-100)
 *   - Automatically updates when categories are added/removed
 * @property {Array} completedTasks - List of completed task references with timestamps
 *   - taskId: Task ObjectId reference
 *   - completedAt: Completion timestamp
 * @property {string} packageType - Legacy field (use User.package instead)
 * @property {object} packageDetails - Legacy field (use User model)
 * 
 * Progress Calculation:
 * - Overall: (completed tasks / total active tasks) * 100
 * - Per-category: (completed in category / total in category) * 100
 * - Auto-recalculated on every task status update
 * 
 * Auto-creation:
 * - Created with 0% progress when user first accesses dashboard
 * - Includes user's current package details snapshot
 * 
 * Performance:
 * - Unique index on userId for fast lookups
 * - Denormalized progress percentages avoid frequent recalculation
 */
const { Schema, model, models } = require("mongoose");

const userProgressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    categoryProgress: {
      type: Schema.Types.Mixed,
      default: {},
    },
    completedTasks: [{
      taskId: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        required: true,
      },
      completedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    packageType: {
      type: String,
      enum: ["basic", "standard", "premium"],
      default: "basic",
    },
    packageDetails: {
      name: String,
      description: String,
      features: [String],
      price: Number,
    },
  },
  { 
    timestamps: true,
    id: false, // Disable virtual id getter
    toJSON: { virtuals: false },
    toObject: { virtuals: false }
  }
);

const UserProgress = models.UserProgress || model("UserProgress", userProgressSchema);
module.exports = UserProgress;