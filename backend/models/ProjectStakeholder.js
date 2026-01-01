const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProjectStakeholderSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  numbers: [{ type: String, trim: true }], // phone(s)
  designation: { type: String, trim: true },
  powerLevel: { type: Number, default: 0 }, // higher = more influence
  communicationWay: { type: String, enum: ['Email','Phone','Meeting','Chat','Mixed'], default: 'Mixed' },
  notes: { type: String, default: '' }
}, { timestamps: true });

ProjectStakeholderSchema.index({ projectId: 1, email: 1 }, { unique: false });

module.exports = mongoose.model('ProjectStakeholder', ProjectStakeholderSchema);