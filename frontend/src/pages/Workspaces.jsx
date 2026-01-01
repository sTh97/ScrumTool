// // // src/pages/Workspaces.jsx
// // import React, { useEffect, useMemo, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import axios from "../api/axiosInstance";

// // const PAGE_SIZE = 10;

// // export default function Workspaces() {
// //   const navigate = useNavigate();

// //   const [loading, setLoading] = useState(true);
// //   const [rows, setRows] = useState([]); // only "workspace" projects (charter or members)
// //   const [msg, setMsg] = useState({ type: "", text: "" });

// //   const [q, setQ] = useState("");
// //   const [page, setPage] = useState(1);
// //   const [sortKey, setSortKey] = useState("updatedAt");
// //   const [sortDir, setSortDir] = useState("desc"); // asc | desc

// //   const toast = (text, type = "ok") => {
// //     setMsg({ type, text });
// //     setTimeout(() => setMsg({ type: "", text: "" }), 2800);
// //   };

// //   useEffect(() => {
// //     let cancelled = false;
// //     (async () => {
// //       try {
// //         setLoading(true);
// //         // 1) get all projects
// //         const projects = await axios
// //           .get("/projects")
// //           .then((r) => (Array.isArray(r.data) ? r.data : r.data?.projects || []));
// //         if (cancelled) return;

// //         // 2) for each project, probe charter & members to identify "workspaces"
// //         const enriched = await Promise.all(
// //           projects.map(async (p) => {
// //             const id = p._id;
// //             let charterInfo = null;
// //             let membersCount = null;

// //             // Charter (preferred probe — also gives approval status)
// //             try {
// //               const ch = await axios.get(`/workspace/projects/${id}/charter`);
// //               // if backend returns null, this is not a charter yet
// //               if (ch?.data) {
// //                 const { charter, signatures = [] } = ch.data || {};
// //                 if (charter?._id) {
// //                   const total = (charter.approvers || []).length;
// //                   const approved = signatures.filter((s) => s.status === "Approved").length;
// //                   charterInfo = {
// //                     hasCharter: true,
// //                     totalApprovers: total,
// //                     approvedCount: approved,
// //                     fullyApproved: total > 0 && approved === total,
// //                   };
// //                 }
// //               }
// //             } catch {
// //               // ignore 403/404; we'll try members next
// //             }

// //             // Members (secondary probe)
// //             if (!charterInfo) {
// //               try {
// //                 const mem = await axios.get(`/workspace/projects/${id}/members`);
// //                 if (Array.isArray(mem?.data)) {
// //                   membersCount = mem.data.length;
// //                 } else if (Array.isArray(mem?.data?.members)) {
// //                   membersCount = mem.data.members.length;
// //                 }
// //               } catch {
// //                 // ignore errors
// //               }
// //             }

// //             // If it has either a charter or at least one member, treat as workspace
// //             const isWorkspace = !!(charterInfo || (membersCount !== null && membersCount > 0));

// //             return {
// //               ...p,
// //               _workspace: {
// //                 isWorkspace,
// //                 charter: charterInfo || {
// //                   hasCharter: false,
// //                   totalApprovers: 0,
// //                   approvedCount: 0,
// //                   fullyApproved: false,
// //                 },
// //                 membersCount,
// //                 lastUpdated:
// //                   p.updatedAt ||
// //                   p.modifiedAt ||
// //                   p.createdAt ||
// //                   p.startDate ||
// //                   p.endDate ||
// //                   null,
// //             } };
// //           })
// //         );

// //         if (cancelled) return;
// //         // 3) Keep only workspace projects
// //         const onlyWorkspaces = enriched.filter((p) => p._workspace?.isWorkspace);
// //         setRows(onlyWorkspaces);
// //       } catch (e) {
// //         if (!cancelled) toast(e?.response?.data?.message || e.message || "Failed to load workspaces", "err");
// //       } finally {
// //         if (!cancelled) setLoading(false);
// //       }
// //     })();
// //     return () => { cancelled = true; };
// //   }, []);

