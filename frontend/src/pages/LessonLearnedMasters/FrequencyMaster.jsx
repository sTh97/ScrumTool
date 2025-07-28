import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";

const FrequencyMaster = () => {
  const [frequencies, setFrequencies] = useState([]);
  const [newFrequency, setNewFrequency] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const fetchFrequencies = async () => {
    try {
      const res = await axios.get("/frequency");
      setFrequencies(res.data);
    } catch (err) {
      console.error("Failed to fetch frequencies", err);
    }
  };

  useEffect(() => {
    fetchFrequencies();
  }, []);

  const handleAdd = async () => {
    if (!newFrequency.trim()) return;
    try {
      await axios.post("/frequency", { name: newFrequency });
      setNewFrequency("");
      fetchFrequencies();
    } catch (err) {
      alert("Failed to add frequency");
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`/frequency/${id}`, { name: editingValue });
      setEditingId(null);
      fetchFrequencies();
    } catch (err) {
      alert("Failed to update frequency");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this frequency?")) return;
    try {
      await axios.delete(`/frequency/${id}`);
      fetchFrequencies();
    } catch (err) {
      alert("Failed to delete frequency");
    }
  };

  const filteredFrequencies = frequencies.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedFrequencies = filteredFrequencies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredFrequencies.length / pageSize);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Frequency Master</h2>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newFrequency}
          onChange={(e) => setNewFrequency(e.target.value)}
          placeholder="Enter frequency"
          className="border p-2 rounded w-72"
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="ml-auto border px-2 py-1 rounded"
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
          {paginatedFrequencies.map((freq, index) => (
            <tr key={freq._id}>
              <td className="p-2 border text-center">
                {(currentPage - 1) * pageSize + index + 1}
              </td>
              <td className="p-2 border">
                {editingId === freq._id ? (
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                ) : (
                  freq.name
                )}
              </td>
              <td className="p-2 border text-center">
                {editingId === freq._id ? (
                  <button
                    onClick={() => handleUpdate(freq._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(freq._id);
                      setEditingValue(freq.name);
                    }}
                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDelete(freq._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filteredFrequencies.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center p-4 text-gray-500">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default FrequencyMaster;
