const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },

  description: {
    type: String,
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },

  entries: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Entry' 
  }]

},
  { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;