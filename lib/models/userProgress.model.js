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