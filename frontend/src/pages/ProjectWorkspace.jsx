// src/pages/ProjectWorkspace.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axiosInstance";

// --- helpers ---

function displayUser(u) {
  if (!u) return "—";
  if (typeof u === "object") {
    return u.name || u.fullName || u.email || u._id || "—";
  }
  return String(u);
}

const DATE_ERR = "'To Date' must be equal or after 'From Date'.";

function validateDates(from, to) {
  if (!from || !to) return true;
  return new Date(to) >= new Date(from);
}

function TabButton({ active, onClick, children, badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 ${
        active
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      <span>{children}</span>
      {badge > 0 && (
        <span className="inline-flex items-center justify-center min-w-[18px] h-4 text-[10px] rounded-full bg-red-600 text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

// --- main component ---

export default function ProjectWorkspace() {
  const { id: routeId } = useParams();
  const projectId = routeId;

  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [userMap, setUserMap] = useState(new Map());

  const [tab, setTab] = useState("members");

  // Members
  const [members, setMembers] = useState([]);
  const [memberAdd, setMemberAdd] = useState({
    userIds: [],
    role: "Member",
  });

  // Charter
  const [charter, setCharter] = useState(null);
  const [charterForm, setCharterForm] = useState({
    purpose: "",
    scope: "",
    objectives: "",
    risks: "",
    assumptions: "",
    approvers: [],
  });

  // Notes
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");

  // Files (project-level)
  const [files, setFiles] = useState([]);

  // Plan
  const [plan, setPlan] = useState([]);
  const [planForm, setPlanForm] = useState({
    title: "",
    description: "",
    startDate: "",
    dueDate: "",
    type: "Milestone",
    percentComplete: 0,
  });

  // Tasks
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    planItemId: "",
    assigneeId: "",
    priority: "Low",
    startDate: "",
    dueDate: "",
    estimateHrs: 0,
  });
  const [statusNotes, setStatusNotes] = useState({});
  const [taskHistory, setTaskHistory] = useState([]);
  const [taskHistoryFor, setTaskHistoryFor] = useState(null);

  // Combined (for Gantt)
  const [combined, setCombined] = useState({ plan: [], tasks: [] });

  // Dependencies
  const [deps, setDeps] = useState([]);
  const [depForm, setDepForm] = useState({
    planItemId: "",
    taskId: "",
    description: "",
    status: "Open",
  });

  // Dashboard
  const [dash, setDash] = useState(null);

  // Chat
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatText, setChatText] = useState("");
  const [chatFiles, setChatFiles] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const [msg, setMsg] = useState({ type: "", text: "" });

  const hasAutoReadRun = useRef(false);

  const toast = (text, type = "ok") => {
    if (!text) return;
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 2500);
  };

  // --- initial load ---

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      try {
        const [p, u] = await Promise.all([
          axios
            .get(`/projects/${projectId}`)
            .then((r) => r.data)
            .catch(() => null),
          axios
            .get(`/users`)
            .then((r) =>
              Array.isArray(r.data) ? r.data : r.data?.users || []
            ),
        ]);
        setProject(p || null);
        setUsers(u || []);
        setUserMap(new Map((u || []).map((x) => [String(x._id), x])));

        const [
          mem,
          ch,
          myNotes,
          fl,
          pl,
          comb,
          dp,
          d,
          ts,
          chats,
          unread,
        ] = await Promise.all([
          axios
            .get(`/workspace/projects/${projectId}/members`)
            .then((r) =>
              Array.isArray(r.data) ? r.data : r.data?.members || []
            )
            .catch(() => []),
          axios
            .get(`/workspace/projects/${projectId}/charter`)
            .then((r) => r.data || null)
            .catch(() => null),
          axios
            .get(`/workspace/projects/${projectId}/notes`)
            .then((r) => (Array.isArray(r.data) ? r.data : []))
            .catch(() => []),
          axios
            .get(`/workspace/projects/${projectId}/files`)
            .then((r) => (Array.isArray(r.data) ? r.data : []))
            .catch(() => []),
          axios
            .get(`/workspace/projects/${projectId}/plan`)
            .then((r) => (Array.isArray(r.data) ? r.data : []))
            .catch(() => []),
          axios
            .get(`/workspace/projects/${projectId}/gantt/combined`)
            .then((r) => r.data || { plan: [], tasks: [] })
            .catch(() => ({ plan: [], tasks: [] })),
          axios
            .get(`/workspace/projects/${projectId}/dependencies`)
            .then((r) => (Array.isArray(r.data) ? r.data : []))
            .catch(() => []),
          axios
            .get(`/workspace/projects/${projectId}/dashboard`)
            .then((r) => r.data || null)
            .catch(() => null),
          axios
            .get(`/project-tasks/project/${projectId}`)
            .then((r) => (Array.isArray(r.data) ? r.data : []))
            .catch(() => []),
          axios
            .get(`/workspace/projects/${projectId}/chat`)
            .then((r) => (Array.isArray(r.data) ? r.data : []))
            .catch(() => []),
          axios
            .get(`/workspace/projects/${projectId}/chat/unread-counts`)
            .then((r) => r.data?.unread || 0)
            .catch(() => 0),
        ]);

        setMembers(mem);
        setCharter(ch);
        setNotes(myNotes);
        setFiles(fl);
        setPlan(pl);
        setCombined(comb);
        setDeps(dp);
        setDash(d);
        setTasks(ts);
        setChatMsgs(chats);
        setUnreadChatCount(unread);

        if (ch?.charter) {
          setCharterForm({
            purpose: ch.charter.purpose || "",
            scope: ch.charter.scope || "",
            objectives: (ch.charter.objectives || []).join(", "),
            risks: (ch.charter.risks || []).join(", "),
            assumptions: (ch.charter.assumptions || []).join(", "),
            approvers: ch.charter.approvers || [],
          });
        }
      } catch (e) {
        toast(
          e?.response?.data?.message || e.message || "Failed to load workspace",
          "err"
        );
      }
    })();
  }, [projectId]);

  // auto mark chat as read when tab == "chats"
  useEffect(() => {
    if (tab !== "chats") return;
    if (hasAutoReadRun.current) return;
    hasAutoReadRun.current = true;
    (async () => {
      try {
        const ids = (chatMsgs || [])
          .map((m) => m._id)
          .filter(Boolean);
        await Promise.all(
          ids.map((id) =>
            axios.post(`/workspace/chat/${id}/read`).catch(() => null)
          )
        );
        setUnreadChatCount(0);
      } catch {
        // ignore
      }
    })();
  }, [tab, chatMsgs]);

  // ---- derived values ----

  const approverIds = useMemo(
    () => (charter?.charter?.approvers || []).map((a) => String(a)),
    [charter]
  );

  const signatures = charter?.signatures || [];
  const approvals = signatures.filter(
    (s) => String(s.status).toLowerCase() === "approved"
  ).length;
  const fullyApproved = approverIds.length > 0 &&
    approvals === approverIds.length;

  const gated = !fullyApproved;

  const sortedPlan = useMemo(
    () =>
      [...plan].sort(
        (a, b) =>
          new Date(a.dueDate || a.startDate || 0) -
          new Date(b.dueDate || b.startDate || 0)
      ),
    [plan]
  );

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort(
        (a, b) =>
          new Date(a.dueDate || a.startDate || 0) -
          new Date(b.dueDate || b.startDate || 0)
      ),
    [tasks]
  );

  // ---- actions ----
  // Members

  const addMembers = async () => {
    if (!memberAdd.userIds.length) return;
    try {
      const r = await axios.post(`/workspace/projects/${projectId}/members`, {
        userIds: memberAdd.userIds,
        role: memberAdd.role,
      });
      setMembers(
        Array.isArray(r.data) ? r.data : r.data?.members || []
      );
      setMemberAdd({ userIds: [], role: "Member" });
    } catch (e) {
      toast(
        e?.response?.data?.message || e.message || "Failed to add members",
        "err"
      );
    }
  };

  const updateMemberRole = async (member) => {
    try {
      const r = await axios.put(
        `/workspace/projects/${projectId}/members/${member._id}`,
        { role: member.role }
      );
      const updated = Array.isArray(r.data) ? r.data : null;
      if (updated) return setMembers(updated);
      // fallback to local update
      setMembers((cur) =>
        cur.map((m) =>
          m._id === member._id ? { ...m, role: member.role } : m
        )
      );
    } catch {
      setMembers((cur) =>
        cur.map((m) =>
          m._id === member._id ? { ...m, role: member.role } : m
        )
      );
    }
  };

  const removeMember = async (memberId) => {
    if (!window.confirm("Remove this member from project?")) return;
    try {
      const r = await axios.delete(
        `/workspace/projects/${projectId}/members/${memberId}`
      );
      setMembers(
        Array.isArray(r.data) ? r.data : r.data?.members || []
      );
    } catch {
      setMembers((cur) => cur.filter((m) => m._id !== memberId));
    }
  };

  // Charter

  const saveCharter = async () => {
    try {
      const payload = {
        purpose: charterForm.purpose,
        scope: charterForm.scope,
        objectives: charterForm.objectives
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        risks: charterForm.risks
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        assumptions: charterForm.assumptions
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        approvers: charterForm.approvers,
      };
      await axios.post(
        `/workspace/projects/${projectId}/charter`,
        payload
      );
      const rd = await axios.get(
        `/workspace/projects/${projectId}/charter`
      );
      setCharter(rd.data || null);
      toast("Charter saved");
    } catch (e) {
      toast(
        e?.response?.data?.message || e.message || "Failed to save charter",
        "err"
      );
    }
  };

  const setApprovers = async () => {
    if (!charter?.charter?._id) return;
    try {
      await axios.post(
        `/workspace/charter/${charter.charter._id}/approvers`,
        { approvers: charterForm.approvers }
      );
      const rd = await axios.get(
        `/workspace/projects/${projectId}/charter`
      );
      setCharter(rd.data || null);
      toast("Approvers updated");
    } catch (e) {
      toast(
        e?.response?.data?.message || e.message || "Failed to update approvers",
        "err"
      );
    }
  };

  const signCharter = async (status) => {
    if (!charter?.charter?._id) return;
    const remarks =
      status === "Rejected"
        ? window.prompt("Remarks (required for rejection)", "") || ""
        : "";
    try {
      await axios.post(
        `/workspace/charter/${charter.charter._id}/sign`,
        { status, remarks }
      );
      const rd = await axios.get(
        `/workspace/projects/${projectId}/charter`
      );
      setCharter(rd.data || null);
      toast(`Charter ${status.toLowerCase()}`);
    } catch (e) {
      toast(
        e?.response?.data?.message || e.message || "Failed to sign charter",
        "err"
      );
    }
  };

  // Notes

  const addNote = async () => {
    if (!noteText.trim()) return;
    try {
      const fd = new FormData();
      fd.append("text", noteText);
      const r = await axios.post(
        `/workspace/projects/${projectId}/notes`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setNotes((cur) => [r.data, ...cur]);
      setNoteText("");
    } catch (e) {
      toast(
        e?.response?.data?.message || e.message || "Failed to add note",
        "err"
      );
    }
  };

  // Files (project-level)

  const onUpload = async (ev) => {
    const list = Array.from(ev.target.files || []);
    if (!list.length) return;
    try {
      const fd = new FormData();
      list.forEach((f) => fd.append("files", f));
      const r = await axios.post(
        `/workspace/projects/${projectId}/files`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setFiles((cur) => [...r.data, ...cur]);
      ev.target.value = "";
    } catch (e) {
      toast(
        e?.response?.data?.message || e.message || "Failed to upload files",
        "err"
      );
    }
  };

  const downloadFile = (f) => {
    window.location.href = `/api/workspace/projects/${projectId}/files/${f._id}/download`;
  };

  const deleteFile = async (fileId) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      const r = await axios.delete(
        `/workspace/projects/${projectId}/files/${fileId}`
      );
      setFiles(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      toast(
        e?.response?.data?.message || e.message || "Failed to delete file",
        "err"
      );
    }
  };

  // Plan

  const addPlan = async () => {
    if (!validateDates(planForm.startDate, planForm.dueDate)) {
      alert(DATE_ERR);
      return;
    }
    if (gated) {
      return toast(
        "Charter must be fully approved to add plan items.",
        "err"
      );
    }
    try {
      const r = await axios.post(
        `/workspace/projects/${projectId}/plan`,
        {
          title: planForm.title,
          description: planForm.description,
          startDate: planForm.startDate || null,
          dueDate: planForm.dueDate || null,
          type: planForm.type || "Milestone",
          percentComplete: Number(planForm.percentComplete || 0),
        }
      );
      setPlan((cur) => [...cur, r.data]);
      setPlanForm({
        title: "",
        description: "",
        startDate: "",
        dueDate: "",
        type: "Milestone",
        percentComplete: 0,
      });
    } catch (e) {
      toast(
        e?.response?.data?.message || e.message || "Failed to add plan item",
        "err"
      );
    }
  };

  const deletePlanItem = async (item) => {
    if (
      !window.confirm(
        "Delete this plan item? The system will block if there are linked tasks or dependencies."
      )
    )
      return;
    try {
      const r = await axios.delete(
        `/workspace/projects/${projectId}/plan/${item._id}`
      );
      if (r.status === 409) {
        const data = r.data;
        toast(
          data?.message ||
            "This plan item has linked tasks/dependencies and cannot be deleted.",
          "err"
        );
        return;
      }
      setPlan((cur) => cur.filter((p) => p._id !== item._id));
    } catch (e) {
      toast(
        e?.response?.data?.message || e.message || "Failed to delete plan item",
        "err"
      );
    }
  };

  // Tasks

  const addTask = async () => {
    if (!validateDates(taskForm.startDate, taskForm.dueDate)) {
      alert(DATE_ERR);
      return;
    }
    if (gated) {
      return toast(
        "Charter must be fully approved to add tasks.",
        "err"
      );
    }
    try {
      const payload = { ...taskForm, projectId };
      const r = await axios.post(`/project-tasks`, payload);
      setTasks((cur) => [r.data, ...cur]);
      setTaskForm({
        title: "",
        description: "",
        planItemId: "",
        assigneeId: "",
        priority: "Low",
        startDate: "",
        dueDate: "",
        estimateHrs: 0,
      });
    } catch (e) {
      toast(
        e?.response?.data?.message || e.message || "Failed to add task",
        "err"
      );
    }
  };

  const changeTaskStatus = async (taskId, to) => {
    try {
      const note = statusNotes[taskId] || "";
      const r = await axios.patch(`/project-tasks/${taskId}/status`, {
        to,
        note,
      });
      const t = r.data?.task || r.data;
      setTasks((cur) =>
        cur.map((x) =>
          x._id === (t?._id || t?.id) ? (t || x) : x
        )
      );
      setStatusNotes((prev) => ({ ...prev, [taskId]: "" }));
    } catch (e) {
      toast(
        e?.response?.data?.message || e.message || "Failed to update status",
        "err"
      );
    }
  };

  const attachTaskFiles = async (taskId, ev) => {
    const list = Array.from(ev.target.files || []);
    if (!list.length) return;
    try {
      const fd = new FormData();
      list.forEach((f) => fd.append("files", f));
      await axios.post(`/project-tasks/${taskId}/files`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast("Files attached to task");
      ev.target.value = "";
    } catch (e) {
      toast(
        e?.response?.data?.message || e.message || "Failed to attach files",
        "err"
      );
    }
  };

  const loadTaskHistory = async (task) => {
    try {
      const r = await axios.get(`/project-tasks/${task._id}/history`);
      setTaskHistory(Array.isArray(r.data) ? r.data : []);
      setTaskHistoryFor(task);
    } catch (e) {
      toast(
        e?.response?.data?.message || e.message || "Failed to load status history",
        "err"
      );
    }
  };

  // Dependencies

  const addDependency = async () => {
    try {
      const payload = {
        ...depForm,
        planItemId: depForm.planItemId || undefined,
        taskId: depForm.taskId || undefined,
      };
      const r = await axios.post(
        `/workspace/projects/${projectId}/dependencies`,
        payload
      );
      setDeps((cur) => [...cur, r.data]);
      setDepForm({
        planItemId: "",
        taskId: "",
        description: "",
        status: "Open",
      });
    } catch (e) {
      toast(
        e?.response?.data?.message || e.message || "Failed to add dependency",
        "err"
      );
    }
  };

  // Chat

  const sendChat = async () => {
    if (!chatText.trim() && (chatFiles?.length || 0) === 0) return;
    if (gated) {
      return toast(
        "Charter must be fully approved to send chat messages.",
        "err"
      );
    }
    try {
      const fd = new FormData();
      fd.append("text", chatText.trim());
      Array.from(chatFiles || []).forEach((f) =>
        fd.append("files", f)
      );
      await axios.post(
        `/workspace/projects/${projectId}/chat`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setChatText("");
      setChatFiles([]);
      const r = await axios.get(
        `/workspace/projects/${projectId}/chat`
      );
      const msgs = Array.isArray(r.data) ? r.data : [];
      setChatMsgs(msgs);
      try {
        const ids = msgs.map((m) => m._id).filter(Boolean);
        await Promise.all(
          ids.map((id) =>
            axios.post(`/workspace/chat/${id}/read`).catch(() => null)
          )
        );
        setUnreadChatCount(0);
      } catch {
        // ignore
      }
    } catch (e) {
      toast(
        e?.response?.data?.message || e.message || "Failed to send message",
        "err"
      );
    }
  };

  // --- render ---

  const tabs = [
    { key: "members", label: "Members" },
    { key: "charter", label: "Charter" },
    { key: "notes", label: "Notes" },
    { key: "chats", label: "Chats" },
    { key: "files", label: "Files" },
    { key: "plan", label: "Plan" },
    { key: "gantt", label: "Gantt" },
    { key: "tasks", label: "Tasks" },
    { key: "dependencies", label: "Dependencies" },
    { key: "dashboard", label: "Dashboard" },
  ];

    const listToText = (list) => (list || []).join("\n");

    const SectionCard = ({ title, icon, children, right }) => (
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xs">
              {icon}
            </div>
            <div className="text-sm font-semibold text-gray-900">{title}</div>
          </div>
          {right}
        </div>
        <div className="p-4">{children}</div>
      </div>
    );

    const splitToList = (value) => {
      if (!value) return [];
      return value
        .split(/[\n,]+/g)
        .map((s) => s.trim())
        .filter(Boolean);
    };

    const Badge = ({ children, className = "" }) => (
      <span
        className={
          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium " +
          className
        }
      >
        {children}
      </span>
    );

    const ListPreview = ({ items, emptyText = "Nothing added yet." }) => {
      if (!items?.length)
        return <div className="text-xs text-gray-500">{emptyText}</div>;

      return (
        <ul className="space-y-2">
          {items.map((t, i) => (
            <li key={`${t}-${i}`} className="flex gap-2 text-sm text-gray-800">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-900 flex-shrink-0" />
              <span className="leading-6">{t}</span>
            </li>
          ))}
        </ul>
      );
    };

    const Modal = ({ open, onClose, title, subtitle, right, children }) => {
      if (!open) return null;

      return (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div className="absolute inset-0 flex items-center justify-center p-3 md:p-6">
            <div className="w-full max-w-6xl rounded-2xl bg-white shadow-xl border overflow-hidden">
              {/* Header */}
              <div className="px-4 md:px-6 py-4 border-b flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-gray-900">{title}</div>
                  {subtitle && (
                    <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {right}
                  <button
                    onClick={onClose}
                    className="h-9 w-9 rounded-xl border bg-white hover:bg-gray-50 text-gray-700"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 md:p-6 max-h-[78vh] overflow-auto">
                {children}
              </div>
            </div>
          </div>
        </div>
      );
    };

    const [isCharterModalOpen, setIsCharterModalOpen] = useState(false);

    const openCharterModal = () => setIsCharterModalOpen(true);
    const closeCharterModal = () => setIsCharterModalOpen(false);


  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Project Workspace
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            {project?.name || project?.code || "Loading..."}
          </h1>
          {project?.description && (
            <p className="text-xs text-gray-600 max-w-2xl mt-1">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {tabs.map((t) => (
            <TabButton
              key={t.key}
              active={tab === t.key}
              onClick={() => {
                setTab(t.key);
                if (t.key !== "chats") {
                  hasAutoReadRun.current = false;
                }
              }}
              badge={t.key === "chats" ? unreadChatCount : 0}
            >
              {t.label}
            </TabButton>
          ))}
        </div>
      </div>

      {/* Members */}
      {tab === "members" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* add members */}
            <div className="border rounded-md p-4 bg-gray-50">
              <div className="text-sm font-medium mb-2">Add / Update Members</div>
              <div className="mb-3">
                <div className="text-xs text-gray-700 mb-1">
                  Select Users
                </div>
                <select
                  multiple
                  value={memberAdd.userIds}
                  onChange={(e) =>
                    setMemberAdd((f) => ({
                      ...f,
                      userIds: Array.from(
                        e.target.selectedOptions
                      ).map((o) => o.value),
                    }))
                  }
                  className="w-full rounded-md border p-2 text-sm"
                >
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {displayUser(u)}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  Hold Ctrl/Cmd to select multiple users.
                </p>
              </div>
              <div className="mb-3">
                <div className="text-xs text-gray-700 mb-1">
                  Default Role
                </div>
                <select
                  value={memberAdd.role}
                  onChange={(e) =>
                    setMemberAdd((f) => ({
                      ...f,
                      role: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border p-2 text-sm"
                >
                  {["Admin", "Project Owner", "Project Lead", "Project Manager", "Manager", "Lead", "Team Member", "Observer"].map(
                    (r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    )
                  )}
                </select>
              </div>
              <button
                onClick={addMembers}
                className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm"
              >
                Add Members
              </button>
            </div>

            {/* list members */}
            <div className="border rounded-md p-4 bg-white">
              <div className="text-sm font-medium mb-2">Current Members</div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-1 pr-2">User</th>
                    <th className="py-1 pr-2">Role</th>
                    <th className="py-1 pr-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m._id} className="border-t">
                      <td className="py-1 pr-2">
                        {displayUser(m.userId)}
                      </td>
                      <td className="py-1 pr-2">
                        <select
                          value={m.role}
                          onChange={(e) =>
                            updateMemberRole({
                              ...m,
                              role: e.target.value,
                            })
                          }
                          className="border rounded px-2 py-0.5 text-xs"
                        >
                          {["Admin", "Project Owner", "Project Lead", "Project Manager", "Manager", "Lead", "Team Member", "Observer"].map(
                            (r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            )
                          )}
                        </select>
                      </td>
                      <td className="py-1 text-right">
                        <button
                          onClick={() => removeMember(m._id)}
                          className="text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!members.length && (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-3 text-center text-gray-500 text-xs"
                      >
                        No members added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Charter */}
      {/* {tab === "charter" && (
        <div className="space-y-4">
          <div className="text-sm font-semibold">Project Charter</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-700 mb-1">Purpose</div>
                <textarea
                  rows={3}
                  value={charterForm.purpose}
                  onChange={(e) =>
                    setCharterForm((f) => ({
                      ...f,
                      purpose: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border p-2 text-sm"
                />
              </div>
              <div>
                <div className="text-xs text-gray-700 mb-1">Scope</div>
                <textarea
                  rows={3}
                  value={charterForm.scope}
                  onChange={(e) =>
                    setCharterForm((f) => ({
                      ...f,
                      scope: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border p-2 text-sm"
                />
              </div>
              <div>
                <div className="text-xs text-gray-700 mb-1">
                  Objectives (comma separated)
                </div>
                <textarea
                  rows={2}
                  value={charterForm.objectives}
                  onChange={(e) =>
                    setCharterForm((f) => ({
                      ...f,
                      objectives: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border p-2 text-sm"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-700 mb-1">
                  Risks (comma separated)
                </div>
                <textarea
                  rows={2}
                  value={charterForm.risks}
                  onChange={(e) =>
                    setCharterForm((f) => ({
                      ...f,
                      risks: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border p-2 text-sm"
                />
              </div>
              <div>
                <div className="text-xs text-gray-700 mb-1">
                  Assumptions (comma separated)
                </div>
                <textarea
                  rows={2}
                  value={charterForm.assumptions}
                  onChange={(e) =>
                    setCharterForm((f) => ({
                      ...f,
                      assumptions: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border p-2 text-sm"
                />
              </div>
              <div>
                <div className="text-xs text-gray-700 mb-1">
                  Approvers
                </div>
                <select
                  multiple
                  value={charterForm.approvers}
                  onChange={(e) =>
                    setCharterForm((f) => ({
                      ...f,
                      approvers: Array.from(
                        e.target.selectedOptions
                      ).map((o) => o.value),
                    }))
                  }
                  className="w-full rounded-md border p-2 text-sm min-h-[80px]"
                >
                  {members.map((m) => (
                    <option
                      key={m._id}
                      value={String(m.userId?._id || m.userId)}
                    >
                      {displayUser(m.userId)}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  Hold Ctrl/Cmd to select multiple approvers.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={saveCharter}
              className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs"
            >
              Save Charter
            </button>
            <button
              onClick={setApprovers}
              disabled={!charter?.charter?._id}
              className="px-3 py-1.5 rounded-md bg-gray-100 text-gray-800 text-xs disabled:opacity-50"
            >
              Update Approvers
            </button>
            <button
              onClick={() => signCharter("Approved")}
              disabled={!charter?.charter?._id}
              className="px-3 py-1.5 rounded-md bg-green-600 text-white text-xs disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => signCharter("Rejected")}
              disabled={!charter?.charter?._id}
              className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs disabled:opacity-50"
            >
              Reject
            </button>
          </div>

          {charter?.charter && (
            <div className="mt-4 border rounded-md p-3 bg-gray-50">
              <div className="text-xs font-semibold mb-1">
                Approval Status
              </div>
              <div className="text-xs mb-2">
                {approvals}/{approverIds.length} approved{" "}
                {fullyApproved && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px]">
                    Fully Approved
                  </span>
                )}
              </div>
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-1 pr-2">User</th>
                    <th className="py-1 pr-2">Status</th>
                    <th className="py-1 pr-2">Remarks</th>
                    <th className="py-1 pr-2">Signed At</th>
                  </tr>
                </thead>
                <tbody>
                  {signatures.map((s) => (
                    <tr key={s._id} className="border-t">
                      <td className="py-1 pr-2">
                        {displayUser(s.userId)}
                      </td>
                      <td className="py-1 pr-2">{s.status}</td>
                      <td className="py-1 pr-2">{s.remarks || "—"}</td>
                      <td className="py-1 pr-2">
                        {s.signedAt
                          ? new Date(s.signedAt).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                  {!signatures.length && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-3 text-center text-gray-500"
                      >
                        No signatures yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )} */}

      {tab === "charter" && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <div className="text-base font-semibold text-gray-900">Project Charter</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={openCharterModal}
                className="px-3 py-2 rounded-lg bg-gray-900 text-white text-xs hover:opacity-95"
              >
                Edit Charter
              </button>

              {/* <button
                onClick={setApprovers}
                disabled={!charter?.charter?._id}
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-900 text-xs hover:bg-gray-200 disabled:opacity-50"
              >
                Update Approvers
              </button> */}

              <button
                onClick={() => signCharter("Approved")}
                disabled={!charter?.charter?._id}
                className="px-3 py-2 rounded-lg bg-green-600 text-white text-xs hover:opacity-95 disabled:opacity-50"
              >
                Approve
              </button>

              <button
                onClick={() => signCharter("Rejected")}
                disabled={!charter?.charter?._id}
                className="px-3 py-2 rounded-lg bg-red-600 text-white text-xs hover:opacity-95 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>

          {/* Preview card (always visible) */}
          <div className="rounded-2xl border bg-white shadow-sm">

            <div className="p-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-xl border bg-gray-50 p-3">
                  <div className="text-xs font-semibold text-gray-700 mb-1">Purpose</div>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">
                    {charterForm.purpose?.trim() || <span className="text-gray-500">—</span>}
                  </div>
                </div>

                <div className="rounded-xl border bg-gray-50 p-3">
                  <div className="text-xs font-semibold text-gray-700 mb-1">Scope</div>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">
                    {charterForm.scope?.trim() || <span className="text-gray-500">—</span>}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="rounded-xl border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-gray-700">Objectives</div>
                    <Badge className="bg-blue-50 text-blue-700">
                      {splitToList(charterForm.objectives).length}
                    </Badge>
                  </div>
                  <ListPreview items={splitToList(charterForm.objectives)} />
                </div>

                <div className="rounded-xl border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-gray-700">Risks</div>
                    <Badge className="bg-amber-50 text-amber-700">
                      {splitToList(charterForm.risks).length}
                    </Badge>
                  </div>
                  <ListPreview items={splitToList(charterForm.risks)} />
                </div>

                <div className="rounded-xl border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-gray-700">Assumptions</div>
                    <Badge className="bg-emerald-50 text-emerald-700">
                      {splitToList(charterForm.assumptions).length}
                    </Badge>
                  </div>
                  <ListPreview items={splitToList(charterForm.assumptions)} />
                </div>
              </div>

              <div className="rounded-xl border bg-gray-50 p-3">
                <div className="text-xs font-semibold text-gray-700 mb-2">Approvers</div>
                <div className="flex flex-wrap gap-2">
                  {(charterForm.approvers || []).length ? (
                    charterForm.approvers.map((id) => {
                      const member = members.find(
                        (m) => String(m.userId?._id || m.userId) === String(id)
                      );
                      return (
                        <span
                          key={id}
                          className="px-2 py-1 rounded-full bg-white border text-xs text-gray-800"
                        >
                          {member ? displayUser(member.userId) : id}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-gray-500">No approvers selected.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Approval Status (keep your logic, just styled) */}
          {charter?.charter && (
            <div className="rounded-2xl border bg-white shadow-sm">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xs">
                    ✅
                  </div>
                  <div className="text-sm font-semibold text-gray-900">Approval Status</div>
                </div>

                {fullyApproved ? (
                  <Badge className="bg-green-100 text-green-700">Fully Approved</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-700">In Progress</Badge>
                )}
              </div>

              <div className="p-4">
                <div className="text-xs mb-3 text-gray-700">
                  <b>{approvals}</b> / <b>{approverIds.length}</b> approved
                </div>

                <div className="overflow-auto rounded-xl border">
                  <table className="min-w-[640px] w-full text-[11px]">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-gray-600">
                        <th className="py-2 px-3">User</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Remarks</th>
                        <th className="py-2 px-3">Signed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {signatures.map((s) => (
                        <tr key={s._id} className="border-t">
                          <td className="py-2 px-3">{displayUser(s.userId)}</td>
                          <td className="py-2 px-3">
                            <Badge
                              className={
                                s.status === "Approved"
                                  ? "bg-green-100 text-green-700"
                                  : s.status === "Rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                              }
                            >
                              {s.status}
                            </Badge>
                          </td>
                          <td className="py-2 px-3">{s.remarks || "—"}</td>
                          <td className="py-2 px-3">
                            {s.signedAt ? new Date(s.signedAt).toLocaleString() : "—"}
                          </td>
                        </tr>
                      ))}

                      {!signatures.length && (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-gray-500">
                            No signatures yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* EDIT MODAL */}
          <Modal
            open={isCharterModalOpen}
            onClose={closeCharterModal}
            title="Edit Project Charter"
            subtitle="Write clean content. Objectives/Risks/Assumptions will show as bullet lists in the preview."
            right={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    saveCharter();
                    closeCharterModal();
                  }}
                  className="px-3 py-2 rounded-lg bg-gray-900 text-white text-xs hover:opacity-95"
                >
                  Save & Close
                </button>

                <button
                  onClick={saveCharter}
                  className="px-3 py-2 rounded-lg bg-gray-100 text-gray-900 text-xs hover:bg-gray-200"
                >
                  Save
                </button>
              </div>
            }
          >
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Editor */}
              <div className="rounded-2xl border bg-white">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">Editor</div>
                  <Badge className="bg-gray-100 text-gray-700">Write one per line</Badge>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">Purpose</div>
                    <textarea
                      rows={4}
                      value={charterForm.purpose}
                      onChange={(e) =>
                        setCharterForm((f) => ({ ...f, purpose: e.target.value }))
                      }
                      className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                      placeholder="Why are we doing this project?"
                    />
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">Scope</div>
                    <textarea
                      rows={4}
                      value={charterForm.scope}
                      onChange={(e) =>
                        setCharterForm((f) => ({ ...f, scope: e.target.value }))
                      }
                      className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                      placeholder="What's included/excluded?"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-medium text-gray-700">Objectives</div>
                      <Badge className="bg-blue-50 text-blue-700">Comma/Newline supported</Badge>
                    </div>
                    <textarea
                      rows={4}
                      value={charterForm.objectives}
                      onChange={(e) =>
                        setCharterForm((f) => ({ ...f, objectives: e.target.value }))
                      }
                      className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                      placeholder={`Deliver MVP in 6 weeks\nReduce manual work by 30%\nEnable audit trail`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-medium text-gray-700">Risks</div>
                      <Badge className="bg-amber-50 text-amber-700">Comma/Newline supported</Badge>
                    </div>
                    <textarea
                      rows={4}
                      value={charterForm.risks}
                      onChange={(e) =>
                        setCharterForm((f) => ({ ...f, risks: e.target.value }))
                      }
                      className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                      placeholder={`Resource availability\nIntegration delays\nApproval bottlenecks`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-medium text-gray-700">Assumptions</div>
                      <Badge className="bg-emerald-50 text-emerald-700">Comma/Newline supported</Badge>
                    </div>
                    <textarea
                      rows={4}
                      value={charterForm.assumptions}
                      onChange={(e) =>
                        setCharterForm((f) => ({ ...f, assumptions: e.target.value }))
                      }
                      className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                      placeholder={`Stakeholders available weekly\nTest env ready\nData access approved`}
                    />
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">Approvers</div>
                    <select
                      multiple
                      value={charterForm.approvers}
                      onChange={(e) =>
                        setCharterForm((f) => ({
                          ...f,
                          approvers: Array.from(e.target.selectedOptions).map((o) => o.value),
                        }))
                      }
                      className="w-full rounded-xl border p-3 text-sm min-h-[140px] outline-none focus:ring-2 focus:ring-gray-900/10"
                    >
                      {members.map((m) => (
                        <option key={m._id} value={String(m.userId?._id || m.userId)}>
                          {displayUser(m.userId)}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Hold <b>Ctrl/Cmd</b> to select multiple approvers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="rounded-2xl border bg-white">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">Live Preview</div>
                  <Badge className="bg-gray-900 text-white">Approver View</Badge>
                </div>

                <div className="p-4 space-y-4">
                  <div className="rounded-xl border bg-gray-50 p-3">
                    <div className="text-xs font-semibold text-gray-700 mb-1">Purpose</div>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">
                      {charterForm.purpose?.trim() || <span className="text-gray-500">—</span>}
                    </div>
                  </div>

                  <div className="rounded-xl border bg-gray-50 p-3">
                    <div className="text-xs font-semibold text-gray-700 mb-1">Scope</div>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">
                      {charterForm.scope?.trim() || <span className="text-gray-500">—</span>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="rounded-xl border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold text-gray-700">Objectives</div>
                        <Badge className="bg-blue-50 text-blue-700">
                          {splitToList(charterForm.objectives).length}
                        </Badge>
                      </div>
                      <ListPreview items={splitToList(charterForm.objectives)} />
                    </div>

                    <div className="rounded-xl border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold text-gray-700">Risks</div>
                        <Badge className="bg-amber-50 text-amber-700">
                          {splitToList(charterForm.risks).length}
                        </Badge>
                      </div>
                      <ListPreview items={splitToList(charterForm.risks)} />
                    </div>

                    <div className="rounded-xl border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold text-gray-700">Assumptions</div>
                        <Badge className="bg-emerald-50 text-emerald-700">
                          {splitToList(charterForm.assumptions).length}
                        </Badge>
                      </div>
                      <ListPreview items={splitToList(charterForm.assumptions)} />
                    </div>
                  </div>

                  <div className="rounded-xl border bg-gray-50 p-3">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Approvers</div>
                    <div className="flex flex-wrap gap-2">
                      {(charterForm.approvers || []).length ? (
                        charterForm.approvers.map((id) => {
                          const member = members.find(
                            (m) => String(m.userId?._id || m.userId) === String(id)
                          );
                          return (
                            <span
                              key={id}
                              className="px-2 py-1 rounded-full bg-white border text-xs text-gray-800"
                            >
                              {member ? displayUser(member.userId) : id}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-gray-500">No approvers selected.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky footer actions (mobile-friendly) */}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                onClick={closeCharterModal}
                className="px-3 py-2 rounded-lg border bg-white text-gray-700 text-xs hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveCharter}
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-900 text-xs hover:bg-gray-200"
              >
                Save
              </button>
              <button
                onClick={() => {
                  saveCharter();
                  closeCharterModal();
                }}
                className="px-3 py-2 rounded-lg bg-gray-900 text-white text-xs hover:opacity-95"
              >
                Save & Close
              </button>
            </div>
          </Modal>
        </div>
      )}

      {/* Notes */}
      {tab === "notes" && (
        <div className="space-y-4">
          <div>
            <div className="text-xs text-gray-700 mb-1">Daily Note</div>
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full rounded-md border p-2 text-sm"
              placeholder="Write a daily note / progress log (visible only to you)"
            />
          </div>
          <button
            onClick={addNote}
            className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs"
          >
            Add Note
          </button>
          <div className="space-y-2 mt-4">
            {notes.map((n) => (
              <div
                key={n._id}
                className="border rounded-md p-2 text-xs bg-white"
              >
                <div className="text-[10px] text-gray-500 mb-1">
                  {new Date(n.date).toLocaleString()} —{" "}
                  {displayUser(n.authorId)}
                </div>
                <div>{n.text}</div>
              </div>
            ))}
            {!notes.length && (
              <div className="text-xs text-gray-500">
                No notes yet. Use this as your daily log.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat */}
      {tab === "chats" && (
        <div className="flex flex-col h-[70vh] border rounded-md overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-gray-50 p-3 space-y-2">
            {chatMsgs.map((m) => (
              <div
                key={m._id}
                className="bg-white border rounded-md p-2 text-xs"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[11px]">
                    {displayUser(m.authorId)}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {m.createdAt
                      ? new Date(m.createdAt).toLocaleString()
                      : ""}
                  </span>
                </div>
                {m.text && (
                  <div className="whitespace-pre-wrap text-[11px]">
                    {m.text}
                  </div>
                )}
                {Array.isArray(m.attachments) && m.attachments.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {m.attachments.map((a, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-[10px]"
                      >
                        {a.filename || "Attachment"}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {!chatMsgs.length && (
              <div className="text-xs text-gray-500">
                No messages yet. Start a conversation with the team.
              </div>
            )}
          </div>
          <div className="border-t bg-white p-2 space-y-2">
            <textarea
              rows={2}
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              className="w-full border rounded-md p-2 text-xs"
              placeholder="Type your message to the project team..."
            />
            <div className="flex items-center gap-2">
              <input
                type="file"
                multiple
                onChange={(e) => setChatFiles(e.target.files)}
                className="text-[11px]"
              />
              <button
                onClick={sendChat}
                className="ml-auto px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Files */}
      {tab === "files" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="file"
              multiple
              onChange={onUpload}
              className="text-xs"
            />
            <div className="text-[11px] text-gray-500">
              Attach general project files (BRDs, MOMs, etc.)
            </div>
          </div>
          <div className="space-y-2">
            {files.map((f) => (
              <div
                key={f._id}
                className="border rounded-md p-2 flex items-center justify-between text-xs bg-white"
              >
                <div>
                  <div className="font-medium">{f.filename}</div>
                  <div className="text-[10px] text-gray-500">
                    {f.size
                      ? `${(f.size / 1024).toFixed(1)} KB`
                      : ""}
                    {f.uploadedBy && (
                      <> — by {displayUser(f.uploadedBy)}</>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadFile(f)}
                    className="text-blue-600 hover:underline text-[11px]"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => deleteFile(f._id)}
                    className="text-red-600 hover:underline text-[11px]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!files.length && (
              <div className="text-xs text-gray-500">
                No files attached yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plan */}
      {tab === "plan" && (
        <div className="space-y-4">
          <div className="text-sm font-semibold">Implementation Plan</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-md p-3 bg-gray-50 space-y-2">
              <div>
                <div className="text-xs text-gray-700 mb-1">Title</div>
                <input
                  type="text"
                  value={planForm.title}
                  onChange={(e) =>
                    setPlanForm((f) => ({
                      ...f,
                      title: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border p-1.5 text-xs"
                />
              </div>
              <div>
                <div className="text-xs text-gray-700 mb-1">
                  Description
                </div>
                <textarea
                  rows={2}
                  value={planForm.description}
                  onChange={(e) =>
                    setPlanForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border p-1.5 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-700 mb-1">
                    Start Date
                  </div>
                  <input
                    type="date"
                    value={planForm.startDate}
                    onChange={(e) =>
                      setPlanForm((f) => ({
                        ...f,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border p-1.5 text-xs"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-700 mb-1">
                    Due Date
                  </div>
                  <input
                    type="date"
                    value={planForm.dueDate}
                    onChange={(e) =>
                      setPlanForm((f) => ({
                        ...f,
                        dueDate: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border p-1.5 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-700 mb-1">Type</div>
                  <select
                    value={planForm.type}
                    onChange={(e) =>
                      setPlanForm((f) => ({
                        ...f,
                        type: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border p-1.5 text-xs"
                  >
                    <option value="Milestone">Milestone</option>
                    <option value="Phase">Phase</option>
                    <option value="Activity">Activity</option>
                  </select>
                </div>
                <div>
                  <div className="text-xs text-gray-700 mb-1">
                    % Complete
                  </div>
                  <input
                    type="number"
                    value={planForm.percentComplete}
                    onChange={(e) =>
                      setPlanForm((f) => ({
                        ...f,
                        percentComplete: e.target.value,
                      }))
                    }
                    min={0}
                    max={100}
                    className="w-full rounded-md border p-1.5 text-xs"
                  />
                </div>
              </div>
              <button
                onClick={addPlan}
                disabled={gated}
                className={`px-3 py-1.5 rounded-md text-xs ${
                  gated
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-gray-900 text-white"
                }`}
              >
                Add Plan Item
              </button>
              {gated && (
                <div className="text-[10px] text-red-600 mt-1">
                  Charter must be fully approved.
                </div>
              )}
            </div>

            <div className="border rounded-md p-3 bg-white">
              <div className="text-xs font-semibold mb-2">
                Plan Items
              </div>
              <ul className="space-y-2">
                {sortedPlan.map((p) => (
                  <li
                    key={p._id}
                    className="border rounded-md p-2 text-xs flex justify-between gap-3"
                  >
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-[10px] text-gray-500">
                        {p.type} —{" "}
                        {p.startDate || "—"} →{" "}
                        {p.dueDate || "—"} ({p.percentComplete || 0}
                        %)
                      </div>
                      <div className="text-[11px] mt-1">
                        {p.description}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-[11px]">
                      <button
                        onClick={() => deletePlanItem(p)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
                {!sortedPlan.length && (
                  <li className="text-xs text-gray-500">
                    No plan items yet.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Gantt (simple textual view using combined data) */}
      {tab === "gantt" && (
        <div className="space-y-4">
          <div className="text-sm font-semibold">Gantt (Text View)</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-md p-3 text-xs bg-gray-50">
              <div className="font-semibold mb-1">
                Plan Timeline
              </div>
              {combined.plan?.length ? (
                combined.plan.map((p) => (
                  <div key={p._id} className="mb-2">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-[10px] text-gray-600">
                      {p.type} — {p.startDate || "—"} →{" "}
                      {p.dueDate || "—"} ({p.percentComplete || 0}
                      %)
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-xs">
                  No plan items in combined data.
                </div>
              )}
            </div>
            <div className="border rounded-md p-3 text-xs bg-white">
              <div className="font-semibold mb-1">
                Task Timeline
              </div>
              {combined.tasks?.length ? (
                combined.tasks.map((t) => (
                  <div key={t._id} className="mb-2">
                    <div className="font-medium">{t.title}</div>
                    <div className="text-[10px] text-gray-600">
                      {t.status} — {t.startDate || "—"} →{" "}
                      {t.dueDate || "—"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-xs">
                  No tasks in combined data.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tasks */}
      {tab === "tasks" && (
        <div className="space-y-4">
          <div className="text-sm font-semibold">
            Project Tasks & Status Flow
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-md p-3 bg-gray-50 space-y-2">
              <div>
                <div className="text-xs text-gray-700 mb-1">
                  Title
                </div>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm((f) => ({
                      ...f,
                      title: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border p-1.5 text-xs"
                />
              </div>
              <div>
                <div className="text-xs text-gray-700 mb-1">
                  Description
                </div>
                <textarea
                  rows={2}
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border p-1.5 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-700 mb-1">
                    Plan Item
                  </div>
                  <select
                    value={taskForm.planItemId}
                    onChange={(e) =>
                      setTaskForm((f) => ({
                        ...f,
                        planItemId: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border p-1.5 text-xs"
                  >
                    <option value="">(None)</option>
                    {sortedPlan.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-xs text-gray-700 mb-1">
                    Assignee
                  </div>
                  <select
                    value={taskForm.assigneeId}
                    onChange={(e) =>
                      setTaskForm((f) => ({
                        ...f,
                        assigneeId: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border p-1.5 text-xs"
                  >
                    <option value="">(Unassigned)</option>
                    {members.map((m) => (
                      <option
                        key={m._id}
                        value={String(m.userId?._id || m.userId)}
                      >
                        {displayUser(m.userId)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="text-xs text-gray-700 mb-1">
                    Priority
                  </div>
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm((f) => ({
                        ...f,
                        priority: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border p-1.5 text-xs"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <div className="text-xs text-gray-700 mb-1">
                    Start Date
                  </div>
                  <input
                    type="date"
                    value={taskForm.startDate}
                    onChange={(e) =>
                      setTaskForm((f) => ({
                        ...f,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border p-1.5 text-xs"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-700 mb-1">
                    Due Date
                  </div>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) =>
                      setTaskForm((f) => ({
                        ...f,
                        dueDate: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border p-1.5 text-xs"
                  />
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-700 mb-1">
                  Estimate (hours)
                </div>
                <input
                  type="number"
                  value={taskForm.estimateHrs}
                  onChange={(e) =>
                    setTaskForm((f) => ({
                      ...f,
                      estimateHrs: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border p-1.5 text-xs"
                />
              </div>
              <button
                onClick={addTask}
                disabled={gated}
                className={`px-3 py-1.5 rounded-md text-xs ${
                  gated
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-gray-900 text-white"
                }`}
              >
                Add Task
              </button>
              {gated && (
                <div className="text-[10px] text-red-600 mt-1">
                  Charter must be fully approved.
                </div>
              )}
            </div>

            <div className="border rounded-md p-3 bg-white space-y-2">
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs font-semibold">
                  Tasks ({sortedTasks.length})
                </div>
              </div>
              {sortedTasks.map((t) => {
                const u =
                  userMap.get(String(t.assigneeId?._id || t.assigneeId)) ||
                  t.assigneeId;
                return (
                  <div
                    key={t._id}
                    className="border rounded-md p-2 text-xs space-y-1"
                  >
                    <div className="flex justify-between gap-2">
                      <div className="font-medium">{t.title}</div>
                      <div className="text-[10px] text-gray-500">
                        {t.status}
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-600">
                      {t.priority} — {t.startDate || "—"} →{" "}
                      {t.dueDate || "—"} — {displayUser(u)}
                    </div>
                    {t.description && (
                      <div className="text-[11px] mt-1">
                        {t.description}
                      </div>
                    )}
                    <div className="mt-1">
                      <div className="text-[10px] mb-1">
                        Status change note
                      </div>
                      <textarea
                        rows={2}
                        value={statusNotes[t._id] || ""}
                        onChange={(e) =>
                          setStatusNotes((prev) => ({
                            ...prev,
                            [t._id]: e.target.value,
                          }))
                        }
                        className="w-full border rounded-md p-1 text-[11px]"
                        placeholder="Explain this status change (required when PM re-opens)"
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {["In Progress", "Completed", "Hold", "Re Opened"].map(
                        (to) => (
                          <button
                            key={to}
                            onClick={() => changeTaskStatus(t._id, to)}
                            className="px-2 py-1 rounded-md border text-[11px]"
                          >
                            {to}
                          </button>
                        )
                      )}
                      <label className="ml-1 inline-flex items-center text-[11px] cursor-pointer">
                        <span className="px-2 py-1 rounded-md border bg-gray-50 mr-1">
                          Attach Files
                        </span>
                        <input
                          type="file"
                          multiple
                          onChange={(e) => attachTaskFiles(t._id, e)}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => loadTaskHistory(t)}
                        className="ml-auto text-blue-600 hover:underline text-[11px]"
                      >
                        View History
                      </button>
                    </div>
                  </div>
                );
              })}
              {!sortedTasks.length && (
                <div className="text-xs text-gray-500">
                  No tasks yet.
                </div>
              )}
            </div>
          </div>

          {/* Status history modal */}
          {taskHistoryFor && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20">
              <div className="bg-white rounded-md shadow-lg w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                <div className="px-3 py-2 border-b flex justify-between items-center">
                  <div className="text-xs font-semibold">
                    Status History — {taskHistoryFor.title}
                  </div>
                  <button
                    onClick={() => {
                      setTaskHistory([]);
                      setTaskHistoryFor(null);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 text-xs">
                  {taskHistory.map((h) => (
                    <div
                      key={h._id}
                      className="border rounded-md p-2 bg-gray-50"
                    >
                      <div className="flex justify-between mb-1">
                        <div>
                          {h.from} → {h.to}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {h.changedAt
                            ? new Date(
                                h.changedAt
                              ).toLocaleString()
                            : ""}
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-600 mb-1">
                        By {displayUser(h.changedBy)}
                      </div>
                      {h.note && (
                        <div className="text-[11px]">
                          Note: {h.note}
                        </div>
                      )}
                    </div>
                  ))}
                  {!taskHistory.length && (
                    <div className="text-xs text-gray-500">
                      No history entries recorded.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dependencies */}
      {tab === "dependencies" && (
        <div className="space-y-4">
          <div className="text-sm font-semibold">
            Dependencies (Open or Linked to Plan/Task)
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-md p-3 bg-gray-50 space-y-2">
              <div>
                <div className="text-xs text-gray-700 mb-1">
                  Description
                </div>
                <textarea
                  rows={2}
                  value={depForm.description}
                  onChange={(e) =>
                    setDepForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border p-1.5 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-700 mb-1">
                    Plan Item (optional)
                  </div>
                  <select
                    value={depForm.planItemId}
                    onChange={(e) =>
                      setDepForm((f) => ({
                        ...f,
                        planItemId: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border p-1.5 text-xs"
                  >
                    <option value="">(None)</option>
                    {sortedPlan.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-xs text-gray-700 mb-1">
                    Task (optional)
                  </div>
                  <select
                    value={depForm.taskId}
                    onChange={(e) =>
                      setDepForm((f) => ({
                        ...f,
                        taskId: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border p-1.5 text-xs"
                  >
                    <option value="">(None)</option>
                    {sortedTasks.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-700 mb-1">Status</div>
                <select
                  value={depForm.status}
                  onChange={(e) =>
                    setDepForm((f) => ({
                      ...f,
                      status: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border p-1.5 text-xs"
                >
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
              </div>
              <button
                onClick={addDependency}
                className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs"
              >
                Add Dependency
              </button>
            </div>

            <div className="border rounded-md p-3 bg-white">
              <div className="text-xs font-semibold mb-2">
                Current Dependencies
              </div>
              <div className="space-y-2 text-xs">
                {deps.map((d) => {
                  const p =
                    sortedPlan.find((x) => x._id === d.planItemId) ||
                    d.planItemId;
                  const t =
                    sortedTasks.find((x) => x._id === d.taskId) ||
                    d.taskId;
                  return (
                    <div
                      key={d._id}
                      className="border rounded-md p-2 bg-gray-50"
                    >
                      <div className="flex justify-between">
                        <div className="font-medium">
                          {d.description}
                        </div>
                        <div className="text-[10px] text-gray-600">
                          {d.status}
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-600 mt-1">
                        Plan: {p?.title || displayUser(p) || "—"}
                        {" | "}
                        Task: {t?.title || displayUser(t) || "—"}
                      </div>
                    </div>
                  );
                })}
                {!deps.length && (
                  <div className="text-xs text-gray-500">
                    No dependencies defined yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard */}
      {tab === "dashboard" && (
        <div className="space-y-4">
          <div className="text-sm font-semibold">
            Project Dashboard (Quick View)
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded-md p-3 bg-white">
              <div className="text-[11px] text-gray-500">
                Tasks by Status
              </div>
              <div className="mt-2 space-y-1 text-xs">
                {dash?.tasksByStatus
                  ? Object.entries(dash.tasksByStatus).map(
                      ([k, v]) => (
                        <div
                          key={k}
                          className="flex justify-between"
                        >
                          <span>{k}</span>
                          <span className="font-semibold">{v}</span>
                        </div>
                      )
                    )
                  : "No data"}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="text-[11px] text-gray-500">
                Plan by Type
              </div>
              <div className="mt-2 space-y-1 text-xs">
                {dash?.planByType
                  ? Object.entries(dash.planByType).map(
                      ([k, v]) => (
                        <div
                          key={k}
                          className="flex justify-between"
                        >
                          <span>{k}</span>
                          <span className="font-semibold">{v}</span>
                        </div>
                      )
                    )
                  : "No data"}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-white">
              <div className="text-[11px] text-gray-500">
                Quick Facts
              </div>
              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Members</span>
                  <span className="font-semibold">
                    {members.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Plan Items</span>
                  <span className="font-semibold">
                    {plan.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tasks</span>
                  <span className="font-semibold">
                    {tasks.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Dependencies</span>
                  <span className="font-semibold">
                    {deps.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {!!msg.text && (
        <div
          className={`fixed bottom-4 right-4 px-3 py-2 rounded-md shadow text-xs ${
            msg.type === "err"
              ? "bg-red-600 text-white"
              : "bg-gray-900 text-white"
          }`}
        >
          {msg.text}
        </div>
      )}
    </div>
  );
}
