// // client/src/pages/OtherTasksList.jsx
// import { useEffect, useMemo, useState, useCallback } from "react";
// import { OtherTasksApi, OtherTaskTypesApi } from "../api/otherTasksApi";
// import OtherTaskForm from "../components/OtherTaskForm";
// import { useAuth } from "../context/AuthContext";
// import axios from "../api/axiosInstance";

// /** ---------- Small utils ---------- */
// const fmtDate = (d, withTime = true) => {
//   if (!d) return "";
//   const date = new Date(d);
//   return withTime ? date.toLocaleString() : date.toLocaleDateString();
// };
// const msToHrs = (ms) => (ms > 0 ? ms / (1000 * 60 * 60) : 0);

// // ceil to 2 decimals and return formatted string with exactly two digits
// const ceil2 = (val) => {
//   if (val == null || val === "") return "0.00";
//   const n = Number(val);
//   if (Number.isNaN(n)) return "0.00";
//   const up = Math.ceil(n * 100) / 100;
//   return up.toFixed(2);
// };

// const sessionDurationHrsNum = (s) => {
//   const from = s?.from ? new Date(s.from).getTime() : 0;
//   const to = s?.to ? new Date(s.to).getTime() : Date.now();
//   return msToHrs(to - from);
// };

// const statusColor = (status) => {
//   switch (status) {
//     case "In Progress":
//       return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
//     case "Paused":
//       return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
//     case "Done":
//       return "bg-blue-100 text-blue-700 ring-1 ring-blue-200";
//     default:
//       return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
//   }
// };

// // Button styles
// const btn = {
//   base:
//     "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
//   ghost:
//     "border border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-slate-300",
//   view:
//     "border border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50 focus:ring-indigo-300",
//   start:
//     "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-400",
//   pause:
//     "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-400",
//   resume:
//     "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-400",
//   done:
//     "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400",
//   edit:
//     "bg-slate-700 text-white hover:bg-slate-800 focus:ring-slate-400",
// };

// /** ---------- Drawer Components ---------- */
// function RightDrawer({ open, title, subtitle, onClose, children, widthClass = "w-[560px]" }) {
//   return (
//     <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
//       {/* overlay */}
//       <div
//         className={`absolute inset-0 bg-black/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
//         onClick={onClose}
//       />
//       {/* panel */}
//       <div
//         className={`absolute right-0 top-0 h-full bg-white shadow-2xl ${widthClass} transform transition-transform
//         ${open ? "translate-x-0" : "translate-x-full"}`}
//       >
//         <div className="border-b bg-gradient-to-r from-slate-50 to-white px-4 py-3">
//           <div className="flex items-start justify-between gap-4">
//             <div>
//               <h3 className="text-base font-semibold">{title}</h3>
//               {subtitle ? <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p> : null}
//             </div>
//             <button
//               onClick={onClose}
//               className="rounded-lg p-2 hover:bg-slate-100 text-slate-600"
//               aria-label="Close drawer"
//               title="Close"
//             >
//               <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
//               </svg>
//             </button>
//           </div>
//         </div>
//         <div className="h-[calc(100%-57px)] overflow-y-auto">{children}</div>
//       </div>
//     </div>
//   );
// }

// function Metric({ label, value, hint, className = "" }) {
//   return (
//     <div className={`rounded-xl border bg-white p-3 ${className}`}>
//       <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
//       <div className="mt-1 text-lg font-semibold">{value}</div>
//       {hint ? <div className="text-[11px] text-slate-400 mt-0.5">{hint}</div> : null}
//     </div>
//   );
// }

// function DrawerHeaderMetrics({ task }) {
//   const sessions = task?.workSessions || [];
//   const planned = Number(task?.durationPlannedHrs || 0);
//   const recorded = sessions.reduce((sum, s) => sum + sessionDurationHrsNum(s), 0);
//   // prefer actualHours if present, otherwise use recorded sessions
//   const actual = Number(task?.actualHours || recorded || 0);
//   const ratio = planned > 0 ? actual / planned : 0;
//   const pct = Math.round(ratio * 100);
//   const exceeded = planned > 0 && actual > planned;
//   const overBy = exceeded ? ceil2(actual - planned) : null;

//   return (
//     <div className="p-4">
//       <div className="grid grid-cols-3 gap-3">
//         <Metric label="Planned" value={`${ceil2(planned)} h`} />
//         <Metric
//           label="Actual"
//           value={`${ceil2(actual)} h`}
//           hint={exceeded ? `Over planned by ${overBy} h` : "Actual time logged"}
//           className={exceeded ? "bg-red-50 text-red-700 border-red-200" : ""}
//         />
//         <Metric
//           label="Progress"
//           value={`${pct}%`}
//           hint="Actual vs Planned"
//           className={exceeded ? "bg-red-50 text-red-700 border-red-200" : ""}
//         />
//       </div>

//       {/* Progress — warning when > 100% */}
//       <div className="mt-3">
//         <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
//           <div
//             className={`h-2 ${pct > 100 ? "bg-red-500" : "bg-gradient-to-r from-emerald-500 to-blue-500"}`}
//             style={{ width: `${Math.min(pct, 100)}%` }}
//             title={pct > 100 ? "Exceeded planned hours" : "Within plan"}
//           />
//         </div>
//         {pct > 100 && (
//           <div className="mt-1 text-[11px] text-red-600 font-medium">Warning: progress exceeded 100%</div>
//         )}
//       </div>
//     </div>
//   );
// }

