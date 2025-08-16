// const Conversation = require("../models/Conversation");
// const Message = require("../models/Message");
// const User = require("../models/User");
// const mongoose = require("mongoose");
// const { sendIntimation } = require("../services/emailService");

// // naive mention extractor: "@name" -> match users by name or email prefix
// function extractMentions(text) {
//   const matches = text.match(/@([\w.-]+)/g) || [];
//   return matches.map(m => m.slice(1).toLowerCase());
// }

// exports.searchUsers = async (req, res) => {
//   const q = (req.query.q || "").trim();
//   const me = req.user.id;
//   const filter = q
//     ? { _id: { $ne: me }, $or: [ { name: new RegExp(q, "i") }, { email: new RegExp(q, "i") } ] }
//     : { _id: { $ne: me } };
//   const users = await User.find(filter).select("name email").limit(20);
//   res.json(users);
// };

// exports.listConversations = async (req, res) => {
//   const me = req.user.id;
//   const list = await Conversation.find({ members: me })
//     .sort({ lastMessageAt: -1 })
//     .select("type name members lastMessageAt")
//     .populate("members", "name email");
//   res.json(list);
// };

// exports.createConversation = async (req, res) => {
//   const { type, memberIds, name } = req.body;
//   const me = req.user.id;
//   const members = [...new Set([me, ...memberIds.filter(Boolean)])];

//   // prevent duplicate DM
//   if (type === "dm" && members.length === 2) {
//     const existing = await Conversation.findOne({ type: "dm", members: { $all: members, $size: 2 } });
//     if (existing) return res.json(existing);
//   }

//   const convo = await Conversation.create({ type, name, members, createdBy: me, lastMessageAt: new Date() });
//   res.status(201).json(convo);
// };

// exports.getMessages = async (req, res) => {
//   const me = req.user.id;
//   const { id } = req.params;
//   const ok = await Conversation.exists({ _id: id, members: me });
//   if (!ok) return res.status(403).json({ message: "Not allowed" });
//   const msgs = await Message.find({ conversation: id }).sort({ createdAt: -1 }).limit(50)
//     .populate("sender", "name email").populate("mentions", "name email");
//   res.json(msgs.reverse());
// };

// exports.postMessage = async (req, res) => {
//   const me = req.user.id;
//   const { id } = req.params;
//   const { body } = req.body;

//   const convo = await Conversation.findOne({ _id: id, members: me }).populate("members", "name email _id");
//   if (!convo) return res.status(403).json({ message: "Not allowed" });

//   // mentions
//   const handles = extractMentions(body);
//   let mentionUsers = [];
//   if (handles.length) {
//     // match within conversation members first
//     const candidates = convo.members;
//     mentionUsers = candidates.filter(u => {
//       const h1 = (u.name || "").toLowerCase().replace(/\s+/g, "");
//       const h2 = (u.email || "").toLowerCase();
//       return handles.some(h => h === h1 || h2.startsWith(h));
//     });
//   }

//   const msg = await Message.create({ conversation: id, sender: me, body, mentions: mentionUsers.map(u => u._id) });
//   convo.lastMessageAt = new Date();
//   await convo.save();

//   // Email rules:
//   // - DM: email the other participant
//   // - Group: email only mentioned users
//   const recipients = [];
//   if (convo.type === "dm") {
//     recipients.push(...convo.members.filter(u => u._id.toString() !== me.toString()));
//   } else if (mentionUsers.length) {
//     recipients.push(...mentionUsers);
//   }

//   // Fire and forget mails (no await per recipient to keep response snappy)
//   const subject = `[ActionLoop] New message in ${convo.type === "dm" ? "Direct Chat" : convo.name || "Group"}`;
//   const meta = { conversationId: id, sender: me };
//   for (const r of recipients) {
//     const html = `<p>Hi ${r.name || "there"},</p><p>You have a new message in ActionLoop.</p><blockquote>${body}</blockquote>`;
//     sendIntimation({ to: r.email, subject, html, meta: { ...meta, recipient: r._id.toString() } });
//   }

//   // Emit socket event
//   req.io.to(id).emit("message:new", {
//     _id: msg._id,
//     conversation: id,
//     sender: { _id: req.user.id, name: req.user.name, email: req.user.email },
//     body,
//     mentions: mentionUsers.map(u => ({ _id: u._id, name: u.name, email: u.email })),
//     createdAt: msg.createdAt,
//   });

//   res.status(201).json(msg);
// };

// controllers/chatController.js
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const mongoose = require("mongoose");
const { sendIntimation } = require("../services/emailService");

function extractMentions(text) {
  const matches = text.match(/@([\w.-]+)/g) || [];
  return matches.map((m) => m.slice(1).toLowerCase());
}

exports.searchUsers = async (req, res) => {
  const q = (req.query.q || "").trim();
  const me = req.user.id;
  const filter = q
    ? { _id: { $ne: me }, $or: [ { name: new RegExp(q, "i") }, { email: new RegExp(q, "i") } ] }
    : { _id: { $ne: me } };
  const users = await User.find(filter).select("name email").limit(20);
  res.json(users);
};

