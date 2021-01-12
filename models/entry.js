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

  project: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project' 
  },

  mood: {
    type: Number,
    min: [0,'No negative moods'],
    max: 100
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }

}, {timestamps: true});

const Entry = mongoose.model('Entry', entry);

module.exports = Entry;
