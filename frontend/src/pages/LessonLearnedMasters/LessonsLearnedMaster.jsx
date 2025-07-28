import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";

const LessonsLearnedMaster = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const fetchItems = async () => {
    try {
      const res = await axios.get("/lessons-learned");
      setItems(res.data);
    } catch (err) {
      console.error("Failed to load items", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    try {
      await axios.post("/lessons-learned", { name: newItem });
      setNewItem("");
      fetchItems();
    } catch (err) {
      alert("Failed to add item");
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`/lessons-learned/${id}`, { name: editingValue });
      setEditingId(null);
      fetchItems();
    } catch (err) {
      alert("Failed to update item");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`/lessons-learned/${id}`);
      fetchItems();
    } catch (err) {
      alert("Failed to delete item");
    }
  };

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Lessons Learned Master</h2>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Enter lesson title"
          className="border p-2 rounded w-72"
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Search lessons..."
          className="border px-3 py-1 rounded w-72 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
          {paginated.map((item, index) => (
            <tr key={item._id}>
              <td className="p-2 border text-center">
                {(currentPage - 1) * pageSize + index + 1}
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
          {paginated.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center text-gray-500 py-4">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex justify-end mt-3 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded text-sm ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonsLearnedMaster;
