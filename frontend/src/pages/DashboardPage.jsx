// import React, { useEffect, useState } from "react";
// import axios from "../api/axiosInstance";
// import { Bar } from "react-chartjs-2";
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const DashboardPage = () => {
//   const [stats, setStats] = useState(null);
//   const [data, setData] = useState(null);
//   const [taskStats, setTaskStats] = useState(null);

//   useEffect(() => {
//     const fetchStats = async () => {
//       const res = await axios.get("/dashboard/stats");
//       setStats(res.data);
//     };
//     fetchStats();
//   }, []);

//   useEffect(() => {
//     axios.get("/dashboard/userstory-insights").then((res) => setData(res.data));
//     axios.get("/dashboard/task-stats").then((res) => setTaskStats(res.data));
//   }, []);

//   if (!stats || !data || !taskStats) return <p>Loading dashboard...</p>;

//   const chartData = {
//     labels: ["Projects", "Users", "Sprints", "User Stories"],
//     datasets: [
//       {
//         label: "Total Count",
//         data: [stats.totalProjects, stats.totalUsers, stats.totalSprints, stats.totalStories],
//         backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]
//       }
//     ]
//   };

//   const projectLabels = Object.keys(data.projects);
//   const projectPositives = projectLabels.map(p => data.projects[p].positive);
//   const projectNegatives = projectLabels.map(p => data.projects[p].negative);

//   const epicLabels = Object.keys(data.epics);
//   const epicPositives = epicLabels.map(p => data.epics[p].positive);
//   const epicNegatives = epicLabels.map(p => data.epics[p].negative);

//   return (
//     <>
//       <div className="p-6 space-y-6">
//         <h1 className="text-2xl font-bold">Dashboard</h1>

//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div className="bg-blue-100 p-4 rounded shadow text-center">
//             <p className="text-xl font-semibold">{stats.totalProjects}</p>
//             <p className="text-sm">Projects</p>
//           </div>
//           <div className="bg-green-100 p-4 rounded shadow text-center">
//             <p className="text-xl font-semibold">{stats.totalUsers}</p>
//             <p className="text-sm">Users</p>
//           </div>
//           <div className="bg-yellow-100 p-4 rounded shadow text-center">
//             <p className="text-xl font-semibold">{stats.totalSprints}</p>
//             <p className="text-sm">Sprints</p>
//           </div>
//           <div className="bg-red-100 p-4 rounded shadow text-center">
//             <p className="text-xl font-semibold">{stats.totalStories}</p>
//             <p className="text-sm">User Stories</p>
//           </div>
//         </div>

//         <div className="mt-8 w-[500px] h-[400px]">
//           <h2 className="text-lg font-semibold mb-2">Entity Distribution</h2>
//           <Bar data={chartData} width={500} height={400} />
//         </div>
//       </div>

//       <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 mt-8 px-6">
//         <div>
//           <h3 className="font-semibold text-lg mb-2">Test Cases by Project</h3>
//           <Bar
//             data={{
//               labels: projectLabels,
//               datasets: [
//                 {
//                   label: "Positive",
//                   data: projectPositives,
//                   backgroundColor: "rgba(54, 162, 235, 0.6)",
//                   borderColor: "rgba(54, 162, 235, 1)",
//                   borderWidth: 1
//                 },
//                 {
//                   label: "Negative",
//                   data: projectNegatives,
//                   backgroundColor: "rgba(255, 99, 132, 0.6)",
//                   borderColor: "rgba(255, 99, 132, 1)",
//                   borderWidth: 1
//                 }
//               ]
//             }}
//             options={{
//               responsive: true,
//               plugins: {
//                 legend: {
//                   position: "top",
//                   labels: { color: "#000" }
//                 }
//               },
//               scales: {
//                 x: { ticks: { color: "#000" } },
//                 y: { beginAtZero: true, ticks: { color: "#000" } }
//               }
//             }}
//           />
//         </div>

//         <div>
//           <h3 className="font-semibold text-lg mb-2">Test Cases by Epic</h3>
//           <Bar
//             data={{
//               labels: epicLabels,
//               datasets: [
//                 {
//                   label: "Positive",
//                   data: epicPositives,
//                   backgroundColor: "rgba(75, 192, 192, 0.6)",
//                   borderColor: "rgba(75, 192, 192, 1)",
//                   borderWidth: 1
//                 },
//                 {
//                   label: "Negative",
//                   data: epicNegatives,
//                   backgroundColor: "rgba(255, 159, 64, 0.6)",
//                   borderColor: "rgba(255, 159, 64, 1)",
//                   borderWidth: 1
//                 }
//               ]
//             }}
//             options={{
//               responsive: true,
//               plugins: {
//                 legend: {
//                   position: "top",
//                   labels: { color: "#000" }
//                 }
//               },
//               scales: {
//                 x: { ticks: { color: "#000" } },
//                 y: { beginAtZero: true, ticks: { color: "#000" } }
//               }
//             }}
//           />
//         </div>

//         <div className="col-span-2 mt-8">
//           <h3 className="font-semibold text-lg mb-4">Summary</h3>
//           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//             <div className="bg-green-100 p-4 rounded shadow text-center">
//               <p className="text-xl font-semibold">{data.acceptanceCriteriaCount}</p>
//               <p className="text-sm text-gray-700">Acceptance Criteria</p>
//             </div>
//             <div className="bg-yellow-100 p-4 rounded shadow text-center">
//               <p className="text-xl font-semibold">{data.dependenciesCount}</p>
//               <p className="text-sm text-gray-700">Dependencies</p>
//             </div>
//             <div className="bg-purple-100 p-4 rounded shadow text-center">
//               <p className="text-xl font-semibold">{data.testCases.total}</p>
//               <p className="text-sm text-gray-700">Total Test Cases</p>
//             </div>
//             <div className="bg-pink-100 p-4 rounded shadow text-center">
//               <p className="text-xl font-semibold">{data.testCases.positive}</p>
//               <p className="text-sm text-gray-700">Positive Test Cases</p>
//             </div>
//             <div className="bg-red-100 p-4 rounded shadow text-center">
//               <p className="text-xl font-semibold">{data.testCases.negative}</p>
//               <p className="text-sm text-gray-700">Negative Test Cases</p>
//             </div>
//           </div>
//         </div>

//         <div className="col-span-2 mt-8">
//           <h3 className="font-semibold text-lg mb-4">📋 Task Summary</h3>
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
//             <div className="bg-blue-100 p-4 rounded shadow text-center">
//               <p className="text-xl font-semibold">{taskStats.totalTasks}</p>
//               <p className="text-sm text-gray-700">Total Tasks</p>
//             </div>
//             <div className="bg-yellow-100 p-4 rounded shadow text-center">
//               <p className="text-xl font-semibold">{taskStats.totalEstimated}</p>
//               <p className="text-sm text-gray-700">Total Estimated Hours</p>
//             </div>
//             <div className="bg-green-100 p-4 rounded shadow text-center">
//               <p className="text-xl font-semibold">{taskStats.totalActual}</p>
//               <p className="text-sm text-gray-700">Total Actual Hours</p>
//             </div>
//             <div className="bg-red-100 p-4 rounded shadow text-center">
//               <p className="text-xl font-semibold">{taskStats.totalEstimated - taskStats.totalActual}</p>
//               <p className="text-sm text-gray-700">Remaining Hours</p>
//             </div>
//           </div>

//           <div className="mt-6 w-full">
//             <h4 className="text-md font-medium mb-2">Task Count by Status</h4>
//             <Bar
//               data={{
//                 labels: Object.keys(taskStats.statusCount),
//                 datasets: [
//                   {
//                     label: "Tasks",
//                     data: Object.values(taskStats.statusCount),
//                     backgroundColor: ["#3B82F6", "#F59E0B", "#F87171", "#10B981"],
//                     borderRadius: 6
//                   }
//                 ]
//               }}
//               options={{
//                 indexAxis: 'y',
//                 responsive: true,
//                 plugins: {
//                   legend: { display: false },
//                   tooltip: {
//                     callbacks: {
//                       label: ctx => `${ctx.raw} task${ctx.raw !== 1 ? 's' : ''}`
//                     }
//                   }
//                 },
//                 scales: {
//                   x: { beginAtZero: true, ticks: { color: "#000" } },
//                   y: { ticks: { color: "#000" } }
//                 }
//               }}
//             />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default DashboardPage;


// =================================
// client/src/pages/DashboardPage.jsx (updated for v2)
// =================================
// client/src/pages/DashboardPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Palette
const C = {
  blue: "#3B82F6",
  blueA: "rgba(59,130,246,.2)",
  green: "#10B981",
  greenA: "rgba(16,185,129,.2)",
  amber: "#F59E0B",
  amberA: "rgba(245,158,11,.2)",
  red: "#EF4444",
  redA: "rgba(239,68,68,.2)",
  violet: "#8B5CF6",
  violetA: "rgba(139,92,246,.2)",
  indigo: "#6366F1",
  indigoA: "rgba(99,102,241,.15)",
  gray600: "#4B5563",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
};

const baseChartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top", labels: { color: C.gray600 } },
    tooltip: { intersect: false, mode: "index" },
  },
  scales: {
    x: { ticks: { color: C.gray600 }, grid: { color: C.gray200 } },
    y: { ticks: { color: C.gray600 }, grid: { color: C.gray200 }, beginAtZero: true },
  },
};

