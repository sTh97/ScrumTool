// src/pages/ProjectWorkspace/components/MembersTab.jsx
import { useState } from "react";

export default function MembersTab({ workspace }) {
  const [filter, setFilter] = useState("");

  const members = (workspace.members || []).filter((m) => {
    if (!filter) return true;
    const value =
      `${m.user?.fullName || ""} ${m.user?.email || ""} ${m.role || ""}`.toLowerCase();
    return value.includes(filter.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Project Members</h2>
        <button
          type="button"
          className="text-sm px-3 py-1.5 rounded-md bg-slate-900 text-white"
          // onClick={... open add-member modal ...}
        >
          + Add Member
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by name, email or role..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm w-full max-w-sm"
        />
      </div>

      <div className="overflow-x-auto border rounded-lg bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">Role</th>
              <th className="text-left px-3 py-2">Allocation %</th>
              <th className="text-left px-3 py-2">From</th>
              <th className="text-left px-3 py-2">To</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-4 text-center text-slate-500"
                >
                  No members added yet.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m._id} className="border-t">
                  <td className="px-3 py-2">
                    {m.user?.fullName || "—"}
                  </td>
                  <td className="px-3 py-2">
                    {m.user?.email || "—"}
                  </td>
                  <td className="px-3 py-2">{m.role || "—"}</td>
                  <td className="px-3 py-2">{m.allocationPercent || 0}%</td>
                  <td className="px-3 py-2">
                    {m.startDate ? m.startDate.slice(0, 10) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {m.endDate ? m.endDate.slice(0, 10) : "—"}
                  </td>
                  <td className="px-3 py-2 space-x-2">
                    <button className="text-xs text-slate-700 underline">
                      Edit
                    </button>
                    <button className="text-xs text-red-600 underline">
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
