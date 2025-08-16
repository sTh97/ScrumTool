const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, trim: true },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // users @mentioned in this message
    meta: {
      deliveredAt: Date,
      readBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, at: Date }],
    },
  },
  { timestamps: true }
);

MessageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model("Message", MessageSchema);