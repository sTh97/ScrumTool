const mongoose = require('mongoose');
const { Schema } = mongoose;

const STATUSES = ['New','In Progress','Hold','Completed','Re Opened'];

const ProjectTaskSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  assigneeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: STATUSES, default: 'New', index: true },
  priority: { type: String, enum: ['Low','Medium','High','Critical'], default: 'Medium' },
  startDate: { type: Date },
  dueDate: { type: Date },
  estimateHrs: { type: Number, default: 0 },
  actualHrs: { type: Number, default: 0 },
  dependencies: [{ type: Schema.Types.ObjectId, ref: 'ProjectTask' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('ProjectTask', ProjectTaskSchema);
