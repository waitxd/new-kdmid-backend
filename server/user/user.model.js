const Promise = require("bluebird");
const mongoose = require("mongoose");
const httpStatus = require("http-status");
const APIError = require("../helpers/APIError");

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  hash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.set('toJSON', { virtuals: true });

/**
 * Methods
 */
UserSchema.method({});

/**
 * @typedef User
 */
module.exports = mongoose.model("User", UserSchema);
