/**
 * User Progress Model
 * 
 * Tracks task completion status and progress percentages per user
 * Auto-created on first dashboard access
 * 
 * Schema Fields:
 * @property {ObjectId} userId - Reference to User (unique, one progress record per user)
 * @property {number} overallProgress - Total completion percentage (0-100)
 * @property {object} categoryProgress - Per-category completion percentages
 *   - beforeArrival: Tasks before moving to Germany (0-100)
 *   - uponArrival: Tasks for arrival day/week (0-100)
 *   - firstWeeks: Tasks for initial settling period (0-100)
 *   - ongoing: Long-term maintenance tasks (0-100)
 * @property {Array} completedTasks - List of completed task IDs with timestamps
 *   - taskId: Task ID (string, matches Task.id)
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
      beforeArrival: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      uponArrival: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      firstWeeks: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      ongoing: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    completedTasks: [{
      taskId: {
        type: String,
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
  { timestamps: true }
);

const UserProgress = models.UserProgress || model("UserProgress", userProgressSchema);
module.exports = UserProgress;