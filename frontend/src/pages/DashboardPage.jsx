// import React, { useEffect, useMemo, useRef, useState } from "react";
// import axios from "../api/axiosInstance";
// import { useAuth } from "../context/AuthContext";
// import { Bar, Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler,
// } from "chart.js";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// );

// // Palette
// const C = {
//   blue: "#3B82F6",
//   blueA: "rgba(59,130,246,.2)",
//   green: "#10B981",
//   greenA: "rgba(16,185,129,.2)",
//   amber: "#F59E0B",
//   amberA: "rgba(245,158,11,.2)",
//   red: "#EF4444",
//   redA: "rgba(239,68,68,.2)",
//   violet: "#8B5CF6",
//   violetA: "rgba(139,92,246,.2)",
//   indigo: "#6366F1",
//   indigoA: "rgba(99,102,241,.15)",
//   gray600: "#4B5563",
//   gray200: "#E5E7EB",
//   gray300: "#D1D5DB",
// };

// const baseChartOpts = {
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: {
//     legend: { position: "top", labels: { color: C.gray600 } },
//     tooltip: { intersect: false, mode: "index" },
//   },
//   scales: {
//     x: { ticks: { color: C.gray600 }, grid: { color: C.gray200 } },
//     y: { ticks: { color: C.gray600 }, grid: { color: C.gray200 }, beginAtZero: true },
//   },
// };

// // ------- helpers -------
// const downloadCSV = (filename, rows) => {
//   const escape = (v) => {
//     if (v === null || v === undefined) return "";
//     const s = String(v);
//     if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
//     return s;
//   };
//   const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
//   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   a.click();
//   URL.revokeObjectURL(url);
// };

// const chartToPNG = (chartRef, filename) => {
//   const inst = chartRef?.current;
//   if (!inst) return;
//   const url =
//     typeof inst.toBase64Image === "function"
//       ? inst.toBase64Image("image/png", 1)
//       : inst.canvas?.toDataURL?.("image/png");
//   if (!url) return;
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   a.click();
// };

// export default function DashboardPage() {
//   const { user } = useAuth();
//   const roles = user?.roles?.map((r) => r.name || r) || [];
//   const isPrivileged = roles.some((r) => ["Admin", "System Administrator", "Project Manager"].includes(r));
//   const isSupervisor = roles.some((r) => ["Senior Project Supervisor", "Scrum Master", "Sub Admin"].includes(r));
//   const isMgmt = isPrivileged || isSupervisor; // management view
//   const isIndividual = !isMgmt; // Developer/Tester

//   // Filters
//   const [selectedWindow, setSelectedWindow] = useState(30);
//   const [selectedProject, setSelectedProject] = useState("");

//   // Data
//   const [v2, setV2] = useState(null);     // management data
//   const [mine, setMine] = useState(null); // personal data
//   const [loading, setLoading] = useState(true);

//   // Mgmt: sprint selector
//   const [selectedSprint, setSelectedSprint] = useState("");

//   // chart refs (PNG export)
//   const entityRef = useRef(null);
//   const throughputRef = useRef(null);
//   const projectStatusRef = useRef(null);
//   const burndownRef = useRef(null);
//   const myStatusRef = useRef(null);
//   const myThroughputRef = useRef(null);
//   const myProjectRef = useRef(null);
//   const mySprintRef = useRef(null);

//   // fetchers
//   const fetchMgmt = async (windowDays, projectId) => {
//     const params = { windowDays };
//     if (projectId) params.projectId = projectId;
//     const { data } = await axios.get("/dashboard/v2", { params });
//     setV2(data);
//   };

//   const fetchMine = async (windowDays, projectId) => {
//     const params = { windowDays };
//     if (projectId) params.projectId = projectId;
//     const { data } = await axios.get("/dashboard/mine", { params });
//     setMine(data);
//   };

//   useEffect(() => {
//     (async () => {
//       try {
//         setLoading(true);
//         if (isMgmt) {
//           await fetchMgmt(selectedWindow, selectedProject || undefined);
//         } else {
//           await fetchMine(selectedWindow, selectedProject || undefined);
//         }
//       } catch (e) {
//         console.error(e);
//       } finally {
//         setLoading(false);
//       }
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isMgmt, selectedWindow, selectedProject]);

//   // When mgmt data changes, pick first sprint safely
//   useEffect(() => {
//     if (!isMgmt) return;
//     const firstSprint = v2?.perSprint?.[0]?.sprintId || "";
//     setSelectedSprint(firstSprint);
//   }, [isMgmt, v2?.meta?.projectId, v2?.meta?.windowDays, v2?.perSprint?.length]);

//   // ------------------- MANAGEMENT (Admin/PM/Supervisor) -------------------
//   const totals = v2?.baseStats?.totals ?? { projects: 0, users: 0, sprints: 0, stories: 0, tasks: 0 };

//   const entityChart = useMemo(
//     () => ({
//       labels: ["Projects", "Users", "Sprints", "Stories", "Tasks"],
//       datasets: [
//         {
//           label: "Totals",
//           data: [totals.projects, totals.users, totals.sprints, totals.stories, totals.tasks],
//           backgroundColor: [C.blueA, C.greenA, C.amberA, C.redA, C.violetA],
//           borderColor: [C.blue, C.green, C.amber, C.red, C.violet],
//           borderWidth: 2,
//           borderRadius: 6,
//         },
//       ],
//     }),
//     [totals]
//   );