// function WorkSessionsView({ sessions = [] }) {
//   const totalNum = sessions.reduce((sum, s) => sum + sessionDurationHrsNum(s), 0);
//   return (
//     <div className="p-4 space-y-3">
//       <div className="text-sm text-slate-600">
//         Total recorded time: <span className="font-medium">{ceil2(totalNum)} h</span>
//       </div>
//       <div className="rounded-xl border overflow-hidden">
//         <table className="min-w-full text-sm">
//           <thead className="bg-slate-50">
//             <tr className="text-slate-700">
//               <th className="p-2 text-left">#</th>
//               <th className="p-2 text-left">From</th>
//               <th className="p-2 text-left">To</th>
//               <th className="p-2 text-right">Hours</th>
//             </tr>
//           </thead>
//           <tbody className="[&>tr:hover]:bg-slate-50">
//             {sessions.length ? (
//               sessions.map((s, i) => (
//                 <tr key={`${s.from || "nofrom"}-${i}`} className="border-t">
//                   <td className="p-2">{i + 1}</td>
//                   <td className="p-2">{fmtDate(s.from)}</td>
//                   <td className="p-2">{s.to ? fmtDate(s.to) : <span className="text-amber-600">— running —</span>}</td>
//                   <td className="p-2 text-right">{ceil2(sessionDurationHrsNum(s))}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={4} className="p-6 text-center text-slate-500">
//                   No sessions found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// function StatusLogView({ log = [], usersById = {} }) {
//   return (
//     <div className="p-4">
//       <div className="rounded-xl border overflow-hidden">
//         <table className="min-w-full text-sm">
//           <thead className="bg-slate-50">
//             <tr className="text-slate-700">
//               <th className="p-2 text-left">When</th>
//               <th className="p-2 text-left">From → To</th>
//               <th className="p-2 text-left">Changed By</th>
//             </tr>
//           </thead>
//           <tbody className="[&>tr:hover]:bg-slate-50">
//             {log.length ? (
//               log
//                 .slice()
//                 .reverse()
//                 .map((l, i) => (
//                   <tr key={`${l.changedAt}-${i}`} className="border-t">
//                     <td className="p-2">{fmtDate(l.changedAt)}</td>
//                     <td className="p-2">
//                       <span className="px-2 py-0.5 text-xs rounded bg-slate-100 ring-1 ring-slate-200">
//                         {l.fromStatus || "—"}
//                       </span>
//                       <span className="mx-2">→</span>
//                       <span className="px-2 py-0.5 text-xs rounded bg-slate-100 ring-1 ring-slate-200">
//                         {l.toStatus || "—"}
//                       </span>
//                     </td>
//                     <td className="p-2">
//                       {usersById[l.changedBy]?.name || usersById[l.changedBy]?.email || l.changedBy || "—"}
//                     </td>
//                   </tr>
//                 ))
//             ) : (
//               <tr>
//                 <td colSpan={3} className="p-6 text-center text-slate-500">
//                   No status changes yet.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// function DetailsView({ task }) {
//   return (
//     <div className="p-4 space-y-6 text-sm">
//       <section className="rounded-xl border p-3">
//         <h4 className="font-semibold mb-2">Description</h4>
//         <div className="whitespace-pre-wrap leading-7 text-slate-800">{task?.description || "—"}</div>
//       </section>
//       <section className="rounded-xl border p-3">
//         <h4 className="font-semibold mb-2">Notes</h4>
//         <div className="whitespace-pre-wrap leading-7 text-slate-800">{task?.notes || "—"}</div>
//       </section>
//     </div>
//   );
// }

// /** ---------- Main Page ---------- */
// export default function OtherTasksList() {
//   const { user } = useAuth();

//   // --- Roles & permissions ---
//   const roles = (user?.roles || []).map((r) => (typeof r === "string" ? r : r.name));
//   const canViewAll = ["Admin", "System Administrator", "Project Manager"].some((r) => roles.includes(r));
//   const isSPS = roles.includes("Senior Project Supervisor");
//   const canAssign = ["Admin", "System Administrator", "Project Manager", "Senior Project Supervisor"].some((r) =>
//     roles.includes(r)
//   );

//   // --- My ID (robust) ---
//   const meId = useMemo(() => String(user?.id || user?._id || user?.user?._id || ""), [user]);

//   // --- State ---
//   const [data, setData] = useState({
//     items: [],
//     pagination: { page: 1, limit: 20, total: 0, pages: 0 },
//   });
//   const [filters, setFilters] = useState({
//     page: 1,
//     limit: 20,
//     status: "",
//     project: "",
//     typeId: "",
//     assignee: "",
//     q: "",
//     dateFrom: "",
//     dateTo: "",
//     sort: "createdDate",
//     dir: "desc",
//   });
//   const [types, setTypes] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [usersList, setUsersList] = useState([]);
//   const [usersById, setUsersById] = useState({});
//   const [showForm, setShowForm] = useState(false);
//   const [editTask, setEditTask] = useState(null);
//   const [busyId, setBusyId] = useState("");

//   // Drawer
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [drawerTab, setDrawerTab] = useState("details"); // "details" | "sessions" | "status"
//   const [drawerTask, setDrawerTask] = useState(null);

//   // --- Helpers ---
//   const statuses = ["To Do", "In Progress", "Paused", "Done"];
//   const isMine = (task) => {
//     const assigneeId = task?.assignee?._id ?? task?.assignee ?? "";
//     return String(assigneeId) === meId;
//   };
//   const changeFilter = (e) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({ ...prev, page: 1, [name]: value }));
//   };

//   // --- Load masters on mount ---
//   useEffect(() => {
//     (async () => {
//       const [t] = await Promise.all([OtherTasksApi.listTypes ? OtherTasksApi.listTypes() : OtherTaskTypesApi.list(true)]);
//       setTypes(t || []);

//       // Projects
//       const projRes = await axios.get("/projects", { params: { select: "name" } }).catch(() => ({ data: [] }));
//       setProjects(projRes.data || []);

//       // Users
//       if (canViewAll || isSPS) {
//         const uRes = await axios.get("/users", { params: { select: "name email" } }).catch(() => ({ data: [] }));
//         const arr = uRes.data || [];
//         setUsersList(arr);
//         const map = {};
//         arr.forEach((u) => (map[u._id] = u));
//         if (user?._id && !map[user._id]) map[user._id] = { _id: user._id, name: user?.name, email: user?.email };
//         setUsersById(map);
//       } else if (user?._id) {
//         setUsersById({ [user._id]: { _id: user._id, name: user?.name, email: user?.email } });
//       }
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // --- Load list ---
//   const load = useCallback(async () => {
//     const res = await OtherTasksApi.list(filters);
//     setData(res);
//   }, [filters]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   // --- Actions ---
//   const statusAction = async (task, action) => {
//     try {
//       if (!isMine(task)) return; // Only assignee can act
//       setBusyId(task._id);
//       if (action === "start") await OtherTasksApi.start(task._id);
//       if (action === "pause") await OtherTasksApi.pause(task._id);
//       if (action === "resume") await OtherTasksApi.resume(task._id);
//       if (action === "done") await OtherTasksApi.done(task._id);
//       await load();
//     } catch (e) {
//       alert(e?.response?.data?.message || "Action failed");
//     } finally {
//       setBusyId("");
//     }
//   };

