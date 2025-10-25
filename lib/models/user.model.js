const { Schema, model, models } = require("mongoose");

/**
 * User Model Schema
 * 
 * Represents registered users in the system (both regular users and admins)
 * Handles authentication, authorization, and subscription management
 * 
 * Fields:
 * - firstName/lastName: User's name
 * - email: Unique identifier for authentication (validated, lowercase, trimmed)
 * - phoneNumber: Optional Indian phone number format
 * - salt: Random string for password hashing security
 * - password: Hashed password (never sent to frontend)
 * - role: Access level (user or admin)
 * - package: Subscription tier (free, basic, plus) - default: free
 * - packageActivatedAt: When current package was activated
 * - packageExpiresAt: When current package expires (used for paywall logic)
 * 
 * Timestamps: createdAt, updatedAt (automatic)
 */
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    phoneNumber: {
      type: String,
      match: /^[6-9]\d{9}$/,
    },
    salt: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    package: {
      type: String,
      enum: ["free", "basic", "plus"],
      default: "free",
    },
    packageActivatedAt: {
      type: Date,
    },
    packageExpiresAt: {
      type: Date,
    },
    lastNotificationReadAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = models.User || model("User", userSchema);
module.exports = User;
