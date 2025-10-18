const { Schema, model, models } = require("mongoose");

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error", "update"],
      default: "info",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    actionRequired: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = models.Notification || model("Notification", notificationSchema);
module.exports = Notification;