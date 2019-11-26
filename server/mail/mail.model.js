
const mongoose = require("mongoose");
const APIError = require("../helpers/APIError")
const httpStatus = require("http-status")
var MailSchema = new mongoose.Schema({
  country: { type: String, required: true },
  content: { type: String }
});

/**
 * Methods
 */
MailSchema.method({});

/**
 * Statics
 */
MailSchema.statics = {
  get(country) {
    return this.findOne({ country: new RegExp(country,"i") })
      .exec()
      .then(mail => {
        if (mail) {
          return mail;
        }
        const err = new APIError("No such mail template exists!", httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  list({ skip = 0, limit = 10 } = {}) {
    return this.find()
      .sort({ country: 1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },
};
module.exports = mongoose.model('Mail', MailSchema)
