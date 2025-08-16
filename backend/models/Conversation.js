const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["dm", "group"], required: true },
    name: { type: String }, // for group chats
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

ConversationSchema.index({ members: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model("Conversation", ConversationSchema);