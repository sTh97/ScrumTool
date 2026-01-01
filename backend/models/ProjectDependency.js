const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Tracks a dependency/bottleneck affecting Plan items and/or Tasks with full status log.
 */
const STATUS = ['To Be Raised','Raised','Rejected','More Info Shared','Resolved','Parked'];

const LogSchema = new Schema({
  from: { type: String, default: '' },
  to: { type: String, enum: STATUS, required: true },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: String, default: '' },
  toWhom: [{ // when Raised or More Info Shared
    type: Schema.Types.ObjectId, refPath: 'toWhomModel'
  }],
  toWhomModel: { type: String, enum: ['User', 'ProjectStakeholder'], default: 'User' },
  changedAt: { type: Date, default: Date.now }
}, { _id: false });

const ProjectDependencySchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  planItemId: { type: Schema.Types.ObjectId, ref: 'ProjectPlanItem', default: null },
  taskId: { type: Schema.Types.ObjectId, ref: 'ProjectTask', default: null },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  occurredOn: { type: Date, required: true },
  targetResolveDate: { type: Date, default: null },
  status: { type: String, enum: STATUS, default: 'To Be Raised', index: true },
  log: [LogSchema]
}, { timestamps: true });

module.exports = mongoose.model('ProjectDependency', ProjectDependencySchema);
module.exports.STATUS = STATUS;