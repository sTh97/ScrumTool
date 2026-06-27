import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  getDemoDashboardStats,
  STATUS_LABELS,
  STATUS_COLORS,
} from "../../api/demoRequestApi";

const StatCard = ({ label, value, sub, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className={`text-3xl font-bold mt-2 ${color || "text-gray-900"}`}>
      {value}
    </p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDemoDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-gray-500">Loading dashboard...</p>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <p className="text-red-500">{error}</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Overview of demo request pipeline</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Requests" value={stats.total} />
        <StatCard
          label="This Month"
          value={stats.thisMonth}
          sub="New submissions"
          color="text-blue-600"
        />
        <StatCard
          label="Deals Closed"
          value={stats.byStatus.deal_closed}
          color="text-green-600"
        />
        <StatCard
          label="Conversion Rate"
          value={`${stats.conversionRate}%`}
          sub="Closed / Total"
          color="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[status]}`}
                >
                  {STATUS_LABELS[status]}
                </span>
                <div className="flex items-center gap-3 flex-1 ml-4">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{
                        width: stats.total
                          ? `${(count / stats.total) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Requests
            </h3>
            <Link
              to="/admin/requests"
              className="text-sm text-red-600 hover:text-red-500 font-medium"
            >
              View all →
            </Link>
          </div>
          {stats.recentRequests.length === 0 ? (
            <p className="text-gray-400 text-sm">No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {req.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {req.company || req.email}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[req.status]}`}
                  >
                    {STATUS_LABELS[req.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
