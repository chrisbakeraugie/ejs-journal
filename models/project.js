const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },

  entries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entry' }]

},
  { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;