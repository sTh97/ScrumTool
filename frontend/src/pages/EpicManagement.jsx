import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

const EpicManagement = () => {
  const [epics, setEpics] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: "", project: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [filterProject, setFilterProject] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchEpics = async () => {
    try {
      const res = await axios.get("/epics");
      setEpics(res.data);
    } catch (err) {
      console.error("Error fetching epics", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects", err);
    }
  };

  useEffect(() => {
    fetchEpics();
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ name: "", project: "", description: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/epics/${editingId}`, form);
        setMessage({ type: "success", text: "Epic updated successfully" });
      } else {
        await axios.post("/epics", form);
        setMessage({ type: "success", text: "Epic created successfully" });
      }
      resetForm();
      fetchEpics();
    } catch (err) {
      setMessage({ type: "error", text: "Error submitting epic" });
    }
  };

  const handleEdit = (epic) => {
    setForm({
      name: epic.name,
      project: epic.project?._id || epic.project,
      description: epic.description,
    });
    setEditingId(epic._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this epic?")) {
      try {
        await axios.delete(`/epics/${id}`);
        fetchEpics();
        setMessage({ type: "success", text: "Epic deleted successfully" });
      } catch {
        setMessage({ type: "error", text: "Error deleting epic" });
      }
    }
  };

  const filteredEpics = filterProject
    ? epics.filter((epic) => epic.project._id === filterProject)
    : epics;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentEpics = filteredEpics.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredEpics.length / itemsPerPage);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Epic Management</h2>

      {message.text && (
        <p className={`mb-4 ${message.type === "error" ? "text-red-500" : "text-green-600"}`}>
          {message.text}
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Epic Name"
          required
          className="border p-2 rounded"
        />
        <select
          name="project"
          value={form.project}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        >
          <option value="">Select Project</option>
          {projects.map((proj) => (
            <option key={proj._id} value={proj._id}>
              {proj.name}
            </option>
          ))}
        </select>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="border p-2 rounded col-span-2"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded col-span-2">
          {editingId ? "Update Epic" : "Create Epic"}
        </button>
      </form>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Filter by Project:</label>
        <select
          value={filterProject}
          onChange={(e) => {
            setFilterProject(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded w-full sm:w-1/3"
        >
          <option value="">All Projects</option>
          {projects.map((proj) => (
            <option key={proj._id} value={proj._id}>
              {proj.name}
            </option>
          ))}
        </select>
      </div>

      <h3 className="text-xl font-semibold mb-3">Existing Epics</h3>
      <ul className="divide-y divide-gray-200">
        {currentEpics.map((epic) => (
          <li key={epic._id} className="py-3 flex justify-between items-center">
            <div>
              <strong>{epic.name}</strong> — {epic.description || "No description"}
              <br />
              <span className="text-sm text-gray-600">Project: {epic.project?.name}</span>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(epic)}
                className="bg-yellow-500 text-white px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(epic._id)}
                className="bg-red-600 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-300"}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EpicManagement;
