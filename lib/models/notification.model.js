/**
 * Notification Model
 * 
 * User notifications system for important updates and alerts
 * Displayed in user dashboard notification center
 * 
 * Schema Fields:
 * @property {ObjectId} userId - Reference to User receiving notification
 * @property {string} title - Notification heading (max 100 chars)
 * @property {string} message - Notification content (max 500 chars)
 * @property {string} type - Visual style: info | success | warning | error | update
 * @property {boolean} isRead - Mark as read flag (default: false)
 * @property {string} priority - Importance level: low | medium | high
 * @property {boolean} actionRequired - Flag for notifications requiring user action
 * @property {string} actionUrl - Optional link for actionable notifications
 * @property {Date} expiresAt - Auto-hide date for time-sensitive notifications
 * 
 * Indexes:
 * - (userId, createdAt desc): Fast retrieval of user's recent notifications
 * - (userId, isRead): Filter unread notifications efficiently
 * 
 * Use Cases:
 * - Package expiry warnings
 * - New feature announcements
 * - System maintenance alerts
 * - Task deadline reminders
 * - Admin messages
 * 
 * Features:
 * - Time-based expiry for temporary announcements
 * - Priority-based display sorting
 * - Action links for interactive notifications
 */
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
    metadata: {
      type: {
        entityType: String, // 'task' or 'category'
        entityId: String, // task/category ID
        action: String, // 'created', 'updated', 'deleted'
        changes: [String], // list of what changed
      },
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ "metadata.entityType": 1, "metadata.entityId": 1, "metadata.action": 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // TTL index for 7 days

const Notification = models.Notification || model("Notification", notificationSchema);
module.exports = Notification;