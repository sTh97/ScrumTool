const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProjectChatMessageSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true },
  files: [{
    name: String,
    path: String,
    size: Number
  }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: false });

module.exports = mongoose.model('ProjectChatMessage', ProjectChatMessageSchema);