// //   // filtering + sorting
// //   const filtered = useMemo(() => {
// //     let r = [...rows];
// //     if (q.trim()) {
// //       const k = q.trim().toLowerCase();
// //       r = r.filter((p) =>
// //         (p.name || "").toLowerCase().includes(k) ||
// //         (p.code || "").toLowerCase().includes(k) ||
// //         (p.description || "").toLowerCase().includes(k)
// //       );
// //     }
// //     r.sort((a, b) => {
// //       const av = a?.[sortKey] ?? a?._workspace?.lastUpdated ?? "";
// //       const bv = b?.[sortKey] ?? b?._workspace?.lastUpdated ?? "";
// //       // try date compare
// //       const aNum = new Date(av).getTime();
// //       const bNum = new Date(bv).getTime();
// //       if (!isNaN(aNum) && !isNaN(bNum)) {
// //         return sortDir === "asc" ? aNum - bNum : bNum - aNum;
// //       }
// //       // string fallback
// //       const A = String(av).toLowerCase();
// //       const B = String(bv).toLowerCase();
// //       if (A < B) return sortDir === "asc" ? -1 : 1;
// //       if (A > B) return sortDir === "asc" ? 1 : -1;
// //       return 0;
// //     });
// //     return r;
// //   }, [rows, q, sortKey, sortDir]);

// //   const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
// //   const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

// //   const toggleSort = (key) => {
// //     if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
// //     else { setSortKey(key); setSortDir("asc"); }
// //     setPage(1);
// //   };

// //   const openWorkspace = (id) => navigate(`/projects/${id}`);

// //   return (
// //     <div className="p-6">
// //       <div className="flex items-center justify-between">
// //         <h2 className="text-2xl font-bold">Project Workspaces</h2>
// //         <button
// //           onClick={() => navigate("/workspaces/new")}
// //           className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-500"
// //         >
// //           New Workspace
// //         </button>
// //       </div>

// //       {msg.text && (
// //         <div
// //           className={`mt-3 rounded-md px-3 py-2 ${
// //             msg.type === "err"
// //               ? "bg-rose-950/40 border border-rose-800 text-rose-200"
// //               : "bg-green-950/40 border border-green-800 text-green-200"
// //           }`}
// //         >
// //           {msg.text}
// //         </div>
// //       )}

// //       <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900 p-4">
// //         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
// //           <input
// //             value={q}
// //             onChange={(e) => { setQ(e.target.value); setPage(1); }}
// //             placeholder="Search by project name, code, or description…"
// //             className="w-full md:max-w-sm rounded-lg border border-gray-800 bg-gray-950 p-2 text-gray-100"
// //           />
// //           <div className="text-xs text-gray-400">Total workspaces: {filtered.length}</div>
// //         </div>

// //         <div className="mt-4 overflow-auto">
// //           <table className="min-w-full text-sm">
// //             <thead>
// //               <tr className="text-left text-gray-400">
// //                 <th className="py-2 pr-4 cursor-pointer" onClick={() => toggleSort("name")}>
// //                   Project {sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
// //                 </th>
// //                 <th className="py-2 pr-4">Code</th>
// //                 <th className="py-2 pr-4">Charter</th>
// //                 <th className="py-2 pr-4">Approvals</th>
// //                 <th className="py-2 pr-4">Members</th>
// //                 <th className="py-2 pr-4 cursor-pointer" onClick={() => toggleSort("updatedAt")}>
// //                   Updated {sortKey === "updatedAt" ? (sortDir === "asc" ? "↑" : "↓") : ""}
// //                 </th>
// //                 <th className="py-2 pr-4">Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {loading ? (
// //                 <tr><td colSpan={7} className="py-6 text-center text-gray-400">Loading…</td></tr>
// //               ) : pageRows.length ? (
// //                 pageRows.map((p) => {
// //                   const ws = p._workspace || {};
// //                   const ch = ws.charter || {};
// //                   const approvers = `${ch.approvedCount || 0}/${ch.totalApprovers || 0}`;
// //                   const charterStatus = ch.hasCharter
// //                     ? ch.fullyApproved
// //                       ? "Approved"
// //                       : "Awaiting approval"
// //                     : "Not created";

