const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

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

  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],

  entries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entry' }]
  
},
  { timestamps: true });

userSchema.virtual('fullName').get(function () {
  return (`${this.name.first} ${this.name.middle} ${this.name.last}`);
});

/**
 * Implementation of passport local mongoose strategy.
 * The option "usernameField" configures passport to use
 * the email address and the username. It will handle password
 * salting and hashing itself.
 */
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  limitAttempts: true,
  maxAttempts: 10
});

const User = mongoose.model('User', userSchema);

module.exports = User;