import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [data, setData] = useState(null);
  const [taskStats, setTaskStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await axios.get("/dashboard/stats");
      setStats(res.data);
    };
    fetchStats();
  }, []);

  useEffect(() => {
    axios.get("/dashboard/userstory-insights").then((res) => setData(res.data));
    axios.get("/dashboard/task-stats").then((res) => setTaskStats(res.data));
  }, []);

  if (!stats || !data || !taskStats) return <p>Loading dashboard...</p>;

  const chartData = {
    labels: ["Projects", "Users", "Sprints", "User Stories"],
    datasets: [
      {
        label: "Total Count",
        data: [stats.totalProjects, stats.totalUsers, stats.totalSprints, stats.totalStories],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]
      }
    ]
  };

  const projectLabels = Object.keys(data.projects);
  const projectPositives = projectLabels.map(p => data.projects[p].positive);
  const projectNegatives = projectLabels.map(p => data.projects[p].negative);

  const epicLabels = Object.keys(data.epics);
  const epicPositives = epicLabels.map(p => data.epics[p].positive);
  const epicNegatives = epicLabels.map(p => data.epics[p].negative);

  return (
    <>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-100 p-4 rounded shadow text-center">
            <p className="text-xl font-semibold">{stats.totalProjects}</p>
            <p className="text-sm">Projects</p>
          </div>
          <div className="bg-green-100 p-4 rounded shadow text-center">
            <p className="text-xl font-semibold">{stats.totalUsers}</p>
            <p className="text-sm">Users</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded shadow text-center">
            <p className="text-xl font-semibold">{stats.totalSprints}</p>
            <p className="text-sm">Sprints</p>
          </div>
          <div className="bg-red-100 p-4 rounded shadow text-center">
            <p className="text-xl font-semibold">{stats.totalStories}</p>
            <p className="text-sm">User Stories</p>
          </div>
        </div>

        <div className="mt-8 w-[500px] h-[400px]">
          <h2 className="text-lg font-semibold mb-2">Entity Distribution</h2>
          <Bar data={chartData} width={500} height={400} />
        </div>
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 mt-8 px-6">
        <div>
          <h3 className="font-semibold text-lg mb-2">Test Cases by Project</h3>
          <Bar
            data={{
              labels: projectLabels,
              datasets: [
                {
                  label: "Positive",
                  data: projectPositives,
                  backgroundColor: "rgba(54, 162, 235, 0.6)",
                  borderColor: "rgba(54, 162, 235, 1)",
                  borderWidth: 1
                },
                {
                  label: "Negative",
                  data: projectNegatives,
                  backgroundColor: "rgba(255, 99, 132, 0.6)",
                  borderColor: "rgba(255, 99, 132, 1)",
                  borderWidth: 1
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                  labels: { color: "#000" }
                }
              },
              scales: {
                x: { ticks: { color: "#000" } },
                y: { beginAtZero: true, ticks: { color: "#000" } }
              }
            }}
          />
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">Test Cases by Epic</h3>
          <Bar
            data={{
              labels: epicLabels,
              datasets: [
                {
                  label: "Positive",
                  data: epicPositives,
                  backgroundColor: "rgba(75, 192, 192, 0.6)",
                  borderColor: "rgba(75, 192, 192, 1)",
                  borderWidth: 1
                },
                {
                  label: "Negative",
                  data: epicNegatives,
                  backgroundColor: "rgba(255, 159, 64, 0.6)",
                  borderColor: "rgba(255, 159, 64, 1)",
                  borderWidth: 1
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                  labels: { color: "#000" }
                }
              },
              scales: {
                x: { ticks: { color: "#000" } },
                y: { beginAtZero: true, ticks: { color: "#000" } }
              }
            }}
          />
        </div>

        <div className="col-span-2 mt-8">
          <h3 className="font-semibold text-lg mb-4">Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-green-100 p-4 rounded shadow text-center">
              <p className="text-xl font-semibold">{data.acceptanceCriteriaCount}</p>
              <p className="text-sm text-gray-700">Acceptance Criteria</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded shadow text-center">
              <p className="text-xl font-semibold">{data.dependenciesCount}</p>
              <p className="text-sm text-gray-700">Dependencies</p>
            </div>
            <div className="bg-purple-100 p-4 rounded shadow text-center">
              <p className="text-xl font-semibold">{data.testCases.total}</p>
              <p className="text-sm text-gray-700">Total Test Cases</p>
            </div>
            <div className="bg-pink-100 p-4 rounded shadow text-center">
              <p className="text-xl font-semibold">{data.testCases.positive}</p>
              <p className="text-sm text-gray-700">Positive Test Cases</p>
            </div>
            <div className="bg-red-100 p-4 rounded shadow text-center">
              <p className="text-xl font-semibold">{data.testCases.negative}</p>
              <p className="text-sm text-gray-700">Negative Test Cases</p>
            </div>
          </div>
        </div>

        <div className="col-span-2 mt-8">
          <h3 className="font-semibold text-lg mb-4">📋 Task Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded shadow text-center">
              <p className="text-xl font-semibold">{taskStats.totalTasks}</p>
              <p className="text-sm text-gray-700">Total Tasks</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded shadow text-center">
              <p className="text-xl font-semibold">{taskStats.totalEstimated}</p>
              <p className="text-sm text-gray-700">Total Estimated Hours</p>
            </div>
            <div className="bg-green-100 p-4 rounded shadow text-center">
              <p className="text-xl font-semibold">{taskStats.totalActual}</p>
              <p className="text-sm text-gray-700">Total Actual Hours</p>
            </div>
            <div className="bg-red-100 p-4 rounded shadow text-center">
              <p className="text-xl font-semibold">{taskStats.totalEstimated - taskStats.totalActual}</p>
              <p className="text-sm text-gray-700">Remaining Hours</p>
            </div>
          </div>

          <div className="mt-6 w-full">
            <h4 className="text-md font-medium mb-2">Task Count by Status</h4>
            <Bar
              data={{
                labels: Object.keys(taskStats.statusCount),
                datasets: [
                  {
                    label: "Tasks",
                    data: Object.values(taskStats.statusCount),
                    backgroundColor: ["#3B82F6", "#F59E0B", "#F87171", "#10B981"],
                    borderRadius: 6
                  }
                ]
              }}
              options={{
                indexAxis: 'y',
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: ctx => `${ctx.raw} task${ctx.raw !== 1 ? 's' : ''}`
                    }
                  }
                },
                scales: {
                  x: { beginAtZero: true, ticks: { color: "#000" } },
                  y: { ticks: { color: "#000" } }
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