// //                   return (
// //                     <tr key={p._id} className="border-t border-gray-800">
// //                       <td className="py-2 pr-4 text-gray-100">{p.name}</td>
// //                       <td className="py-2 pr-4 text-gray-300">{p.code || "-"}</td>
// //                       <td className="py-2 pr-4">
// //                         <span className={`inline-flex rounded-full px-2 py-0.5 text-xxs font-medium
// //                           ${charterStatus === "Approved" ? "bg-green-700 text-green-50" :
// //                             charterStatus === "Awaiting approval" ? "bg-amber-700 text-amber-50" :
// //                             "bg-gray-700 text-gray-100"}`}>
// //                           {charterStatus}
// //                         </span>
// //                       </td>
// //                       <td className="py-2 pr-4 text-gray-300">{approvers}</td>
// //                       <td className="py-2 pr-4 text-gray-300">{ws.membersCount ?? "—"}</td>
// //                       <td className="py-2 pr-4 text-gray-400">
// //                         {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-"}
// //                       </td>
// //                       <td className="py-2 pr-4">
// //                         <div className="flex flex-wrap gap-2">
// //                           <button
// //                             onClick={() => openWorkspace(p._id)}
// //                             className="text-xs rounded-md bg-gray-800 px-2 py-1 text-gray-100 hover:bg-gray-700"
// //                           >
// //                             Open Workspace
// //                           </button>
// //                           {!ch.hasCharter && (
// //                             <button
// //                               onClick={() => navigate(`/workspaces/new?project=${p._id}`)}
// //                               className="text-xs rounded-md bg-blue-800 px-2 py-1 text-white hover:bg-blue-700"
// //                             >
// //                               Continue Setup
// //                             </button>
// //                           )}
// //                         </div>
// //                       </td>
// //                     </tr>
// //                   );
// //                 })
// //               ) : (
// //                 <tr><td colSpan={7} className="py-6 text-center text-gray-400">
// //                   No workspaces yet. Click <b>New Workspace</b> to set one up.
// //                 </td></tr>
// //               )}
// //             </tbody>
// //           </table>
// //         </div>

// //         {/* Pagination */}
// //         {!loading && filtered.length > PAGE_SIZE && (
// //           <div className="mt-4 flex items-center gap-2">
// //             <button
// //               onClick={() => setPage((p) => Math.max(1, p - 1))}
// //               disabled={page === 1}
// //               className="px-3 py-1 rounded-md bg-gray-800 text-gray-100 disabled:opacity-40"
// //             >
// //               Prev
// //             </button>
// //             <div className="text-xs text-gray-300">Page {page} of {totalPages}</div>
// //             <button
// //               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
// //               disabled={page === totalPages}
// //               className="px-3 py-1 rounded-md bg-gray-800 text-gray-100 disabled:opacity-40"
// //             >
// //               Next
// //             </button>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }


// // src/pages/Workspaces.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "../api/axiosInstance";

// const PAGE_SIZE = 10;

// export default function Workspaces() {
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(true);
//   const [rows, setRows] = useState([]); // only "workspace" projects (charter or members)
//   const [msg, setMsg] = useState({ type: "", text: "" });

//   const [q, setQ] = useState("");
//   const [page, setPage] = useState(1);
//   const [sortKey, setSortKey] = useState("updatedAt");
//   const [sortDir, setSortDir] = useState("desc"); // asc | desc

//   const toast = (text, type = "ok") => {
//     setMsg({ type, text });
//     setTimeout(() => setMsg({ type: "", text: "" }), 2800);
//   };

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         setLoading(true);
//         // 1) get all projects
//         const projects = await axios
//           .get("/projects")
//           .then((r) => (Array.isArray(r.data) ? r.data : r.data?.projects || []));
//         if (cancelled) return;

//         // 2) for each project, probe charter & members to identify "workspaces"
//         const enriched = await Promise.all(
//           projects.map(async (p) => {
//             const id = p._id;
//             let charterInfo = null;
//             let membersCount = null;

