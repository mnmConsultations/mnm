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
