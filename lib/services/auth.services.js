const JWT = require("jsonwebtoken");
const { randomBytesGenerator, hash } = require("../utils/encrypt");
const User = require("../models/user.model");

/**
 * Authentication Service
 * 
 * Handles user authentication operations:
 * - User registration (signup)
 * - User login (signin)
 * - JWT token generation and verification
 * - Current user retrieval
 * 
 * Security:
 * - Passwords are hashed with unique salt per user
 * - JWT tokens expire after 7 days
 * - Passwords and salts never sent to frontend
 */

const JWT_SECRET = process.env.JWT_SECRET;

// Strict JWT secret validation
if (!JWT_SECRET || JWT_SECRET === "") {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

if (JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long for security");
}

if (JWT_SECRET === "your-secret-key-change-in-production") {
  throw new Error("JWT_SECRET is using default value. Change it in production!");
}

class AuthService {
  /**
   * Generate JWT token for authenticated user
   * Token contains user ID and role, expires in 7 days
   */
  static generateToken(user) {
    return JWT.sign(user, JWT_SECRET, { expiresIn: '7d' });
  }

  /**
   * User Registration Service
   * Creates new user account with free plan as default
   * Returns JWT token and safe user data (no password/salt)
   */
  static async signUpService(data) {
    const { firstName, lastName, email, password } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const salt = randomBytesGenerator(16);

    try {
      const user = await User.create({
        firstName,
        lastName,
        email,
        salt,
        password: hash(password, salt),
        package: "free",
        role: "user",
      });

      const token = AuthService.generateToken({
        _id: user._id,
        role: user.role,
      });
      return { token, user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } };
    } catch (err) {
      console.log("Error creating user:", err);
      throw new Error("Internal Server Error");
    }
  }

  /**
   * User Login Service
   * Validates credentials and returns JWT token
   * Uses hashed password comparison for security
   */
  static async signInService(data) {
    const { email, password } = data;
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    if (hash(password, user.salt) !== user.password) {
      throw new Error("Invalid Password or Email");
    }

    const token = AuthService.generateToken({
      _id: user._id,
      role: user.role,
    });

    return { token, user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } };
  }

  /**
   * Decode and verify JWT token
   * Returns payload if valid, false if invalid/expired
   */
  static decodeUserToken(token) {
    try {
      const payload = JWT.verify(token, JWT_SECRET);
      return payload;
    } catch (err) {
      return false;
    }
  }

  /**
   * Get Current User from Token
   * Validates token and returns full user object (excluding password/salt)
   * Includes package subscription details for paywall logic
   */
  static async getCurrentUser(token) {
    try {
      const decoded = JWT.verify(token, JWT_SECRET);
      const user = await User.findById(decoded._id).select('-password -salt');
      return user;
    } catch (err) {
      return null;
    }
  }
}

module.exports = AuthService;