//             // Charter (preferred probe — also gives approval status)
//             try {
//               const ch = await axios.get(`/workspace/projects/${id}/charter`);
//               if (ch?.data) {
//                 const { charter, signatures = [] } = ch.data || {};
//                 if (charter?._id) {
//                   const total = (charter.approvers || []).length;
//                   const approved = signatures.filter((s) => s.status === "Approved").length;
//                   charterInfo = {
//                     hasCharter: true,
//                     totalApprovers: total,
//                     approvedCount: approved,
//                     fullyApproved: total > 0 && approved === total,
//                   };
//                 }
//               }
//             } catch {
//               // ignore 403/404; we'll try members next
//             }

//             // Members (secondary probe)
//             if (!charterInfo) {
//               try {
//                 const mem = await axios.get(`/workspace/projects/${id}/members`);
//                 if (Array.isArray(mem?.data)) {
//                   membersCount = mem.data.length;
//                 } else if (Array.isArray(mem?.data?.members)) {
//                   membersCount = mem.data.members.length;
//                 }
//               } catch {
//                 // ignore errors
//               }
//             }

//             // Dashboard summary (plan/tasks/dependencies)
//             // Not mandatory — tolerate 404/403 and default to zeros.
//             let dash = null;
//             try {
//               const d = await axios.get(`/workspace/projects/${id}/dashboard`);
//               dash = d?.data || null;
//             } catch {
//               dash = null;
//             }

//             // Aggregate task status counts from tasksByAssignee if present
//             const statusBuckets = ["New", "In Progress", "Hold", "Completed", "Re Opened"];
//             const taskStatusTotals = statusBuckets.reduce((acc, k) => ({ ...acc, [k]: 0 }), {});
//             if (dash?.tasksByAssignee) {
//               Object.values(dash.tasksByAssignee).forEach((bucket) => {
//                 statusBuckets.forEach((k) => {
//                   taskStatusTotals[k] += Number(bucket?.[k] || 0);
//                 });
//               });
//             }

//             const isWorkspace = !!(charterInfo || (membersCount !== null && membersCount > 0));

//             return {
//               ...p,
//               _workspace: {
//                 isWorkspace,
//                 charter: charterInfo || {
//                   hasCharter: false,
//                   totalApprovers: 0,
//                   approvedCount: 0,
//                   fullyApproved: false,
//                 },
//                 membersCount,
//                 lastUpdated:
//                   p.updatedAt ||
//                   p.modifiedAt ||
//                   p.createdAt ||
//                   p.startDate ||
//                   p.endDate ||
//                   null,
//                 dashboard: {
//                   planCount: dash?.planCount ?? 0,
//                   tasksCount: dash?.tasksCount ?? 0,
//                   dependenciesCount: dash?.dependenciesCount ?? 0,
//                   statuses: taskStatusTotals,
//                 },
//               },
//             };
//           })
//         );

//         if (cancelled) return;
//         // 3) Keep only workspace projects
//         const onlyWorkspaces = enriched.filter((p) => p._workspace?.isWorkspace);
//         setRows(onlyWorkspaces);
//       } catch (e) {
//         if (!cancelled) toast(e?.response?.data?.message || e.message || "Failed to load workspaces", "err");
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();
//     return () => { cancelled = true; };
//   }, []);

//   // filtering + sorting
//   const filtered = useMemo(() => {
//     let r = [...rows];
//     if (q.trim()) {
//       const k = q.trim().toLowerCase();
//       r = r.filter((p) =>
//         (p.name || "").toLowerCase().includes(k) ||
//         (p.code || "").toLowerCase().includes(k) ||
//         (p.description || "").toLowerCase().includes(k)
//       );
//     }
//     r.sort((a, b) => {
//       const av = a?.[sortKey] ?? a?._workspace?.lastUpdated ?? "";
//       const bv = b?.[sortKey] ?? b?._workspace?.lastUpdated ?? "";
//       // try date compare
//       const aNum = new Date(av).getTime();
//       const bNum = new Date(bv).getTime();
//       if (!isNaN(aNum) && !isNaN(bNum)) {
//         return sortDir === "asc" ? aNum - bNum : bNum - aNum;
//       }
//       // string fallback
//       const A = String(av).toLowerCase();
//       const B = String(bv).toLowerCase();
//       if (A < B) return sortDir === "asc" ? -1 : 1;
//       if (A > B) return sortDir === "asc" ? 1 : -1;
//       return 0;
//     });
//     return r;
//   }, [rows, q, sortKey, sortDir]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
//   const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   const toggleSort = (key) => {
//     if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
//     else { setSortKey(key); setSortDir("asc"); }
//     setPage(1);
//   };