//   const throughputLine = useMemo(
//     () => ({
//       labels: (v2?.series?.throughputByDay ?? []).map((x) => x.date),
//       datasets: [
//         {
//           label: "Done per day",
//           data: (v2?.series?.throughputByDay ?? []).map((x) => x.count),
//           fill: true,
//           borderColor: C.blue,
//           backgroundColor: C.blueA,
//           pointRadius: 2,
//           tension: 0.3,
//         },
//       ],
//     }),
//     [v2?.series?.throughputByDay]
//   );

//   const projectStatusChart = useMemo(
//     () => ({
//       labels: (v2?.perProject ?? []).map((p) => p.name),
//       datasets: [
//         { label: "To Do", data: (v2?.perProject ?? []).map((p) => p.status.todo), stack: "s", backgroundColor: C.gray300, borderColor: C.gray300, borderWidth: 1, borderRadius: 4 },
//         { label: "In Progress", data: (v2?.perProject ?? []).map((p) => p.status.inProgress), stack: "s", backgroundColor: C.blueA, borderColor: C.blue, borderWidth: 1, borderRadius: 4 },
//         { label: "Paused", data: (v2?.perProject ?? []).map((p) => p.status.paused), stack: "s", backgroundColor: C.amberA, borderColor: C.amber, borderWidth: 1, borderRadius: 4 },
//         // { label: "Blocked", data: (v2?.perProject ?? []).map((p) => p.status.blocked), stack: "s", backgroundColor: C.redA, borderColor: C.red, borderWidth: 1, borderRadius: 4 },
//         { label: "Done", data: (v2?.perProject ?? []).map((p) => p.status.done), stack: "s", backgroundColor: C.greenA, borderColor: C.green, borderWidth: 1, borderRadius: 4 },
//       ],
//     }),
//     [v2?.perProject]
//   );

//   const selectedSprintObj = (v2?.perSprint ?? []).find((s) => String(s.sprintId) === String(selectedSprint));
//   const burndown = useMemo(() => {
//     if (!selectedSprintObj) return null;
//     return {
//       labels: selectedSprintObj.burndown.map((d) => new Date(d.date).toISOString().slice(0, 10)),
//       datasets: [
//         {
//           label: `Remaining (h) – ${selectedSprintObj.name}`,
//           data: selectedSprintObj.burndown.map((d) => d.remaining),
//           fill: true,
//           borderColor: C.indigo,
//           backgroundColor: C.indigoA,
//           pointRadius: 2,
//           tension: 0.3,
//         },
//       ],
//     };
//   }, [selectedSprintObj]);

//   // CSV exports (Mgmt)
//   const exportEntityCSV = () => {
//     downloadCSV("entity_distribution.csv", [
//       ["Entity", "Count"],
//       ["Projects", totals.projects],
//       ["Users", totals.users],
//       ["Sprints", totals.sprints],
//       ["Stories", totals.stories],
//       ["Tasks", totals.tasks],
//     ]);
//   };

//   const exportThroughputCSV = () => {
//     const rows = [["Date", "Done"]];
//     (v2?.series?.throughputByDay ?? []).forEach((d) => rows.push([d.date, d.count]));
//     downloadCSV("throughput_daily.csv", rows);
//   };

//   const exportProjectStatusCSV = () => {
//     const rows = [["Project", 
//       "To Do", 
//       "In Progress", 
//       "Paused", 
//       // "Blocked", 
//       "Done", 
//       "Est Hours", 
//       "Act Hours", 
//       "Stories", 
//       "AC", 
//       "TC+", 
//       "TC-"]];
//     (v2?.perProject ?? []).forEach((p) => {
//       rows.push([
//         p.name,
//         p.status.todo,
//         p.status.inProgress,
//         p.status.paused,
//         // p.status.blocked,
//         p.status.done,
//         p.est,
//         p.act,
//         p.stories,
//         p.ac,
//         p.tcPos,
//         p.tcNeg,
//       ]);
//     });
//     downloadCSV("project_status.csv", rows);
//   };

//   const exportBurndownCSV = () => {
//     if (!selectedSprintObj) return;
//     const rows = [["Date", "Remaining (h)"]];
//     selectedSprintObj.burndown.forEach((d) => rows.push([new Date(d.date).toISOString().slice(0, 10), d.remaining]));
//     downloadCSV(`burndown_${selectedSprintObj.name}.csv`, rows);
//   };

//   const exportWipCSV = () => {
//     const rows = [["Task", "Assignee", "Project", "Sprint", "Days In Status"]];
//     (v2?.wip ?? []).forEach((w) =>
//       rows.push([w.title, w.assignee, w.project || "-", w.sprint || "-", w.daysInStatus ?? "-"])
//     );
//     downloadCSV("wip_in_progress.csv", rows);
//   };

//   // ------------------- PERSONAL (Developer/Tester) -------------------
//   const myTotals = mine?.totals ?? { myTasks: 0, estHours: 0, actHours: 0 };
//   const myStatusCounts = mine?.statusCount ?? { 
//     "To Do": 0, 
//     "In Progress": 0, 
//     Paused: 0, 
//     // Blocked: 0, 
//     Done: 0 };

