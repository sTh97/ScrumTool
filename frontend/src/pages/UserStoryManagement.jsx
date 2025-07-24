// src/pages/UserStoryManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

const UserStoryManagement = () => {
  const [stories, setStories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    acceptanceCriteria: [""],
    dependencies: [""],
    testCases: { positive: [""], negative: [""] },
  });
  const [editingId, setEditingId] = useState(null);

  const fetchStories = async () => {
    const res = await axios.get("/userstories");
    setStories(res.data);
  };

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
  axios.get("/projects").then(res => setProjects(res.data));
}, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm({ ...form, [field]: updated });
  };

  const handleTestCaseChange = (type, index, value) => {
    const updated = [...form.testCases[type]];
    updated[index] = value;
    setForm({ ...form, testCases: { ...form.testCases, [type]: updated } });
  };

  const addField = (field) => {
    setForm({ ...form, [field]: [...form[field], ""] });
  };

  const addTestCaseField = (type) => {
    setForm({
      ...form,
      testCases: { ...form.testCases, [type]: [...form.testCases[type], ""] },
    });
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      project: "",
      acceptanceCriteria: [""],
      dependencies: [""],
      testCases: { positive: [""], negative: [""] },
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/userstories/${editingId}`, form);
      } else {
        await axios.post("/userstories", form);
      }
      resetForm();
      fetchStories();
    } catch (err) {
      alert("Error submitting user story");
    }
  };

  const handleEdit = (story) => {
    setForm(story);
    setEditingId(story._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this user story?")) {
      await axios.delete(`/userstories/${id}`);
      fetchStories();
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">User Story Management</h2>

      <form onSubmit={handleSubmit} className="grid gap-4 mb-8">
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
        <input
          type="text"
          name="title"
          placeholder="Story Title"
          value={form.title}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <div>
          <label className="font-semibold">Acceptance Criteria:</label>
          {form.acceptanceCriteria.map((val, i) => (
            <input
              key={i}
              value={val}
              onChange={(e) => handleArrayChange("acceptanceCriteria", i, e.target.value)}
              className="border p-2 rounded mb-2 w-full"
            />
          ))}
          <button type="button" onClick={() => addField("acceptanceCriteria")} className="text-blue-600 text-sm">+ Add</button>
        </div>

        <div>
          <label className="font-semibold">Dependencies:</label>
          {form.dependencies.map((val, i) => (
            <input
              key={i}
              value={val}
              onChange={(e) => handleArrayChange("dependencies", i, e.target.value)}
              className="border p-2 rounded mb-2 w-full"
            />
          ))}
          <button type="button" onClick={() => addField("dependencies")} className="text-blue-600 text-sm">+ Add</button>
        </div>

        <div>
          <label className="font-semibold">Positive Test Cases:</label>
          {form.testCases.positive.map((val, i) => (
            <input
              key={i}
              value={val}
              onChange={(e) => handleTestCaseChange("positive", i, e.target.value)}
              className="border p-2 rounded mb-2 w-full"
            />
          ))}
          <button type="button" onClick={() => addTestCaseField("positive")} className="text-blue-600 text-sm">+ Add</button>
        </div>

        <div>
          <label className="font-semibold">Negative Test Cases:</label>
          {form.testCases.negative.map((val, i) => (
            <input
              key={i}
              value={val}
              onChange={(e) => handleTestCaseChange("negative", i, e.target.value)}
              className="border p-2 rounded mb-2 w-full"
            />
          ))}
          <button type="button" onClick={() => addTestCaseField("negative")} className="text-blue-600 text-sm">+ Add</button>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingId ? "Update Story" : "Create Story"}
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-2">User Stories</h3>
      <ul className="divide-y divide-gray-200">
        {stories.map((s) => (
          <li key={s._id} className="py-3">
            <div className="mb-1 font-bold">{s.title}</div>
            <div className="text-sm text-gray-700">{s.description}</div>
            <div className="text-sm text-gray-600">
              Acceptance Criteria: {s.acceptanceCriteria?.join("; ")}<br />
              Dependencies: {s.dependencies?.join("; ")}<br />
              Test Cases (Positive): {s.testCases?.positive?.join("; ")}<br />
              Test Cases (Negative): {s.testCases?.negative?.join("; ")}
            </div>
            <div className="mt-2 space-x-2">
              <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(s)}>Edit</button>
              <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleDelete(s._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserStoryManagement;