//   const onSaved = () => {
//     setShowForm(false);
//     setEditTask(null);
//     load();
//   };

//   const pageInfo = data.pagination;

//   // keyboard: close drawer on ESC
//   useEffect(() => {
//     const onKey = (e) => {
//       if (e.key === "Escape") setDrawerOpen(false);
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, []);

//   return (
//     <div className="p-4">
//       {/* Hero / Header */}
//       <div className="mb-4 rounded-2xl border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4">
//           <div>
//             <h2 className="text-xl md:text-2xl font-semibold">Other Tasks</h2>
//             <p className="text-xs md:text-sm text-slate-300">
//               Track non-sprint work with time sessions, notes, and change history.
//             </p>
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               className={`${btn.base} ${btn.edit} shadow-sm`}
//               onClick={() => {
//                 setEditTask(null);
//                 setShowForm(true);
//               }}
//             >
//               <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M12 5v14M5 12h14" strokeLinecap="round" />
//               </svg>
//               New Task
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="mb-4 rounded-2xl border bg-white/60 backdrop-blur p-3 shadow-sm">
//         <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
//           <div>
//             <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
//             <select name="status" value={filters.status} onChange={changeFilter} className="w-full border rounded-lg px-2 py-2">
//               <option value="">All</option>
//               {statuses.map((s) => (
//                 <option key={s} value={s}>
//                   {s}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
//             <select name="project" value={filters.project} onChange={changeFilter} className="w-full border rounded-lg px-2 py-2">
//               <option value="">All</option>
//               {projects.map((p) => (
//                 <option key={p._id} value={p._id}>
//                   {p.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
//             <select name="typeId" value={filters.typeId} onChange={changeFilter} className="w-full border rounded-lg px-2 py-2">
//               <option value="">All</option>
//               {types.map((t) => (
//                 <option key={t._id} value={t._id}>
//                   {t.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {(canViewAll || isSPS) && (
//             <div>
//               <label className="block text-xs font-medium text-slate-600 mb-1">Assignee</label>
//               <select
//                 name="assignee"
//                 value={filters.assignee}
//                 onChange={changeFilter}
//                 className="w-full border rounded-lg px-2 py-2"
//               >
//                 <option value="">All</option>
//                 {usersList.map((u) => (
//                   <option key={u._id} value={u._id}>
//                     {u.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           <div className="md:col-span-2">
//             <label className="block text-xs font-medium text-slate-600 mb-1">Search</label>
//             <input
//               name="q"
//               value={filters.q}
//               onChange={changeFilter}
//               placeholder="Description..."
//               className="w-full border rounded-lg px-3 py-2"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-medium text-slate-600 mb-1">Date From</label>
//             <input
//               type="date"
//               name="dateFrom"
//               value={filters.dateFrom}
//               onChange={changeFilter}
//               className="w-full border rounded-lg px-2 py-2"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-medium text-slate-600 mb-1">Date To</label>
//             <input
//               type="date"
//               name="dateTo"
//               value={filters.dateTo}
//               onChange={changeFilter}
//               className="w-full border rounded-lg px-2 py-2"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-medium text-slate-600 mb-1">Sort</label>
//             <select name="sort" value={filters.sort} onChange={changeFilter} className="w-full border rounded-lg px-2 py-2">
//               <option value="createdDate">Created</option>
//               <option value="dueDate">Due</option>
//               <option value="status">Status</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs font-medium text-slate-600 mb-1">Dir</label>
//             <select name="dir" value={filters.dir} onChange={changeFilter} className="w-full border rounded-lg px-2 py-2">
//               <option value="desc">Desc</option>
//               <option value="asc">Asc</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Table Card */}
//       <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
//         {/* Inner scroll to avoid body scroll */}
//         <div className="max-h-[62vh] overflow-y-auto">
//           <table className="min-w-full text-sm">
//             <thead className="sticky top-0 z-10 bg-slate-100/90 backdrop-blur">
//               <tr className="text-slate-700">
//                 <th className="p-3 text-left">Status</th>
//                 <th className="p-3 text-left w-[360px]">Description</th>
//                 <th className="p-3 text-left w-[300px]">Notes</th>
//                 <th className="p-3 text-left">Type</th>
//                 <th className="p-3 text-left">Project</th>
//                 <th className="p-3 text-left">Assignee</th>
//                 <th className="p-3 text-right">Planned (h)</th>
//                 {/* <th className="p-3 text-right">Actual (h)</th> */}
//                 <th className="p-3 text-left">Created</th>
//                 <th className="p-3 text-left">Due</th>
//                 <th className="p-3 text-left">Completed</th>
//                 <th className="p-3 text-left">Sessions</th>
//                 <th className="p-3 text-left">Status Log</th>
//                 <th className="p-3 text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="[&>tr:nth-child(even)]:bg-slate-50/40">
//               {data.items.map((row) => {
//                 const mine = isMine(row);
//                 const sessions = row?.workSessions || [];
//                 const sessionCount = sessions.length;
//                 const sessionTotalNum = sessions.reduce((sum, s) => sum + sessionDurationHrsNum(s), 0);
//                 const statusLogCount = row?.statusChangeLog?.length || 0;
//                 const planned = Number(row.durationPlannedHrs || 0);
//                 const actual = Number(row.actualHours || 0);
//                 const exceeded = planned > 0 && actual > planned;

//                 return (
//                   <tr
//                     key={row._id}
//                     className={`border-t border-slate-200/70 hover:bg-slate-50 ${
//                       exceeded ? "bg-red-50/70" : ""
//                     }`}
//                   >
//                     <td className="p-3 align-top">
//                       <div className="flex items-center gap-2">
//                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${statusColor(row.status)}`}>
//                           <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
//                           {row.status}
//                         </span>
//                         {exceeded && (
//                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] bg-red-100 text-red-700 ring-1 ring-red-200">
//                             ⏱ Underestimated
//                           </span>
//                         )}
//                       </div>
//                     </td>

