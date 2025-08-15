// client/src/pages/OtherTaskTypes.jsx
import { useEffect, useState } from "react";
import { OtherTaskTypesApi } from "../api/otherTasksApi";

export default function OtherTaskTypes() {
  const [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(""); // disables row buttons during actions
  const [filterMode, setFilterMode] = useState("all"); // all | active | inactive

  const load = async () => {
    try {
      setLoading(true);
      // Pass `null` so API sends ?active=null and backend returns ALL (it only filters on "true"/"false")
      const data =
        filterMode === "active"
          ? await OtherTaskTypesApi.list(true)
          : filterMode === "inactive"
          ? await OtherTaskTypesApi.list(false)
          : await OtherTaskTypesApi.list(null);
      setList(data || []);
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to load task types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMode]);

  const add = async () => {
    const value = name.trim();
    if (!value) return alert("Please enter a task type name.");
    try {
      setLoading(true);
      await OtherTaskTypesApi.create(value);
      setName("");
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || "Create failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const rename = async (id, current) => {
    const n = prompt("New name", current);
    if (!n) return;
    try {
      setBusyId(id);
      await OtherTaskTypesApi.update(id, { name: n.trim() });
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || "Rename failed";
      alert(msg);
    } finally {
      setBusyId("");
    }
  };

  const toggle = async (id, isActive) => {
    try {
      setBusyId(id);
      await OtherTaskTypesApi.update(id, { isActive: !isActive });
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || "Update failed";
      alert(msg);
    } finally {
      setBusyId("");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this task type? This cannot be undone.")) return;
    try {
      setBusyId(id);
      await OtherTaskTypesApi.remove(id);
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || "Delete failed";
      alert(msg);
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold">Other Task Types</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm">Filter:</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Add form */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Type name..."
          className="border rounded px-3 py-2 w-full md:w-80"
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
        />
        <button
          onClick={add}
          disabled={loading || !name.trim()}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {/* Table */}
      <div className="border rounded overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Active</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Updated</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t._id} className="border-t">
                <td className="p-2">{t.name}</td>
                <td className="p-2">{t.isActive ? "Yes" : "No"}</td>
                <td className="p-2">
                  {t.createdAt ? new Date(t.createdAt).toLocaleString() : "—"}
                </td>
                <td className="p-2">
                  {t.updatedAt ? new Date(t.updatedAt).toLocaleString() : "—"}
                </td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="text-xs px-2 py-1 border rounded"
                      disabled={busyId === t._id}
                      onClick={() => rename(t._id, t.name)}
                    >
                      Rename
                    </button>
                    <button
                      className="text-xs px-2 py-1 border rounded"
                      disabled={busyId === t._id}
                      onClick={() => toggle(t._id, t.isActive)}
                    >
                      {t.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="text-xs px-2 py-1 border rounded text-red-600"
                      disabled={busyId === t._id}
                      onClick={() => del(t._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!list.length && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  {loading ? "Loading..." : "No task types found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
