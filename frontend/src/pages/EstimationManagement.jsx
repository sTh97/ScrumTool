// File: src/pages/EstimationManagement.jsx

import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

const EstimationManagement = () => {
  const [estimations, setEstimations] = useState([]);
  const [form, setForm] = useState({ label: "", hours: "" });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchEstimations = async () => {
    try {
      const res = await axios.get("/estimations");
      setEstimations(res.data);
    } catch (err) {
      console.error("Error fetching estimations", err);
    }
  };

  useEffect(() => {
    fetchEstimations();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ label: "", hours: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/estimations/${editingId}`, form);
        setMessage({ type: "success", text: "Estimation updated successfully" });
      } else {
        await axios.post("/estimations", form);
        setMessage({ type: "success", text: "Estimation created successfully" });
      }
      resetForm();
      fetchEstimations();
    } catch (err) {
      setMessage({ type: "error", text: "Error submitting estimation" });
    }
  };

  const handleEdit = (est) => {
    setForm({ label: est.label, hours: est.hours });
    setEditingId(est._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this estimation?")) {
      try {
        await axios.delete(`/estimations/${id}`);
        fetchEstimations();
        setMessage({ type: "success", text: "Estimation deleted successfully" });
      } catch {
        setMessage({ type: "error", text: "Error deleting estimation" });
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Estimation Management</h2>

      {message.text && (
        <p className={`mb-4 ${message.type === "error" ? "text-red-500" : "text-green-600"}`}>
          {message.text}
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          name="label"
          value={form.label}
          onChange={handleChange}
          placeholder="T-Shirt Size (e.g., XS, S, M)"
          required
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="hours"
          value={form.hours}
          onChange={handleChange}
          placeholder="Estimated Hours"
          required
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded col-span-2">
          {editingId ? "Update Estimation" : "Create Estimation"}
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-3">T-Shirt Size Estimations</h3>
      <ul className="divide-y divide-gray-200">
        {estimations.map((est) => (
          <li key={est._id} className="py-3 flex justify-between items-center">
            <div>
              <strong>{est.label}</strong>: {est.hours} hrs
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(est)}
                className="bg-yellow-500 text-white px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(est._id)}
                className="bg-red-600 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EstimationManagement;