//   const myStatusChart = useMemo(
//     () => ({
//       labels: ["To Do", 
//         "In Progress", 
//         "Paused", 
//         // "Blocked", 
//         "Done"],
//       datasets: [
//         {
//           label: "Tasks",
//           data: ["To Do", 
//             "In Progress", 
//             "Paused", 
//             // "Blocked", 
//             "Done"].map((k) => myStatusCounts[k] || 0),
//           backgroundColor: [C.gray300, C.blueA, C.amberA, C.redA, C.greenA],
//           borderColor: [C.gray300, C.blue, C.amber, C.red, C.green],
//           borderWidth: 2,
//           borderRadius: 6,
//         },
//       ],
//     }),
//     [myStatusCounts]
//   );

//   const myThroughputLine = useMemo(
//     () => ({
//       labels: (mine?.throughputByDay ?? []).map((x) => x.date),
//       datasets: [
//         {
//           label: "Done per day",
//           data: (mine?.throughputByDay ?? []).map((x) => x.count),
//           fill: true,
//           borderColor: C.blue,
//           backgroundColor: C.blueA,
//           pointRadius: 2,
//           tension: 0.3,
//         },
//       ],
//     }),
//     [mine?.throughputByDay]
//   );

//   const myProjectChart = useMemo(
//     () => ({
//       labels: (mine?.byProject ?? []).map((p) => p.name || p.projectId?.slice(-6)),
//       datasets: [
//         { label: "To Do", data: (mine?.byProject ?? []).map((p) => p.counts.todo), stack: "p", backgroundColor: C.gray300, borderColor: C.gray300, borderWidth: 1, borderRadius: 4 },
//         { label: "In Progress", data: (mine?.byProject ?? []).map((p) => p.counts.inProgress), stack: "p", backgroundColor: C.blueA, borderColor: C.blue, borderWidth: 1, borderRadius: 4 },
//         { label: "Paused", data: (mine?.byProject ?? []).map((p) => p.counts.paused), stack: "p", backgroundColor: C.amberA, borderColor: C.amber, borderWidth: 1, borderRadius: 4 },
//         // { label: "Blocked", data: (mine?.byProject ?? []).map((p) => p.counts.blocked), stack: "p", backgroundColor: C.redA, borderColor: C.red, borderWidth: 1, borderRadius: 4 },
//         { label: "Done", data: (mine?.byProject ?? []).map((p) => p.counts.done), stack: "p", backgroundColor: C.greenA, borderColor: C.green, borderWidth: 1, borderRadius: 4 },
//       ],
//     }),
//     [mine?.byProject]
//   );

//   const mySprintChart = useMemo(
//     () => ({
//       labels: (mine?.bySprint ?? []).map((s) => s.name || s.sprintId?.slice(-6)),
//       datasets: [
//         { label: "To Do", data: (mine?.bySprint ?? []).map((s) => s.counts.todo), stack: "s", backgroundColor: C.gray300, borderColor: C.gray300, borderWidth: 1, borderRadius: 4 },
//         { label: "In Progress", data: (mine?.bySprint ?? []).map((s) => s.counts.inProgress), stack: "s", backgroundColor: C.blueA, borderColor: C.blue, borderWidth: 1, borderRadius: 4 },
//         { label: "Paused", data: (mine?.bySprint ?? []).map((s) => s.counts.paused), stack: "s", backgroundColor: C.amberA, borderColor: C.amber, borderWidth: 1, borderRadius: 4 },
//         // { label: "Blocked", data: (mine?.bySprint ?? []).map((s) => s.counts.blocked), stack: "s", backgroundColor: C.redA, borderColor: C.red, borderWidth: 1, borderRadius: 4 },
//         { label: "Done", data: (mine?.bySprint ?? []).map((s) => s.counts.done), stack: "s", backgroundColor: C.greenA, borderColor: C.green, borderWidth: 1, borderRadius: 4 },
//       ],
//     }),
//     [mine?.bySprint]
//   );

//   // CSV exports (Personal)
//   const exportMyStatusCSV = () => {
//     downloadCSV("my_status_counts.csv", [["Status", "Count"], ...Object.entries(myStatusCounts)]);
//   };
//   const exportMyThroughputCSV = () => {
//     const rows = [["Date", "Done"]];
//     (mine?.throughputByDay ?? []).forEach((d) => rows.push([d.date, d.count]));
//     downloadCSV("my_throughput.csv", rows);
//   };
//   const exportMyProjectCSV = () => {
//     const rows = [["Project", 
//       "To Do", 
//       "In Progress", 
//       "Paused", 
//       // "Blocked", 
//       "Done"]];
//     (mine?.byProject ?? []).forEach((p) =>
//       rows.push([p.name, 
//         p.counts.todo, 
//         p.counts.inProgress, 
//         p.counts.paused, 
//         // p.counts.blocked, 
//         p.counts.done])
//     );
//     downloadCSV("my_by_project.csv", rows);
//   };
//   const exportMySprintCSV = () => {
//     const rows = [["Sprint", 
//       "To Do", 
//       "In Progress", 
//       "Paused", 
//       // "Blocked", 
//       "Done"]];
//     (mine?.bySprint ?? []).forEach((s) =>
//       rows.push([s.name, 
//         s.counts.todo, 
//         s.counts.inProgress, 
//         s.counts.paused, 
//         // s.counts.blocked, 
//         s.counts.done])
//     );
//     downloadCSV("my_by_sprint.csv", rows);
//   };

//   if (loading || (isMgmt ? !v2 : !mine)) {
//     return <p className="p-6">Loading dashboard…</p>;
//   }

//   // ---------- FILTER BAR ----------
//   const projectsForFilter = isMgmt ? (v2?.availableProjects ?? []) : (mine?.availableProjects ?? []);

