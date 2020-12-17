const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

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

  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]


},
  { timestamps: true });

userSchema.virtual('fullName').get(function () {
  return (`${this.name.first} ${this.name.last}`);
});

const User = mongoose.model('User', userSchema);

module.exports = User;