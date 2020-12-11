const mongoose = require('mongoose');

const entry = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true
  },

  writtenDate: {
    type: Date,
    required: true
  },

  tags: {
    type: [String]
  },

  // Link each entry with a project
  // project:{
  //   required: true
  // }

}, {timestamps: true});

const Entry = mongoose.model('entry', entry);

module.exports = Entry;