//   const openWorkspace = (id) => navigate(`/projects/${id}`);
//   const openDashboard = (id) => navigate(`/projects/${id}?tab=dashboard`);

//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-2xl font-bold">Project Workspaces</h2>
//         <button
//           onClick={() => navigate("/workspaces/new")}
//           className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-500"
//         >
//           New Workspace
//         </button>
//       </div>

//       {msg.text && (
//         <div
//           className={`mt-3 rounded-md px-3 py-2 ${
//             msg.type === "err"
//               ? "bg-rose-950/40 border border-rose-800 text-rose-200"
//               : "bg-green-950/40 border border-green-800 text-green-200"
//           }`}
//         >
//           {msg.text}
//         </div>
//       )}

//       <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900 p-4">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//           <input
//             value={q}
//             onChange={(e) => { setQ(e.target.value); setPage(1); }}
//             placeholder="Search by project name, code, or description…"
//             className="w-full md:max-w-sm rounded-lg border border-gray-800 bg-gray-950 p-2 text-gray-100"
//           />
//           <div className="text-xs text-gray-400">Total workspaces: {filtered.length}</div>
//         </div>

//         <div className="mt-4 overflow-auto">
//           <table className="min-w-full text-sm">
//             <thead>
//               <tr className="text-left text-gray-400">
//                 <th className="py-2 pr-4 cursor-pointer" onClick={() => toggleSort("name")}>
//                   Project {sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
//                 </th>
//                 <th className="py-2 pr-4">Code</th>
//                 <th className="py-2 pr-4">Charter</th>
//                 <th className="py-2 pr-4">Approvals</th>
//                 <th className="py-2 pr-4">Members</th>
//                 <th className="py-2 pr-4">Plan</th>
//                 <th className="py-2 pr-4">Tasks</th>
//                 <th className="py-2 pr-4">Dependencies</th>
//                 <th className="py-2 pr-4 cursor-pointer" onClick={() => toggleSort("updatedAt")}>
//                   Updated {sortKey === "updatedAt" ? (sortDir === "asc" ? "↑" : "↓") : ""}
//                 </th>
//                 <th className="py-2 pr-4">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr><td colSpan={10} className="py-6 text-center text-gray-400">Loading…</td></tr>
//               ) : pageRows.length ? (
//                 pageRows.map((p) => {
//                   const ws = p._workspace || {};
//                   const ch = ws.charter || {};
//                   const approvers = `${ch.approvedCount || 0}/${ch.totalApprovers || 0}`;
//                   const charterStatus = ch.hasCharter
//                     ? ch.fullyApproved
//                       ? "Approved"
//                       : "Awaiting approval"
//                     : "Not created";

//                   const dash = ws.dashboard || { planCount: 0, tasksCount: 0, dependenciesCount: 0, statuses: {} };
//                   const s = dash.statuses || {};
//                   const taskBreakdown = [
//                     s["Completed"] ? `✅ ${s["Completed"]}` : null,
//                     s["In Progress"] ? `▶️ ${s["In Progress"]}` : null,
//                     s["Hold"] ? `⏸️ ${s["Hold"]}` : null,
//                     s["Re Opened"] ? `🔁 ${s["Re Opened"]}` : null,
//                     s["New"] ? `🆕 ${s["New"]}` : null,
//                   ].filter(Boolean).join("  ");

