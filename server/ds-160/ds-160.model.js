const Promise = require("bluebird");
const mongoose = require("mongoose");
const httpStatus = require("http-status");
const APIError = require("../helpers/APIError");
const Counter = require("../counter/counter.model");

/**
 * DS-160 Application Schema
 */
const DS160ApplicationSchema = new mongoose.Schema({
  app_id: {
    type: String
  },
  automation_status: {
    type: Object
  },
  email: {
    type: String,
    // required: true,
    // match: [
    //   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    //   "Please fill a valid email address"
    // ],
  },
  completed: {
    type: Boolean
  },
  step_index: {
    type: Number
  },
  data: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  transaction: {
    type: Object
  },
  checkout_result: {
    type: Object
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

// DS160ApplicationSchema.pre('save', function(next) {
//   var doc = this;
//   console.log('Create Mode: ', doc.create)
//   if(doc.create != true) {
//     return next();
//   }
//   Counter.findByIdAndUpdate({_id: 'DS160_AppID'}, {$inc: { seq: 1} }, {new: true, upsert: true}, function(error, counter)   {
//     var Doc = doc
//     if(error)
//       return next(error);
//     Doc.app_id = counter.seq;
//     next();
//   });
// });

/**
 * Methods
 */
DS160ApplicationSchema.method({});

/**
 * Statics
 */
DS160ApplicationSchema.statics = {
  /**
   * Get application
   * @param {ObjectId} id - The objectId of application.
   * @returns {Promise<Application, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then(application => {
        if (application) {
          return application;
        }
        const err = new APIError("No such application exists!", httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List applications in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of applications to be skipped.
   * @param {number} limit - Limit number of applications to be returned.
   * @returns {Promise<Application[]>}
   */
  list({ skip = 0, limit = 10 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef DS160Application
 */
module.exports = mongoose.model("DS160Application", DS160ApplicationSchema);
