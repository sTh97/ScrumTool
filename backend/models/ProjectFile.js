const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProjectFileSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'ProjectTask', default: null },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ProjectFile', ProjectFileSchema);
