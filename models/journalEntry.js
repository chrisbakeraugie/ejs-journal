const mongoose = require('mongoose');

const journalEntry = new mongoose.Schema({
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

});

const JournalEntry = mongoose.model('JournalEntry', journalEntry);

module.exports = JournalEntry;
