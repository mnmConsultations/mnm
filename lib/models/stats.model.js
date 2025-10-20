const { Schema, model, models } = require("mongoose");

const statsSchema = new Schema(
  {
    // Using a singleton pattern - there will only be one stats document
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