//   return (
//     <div className="p-6 space-y-8">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//         <h1 className="text-2xl font-bold">{isMgmt ? "Dashboard" : "My Dashboard"}</h1>

//         <div className="flex flex-wrap items-center gap-2">
//           <div className="flex items-center gap-1">
//             {[7, 14, 30, 60, 90].map((w) => (
//               <button
//                 key={w}
//                 onClick={() => setSelectedWindow(w)}
//                 className={`px-3 py-1 rounded border ${selectedWindow === w ? "bg-black text-white" : "bg-white"}`}
//               >
//                 {w}d
//               </button>
//             ))}
//           </div>

//           <select
//             className="border rounded px-2 py-1"
//             value={selectedProject}
//             onChange={(e) => setSelectedProject(e.target.value)}
//           >
//             <option value="">{isMgmt ? "All Projects" : "My Projects"}</option>
//             {projectsForFilter.map((p) => (
//               <option key={p._id} value={p._id}>
//                 {p.name}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {isMgmt ? (
//         <>
//           {/* KPIs */}
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//             {Object.entries(totals).map(([k, v]) => (
//               <div key={k} className="bg-white p-4 rounded shadow text-center">
//                 <div className="text-xl font-semibold">{v}</div>
//                 <div className="text-gray-600 capitalize">{k}</div>
//               </div>
//             ))}
//           </div>

//           {/* Entity distribution */}
//           <div className="bg-white p-4 rounded shadow w-full max-w-md">
//             <div className="flex items-center justify-between mb-2">
//               <h2 className="text-lg font-semibold">Entity Distribution</h2>
//               <div className="flex gap-2">
//                 <button className="text-sm underline" onClick={exportEntityCSV}>
//                   CSV
//                 </button>
//                 <button className="text-sm underline" onClick={() => chartToPNG(entityRef, "entity_distribution.png")}>
//                   PNG
//                 </button>
//               </div>
//             </div>
//             <div className="h-56">
//               <Bar ref={entityRef} data={entityChart} options={baseChartOpts} />
//             </div>
//           </div>

//           {/* Throughput trend */}
//           <div className="bg-white p-4 rounded shadow">
//             <div className="flex items-center justify-between mb-2">
//               <h2 className="text-lg font-semibold">Throughput (Done per day)</h2>
//               <div className="flex gap-2">
//                 <button className="text-sm underline" onClick={exportThroughputCSV}>
//                   CSV
//                 </button>
//                 <button
//                   className="text-sm underline"
//                   onClick={() => chartToPNG(throughputRef, "throughput_daily.png")}
//                 >
//                   PNG
//                 </button>
//               </div>
//             </div>
//             <div className="h-64">
//               <Line
//                 ref={throughputRef}
//                 data={throughputLine}
//                 options={{ ...baseChartOpts, interaction: { mode: "index", intersect: false } }}
//               />
//             </div>
//           </div>

//           {/* Work status by project */}
//           <div className="bg-white p-4 rounded shadow">
//             <div className="flex items-center justify-between mb-2">
//               <h2 className="text-lg font-semibold">Work Status by Project</h2>
//               <div className="flex gap-2">
//                 <button className="text-sm underline" onClick={exportProjectStatusCSV}>
//                   CSV
//                 </button>
//                 <button
//                   className="text-sm underline"
//                   onClick={() => chartToPNG(projectStatusRef, "work_status_by_project.png")}
//                 >
//                   PNG
//                 </button>
//               </div>
//             </div>
//             <div className="h-80">
//               <Bar
//                 ref={projectStatusRef}
//                 data={projectStatusChart}
//                 options={{
//                   ...baseChartOpts,
//                   scales: {
//                     x: { ...baseChartOpts.scales.x, stacked: true },
//                     y: { ...baseChartOpts.scales.y, stacked: true },
//                   },
//                 }}
//               />
//             </div>
//           </div>

//           {/* Burndown by sprint */}
//           <div className="bg-white p-4 rounded shadow">
//             <div className="flex items-center justify-between mb-2">
//               <div className="flex items-center gap-3">
//                 <h2 className="text-lg font-semibold">Burndown by Sprint</h2>
//                 <select
//                   className="border rounded px-2 py-1"
//                   value={selectedSprint || ""}
//                   onChange={(e) => setSelectedSprint(e.target.value)}
//                 >
//                   {(v2?.perSprint ?? []).map((s) => (
//                     <option key={s.sprintId} value={s.sprintId}>
//                       {s.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="flex gap-2">
//                 <button className="text-sm underline" onClick={exportBurndownCSV}>
//                   CSV
//                 </button>
//                 <button
//                   className="text-sm underline"
//                   onClick={() =>
//                     chartToPNG(burndownRef, `burndown_${selectedSprintObj?.name || "sprint"}.png`)
//                   }
//                 >
//                   PNG
//                 </button>
//               </div>
//             </div>
//             <div className="h-64">
//               {burndown ? (
//                 <Line
//                   ref={burndownRef}
//                   data={burndown}
//                   options={{ ...baseChartOpts, interaction: { mode: "index", intersect: false } }}
//                 />
//               ) : (
//                 <div className="text-sm text-gray-500">No sprint selected</div>
//               )}
//             </div>
//           </div>