// ------- helpers -------
const downloadCSV = (filename, rows) => {
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const chartToPNG = (chartRef, filename) => {
  const inst = chartRef?.current;
  if (!inst) return;
  const url =
    typeof inst.toBase64Image === "function"
      ? inst.toBase64Image("image/png", 1)
      : inst.canvas?.toDataURL?.("image/png");
  if (!url) return;
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
};

export default function DashboardPage() {
  const { user } = useAuth();
  const roles = user?.roles?.map((r) => r.name || r) || [];
  const isPrivileged = roles.some((r) => ["Admin", "System Administrator", "Project Manager"].includes(r));
  const isSupervisor = roles.some((r) => ["Senior Project Supervisor", "Scrum Master", "Sub Admin"].includes(r));
  const isMgmt = isPrivileged || isSupervisor; // management view
  const isIndividual = !isMgmt; // Developer/Tester

  // Filters
  const [selectedWindow, setSelectedWindow] = useState(30);
  const [selectedProject, setSelectedProject] = useState("");

  // Data
  const [v2, setV2] = useState(null);     // management data
  const [mine, setMine] = useState(null); // personal data
  const [loading, setLoading] = useState(true);

  // Mgmt: sprint selector
  const [selectedSprint, setSelectedSprint] = useState("");

  // chart refs (PNG export)
  const entityRef = useRef(null);
  const throughputRef = useRef(null);
  const projectStatusRef = useRef(null);
  const burndownRef = useRef(null);
  const myStatusRef = useRef(null);
  const myThroughputRef = useRef(null);
  const myProjectRef = useRef(null);
  const mySprintRef = useRef(null);

  // fetchers
  const fetchMgmt = async (windowDays, projectId) => {
    const params = { windowDays };
    if (projectId) params.projectId = projectId;
    const { data } = await axios.get("/dashboard/v2", { params });
    setV2(data);
  };

  const fetchMine = async (windowDays, projectId) => {
    const params = { windowDays };
    if (projectId) params.projectId = projectId;
    const { data } = await axios.get("/dashboard/mine", { params });
    setMine(data);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (isMgmt) {
          await fetchMgmt(selectedWindow, selectedProject || undefined);
        } else {
          await fetchMine(selectedWindow, selectedProject || undefined);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMgmt, selectedWindow, selectedProject]);

  // When mgmt data changes, pick first sprint safely
  useEffect(() => {
    if (!isMgmt) return;
    const firstSprint = v2?.perSprint?.[0]?.sprintId || "";
    setSelectedSprint(firstSprint);
  }, [isMgmt, v2?.meta?.projectId, v2?.meta?.windowDays, v2?.perSprint?.length]);

  // ------------------- MANAGEMENT (Admin/PM/Supervisor) -------------------
  const totals = v2?.baseStats?.totals ?? { projects: 0, users: 0, sprints: 0, stories: 0, tasks: 0 };

  const entityChart = useMemo(
    () => ({
      labels: ["Projects", "Users", "Sprints", "Stories", "Tasks"],
      datasets: [
        {
          label: "Totals",
          data: [totals.projects, totals.users, totals.sprints, totals.stories, totals.tasks],
          backgroundColor: [C.blueA, C.greenA, C.amberA, C.redA, C.violetA],
          borderColor: [C.blue, C.green, C.amber, C.red, C.violet],
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    }),
    [totals]
  );

  const throughputLine = useMemo(
    () => ({
      labels: (v2?.series?.throughputByDay ?? []).map((x) => x.date),
      datasets: [
        {
          label: "Done per day",
          data: (v2?.series?.throughputByDay ?? []).map((x) => x.count),
          fill: true,
          borderColor: C.blue,
          backgroundColor: C.blueA,
          pointRadius: 2,
          tension: 0.3,
        },
      ],
    }),
    [v2?.series?.throughputByDay]
  );

  const projectStatusChart = useMemo(
    () => ({
      labels: (v2?.perProject ?? []).map((p) => p.name),
      datasets: [
        { label: "To Do", data: (v2?.perProject ?? []).map((p) => p.status.todo), stack: "s", backgroundColor: C.gray300, borderColor: C.gray300, borderWidth: 1, borderRadius: 4 },
        { label: "In Progress", data: (v2?.perProject ?? []).map((p) => p.status.inProgress), stack: "s", backgroundColor: C.blueA, borderColor: C.blue, borderWidth: 1, borderRadius: 4 },
        { label: "Paused", data: (v2?.perProject ?? []).map((p) => p.status.paused), stack: "s", backgroundColor: C.amberA, borderColor: C.amber, borderWidth: 1, borderRadius: 4 },
        // { label: "Blocked", data: (v2?.perProject ?? []).map((p) => p.status.blocked), stack: "s", backgroundColor: C.redA, borderColor: C.red, borderWidth: 1, borderRadius: 4 },
        { label: "Done", data: (v2?.perProject ?? []).map((p) => p.status.done), stack: "s", backgroundColor: C.greenA, borderColor: C.green, borderWidth: 1, borderRadius: 4 },
      ],
    }),
    [v2?.perProject]
  );

  const selectedSprintObj = (v2?.perSprint ?? []).find((s) => String(s.sprintId) === String(selectedSprint));
  const burndown = useMemo(() => {
    if (!selectedSprintObj) return null;
    return {
      labels: selectedSprintObj.burndown.map((d) => new Date(d.date).toISOString().slice(0, 10)),
      datasets: [
        {
          label: `Remaining (h) – ${selectedSprintObj.name}`,
          data: selectedSprintObj.burndown.map((d) => d.remaining),
          fill: true,
          borderColor: C.indigo,
          backgroundColor: C.indigoA,
          pointRadius: 2,
          tension: 0.3,
        },
      ],
    };
  }, [selectedSprintObj]);

  // CSV exports (Mgmt)
  const exportEntityCSV = () => {
    downloadCSV("entity_distribution.csv", [
      ["Entity", "Count"],
      ["Projects", totals.projects],
      ["Users", totals.users],
      ["Sprints", totals.sprints],
      ["Stories", totals.stories],
      ["Tasks", totals.tasks],
    ]);
  };

  const exportThroughputCSV = () => {
    const rows = [["Date", "Done"]];
    (v2?.series?.throughputByDay ?? []).forEach((d) => rows.push([d.date, d.count]));
    downloadCSV("throughput_daily.csv", rows);
  };

  const exportProjectStatusCSV = () => {
    const rows = [["Project", 
      "To Do", 
      "In Progress", 
      "Paused", 
      // "Blocked", 
      "Done", 
      "Est Hours", 
      "Act Hours", 
      "Stories", 
      "AC", 
      "TC+", 
      "TC-"]];
    (v2?.perProject ?? []).forEach((p) => {
      rows.push([
        p.name,
        p.status.todo,
        p.status.inProgress,
        p.status.paused,
        // p.status.blocked,
        p.status.done,
        p.est,
        p.act,
        p.stories,
        p.ac,
        p.tcPos,
        p.tcNeg,
      ]);
    });
    downloadCSV("project_status.csv", rows);
  };

  const exportBurndownCSV = () => {
    if (!selectedSprintObj) return;
    const rows = [["Date", "Remaining (h)"]];
    selectedSprintObj.burndown.forEach((d) => rows.push([new Date(d.date).toISOString().slice(0, 10), d.remaining]));
    downloadCSV(`burndown_${selectedSprintObj.name}.csv`, rows);
  };

  const exportWipCSV = () => {
    const rows = [["Task", "Assignee", "Project", "Sprint", "Days In Status"]];
    (v2?.wip ?? []).forEach((w) =>
      rows.push([w.title, w.assignee, w.project || "-", w.sprint || "-", w.daysInStatus ?? "-"])
    );
    downloadCSV("wip_in_progress.csv", rows);
  };

  // ------------------- PERSONAL (Developer/Tester) -------------------
  const myTotals = mine?.totals ?? { myTasks: 0, estHours: 0, actHours: 0 };
  const myStatusCounts = mine?.statusCount ?? { 
    "To Do": 0, 
    "In Progress": 0, 
    Paused: 0, 
    // Blocked: 0, 
    Done: 0 };

  const myStatusChart = useMemo(
    () => ({
      labels: ["To Do", 
        "In Progress", 
        "Paused", 
        // "Blocked", 
        "Done"],
      datasets: [
        {
          label: "Tasks",
          data: ["To Do", 
            "In Progress", 
            "Paused", 
            // "Blocked", 
            "Done"].map((k) => myStatusCounts[k] || 0),
          backgroundColor: [C.gray300, C.blueA, C.amberA, C.redA, C.greenA],
          borderColor: [C.gray300, C.blue, C.amber, C.red, C.green],
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    }),
    [myStatusCounts]
  );

  const myThroughputLine = useMemo(
    () => ({
      labels: (mine?.throughputByDay ?? []).map((x) => x.date),
      datasets: [
        {
          label: "Done per day",
          data: (mine?.throughputByDay ?? []).map((x) => x.count),
          fill: true,
          borderColor: C.blue,
          backgroundColor: C.blueA,
          pointRadius: 2,
          tension: 0.3,
        },
      ],
    }),
    [mine?.throughputByDay]
  );

  const myProjectChart = useMemo(
    () => ({
      labels: (mine?.byProject ?? []).map((p) => p.name || p.projectId?.slice(-6)),
      datasets: [
        { label: "To Do", data: (mine?.byProject ?? []).map((p) => p.counts.todo), stack: "p", backgroundColor: C.gray300, borderColor: C.gray300, borderWidth: 1, borderRadius: 4 },
        { label: "In Progress", data: (mine?.byProject ?? []).map((p) => p.counts.inProgress), stack: "p", backgroundColor: C.blueA, borderColor: C.blue, borderWidth: 1, borderRadius: 4 },
        { label: "Paused", data: (mine?.byProject ?? []).map((p) => p.counts.paused), stack: "p", backgroundColor: C.amberA, borderColor: C.amber, borderWidth: 1, borderRadius: 4 },
        // { label: "Blocked", data: (mine?.byProject ?? []).map((p) => p.counts.blocked), stack: "p", backgroundColor: C.redA, borderColor: C.red, borderWidth: 1, borderRadius: 4 },
        { label: "Done", data: (mine?.byProject ?? []).map((p) => p.counts.done), stack: "p", backgroundColor: C.greenA, borderColor: C.green, borderWidth: 1, borderRadius: 4 },
      ],
    }),
    [mine?.byProject]
  );

  const mySprintChart = useMemo(
    () => ({
      labels: (mine?.bySprint ?? []).map((s) => s.name || s.sprintId?.slice(-6)),
      datasets: [
        { label: "To Do", data: (mine?.bySprint ?? []).map((s) => s.counts.todo), stack: "s", backgroundColor: C.gray300, borderColor: C.gray300, borderWidth: 1, borderRadius: 4 },
        { label: "In Progress", data: (mine?.bySprint ?? []).map((s) => s.counts.inProgress), stack: "s", backgroundColor: C.blueA, borderColor: C.blue, borderWidth: 1, borderRadius: 4 },
        { label: "Paused", data: (mine?.bySprint ?? []).map((s) => s.counts.paused), stack: "s", backgroundColor: C.amberA, borderColor: C.amber, borderWidth: 1, borderRadius: 4 },
        // { label: "Blocked", data: (mine?.bySprint ?? []).map((s) => s.counts.blocked), stack: "s", backgroundColor: C.redA, borderColor: C.red, borderWidth: 1, borderRadius: 4 },
        { label: "Done", data: (mine?.bySprint ?? []).map((s) => s.counts.done), stack: "s", backgroundColor: C.greenA, borderColor: C.green, borderWidth: 1, borderRadius: 4 },
      ],
    }),
    [mine?.bySprint]
  );

  // CSV exports (Personal)
  const exportMyStatusCSV = () => {
    downloadCSV("my_status_counts.csv", [["Status", "Count"], ...Object.entries(myStatusCounts)]);
  };
  const exportMyThroughputCSV = () => {
    const rows = [["Date", "Done"]];
    (mine?.throughputByDay ?? []).forEach((d) => rows.push([d.date, d.count]));
    downloadCSV("my_throughput.csv", rows);
  };
  const exportMyProjectCSV = () => {
    const rows = [["Project", 
      "To Do", 
      "In Progress", 
      "Paused", 
      // "Blocked", 
      "Done"]];
    (mine?.byProject ?? []).forEach((p) =>
      rows.push([p.name, 
        p.counts.todo, 
        p.counts.inProgress, 
        p.counts.paused, 
        // p.counts.blocked, 
        p.counts.done])
    );
    downloadCSV("my_by_project.csv", rows);
  };
  const exportMySprintCSV = () => {
    const rows = [["Sprint", 
      "To Do", 
      "In Progress", 
      "Paused", 
      // "Blocked", 
      "Done"]];
    (mine?.bySprint ?? []).forEach((s) =>
      rows.push([s.name, 
        s.counts.todo, 
        s.counts.inProgress, 
        s.counts.paused, 
        // s.counts.blocked, 
        s.counts.done])
    );
    downloadCSV("my_by_sprint.csv", rows);
  };

  if (loading || (isMgmt ? !v2 : !mine)) {
    return <p className="p-6">Loading dashboard…</p>;
  }

  // ---------- FILTER BAR ----------
  const projectsForFilter = isMgmt ? (v2?.availableProjects ?? []) : (mine?.availableProjects ?? []);

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold">{isMgmt ? "Dashboard" : "My Dashboard"}</h1>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            {[7, 14, 30, 60, 90].map((w) => (
              <button
                key={w}
                onClick={() => setSelectedWindow(w)}
                className={`px-3 py-1 rounded border ${selectedWindow === w ? "bg-black text-white" : "bg-white"}`}
              >
                {w}d
              </button>
            ))}
          </div>

          <select
            className="border rounded px-2 py-1"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">{isMgmt ? "All Projects" : "My Projects"}</option>
            {projectsForFilter.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isMgmt ? (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(totals).map(([k, v]) => (
              <div key={k} className="bg-white p-4 rounded shadow text-center">
                <div className="text-xl font-semibold">{v}</div>
                <div className="text-gray-600 capitalize">{k}</div>
              </div>
            ))}
          </div>

          {/* Entity distribution */}
          <div className="bg-white p-4 rounded shadow w-full max-w-md">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Entity Distribution</h2>
              <div className="flex gap-2">
                <button className="text-sm underline" onClick={exportEntityCSV}>
                  CSV
                </button>
                <button className="text-sm underline" onClick={() => chartToPNG(entityRef, "entity_distribution.png")}>
                  PNG
                </button>
              </div>
            </div>
            <div className="h-56">
              <Bar ref={entityRef} data={entityChart} options={baseChartOpts} />
            </div>
          </div>

          {/* Throughput trend */}
          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Throughput (Done per day)</h2>
              <div className="flex gap-2">
                <button className="text-sm underline" onClick={exportThroughputCSV}>
                  CSV
                </button>
                <button
                  className="text-sm underline"
                  onClick={() => chartToPNG(throughputRef, "throughput_daily.png")}
                >
                  PNG
                </button>
              </div>
            </div>
            <div className="h-64">
              <Line
                ref={throughputRef}
                data={throughputLine}
                options={{ ...baseChartOpts, interaction: { mode: "index", intersect: false } }}
              />
            </div>
          </div>

          {/* Work status by project */}
          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Work Status by Project</h2>
              <div className="flex gap-2">
                <button className="text-sm underline" onClick={exportProjectStatusCSV}>
                  CSV
                </button>
                <button
                  className="text-sm underline"
                  onClick={() => chartToPNG(projectStatusRef, "work_status_by_project.png")}
                >
                  PNG
                </button>
              </div>
            </div>
            <div className="h-80">
              <Bar
                ref={projectStatusRef}
                data={projectStatusChart}
                options={{
                  ...baseChartOpts,
                  scales: {
                    x: { ...baseChartOpts.scales.x, stacked: true },
                    y: { ...baseChartOpts.scales.y, stacked: true },
                  },
                }}
              />
            </div>
          </div>

          {/* Burndown by sprint */}
          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">Burndown by Sprint</h2>
                <select
                  className="border rounded px-2 py-1"
                  value={selectedSprint || ""}
                  onChange={(e) => setSelectedSprint(e.target.value)}
                >
                  {(v2?.perSprint ?? []).map((s) => (
                    <option key={s.sprintId} value={s.sprintId}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button className="text-sm underline" onClick={exportBurndownCSV}>
                  CSV
                </button>
                <button
                  className="text-sm underline"
                  onClick={() =>
                    chartToPNG(burndownRef, `burndown_${selectedSprintObj?.name || "sprint"}.png`)
                  }
                >
                  PNG
                </button>
              </div>
            </div>
            <div className="h-64">
              {burndown ? (
                <Line
                  ref={burndownRef}
                  data={burndown}
                  options={{ ...baseChartOpts, interaction: { mode: "index", intersect: false } }}
                />
              ) : (
                <div className="text-sm text-gray-500">No sprint selected</div>
              )}
            </div>
          </div>

          {/* NEW: WIP – In Progress */}
          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">WIP – In Progress</h2>
              <button className="text-sm underline" onClick={exportWipCSV}>
                CSV
              </button>
            </div>
            {(v2?.wip ?? []).length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-3">Task</th>
                      <th className="py-2 pr-3">Assignee</th>
                      <th className="py-2 pr-3">Project</th>
                      <th className="py-2 pr-3">Sprint</th>
                      <th className="py-2 pr-3">Days In Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(v2?.wip ?? []).slice(0, 50).map((w) => (
                      <tr key={w.taskId} className="border-b last:border-0">
                        <td className="py-2 pr-3">{w.title}</td>
                        <td className="py-2 pr-3">{w.assignee}</td>
                        <td className="py-2 pr-3">{w.project || "-"}</td>
                        <td className="py-2 pr-3">{w.sprint || "-"}</td>
                        <td className="py-2 pr-3">{w.daysInStatus ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No work currently In Progress.</div>
            )}
          </div>

          {/* Risks – aging paused/blocked */}
          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Risks – Aging Paused</h2>
              <button
                className="text-sm underline"
                onClick={() => {
                  const rows = [["Assignee", "Status", "Days In Status"]];
                  (v2?.risk ?? []).forEach((r) => rows.push([r.assignee, r.status, r.daysInStatus]));
                  downloadCSV("risks_aging_paused.csv", rows);
                }}
              >
                CSV
              </button>
            </div>
            {(v2?.risk ?? []).length ? (
              <ul className="list-disc pl-5 space-y-1">
                {(v2?.risk ?? []).slice(0, 20).map((r) => (
                  <li key={r.taskId} className="text-sm">
                    {r.assignee}: {r.status} for {r.daysInStatus} days
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500">No aging paused tasks.</div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* PERSONAL KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded shadow text-center">
              <div className="text-xl font-semibold">{myTotals.myTasks}</div>
              <div className="text-gray-600">My Tasks</div>
            </div>
            <div className="bg-white p-4 rounded shadow text-center">
              <div className="text-xl font-semibold">{myTotals.estHours}</div>
              <div className="text-gray-600">Estimated Hours</div>
            </div>
            <div className="bg-white p-4 rounded shadow text-center">
              <div className="text-xl font-semibold">{myTotals.actHours}</div>
              <div className="text-gray-600">Actual Hours</div>
            </div>
            <div className="bg-white p-4 rounded shadow text-center">
              <div className="text-xl font-semibold">{myTotals.estHours - myTotals.actHours}</div>
              <div className="text-gray-600">Remaining Hours</div>
            </div>
          </div>

          {/* My task status */}
          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">My Task Status</h2>
              <div className="flex gap-2">
                <button className="text-sm underline" onClick={exportMyStatusCSV}>
                  CSV
                </button>
                <button className="text-sm underline" onClick={() => chartToPNG(myStatusRef, "my_status.png")}>
                  PNG
                </button>
              </div>
            </div>
            <div className="h-56">
              <Bar ref={myStatusRef} data={myStatusChart} options={baseChartOpts} />
            </div>
          </div>

          {/* My throughput */}
          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">My Throughput</h2>
              <div className="text-sm text-gray-600">Avg cycle: {mine?.avgCycleHours ?? "-"}h</div>
              <div className="flex gap-2">
                <button className="text-sm underline" onClick={exportMyThroughputCSV}>
                  CSV
                </button>
                <button
                  className="text-sm underline"
                  onClick={() => chartToPNG(myThroughputRef, "my_throughput.png")}
                >
                  PNG
                </button>
              </div>
            </div>
            <div className="h-64">
              <Line
                ref={myThroughputRef}
                data={myThroughputLine}
                options={{ ...baseChartOpts, interaction: { mode: "index", intersect: false } }}
              />
            </div>
          </div>

          {/* My work by project */}
          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">My Work by Project</h2>
              <div className="flex gap-2">
                <button className="text-sm underline" onClick={exportMyProjectCSV}>
                  CSV
                </button>
                <button
                  className="text-sm underline"
                  onClick={() => chartToPNG(myProjectRef, "my_by_project.png")}
                >
                  PNG
                </button>
              </div>
            </div>
            <div className="h-72">
              <Bar
                ref={myProjectRef}
                data={myProjectChart}
                options={{
                  ...baseChartOpts,
                  scales: {
                    x: { ...baseChartOpts.scales.x, stacked: true },
                    y: { ...baseChartOpts.scales.y, stacked: true },
                  },
                }}
              />
            </div>
          </div>

          {/* My work by sprint + WIP risks */}
          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">My Work by Sprint</h2>
              <div className="flex gap-2">
                <button className="text-sm underline" onClick={exportMySprintCSV}>
                  CSV
                </button>
                <button className="text-sm underline" onClick={() => chartToPNG(mySprintRef, "my_by_sprint.png")}>
                  PNG
                </button>
              </div>
            </div>
            <div className="h-72">
              <Bar
                ref={mySprintRef}
                data={mySprintChart}
                options={{
                  ...baseChartOpts,
                  scales: {
                    x: { ...baseChartOpts.scales.x, stacked: true },
                    y: { ...baseChartOpts.scales.y, stacked: true },
                  },
                }}
              />
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">My WIP at Risk</h3>
              {(mine?.wipRisk ?? []).length ? (
                <ul className="list-disc pl-5 space-y-1">
                  {(mine?.wipRisk ?? []).slice(0, 20).map((r) => (
                    <li key={r.taskId} className="text-sm">
                      {r.title} — {r.status} for {r.daysInStatus} days {r.sprint ? `(${r.sprint})` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-500">No risky WIP right now 🎉</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}






