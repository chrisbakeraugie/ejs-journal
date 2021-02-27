const mongoose = require('mongoose');

const confirmation = mongoose.Schema({

  name: {
    first: {
      type: String,
      required: true,
    },
    middle: {
      type: String,
    },
    last: {
      type: String,
      required: true
    }
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

},
  { timestamps: true });

confirmation.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

const Confirmation = mongoose.model('Confirmation', confirmation);

module.exports = Confirmation;