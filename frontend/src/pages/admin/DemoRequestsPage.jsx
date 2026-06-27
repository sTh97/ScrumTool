import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  getDemoRequests,
  updateDemoRequest,
  STATUS_LABELS,
  STATUS_COLORS,
} from "../../api/demoRequestApi";

const STATUS_OPTIONS = Object.keys(STATUS_LABELS);

const DemoRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  const fetchRequests = () => {
    setLoading(true);
    getDemoRequests({ status: filter, search })
      .then((res) => setRequests(res.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const openDetail = (req) => {
    setSelected(req);
    setEditNotes(req.notes || "");
    setEditStatus(req.status);
    setSaveMsg(null);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setSaveMsg(null);

    try {
      const res = await updateDemoRequest(selected._id, {
        status: editStatus,
        notes: editNotes,
      });
      setSelected(res.data);
      setRequests((prev) =>
        prev.map((r) => (r._id === res.data._id ? res.data : r))
      );
      setSaveMsg("Saved successfully.");
    } catch {
      setSaveMsg("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Demo Requests</h2>
        <p className="text-gray-500 mt-1">
          Manage and track all landing page demo submissions
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or company..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-500"
          />
          <button
            type="submit"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
          >
            Search
          </button>
        </form>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-500"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <p className="p-6 text-gray-500">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="p-6 text-gray-400">No demo requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Company
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr
                      key={req._id}
                      onClick={() => openDetail(req)}
                      className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selected?._id === req._id ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{req.name}</p>
                        <p className="text-xs text-gray-500">{req.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {req.company || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[req.status]}`}
                        >
                          {STATUS_LABELS[req.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {formatDate(req.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {selected ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Request Details
              </h3>

              <div className="space-y-3 text-sm mb-6">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">
                    Name
                  </p>
                  <p className="font-medium">{selected.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">
                    Email
                  </p>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-red-600 hover:underline"
                  >
                    {selected.email}
                  </a>
                </div>
                {selected.company && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">
                      Company
                    </p>
                    <p>{selected.company}</p>
                  </div>
                )}
                {selected.contact && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">
                      Contact
                    </p>
                    <p>{selected.contact}</p>
                  </div>
                )}
                {selected.message && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">
                      Message
                    </p>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selected.message}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">
                    Submitted
                  </p>
                  <p>{formatDate(selected.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={4}
                    placeholder="Add internal notes for reference..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>

                {saveMsg && (
                  <p
                    className={`text-sm ${saveMsg.includes("Failed") ? "text-red-500" : "text-green-600"}`}
                  >
                    {saveMsg}
                  </p>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-sm">Select a request to view details</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default DemoRequestsPage;
