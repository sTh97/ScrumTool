const mongoose2 = require('mongoose');
const SchemaComparisonSchema = new mongoose2.Schema({
  project: { type: mongoose2.Schema.Types.ObjectId, ref: 'Project', required: true },
  leftSnapshot: { type: mongoose2.Schema.Types.ObjectId, ref: 'SchemaSnapshot', required: true },
  rightSnapshot: { type: mongoose2.Schema.Types.ObjectId, ref: 'SchemaSnapshot', required: true },
  leftLabel: { type: String, default: '' },
  rightLabel: { type: String, default: '' },
  diff: { type: Object, required: true },
  createdBy: { type: mongoose2.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String, default: '' }
}, { timestamps: true });
SchemaComparisonSchema.index({ project: 1, createdAt: -1 });
SchemaComparisonSchema.index({ leftLabel: 'text', rightLabel: 'text', notes: 'text' });
module.exports = mongoose2.model('SchemaComparison', SchemaComparisonSchema);