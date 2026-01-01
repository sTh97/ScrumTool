const mongoose = require('mongoose');
const { Schema } = mongoose;

const TaskStatusHistorySchema = new Schema({
  taskId: { type: Schema.Types.ObjectId, ref: 'ProjectTask', required: true, index: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  note: { type: String, default: '' },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt: { type: Date, default: Date.now }
}, { timestamps: false });

module.exports = mongoose.model('TaskStatusHistory', TaskStatusHistorySchema);
