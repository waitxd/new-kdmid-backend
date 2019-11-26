
const mongoose = require("mongoose");
var CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 45000 }
});

/**
 * Methods
 */
CounterSchema.method({});

/**
 * Statics
 */
CounterSchema.statics = {
  /**
   * Get Counter
   * @param {ObjectId} id - The objectId of Counter.
   * @returns {Promise<Application, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then(counter => {
        if (counter) {
          return counter;
        }
        const err = new APIError("No such counter exists!", httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List counters in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of counters to be skipped.
   * @param {number} limit - Limit number of counters to be returned.
   * @returns {Promise<Application[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};
module.exports = mongoose.model('Counter', CounterSchema)
