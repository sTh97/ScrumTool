const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProjectNoteSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now, index: true },
  text: { type: String, required: true, trim: true },
  files: [{
    name: String,
    path: String,
    size: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('ProjectNote', ProjectNoteSchema);
