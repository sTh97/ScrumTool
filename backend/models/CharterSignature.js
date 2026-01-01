// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const CharterSignatureSchema = new Schema({
//   charterId: { type: Schema.Types.ObjectId, ref: 'ProjectCharter', required: true, index: true },
//   approverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   status: { type: String, enum: ['Pending','Approved','Rejected'], default: 'Pending' },
//   comment: { type: String, default: '' },
//   signedAt: { type: Date }
// }, { timestamps: true });

// CharterSignatureSchema.index({ charterId: 1, approverId: 1 }, { unique: true });

// module.exports = mongoose.model('CharterSignature', CharterSignatureSchema);

// models/CharterSignature.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const CharterSignatureSchema = new Schema(
  {
    charterId: {
      type: Schema.Types.ObjectId,
      ref: 'ProjectCharter',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Approved', 'Rejected'],
      required: true,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
    signedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// one signature per user per charter
CharterSignatureSchema.index({ charterId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('CharterSignature', CharterSignatureSchema);