exports.listConversations = async (req, res) => {
  const me = req.user.id;
  const list = await Conversation.find({ members: me })
    .sort({ lastMessageAt: -1 })
    .select("type name members lastMessageAt createdBy")          // include createdBy for UI permissions
    .populate("members", "name email")
    .populate("createdBy", "name email");
  res.json(list);
};

exports.createConversation = async (req, res) => {
  const { type, memberIds, name } = req.body;
  const me = req.user.id;
  const members = [...new Set([me, ...memberIds.filter(Boolean)])];

  if (type === "dm" && members.length === 2) {
    const existing = await Conversation.findOne({ type: "dm", members: { $all: members, $size: 2 } })
      .populate("members", "name email")
      .populate("createdBy", "name email");
    if (existing) return res.json(existing);
  }

  const convo = await Conversation.create({ type, name, members, createdBy: me, lastMessageAt: new Date() });
  await convo.populate("members", "name email");
  await convo.populate("createdBy", "name email");
  res.status(201).json(convo);
};

exports.getMessages = async (req, res) => {
  const me = req.user.id;
  const { id } = req.params;
  const ok = await Conversation.exists({ _id: id, members: me });
  if (!ok) return res.status(403).json({ message: "Not allowed" });
  const msgs = await Message.find({ conversation: id }).sort({ createdAt: 1 })
    .populate("sender", "name email")
    .populate("mentions", "name email");
  res.json(msgs);
};

exports.postMessage = async (req, res) => {
  const me = req.user.id;
  const { id } = req.params;
  const { body } = req.body;

  const convo = await Conversation.findOne({ _id: id, members: me })
    .populate("members", "name email _id type");
  if (!convo) return res.status(403).json({ message: "Not allowed" });

  // mentions
  const handles = extractMentions(body);
  let mentionUsers = [];
  if (handles.length) {
    const candidates = convo.members;
    mentionUsers = candidates.filter((u) => {
      const h1 = (u.name || "").toLowerCase().replace(/\s+/g, "");
      const h2 = (u.email || "").toLowerCase();
      return handles.some((h) => h === h1 || h2.startsWith(h));
    });
  }

  const msg = await Message.create({ conversation: id, sender: me, body, mentions: mentionUsers.map((u) => u._id) });
  convo.lastMessageAt = new Date();
  await convo.save();

  // email recipients
  const recipients = [];
  if (convo.type === "dm") {
    recipients.push(...convo.members.filter((u) => u._id.toString() !== me.toString()));
  } else if (mentionUsers.length) {
    recipients.push(...mentionUsers);
  }

  const subject = `[ActionLoop] New message in ${convo.type === "dm" ? "Direct Chat" : convo.name || "Group"}`;
  const meta = { conversationId: id, sender: me };
  for (const r of recipients) {
    const html = `<p>Hi ${r.name || "there"},</p><p>You have a new message in ActionLoop.</p><blockquote>${body}</blockquote>`;
    sendIntimation({ to: r.email, subject, html, meta: { ...meta, recipient: r._id.toString() } });
  }

  // Emit socket event
  req.io.to(id).emit("message:new", {
    _id: msg._id,
    conversation: id,
    sender: { _id: req.user.id, name: req.user.name, email: req.user.email },
    body,
    mentions: mentionUsers.map((u) => ({ _id: u._id, name: u.name, email: u.email })),
    createdAt: msg.createdAt,
  });

  res.status(201).json(msg);
};

// NEW: add members (any group member can add)
exports.addMembers = async (req, res) => {
  const me = req.user.id;
  const { id } = req.params;
  const { add = [] } = req.body;

  const convo = await Conversation.findById(id);
  if (!convo) return res.status(404).json({ message: "Conversation not found" });
  if (convo.type !== "group") return res.status(400).json({ message: "Only groups support member updates" });

  const isMember = convo.members.map((m) => String(m)).includes(String(me));
  if (!isMember) return res.status(403).json({ message: "Only members can add new participants" });

  const toAdd = add.filter(Boolean).map((x) => new mongoose.Types.ObjectId(x));
  const set = new Set(convo.members.map((m) => String(m)));
  toAdd.forEach((u) => set.add(String(u)));
  convo.members = Array.from(set);
  await convo.save();

  const updated = await Conversation.findById(id)
    .select("type name members lastMessageAt createdBy")
    .populate("members", "name email")
    .populate("createdBy", "name email");

  res.json(updated);
};

// NEW: delete group (only creator)
exports.deleteConversation = async (req, res) => {
  const me = req.user.id;
  const { id } = req.params;

  const convo = await Conversation.findById(id);
  if (!convo) return res.status(404).json({ message: "Conversation not found" });
  if (convo.type !== "group") return res.status(400).json({ message: "Only groups can be deleted" });

  if (String(convo.createdBy) !== String(me)) {
    return res.status(403).json({ message: "Only the group creator can delete this conversation" });
  }

  await Message.deleteMany({ conversation: id });
  await Conversation.deleteOne({ _id: id });

  // inform online members
  req.io.to(id).emit("conversation:deleted", { conversation: id });

  res.json({ ok: true });
};
