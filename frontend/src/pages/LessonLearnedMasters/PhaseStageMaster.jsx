import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";

const PhaseStageMaster = () => {
  const [phases, setPhases] = useState([]);
  const [newPhase, setNewPhase] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchPhases = async () => {
    try {
      const res = await axios.get("/phase-stage");
      setPhases(res.data);
    } catch (err) {
      console.error("Failed to load phases", err);
    }
  };

  const handleAdd = async () => {
    if (!newPhase.trim()) return;
    try {
      await axios.post("/phase-stage", { name: newPhase });
      setNewPhase("");
      fetchPhases();
    } catch (err) {
      alert("Failed to add phase");
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`/phase-stage/${id}`, { name: editingValue });
      setEditingId(null);
      fetchPhases();
    } catch (err) {
      alert("Failed to update");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this phase?")) return;
    try {
      await axios.delete(`/phase-stage/${id}`);
      fetchPhases();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  useEffect(() => {
    fetchPhases();
  }, []);

  const filteredPhases = phases.filter(phase =>
    phase.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPhases.length / itemsPerPage);
  const paginatedPhases = filteredPhases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when search term changes
  }, [searchTerm]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Phase / Stage Master</h2>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newPhase}
          onChange={(e) => setNewPhase(e.target.value)}
          placeholder="Enter phase or stage name"
          className="border p-2 rounded w-72"
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search phase by name..."
          className="border p-2 rounded w-80"
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
          {paginatedPhases.map((phase, index) => (
            <tr key={phase._id}>
              <td className="p-2 border text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
              <td className="p-2 border">
                {editingId === phase._id ? (
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                ) : (
                  phase.name
                )}
              </td>
              <td className="p-2 border text-center">
                {editingId === phase._id ? (
                  <button
                    onClick={() => handleUpdate(phase._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(phase._id);
                      setEditingValue(phase.name);
                    }}
                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDelete(phase._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {paginatedPhases.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center p-4 text-gray-500">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {filteredPhases.length > itemsPerPage && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <div>Showing {paginatedPhases.length} of {filteredPhases.length} entries</div>
          <div className="space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-gray-200" : "bg-blue-600 text-white"}`}
            >
              Prev
            </button>
            <span className="font-semibold">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${currentPage === totalPages ? "bg-gray-200" : "bg-blue-600 text-white"}`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaseStageMaster;
