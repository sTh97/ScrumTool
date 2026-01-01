const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProjectPlanItemSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  type: { type: String, enum: ['Milestone','Phase','Deliverable'], default: 'Milestone' },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: Date,
  dueDate: Date,
  percentComplete: { type: Number, min: 0, max: 100, default: 0 },
  dependsOn: [{ type: Schema.Types.ObjectId, ref: 'ProjectPlanItem' }]
}, { timestamps: true });

module.exports = mongoose.model('ProjectPlanItem', ProjectPlanItemSchema);
