import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";

const RecommendationsMaster = () => {
  const [records, setRecords] = useState([]);
  const [newValue, setNewValue] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchRecords = async () => {
    try {
      const res = await axios.get("/recommendations");
      setRecords(res.data);
    } catch (err) {
      console.error("Failed to load recommendations", err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    try {
      await axios.post("/recommendations", { name: newValue });
      setNewValue("");
      fetchRecords();
    } catch (err) {
      alert("Failed to add recommendation");
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`/recommendations/${id}`, { name: editingValue });
      setEditingId(null);
      fetchRecords();
    } catch (err) {
      alert("Failed to update");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      await axios.delete(`/recommendations/${id}`);
      fetchRecords();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const filteredRecords = records.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Recommendations Master</h2>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Enter recommendation"
          className="border p-2 rounded w-72"
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search by name..."
          className="border px-3 py-1 rounded w-72"
        />
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">#</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRecords.map((item, index) => (
            <tr key={item._id}>
              <td className="p-2 border text-center">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </td>
              <td className="p-2 border">
                {editingId === item._id ? (
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                ) : (
                  item.name
                )}
              </td>
              <td className="p-2 border text-center">
                {editingId === item._id ? (
                  <button
                    onClick={() => handleUpdate(item._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(item._id);
                      setEditingValue(item.name);
                    }}
                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {paginatedRecords.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center p-4 text-gray-500">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex justify-end mt-4 gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`px-3 py-1 rounded border text-sm ${
                p === currentPage ? "bg-blue-600 text-white" : "bg-white text-gray-700"
              }`}
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsMaster;