//                   return (
//                     <tr key={p._id} className="border-t border-gray-800">
//                       <td className="py-2 pr-4 text-gray-100">{p.name}</td>
//                       <td className="py-2 pr-4 text-gray-300">{p.code || "-"}</td>
//                       <td className="py-2 pr-4">
//                         <span className={`inline-flex rounded-full px-2 py-0.5 text-xxs font-medium
//                           ${charterStatus === "Approved" ? "bg-green-700 text-green-50" :
//                             charterStatus === "Awaiting approval" ? "bg-amber-700 text-amber-50" :
//                             "bg-gray-700 text-gray-100"}`}>
//                           {charterStatus}
//                         </span>
//                       </td>
//                       <td className="py-2 pr-4 text-gray-300">{approvers}</td>
//                       <td className="py-2 pr-4 text-gray-300">{ws.membersCount ?? "—"}</td>
//                       <td className="py-2 pr-4 text-gray-300">{dash.planCount}</td>
//                       <td className="py-2 pr-4 text-gray-300">
//                         {dash.tasksCount}
//                         {taskBreakdown ? <div className="text-xxs text-gray-400 mt-0.5">{taskBreakdown}</div> : null}
//                       </td>
//                       <td className="py-2 pr-4 text-gray-300">{dash.dependenciesCount}</td>
//                       <td className="py-2 pr-4 text-gray-400">
//                         {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-"}
//                       </td>
//                       <td className="py-2 pr-4">
//                         <div className="flex flex-wrap gap-2">
//                           <button
//                             onClick={() => openWorkspace(p._id)}
//                             className="text-xs rounded-md bg-gray-800 px-2 py-1 text-gray-100 hover:bg-gray-700"
//                           >
//                             Open Workspace
//                           </button>
//                           <button
//                             onClick={() => openDashboard(p._id)}
//                             className="text-xs rounded-md bg-black px-2 py-1 text-white hover:bg-gray-800"
//                           >
//                             View Dashboard
//                           </button>
//                           {!ch.hasCharter && (
//                             <button
//                               onClick={() => navigate(`/workspaces/new?project=${p._id}`)}
//                               className="text-xs rounded-md bg-blue-800 px-2 py-1 text-white hover:bg-blue-700"
//                             >
//                               Continue Setup
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr><td colSpan={10} className="py-6 text-center text-gray-400">
//                   No workspaces yet. Click <b>New Workspace</b> to set one up.
//                 </td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {!loading && filtered.length > PAGE_SIZE && (
//           <div className="mt-4 flex items-center gap-2">
//             <button
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page === 1}
//               className="px-3 py-1 rounded-md bg-gray-800 text-gray-100 disabled:opacity-40"
//             >
//               Prev
//             </button>
//             <div className="text-xs text-gray-300">Page {page} of {totalPages}</div>
//             <button
//               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               disabled={page === totalPages}
//               className="px-3 py-1 rounded-md bg-gray-800 text-gray-100 disabled:opacity-40"
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



// src/pages/Workspaces.jsx
// src/pages/Workspaces.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";

const PAGE_SIZE = 10;

