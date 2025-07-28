import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";

const PrioritySeverityMaster = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchItems = async () => {
    try {
      const res = await axios.get("/priority-severity");
      setItems(res.data);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    try {
      await axios.post("/priority-severity", { name: newItem });
      setNewItem("");
      fetchItems();
    } catch (err) {
      alert("Failed to add item");
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`/priority-severity/${id}`, { name: editingValue });
      setEditingId(null);
      fetchItems();
    } catch (err) {
      alert("Failed to update");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`/priority-severity/${id}`);
      fetchItems();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Priority / Severity Master</h2>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Enter new priority/severity"
          className="border p-2 rounded w-72"
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded w-72"
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
          {paginatedItems.map((item, index) => (
            <tr key={item._id}>
              <td className="p-2 border text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
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
          {paginatedItems.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center p-4 text-gray-500">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-end mt-4 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded border ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PrioritySeverityMaster;