//                     {/* Description */}
//                     <td className="p-3 align-top">
//                       <div className="whitespace-pre-wrap leading-6 max-h-40 overflow-y-auto border rounded-xl p-2.5 bg-white shadow-inner">
//                         {row.description || "—"}
//                       </div>
//                       <div className="mt-2">
//                         <button
//                           className={`${btn.base} ${btn.view}`}
//                           onClick={() => {
//                             setDrawerTask(row);
//                             setDrawerTab("details");
//                             setDrawerOpen(true);
//                           }}
//                         >
//                           View Full
//                         </button>
//                       </div>
//                     </td>

//                     {/* Notes */}
//                     <td className="p-3 align-top">
//                       <div className="whitespace-pre-wrap leading-6 max-h-40 overflow-y-auto border rounded-xl p-2.5 bg-white shadow-inner">
//                         {row.notes || "—"}
//                       </div>
//                       <div className="mt-2">
//                         <button
//                           className={`${btn.base} ${btn.view}`}
//                           onClick={() => {
//                             setDrawerTask(row);
//                             setDrawerTab("details");
//                             setDrawerOpen(true);
//                           }}
//                         >
//                           View Full
//                         </button>
//                       </div>
//                     </td>

//                     <td className="p-3 align-top">{row?.typeId?.name || "-"}</td>
//                     <td className="p-3 align-top">{row?.project?.name || "—"}</td>
//                     <td className="p-3 align-top">
//                       {row?.assignee?.name ? (
//                         <>
//                           <div className="font-medium">{row.assignee.name}</div>
//                           <div className="text-xs text-slate-500">{row.assignee.email}</div>
//                         </>
//                       ) : (
//                         "—"
//                       )}
//                     </td>
//                     <td className="p-3 align-top text-right">{ceil2(planned)}</td>
//                     {/* <td className={`p-3 align-top text-right ${exceeded ? "text-red-700 font-semibold" : ""}`}>
//                       {ceil2(actual)}
//                     </td> */}
//                     <td className="p-3 align-top">{fmtDate(row.createdDate)}</td>
//                     <td className="p-3 align-top">{fmtDate(row.dueDate, false)}</td>
//                     <td className="p-3 align-top">{fmtDate(row.completedAt)}</td>

//                     {/* Sessions */}
//                     <td className="p-3 align-top">
//                       <button
//                         className={`${btn.base} ${btn.ghost}`}
//                         onClick={() => {
//                           setDrawerTask(row);
//                           setDrawerTab("sessions");
//                           setDrawerOpen(true);
//                         }}
//                         title="View work sessions"
//                       >
//                         {sessionCount} • {ceil2(sessionTotalNum)}h
//                       </button>
//                     </td>

//                     {/* Status log */}
//                     <td className="p-3 align-top">
//                       <button
//                         className={`${btn.base} ${btn.ghost}`}
//                         onClick={() => {
//                           setDrawerTask(row);
//                           setDrawerTab("status");
//                           setDrawerOpen(true);
//                         }}
//                         title="View status change log"
//                       >
//                         {statusLogCount} entries
//                       </button>
//                     </td>

//                     {/* Actions */}
//                     <td className="p-3 align-top">
//                       <div className="flex flex-wrap gap-2">
//                         {mine && row.status === "To Do" && (
//                           <button
//                             className={`${btn.base} ${btn.start}`}
//                             disabled={busyId === row._id}
//                             onClick={() => statusAction(row, "start")}
//                             title="Start"
//                           >
//                             ▶ Start
//                           </button>
//                         )}

//                         {mine && row.status === "In Progress" && (
//                           <>
//                             <button
//                               className={`${btn.base} ${btn.pause}`}
//                               disabled={busyId === row._id}
//                               onClick={() => statusAction(row, "pause")}
//                               title="Pause"
//                             >
//                               ❚❚ Pause
//                             </button>
//                             <button
//                               className={`${btn.base} ${btn.done}`}
//                               disabled={busyId === row._id}
//                               onClick={() => statusAction(row, "done")}
//                               title="Mark Done"
//                             >
//                               ✓ Done
//                             </button>
//                           </>
//                         )}

//                         {mine && row.status === "Paused" && (
//                           <button
//                             className={`${btn.base} ${btn.resume}`}
//                             disabled={busyId === row._id}
//                             onClick={() => statusAction(row, "resume")}
//                             title="Resume"
//                           >
//                             ⏵ Resume
//                           </button>
//                         )}

//                         {mine && row.status !== "Done" && (
//                           <button
//                             className={`${btn.base} ${btn.edit}`}
//                             onClick={() => {
//                               setEditTask(row);
//                               setShowForm(true);
//                             }}
//                             title="Edit task"
//                           >
//                             ✎ Edit
//                           </button>
//                         )}

//                         {!mine && <span className="text-xs text-slate-400">—</span>}
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//               {!data.items.length && (
//                 <tr>
//                   <td colSpan={14} className="p-8 text-center text-slate-500">
//                     No tasks found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Pagination */}
//       <div className="mt-4 flex items-center justify-between">
//         <div className="text-sm text-slate-600">
//           Page <span className="font-semibold">{pageInfo.page}</span> / {pageInfo.pages} &middot; Total{" "}
//           <span className="font-semibold">{pageInfo.total}</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             disabled={pageInfo.page <= 1}
//             onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
//             className={`${btn.base} ${btn.ghost} disabled:opacity-50`}
//           >
//             ← Prev
//           </button>
//           <button
//             disabled={pageInfo.page >= pageInfo.pages}
//             onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
//             className={`${btn.base} ${btn.ghost} disabled:opacity-50`}
//           >
//             Next →
//           </button>
//           <select
//             value={filters.limit}
//             onChange={(e) => setFilters((p) => ({ ...p, page: 1, limit: +e.target.value }))}
//             className="px-3 py-2 border rounded-lg text-sm"
//           >
//             {[10, 20, 50].map((n) => (
//               <option key={n} value={n}>
//                 {n}/page
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Create/Edit Modal */}
//       {showForm && (
//         <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
//             <div className="flex items-center justify-between p-3 border-b bg-slate-50">
//               <h4 className="font-semibold">{editTask ? "Edit Task" : "New Task"}</h4>
//               <button
//                 onClick={() => {
//                   setShowForm(false);
//                   setEditTask(null);
//                 }}
//                 className="rounded-lg p-2 hover:bg-slate-200 text-slate-600"
//                 title="Close"
//               >
//                 ✕
//               </button>
//             </div>
//             <div className="p-3">
//               <OtherTaskForm
//                 initial={editTask}
//                 onClose={() => {
//                   setShowForm(false);
//                   setEditTask(null);
//                 }}
//                 onSaved={onSaved}
//                 canAssign={canAssign}
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Side Drawer */}
//       <RightDrawer
//         open={drawerOpen}
//         onClose={() => setDrawerOpen(false)}
//         title={
//           drawerTask
//             ? `${drawerTask?.typeId?.name || "Task"} • ${drawerTask?.status || ""}`
//             : ""
//         }
//         subtitle={drawerTask?.description?.slice(0, 64)}
//       >
//         {drawerTask ? <DrawerHeaderMetrics task={drawerTask} /> : null}

