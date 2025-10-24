/**
 * Stats Model
 * 
 * Global application statistics (Singleton pattern)
 * Only one document exists with _id='global-stats'
 * 
 * Schema Fields:
 * @property {string} _id - Fixed ID 'global-stats' (singleton pattern)
 * @property {number} paidUserCount - Count of users with active paid plans
 * @property {Date} lastUpdated - Last stats update timestamp
 * 
 * Singleton Pattern:
 * - Single document for all global stats
 * - Auto-created if missing
 * - Always use _id='global-stats'
 * 
 * Performance Benefits:
 * - O(1) lookup by fixed ID
 * - Avoids expensive COUNT(*) queries on Users collection
 * - Cached value updated on package changes only
 * 
 * Updates:
 * - Incremented when user upgrades to paid plan
 * - Decremented when user downgrades to free or expires
 * - Updated by PATCH /api/admin/users/[id]
 * 
 * Future Extensions:
 * Can add more fields like:
 * - totalTasksCreated
 * - totalCategoriesCreated
 * - averageProgress
 * - monthlyActiveUsers
 */
const { Schema, model, models } = require("mongoose");

const statsSchema = new Schema(
  {
    _id: {
      type: String,
      default: 'global-stats',
    },
    paidUserCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Stats = models.Stats || model("Stats", statsSchema);
module.exports = Stats;
