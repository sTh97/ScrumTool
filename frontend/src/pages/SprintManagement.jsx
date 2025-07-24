// src/pages/SprintManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

const SprintManagement = () => {
  const [projects, setProjects] = useState([]);
  const [epics, setEpics] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [form, setForm] = useState({
    name: "",
    project: "",
    epic: "",
    startDate: "",
    endDate: "",
    goal: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [filterProject, setFilterProject] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const fetchProjects = async () => {
    const res = await axios.get("/projects");
    setProjects(res.data);
  };

  const fetchEpics = async () => {
    const res = await axios.get("/epics");
    setEpics(res.data);
  };

  const fetchSprints = async () => {
    const res = await axios.get("/sprints");
    setSprints(res.data);
  };

  useEffect(() => {
    fetchProjects();
    fetchEpics();
    fetchSprints();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getNextDate = (startDate) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/sprints/${editingId}`, form);
      } else {
        await axios.post("/sprints", form);
      }
      setForm({ name: "", project: "", epic: "", startDate: "", endDate: "", goal: "" });
      setEditingId(null);
      fetchSprints();
    } catch (err) {
      alert("Error saving sprint");
    }
  };

  const handleEdit = (s) => {
    setForm({
      name: s.name,
      project: s.project?._id,
      epic: s.epic?._id,
      startDate: s.startDate?.substring(0, 10),
      endDate: s.endDate?.substring(0, 10),
      goal: s.goal,
    });
    setEditingId(s._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this sprint?")) {
      await axios.delete(`/sprints/${id}`);
      fetchSprints();
    }
  };

  const filteredSprints = sprints.filter(s =>
    !filterProject || s.project?._id === filterProject
  );

  const paginated = filteredSprints.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filteredSprints.length / perPage);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Sprint Management</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Sprint Name"
          required
          className="border p-2 rounded"
        />

        <select
          name="project"
          value={form.project}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Project</option>
          {projects.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>

        <select
          name="epic"
          value={form.epic}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Epic</option>
          {epics.map(e => (
            <option key={e._id} value={e._id}>{e.name}</option>
          ))}
        </select>

        <input
          type="text"
          name="goal"
          value={form.goal}
          onChange={handleChange}
          placeholder="Sprint Goal"
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
            required
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
            required
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded col-span-2">
          {editingId ? "Update Sprint" : "Create Sprint"}
        </button>
      </form>

      <div className="mb-4">
        <label className="block font-medium mb-1">Filter by Project</label>
        <select
          value={filterProject}
          onChange={(e) => {
            setFilterProject(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded w-full sm:w-1/2"
        >
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>

      <ul className="divide-y divide-gray-200">
        {paginated.map(s => (
          <li key={s._id} className="py-3 flex justify-between items-center">
            <div>
              <strong>{s.name}</strong> ({s.project?.name} / {s.epic?.name})<br />
              <span className="text-sm text-gray-600">
                {s.startDate?.substring(0, 10)} to {s.endDate?.substring(0, 10)} — {s.goal}
              </span>
            </div>
            <div className="space-x-2">
              <button
                className="bg-yellow-500 text-white px-2 py-1 rounded"
                onClick={() => handleEdit(s)}
              >Edit</button>
              <button
                className="bg-red-600 text-white px-2 py-1 rounded"
                onClick={() => handleDelete(s._id)}
              >Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-1 rounded ${page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SprintManagement;
