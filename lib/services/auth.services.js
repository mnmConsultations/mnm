const JWT = require("jsonwebtoken");
const { randomBytesGenerator, hash } = require("../utils/encrypt");
const User = require("../models/user.model");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

if (!JWT_SECRET || JWT_SECRET === "") {
  throw new Error("JWT_SECRET is not defined");
}

class AuthService {
  static generateToken(user) {
    return JWT.sign(user, JWT_SECRET, { expiresIn: '7d' });
  }

  static async signUpService(data) {
    const { firstName, lastName, email, password } = data;

    // Check if user already exists
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

  static decodeUserToken(token) {
    try {
      const payload = JWT.verify(token, JWT_SECRET);
      return payload;
    } catch (err) {
      return false;
    }
  }

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
