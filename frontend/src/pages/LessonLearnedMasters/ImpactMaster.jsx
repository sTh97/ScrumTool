import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";

const ImpactMaster = () => {
  const [impacts, setImpacts] = useState([]);
  const [newImpact, setNewImpact] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchImpacts = async () => {
    try {
      const res = await axios.get("/impact");
      setImpacts(res.data);
    } catch (err) {
      console.error("Failed to load impacts", err);
    }
  };

  useEffect(() => {
    fetchImpacts();
  }, []);

  const handleAdd = async () => {
    if (!newImpact.trim()) return;
    try {
      await axios.post("/impact", { name: newImpact });
      setNewImpact("");
      fetchImpacts();
    } catch (err) {
      alert("Failed to add impact");
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`/impact/${id}`, { name: editingValue });
      setEditingId(null);
      fetchImpacts();
    } catch (err) {
      alert("Failed to update impact");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this impact?")) return;
    try {
      await axios.delete(`/impact/${id}`);
      fetchImpacts();
    } catch (err) {
      alert("Failed to delete impact");
    }
  };

  const filtered = impacts.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Impact / Consequences Master</h2>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={newImpact}
          onChange={(e) => setNewImpact(e.target.value)}
          placeholder="Enter impact name"
          className="border p-2 rounded w-72"
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name..."
          className="ml-auto border p-2 rounded w-72"
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
          {paginated.map((impact, index) => (
            <tr key={impact._id}>
              <td className="p-2 border text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
              <td className="p-2 border">
                {editingId === impact._id ? (
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                ) : (
                  impact.name
                )}
              </td>
              <td className="p-2 border text-center">
                {editingId === impact._id ? (
                  <button
                    onClick={() => handleUpdate(impact._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(impact._id);
                      setEditingValue(impact.name);
                    }}
                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDelete(impact._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center p-4 text-gray-500">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex justify-end gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-1 rounded text-sm ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImpactMaster;
