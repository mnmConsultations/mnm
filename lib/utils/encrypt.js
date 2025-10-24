/**
 * Password Encryption Utility
 * 
 * Secure password hashing using Node.js crypto module
 * Uses PBKDF2 (Password-Based Key Derivation Function 2) with SHA-512
 * 
 * Security Features:
 * - PBKDF2: Industry-standard key derivation function
 * - SHA-512: Strong cryptographic hash algorithm
 * - Random salt: Prevents rainbow table attacks
 * - 1000 iterations: Slows brute-force attacks
 * - 64-byte output: Strong hash length
 * 
 * Functions:
 * 
 * randomBytesGenerator(length):
 * - Generates cryptographically secure random bytes
 * - Used for creating unique salts per user
 * - Returns hex-encoded string
 * 
 * hash(password, salt):
 * - Hashes password with salt using PBKDF2
 * - Iterations: 1000 (balance security vs performance)
 * - Output: 64-byte SHA-512 hash as hex string
 * 
 * Password Storage Flow:
 * 1. User signs up
 * 2. Generate random salt: randomBytesGenerator(16)
 * 3. Hash password: hash(password, salt)
 * 4. Store salt and hash in database (never plain password)
 * 
 * Password Verification Flow:
 * 1. User signs in
 * 2. Retrieve salt from database
 * 3. Hash input password: hash(inputPassword, storedSalt)
 * 4. Compare with stored hash (constant-time comparison)
 * 
 * Security Notes:
 * - Never log passwords or hashes
 * - Salt must be unique per user
 * - Store salt and hash separately in User model
 * - Use constant-time comparison to prevent timing attacks
 */
const crypto = require("crypto");

const randomBytesGenerator = (length) => {
  return crypto.randomBytes(length).toString("hex");
};

const hash = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
};

module.exports = {
  randomBytesGenerator,
  hash,
};
