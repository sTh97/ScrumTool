// File: src/components/chat/ChatWidget.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  listConversations,
  getMessages,
  sendMessage,
  createConversation,
  fetchUsers,
  addMembers,
  deleteConversation,
} from "../../api/chatApi";
import { useAuth } from "../../context/AuthContext";

// Socket host (point to API)
const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  (window.location.hostname.includes("localhost")
    ? "http://localhost:5000"
    : "http://api.al.3em.tech");

// Debounce helper
function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function ChatWidget() {
  const { user } = useAuth();
  const myId = String(user?.id || user?._id || "");

  const [open, setOpen] = useState(true);

  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);

  const [showNewChat, setShowNewChat] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  // de-dupe guard for socket echoes
  const msgIdSetRef = useRef(new Set());

  // draggable state (persist)
  const [drag, setDrag] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("chat-pos")) || { x: 24, y: 24 };
    } catch {
      return { x: 24, y: 24 };
    }
  });

  const socketRef = useRef(null);
  const widgetRef = useRef(null);
  const msgsEndRef = useRef(null); // anchor for scroll-to-bottom

  // connect socket once
  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = s;

    // handle conversation deletion broadcasts
    const onDeleted = (payload) => {
      const id = payload?.conversation;
      if (!id) return;
      setConversations((prev) => prev.filter((c) => String(c._id) !== String(id)));
      if (String(active?._id) === String(id)) {
        setActive(null);
        setMessages([]);
      }
    };
    s.on("conversation:deleted", onDeleted);

    return () => {
      s.off("conversation:deleted", onDeleted);
      s.close();
    };
  }, [active?._id]);

  // load conversations once
  useEffect(() => {
    listConversations()
      .then((r) => setConversations(r.data || []))
      .catch(() => {});
  }, []);

  // join active room + receive new messages (de-duped)
  // useEffect(() => {
  //   if (!socketRef.current || !active?._id) return;
  //   socketRef.current.emit("conversation:join", active._id);

  //   const handler = (msg) => {
  //     if (msg.conversation !== active._id) return;
  //     const id = String(msg._id || "");
  //     if (!id || msgIdSetRef.current.has(id)) return;
  //     msgIdSetRef.current.add(id);
  //     setMessages((prev) => [...prev, msg]);
  //   };

  //   socketRef.current.on("message:new", handler);
  //   return () => socketRef.current?.off("message:new", handler);
  // }, [active]);

  useEffect(() => {
  if (!socketRef.current || !active?._id) return;
  socketRef.current.emit("conversation:join", active._id);

  const handler = (msg) => {
    if (msg.conversation !== active._id) return;
    const id = String(msg._id || "");
    if (!id || msgIdSetRef.current.has(id)) return;
    msgIdSetRef.current.add(id);
    setMessages((prev) => [...prev, msg]);

    // keep list ordered by recent activity
    setConversations((prev) => {
      const updated = prev.map((c) =>
        String(c._id) === String(active._id)
          ? { ...c, lastMessageAt: msg.createdAt || new Date().toISOString() }
          : c
      );
      updated.sort((a, b) =>
        new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt)
      );
      return updated;
    });
  };

  socketRef.current.on("message:new", handler);
  return () => socketRef.current?.off("message:new", handler);
}, [active]);


  // open conversation
  async function openConvo(c) {
    setActive(c);
    try {
      const r = await getMessages(c._id);
      const arr = r.data || [];
      msgIdSetRef.current = new Set(arr.map((m) => String(m._id)));
      setMessages(arr);
      setTimeout(scrollToBottom, 0);
    } catch {
      msgIdSetRef.current = new Set();
      setMessages([]);
    }
    setOpen(true);
  }

  // send (socket will deliver the final copy; we only clear)
  // async function handleSend() {
  //   const text = draft.trim();
  //   if (!text || !active) return;
  //   try {
  //     await sendMessage(active._id, text);
  //     setDraft("");
  //   } catch (e) {
  //     console.error("sendMessage error", e);
  //   }
  // }

  async function handleSend() {
  const text = draft.trim();
  if (!text || !active) return;
  try {
    // POST the message and use the server's _id to append immediately
    const r = await sendMessage(active._id, text);
    const posted = r.data;

    // build a local, fully-populated message (so it renders the sender name)
    const localMsg = {
      _id: String(posted._id),
      conversation: active._id,
      sender: { _id: myId, name: user.name, email: user.email },
      body: text,
      mentions: posted.mentions || [],
      createdAt: posted.createdAt || new Date().toISOString(),
    };

    // de-dupe: record the id before adding so socket echo is ignored
    msgIdSetRef.current.add(localMsg._id);

    // append and scroll
    setMessages((prev) => [...prev, localMsg]);
    setDraft("");
    setTimeout(scrollToBottom, 0);

    // bump this conversation's timestamp in the left list (optional nicety)
    setConversations((prev) => {
      const updated = prev.map((c) =>
        String(c._id) === String(active._id)
          ? { ...c, lastMessageAt: localMsg.createdAt }
          : c
      );
      // move active convo to top
      updated.sort((a, b) =>
        new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt)
      );
      return updated;
    });
  } catch (e) {
    console.error("sendMessage error", e);
  }
}


  // auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  function scrollToBottom() {
    try {
      msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {}
  }

  // @mentions -> members (excluding me)
  const members = useMemo(() => {
    const list = (active?.members || []).filter((m) => String(m._id) !== myId);
    return list;
  }, [active, myId]);

  useEffect(() => {
    const at = draft.lastIndexOf("@");
    if (at === -1) {
      setShowSuggest(false);
      return;
    }
    const token = draft.slice(at + 1);
    const low = (token || "").toLowerCase().trim();

    const filtered =
      !low.length
        ? members
        : members.filter(
            (m) =>
              ((m?.name || "").toLowerCase().includes(low)) ||
              ((m?.email || "").toLowerCase().startsWith(low))
          );

    setSuggestions(filtered);
    setShowSuggest(filtered.length > 0);
  }, [draft, members]);

  function applyMention(u) {
    // robust handling even if name/email missing
    const handleSource = (u?.name && String(u.name).trim().length > 0)
      ? String(u.name)
      : String(u?.email || "");
    const safeHandle = handleSource.toLowerCase().replace(/\s+/g, "");
    const at = draft.lastIndexOf("@");
    if (at === -1) return;
    const before = draft.slice(0, at + 1);
    const after = draft.slice(at + 1);
    const rest = after.replace(/^[^\s]*/, ""); // remove current token
    setDraft(before + safeHandle + " " + rest);
    setShowSuggest(false);
  }

  // DM label shows "other" user
  function convoLabel(c) {
    if (c.type === "group") return c.name || "Group";
    const other = (c.members || []).find((m) => String(m._id) !== myId);
    return other?.name || other?.email || "Direct";
  }

  const iAmCreator = useMemo(() => {
    if (!active || !active.createdBy) return false;
    const creator = String(active.createdBy._id || active.createdBy);
    return creator === myId;
  }, [active, myId]);

  // draggable
  useEffect(() => {
    const el = widgetRef.current;
    if (!el) return;
    let startX = 0, startY = 0, origX = drag.x, origY = drag.y, dragging = false;
    const header = el.querySelector(".drag-handle");

    const onDown = (e) => { dragging = true; startX = e.clientX; startY = e.clientY; origX = drag.x; origY = drag.y; e.preventDefault(); };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      const nx = Math.max(8, origX + dx), ny = Math.max(8, origY + dy);
      setDrag({ x: nx, y: ny });
    };
    const onUp = () => {
      if (dragging) { dragging = false; localStorage.setItem("chat-pos", JSON.stringify(drag)); }
    };

    header?.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      header?.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag.x, drag.y]);

  // when a new convo is created from modal
  const handleCreatedConversation = (convo) => {
    setConversations((prev) => {
      const exists = prev.some((c) => String(c._id) === String(convo._id));
      return exists ? prev : [convo, ...prev];
    });
    setShowNewChat(false);
    openConvo(convo);
  };

  // after adding members, refresh active & list
  const integrateUpdatedConvo = (convo) => {
    setConversations((prev) =>
      prev.map((c) => (String(c._id) === String(convo._id) ? convo : c))
    );
    if (active && String(active._id) === String(convo._id)) {
      setActive(convo);
    }
  };

  return (
    <div
      ref={widgetRef}
      style={{ position: "fixed", right: drag.x, bottom: drag.y, zIndex: 9999 }}
    >
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full shadow-xl drag-handle bg-red-600 text-white p-3 hover:bg-red-700 focus:outline-none"
        >
          💬
        </button>
      )}

      {open && (
        <div className="w-[360px] h-[520px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col">
          {/* Header (fixed) */}
          <div className="drag-handle flex-shrink-0 cursor-move select-none bg-gray-900 text-white px-3 py-2 flex items-center justify-between relative">
            <span className="font-semibold text-sm">ActionLoop Chat</span>
            <div className="flex items-center gap-2">
              {/* New chat */}
              <button
                title="New chat"
                onClick={() => setShowNewChat(true)}
                className="text-white/90 hover:text-white text-lg leading-none"
              >
                +
              </button>

              {/* Group menu (add members / delete) */}
              {active?.type === "group" && (
                <div className="relative">
                  <button
                    onClick={() => setHeaderMenuOpen((v) => !v)}
                    className="text-white/90 hover:text-white px-2"
                    title="Group options"
                  >
                    ⋯
                  </button>

                  {headerMenuOpen && (
                    <div className="absolute right-0 mt-1 bg-white text-gray-800 rounded-md shadow-lg border z-[60] min-w-[160px]">
                      <button
                        onClick={() => { setShowAddMembers(true); setHeaderMenuOpen(false); }}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                      >
                        Add members
                      </button>
                      {iAmCreator && (
                        <button
                          onClick={() => { setShowDeleteConfirm(true); setHeaderMenuOpen(false); }}
                          className="block w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-red-600"
                        >
                          Delete group
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setOpen(false)}
                className="text-gray-300 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body (fills remaining height) */}
          <div className="flex-1 overflow-hidden flex">
            {/* Left list (own scrollbar) */}
            <div className="w-[130px] flex-shrink-0 border-r border-gray-200 overflow-y-auto">
              {conversations.length === 0 && (
                <div className="p-3 text-xs text-gray-500">
                  No conversations
                  <button
                    className="block mt-2 w-full border rounded-md py-1 text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowNewChat(true)}
                  >
                    Start a chat
                  </button>
                </div>
              )}
              {conversations.map((c) => (
                <button
                  key={c._id}
                  onClick={() => openConvo(c)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                    active?._id === c._id ? "bg-gray-100" : ""
                  }`}
                >
                  <div className="font-medium truncate">{convoLabel(c)}</div>
                  <div className="text-[11px] text-gray-500">
                    {new Date(c.lastMessageAt || c.updatedAt).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>

            {/* Right side (messages + fixed composer) */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Scrollable messages area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {!active && (
                  <div className="text-center text-sm text-gray-500 mt-6">
                    Select a conversation
                  </div>
                )}
                {active &&
                  messages.map((m) => {
                    const mine = String(m.sender?._id) === myId;
                    return (
                      <div
                        key={m._id}
                        className={`max-w-[80%] ${mine ? "ml-auto text-right" : ""}`}
                      >
                        <div className="text-[11px] text-gray-500">
                          {m.sender?.name || m.sender?.email}
                        </div>
                        <div
                          className={`inline-block px-3 py-2 rounded-2xl border ${
                            mine
                              ? "bg-gray-900 text-white border-gray-900"
                              : "bg-white text-gray-900 border-gray-200"
                          }`}
                        >
                          {m.body}
                        </div>
                      </div>
                    );
                  })}
                <div ref={msgsEndRef} />
              </div>

              {/* Fixed composer */}
              {active && (
                <div className="relative flex-shrink-0 p-2 border-t border-gray-200">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={2}
                    placeholder="Type a message… Use @ to mention"
                    className="w-full resize-none rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 p-2 text-sm"
                  />
                  {showSuggest && suggestions.length > 0 && (
                    <div className="absolute bottom-16 left-2 right-2 bg-white shadow-xl border border-gray-200 rounded-xl max-h-40 overflow-auto z-50">
                      {suggestions.filter(Boolean).map((u) => (
                        <button
                          key={u._id}
                          onClick={() => applyMention(u)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          <div className="font-medium">{u?.name || "(no name)"}</div>
                          <div className="text-[11px] text-gray-500">{u?.email || ""}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleSend}
                      className="px-3 py-1.5 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreated={handleCreatedConversation}
        />
      )}

      {showAddMembers && active?.type === "group" && (
        <AddMembersModal
          conversation={active}
          onClose={() => setShowAddMembers(false)}
          onAdded={(convo) => { setShowAddMembers(false); integrateUpdatedConvo(convo); }}
        />
      )}

      {showDeleteConfirm && active?.type === "group" && (
        <ConfirmDeleteModal
          conversation={active}
          onClose={() => setShowDeleteConfirm(false)}
          onDeleted={() => {
            setShowDeleteConfirm(false);
            setConversations((prev) => prev.filter((c) => String(c._id) !== String(active._id)));
            setActive(null);
            setMessages([]);
          }}
        />
      )}
    </div>
  );
}

/* ---------- New Chat Modal ---------- */
function NewChatModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const myId = String(user?.id || user?._id || "");
  const [mode, setMode] = useState("dm"); // 'dm' | 'group'
  const [q, setQ] = useState("");
  const debouncedQ = useDebounced(q, 300);

  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]); // userIds
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    let ok = true;
    fetchUsers(debouncedQ)
      .then((r) => {
        if (!ok) return;
        const list = (r.data || []).filter((u) => String(u._id) !== myId);
        setResults(list);
      })
      .catch(() => setResults([]));
    return () => { ok = false; };
  }, [debouncedQ, myId]);

  function toggle(id) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  async function handleCreate() {
    try {
      if (mode === "dm") {
        if (selected.length !== 1) return alert("Pick exactly one user for a DM.");
        const res = await createConversation({ type: "dm", memberIds: selected });
        onCreated(res.data);
      } else {
        if (selected.length < 2) return alert("Pick at least two members for a group.");
        if (!groupName.trim()) return alert("Enter a group name.");
        const res = await createConversation({ type: "group", name: groupName.trim(), memberIds: selected });
        onCreated(res.data);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to create conversation.");
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[520px] max-w-[95vw]">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={() => { setMode("dm"); setSelected([]); }}
              className={`px-3 py-1 rounded ${mode === "dm" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
              Direct Message
            </button>
            <button onClick={() => { setMode("group"); setSelected([]); }}
              className={`px-3 py-1 rounded ${mode === "group" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
              Group
            </button>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">✕</button>
        </div>

        <div className="p-4 space-y-3">
          {mode === "group" && (
            <div>
              <label className="block text-sm font-medium mb-1">Group name</label>
              <input value={groupName} onChange={(e) => setGroupName(e.target.value)}
                className="w-full border rounded-md px-3 py-2" placeholder="e.g., Recon Team" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Add members</label>
            <input value={q} onChange={(e) => setQ(e.target.value)}
              className="w-full border rounded-md px-3 py-2" placeholder="Search users by name or email" />
          </div>

          <div className="border rounded-md max-h-64 overflow-auto">
            {results.length === 0 && <div className="p-3 text-sm text-gray-500">No users found</div>}
            {results.map((u) => (
              <label key={u._id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                {mode === "dm" ? (
                  <input type="radio" name="dmPick" checked={selected[0] === u._id} onChange={() => setSelected([u._id])} />
                ) : (
                  <input type="checkbox" checked={selected.includes(u._id)} onChange={() => toggle(u._id)} />
                )}
                <div>
                  <div className="text-sm font-medium">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="px-4 py-3 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded border">Cancel</button>
          <button onClick={handleCreate} className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700">Create</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Add Members Modal ---------- */
function AddMembersModal({ conversation, onClose, onAdded }) {
  const { user } = useAuth();
  const myId = String(user?.id || user?._id || "");
  const [q, setQ] = useState("");
  const debouncedQ = useDebounced(q, 300);

  const [results, setResults] = useState([]);
  const existingIds = new Set((conversation?.members || []).map((m) => String(m._id || m)));

  useEffect(() => {
    let ok = true;
    fetchUsers(debouncedQ)
      .then((r) => {
        if (!ok) return;
        const list = (r.data || [])
          .filter((u) => String(u._id) !== myId)               // no self
          .filter((u) => !existingIds.has(String(u._id)));     // only new users
        setResults(list);
      })
      .catch(() => setResults([]));
    return () => { ok = false; };
  }, [debouncedQ, myId]); // existingIds derived from props

  const [selected, setSelected] = useState([]);

  function toggle(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleAdd() {
    if (selected.length === 0) return onClose();
    try {
      const res = await addMembers(conversation._id, selected);
      onAdded(res.data);
    } catch (e) {
      console.error(e);
      alert("Failed to add members.");
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[520px] max-w-[95vw]">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="font-semibold">Add members to {conversation?.name || "Group"}</div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">✕</button>
        </div>

        <div className="p-4 space-y-3">
          <input value={q} onChange={(e) => setQ(e.target.value)}
            className="w-full border rounded-md px-3 py-2" placeholder="Search users by name or email" />
          <div className="border rounded-md max-h-64 overflow-auto">
            {results.length === 0 && <div className="p-3 text-sm text-gray-500">No users found</div>}
            {results.map((u) => (
              <label key={u._id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" checked={selected.includes(u._id)} onChange={() => toggle(u._id)} />
                <div>
                  <div className="text-sm font-medium">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="px-4 py-3 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded border">Cancel</button>
          <button onClick={handleAdd} className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700">Add</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Confirm Delete Modal ---------- */
function ConfirmDeleteModal({ conversation, onClose, onDeleted }) {
  async function handleDelete() {
    try {
      await deleteConversation(conversation._id);
      onDeleted();
    } catch (e) {
      console.error(e);
      alert("Failed to delete group.");
    }
  }
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[420px] max-w-[95vw]">
        <div className="px-4 py-3 border-b font-semibold">Delete group</div>
        <div className="p-4 text-sm">
          This will delete <span className="font-medium">{conversation?.name || "the group"}</span> for everyone.
          Only the creator can delete a group. Continue?
        </div>
        <div className="px-4 py-3 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded border">Cancel</button>
          <button onClick={handleDelete} className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}
