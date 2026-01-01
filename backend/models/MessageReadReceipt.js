const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageReadReceiptSchema = new Schema({
  messageId: { type: Schema.Types.ObjectId, ref: 'ProjectChatMessage', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  readAt: { type: Date, default: Date.now }
}, { timestamps: false });

MessageReadReceiptSchema.index({ messageId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('MessageReadReceipt', MessageReadReceiptSchema);
