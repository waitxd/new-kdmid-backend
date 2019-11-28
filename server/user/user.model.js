const Promise = require("bluebird");
const mongoose = require("mongoose");
const httpStatus = require("http-status");
const APIError = require("../helpers/APIError");
const constants = require("../utils/constants")

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  role: { type: Number, required: true, default: constants.USER_ROLE.AGENCY },
  approved: { type: Boolean, required: true, default: false },
  hash: { type: String, required: true },
  email: {
    type: String,
    required: true,
    // match: [
    //   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    //   "Please fill a valid email address"
    // ],
    validate: {
      isAsync: true,
      lowercase: true,
      validator: function(value, isValid) {
        const self = this;
        return self.constructor
          .findOne({ email: value })
          .exec(function(err, user) {
            if (err) {
              throw err;
            } else if (user) {
              if (self.id === user.id) {
                // if finding and saving then it's valid even for existing email
                return isValid(true);
              }
              return isValid(false);
            } else {
              return isValid(true);
            }
          });
      },
      message: "The email address is already taken!"
    }
  },
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