export default function Workspaces() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("updatedAt");
  const [sortDir, setSortDir] = useState("desc");

  const toast = (text, type = "ok") => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 2800);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const projects = await axios
          .get("/projects")
          .then((r) => (Array.isArray(r.data) ? r.data : r.data?.projects || []));
        if (cancelled) return;

        const enriched = await Promise.all(
          projects.map(async (p) => {
            const id = p._id;
            let charterInfo = null;
            let membersCount = null;

            try {
              const ch = await axios.get(`/workspace/projects/${id}/charter`);
              if (ch?.data) {
                const { charter, signatures = [] } = ch.data || {};
                if (charter?._id) {
                  const total = (charter.approvers || []).length;
                  const approved = signatures.filter((s) => s.status === "Approved").length;
                  charterInfo = {
                    hasCharter: true,
                    totalApprovers: total,
                    approvedCount: approved,
                    fullyApproved: total > 0 && approved === total,
                  };
                }
              }
            } catch {}

            if (!charterInfo) {
              try {
                const mem = await axios.get(`/workspace/projects/${id}/members`);
                if (Array.isArray(mem?.data)) {
                  membersCount = mem.data.length;
                } else if (Array.isArray(mem?.data?.members)) {
                  membersCount = mem.data.members.length;
                }
              } catch {}
            }

            const isWorkspace = !!(charterInfo || (membersCount !== null && membersCount > 0));

            return {
              ...p,
              _workspace: {
                isWorkspace,
                charter:
                  charterInfo || { hasCharter: false, totalApprovers: 0, approvedCount: 0, fullyApproved: false },
                membersCount,
                lastUpdated:
                  p.updatedAt || p.modifiedAt || p.createdAt || p.startDate || p.endDate || null,
              },
            };
          })
        );

        if (cancelled) return;
        setRows(enriched.filter((p) => p._workspace?.isWorkspace));
      } catch (e) {
        if (!cancelled) toast(e?.response?.data?.message || e.message || "Failed to load workspaces", "err");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let r = [...rows];
    if (q.trim()) {
      const k = q.trim().toLowerCase();
      r = r.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(k) ||
          (p.code || "").toLowerCase().includes(k) ||
          (p.description || "").toLowerCase().includes(k)
      );
    }
    r.sort((a, b) => {
      const av = a?.[sortKey] ?? a?._workspace?.lastUpdated ?? "";
      const bv = b?.[sortKey] ?? b?._workspace?.lastUpdated ?? "";
      const aNum = new Date(av).getTime();
      const bNum = new Date(bv).getTime();
      if (!isNaN(aNum) && !isNaN(bNum)) return sortDir === "asc" ? aNum - bNum : bNum - aNum;
      const A = String(av).toLowerCase();
      const B = String(bv).toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [rows, q, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const openWorkspace = (id) => navigate(`/projects/${id}`);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Project Workspaces</h2>
        <button
          onClick={() => navigate("/workspaces/new")}
          className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-500"
        >
          New Workspace
        </button>
      </div>

      {msg.text && (
        <div
          className={`mt-3 rounded-md px-3 py-2 ${
            msg.type === "err"
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by project name, code, or description…"
            className="w-full md:max-w-sm rounded-lg border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-400"
          />
          <div className="text-xs text-gray-600">Total workspaces: {filtered.length}</div>
        </div>

        <div className="mt-4 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-4 cursor-pointer" onClick={() => toggleSort("name")}>
                  Project {sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="py-2 pr-4">Code</th>
                <th className="py-2 pr-4">Charter</th>
                <th className="py-2 pr-4">Approvals</th>
                <th className="py-2 pr-4">Members</th>
                <th className="py-2 pr-4 cursor-pointer" onClick={() => toggleSort("updatedAt")}>
                  Updated {sortKey === "updatedAt" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-600">
                    Loading…
                  </td>
                </tr>
              ) : pageRows.length ? (
                pageRows.map((p) => {
                  const ws = p._workspace || {};
                  const ch = ws.charter || {};
                  const approvers = `${ch.approvedCount || 0}/${ch.totalApprovers || 0}`;
                  const charterStatus = ch.hasCharter
                    ? ch.fullyApproved
                      ? "Approved"
                      : "Awaiting approval"
                    : "Not created";

                  return (
                    <tr key={p._id} className="border-t border-gray-200">
                      <td className="py-2 pr-4 text-gray-900">{p.name}</td>
                      <td className="py-2 pr-4 text-gray-700">{p.code || "-"}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xxs font-medium ${
                            charterStatus === "Approved"
                              ? "bg-green-100 text-green-800"
                              : charterStatus === "Awaiting approval"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {charterStatus}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-gray-700">{approvers}</td>
                      <td className="py-2 pr-4 text-gray-700">{ws.membersCount ?? "—"}</td>
                      <td className="py-2 pr-4 text-gray-600">
                        {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-"}
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openWorkspace(p._id)}
                            className="text-xs rounded-md bg-gray-900 px-2 py-1 text-white hover:bg-gray-800"
                          >
                            Open Workspace
                          </button>
                          {!ch.hasCharter && (
                            <button
                              onClick={() => navigate(`/workspaces/new?project=${p._id}`)}
                              className="text-xs rounded-md bg-blue-600 px-2 py-1 text-white hover:bg-blue-500"
                            >
                              Continue Setup
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-600">
                    No workspaces yet. Click <b>New Workspace</b> to set one up.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > PAGE_SIZE && (
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-900 disabled:opacity-40"
            >
              Prev
            </button>
            <div className="text-xs text-gray-700">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-900 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
