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
      lowercase: true,
      validator: async function(value, isValid) {
        const self = this;
        return new Promise((res, rej) =>{
          self.constructor.findOne({email: value, _id: {$ne: this._id}})
              .then(data => {
                  if(data) {
                      res(false)
                  } else {
                      res(true)
                  }
              })
              .catch(err => {
                  res(false)
              })
        })
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
