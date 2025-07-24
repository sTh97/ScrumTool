import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", startDate: "", endDate: "" });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects", err);
    }
  };

  const getNextDate = (startDate) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ name: "", description: "", startDate: "", endDate: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/projects/${editingId}`, form);
        setMessage({ type: "success", text: "Project updated successfully" });
      } else {
        await axios.post("/projects", form);
        setMessage({ type: "success", text: "Project created successfully" });
      }
      resetForm();
      fetchProjects();
    } catch (err) {
      setMessage({ type: "error", text: "Error submitting project" });
    }
  };

  const handleEdit = (project) => {
    setForm({
      name: project.name,
      description: project.description,
      startDate: project.startDate?.substring(0, 10),
      endDate: project.endDate?.substring(0, 10),
    });
    setEditingId(project._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axios.delete(`/projects/${id}`);
        fetchProjects();
        setMessage({ type: "success", text: "Project deleted successfully" });
      } catch {
        setMessage({ type: "error", text: "Error deleting project" });
      }
    }
  };

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProjects = projects.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(projects.length / itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Project Management</h2>

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
          placeholder="Project Name"
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="border p-2 rounded"
        />
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            min={form.startDate ? getNextDate(form.startDate) : undefined}
            className="border p-2 rounded w-full"
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded col-span-2">
          {editingId ? "Update Project" : "Create Project"}
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-3">Existing Projects</h3>
      <ul className="divide-y divide-gray-200">
        {currentProjects.map((project) => (
          <li key={project._id} className="py-3 flex justify-between items-center">
            <div>
              <strong>{project.name}</strong> — {project.description} <br />
              <span className="text-sm text-gray-600">
                {project.startDate?.substring(0, 10)} to {project.endDate?.substring(0, 10)}
              </span>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(project)}
                className="bg-yellow-500 text-white px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(project._id)}
                className="bg-red-600 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => goToPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProjectManagement;