//         {/* Tabs */}
//         <div className="px-4">
//           <div className="inline-flex rounded-xl border bg-white overflow-hidden shadow-sm">
//             <button
//               className={`px-4 py-2 text-sm ${drawerTab === "details" ? "bg-slate-100 font-semibold" : "bg-white hover:bg-slate-50"}`}
//               onClick={() => setDrawerTab("details")}
//             >
//               Details
//             </button>
//             <button
//               className={`px-4 py-2 text-sm border-l ${drawerTab === "sessions" ? "bg-slate-100 font-semibold" : "bg-white hover:bg-slate-50"}`}
//               onClick={() => setDrawerTab("sessions")}
//             >
//               Sessions
//             </button>
//             <button
//               className={`px-4 py-2 text-sm border-l ${drawerTab === "status" ? "bg-slate-100 font-semibold" : "bg-white hover:bg-slate-50"}`}
//               onClick={() => setDrawerTab("status")}
//             >
//               Status Log
//             </button>
//           </div>
//         </div>

//         {drawerTask && drawerTab === "details" && <DetailsView task={drawerTask} />}
//         {drawerTask && drawerTab === "sessions" && <WorkSessionsView sessions={drawerTask.workSessions || []} />}
//         {drawerTask && drawerTab === "status" && (
//           <StatusLogView log={drawerTask.statusChangeLog || []} usersById={usersById} />
//         )}
//       </RightDrawer>
//     </div>
//   );
// }


// client/src/pages/OtherTasksList.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { OtherTasksApi, OtherTaskTypesApi } from "../api/otherTasksApi";
import OtherTaskForm from "../components/OtherTaskForm";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axiosInstance";

/** ---------- Small utils ---------- */
const fmtDate = (d, withTime = true) => {
  if (!d) return "";
  const date = new Date(d);
  return withTime ? date.toLocaleString() : date.toLocaleDateString();
};
const msToHrs = (ms) => (ms > 0 ? ms / (1000 * 60 * 60) : 0);

// ceil to 2 decimals and return formatted string with exactly two digits (always rounding UP)
const ceil2 = (val) => {
  if (val == null || val === "") return "0.00";
  const n = Number(val);
  if (Number.isNaN(n)) return "0.00";
  const up = Math.ceil(n * 100) / 100;
  return up.toFixed(2);
};

const sessionDurationHrsNum = (s) => {
  const from = s?.from ? new Date(s.from).getTime() : 0;
  const to = s?.to ? new Date(s.to).getTime() : Date.now();
  return msToHrs(to - from);
};

const statusColor = (status) => {
  switch (status) {
    case "In Progress":
      return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
    case "Paused":
      return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
    case "Done":
      return "bg-blue-100 text-blue-700 ring-1 ring-blue-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
};

// Button styles
const btn = {
  base:
    "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  ghost:
    "border border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-slate-300",
  view:
    "border border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50 focus:ring-indigo-300",
  start:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-400",
  pause:
    "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-400",
  resume:
    "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-400",
  done:
    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400",
  edit:
    "bg-slate-700 text-white hover:bg-slate-800 focus:ring-slate-400",
};

/** ---------- Estimation assessment ---------- */
/**
 * ratio = actual / planned
 *  - ratio <= 0.50                        → "Bhot zyada he time select krlya" (very overestimated)
 *  - 0.50 < ratio <= 0.75                 → "Zyada time select krlya" (overestimated)
 *  - 0.75 < ratio <= 1.00                 → "OK Estimate"
 *  - ratio  > 1.00                        → "Underestimated"
 *
 * NOTE: We'll only DISPLAY these badges when the task status is "Done".
 */
const estimationBadge = (planned, actual) => {
  const p = Number(planned || 0);
  const a = Number(actual || 0);
  if (p <= 0) return null;
  const ratio = a / p;

  // if (ratio <= 0.5) {
  //   return {
  //     key: "very-over",
  //     text: "Very Over Estimated",
  //     className: "bg-fuchsia-100 text-fuchsia-700 ring-1 ring-fuchsia-200",
  //     tone: "over",
  //     ratio,
  //   };
  // }
  if (ratio <= 0.4) {
    return {
      key: "over",
      text: "Over Estimated",
      className: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
      tone: "over",
      ratio,
    };
  }
  if (ratio <= 1.0) {
    return {
      key: "ok",
      text: "OK Estimate",
      className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
      tone: "ok",
      ratio,
    };
  }
  return {
    key: "under",
    text: "Underestimated",
    className: "bg-red-100 text-red-700 ring-1 ring-red-200",
    tone: "under",
    ratio,
  };
};

/** ---------- Drawer Components ---------- */
function RightDrawer({ open, title, subtitle, onClose, children, widthClass = "w-[560px]" }) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      {/* overlay */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      {/* panel */}
      <div
        className={`absolute right-0 top-0 h-full bg-white shadow-2xl ${widthClass} transform transition-transform
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="border-b bg-gradient-to-r from-slate-50 to-white px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold">{title}</h3>
              {subtitle ? <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p> : null}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-slate-100 text-slate-600"
              aria-label="Close drawer"
              title="Close"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="h-[calc(100%-57px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function Metric({ label, value, hint, className = "" }) {
  return (
    <div className={`rounded-xl border bg-white p-3 ${className}`}>
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      {hint ? <div className="text-[11px] text-slate-400 mt-0.5">{hint}</div> : null}
    </div>
  );
}

function DrawerHeaderMetrics({ task }) {
  const sessions = task?.workSessions || [];
  const planned = Number(task?.durationPlannedHrs || 0);
  const recorded = sessions.reduce((sum, s) => sum + sessionDurationHrsNum(s), 0);
  // prefer actualHours if present, otherwise use recorded sessions
  const actual = Number(task?.actualHours || recorded || 0);

  const ratio = planned > 0 ? actual / planned : 0;
  const pct = Math.round(ratio * 100);
  const exceeded = planned > 0 && actual > planned;
  const overBy = exceeded ? ceil2(actual - planned) : null;

  // Only compute/display estimate badge in drawer when Done
  const estimate = task?.status === "Done" ? estimationBadge(planned, actual) : null;

  return (
    <div className="p-4">
      {/* Estimation badge on top of metrics — only for Done */}
      {estimate && (
        <div className="mb-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] ${estimate.className}`}>
            ⏳ {estimate.text} ({Math.round((estimate.ratio || 0) * 100)}%)
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Planned" value={`${ceil2(planned)} h`} />
        <Metric
          label="Actual"
          value={`${ceil2(actual)} h`}
          hint={exceeded ? `Over planned by ${overBy} h` : "Actual time logged"}
          className={exceeded ? "bg-red-50 text-red-700 border-red-200" : ""}
        />
        <Metric
          label="Progress"
          value={`${pct}%`}
          hint="Actual vs Planned"
          className={exceeded ? "bg-red-50 text-red-700 border-red-200" : ""}
        />
      </div>

      {/* Progress — warning when > 100% */}
      <div className="mt-3">
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-2 ${pct > 100 ? "bg-red-500" : "bg-gradient-to-r from-emerald-500 to-blue-500"}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
            title={pct > 100 ? "Exceeded planned hours" : "Within plan"}
          />
        </div>
        {pct > 100 && (
          <div className="mt-1 text-[11px] text-red-600 font-medium">Warning: progress exceeded 100%</div>
        )}
      </div>
    </div>
  );
}