//           {/* NEW: WIP – In Progress */}
//           <div className="bg-white p-4 rounded shadow">
//             <div className="flex items-center justify-between mb-2">
//               <h2 className="text-lg font-semibold">WIP – In Progress</h2>
//               <button className="text-sm underline" onClick={exportWipCSV}>
//                 CSV
//               </button>
//             </div>
//             {(v2?.wip ?? []).length ? (
//               <div className="overflow-x-auto">
//                 <table className="min-w-full text-sm">
//                   <thead>
//                     <tr className="text-left border-b">
//                       <th className="py-2 pr-3">Task</th>
//                       <th className="py-2 pr-3">Assignee</th>
//                       <th className="py-2 pr-3">Project</th>
//                       <th className="py-2 pr-3">Sprint</th>
//                       <th className="py-2 pr-3">Days In Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {(v2?.wip ?? []).slice(0, 50).map((w) => (
//                       <tr key={w.taskId} className="border-b last:border-0">
//                         <td className="py-2 pr-3">{w.title}</td>
//                         <td className="py-2 pr-3">{w.assignee}</td>
//                         <td className="py-2 pr-3">{w.project || "-"}</td>
//                         <td className="py-2 pr-3">{w.sprint || "-"}</td>
//                         <td className="py-2 pr-3">{w.daysInStatus ?? "-"}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <div className="text-sm text-gray-500">No work currently In Progress.</div>
//             )}
//           </div>

//           {/* Risks – aging paused/blocked */}
//           <div className="bg-white p-4 rounded shadow">
//             <div className="flex items-center justify-between mb-2">
//               <h2 className="text-lg font-semibold">Risks – Aging Paused</h2>
//               <button
//                 className="text-sm underline"
//                 onClick={() => {
//                   const rows = [["Assignee", "Status", "Days In Status"]];
//                   (v2?.risk ?? []).forEach((r) => rows.push([r.assignee, r.status, r.daysInStatus]));
//                   downloadCSV("risks_aging_paused.csv", rows);
//                 }}
//               >
//                 CSV
//               </button>
//             </div>
//             {(v2?.risk ?? []).length ? (
//               <ul className="list-disc pl-5 space-y-1">
//                 {(v2?.risk ?? []).slice(0, 20).map((r) => (
//                   <li key={r.taskId} className="text-sm">
//                     {r.assignee}: {r.status} for {r.daysInStatus} days
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <div className="text-sm text-gray-500">No aging paused tasks.</div>
//             )}
//           </div>
//         </>
//       ) : (
//         <>
//           {/* PERSONAL KPI cards */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="bg-white p-4 rounded shadow text-center">
//               <div className="text-xl font-semibold">{myTotals.myTasks}</div>
//               <div className="text-gray-600">My Tasks</div>
//             </div>
//             <div className="bg-white p-4 rounded shadow text-center">
//               <div className="text-xl font-semibold">{myTotals.estHours}</div>
//               <div className="text-gray-600">Estimated Hours</div>
//             </div>
//             <div className="bg-white p-4 rounded shadow text-center">
//               <div className="text-xl font-semibold">{myTotals.actHours}</div>
//               <div className="text-gray-600">Actual Hours</div>
//             </div>
//             <div className="bg-white p-4 rounded shadow text-center">
//               <div className="text-xl font-semibold">{myTotals.estHours - myTotals.actHours}</div>
//               <div className="text-gray-600">Remaining Hours</div>
//             </div>
//           </div>

//           {/* My task status */}
//           <div className="bg-white p-4 rounded shadow">
//             <div className="flex items-center justify-between mb-2">
//               <h2 className="text-lg font-semibold">My Task Status</h2>
//               <div className="flex gap-2">
//                 <button className="text-sm underline" onClick={exportMyStatusCSV}>
//                   CSV
//                 </button>
//                 <button className="text-sm underline" onClick={() => chartToPNG(myStatusRef, "my_status.png")}>
//                   PNG
//                 </button>
//               </div>
//             </div>
//             <div className="h-56">
//               <Bar ref={myStatusRef} data={myStatusChart} options={baseChartOpts} />
//             </div>
//           </div>

//           {/* My throughput */}
//           <div className="bg-white p-4 rounded shadow">
//             <div className="flex items-center justify-between mb-2">
//               <h2 className="text-lg font-semibold">My Throughput</h2>
//               <div className="text-sm text-gray-600">Avg cycle: {mine?.avgCycleHours ?? "-"}h</div>
//               <div className="flex gap-2">
//                 <button className="text-sm underline" onClick={exportMyThroughputCSV}>
//                   CSV
//                 </button>
//                 <button
//                   className="text-sm underline"
//                   onClick={() => chartToPNG(myThroughputRef, "my_throughput.png")}
//                 >
//                   PNG
//                 </button>
//               </div>
//             </div>
//             <div className="h-64">
//               <Line
//                 ref={myThroughputRef}
//                 data={myThroughputLine}
//                 options={{ ...baseChartOpts, interaction: { mode: "index", intersect: false } }}
//               />
//             </div>
//           </div>

//           {/* My work by project */}
//           <div className="bg-white p-4 rounded shadow">
//             <div className="flex items-center justify-between mb-2">
//               <h2 className="text-lg font-semibold">My Work by Project</h2>
//               <div className="flex gap-2">
//                 <button className="text-sm underline" onClick={exportMyProjectCSV}>
//                   CSV
//                 </button>
//                 <button
//                   className="text-sm underline"
//                   onClick={() => chartToPNG(myProjectRef, "my_by_project.png")}
//                 >
//                   PNG
//                 </button>
//               </div>
//             </div>
//             <div className="h-72">
//               <Bar
//                 ref={myProjectRef}
//                 data={myProjectChart}
//                 options={{
//                   ...baseChartOpts,
//                   scales: {
//                     x: { ...baseChartOpts.scales.x, stacked: true },
//                     y: { ...baseChartOpts.scales.y, stacked: true },
//                   },
//                 }}
//               />
//             </div>
//           </div>

