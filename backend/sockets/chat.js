module.exports = function attachChatSockets(io) {
  io.on("connection", (socket) => {
    // client calls join with each conversationId they belong to
    socket.on("conversation:join", (conversationId) => {
      if (!conversationId) return;
      socket.join(conversationId);
    });

    socket.on("disconnect", () => {});
  });
};