function WorkSessionsView({ sessions = [] }) {
  const totalNum = sessions.reduce((sum, s) => sum + sessionDurationHrsNum(s), 0);
  return (
    <div className="p-4 space-y-3">
      <div className="text-sm text-slate-600">
        Total recorded time: <span className="font-medium">{ceil2(totalNum)} h</span>
      </div>
      <div className="rounded-xl border overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-slate-700">
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">From</th>
              <th className="p-2 text-left">To</th>
              <th className="p-2 text-right">Hours</th>
            </tr>
          </thead>
          <tbody className="[&>tr:hover]:bg-slate-50">
            {sessions.length ? (
              sessions.map((s, i) => (
                <tr key={`${s.from || "nofrom"}-${i}`} className="border-t">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{fmtDate(s.from)}</td>
                  <td className="p-2">{s.to ? fmtDate(s.to) : <span className="text-amber-600">— running —</span>}</td>
                  <td className="p-2 text-right">{ceil2(sessionDurationHrsNum(s))}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-500">
                  No sessions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusLogView({ log = [], usersById = {} }) {
  return (
    <div className="p-4">
      <div className="rounded-xl border overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-slate-700">
              <th className="p-2 text-left">When</th>
              <th className="p-2 text-left">From → To</th>
              <th className="p-2 text-left">Changed By</th>
            </tr>
          </thead>
          <tbody className="[&>tr:hover]:bg-slate-50">
            {log.length ? (
              log
                .slice()
                .reverse()
                .map((l, i) => (
                  <tr key={`${l.changedAt}-${i}`} className="border-t">
                    <td className="p-2">{fmtDate(l.changedAt)}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 text-xs rounded bg-slate-100 ring-1 ring-slate-200">
                        {l.fromStatus || "—"}
                      </span>
                      <span className="mx-2">→</span>
                      <span className="px-2 py-0.5 text-xs rounded bg-slate-100 ring-1 ring-slate-200">
                        {l.toStatus || "—"}
                      </span>
                    </td>
                    <td className="p-2">
                      {usersById[l.changedBy]?.name || usersById[l.changedBy]?.email || l.changedBy || "—"}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={3} className="p-6 text-center text-slate-500">
                  No status changes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DetailsView({ task }) {
  return (
    <div className="p-4 space-y-6 text-sm">
      <section className="rounded-xl border p-3">
        <h4 className="font-semibold mb-2">Description</h4>
        <div className="whitespace-pre-wrap leading-7 text-slate-800">{task?.description || "—"}</div>
      </section>
      <section className="rounded-xl border p-3">
        <h4 className="font-semibold mb-2">Notes</h4>
        <div className="whitespace-pre-wrap leading-7 text-slate-800">{task?.notes || "—"}</div>
      </section>
    </div>
  );
}

/** ---------- Main Page ---------- */
export default function OtherTasksList() {
  const { user } = useAuth();

  // Roles & permissions
  const roles = (user?.roles || []).map((r) => (typeof r === "string" ? r : r.name));
  const canViewAll = ["Admin", "System Administrator", "Project Manager"].some((r) => roles.includes(r));
  const isSPS = roles.includes("Senior Project Supervisor");
  const canAssign = ["Admin", "System Administrator", "Project Manager", "Senior Project Supervisor"].some((r) =>
    roles.includes(r)
  );

  // My ID (robust)
  const meId = useMemo(() => String(user?.id || user?._id || user?.user?._id || ""), [user]);

  // State
  const [data, setData] = useState({
    items: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: "",
    project: "",
    typeId: "",
    assignee: "",
    q: "",
    dateFrom: "",
    dateTo: "",
    sort: "createdDate",
    dir: "desc",
  });
  const [types, setTypes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [busyId, setBusyId] = useState("");

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState("details"); // "details" | "sessions" | "status"
  const [drawerTask, setDrawerTask] = useState(null);

  // Helpers
  const statuses = ["To Do", "In Progress", "Paused", "Done"];
  const isMine = (task) => {
    const assigneeId = task?.assignee?._id ?? task?.assignee ?? "";
    return String(assigneeId) === meId;
  };
  const changeFilter = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, page: 1, [name]: value }));
  };

  // Masters on mount
  useEffect(() => {
    (async () => {
      const [t] = await Promise.all([OtherTasksApi.listTypes ? OtherTasksApi.listTypes() : OtherTaskTypesApi.list(true)]);
      setTypes(t || []);

      const projRes = await axios.get("/projects", { params: { select: "name" } }).catch(() => ({ data: [] }));
      setProjects(projRes.data || []);

      if (canViewAll || isSPS) {
        const uRes = await axios.get("/users", { params: { select: "name email" } }).catch(() => ({ data: [] }));
        const arr = uRes.data || [];
        setUsersList(arr);
        const map = {};
        arr.forEach((u) => (map[u._id] = u));
        if (user?._id && !map[user._id]) map[user._id] = { _id: user._id, name: user?.name, email: user?.email };
        setUsersById(map);
      } else if (user?._id) {
        setUsersById({ [user._id]: { _id: user._id, name: user?.name, email: user?.email } });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load list
  const load = useCallback(async () => {
    const res = await OtherTasksApi.list(filters);
    setData(res);
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  // Actions
  const statusAction = async (task, action) => {
    try {
      if (!isMine(task)) return;
      setBusyId(task._id);
      if (action === "start") await OtherTasksApi.start(task._id);
      if (action === "pause") await OtherTasksApi.pause(task._id);
      if (action === "resume") await OtherTasksApi.resume(task._id);
      if (action === "done") await OtherTasksApi.done(task._id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Action failed");
    } finally {
      setBusyId("");
    }
  };

  const onSaved = () => {
    setShowForm(false);
    setEditTask(null);
    load();
  };

  const pageInfo = data.pagination;

  // close drawer on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4 rounded-2xl border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold">Other Tasks</h2>
            <p className="text-xs md:text-sm text-slate-300">
              Track non-sprint work with time sessions, notes, and change history.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`${btn.base} ${btn.edit} shadow-sm`}
              onClick={() => {
                setEditTask(null);
                setShowForm(true);
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              New Task
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-2xl border bg-white/60 backdrop-blur p-3 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select name="status" value={filters.status} onChange={changeFilter} className="w-full border rounded-lg px-2 py-2">
              <option value="">All</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
            <select name="project" value={filters.project} onChange={changeFilter} className="w-full border rounded-lg px-2 py-2">
              <option value="">All</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
            <select name="typeId" value={filters.typeId} onChange={changeFilter} className="w-full border rounded-lg px-2 py-2">
              <option value="">All</option>
              {types.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {(canViewAll || isSPS) && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assignee</label>
              <select
                name="assignee"
                value={filters.assignee}
                onChange={changeFilter}
                className="w-full border rounded-lg px-2 py-2"
              >
                <option value="">All</option>
                {usersList.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Search</label>
            <input
              name="q"
              value={filters.q}
              onChange={changeFilter}
              placeholder="Description..."
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Date From</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={changeFilter}
              className="w-full border rounded-lg px-2 py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Date To</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={changeFilter}
              className="w-full border rounded-lg px-2 py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Sort</label>
            <select name="sort" value={filters.sort} onChange={changeFilter} className="w-full border rounded-lg px-2 py-2">
              <option value="createdDate">Created</option>
              <option value="dueDate">Due</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Dir</label>
            <select name="dir" value={filters.dir} onChange={changeFilter} className="w-full border rounded-lg px-2 py-2">
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        {/* Inner scroll to avoid body scroll */}
        <div className="max-h-[62vh] overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-100/90 backdrop-blur">
              <tr className="text-slate-700">
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left w-[360px]">Description</th>
                <th className="p-3 text-left w-[300px]">Notes</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Project</th>
                <th className="p-3 text-left">Assignee</th>
                <th className="p-3 text-right">Planned (h)</th>
                <th className="p-3 text-right">Actual (h)</th>
                <th className="p-3 text-left">Created</th>
                <th className="p-3 text-left">Due</th>
                <th className="p-3 text-left">Completed</th>
                {/* <th className="p-3 text-left">Sessions</th>
                <th className="p-3 text-left">Status Log</th> */}
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="[&>tr:nth-child(even)]:bg-slate-50/40">
              {data.items.map((row) => {
                const mine = isMine(row);
                const sessions = row?.workSessions || [];
                const sessionCount = sessions.length;
                const sessionTotalNum = sessions.reduce((sum, s) => sum + sessionDurationHrsNum(s), 0);
                const statusLogCount = row?.statusChangeLog?.length || 0;

                const planned = Number(row.durationPlannedHrs || 0);
                const actual = Number(row.actualHours || 0);
                const exceeded = planned > 0 && actual > planned;

                // Only compute/display estimation badge when row is Done
                const estimate = row.status === "Done" ? estimationBadge(planned, actual) : null;

                return (
                  <tr
                    key={row._id}
                    className={`border-t border-slate-200/70 hover:bg-slate-50 ${
                      exceeded ? "bg-red-50/70" : ""
                    }`}
                  >
                    <td className="p-3 align-top">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${statusColor(row.status)}`}>
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                          {row.status}
                        </span>

                        {/* Estimation badge — only when Done */}
                        {estimate && (
                          <span
                            title={`Actual ${ceil2(actual)}h / Planned ${ceil2(planned)}h = ${Math.round(
                              (estimate.ratio || 0) * 100
                            )}%`}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] ${estimate.className}`}
                          >
                            ⏳ {estimate.text}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Description */}
                    <td className="p-3 align-top">
                      <div className="whitespace-pre-wrap leading-6 max-h-40 overflow-y-auto border rounded-xl p-2.5 bg-white shadow-inner">
                        {row.description || "—"}
                      </div>
                      <div className="mt-2">
                        <button
                          className={`${btn.base} ${btn.view}`}
                          onClick={() => {
                            setDrawerTask(row);
                            setDrawerTab("details");
                            setDrawerOpen(true);
                          }}
                        >
                          View Full
                        </button>
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="p-3 align-top">
                      <div className="whitespace-pre-wrap leading-6 max-h-40 overflow-y-auto border rounded-xl p-2.5 bg-white shadow-inner">
                        {row.notes || "—"}
                      </div>
                      <div className="mt-2">
                        <button
                          className={`${btn.base} ${btn.view}`}
                          onClick={() => {
                            setDrawerTask(row);
                            setDrawerTab("details");
                            setDrawerOpen(true);
                          }}
                        >
                          View Full
                        </button>
                      </div>
                    </td>

                    <td className="p-3 align-top">{row?.typeId?.name || "-"}</td>
                    <td className="p-3 align-top">{row?.project?.name || "—"}</td>
                    <td className="p-3 align-top">
                      {row?.assignee?.name ? (
                        <>
                          <div className="font-medium">{row.assignee.name}</div>
                          <div className="text-xs text-slate-500">{row.assignee.email}</div>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3 align-top text-right">{ceil2(planned)}</td>
                    <td className={`p-3 align-top text-right ${exceeded ? "text-red-700 font-semibold" : ""}`}>
                      {ceil2(actual)}
                    </td>
                    <td className="p-3 align-top">{fmtDate(row.createdDate)}</td>
                    <td className="p-3 align-top">{fmtDate(row.dueDate, false)}</td>
                    <td className="p-3 align-top">{fmtDate(row.completedAt)}</td>

                    {/* Sessions */}
                    {/* <td className="p-3 align-top">
                      <button
                        className={`${btn.base} ${btn.ghost}`}
                        onClick={() => {
                          setDrawerTask(row);
                          setDrawerTab("sessions");
                          setDrawerOpen(true);
                        }}
                        title="View work sessions"
                      >
                        {sessionCount} • {ceil2(sessionTotalNum)}h
                      </button>
                    </td> */}

                    {/* Status log */}
                    {/* <td className="p-3 align-top">
                      <button
                        className={`${btn.base} ${btn.ghost}`}
                        onClick={() => {
                          setDrawerTask(row);
                          setDrawerTab("status");
                          setDrawerOpen(true);
                        }}
                        title="View status change log"
                      >
                        {statusLogCount} entries
                      </button>
                    </td> */}

                    {/* Actions */}
                    <td className="p-3 align-top">
                      <div className="flex flex-wrap gap-2">
                        {mine && row.status === "To Do" && (
                          <button
                            className={`${btn.base} ${btn.start}`}
                            disabled={busyId === row._id}
                            onClick={() => statusAction(row, "start")}
                            title="Start"
                          >
                            ▶ Start
                          </button>
                        )}

                        {mine && row.status === "In Progress" && (
                          <>
                            <button
                              className={`${btn.base} ${btn.pause}`}
                              disabled={busyId === row._id}
                              onClick={() => statusAction(row, "pause")}
                              title="Pause"
                            >
                              ❚❚ Pause
                            </button>
                            <button
                              className={`${btn.base} ${btn.done}`}
                              disabled={busyId === row._id}
                              onClick={() => statusAction(row, "done")}
                              title="Mark Done"
                            >
                              ✓ Done
                            </button>
                          </>
                        )}

                        {mine && row.status === "Paused" && (
                          <button
                            className={`${btn.base} ${btn.resume}`}
                            disabled={busyId === row._id}
                            onClick={() => statusAction(row, "resume")}
                            title="Resume"
                          >
                            ⏵ Resume
                          </button>
                        )}

                        {mine && row.status !== "Done" && (
                          <button
                            className={`${btn.base} ${btn.edit}`}
                            onClick={() => {
                              setEditTask(row);
                              setShowForm(true);
                            }}
                            title="Edit task"
                          >
                            ✎ Edit
                          </button>
                        )}

                        {!mine && <span className="text-xs text-slate-400">—</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!data.items.length && (
                <tr>
                  <td colSpan={14} className="p-8 text-center text-slate-500">
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Page <span className="font-semibold">{pageInfo.page}</span> / {pageInfo.pages} &middot; Total{" "}
          <span className="font-semibold">{pageInfo.total}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={pageInfo.page <= 1}
            onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
            className={`${btn.base} ${btn.ghost} disabled:opacity-50`}
          >
            ← Prev
          </button>
          <button
            disabled={pageInfo.page >= pageInfo.pages}
            onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
            className={`${btn.base} ${btn.ghost} disabled:opacity-50`}
          >
            Next →
          </button>
          <select
            value={filters.limit}
            onChange={(e) => setFilters((p) => ({ ...p, page: 1, limit: +e.target.value }))}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}/page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b bg-slate-50">
              <h4 className="font-semibold">{editTask ? "Edit Task" : "New Task"}</h4>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditTask(null);
                }}
                className="rounded-lg p-2 hover:bg-slate-200 text-slate-600"
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-3">
              <OtherTaskForm
                initial={editTask}
                onClose={() => {
                  setShowForm(false);
                  setEditTask(null);
                }}
                onSaved={onSaved}
                canAssign={canAssign}
              />
            </div>
          </div>
        </div>
      )}

      {/* Side Drawer */}
      <RightDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerTask ? `${drawerTask?.typeId?.name || "Task"} • ${drawerTask?.status || ""}` : ""}
        subtitle={drawerTask?.description?.slice(0, 64)}
      >
        {drawerTask ? <DrawerHeaderMetrics task={drawerTask} /> : null}

        {/* Tabs */}
        <div className="px-4">
          <div className="inline-flex rounded-xl border bg-white overflow-hidden shadow-sm">
            <button
              className={`px-4 py-2 text-sm ${drawerTab === "details" ? "bg-slate-100 font-semibold" : "bg-white hover:bg-slate-50"}`}
              onClick={() => setDrawerTab("details")}
            >
              Details
            </button>
            <button
              className={`px-4 py-2 text-sm border-l ${drawerTab === "sessions" ? "bg-slate-100 font-semibold" : "bg-white hover:bg-slate-50"}`}
              onClick={() => setDrawerTab("sessions")}
            >
              Sessions
            </button>
            <button
              className={`px-4 py-2 text-sm border-l ${drawerTab === "status" ? "bg-slate-100 font-semibold" : "bg-white hover:bg-slate-50"}`}
              onClick={() => setDrawerTab("status")}
            >
              Status Log
            </button>
          </div>
        </div>

        {drawerTask && drawerTab === "details" && <DetailsView task={drawerTask} />}
        {drawerTask && drawerTab === "sessions" && <WorkSessionsView sessions={drawerTask.workSessions || []} />}
        {drawerTask && drawerTab === "status" && (
          <StatusLogView log={drawerTask.statusChangeLog || []} usersById={usersById} />
        )}
      </RightDrawer>
    </div>
  );
}