//           {/* My work by sprint + WIP risks */}
//           <div className="bg-white p-4 rounded shadow">
//             <div className="flex items-center justify-between mb-2">
//               <h2 className="text-lg font-semibold">My Work by Sprint</h2>
//               <div className="flex gap-2">
//                 <button className="text-sm underline" onClick={exportMySprintCSV}>
//                   CSV
//                 </button>
//                 <button className="text-sm underline" onClick={() => chartToPNG(mySprintRef, "my_by_sprint.png")}>
//                   PNG
//                 </button>
//               </div>
//             </div>
//             <div className="h-72">
//               <Bar
//                 ref={mySprintRef}
//                 data={mySprintChart}
//                 options={{
//                   ...baseChartOpts,
//                   scales: {
//                     x: { ...baseChartOpts.scales.x, stacked: true },
//                     y: { ...baseChartOpts.scales.y, stacked: true },
//                   },
//                 }}
//               />
//             </div>

//             <div className="mt-6">
//               <h3 className="font-semibold mb-2">My WIP at Risk</h3>
//               {(mine?.wipRisk ?? []).length ? (
//                 <ul className="list-disc pl-5 space-y-1">
//                   {(mine?.wipRisk ?? []).slice(0, 20).map((r) => (
//                     <li key={r.taskId} className="text-sm">
//                       {r.title} — {r.status} for {r.daysInStatus} days {r.sprint ? `(${r.sprint})` : ""}
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <div className="text-sm text-gray-500">No risky WIP right now 🎉</div>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Axios client (adjust path/baseURL to your project)
import axiosBase from "../api/axiosInstance";

/***********************
 * API Wrapper — OtherTasks Analytics routes
 ***********************/
// If your router is mounted at /api/other-tasks/analytics, keep this BASE as-is.
// Otherwise, change BASE accordingly (e.g., "/other-tasks/analytics").
const BASE = "/other-tasks/analytics";
const DashboardApi = {
  summary: (params) => axiosBase.get(`${BASE}/summary`, { params }),
  timeseries: (params) => axiosBase.get(`${BASE}/timeseries`, { params }), // ?bucket=day|week
  estimation: (params) => axiosBase.get(`${BASE}/estimation`, { params }),
  heatmap: (params) => axiosBase.get(`${BASE}/heatmap`, { params }),
  usersComparison: (params) => axiosBase.get(`${BASE}/users-comparison`, { params }),
  distributions: (params) => axiosBase.get(`${BASE}/distributions`, { params }),
};

/*************************
 * Minimal UI Primitives  *
 *************************/
const Card = ({ title, right, className = "", children }) => (
  <div className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200/60 dark:border-zinc-800 ${className}`}>
    {(title || right) && (
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{title}</h3>
        <div className="text-xs text-zinc-500">{right}</div>
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
);

const Tag = ({ children }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
    {children}
  </span>
);

/***********************
 * Filters / Controls   *
 ***********************/
const defaultFilters = () => ({
  dateFrom: "",
  dateTo: "",
  preset: "30d",
  project: "",      // expects ObjectId string
  assignee: "",     // expects ObjectId string
  typeId: "",       // expects ObjectId string
  status: "",       // "To Do" | "In Progress" | "Paused" | "Done"
  q: "",            // search in description
});

function setPresetRange(k, setFilters){
  const now = new Date();
  const dateTo = now.toISOString().slice(0,10);
  const fromD = new Date(now);
  if (k === "7d") fromD.setDate(now.getDate() - 6);
  if (k === "30d") fromD.setDate(now.getDate() - 29);
  if (k === "90d") fromD.setDate(now.getDate() - 89);
  const dateFrom = fromD.toISOString().slice(0,10);
  setFilters(f => ({...f, dateFrom, dateTo, preset: k }));
}

const FilterBar = ({ filters, setFilters, onRefresh }) => (
  <Card className="col-span-12" title="Filters" right={
    <button onClick={onRefresh} className="px-3 py-1.5 rounded-md text-xs bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">Refresh</button>
  }>
    <div className="grid grid-cols-12 gap-3">
      {/* Date range */}
      <div className="col-span-12 md:col-span-4">
        <label className="text-xs text-zinc-500">Date range</label>
        <div className="flex gap-2 mt-1">
          <input type="date" className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1 text-sm" value={filters.dateFrom}
                 onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
          <input type="date" className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1 text-sm" value={filters.dateTo}
                 onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {[
            {k:"7d", label:"Last 7d"},
            {k:"30d", label:"Last 30d"},
            {k:"90d", label:"Last 90d"},
          ].map(p => (
            <button key={p.k}
                    onClick={() => setPresetRange(p.k, setFilters)}
                    className={`text-xs px-2 py-1 rounded-md border ${filters.preset===p.k?"bg-zinc-900 text-white border-zinc-900":"border-zinc-200 dark:border-zinc-700"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Project */}
      <div className="col-span-12 sm:col-span-6 md:col-span-2">
        <label className="text-xs text-zinc-500">Project ID</label>
        <input className="mt-1 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1 text-sm"
               value={filters.project}
               placeholder="ObjectId"
               onChange={e => setFilters(f => ({ ...f, project: e.target.value }))} />
      </div>

      {/* Assignee */}
      <div className="col-span-12 sm:col-span-6 md:col-span-2">
        <label className="text-xs text-zinc-500">Assignee ID</label>
        <input className="mt-1 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1 text-sm"
               value={filters.assignee}
               placeholder="ObjectId"
               onChange={e => setFilters(f => ({ ...f, assignee: e.target.value }))} />
      </div>

      {/* Type */}
      <div className="col-span-12 sm:col-span-6 md:col-span-2">
        <label className="text-xs text-zinc-500">Type ID</label>
        <input className="mt-1 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1 text-sm"
               value={filters.typeId}
               placeholder="ObjectId"
               onChange={e => setFilters(f => ({ ...f, typeId: e.target.value }))} />
      </div>

      {/* Status */}
      <div className="col-span-12 sm:col-span-6 md:col-span-2">
        <label className="text-xs text-zinc-500">Status</label>
        <select className="mt-1 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1 text-sm"
                value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">Any</option>
          <option>To Do</option>
          <option>In Progress</option>
          <option>Paused</option>
          <option>Done</option>
        </select>
      </div>

      {/* Search */}
      <div className="col-span-12 sm:col-span-6 md:col-span-12 lg:col-span-10">
        <label className="text-xs text-zinc-500">Search</label>
        <input placeholder="Search description..." value={filters.q}
               onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
               className="mt-1 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1.5 text-sm" />
      </div>

      {/* Reset */}
      <div className="col-span-12 sm:col-span-6 md:col-span-2 flex items-end">
        <button onClick={() => setFilters(defaultFilters())}
                className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 text-sm">Reset</button>
      </div>
    </div>
  </Card>
);

/***********************
 * Heatmap (weekday x hr)
 ***********************/
const Heatmap = ({ grid }) => {
  // grid: 7 rows x 24 columns; we display Mon..Sun
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const max = Math.max(1, ...grid.flat());
  return (
    <div className="inline-grid grid-rows-7 grid-cols-[max-content_repeat(24,minmax(12px,1fr))] gap-1">
      <div />
      {Array.from({length:24}).map((_,i) => (
        <div key={i} className="text-[10px] text-center text-zinc-400">{i}</div>
      ))}
      {days.map((d, r) => (
        <React.Fragment key={d}>
          <div className="text-[11px] pr-2 text-zinc-500">{d}</div>
          {Array.from({length:24}).map((_,c) => {
            const v = grid[r]?.[c] ?? 0;
            const intensity = v === 0 ? 0 : Math.max(0.12, v / max);
            return (
              <div key={`${r}-${c}`}
                   title={`${d} ${c}:00 → ${v.toFixed(2)}h`}
                   className="h-5 rounded"
                   style={{ backgroundColor: `rgba(16,185,129,${intensity})` }} />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

function rotateHeatmapToMonFirst(grid){
  // Server uses JS getDay(): 0=Sun..6=Sat; UI wants Mon..Sun
  return [grid[1],grid[2],grid[3],grid[4],grid[5],grid[6],grid[0]];
}

/***********************
 * Main Dashboard       *
 ***********************/
export default function AnalyticsDashboard(){
  const [filters, setFilters] = useState(defaultFilters());
  const [bucket, setBucket] = useState("day");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // server data
  const [kpis, setKpis] = useState({ total: 0, todo: 0, inprog: 0, paused: 0, done: 0, plannedHrs: 0, actualHrsDone: 0, avgLeadMs: 0 });
  const [types, setTypes] = useState([]);
  const [ts, setTs] = useState([]);
  const [est, setEst] = useState({ over: 0, ok: 0, under: 0 });
  const [heat, setHeat] = useState(Array.from({length:7}, ()=>Array(24).fill(0)));
  const [usersCmp, setUsersCmp] = useState([]);
  const [dists, setDists] = useState({ histogram10MinBins: Array(13).fill(0), overdue: { open: 0, closedLate: 0 } });

  const fetchData = async (f = filters, buck = bucket) => {
    setLoading(true); setError("");
    try {
      const params = {
        status: f.status || undefined,
        assignee: f.assignee || undefined,
        project: f.project || undefined,
        typeId: f.typeId || undefined,
        dateFrom: f.dateFrom || undefined,
        dateTo: f.dateTo || undefined,
        q: f.q || undefined,
        bucket: buck,
      };
      const [s1, s2, s3, s4, s5, s6] = await Promise.all([
        DashboardApi.summary(params),
        DashboardApi.timeseries(params),
        DashboardApi.estimation(params),
        DashboardApi.heatmap(params),
        DashboardApi.usersComparison(params),
        DashboardApi.distributions(params),
      ]);

      const facet = s1?.data || {};
      const k = (facet.kpis && facet.kpis[0]) || {};
      setKpis({
        total: k.total||0, todo: k.todo||0, inprog: k.inprog||0, paused: k.paused||0, done: k.done||0,
        plannedHrs: k.plannedHrs||0, actualHrsDone: k.actualHrsDone||0, avgLeadMs: k.avgLeadMs||0,
      });
      setTypes(facet.types || []);

      setTs(s2?.data?.rows || []);

      const estRows = s3?.data?.rows || [];
      const estMap = { over: 0, ok: 0, under: 0 };
      estRows.forEach(r => { estMap[r._id] = r.count; });
      setEst(estMap);

      setHeat(s4?.data?.grid || heat);
      setUsersCmp(s5?.data?.rows || []);
      setDists(s6?.data || { histogram10MinBins: [], overdue: { open: 0, closedLate: 0 } });
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load dashboard data");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    const id = setTimeout(() => fetchData(filters, bucket), 350);
    return () => clearTimeout(id);
  }, [filters.dateFrom, filters.dateTo, filters.project, filters.assignee, filters.typeId, filters.status, filters.q, bucket]);

  const activeUsers = usersCmp.filter(r => (r.tasks||0) > 0).length;

  return (
    <div className="p-4 md:p-6 bg-zinc-50 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-50">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">Other Tasks — Analytics Dashboard</h1>
        <p className="text-sm text-zinc-500">Filters + KPIs, estimation buckets, heatmap, distributions and completions timeseries.</p>
        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <FilterBar filters={filters} setFilters={setFilters} onRefresh={fetchData} />
      </div>

      {loading && (<div className="mb-4 text-sm text-zinc-500">Loading…</div>)}

      {/* KPI Row */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <Card className="col-span-12 sm:col-span-6 lg:col-span-3" title="Other Tasks">
          <div className="text-3xl font-semibold">{kpis.total}</div>
          <div className="mt-2 flex gap-2 flex-wrap">
            <Tag>To Do {kpis.todo}</Tag>
            <Tag>In Prog {kpis.inprog}</Tag>
            <Tag>Paused {kpis.paused}</Tag>
            <Tag>Done {kpis.done}</Tag>
          </div>
        </Card>
        <Card className="col-span-12 sm:col-span-6 lg:col-span-3" title="Planned vs Actual (Done)">
          <div className="text-3xl font-semibold">{Math.round((kpis.actualHrsDone||0))}h</div>
          <div className="mt-2 text-sm text-zinc-500">Planned {Math.round((kpis.plannedHrs||0))}h</div>
        </Card>
        <Card className="col-span-12 sm:col-span-6 lg:col-span-3" title="Estimation Quality">
          <div className="text-3xl font-semibold">OK {est.ok||0}</div>
          <div className="mt-2 flex gap-2 flex-wrap">
            <Tag>Over {est.over||0}</Tag>
            <Tag>Under {est.under||0}</Tag>
          </div>
        </Card>
        <Card className="col-span-12 sm:col-span-6 lg:col-span-3" title="Active Users">
          <div className="text-3xl font-semibold">{activeUsers}</div>
          <div className="mt-2 text-sm text-zinc-500">Users with tasks in range</div>
        </Card>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <Card className="col-span-12 lg:col-span-6" title="Estimation Buckets">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{name:"Buckets", Over: est.over||0, OK: est.ok||0, Under: est.under||0}] }>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Legend />
                <RTooltip />
                <Bar dataKey="Over" stackId="a" />
                <Bar dataKey="OK" stackId="a" />
                <Bar dataKey="Under" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-6" title="Engagement Heatmap (weekday × hour)">
          <div className="h-[360px] overflow-auto">
            <Heatmap grid={rotateHeatmapToMonFirst(heat)} />
          </div>
        </Card>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <Card className="col-span-12 lg:col-span-6" title="Session Lengths (10‑min bins)">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dists.histogram10MinBins.map((c,i)=>({ bin: i*10, count: c }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bin" tickFormatter={(v)=> v>=120?">=120m":`${v}m`} />
                <YAxis allowDecimals={false} />
                <RTooltip labelFormatter={(v)=> v>=120?">=120 minutes":`${v} minutes`} />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-6" title={`Completions Over Time (${bucket})`} right={
          <select className="text-xs border rounded-md px-2 py-1" value={bucket} onChange={e=>setBucket(e.target.value)}>
            <option value="day">Day</option>
            <option value="week">Week</option>
          </select>
        }>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ts}>
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <RTooltip />
                <Area dataKey="done" type="monotone" fill="url(#area)" stroke="#10b981" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-12 gap-4 mb-12">
        <Card className="col-span-12 lg:col-span-6" title="Types Breakdown">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-500">
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Tasks</th>
                  <th className="py-2 pr-4">Planned (h)</th>
                  <th className="py-2 pr-4">Actual Done (h)</th>
                </tr>
              </thead>
              <tbody>
                {types.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-zinc-500">No type data for current filters.</td></tr>
                )}
                {types.map((t) => (
                  <tr key={t.typeId || t.typeName} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 pr-4">{t.typeName || t.typeId}</td>
                    <td className="py-2 pr-4">{t.count}</td>
                    <td className="py-2 pr-4">{Math.round(t.plannedHrs||0)}</td>
                    <td className="py-2 pr-4">{Math.round(t.actualHrsDone||0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-6" title="Notes">
          <ul className="list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-300 space-y-1">
            <li>Filters map to server params: <code>status, assignee, project, typeId, dateFrom, dateTo, q</code>.</li>
            <li>Completions timeseries bucket can be <code>day</code> or <code>week</code>.</li>
            <li>Estimation buckets come from server (<code>over, ok, under</code>).</li>
            <li>Heatmap aggregates hours per weekday×hour; rotated to Mon–Sun for display.</li>
          </ul>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-xs text-zinc-500">API-driven dashboard • Routes: summary, timeseries, estimation, heatmap, users-comparison, distributions.</div>
    </div>
  );
}






